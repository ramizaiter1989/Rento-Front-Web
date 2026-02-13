import React, { useState, useEffect, useRef } from 'react';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import {
  MessageCircle, Send, Phone, Mail, Calendar, Car, Check, CheckCheck,
  Paperclip, Search, Smile, X, ChevronRight, Shield
} from 'lucide-react';
import api from '@/lib/axios';
import { motion, AnimatePresence } from 'framer-motion';

const COLORS = {
  darkBlue: '#0E4C81',
  teal: '#008C95',
  limeGreen: '#8AC640',
  darkBlueDim: 'rgba(14, 76, 129, 0.1)',
  tealDim: 'rgba(0, 140, 149, 0.1)',
  limeGreenDim: 'rgba(138, 198, 64, 0.1)',
};

export function ClientBookingChat() {
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
  const typingTimeoutRef = useRef(null);

  const [token] = useState(() => localStorage.getItem('token'));

  // ✅ Normalize incoming broadcast payload to match your UI expectations
  const normalizeIncomingMessage = (payload, bookingId) => {
    const createdAt =
      payload?.created_at ??
      payload?.createdAt ??
      payload?.data?.created_at ??
      null;

    // backend might send is_read boolean instead of read_at
    const readAt =
      payload?.read_at ??
      payload?.data?.read_at ??
      (payload?.is_read ? createdAt : null);

    return {
      id: payload?.id ?? payload?.data?.id ?? `rt-${Date.now()}`,
      booking_id: payload?.booking_id ?? payload?.data?.booking_id ?? bookingId,
      sender_id: payload?.sender_id ?? payload?.data?.sender_id ?? payload?.sender?.id,
      receiver_id: payload?.receiver_id ?? payload?.data?.receiver_id ?? null,
      message: payload?.message ?? payload?.data?.message ?? '',
      read_at: readAt,
      created_at: createdAt,
      sender: payload?.sender ?? payload?.data?.sender ?? null,
    };
  };

  /** ------------------- INIT ECHO + PROFILE ------------------- **/
  useEffect(() => {
    if (!token) {
      setError('Authentication required. Please log in.');
      return;
    }

    window.Pusher = Pusher;

    echoRef.current = new Echo({
      broadcaster: 'pusher',
      key: import.meta.env.VITE_PUSHER_APP_KEY,
      cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
      forceTLS: true,
      encrypted: true,
      enabledTransports: ['ws', 'wss'],
      authEndpoint: `${import.meta.env.VITE_API_BASE_URL}/broadcasting/auth`,
      auth: {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      },
    });

    // ✅ CONNECTION LOGS
    const pusher = echoRef.current.connector.pusher;

    pusher.connection.bind('initialized', () => console.log('[PUSHER] initialized'));
    pusher.connection.bind('connecting', () => console.log('[PUSHER] connecting...'));
    pusher.connection.bind('connected', () => console.log('[PUSHER] ✅ connected'));
    pusher.connection.bind('disconnected', () => console.log('[PUSHER] disconnected'));
    pusher.connection.bind('unavailable', () => console.log('[PUSHER] unavailable'));
    pusher.connection.bind('failed', () => console.log('[PUSHER] ❌ failed'));
    pusher.connection.bind('error', (err) => console.error('[PUSHER] error:', err));

    console.log('[ECHO] authEndpoint:', `${import.meta.env.VITE_API_BASE_URL}/broadcasting/auth`);
    console.log('[ECHO] cluster:', import.meta.env.VITE_PUSHER_APP_CLUSTER);
    console.log('[ECHO] key:', import.meta.env.VITE_PUSHER_APP_KEY);

    // Optional: debug pusher errors
    try {
      echoRef.current.connector?.pusher?.connection?.bind('error', (err) => {
        console.error('Pusher connection error:', err);
      });
    } catch {}

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

  /** ------------------- FETCH CLIENT BOOKINGS ------------------- **/
  useEffect(() => {
    if (token) fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const fetchBookings = async () => {
    setLoadingBookings(true);
    setError(null);
    try {
      // ✅ Your response shape is: { bookings: { data: [...] } }
      const { data } = await api.get('/bookings');
      const all = data?.bookings?.data ?? [];
      // Only show confirmed (or accepted) bookings in chat
      const confirmedOnly = all.filter(
        (b) => b.booking_request_status === 'confirmed' || b.booking_request_status === 'accepted'
      );
      setBookings(confirmedOnly);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
      setError('Failed to load bookings');
      setBookings([]);
    } finally {
      setLoadingBookings(false);
    }
  };

  /** ------------------- SCROLL ------------------- **/
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
      const messagesArray = data?.data?.data ?? data?.data?.messages ?? data?.messages ?? [];
      setMessages(messagesArray);

      // Mark unread messages as read (messages from other user)
      messagesArray.forEach((msg) => {
        if (!msg.read_at && msg.sender_id !== currentUserId.current) {
          markMessageAsRead(bookingId, msg.id);
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

  /** ------------------- ECHO REAL-TIME ------------------- **/
  useEffect(() => {
    if (!selectedBooking?.id || !echoRef.current) return;

    const bookingId = selectedBooking.id;

    // Echo private('booking.1') => Pusher channel is actually "private-booking.1"
    const pusherChannelName = `private-booking.${bookingId}`;

    console.log('[ECHO] subscribing to:', pusherChannelName);

    const pusher = echoRef.current.connector.pusher;

    // ✅ subscribe manually to capture subscription status
    const raw = pusher.subscribe(pusherChannelName);

    raw.bind('pusher:subscription_succeeded', () => {
      console.log('[PUSHER] ✅ subscription_succeeded:', pusherChannelName);
    });

    raw.bind('pusher:subscription_error', (status) => {
      console.error('[PUSHER] ❌ subscription_error:', pusherChannelName, 'status:', status);
      console.error('-> If status=403, your /broadcasting/auth or channels.php auth is rejecting the user.');
    });

    const channel = echoRef.current.private(`booking.${bookingId}`);

    const handleMessageSent = (payload) => {
      const normalized = normalizeIncomingMessage(payload, bookingId);
      // Dedupe: don't add if we already have this message (e.g. added from API after send)
      setMessages((prev) => {
        const exists = prev.some((m) => String(m.id) === String(normalized.id));
        if (exists) return prev;
        return [...prev, normalized];
      });
      if (normalized.sender_id && normalized.sender_id !== currentUserId.current) {
        markMessageAsRead(bookingId, normalized.id);
      }
    };

    channel.listen('.message.sent', handleMessageSent);
    channel.listen('message.sent', handleMessageSent);


    // ✅ typing whisper (you already whisper; this is the receiver side)
    channel.listenForWhisper('typing', (e) => {
      if (e?.user_id && e.user_id !== currentUserId.current) {
        setTyping(true);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setTyping(false), 3000);
      }
    });

    channel.listen('.message.read', (e) => console.log('[ECHO] message.read:', e));

    loadMessages(bookingId);

    return () => {
      console.log('[ECHO] leaving:', pusherChannelName);
      echoRef.current?.leave(`booking.${bookingId}`);
      pusher.unsubscribe(pusherChannelName);
    };
  }, [selectedBooking?.id]);

  /** ------------------- SEND MESSAGE ------------------- **/
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedBooking?.id) return;

    const bookingId = selectedBooking.id;
    const messageText = newMessage.trim();
    setNewMessage('');

    try {
      const { data } = await api.post(`/bookings/${bookingId}/chat`, {
        booking_id: bookingId,
        message: messageText,
      });

      const saved = data?.data ?? data?.message;
      if (saved) setMessages((prev) => [...prev, saved]);
    } catch (err) {
      console.error('Failed to send message:', err);
      setError('Failed to send message');
      setNewMessage(messageText);
    }
  };

  /** ------------------- MARK READ ------------------- **/
  const markMessageAsRead = async (bookingId, messageId) => {
    try {
      await api.post(`/bookings/${bookingId}/chat/mark-read`, {
        message_id: messageId,
      });
    } catch (err) {
      console.error('Failed to mark message as read:', err);
    }
  };

  /** ------------------- UNREAD COUNTS (PER BOOKING) ------------------- **/
  const fetchUnreadCounts = async () => {
    try {
      if (!bookings?.length) return;

      const results = await Promise.all(
        bookings.map(async (booking) => {
          try {
            const { data } = await api.get(`/bookings/${booking.id}/chat/unread-count`);

            const count =
              data?.data?.unread_count ??
              data?.data ??
              data?.unread_count ??
              0;

            return { id: booking.id, count: Number(count) || 0 };
          } catch (e) {
            console.error(`Failed unread count for booking ${booking.id}:`, e);
            return { id: booking.id, count: 0 };
          }
        })
      );

      const countsById = Object.fromEntries(results.map((r) => [r.id, r.count]));

      setBookings((prev) =>
        prev.map((b) => ({
          ...b,
          unread_count: countsById[b.id] ?? 0,
        }))
      );
    } catch (err) {
      console.error('Failed to fetch unread counts:', err);
    }
  };

  // run unread counts periodically (and once after bookings loaded)
  useEffect(() => {
    if (!token) return;
    if (bookings.length) fetchUnreadCounts();
    const interval = setInterval(fetchUnreadCounts, 10000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, bookings.length]);

  /** ------------------- TYPING INDICATOR ------------------- **/
  const handleTyping = () => {
    if (!selectedBooking?.id) return;

    const bookingId = selectedBooking.id;

    api.post(`/bookings/${bookingId}/chat/typing`)
      .catch((err) => console.error('Failed to send typing indicator:', err));

    if (echoRef.current) {
      echoRef.current.private(`booking.${bookingId}`).whisper('typing', {
        user_id: currentUserId.current,
      });
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      setTyping(false);
    }, 3000);
  };

  /** ------------------- TIME FORMAT ------------------- **/
  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return '';

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
    if (!dateString) return '';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  /** ------------------- FILTER BOOKINGS ------------------- **/
  const filteredBookings = bookings.filter((booking) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();

    const agentName = `${booking.car?.agent?.first_name || ''} ${booking.car?.agent?.last_name || ''}`.toLowerCase();
    const carName = `${booking.car?.make || ''} ${booking.car?.model || ''}`.toLowerCase();

    return agentName.includes(query) || carName.includes(query);
  });

  /** ------------------- JSX ------------------- **/
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-black dark:via-gray-900 dark:to-gray-950 pt-20">
      <div className="container mx-auto px-4 py-6">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
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
                My Bookings Chat
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Message your car agent</p>
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

            {/* Search */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 dark:text-white text-sm"
                />
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
              {loadingBookings ? (
                <div className="flex justify-center items-center h-full">
                  <div
                    className="animate-spin rounded-full h-10 w-10 border-4 border-t-transparent"
                    style={{ borderColor: COLORS.tealDim, borderTopColor: 'transparent' }}
                  />
                </div>
              ) : filteredBookings.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-8 text-gray-400">
                  <MessageCircle className="w-16 h-16 mb-3" style={{ color: COLORS.teal, opacity: 0.3 }} />
                  <p className="text-center font-medium">No bookings found</p>
                  <p className="text-xs text-center mt-1">Book a car to start chatting</p>
                </div>
              ) : (
                filteredBookings.map((booking) => {
                  const agent = booking.car?.agent;
                  const avatar = agent?.profile_picture
                    ? `/api/storage/${agent.profile_picture}`
                    : '/default-avatar.png';

                  return (
                    <motion.div
                      key={booking.id}
                      whileHover={{ x: 5 }}
                      onClick={() => setSelectedBooking(booking)}
                      className={`p-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer transition-all ${
                        selectedBooking?.id === booking.id
                          ? 'border-l-4'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                      style={selectedBooking?.id === booking.id ? { background: COLORS.tealDim, borderLeftColor: COLORS.teal } : {}}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img
                            src={avatar}
                            alt={agent?.first_name || 'Agent'}
                            className="w-12 h-12 rounded-full object-cover ring-2 ring-white dark:ring-gray-700"
                          />
                          {(booking.unread_count ?? 0) > 0 && (
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
                              {agent?.first_name || 'N/A'} {agent?.last_name || ''}
                              {agent?.verified_by_admin && (
                                <Shield className="w-3 h-3" style={{ color: COLORS.teal }} />
                              )}
                            </h3>
                            {(booking.unread_count ?? 0) > 0 && (
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
                  );
                })
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
                  <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>

                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            selectedBooking.car?.agent?.profile_picture
                              ? `/api/storage/${selectedBooking.car.agent.profile_picture}`
                              : '/default-avatar.png'
                          }
                          alt={selectedBooking.car?.agent?.first_name || 'Agent'}
                          className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-lg"
                        />
                        <div>
                          <h2 className="text-lg font-bold flex items-center gap-2">
                            {selectedBooking.car?.agent?.first_name || 'N/A'} {selectedBooking.car?.agent?.last_name || ''}
                            {selectedBooking.car?.agent?.verified_by_admin && <Shield className="w-4 h-4" />}
                          </h2>
                          <p className="text-xs opacity-90">Car Agent</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {selectedBooking.car?.agent?.phone_number && (
                          <motion.a
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            href={`tel:${selectedBooking.car.agent.phone_number}`}
                            className="p-2 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-colors"
                          >
                            <Phone className="w-4 h-4" />
                          </motion.a>
                        )}
                        {selectedBooking.car?.agent?.email && (
                          <motion.a
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            href={`mailto:${selectedBooking.car.agent.email}`}
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
                          <span className="truncate">
                            {selectedBooking.start_datetime ? formatDateTime(selectedBooking.start_datetime) : 'N/A'}
                          </span>
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
                      />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                      <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4" style={{ background: COLORS.tealDim }}>
                        <MessageCircle className="w-10 h-10" style={{ color: COLORS.teal }} />
                      </div>
                      <p className="text-lg font-medium">No messages yet</p>
                      <p className="text-sm">Start the conversation!</p>
                    </div>
                  ) : (
                    <>
                      {messages.map((message, index) => {
                        const isMe =
                          message.sender_id === currentUserId.current ||
                          message.sender?.id === currentUserId.current;

                        const prev = messages[index - 1];
                        const showAvatar = index === 0 || prev?.sender_id !== message.sender_id;

                        return (
                          <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}
                          >
                            {!isMe && showAvatar && (
                              <img
                                src={
                                  message.sender?.profile_picture
                                    ? `/api/storage/${message.sender.profile_picture}`
                                    : '/default-avatar.png'
                                }
                                alt={message.sender?.first_name || 'User'}
                                className="w-8 h-8 rounded-full object-cover ring-2 ring-white dark:ring-gray-700"
                              />
                            )}
                            {!isMe && !showAvatar && <div className="w-8" />}

                            <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[70%]`}>
                              <motion.div
                                whileHover={{ scale: 1.02 }}
                                className={`rounded-2xl px-4 py-2 shadow-md ${
                                  isMe
                                    ? 'text-white rounded-br-none'
                                    : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none border border-gray-200 dark:border-gray-600'
                                }`}
                                style={isMe ? { background: `linear-gradient(135deg, ${COLORS.teal}, ${COLORS.darkBlue})` } : {}}
                              >
                                <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{message.message}</p>
                              </motion.div>

                              <div className="flex items-center gap-1 mt-1 px-1">
                                <span className="text-xs text-gray-500 dark:text-gray-400">{formatTime(message.created_at)}</span>
                                {isMe && (
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

                            {isMe && showAvatar && (
                              <img
                                src={
                                  message.sender?.profile_picture
                                    ? `/api/storage/${message.sender.profile_picture}`
                                    : '/default-avatar.png'
                                }
                                alt={message.sender?.first_name || 'You'}
                                className="w-8 h-8 rounded-full object-cover ring-2 ring-white dark:ring-gray-700"
                              />
                            )}
                            {isMe && !showAvatar && <div className="w-8" />}
                          </motion.div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </>
                  )}

                  {/* Typing */}
                  <AnimatePresence>
                    {typing && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="flex items-center gap-2"
                      >
                        <img
                          src={
                            selectedBooking.car?.agent?.profile_picture
                              ? `/api/storage/${selectedBooking.car.agent.profile_picture}`
                              : '/default-avatar.png'
                          }
                          alt={selectedBooking.car?.agent?.first_name || 'Agent'}
                          className="w-8 h-8 rounded-full object-cover ring-2 ring-white dark:ring-gray-700"
                        />
                        <div className="bg-white dark:bg-gray-700 rounded-2xl rounded-bl-none px-4 py-3 border border-gray-200 dark:border-gray-600">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: COLORS.teal, animationDelay: '0ms' }} />
                            <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: COLORS.darkBlue, animationDelay: '150ms' }} />
                            <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: COLORS.limeGreen, animationDelay: '300ms' }} />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Input */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                  <div className="flex items-end gap-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 rounded-xl transition-colors"
                      style={{ background: COLORS.tealDim, color: COLORS.teal }}
                      type="button"
                    >
                      <Paperclip className="w-5 h-5" />
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 rounded-xl transition-colors"
                      style={{ background: COLORS.limeGreenDim, color: COLORS.limeGreen }}
                      type="button"
                    >
                      <Smile className="w-5 h-5" />
                    </motion.button>

                    <div className="flex-1 relative">
                      <textarea
                        value={newMessage}
                        onChange={(e) => {
                          setNewMessage(e.target.value);
                          // handleTyping();
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage(e);
                          }
                        }}
                        placeholder="Type your message..."
                        rows={1}
                        className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 dark:bg-gray-700 dark:text-white resize-none"
                      />
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={sendMessage}
                      disabled={!newMessage.trim()}
                      className="p-3 rounded-xl text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
                      style={{ background: `linear-gradient(135deg, ${COLORS.teal}, ${COLORS.darkBlue})` }}
                      type="button"
                    >
                      <Send className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center">
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
                  <div
                    className="w-24 h-24 rounded-full flex items-center justify-center mb-6 mx-auto"
                    style={{ background: `linear-gradient(135deg, ${COLORS.tealDim}, ${COLORS.limeGreenDim})` }}
                  >
                    <MessageCircle className="w-12 h-12" style={{ color: COLORS.teal }} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Select a Booking</h3>
                  <p className="text-gray-600 dark:text-gray-400">Choose a conversation to start chatting</p>
                </motion.div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
