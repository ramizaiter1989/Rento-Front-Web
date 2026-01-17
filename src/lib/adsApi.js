/**
 * Ads API Service
 * Public and admin endpoints for ads management
 * Updated to use public endpoints as per Frontend Implementation Guide v2.0.0
 */

import api from './axios';

/**
 * Get active ads for public display (no auth required)
 * Uses public endpoint: GET /api/ads
 * @returns {Promise} Response with active ads
 */
export const getActiveAds = async () => {
  try {
    // Use public endpoint - no auth required
    const response = await api.get('/ads');
    return response.data?.ads || [];
  } catch (error) {
    console.error('Error fetching active ads:', error);
    return [];
  }
};

/**
 * Get single ad (public - no auth required)
 * @param {number} adId - Ad ID
 * @returns {Promise} Response with ad details
 */
export const getAd = async (adId) => {
  try {
    const response = await api.get(`/ads/${adId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching ad:', error);
    return null;
  }
};

/**
 * Track ad view (public - no auth required)
 * @param {number} adId - Ad ID
 * @returns {Promise} Response
 */
export const trackAdView = async (adId) => {
  try {
    await api.post(`/ads/${adId}/view`);
  } catch (error) {
    // Silently fail - tracking shouldn't break the UI
    console.error('Error tracking ad view:', error);
  }
};

/**
 * Track ad click (public - no auth required)
 * @param {number} adId - Ad ID
 * @returns {Promise} Response
 */
export const trackAdClick = async (adId) => {
  try {
    await api.post(`/ads/${adId}/click`);
  } catch (error) {
    // Silently fail - tracking shouldn't break the UI
    console.error('Error tracking ad click:', error);
  }
};

export default {
  getActiveAds,
  getAd,
  trackAdView,
  trackAdClick
};
