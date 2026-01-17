/**
 * Comprehensive API Service
 * 
 * Complete API service implementation following the Frontend Implementation Guide v2.0.0
 * All endpoints are prefixed with /api
 * Authentication is handled automatically via axios interceptor
 */

import api from './axios';

// ============================
// Authentication & User Management
// ============================

/**
 * Register new user
 * @param {Object} data - Registration data
 * @param {string} data.username - Username
 * @param {string} data.email - Email address
 * @param {string} data.phone_number - Phone number
 * @param {string} data.password - Password
 * @param {string} data.role - Role (client, agency, employee)
 */
export const register = (data) => {
  return api.post('/auth/register', data);
};

/**
 * Login user
 * @param {Object} data - Login credentials
 * @param {string} data.email - Email address
 * @param {string} data.password - Password
 */
export const login = (data) => {
  return api.post('/auth/login', data);
};

/**
 * Send OTP
 * @param {Object} data - OTP request data
 * @param {string} data.phone_number - Phone number
 */
export const sendOtp = (data) => {
  return api.post('/auth/send-otp', data);
};

/**
 * Verify OTP
 * @param {Object} data - OTP verification data
 * @param {string} data.phone_number - Phone number
 * @param {string} data.otp_code - OTP code
 */
export const verifyOtp = (data) => {
  return api.post('/auth/verify-otp', data);
};

/**
 * Forgot password
 * @param {Object} data - Forgot password data
 * @param {string} data.email - Email address
 */
export const forgotPassword = (data) => {
  return api.post('/auth/forgot-password', data);
};

/**
 * Reset password
 * @param {Object} data - Reset password data
 * @param {string} data.email - Email address
 * @param {string} data.token - Reset token
 * @param {string} data.password - New password
 */
export const resetPassword = (data) => {
  return api.post('/auth/reset-password', data);
};

/**
 * Get user profile
 * Returns user object with update_access field
 */
export const getProfile = () => {
  return api.get('/profile');
};

/**
 * Check profile status
 */
export const getProfileStatus = () => {
  return api.get('/profile/status');
};

/**
 * Complete profile
 * ⚠️ Requires update_access = true
 */
export const completeProfile = (data) => {
  return api.post('/profile/complete', data);
};

/**
 * Update user profile
 * ⚠️ Requires update_access = true
 */
export const updateProfile = (data) => {
  return api.put('/user/profile', data);
};

/**
 * Change password
 * ⚠️ Requires update_access = true
 */
export const changePassword = (data) => {
  return api.post('/user/change-password', data);
};

/**
 * Request account deletion
 */
export const requestAccountDeletion = (data) => {
  return api.post('/account/delete-request', data);
};

// ============================
// Public Features (No Auth Required)
// ============================

/**
 * Get featured cars (public - no auth required)
 */
export const getFeaturedCars = () => {
  return api.get('/featured-cars');
};

/**
 * Get active ads (public - no auth required)
 */
export const getAds = () => {
  return api.get('/ads');
};

/**
 * Get single ad (public - no auth required)
 */
export const getAd = (id) => {
  return api.get(`/ads/${id}`);
};

/**
 * Track ad view (public - no auth required)
 */
export const trackAdView = (id) => {
  return api.post(`/ads/${id}/view`);
};

/**
 * Track ad click (public - no auth required)
 */
export const trackAdClick = (id) => {
  return api.post(`/ads/${id}/click`);
};

/**
 * Get guest cars (public - no auth required)
 */
export const getGuestCars = () => {
  return api.get('/guest-cars');
};

/**
 * Get public vehicles (public - no auth required)
 */
export const getPublicVehicles = (params = {}) => {
  return api.get('/vehicles', { params });
};

/**
 * Get public vehicle by ID (public - no auth required)
 */
export const getPublicVehicle = (id) => {
  return api.get(`/vehicles/${id}`);
};

/**
 * Get public config (public - no auth required)
 */
export const getPublicConfig = () => {
  return api.get('/config');
};

// ============================
// Car Management
// ============================

/**
 * List cars with filters
 * @param {Object} params - Query parameters
 * @param {string} params.search - Search term
 * @param {string} params.make - Filter by make
 * @param {string} params.model - Filter by model
 * @param {number} params.min_price - Minimum price
 * @param {number} params.max_price - Maximum price
 * @param {string} params.location - Filter by location
 */
