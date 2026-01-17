/**
 * Admin API Service
 * 
 * Comprehensive API service for Admin Dashboard endpoints.
 * All endpoints require Bearer Token authentication and admin role.
 * 
 * Base URL: /api/admin
 * Authentication: Bearer Token (automatically added via axios interceptor)
 */

import api from './axios';

// ============================
// Users Management
// ============================

/**
 * Get all users with optional filters
 * @param {Object} params - Query parameters
 * @param {string} params.role - Filter by role (client, agency, admin)
 * @param {boolean} params.status - Filter by status (true=active, false=inactive)
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.per_page - Number of items per page (default: 50)
 * @returns {Promise} Response with paginated users
 */
export const getUsers = (params = {}) => {
  return api.get('/admin/users', { params });
};

/**
 * Get user details by ID
 * @param {number} id - User ID
 * @returns {Promise} Response with user details
 */
export const getUser = (id) => {
  return api.get(`/admin/users/${id}`);
};

/**
 * Update user
 * @param {number} id - User ID
 * @param {Object} data - User data to update
 * @param {boolean} data.update_access - Allow/deny user to update their profile (default: true)
 * @param {boolean} data.verified_by_admin - Verification status
 * @param {boolean} data.status - Active status
 * @param {boolean} data.is_locked - Lock status
 * @returns {Promise} Response with updated user
 */
export const updateUser = (id, data) => {
  return api.put(`/admin/users/${id}`, data);
};

/**
 * Delete user (soft delete)
 * @param {number} id - User ID
 * @returns {Promise} Response with success message
 */
export const deleteUser = (id) => {
  return api.delete(`/admin/users/${id}`);
};

/**
 * Force delete user (permanent)
 * @param {number} id - User ID
 * @returns {Promise} Response with success message
 */
export const forceDeleteUser = (id) => {
  return api.delete(`/admin/users/${id}/force`);
};

/**
 * Update user photo
 * @param {number} id - User ID
 * @param {File} photo - Image file (jpg, jpeg, png, max 5MB)
 * @returns {Promise} Response with updated user
 */
