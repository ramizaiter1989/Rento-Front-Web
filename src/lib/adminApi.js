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
 * PUT /api/admin/users/{userId}/link-real-user-data
 * @param {number} userId - User ID to link to
 * @param {Object} data - { real_user_data_id: number }
 * @returns {Promise} Response with { message, user, real_user_data }
 */
export const linkRealUserData = (userId, data) => {
  return api.put(`/admin/users/${userId}/link-real-user-data`, data);
};

// ============================
// Cars Management
// ============================

/**
 * Get all cars with optional filters (Super Admin Car Management)
 * GET /api/admin/cars
 * @param {Object} params - Query parameters
 * @param {string} params.status - Filter: available, not_available, rented, maintenance
 * @param {string} params.car_accepted - Filter: true or false
 * @param {number} params.agent_id - Filter by owner (agency user ID)
 * @param {string} params.is_private - Filter: true or false
 * @param {string} params.search - Search in make, model, license_plate, color
 * @param {number} params.per_page - Items per page (default: 50)
 * @param {number} params.page - Page number
 * @returns {Promise} Response with { cars, meta }
 */
export const getCars = (params = {}) => {
  return api.get('/admin/cars', { params });
};

/**
 * Get single car with full details (Super Admin)
 * GET /api/admin/cars/{id}
 * @param {number} id - Car ID
 * @returns {Promise} Response with { car } including agent, featured_listing, bookings, check_photos, holidays, feedbacks, deposits, balances, favorites
 */
export const getCar = (id) => {
  return api.get(`/admin/cars/${id}`);
};

/**
 * Update car (Super Admin). Data-only uses JSON; data + images use multipart/form-data.
 * PUT /api/admin/cars/{id}
 * @param {number} id - Car ID
 * @param {Object} data - Car data to update. Only fields you send are updated.
 *   For images use File: main_image, front_image, back_image, left_image, right_image (jpg/jpeg/png, max 5MB).
 *   Objects/arrays (live_location, features, car_add_on, reason_of_rent, qualification_code) can be sent as objects; they are JSON-stringified in FormData.
 * @returns {Promise} Response with { message, car }
 */
export const updateCar = (id, data) => {
  const imageKeys = ['main_image', 'front_image', 'back_image', 'left_image', 'right_image'];
  const hasFile = Object.keys(data).some(key => imageKeys.includes(key) && data[key] instanceof File);

  if (hasFile) {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      const value = data[key];
      if (value === undefined || value === null) return;
      if (value instanceof File) {
        formData.append(key, value);
      } else if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, value);
      }
    });
    // Do not set Content-Type; browser sets multipart/form-data with boundary for FormData
    const putConfig = { headers: { ...api.defaults.headers.common, ...(api.defaults.headers.put || {}) } };
    delete putConfig.headers['Content-Type'];
    return api.put(`/admin/cars/${id}`, formData, putConfig);
  }

  const cleanData = {};
  Object.keys(data).forEach(key => {
    const value = data[key];
    if (value === undefined || value === null) return;
    cleanData[key] = value;
  });
  return api.put(`/admin/cars/${id}`, cleanData, {
    headers: { 'Content-Type': 'application/json' },
  });
};

/**
 * Accept or reject car (super_admin)
 * PUT /api/admin/cars/{id} with JSON body { car_accepted: true|false }
 * @param {number} id - Car ID
 * @param {boolean} accepted - true to accept, false to reject
 * @returns {Promise} Response with { message, car }
 */