export const getCars = (params = {}) => {
  return api.get('/cars', { params });
};

/**
 * Get my cars (agent)
 */
export const getMyCars = () => {
  return api.get('/cars/agent/Mycars');
};

/**
 * Search cars
 * @param {string} query - Search query
 */
export const searchCars = (query) => {
  return api.get('/cars/search', { params: { q: query } });
};

/**
 * Get car details
 */
export const getCar = (id) => {
  return api.get(`/cars/${id}`);
};

/**
 * Create car (agent/admin)
 */
export const createCar = (data) => {
  return api.post('/cars', data);
};

/**
 * Update car
 */
export const updateCar = (id, data) => {
  return api.put(`/cars/${id}`, data);
};

/**
 * Delete car
 */
export const deleteCar = (id) => {
  return api.delete(`/cars/${id}`);
};

/**
 * Get car holidays
 */
export const getCarHolidays = (id) => {
  return api.get(`/cars/${id}/holidays`);
};

/**
 * Add car holiday
 */
export const addCarHoliday = (id, data) => {
  return api.post(`/cars/${id}/holidays`, data);
};

/**
 * Set car qualifications
 */
export const setCarQualifications = (id, data) => {
  return api.post(`/cars/${id}/qualifications`, data);
};

/**
 * Get car qualifications
 */
export const getCarQualifications = (id) => {
  return api.get(`/cars/${id}/qualifications`);
};

/**
 * Preview car qualifications
 */
export const previewCarQualifications = (data) => {
  return api.post('/cars/qualifications/preview', data);
};

/**
 * Get car qualifications preview
 */
export const getCarQualificationsPreview = (id) => {
  return api.get(`/cars/${id}/qualifications/preview`);
};

/**
 * Clear car qualifications
 */
export const clearCarQualifications = (id) => {
  return api.delete(`/cars/${id}/qualifications`);
};

/**
 * Toggle car favorite
 */
export const toggleCarFavorite = (id) => {
  return api.post(`/cars/${id}/favorite`);
};

/**
 * Get favorites list
 */
export const getFavorites = () => {
  return api.get('/cars/favorites/list');
};

// ============================
// Booking System
// ============================

/**
 * Create booking
 * Response includes total_booking_price (with app fees) and app_fees_amount
 */
export const createBooking = (data) => {
  return api.post('/bookings', data);
};

/**
 * List bookings
 * @param {Object} params - Query parameters
 * @param {string} params.status - Filter by status (pending, confirmed, completed, cancelled)
 * @param {string} params.payment_status - Filter by payment status
 */
export const getBookings = (params = {}) => {
  return api.get('/bookings', { params });
};

/**
 * Get booking details
 */
export const getBooking = (id) => {
  return api.get(`/bookings/${id}`);
};

/**
 * Cancel booking
 */
export const cancelBooking = (id, data) => {
  return api.post(`/bookings/${id}/cancel`, data);
};

/**
 * Get booking estimate
 */
export const getBookingEstimate = (id) => {
  return api.post(`/bookings/${id}/estimate`);
};

/**
 * Submit booking feedback
 */
export const submitBookingFeedback = (id, data) => {
  return api.post(`/bookings/${id}/feedback`, data);
};

/**
 * Get booking invoice
 */
export const getBookingInvoice = (id) => {
  return api.get(`/bookings/${id}/invoice`);
};

// ============================
// App Fees System
// ============================

/**
 * Get agent app fees balance
 */
export const getAgentAppFeesBalance = () => {
  return api.get('/agent/app-fees/balance');
};

/**
 * Get app fees balance by car
 */
export const getAppFeesBalanceByCar = (carId) => {
  return api.get(`/agent/app-fees/car/${carId}`);
};

/**
 * Get admin view of agent app fees balance
 */
export const getAdminAgentAppFeesBalance = (agentId) => {
  return api.get(`/admin/agents/${agentId}/app-fees/balance`);
};

/**
 * Update agent app fees percentage (admin)
 */
export const updateAgentAppFees = (agentId, data) => {
  return api.put(`/admin/agents/${agentId}/app-fees`, data);
};

// ============================
// Support & Chat
// ============================

/**
 * Create support ticket
 */
export const createSupportTicket = (data) => {
  return api.post('/support/tickets', data);
};

/**
 * Get support tickets
 */
export const getSupportTickets = (params = {}) => {
  return api.get('/support/tickets', { params });
};

