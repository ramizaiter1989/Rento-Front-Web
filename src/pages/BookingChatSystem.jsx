import React, { useState, useEffect, useRef } from 'react';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { 
  MessageCircle, Send, Phone, Mail, Calendar, Car, Check, CheckCheck, 
  Paperclip, Search, MoreVertical, Star, MapPin, Clock, User, Smile,
  Image as ImageIcon, X, ChevronRight, TrendingUp, Shield
} from 'lucide-react';
import api from '@/lib/axios';
import { motion, AnimatePresence } from 'framer-motion';

// Logo colors
const COLORS = {
  darkBlue: '#0E4C81',
  teal: '#008C95',
  limeGreen: '#8AC640',
  darkBlueDim: 'rgba(14, 76, 129, 0.1)',
  tealDim: 'rgba(0, 140, 149, 0.1)',
  limeGreenDim: 'rgba(138, 198, 64, 0.1)',
};

export function BookingChatSystem() {
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const chatContainerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const echoRef = useRef(null);
  const currentUserId = useRef(null);

  const [token] = useState(() => localStorage.getItem('token'));

  // Debug logging
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
      const messagesArray = data.data?.data || data.data?.messages || [];
      setMessages(messagesArray);

      messagesArray.forEach(msg => {
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
    
    const channel = echoRef.current.private(`booking.${selectedBooking.id}`)
      .listen('.MessageSent', (e) => {
        setMessages(prev => [...prev, e.message]);
        if (e.message.sender_id !== currentUserId.current) {
          markMessageAsRead(e.message.id);
        }
        fetchUnreadCounts();
      })
      .listenForWhisper('typing', (e) => {
        if (e.user_id !== currentUserId.current) {
          setTyping(true);
          setTimeout(() => setTyping(false), 3000);
        }
      })
      .listen('.MessageRead', (e) => {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === e.message_id ? { ...msg, read_at: e.read_at } : msg
          )
        );
        fetchUnreadCounts();
      });
    
    loadMessages(selectedBooking.id);
    
    return () => {
      echoRef.current?.leave(`private-booking.${selectedBooking.id}`);
    };
  }, [selectedBooking?.id]);

  /** ------------------- SEND MESSAGE ------------------- **/
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedBooking) return;

    const messageText = newMessage.trim();
    setNewMessage('');

    try {
      const { data } = await api.post(`/bookings/${selectedBooking.id}/chat`, {
        booking_id: selectedBooking.id,
        message: messageText,
      });
      
      if (data.data) {
        setMessages(prev => [...prev, data.data]);
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      setError('Failed to send message');
      setNewMessage(messageText);
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

    api.post(`/bookings/${selectedBooking.id}/chat/typing`)
      .catch(err => console.error('Failed to send typing indicator:', err));

    if (echoRef.current) {
      echoRef.current.private(`booking.${selectedBooking.id}`).whisper('typing', {
        user_id: currentUserId.current,
      });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

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

  // Filter bookings
  const filteredBookings = bookings.filter(booking => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const clientName = `${booking.client?.first_name || ''} ${booking.client?.last_name || ''}`.toLowerCase();
    const carName = `${booking.car?.make || ''} ${booking.car?.model || ''}`.toLowerCase();
    return clientName.includes(query) || carName.includes(query);
  });

  /** ------------------- JSX ------------------- **/
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-black dark:via-gray-900 dark:to-gray-950 pt-20">
      <div className="container mx-auto px-4 py-6">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
              style={{ background: `linear-gradient(135deg, ${COLORS.teal}, ${COLORS.darkBlue})` }}
            >
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 
                className="text-3xl font-bold bg-clip-text text-transparent"
                style={{ backgroundImage: `linear-gradient(135deg, ${COLORS.darkBlue}, ${COLORS.teal}, ${COLORS.limeGreen})` }}
              >
                Booking Messages
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Stay connected with your clients</p>
            </div>
          </div>
        </motion.div>

        {/* Error Banner */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 p-4 rounded-xl border-2"
              style={{ background: 'rgba(220, 38, 38, 0.1)', borderColor: '#DC2626' }}
            >
              <p className="text-red-800 dark:text-red-200 flex items-center gap-2">
                <X className="w-5 h-5" />
                {error}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-180px)]">
          
          {/* Bookings List */}
          <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden flex flex-col border border-gray-200 dark:border-gray-700">
            
            {/* Search Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 dark:text-white text-sm"
                  style={{ focusRing: COLORS.teal }}
                />
              </div>
            </div>

            {/* Bookings List */}
            <div className="flex-1 overflow-y-auto">
              {loadingBookings ? (
                <div className="flex justify-center items-center h-full">
                  <div 
                    className="animate-spin rounded-full h-10 w-10 border-4 border-t-transparent"
                    style={{ borderColor: COLORS.tealDim, borderTopColor: 'transparent' }}
                  ></div>
                </div>
              ) : filteredBookings.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-8 text-gray-400">
                  <MessageCircle className="w-16 h-16 mb-3" style={{ color: COLORS.teal, opacity: 0.3 }} />
                  <p className="text-center font-medium">No bookings found</p>
                  <p className="text-xs text-center mt-1">Try adjusting your search</p>
                </div>
              ) : (
                filteredBookings.map((booking) => (
                  <motion.div
                    key={booking.id}
                    whileHover={{ x: 5 }}
                    onClick={() => setSelectedBooking(booking)}
                    className={`p-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer transition-all ${
                      selectedBooking?.id === booking.id 
                        ? 'border-l-4' 
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                    style={selectedBooking?.id === booking.id ? { 
                      background: COLORS.tealDim, 
                      borderLeftColor: COLORS.teal 
                    } : {}}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={booking.client?.profile_picture || '/default-avatar.png'}
                          alt={booking.client?.first_name || 'Client'}
                          className="w-12 h-12 rounded-full object-cover ring-2 ring-white dark:ring-gray-700"
                        />
                        {booking.unread_count > 0 && (
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                            className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center shadow-lg"
                            style={{ background: COLORS.limeGreen }}
                          >
                            <span className="text-xs text-white font-bold">{booking.unread_count}</span>
                          </motion.div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white truncate flex items-center gap-1">
                            {booking.client?.first_name || 'N/A'} {booking.client?.last_name || ''}
                            {booking.client?.verified_by_admin && (
                              <Shield className="w-3 h-3" style={{ color: COLORS.teal }} />
                            )}
                          </h3>
                          {booking.unread_count > 0 && (
                            <ChevronRight className="w-4 h-4" style={{ color: COLORS.teal }} />
                          )}
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 truncate flex items-center gap-1">
                          <Car className="w-3 h-3" />
                          {booking.car?.make || 'N/A'} {booking.car?.model || ''}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden flex flex-col border border-gray-200 dark:border-gray-700">
            {selectedBooking ? (
              <>
                {/* Chat Header */}
                <div 
                  className="p-4 text-white relative overflow-hidden"
                  style={{ background: `linear-gradient(135deg, ${COLORS.darkBlue}, ${COLORS.teal}, ${COLORS.limeGreen})` }}
                >
                  {/* Decorative circles */}
                  <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={selectedBooking.client?.profile_picture || '/default-avatar.png'}
                          alt={selectedBooking.client?.first_name || 'Client'}
                          className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-lg"
                        />
                        <div>
                          <h2 className="text-lg font-bold flex items-center gap-2">
                            {selectedBooking.client?.first_name || 'N/A'} {selectedBooking.client?.last_name || ''}
                            {selectedBooking.client?.verified_by_admin && (
                              <Shield className="w-4 h-4" />
                            )}
                          </h2>
                          <p className="text-xs opacity-90">@{selectedBooking.client?.username || 'unknown'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {selectedBooking.client?.phone_number && (
                          <motion.a
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            href={`tel:${selectedBooking.client.phone_number}`}
                            className="p-2 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-colors"
                          >
                            <Phone className="w-4 h-4" />
                          </motion.a>
                        )}
                        {selectedBooking.client?.email && (
                          <motion.a
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            href={`mailto:${selectedBooking.client.email}`}
                            className="p-2 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-colors"
                          >
                            <Mail className="w-4 h-4" />
                          </motion.a>
                        )}
                      </div>
                    </div>

                    <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2">
                          <Car className="w-4 h-4" />
                          <span className="truncate">{selectedBooking.car?.make || 'N/A'} {selectedBooking.car?.model || ''}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span className="truncate">{selectedBooking.start_datetime ? formatDateTime(selectedBooking.start_datetime) : 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div
                  ref={chatContainerRef}
                  className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50/50 to-white dark:from-gray-900/50 dark:to-gray-800"
                  style={{ maxHeight: 'calc(100vh - 450px)' }}
                >
                  {loading ? (
                    <div className="flex justify-center items-center h-full">
                      <div 
                        className="animate-spin rounded-full h-10 w-10 border-4 border-t-transparent"
                        style={{ borderColor: COLORS.tealDim, borderTopColor: 'transparent' }}
                      ></div>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                      <div 
                        className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
                        style={{ background: COLORS.tealDim }}
                      >
                        <MessageCircle className="w-10 h-10" style={{ color: COLORS.teal }} />
                      </div>
                      <p className="text-lg font-medium">No messages yet</p>
                      <p className="text-sm">Start the conversation!</p>
                    </div>
                  ) : (
                    <>
                      {messages.map((message, index) => {
                        const isOwner = message.sender_id === currentUserId.current || 
                                       message.sender?.id === currentUserId.current;
                        const showAvatar = index === 0 || messages[index - 1].sender_id !== message.sender_id;

                        return (
                          <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex items-end gap-2 ${isOwner ? 'justify-end' : 'justify-start'}`}
                          >
                            {!isOwner && showAvatar && (
                              <img
                                src={message.sender?.profile_picture || '/default-avatar.png'}
                                alt={message.sender?.first_name || 'User'}
                                className="w-8 h-8 rounded-full object-cover ring-2 ring-white dark:ring-gray-700"
                              />
                            )}
                            {!isOwner && !showAvatar && <div className="w-8"></div>}
                            
                            <div className={`flex flex-col ${isOwner ? 'items-end' : 'items-start'} max-w-[70%]`}>
                              <motion.div
                                whileHover={{ scale: 1.02 }}
                                className={`rounded-2xl px-4 py-2 shadow-md ${
                                  isOwner
                                    ? 'text-white rounded-br-none'
                                    : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none border border-gray-200 dark:border-gray-600'
                                }`}
                                style={isOwner ? { background: `linear-gradient(135deg, ${COLORS.teal}, ${COLORS.darkBlue})` } : {}}
                              >
                                <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{message.message}</p>
                              </motion.div>
                              <div className="flex items-center gap-1 mt-1 px-1">
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {formatTime(message.created_at)}
                                </span>
                                {isOwner && (
                                  <span>
                                    {message.read_at ? (
                                      <CheckCheck className="w-3 h-3" style={{ color: COLORS.teal }} />
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
                                className="w-8 h-8 rounded-full object-cover ring-2 ring-white dark:ring-gray-700"
                              />
                            )}
                            {isOwner && !showAvatar && <div className="w-8"></div>}
                          </motion.div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </>
                  )}

                  {/* Typing Indicator */}
                  <AnimatePresence>
                    {typing && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="flex items-center gap-2"
                      >
                        <img
                          src={selectedBooking.client?.profile_picture || '/default-avatar.png'}
                          alt={selectedBooking.client?.first_name || 'Client'}
                          className="w-8 h-8 rounded-full object-cover ring-2 ring-white dark:ring-gray-700"
                        />
                        <div className="bg-white dark:bg-gray-700 rounded-2xl rounded-bl-none px-4 py-3 border border-gray-200 dark:border-gray-600">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: COLORS.teal, animationDelay: '0ms' }}></div>
                            <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: COLORS.darkBlue, animationDelay: '150ms' }}></div>
                            <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: COLORS.limeGreen, animationDelay: '300ms' }}></div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                  <div className="flex items-end gap-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => console.log('Attach file')}
                      className="p-2 rounded-xl transition-colors"
                      style={{ background: COLORS.tealDim, color: COLORS.teal }}
                    >
                      <Paperclip className="w-5 h-5" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => console.log('Send emoji')}
                      className="p-2 rounded-xl transition-colors"
                      style={{ background: COLORS.limeGreenDim, color: COLORS.limeGreen }}
                    >
                      <Smile className="w-5 h-5" />
                    </motion.button>
                    <div className="flex-1 relative">
                      <textarea
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
                        rows={1}
                        className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 dark:bg-gray-700 dark:text-white resize-none"
                        style={{ focusRing: COLORS.teal }}
                      />
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={sendMessage}
                      disabled={!newMessage.trim()}
                      className="p-3 rounded-xl text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
                      style={{ background: `linear-gradient(135deg, ${COLORS.teal}, ${COLORS.darkBlue})` }}
                    >
                      <Send className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center"
                >
                  <div 
                    className="w-24 h-24 rounded-full flex items-center justify-center mb-6 mx-auto"
                    style={{ background: `linear-gradient(135deg, ${COLORS.tealDim}, ${COLORS.limeGreenDim})` }}
                  >
                    <MessageCircle className="w-12 h-12" style={{ color: COLORS.teal }} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Select a Booking
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Choose a conversation to start chatting
                  </p>
                </motion.div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}