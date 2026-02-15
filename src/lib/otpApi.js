/**
 * OTP API Service (Send & Resend OTP – v1.0, Feb 2026)
 *
 * Send / Resend: POST /api/auth/send-otp
 * Body: { phone_number, device_id } (both required; device_id max 64 chars).
 * Rate limits: 1 request/minute, 10 requests/day per device_id.
 * Responses: 200 { message }, 422 { errors }, 429 (Retry-After), 5xx { error }.
 */

import api from './axios';

const DEVICE_ID_KEY = 'rento_device_id';
const DEVICE_ID_MAX_LEN = 64;

/**
 * Generate a simple UUID v4-style string (no crypto dependency required).
 * @returns {string}
 */
function generateUuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Get or create a stable device identifier for this browser (used for send-OTP rate limiting).
 * Stored in localStorage; max 64 characters per API.
 * @returns {string} device_id (max 64 chars)
 */
export function getOrCreateDeviceId() {
  try {
    let id = typeof localStorage !== 'undefined' ? localStorage.getItem(DEVICE_ID_KEY) : null;
    if (!id || id.length > DEVICE_ID_MAX_LEN) {
      id = generateUuid();
      if (id.length > DEVICE_ID_MAX_LEN) id = id.slice(0, DEVICE_ID_MAX_LEN);
      if (typeof localStorage !== 'undefined') localStorage.setItem(DEVICE_ID_KEY, id);
    }
    return id;
  } catch {
    return generateUuid().slice(0, DEVICE_ID_MAX_LEN);
  }
}

/**
 * Send OTP for registration (and resend – same endpoint).
 * POST /api/auth/send-otp
 * @param {string} phoneNumber - E.164-style with or without + (e.g. "+9613123456" or "9613123456")
 * @param {string} [deviceId] - Optional; if omitted, getOrCreateDeviceId() is used. Max 64 chars.
 * @returns {Promise<{ message?: string }>} Success: { message: "OTP sent successfully" }
 * @throws Axios error with response: 422 (errors), 429 (rate limited), 5xx (server/SMS error)
 */
export const sendOtp = async (phoneNumber, deviceId) => {
  const phone = typeof phoneNumber === 'string' && phoneNumber.trim()
    ? (phoneNumber.trim().startsWith('+') ? phoneNumber.trim() : `+${phoneNumber.trim()}`)
    : '';
  const device = (deviceId && String(deviceId).slice(0, DEVICE_ID_MAX_LEN)) || getOrCreateDeviceId();

  const response = await api.post('/auth/send-otp', {
    phone_number: phone,
    device_id: device,
  });

  return response.data;
};

/**
 * Send OTP for password reset
 * @param {string} phoneNumber - Phone number with country code, with or without + (e.g. +96170123456)
 * @returns {Promise} Response with OTP sent confirmation
 */
export const sendForgotPasswordOtp = async (phoneNumber) => {
  // API accepts with or without +; backend normalizes. Send with + per doc.
  const normalized = phoneNumber.trim().startsWith('+') ? phoneNumber.trim() : `+${phoneNumber.trim()}`;
  const response = await api.post('/auth/forgot-password', {
    phone_number: normalized
  });
  return response.data;
};

/**
 * Verify OTP code
 * @param {string} phoneNumber - Phone number with country code
 * @param {string} otpCode - 6-digit OTP code
 * @returns {Promise} Response with verification confirmation
 */
export const verifyOtp = async (phoneNumber, otpCode) => {
  // Remove + sign if present (API expects format without +)
  const cleanPhone = phoneNumber.replace(/^\+/, '');
  
  const response = await api.post('/auth/verify-otp', {
    phone_number: cleanPhone,
    otp_code: otpCode
  });
  
  return response.data;
};

export default {
  getOrCreateDeviceId,
  sendOtp,
  sendForgotPasswordOtp,
  verifyOtp,
};