/**
 * Get support ticket details
 */
export const getSupportTicket = (id) => {
  return api.get(`/support/tickets/${id}`);
};

/**
 * Add message to support ticket
 */
export const addTicketMessage = (id, data) => {
  return api.post(`/support/tickets/${id}/message`, data);
};

/**
 * Mark ticket as reviewed (admin)
 */
export const reviewTicket = (id) => {
  return api.post(`/support/tickets/${id}/review`);
};

/**
 * Resolve ticket (admin)
 */
export const resolveTicket = (id) => {
  return api.post(`/support/tickets/${id}/resolve`);
};

/**
 * Reject ticket (admin)
 */
export const rejectTicket = (id) => {
  return api.post(`/support/tickets/${id}/reject`);
};

/**
 * Update ticket priority (admin)
 */
export const updateTicketPriority = (id, data) => {
  return api.post(`/support/tickets/${id}/priority`, data);
};

// ============================
// Booking Chat
// ============================

/**
 * Get user chats
 */
export const getUserChats = () => {
  return api.get('/chats');
};

/**
 * Get booking chat messages
 */
export const getBookingChat = (bookingId) => {
  return api.get(`/bookings/${bookingId}/chat`);
};

/**
 * Send chat message
 */
export const sendChatMessage = (bookingId, data) => {
  return api.post(`/bookings/${bookingId}/chat`, data);
};

/**
 * Mark messages as read
 */
export const markChatAsRead = (bookingId) => {
  return api.post(`/bookings/${bookingId}/chat/mark-read`);
};

/**
 * Get unread count
 */
export const getChatUnreadCount = (bookingId) => {
  return api.get(`/bookings/${bookingId}/chat/unread-count`);
};

/**
 * Send typing indicator
 */
export const sendTypingIndicator = (bookingId, data) => {
  return api.post(`/bookings/${bookingId}/chat/typing`, data);
};

// ============================
// Notifications
// ============================

/**
 * Get notifications
 * @param {Object} params - Query parameters
 * @param {number} params.per_page - Items per page
 * @param {number} params.page - Page number
 */
export const getNotifications = (params = {}) => {
  return api.get('/notifications', { params });
};

/**
 * Get unread notifications count
 */
export const getUnreadNotificationsCount = () => {
  return api.get('/notifications/unread-count');
};

/**
 * Mark notifications as read
 * @param {Object} data - Optional notification IDs array
 * @param {number[]} data.notification_ids - Specific notification IDs (optional, marks all if omitted)
 */
export const markNotificationsAsRead = (data = {}) => {
  return api.post('/notifications/mark-read', data);
};

/**
 * Delete notification
 */
export const deleteNotification = (id) => {
  return api.delete(`/notifications/${id}`);
};

/**
 * Register Expo push token
 */
export const registerExpoPushToken = (data) => {
  return api.post('/notifications/expo-token', data);
};

// ============================
// Additional Features
// ============================

/**
 * Get frequent searches
 */
export const getFrequentSearches = () => {
  return api.get('/frequent-searches');
};

/**
 * Store or update search
 */
export const storeSearch = (data) => {
  return api.post('/frequent-searches', data);
};

/**
 * Get search statistics
 */
export const getSearchStatistics = () => {
  return api.get('/frequent-searches/statistics');
};

/**
 * Get user suggestions
 */
export const getSuggestions = () => {
  return api.get('/suggestions');
};

/**
 * Create suggestion
 */
export const createSuggestion = (data) => {
  return api.post('/suggestions', data);
};

/**
 * Get suggestion details
 */
export const getSuggestion = (id) => {
  return api.get(`/suggestions/${id}`);
};

/**
 * Update suggestion status
 */
export const updateSuggestionStatus = (id, data) => {
  return api.put(`/suggestions/${id}/status`, data);
};

/**
 * Mark suggestion as received
 */
export const markSuggestionAsReceived = (id) => {
  return api.patch(`/suggestions/${id}/mark-as-received`);
};

/**
 * Delete suggestion
 */
export const deleteSuggestion = (id) => {
  return api.delete(`/suggestions/${id}`);
};

/**
 * Get real user data
 */
export const getRealUserData = (userId) => {
  return api.get(`/real-user-data/${userId}`);
};

/**
 * Store or update real user data
 */
