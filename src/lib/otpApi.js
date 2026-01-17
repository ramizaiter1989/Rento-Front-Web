/**
 * OTP API Service
 * 
 * Service functions for OTP authentication via MSG91.
 * Handles OTP sending, verification, and password reset flows.
 */

import api from './axios';

/**
 * Send OTP for registration
 * @param {string} phoneNumber - Phone number with country code (e.g., "4915225134244")
 * @returns {Promise} Response with OTP sent confirmation
 */
export const sendOtp = async (phoneNumber) => {
  // Remove + sign if present (API expects format without +)
  const cleanPhone = phoneNumber.replace(/^\+/, '');
  
  const response = await api.post('/auth/send-otp', {
    phone_number: cleanPhone
  });
  
  return response.data;
};

/**
 * Send OTP for password reset
 * @param {string} phoneNumber - Phone number with country code (must exist in users table)
 * @returns {Promise} Response with OTP sent confirmation
 */
export const sendForgotPasswordOtp = async (phoneNumber) => {
  // Remove + sign if present (API expects format without +)
  const cleanPhone = phoneNumber.replace(/^\+/, '');
  
  const response = await api.post('/auth/forgot-password', {
    phone_number: cleanPhone
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
  sendOtp,
  sendForgotPasswordOtp,
  verifyOtp
};