export const updateUserPhoto = (id, photo) => {
  const formData = new FormData();
  formData.append('photo', photo);
  return api.post(`/admin/users/${id}/photo`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

/**
 * Link real user data to user
 * @param {number} userId - User ID
 * @param {Object} data - Link data
 * @param {string} data.real_user_id - Real user ID to link
 * @returns {Promise} Response with updated user
 */
export const linkRealUserData = (userId, data) => {
  return api.put(`/admin/users/${userId}/link-real-user-data`, data);
};

// ============================
// Cars Management
// ============================

/**
 * Get all cars with optional filters
 * @param {Object} params - Query parameters
 * @param {string} params.status - Filter by status (available, rented, maintenance, unavailable)
 * @param {boolean} params.car_accepted - Filter by approval status
 * @param {number} params.agent_id - Filter by agent ID
 * @param {boolean} params.with_images - Include car images (default: true)
 * @param {number} params.per_page - Number of items per page (default: 50)
 * @returns {Promise} Response with paginated cars
 */
export const getCars = (params = {}) => {
  const finalParams = { with_images: true, ...params };
  return api.get('/admin/cars', { params: finalParams });
};

/**
 * Get car details by ID
 * @param {number} id - Car ID
 * @returns {Promise} Response with car details
 */
export const getCar = (id) => {
  return api.get(`/admin/cars/${id}`);
};

/**
 * Update car
 * @param {number} id - Car ID
 * @param {Object} data - Car data to update
 * @param {string} data.status - Car status
 * @param {boolean} data.car_accepted - Approval status
 * @param {string} data.notes - Admin notes
 * @param {File|string} data.main_image - Main car image (File or URL)
 * @param {File|string} data.front_image - Front car image (File or URL)
 * @param {File|string} data.back_image - Back car image (File or URL)
 * @param {File|string} data.left_image - Left car image (File or URL)
 * @param {File|string} data.right_image - Right car image (File or URL)
 * @returns {Promise} Response with updated car
 */
export const updateCar = (id, data) => {
  const formData = new FormData();
  
  // Handle regular fields
  Object.keys(data).forEach(key => {
    if (key.endsWith('_image') && data[key] instanceof File) {
      formData.append(key, data[key]);
    } else if (key.endsWith('_image') && typeof data[key] === 'string') {
      formData.append(key, data[key]);
    } else if (!key.endsWith('_image')) {
      formData.append(key, data[key]);
    }
  });
  
  return api.put(`/admin/cars/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

/**
 * Delete car
 * @param {number} id - Car ID
 * @returns {Promise} Response with success message
 */
export const deleteCar = (id) => {
  return api.delete(`/admin/cars/${id}`);
};

/**
 * Update car photo
 * @param {number} id - Car ID
 * @param {File} image - Image file (jpg, jpeg, png, max 5MB)
 * @param {string} imageType - Image type: main, front, back, left, right
 * @returns {Promise} Response with updated car
 */
export const updateCarPhoto = (id, image, imageType) => {
  const formData = new FormData();
  formData.append('image', image);
  formData.append('image_type', imageType);
  return api.post(`/admin/cars/${id}/photo`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// ============================
// Bookings Management
// ============================

/**
 * Get all bookings with optional filters
 * @param {Object} params - Query parameters
 * @param {string} params.status - Filter by status (pending, confirmed, cancelled, completed, rejected)
 * @param {number} params.per_page - Number of items per page (default: 50)
 * @returns {Promise} Response with paginated bookings
 */
export const getBookings = (params = {}) => {
  return api.get('/admin/bookings', { params });
};

/**
 * Get booking details by ID
 * @param {number} id - Booking ID
 * @returns {Promise} Response with booking details
 */
export const getBooking = (id) => {
  return api.get(`/admin/bookings/${id}`);
};

/**
 * Update booking
 * @param {number} id - Booking ID
 * @param {Object} data - Booking data to update
 * @param {string} data.booking_request_status - Booking status (pending, confirmed, cancelled, completed, rejected)
 * @param {number} data.total_booking_price - Total booking price
 * @returns {Promise} Response with updated booking
 */
export const updateBooking = (id, data) => {
  return api.put(`/admin/bookings/${id}`, data);
};

/**
 * Force complete booking
 * @param {number} id - Booking ID
 * @returns {Promise} Response with success message
 */
export const forceCompleteBooking = (id) => {
  return api.post(`/admin/bookings/${id}/force-complete`);
};

/**
 * Get booking behavior/statistics
 * @param {Object} params - Query parameters
 * @param {string} params.from_date - Start date filter (YYYY-MM-DD)
 * @param {string} params.to_date - End date filter (YYYY-MM-DD)
 * @param {string} params.status - Filter by status
 * @returns {Promise} Response with booking behavior data
 */
export const getBookingBehavior = (params = {}) => {
  return api.get('/admin/bookings/behavior', { params });
};

/**
 * Get booking price breakdown
 * @param {number} id - Booking ID
 * @returns {Promise} Response with price breakdown
 */
export const getBookingPriceBreakdown = (id) => {
  return api.get(`/admin/bookings/${id}/price-breakdown`);
};

// ============================
// Payments Management
// ============================

/**
 * Get all payments with optional filters
 * @param {Object} params - Query parameters
 * @param {string} params.type - Filter by type (income, expense, debit, upcoming_income)
 * @param {number} params.per_page - Number of items per page (default: 50)
 * @returns {Promise} Response with paginated payments
 */
export const getPayments = (params = {}) => {
  return api.get('/admin/payments', { params });
};

/**
 * Issue payment/invoice
 * @param {Object} data - Payment data
 * @param {number} data.user_id - User ID (required)
 * @param {string} data.name - Payment name (optional, default: "Admin issued payment")
 * @param {number} data.amount - Amount (required, min: 0)
 * @param {string} data.type - Payment type: income, expense (required)
 * @param {string} data.description - Description (optional, max: 500)
 * @param {string} data.reference - Reference number (optional, max: 100)
 * @returns {Promise} Response with created invoice
 */
export const issuePayment = (data) => {
  return api.post('/admin/payments/issue', data);
};

/**
 * Process refund for an invoice
 * @param {number} id - Invoice ID
 * @param {Object} data - Refund data
 * @param {string} data.description - Refund description (optional)
 * @returns {Promise} Response with refund invoice
 */
export const processRefund = (id, data = {}) => {
  return api.post(`/admin/refunds/${id}`, data);
};

// ============================
// Agent Fee Management
// ============================

/**
 * Get all agent fee invoices
 * @param {Object} params - Query parameters
 * @returns {Promise} Response with agent fee invoices
 */
export const getAgentFeeInvoices = (params = {}) => {
  return api.get('/admin/agent-fee-invoices', { params });
};

/**
 * Create agent fee invoice
 * @param {Object} data - Invoice data
 * @returns {Promise} Response with created invoice
 */
export const createAgentFeeInvoice = (data) => {
  return api.post('/admin/agent-fee-invoices', data);
};

/**
 * Record payment for an agent fee invoice
 * @param {number} id - Invoice ID
 * @param {Object} data - Payment data
 * @returns {Promise} Response with updated invoice
 */
export const recordInvoicePayment = (id, data) => {
  return api.post(`/admin/agent-fee-invoices/${id}/payment`, data);
};

/**
 * Get agent fee summary
 * @param {number} agentId - Agent ID
 * @returns {Promise} Response with agent fee summary
 */
export const getAgentFeeSummary = (agentId) => {
  return api.get(`/admin/agents/${agentId}/fee-summary`);
};

/**
 * Get agent fee percentage
 * @param {number} agentId - Agent ID
 * @returns {Promise} Response with agent fee percentage
 */
export const getAgentFeePercentage = (agentId) => {
  return api.get(`/admin/agents/${agentId}/fee-percentage`);
};

/**
 * Set agent fee percentage
 * @param {number} agentId - Agent ID
 * @param {Object} data - Fee percentage data
 * @param {number} data.app_fees - Fee percentage (0-100, e.g., 15.50 for 15.5%)
 * @returns {Promise} Response with updated agent
 */
export const setAgentFeePercentage = (agentId, data) => {
  return api.put(`/admin/agents/${agentId}/fee-percentage`, data);
};

// ============================
// Announcements Management
// ============================

/**
 * Get all announcements with optional filters
 * @param {Object} params - Query parameters
 * @param {string} params.status - Filter by status (draft, published, archived)
 * @param {number} params.per_page - Number of items per page (default: 50)
 * @returns {Promise} Response with paginated announcements
 */
export const getAnnouncements = (params = {}) => {
  return api.get('/admin/announcements', { params });
};

/**
 * Get announcement details by ID
 * @param {number} id - Announcement ID
 * @returns {Promise} Response with announcement details
 */
export const getAnnouncement = (id) => {
  return api.get(`/admin/announcements/${id}`);
};

/**
 * Create announcement
 * @param {Object} data - Announcement data
 * @param {string} data.title - Announcement title (required, max: 255)
 * @param {string} data.message - Announcement message (required)
 * @param {string} data.scheduled_at - Schedule date/time (optional, default: now)
 * @param {string} data.expires_at - Expiration date/time (optional, must be after scheduled_at)
 * @param {string} data.priority - Priority level (low, medium, high) (optional, default: medium)
 * @param {string[]} data.target_audience - Target roles array or user IDs (optional)
 * @param {string[]} data.categories - Array of categories (optional)
 * @param {string[]} data.media - Array of media URLs (optional)
 * @param {string} data.status - Status (draft, published, archived) (optional, default: draft)
 * @returns {Promise} Response with created announcement
 */
export const createAnnouncement = (data) => {
  return api.post('/admin/announcements', data);
};

/**
 * Update announcement
 * @param {number} id - Announcement ID
 * @param {Object} data - Announcement data to update (all fields optional)
 * @returns {Promise} Response with updated announcement
 */
export const updateAnnouncement = (id, data) => {
  return api.put(`/admin/announcements/${id}`, data);
};

/**
 * Delete announcement
 * @param {number} id - Announcement ID
 * @returns {Promise} Response with success message
 */
export const deleteAnnouncement = (id) => {
  return api.delete(`/admin/announcements/${id}`);
};

// ============================
// Appeals/Support Tickets Management
// ============================

/**
 * Get all appeals with optional filters
 * @param {Object} params - Query parameters
 * @param {string} params.status - Filter by status (submitted, under_review, resolved, rejected, escalated)
 * @param {string} params.priority - Filter by priority (low, medium, high, urgent)
 * @param {number} params.per_page - Number of items per page (default: 50)
 * @returns {Promise} Response with paginated appeals
 */
export const getAppeals = (params = {}) => {
  return api.get('/admin/appeals', { params });
};

/**
 * Get appeal details by ID
 * @param {number} id - Appeal ID
 * @returns {Promise} Response with appeal details
 */
export const getAppeal = (id) => {
  return api.get(`/admin/appeals/${id}`);
};

/**
 * Update appeal
 * @param {number} id - Appeal ID
 * @param {Object} data - Appeal data to update (all fields optional)
 * @param {string} data.status - Status (submitted, under_review, resolved, rejected, escalated)
 * @param {string} data.priority - Priority (low, medium, high, urgent)
 * @param {string} data.response - Admin response
 * @param {string} data.resolution - Resolution details
 * @returns {Promise} Response with updated appeal
 */
export const updateAppeal = (id, data) => {
  return api.put(`/admin/appeals/${id}`, data);
};

// ============================
// Ads Management
// ============================

/**
 * Get all ads with optional filters
 * @param {Object} params - Query parameters
 * @param {string} params.status - Filter by status (active, expired, or all)
 * @param {number} params.per_page - Number of items per page (default: 50)
 * @returns {Promise} Response with paginated ads
 */
export const getAds = (params = {}) => {
  return api.get('/admin/ads', { params });
};

/**
 * Get ad details by ID
 * @param {number} id - Ad ID
 * @returns {Promise} Response with ad details
 */
export const getAd = (id) => {
  return api.get(`/admin/ads/${id}`);
};

/**
 * Create ad
 * @param {Object} data - Ad data
 * @param {number} data.user_id - User ID (required)
 * @param {string} data.start_at - Start date/time (required)
 * @param {string} data.expire_at - Expiration date/time (required, must be after start_at)
 * @param {string} data.website - Website URL (optional)
 * @param {string} data.company_type - Company type (optional)
 * @param {string} data.image_url - Ad image URL (optional, max 512 chars)
 * @param {string} data.target_url - Target URL (optional, max 512 chars)
 * @param {string} data.ads_text - Ad text (optional)
 * @param {number} data.amount_cost - Ad cost (optional, default: 0)
 * @param {boolean} data.online - Online status (optional, default: false)
 * @returns {Promise} Response with created ad
 */
export const createAd = (data) => {
  return api.post('/admin/ads', data);
};

/**
 * Update ad
 * @param {number} id - Ad ID
 * @param {Object} data - Ad data to update (all fields optional)
 * @returns {Promise} Response with updated ad
 */
export const updateAd = (id, data) => {
  return api.put(`/admin/ads/${id}`, data);
};

/**
 * Delete ad
 * @param {number} id - Ad ID
 * @returns {Promise} Response with success message
 */
export const deleteAd = (id) => {
  return api.delete(`/admin/ads/${id}`);
};

/**
 * Track ad view (increment view count)
 * @param {number} id - Ad ID
 * @returns {Promise} Response
 */
export const trackAdView = (id) => {
  return api.post(`/admin/ads/${id}/track-view`);
};

/**
 * Track ad click (increment click count)
 * @param {number} id - Ad ID
 * @returns {Promise} Response
 */
export const trackAdClick = (id) => {
  return api.post(`/admin/ads/${id}/track-click`);
};

// ============================
// Featured Cars Management
// ============================

/**
 * Get all featured cars with optional filters
 * @param {Object} params - Query parameters
 * @param {string} params.status - Filter by status (active, expired, upcoming)
 * @param {number} params.per_page - Number of items per page (default: 50)
 * @returns {Promise} Response with paginated featured cars
 */
export const getFeaturedCars = (params = {}) => {
  return api.get('/admin/featured-cars', { params });
};

/**
 * Create featured car
 * @param {Object} data - Featured car data
 * @param {number} data.car_id - Car ID (required)
 * @param {string} data.expire_at - Expiry date/time (required, ISO format)
 * @returns {Promise} Response with created featured car
 */
export const createFeaturedCar = (data) => {
  return api.post('/admin/featured-cars', data);
};

/**
 * Update featured car
 * @param {number} id - Featured car ID
 * @param {Object} data - Featured car data
 * @param {string} data.expire_at - Expiry date/time (optional, ISO format)
 * @returns {Promise} Response with updated featured car
 */
export const updateFeaturedCar = (id, data) => {
  return api.put(`/admin/featured-cars/${id}`, data);
};

/**
 * Delete featured car
 * @param {number} id - Featured car ID
 * @returns {Promise} Response with success message
 */
export const deleteFeaturedCar = (id) => {
  return api.delete(`/admin/featured-cars/${id}`);
};

// ============================
// Holidays Management
// ============================

/**
 * Get all holidays with optional filters
 * @param {Object} params - Query parameters
 * @param {number} params.car_id - Filter by car ID
 * @param {string} params.active - Filter by active status (true or false)
 * @param {number} params.per_page - Number of items per page (default: 50)
 * @returns {Promise} Response with paginated holidays
 */
export const getHolidays = (params = {}) => {
  return api.get('/admin/holidays', { params });
};

/**
 * Get holiday details by ID
 * @param {number} id - Holiday ID
 * @returns {Promise} Response with holiday details
 */
export const getHoliday = (id) => {
  return api.get(`/admin/holidays/${id}`);
};

/**
 * Create holiday
 * @param {Object} data - Holiday data
 * @param {number} data.car_id - Car ID (required, exists:cars,id)
 * @param {string} data.holiday_name - Holiday name (required)
 * @param {Object} data.holiday_dates - Holiday dates (required)
 * @param {string} data.holiday_dates.start - Start date (YYYY-MM-DD) (required)
 * @param {string} data.holiday_dates.end - End date (YYYY-MM-DD) (required, must be >= start)
 * @param {number} data.percentage_increase - Percentage increase (required, e.g., 15 for 15%)
 * @param {boolean} data.is_active - Active status (optional, default: true)
 * @returns {Promise} Response with created holiday
 */
export const createHoliday = (data) => {
  return api.post('/admin/holidays', data);
};

/**
 * Update holiday
 * @param {number} id - Holiday ID
 * @param {Object} data - Holiday data to update (all fields optional)
 * @returns {Promise} Response with updated holiday
 */
export const updateHoliday = (id, data) => {
  return api.put(`/admin/holidays/${id}`, data);
};

/**
 * Delete holiday
 * @param {number} id - Holiday ID
 * @returns {Promise} Response with success message
 */
export const deleteHoliday = (id) => {
  return api.delete(`/admin/holidays/${id}`);
};

// ============================
// Real User Data Management
// ============================

/**
 * Get all real user data with optional filters
 * @param {Object} params - Query parameters
 * @param {string} params.status - Filter by status (pending, approved, not_approved)
 * @param {number} params.user_id - Filter by user ID
 * @param {number} params.per_page - Number of items per page (default: 50)
 * @returns {Promise} Response with paginated real user data
 */
export const getRealUserData = (params = {}) => {
  return api.get('/admin/real-user-data', { params });
};

/**
 * Get real user data for specific user
 * @param {number} userId - User ID
 * @returns {Promise} Response with real user data
 */
export const getRealUserDataByUser = (userId) => {
  return api.get(`/admin/real-user-data/user/${userId}`);
};

/**
 * Create or update real user data for a user
 * @param {number} userId - User ID
 * @param {Object} data - Real user data (all fields optional except user_id from URL)
 * @param {string} data.id_number - ID number
 * @param {string} data.passport_number - Passport number
 * @param {string} data.driver_license_number - Driver license number
 * @param {string} data.first_name - First name
 * @param {string} data.middle_name - Middle name
 * @param {string} data.last_name - Last name
 * @param {string} data.mother_name - Mother's name
 * @param {string} data.place_of_birth - Place of birth
 * @param {string} data.gender - Gender
 * @param {string} data.date_of_birth - Date of birth
 * @param {string} data.status - Status (pending, approved, not_approved) (optional, default: approved)
 * @param {string} data.reason_of_status - Reason for status
 * @returns {Promise} Response with created/updated real user data
 */
export const createOrUpdateRealUserData = (userId, data) => {
  return api.post(`/admin/real-user-data/user/${userId}`, data);
};

/**
 * Update real user data status
 * @param {number} id - Real user data ID
 * @param {Object} data - Status update data
 * @param {string} data.status - New status (pending, approved, not_approved) (required)
 * @param {string} data.reason_of_status - Reason for status change (optional)
 * @returns {Promise} Response with updated real user data
 */
export const updateRealUserDataStatus = (id, data) => {
  return api.put(`/admin/real-user-data/${id}/status`, data);
};

/**
 * Delete real user data
 * @param {number} userId - User ID
 * @returns {Promise} Response with success message
 */
export const deleteRealUserData = (userId) => {
  return api.delete(`/admin/real-user-data/user/${userId}`);
};

// ============================
// User Suggestions Management
// ============================

/**
 * Get all user suggestions with optional filters
 * @param {Object} params - Query parameters
 * @param {string} params.status - Filter by status (pending, received, implemented, rejected)
 * @param {number} params.per_page - Number of items per page (default: 50)
 * @returns {Promise} Response with paginated suggestions
 */
export const getSuggestions = (params = {}) => {
  return api.get('/admin/suggestions', { params });
};

/**
 * Update suggestion status
 * @param {number} id - Suggestion ID
 * @param {Object} data - Status update data
 * @param {string} data.status - New status (pending, received, implemented, rejected)
 * @returns {Promise} Response with updated suggestion
 */
export const updateSuggestion = (id, data) => {
  return api.put(`/admin/suggestions/${id}`, data);
};

/**
 * Delete suggestion
 * @param {number} id - Suggestion ID
 * @returns {Promise} Response with success message
 */
export const deleteSuggestion = (id) => {
  return api.delete(`/admin/suggestions/${id}`);
};

// ============================
// Notifications Management
// ============================

/**
 * Get all notifications with optional filters
 * @param {Object} params - Query parameters
 * @param {string} params.type - Filter by notification type
 * @param {boolean} params.is_read - Filter by read status
 * @param {number} params.per_page - Number of items per page (default: 50)
 * @returns {Promise} Response with paginated notifications
 */
export const getNotifications = (params = {}) => {
  return api.get('/admin/notifications', { params });
};

/**
 * Send notification to all users
 * @param {Object} data - Notification data
 * @param {string} data.title - Notification title (required, max 255 chars)
 * @param {string} data.message - Notification message (required)
 * @param {string} data.type - Notification type (optional, default: general)
 * @param {Object} data.data - Additional data object (optional)
 * @returns {Promise} Response with success message
 */
export const sendNotificationToAll = (data) => {
  return api.post('/admin/notifications/send-to-all', data);
};

// ============================
// OTP Management
// ============================

/**
 * Get all OTP codes with optional filters
 * @param {Object} params - Query parameters
 * @param {string} params.phone_number - Filter by phone number
 * @param {string} params.expired - Filter by expiration (true for expired, false for active)
 * @param {string} params.from_date - Filter OTPs created from this date (YYYY-MM-DD)
 * @param {string} params.to_date - Filter OTPs created until this date (YYYY-MM-DD)
 * @param {number} params.per_page - Number of items per page (default: 50)
 * @param {number} params.page - Page number (default: 1)
 * @returns {Promise} Response with paginated OTP codes
 */
export const getOtps = (params = {}) => {
  return api.get('/admin/otps', { params });
};

/**
 * Get OTP statistics
 * @returns {Promise} Response with OTP statistics
 */
export const getOtpStatistics = () => {
  return api.get('/admin/otps/statistics');
};

/**
 * Get single OTP by ID
 * @param {number} id - OTP ID
 * @returns {Promise} Response with OTP details
 */
export const getOtp = (id) => {
  return api.get(`/admin/otps/${id}`);
};

/**
 * Delete all expired OTPs
 * @returns {Promise} Response with deletion count
 */
export const deleteExpiredOtps = () => {
  return api.delete('/admin/otps/expired');
};

/**
 * Delete specific OTP by ID
 * @param {number} id - OTP ID
 * @returns {Promise} Response with success message
 */
export const deleteOtp = (id) => {
  return api.delete(`/admin/otps/${id}`);
};

// ============================
// Reports & Statistics
// ============================

/**
 * Get summary report
 * @returns {Promise} Response with summary statistics
 */
export const getSummaryReport = () => {
  return api.get('/admin/reports/summary');
};

/**
 * Get detailed statistics
 * @param {Object} params - Query parameters
 * @param {string} params.period - Time period (day, week, month, year) (optional, default: month)
 * @returns {Promise} Response with detailed statistics
 */
export const getStatistics = (params = {}) => {
  return api.get('/admin/reports/statistics', { params });
};

/**
 * Get revenue report
 * @param {Object} params - Query parameters
 * @param {string} params.period - Time period (day, week, month, year) (optional, default: month)
 * @returns {Promise} Response with revenue report
 */
export const getRevenueReport = (params = {}) => {
  return api.get('/admin/reports/revenue', { params });
};

/**
 * Get chart data for analytics
 * @param {Object} params - Query parameters
 * @param {string} params.period - Time period (day, week, month, year) (optional, default: month)
 * @returns {Promise} Response with chart data (revenue, bookings, users arrays)
 */
export const getChartData = (params = {}) => {
  return api.get('/admin/reports/chart-data', { params });
};

/**
 * Get system logs
 * @param {Object} params - Query parameters
 * @param {number} params.limit - Number of log entries (optional, default: 100)
 * @returns {Promise} Response with system logs
 */
export const getSystemLogs = (params = {}) => {
  return api.get('/admin/logs', { params });
};


// Export all functions as default object for convenience
export default {
  // Users
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  forceDeleteUser,
  updateUserPhoto,
  linkRealUserData,
  
  // Cars
  getCars,
  getCar,
  updateCar,
  deleteCar,
  updateCarPhoto,
  
  // Bookings
  getBookings,
  getBooking,
  updateBooking,
  forceCompleteBooking,
  getBookingBehavior,
  getBookingPriceBreakdown,
  
  // Payments
  getPayments,
  issuePayment,
  processRefund,
  
  // Agent Fee Management
  getAgentFeeInvoices,
  createAgentFeeInvoice,
  recordInvoicePayment,
  getAgentFeeSummary,
  getAgentFeePercentage,
  setAgentFeePercentage,
  
  // Announcements
  getAnnouncements,
  getAnnouncement,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  
  // Appeals
  getAppeals,
  getAppeal,
  updateAppeal,
  
  // Ads
  getAds,
  getAd,
  createAd,
  updateAd,
  deleteAd,
  
  // Featured Cars
  getFeaturedCars,
  createFeaturedCar,
  updateFeaturedCar,
  deleteFeaturedCar,
  
  // Holidays
  getHolidays,
  getHoliday,
  createHoliday,
  updateHoliday,
  deleteHoliday,
  
  // Real User Data
  getRealUserData,
  getRealUserDataByUser,
  createOrUpdateRealUserData,
  updateRealUserDataStatus,
  deleteRealUserData,
  
  // Suggestions
  getSuggestions,
  updateSuggestion,
  deleteSuggestion,
  
  // Notifications
  getNotifications,
  sendNotificationToAll,
  
  // OTP Management
  getOtps,
  getOtpStatistics,
  getOtp,
  deleteExpiredOtps,
  deleteOtp,
  
  // Reports
  getSummaryReport,
  getStatistics,
  getRevenueReport,
  getChartData,
  getSystemLogs,
};