export const storeRealUserData = (userId, data) => {
  return api.post(`/real-user-data/${userId}`, data);
};

/**
 * Update real user data status
 */
export const updateRealUserDataStatus = (id, data) => {
  return api.patch(`/real-user-data/${id}/status`, data);
};

/**
 * Delete real user data
 */
export const deleteRealUserData = (userId) => {
  return api.delete(`/real-user-data/${userId}`);
};

/**
 * Get check photos
 */
export const getCheckPhotos = (params = {}) => {
  return api.get('/check-photos', { params });
};

/**
 * Get check photo details
 */
export const getCheckPhoto = (id) => {
  return api.get(`/check-photos/${id}`);
};

/**
 * Create check photo
 */
export const createCheckPhoto = (data) => {
  return api.post('/check-photos', data);
};

/**
 * Update check photo
 */
export const updateCheckPhoto = (id, data) => {
  return api.post(`/check-photos/${id}`, data);
};

/**
 * Delete check photo
 */
export const deleteCheckPhoto = (id) => {
  return api.delete(`/check-photos/${id}`);
};

/**
 * Upload file
 */
export const uploadFile = (formData) => {
  return api.post('/uploads', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

/**
 * Get client profile
 */
export const getClientProfile = () => {
  return api.get('/clients/profile');
};

/**
 * Update client profile
 * ⚠️ Requires update_access = true
 */
export const updateClientProfile = (data) => {
  return api.put('/clients/profile', data);
};

/**
 * Update client qualifications
 */
export const updateClientQualifications = (data) => {
  return api.post('/clients/update-qualifications', data);
};

// ============================
// Real-time Features
// ============================

/**
 * Broadcasting authentication
 */
export const broadcastingAuth = () => {
  return api.post('/broadcasting/auth');
};

/**
 * Real-time test
 */
export const realtimeTest = (data) => {
  return api.post('/realtime/send', data);
};

// Export all functions
export default {
  // Auth
  register,
  login,
  sendOtp,
  verifyOtp,
  forgotPassword,
  resetPassword,
  
  // Profile
  getProfile,
  getProfileStatus,
  completeProfile,
  updateProfile,
  changePassword,
  requestAccountDeletion,
  
  // Public
  getFeaturedCars,
  getAds,
  getAd,
  trackAdView,
  trackAdClick,
  getGuestCars,
  getPublicVehicles,
  getPublicVehicle,
  getPublicConfig,
  
  // Cars
  getCars,
  getMyCars,
  searchCars,
  getCar,
  createCar,
  updateCar,
  deleteCar,
  getCarHolidays,
  addCarHoliday,
  setCarQualifications,
  getCarQualifications,
  previewCarQualifications,
  getCarQualificationsPreview,
  clearCarQualifications,
  toggleCarFavorite,
  getFavorites,
  
  // Bookings
  createBooking,
  getBookings,
  getBooking,
  cancelBooking,
  getBookingEstimate,
  submitBookingFeedback,
  getBookingInvoice,
  
  // App Fees
  getAgentAppFeesBalance,
  getAppFeesBalanceByCar,
  getAdminAgentAppFeesBalance,
  updateAgentAppFees,
  
  // Support
  createSupportTicket,
  getSupportTickets,
  getSupportTicket,
  addTicketMessage,
  reviewTicket,
  resolveTicket,
  rejectTicket,
  updateTicketPriority,
  
  // Chat
  getUserChats,
  getBookingChat,
  sendChatMessage,
  markChatAsRead,
  getChatUnreadCount,
  sendTypingIndicator,
  
  // Notifications
  getNotifications,
  getUnreadNotificationsCount,
  markNotificationsAsRead,
  deleteNotification,
  registerExpoPushToken,
  
  // Additional
  getFrequentSearches,
  storeSearch,
  getSearchStatistics,
  getSuggestions,
  createSuggestion,
  getSuggestion,
  updateSuggestionStatus,
  markSuggestionAsReceived,
  deleteSuggestion,
  getRealUserData,
  storeRealUserData,
  updateRealUserDataStatus,
  deleteRealUserData,
  getCheckPhotos,
  getCheckPhoto,
  createCheckPhoto,
  updateCheckPhoto,
  deleteCheckPhoto,
  uploadFile,
  getClientProfile,
  updateClientProfile,
  updateClientQualifications,
  
  // Real-time
  broadcastingAuth,
  realtimeTest,
};
