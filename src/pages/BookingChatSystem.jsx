import React, { useState, useEffect, useRef } from 'react';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { MessageCircle, Send, Phone, Mail, Calendar, Car, Check, CheckCheck, Paperclip } from 'lucide-react';
import api from '@/lib/axios';

export function BookingChatSystem() {
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState(null);
  
  const chatContainerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const echoRef = useRef(null);
  const currentUserId = useRef(null);

  const [token] = useState(() => localStorage.getItem('token'));

  // Debug logging (only on mount)
  useEffect(() => {
    console.log('Token:', token);
    console.log('API Base:', import.meta.env.VITE_API_BASE_URL);
  }, []);

  /** ------------------- INITIALIZATION ------------------- **/
  useEffect(() => {
    if (!token) {
      console.error('No token found in localStorage');
      setError('Authentication required. Please log in.');
      return;
    }

    // Setup Laravel Echo with Pusher
    window.Pusher = Pusher;
    echoRef.current = new Echo({
      broadcaster: 'pusher',
      key: import.meta.env.VITE_PUSHER_APP_KEY,
      cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
      forceTLS: false,
      authEndpoint: `${import.meta.env.VITE_API_BASE_URL}/broadcasting/auth`,
      auth: {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      },
    });

    // Get current user info
    api.get('/profile')
      .then(({ data }) => {
        currentUserId.current = data.user?.id;
        console.log('Current user ID:', currentUserId.current);
      })
      .catch((err) => {
        console.error('Failed to fetch profile:', err);
        setError('Failed to load user profile');
      });

    return () => {
      echoRef.current?.disconnect();
    };
  }, [token]);

  /** ------------------- FETCH BOOKINGS ------------------- **/
  useEffect(() => {
    if (token) {
      fetchBookings();
    }
  }, [token]);

  const fetchBookings = async () => {
    setLoadingBookings(true);
    setError(null);
    try {
      const { data } = await api.get('/driver/bookings');
      console.log('Bookings response:', data);
      setBookings(data.data || []);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
      setError('Failed to load bookings');
      setBookings([]);
    } finally {
      setLoadingBookings(false);
    }
  };

  /** ------------------- SCROLL TO BOTTOM ------------------- **/
  const scrollToBottom = () => {
  const container = chatContainerRef.current;
  if (!container) return;

  // Scroll the container, not the whole page
  container.scrollTop = container.scrollHeight;
};


  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  /** ------------------- LOAD MESSAGES ------------------- **/
  const loadMessages = async (bookingId) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get(`/bookings/${bookingId}/chat`);
      console.log('Messages response:', data);
      console.log('Current user ID for comparison:', currentUserId.current);
      
      // Handle nested response structure: data.data.data
      const messagesArray = data.data?.data || data.data?.messages || [];
      console.log('Messages array:', messagesArray);
      setMessages(messagesArray);

      // Mark unread messages as read
      messagesArray.forEach(msg => {
        console.log(`Message ${msg.id}: sender_id=${msg.sender_id}, sender.id=${msg.sender?.id}`);
        if (!msg.read_at && msg.sender_id !== currentUserId.current) {
          markMessageAsRead(msg.id);
        }
      });
    } catch (err) {
      console.error('Failed to load messages:', err);
      setError('Failed to load messages');
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  /** ------------------- ECHO REAL-TIME SETUP ------------------- **/
  useEffect(() => {
    if (!selectedBooking || !echoRef.current) return;
    
    console.log('Subscribing to channel:', `booking.${selectedBooking.id}`);
    
    const channel = echoRef.current.private(`booking.${selectedBooking.id}`)
      .listen('.MessageSent', (e) => {
        console.log('New message received:', e);
        setMessages(prev => [...prev, e.message]);
        
        // Mark as read if not from current user
        if (e.message.sender_id !== currentUserId.current) {
          markMessageAsRead(e.message.id);
        }
        
        // Refresh unread counts
        fetchUnreadCounts();
      })
      .listenForWhisper('typing', (e) => {
        if (e.user_id !== currentUserId.current) {
          setTyping(true);
          setTimeout(() => setTyping(false), 3000);
        }
      })
      .listen('.MessageRead', (e) => {
        // Update message read status in real-time
        console.log('Message marked as read:', e);
        setMessages(prev => 
          prev.map(msg => 
            msg.id === e.message_id ? { ...msg, read_at: e.read_at } : msg
          )
        );
        fetchUnreadCounts();
      });
    
    // Initial load
    loadMessages(selectedBooking.id);
    
    return () => {
      console.log('Leaving channel:', `booking.${selectedBooking.id}`);
      echoRef.current?.leave(`private-booking.${selectedBooking.id}`);
    };
  }, [selectedBooking?.id]);

  /** ------------------- SEND MESSAGE ------------------- **/
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedBooking) return;

    const messageText = newMessage.trim();
    setNewMessage(''); // Optimistic clear

    try {
      const { data } = await api.post(`/bookings/${selectedBooking.id}/chat`, {
        booking_id: selectedBooking.id,
        message: messageText,
      });
      
      console.log('Message sent:', data);
      
      // If Echo doesn't broadcast back, manually add the message
      if (data.data) {
        setMessages(prev => [...prev, data.data]);
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      setError('Failed to send message');
      setNewMessage(messageText); // Restore message on error
    }
  };

  /** ------------------- MARK MESSAGE AS READ ------------------- **/
  const markMessageAsRead = async (messageId) => {
    try {
      await api.post(`/bookings/${selectedBooking?.id}/chat/mark-read`, {
        message_id: messageId
      });
    } catch (err) {
      console.error('Failed to mark message as read:', err);
    }
  };

  /** ------------------- FETCH UNREAD COUNT ------------------- **/
  const fetchUnreadCounts = async () => {
    try {
      const { data } = await api.get('/bookings/chat/unread-count');
      // Update bookings with unread counts
      if (data.data) {
        setBookings(prevBookings => 
          prevBookings.map(booking => ({
            ...booking,
            unread_count: data.data[booking.id] || 0
          }))
        );
      }
    } catch (err) {
      console.error('Failed to fetch unread counts:', err);
    }
  };

  // Poll for unread counts every 10 seconds
  useEffect(() => {
    if (token) {
      fetchUnreadCounts();
      const interval = setInterval(fetchUnreadCounts, 10000);
      return () => clearInterval(interval);
    }
  }, [token]);

  /** ------------------- TYPING INDICATOR ------------------- **/
  const typingTimeoutRef = useRef(null);

  const handleTyping = () => {
    if (!selectedBooking) return;

    // Send typing indicator to API
    api.post(`/bookings/${selectedBooking.id}/chat/typing`)
      .catch(err => console.error('Failed to send typing indicator:', err));

    // Also broadcast via Echo if available
    if (echoRef.current) {
      echoRef.current.private(`booking.${selectedBooking.id}`).whisper('typing', {
        user_id: currentUserId.current,
      });
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setTyping(false);
    }, 3000);
  };

  /** ------------------- TIME FORMAT ------------------- **/
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / 60000);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  /** ------------------- JSX ------------------- **/
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 pt-20">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Booking Messages</h1>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Bookings List */}
          <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Active Bookings</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              {loadingBookings ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                </div>
              ) : bookings.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-8 text-gray-400">
                  <MessageCircle className="w-16 h-16 mb-3" />
                  <p className="text-center">No bookings yet</p>
                </div>
              ) : (
                bookings.map((booking) => (
                  <div
                    key={booking.id}
                    onClick={() => setSelectedBooking(booking)}
                    className={`p-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-700 ${
                      selectedBooking?.id === booking.id ? 'bg-teal-50 dark:bg-teal-900/20 border-l-4 border-l-teal-500' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={booking.client?.profile_picture || '/default-avatar.png'}
                          alt={booking.client?.first_name || 'Client'}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        {booking.unread_count > 0 && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                            <span className="text-xs text-white font-bold">{booking.unread_count}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                            {booking.client?.first_name || 'N/A'} {booking.client?.last_name || ''}
                          </h3>
                          {booking.unread_count > 0 && (
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                          {booking.car?.make || 'N/A'} {booking.car?.model || ''}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden flex flex-col">
            {selectedBooking ? (
              <>
                {/* Chat Header */}
                <div className="bg-gradient-to-r from-teal-500 to-teal-600 p-4 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={selectedBooking.client?.profile_picture || '/default-avatar.png'}
                        alt={selectedBooking.client?.first_name || 'Client'}
                        className="w-12 h-12 rounded-full object-cover border-2 border-white"
                      />
                      <div>
                        <h2 className="text-lg font-semibold">
                          {selectedBooking.client?.first_name || 'N/A'} {selectedBooking.client?.last_name || ''}
                        </h2>
                        <p className="text-xs opacity-90">@{selectedBooking.client?.username || 'unknown'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedBooking.client?.phone_number && (
                        <a
                          href={`tel:${selectedBooking.client.phone_number}`}
                          className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                        >
                          <Phone className="w-5 h-5" />
                        </a>
                      )}
                      {selectedBooking.client?.email && (
                        <a
                          href={`mailto:${selectedBooking.client.email}`}
                          className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                        >
                          <Mail className="w-5 h-5" />
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 p-3 bg-white/10 rounded-lg">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Car className="w-4 h-4" />
                        <span>{selectedBooking.car?.make || 'N/A'} {selectedBooking.car?.model || ''}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{selectedBooking.start_datetime ? formatDateTime(selectedBooking.start_datetime) : 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div
                  ref={chatContainerRef}
                  className="flex-1 overflow-y-auto p-4 space-y-4"
                  style={{ maxHeight: 'calc(100vh - 450px)' }}
                >
                  {loading ? (
                    <div className="flex justify-center items-center h-full">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                      <MessageCircle className="w-16 h-16 mb-3" />
                      <p>No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    <>
                      {messages.map((message, index) => {
                        // Check if current user is the sender
                        const isOwner = message.sender_id === currentUserId.current || 
                                       message.sender?.id === currentUserId.current;
                        
                        const showAvatar = index === 0 || messages[index - 1].sender_id !== message.sender_id;

                        return (
                          <div
                            key={message.id}
                            className={`flex items-end gap-2 ${isOwner ? 'justify-end' : 'justify-start'}`}
                          >
                            {!isOwner && showAvatar && (
                              <img
                                src={message.sender?.profile_picture || '/default-avatar.png'}
                                alt={message.sender?.first_name || 'User'}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            )}
                            {!isOwner && !showAvatar && <div className="w-8"></div>}
                            
                            <div className={`flex flex-col ${isOwner ? 'items-end' : 'items-start'} max-w-[70%]`}>
                              <div
                                className={`rounded-2xl px-4 py-2 ${
                                  isOwner
                                    ? 'bg-teal-600 text-white rounded-br-none'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none'
                                }`}
                              >
                                <p className="text-sm whitespace-pre-wrap break-words">{message.message}</p>
                              </div>
                              <div className="flex items-center gap-1 mt-1 px-1">
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {formatTime(message.created_at)}
                                </span>
                                {isOwner && (
                                  <span>
                                    {message.read_at ? (
                                      <CheckCheck className="w-3 h-3 text-teal-500" />
                                    ) : (
                                      <Check className="w-3 h-3 text-gray-400" />
                                    )}
                                  </span>
                                )}
                              </div>
                            </div>

                            {isOwner && showAvatar && (
                              <img
                                src={message.sender?.profile_picture || '/default-avatar.png'}
                                alt={message.sender?.first_name || 'You'}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            )}
                            {isOwner && !showAvatar && <div className="w-8"></div>}
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </>
                  )}

                  {/* Typing Indicator */}
                  {typing && (
                    <div className="flex items-center gap-2">
                      <img
                        src={selectedBooking.client?.profile_picture || '/default-avatar.png'}
                        alt={selectedBooking.client?.first_name || 'Client'}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl rounded-bl-none px-4 py-3">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => console.log('Attach file')}
                      className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                    >
                      <Paperclip className="w-5 h-5" />
                    </button>
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => {
                        setNewMessage(e.target.value);
                        handleTyping();
                      }}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage(e);
                        }
                      }}
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 dark:bg-gray-700 dark:text-white"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!newMessage.trim()}
                      className="p-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                <MessageCircle className="w-20 h-20 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Select a booking to start chatting</h3>
                <p className="text-sm">Choose a booking from the list to view and send messages</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}