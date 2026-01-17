/**
 * Update Access Handler Utility
 * 
 * Utility functions for handling update access errors and checking permissions.
 * Use this when making profile update API calls to handle 403 errors gracefully.
 */

import { toast } from 'sonner';

/**
 * Handle update access error (403 Forbidden)
 * Shows user-friendly message when update_access is denied
 * 
 * @param {Error} error - API error object
 * @param {Function} onError - Optional callback function
 */
export const handleUpdateAccessError = (error, onError) => {
  if (error?.response?.status === 403) {
    const message = error.response?.data?.message || 
      'You do not have permission to update your profile. Please contact administrator.';
    
    toast.error('Update Access Denied', {
      description: message,
      duration: 5000,
    });
    
    if (onError) {
      onError(error);
    }
    
    return true; // Error was handled
  }
  
  return false; // Error was not an update access error
};

/**
 * Check if error is an update access error
 * @param {Error} error - API error object
 * @returns {boolean}
 */
export const isUpdateAccessError = (error) => {
  return error?.response?.status === 403 && 
    (error.response?.data?.error === 'Update access denied' ||
     error.response?.data?.message?.toLowerCase().includes('update access'));
};

/**
 * Wrapper for API calls that require update access
 * Automatically handles 403 errors
 * 
 * @param {Function} apiCall - API function to call
 * @param {Function} onSuccess - Success callback
 * @param {Function} onError - Error callback (optional)
 */
export const withUpdateAccessCheck = async (apiCall, onSuccess, onError) => {
  try {
    const response = await apiCall();
    if (onSuccess) {
      onSuccess(response);
    }
    return response;
  } catch (error) {
    if (handleUpdateAccessError(error, onError)) {
      return; // Error was handled
    }
    
    // Handle other errors
    if (onError) {
      onError(error);
    } else {
      toast.error('Error', {
        description: error.response?.data?.message || error.message || 'An error occurred',
      });
    }
    
    throw error;
  }
};

export default {
  handleUpdateAccessError,
  isUpdateAccessError,
  withUpdateAccessCheck,
};