export const updateCarAcceptReject = (id, accepted) => {
  return api.put(`/admin/cars/${id}`, { car_accepted: accepted }, {
    headers: { 'Content-Type': 'application/json' },
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
 * Replace a single car image by type (Super Admin). Does not change other car data.
 * POST /api/admin/cars/{id}/photo
 * @param {number} id - Car ID
 * @param {File} image - Image file (jpg, jpeg, png, max 5MB)
 * @param {string} imageType - One of: main, front, back, left, right
 * @returns {Promise} Response with { message, car }
 */
export const updateCarPhoto = (id, image, imageType) => {
  const formData = new FormData();
  formData.append('image', image);
  const type = String(imageType ?? '').trim().toLowerCase();
  formData.append('type', type);

  // Let browser set Content-Type with boundary (no Content-Type header so multipart works)
  return api.post(`/admin/cars/${id}/photo`, formData, {
    transformRequest: [(data, headers) => {
      if (typeof FormData !== 'undefined' && data instanceof FormData) {
        delete headers['Content-Type'];
      }
      return data;
    }],
  });
};

/**
 * Download car image as file (attachment)
 * GET /api/admin/cars/{id}/images/{type}/download
 * @param {number} id - Car ID
 * @param {string} type - main, front, back, left, or right
 * @returns {Promise<Blob>} Image blob for download
 */
export const downloadCarImage = async (id, type) => {
  const res = await api.get(`/admin/cars/${id}/images/${type}/download`, {
    responseType: 'blob',
  });
  return res.data;
};

// ============================
// Agencies (Super Admin Only)
// ============================

/**
 * List agencies (Super Admin only). Paginated with filters and sort.
 * GET /api/admin/agencies
 * @param {Object} params - Query parameters
 * @param {number} params.per_page - Items per page (default: 20)
 * @param {number} params.page - Page number
 * @param {string} params.sort_by - created_at | username | first_name | last_name
 * @param {string} params.sort_order - asc | desc
 * @param {boolean} params.verified_only - If true, only verified agencies
 * @param {string} params.business_type - rental | private | company | marina
 * @param {string} params.address - Governorate filter (Beirut, Mount Lebanon, North, etc.)
 * @param {string} params.search - Search username, first_name, last_name
 * @returns {Promise} Response with { success, agencies: { data, current_page, last_page, per_page, total, ... } }
 */
export const getAgencies = (params = {}) => {
  return api.get('/admin/agencies', { params });
};

/**
 * Get single agency by ID (Super Admin only).
 * GET /api/admin/agencies/{id}
 * @param {number} id - Agency user ID
 * @returns {Promise} Response with { success, agency }
 */
export const getAgency = (id) => {
  return api.get(`/admin/agencies/${id}`);
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
 * List all real user data
 * GET /api/admin/real-user-data
 * @param {Object} params - Query: status (pending|approved|not_approved), user_id, per_page (default 20)
 * @returns {Promise} Response with { real_user_data: { data, current_page, last_page, per_page, total } }
 */
export const getRealUserData = (params = {}) => {
  return api.get('/admin/real-user-data', { params });
};

/**
 * Get real user data for specific user
 * GET /api/admin/real-user-data/{userId}
 * @param {number} userId - User ID
 * @returns {Promise} Response with { success, data }. 404 when no real data for this user.
 */
export const getRealUserDataByUser = (userId) => {
  return api.get(`/admin/real-user-data/${userId}`);
};

/**
 * Create or update real user data for a user (verify user)
 * POST /api/admin/real-user-data/{userId}
 * On success, user becomes verified (verified_by_admin = true)
 * @param {number} userId - User ID
 * @param {Object} data - Real user data
 * @param {string} data.first_name - First name (required, max 100)
 * @param {string} data.last_name - Last name (required, max 100)
 * @param {string} data.gender - Gender (required: male | female)
 * @param {string} data.id_number - ID number (optional, max 50)
 * @param {string} data.passport_number - Passport number (optional, max 50)
 * @param {string} data.driver_license_number - Driver license number (optional, max 50)
 * @param {string} data.middle_name - Middle name (optional, max 100)
 * @param {string} data.mother_name - Mother's name (optional, max 100)
 * @param {string} data.place_of_birth - Place of birth (optional, max 100)
 * @param {string} data.date_of_birth - Date of birth (optional, Y-m-d)
 * @returns {Promise} Response with { success, data, user_verified }
 */
export const createOrUpdateRealUserData = (userId, data) => {
  return api.post(`/admin/real-user-data/${userId}`, data);
};

/**
 * Update real user data status (approve/reject)
 * PATCH /api/admin/real-user-data/{id}/status
 * {id} is the real_user_data record ID, not user_id.
 * @param {number} id - Real user data record ID
 * @param {Object} data - Status update data
 * @param {string} data.status - New status: pending | approved | not_approved (required)
 * @param {string} data.reason_of_status - Reason/note (optional)
 * @returns {Promise} Response with { success, data, user_verified }
 */
export const updateRealUserDataStatus = (id, data) => {
  return api.patch(`/admin/real-user-data/${id}/status`, data);
};

/**
 * Delete real user data for a user
 * DELETE /api/admin/real-user-data/{userId}
 * @param {number} userId - User ID
 * @returns {Promise} Response with { success, message }
 */
export const deleteRealUserData = (userId) => {
  return api.delete(`/admin/real-user-data/${userId}`);
};

/**
 * Link existing real user data to another user
 * PUT /api/admin/users/{userId}/link-real-user-data
 * @param {number} userId - User ID to link to
 * @param {Object} data - { real_user_data_id: number }
 * @returns {Promise} Response with { message, user, real_user_data }
 */
export const linkRealUserDataToUser = (userId, realUserDataId) => {
  return api.put(`/admin/users/${userId}/link-real-user-data`, {
    real_user_data_id: realUserDataId,
  });
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
// Promo Codes & Broker Referrals (Admin)
// ============================

/**
 * List promo codes (paginated) with optional filters.
 * GET /api/admin/promo-codes
 * @param {Object} params
 * @param {number} [params.broker_id] - Filter by broker user ID
 * @param {string} [params.is_active] - "true" or "false"
 * @param {number} [params.per_page] - Items per page (default 50)
 */
export const getPromoCodes = (params = {}) => {
  return api.get('/admin/promo-codes', { params });
};

/**
 * Get single promo code by ID.
 * GET /api/admin/promo-codes/{id}
 * @param {number} id - Promo code ID
 */
export const getPromoCode = (id) => {
  return api.get(`/admin/promo-codes/${id}`);
};

/**
 * Create a new promo code.
 * POST /api/admin/promo-codes
 * @param {Object} data - Promo code payload
 */
export const createPromoCode = (data) => {
  return api.post('/admin/promo-codes', data);
};

/**
 * Update an existing promo code.
 * PUT /api/admin/promo-codes/{id}
 * @param {number} id - Promo code ID
 * @param {Object} data - Fields to update
 */
export const updatePromoCode = (id, data) => {
  return api.put(`/admin/promo-codes/${id}`, data);
};

/**
 * Delete a promo code.
 * DELETE /api/admin/promo-codes/{id}
 * @param {number} id - Promo code ID
 */
export const deletePromoCode = (id) => {
  return api.delete(`/admin/promo-codes/${id}`);
};

/**
 * Get users who used a specific promo code.
 * GET /api/admin/promo-codes/{id}/users
 * @param {number} id - Promo code ID
 * @param {Object} params - { per_page? }
 */
export const getPromoCodeUsers = (id, params = {}) => {
  return api.get(`/admin/promo-codes/${id}/users`, { params });
};

/**
 * Get broker referrals for a given broker.
 * GET /api/admin/brokers/{brokerId}/referrals
 * @param {number} brokerId - Broker user ID
 * @param {Object} params - { per_page? }
 */
export const getBrokerReferrals = (brokerId, params = {}) => {
  return api.get(`/admin/brokers/${brokerId}/referrals`, { params });
};

/**
 * Create a new broker user.
 * POST /api/admin/users with role=broker
 * @param {Object} data - Broker user data
 * @param {string} data.username - Username (required, max 100, unique)
 * @param {string} data.phone_number - Phone number (required, max 20, unique)
 * @param {string} [data.email] - Email (optional, valid email, max 255)
 * @param {string} data.password - Password (required, min 6 chars)
 * @param {string} data.password_confirmation - Must match password (required)
 * @param {string} data.first_name - First name (required, max 100)
 * @param {string} data.last_name - Last name (required, max 100)
 * @returns {Promise} Response with created broker/user
 */
export const createBroker = (data) => {
  return api.post('/admin/users', { ...data, role: 'broker' });
};

/**
 * Get broker balance (total commissions − total payouts).
 * GET /api/admin/brokers/{brokerId}/balance
 * @param {number} brokerId - Broker user ID
 */
export const getBrokerBalance = (brokerId) => {
  return api.get(`/admin/brokers/${brokerId}/balance`);
};

/**
 * List broker payouts (invoices with type broker_payout).
 * GET /api/admin/brokers/{brokerId}/payouts
 * @param {number} brokerId - Broker user ID
 * @param {Object} params - { per_page? }
 */
export const getBrokerPayouts = (brokerId, params = {}) => {
  return api.get(`/admin/brokers/${brokerId}/payouts`, { params });
};

/**
 * List broker commissions with statistics.
 * GET /api/admin/brokers/{brokerId}/commissions
 * @param {number} brokerId - Broker user ID
 * @param {Object} params - { status?, per_page? }
 */
export const getBrokerCommissions = (brokerId, params = {}) => {
  return api.get(`/admin/brokers/${brokerId}/commissions`, { params });
};

/**
 * Create broker payout (invoice). Allocates amount to pending commissions (FIFO).
 * POST /api/admin/broker-payouts
 * @param {Object} data - { broker_id, amount, reference?, notes? }
 */
export const createBrokerPayout = (data) => {
  return api.post('/admin/broker-payouts', data);
};

/**
 * List all broker commissions (global).
 * GET /api/admin/broker-commissions
 * @param {Object} params - { broker_id?, status?, per_page? }
 */
export const getBrokerCommissionsList = (params = {}) => {
  return api.get('/admin/broker-commissions', { params });
};

/**
 * Get single commission.
 * GET /api/admin/broker-commissions/{id}
 * @param {number} id - Commission ID
 */
export const getBrokerCommission = (id) => {
  return api.get(`/admin/broker-commissions/${id}`);
};

/**
 * Cancel a pending commission.
 * PUT /api/admin/broker-commissions/{id}/cancel
 * @param {number} id - Commission ID
 */
export const cancelBrokerCommission = (id) => {
  return api.put(`/admin/broker-commissions/${id}/cancel`);
};

/**
 * Delete a broker referral.
 * DELETE /api/admin/broker-referrals/{id}
 * @param {number} id - Referral ID
 */
export const deleteBrokerReferral = (id) => {
  return api.delete(`/admin/broker-referrals/${id}`);
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
// Services Management (Admin)
// ============================

/**
 * Get all services with optional filters
 * Uses public endpoint /api/services (admin can access this too)
 * @param {Object} params - Query parameters
 * @param {string} params.category - Filter by category
 * @param {string} params.city - Filter by city
 * @param {number} params.min_price - Minimum price filter
 * @param {number} params.max_price - Maximum price filter
 * @param {number} params.min_rating - Minimum rating filter
 * @param {boolean} params.featured - Filter by featured status
 * @param {string} params.search - Search term
 * @param {string} params.sort_by - Sort field (name, price, rating)
 * @param {string} params.sort_order - Sort direction (asc, desc)
 * @param {number} params.per_page - Number of items per page
 * @returns {Promise} Response with paginated services
 */
export const getAdminServices = (params = {}) => {
  // Use public endpoint /api/services (admin can access this)
  // Note: /admin/services doesn't exist - services are nested under third-parties
  return api.get('/services', { params });
};

/**
 * Get service details by ID
 * Uses public endpoint /api/services/{id} (admin can access this too)
 * @param {number} id - Service ID
 * @returns {Promise} Response with service details
 */
export const getAdminService = (id) => {
  // Use public endpoint /api/services/{id} (admin can access this)
  return api.get(`/services/${id}`);
};

/**
 * Create service for a specific third party
 * POST /api/admin/third-parties/{thirdPartyId}/services
 *
 * NOTE: This endpoint expects multipart/form-data because of images.
 * We build a FormData payload from the provided data object.
 *
 * @param {number} thirdPartyId - Third party ID (required, from route)
 * @param {Object} data - Service data
 * @returns {Promise} Response with created service
 */
export const createAdminServiceForThirdParty = (thirdPartyId, data) => {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    if (Array.isArray(value)) {
      // For array fields (amenities, cuisine_types, etc.), append each value
      value.forEach((v) => {
        formData.append(key, v);
      });
    } else {
      formData.append(key, value);
    }
  });

  return api.post(`/admin/third-parties/${thirdPartyId}/services`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

/**
 * Update service
 * @param {number} id - Service ID
 * @param {Object} data - Service data to update
 * @returns {Promise} Response with updated service
 */
export const updateAdminService = (id, data) => {
  return api.put(`/admin/services/${id}`, data);
};

/**
 * Delete service
 * @param {number} id - Service ID
 * @returns {Promise} Response with success message
 */
export const deleteAdminService = (id) => {
  return api.delete(`/admin/services/${id}`);
};

// ============================
// Service Items Management (Admin)
// ============================

/**
 * Get items for a service
 * Uses public endpoint /api/services/{serviceId}/items (admin can access this too)
 * Note: /admin/services/{serviceId}/items only supports POST, not GET
 * @param {number} serviceId - Service ID
 * @returns {Promise} Response with service items
 */
export const getAdminServiceItems = (serviceId) => {
  // Use public endpoint since admin endpoint only supports POST
  return api.get(`/services/${serviceId}/items`);
};

/**
 * Get service item details
 * @param {number} itemId - Item ID
 * @returns {Promise} Response with item details
 */
export const getAdminServiceItem = (itemId) => {
  return api.get(`/admin/services/items/${itemId}`);
};

/**
 * Create service item
 * @param {number} serviceId - Service ID
 * @param {Object} data - Item data
 * @param {string} data.name - Item name (required)
 * @param {string} data.description - Item description (optional)
 * @param {number} data.price - Item price (required)
 * @param {string} data.image - Item image URL (optional)
 * @returns {Promise} Response with created item
 */
export const createAdminServiceItem = (serviceId, data) => {
  return api.post(`/admin/services/${serviceId}/items`, data);
};

/**
 * Update service item
 * @param {number} itemId - Item ID
 * @param {Object} data - Item data to update
 * @returns {Promise} Response with updated item
 */
export const updateAdminServiceItem = (itemId, data) => {
  return api.put(`/admin/services/items/${itemId}`, data);
};

/**
 * Delete service item
 * @param {number} itemId - Item ID
 * @returns {Promise} Response with success message
 */
export const deleteAdminServiceItem = (itemId) => {
  return api.delete(`/admin/services/items/${itemId}`);
};

// ============================
// Third Party Management (Admin)
// ============================

/**
 * Get all third parties with optional filters
 * @param {Object} params - Query parameters
 * @param {number} params.per_page - Number of items per page
 * @returns {Promise} Response with paginated third parties
 */
export const getAdminThirdParties = (params = {}) => {
  return api.get('/admin/third-parties', { params });
};

/**
 * Get third party details by ID
 * @param {number} id - Third party ID
 * @returns {Promise} Response with third party details
 */
export const getAdminThirdParty = (id) => {
  return api.get(`/admin/third-parties/${id}`);
};

/**
 * Create third party
 * @param {Object} data - Third party data
 * @param {string} data.name - Name (required)
 * @param {string} data.email - Email (required)
 * @param {string} data.password - Password (required)
 * @param {string} data.subscription - Subscription type (optional)
 * @param {string[]} data.permissions - Array of permissions (optional)
 * @returns {Promise} Response with created third party
 */
export const createAdminThirdParty = (data) => {
  return api.post('/admin/third-parties', data);
};

/**
 * Update third party
 * @param {number} id - Third party ID
 * @param {Object} data - Third party data to update
 * @returns {Promise} Response with updated third party
 */
export const updateAdminThirdParty = (id, data) => {
  return api.put(`/admin/third-parties/${id}`, data);
};

/**
 * Delete third party
 * @param {number} id - Third party ID
 * @returns {Promise} Response with success message
 */
export const deleteAdminThirdParty = (id) => {
  return api.delete(`/admin/third-parties/${id}`);
};

// ============================
// Service Feedbacks Management (Admin)
// ============================

/**
 * Get feedbacks for a service
 * @param {number} serviceId - Service ID
 * @returns {Promise} Response with service feedbacks
 */
export const getAdminServiceFeedbacks = (serviceId) => {
  return api.get(`/admin/services/${serviceId}/feedbacks`);
};

/**
 * Get all feedbacks (admin view)
 * @param {Object} params - Query parameters
 * @param {number} params.per_page - Number of items per page
 * @returns {Promise} Response with paginated feedbacks
 */
export const getAdminFeedbacks = (params = {}) => {
  return api.get('/admin/feedbacks', { params });
};

/**
 * Delete feedback
 * @param {number} feedbackId - Feedback ID
 * @returns {Promise} Response with success message
 */
export const deleteAdminFeedback = (feedbackId) => {
  return api.delete(`/admin/feedbacks/${feedbackId}`);
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
  getAgencies,
  getAgency,
  updateCar,
  updateCarAcceptReject,
  deleteCar,
  updateCarPhoto,
  downloadCarImage,
  
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
  linkRealUserDataToUser,
  
  // Suggestions
  getSuggestions,
  updateSuggestion,
  deleteSuggestion,
  // Promo codes & referrals
  getPromoCodes,
  getPromoCode,
  createPromoCode,
  updatePromoCode,
  deletePromoCode,
  getPromoCodeUsers,
  getBrokerReferrals,
  createBroker,
  getBrokerBalance,
  getBrokerPayouts,
  getBrokerCommissions,
  createBrokerPayout,
  getBrokerCommissionsList,
  getBrokerCommission,
  cancelBrokerCommission,
  deleteBrokerReferral,

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
  
  // Services Management
  getAdminServices,
  getAdminService,
  createAdminServiceForThirdParty,
  updateAdminService,
  deleteAdminService,
  
  // Service Items Management
  getAdminServiceItems,
  getAdminServiceItem,
  createAdminServiceItem,
  updateAdminServiceItem,
  deleteAdminServiceItem,
  
  // Third Party Management
  getAdminThirdParties,
  getAdminThirdParty,
  createAdminThirdParty,
  updateAdminThirdParty,
  deleteAdminThirdParty,
  
  // Service Feedbacks Management
  getAdminServiceFeedbacks,
  getAdminFeedbacks,
  deleteAdminFeedback,
};

