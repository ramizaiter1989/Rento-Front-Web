/**
 * Ads API Service
 * Public endpoints for ads display and tracking.
 * Uses a dedicated axios instance WITHOUT auth interceptor so expired/invalid
 * tokens don't cause 401 errors on these public-only routes.
 */

import axios from 'axios';

let baseURL = import.meta.env.VITE_API_URL || 'https://rento-lb.com/api/api';
baseURL = baseURL.trim().replace(/\/+$/, '');

const publicApi = axios.create({
  baseURL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

/**
 * Get active ads for public display (no auth required)
 * @returns {Promise<Array>} Active ads array
 */
export const getActiveAds = async () => {
  try {
    const response = await publicApi.get('/ads');
    return response.data?.ads || [];
  } catch (error) {
    return [];
  }
};

/**
 * Get single ad (public - no auth required)
 * @param {number} adId
 */
export const getAd = async (adId) => {
  try {
    const response = await publicApi.get(`/ads/${adId}`);
    return response.data;
  } catch (error) {
    return null;
  }
};

/**
 * Track ad view (public - no auth required)
 * @param {number} adId
 */
export const trackAdView = async (adId) => {
  try {
    await publicApi.post(`/ads/${adId}/view`);
  } catch {
    // Silently fail - tracking shouldn't break the UI
  }
};

/**
 * Track ad click (public - no auth required)
 * @param {number} adId
 */
export const trackAdClick = async (adId) => {
  try {
    await publicApi.post(`/ads/${adId}/click`);
  } catch {
    // Silently fail - tracking shouldn't break the UI
  }
};

export default { getActiveAds, getAd, trackAdView, trackAdClick };
