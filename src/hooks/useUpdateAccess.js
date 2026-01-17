/**
 * React Hook: Update Access Check
 * 
 * Checks if the current user has permission to update their profile.
 * This hook fetches the user profile and checks the `update_access` field.
 * 
 * Usage:
 * ```jsx
 * function ProfileEdit() {
 *   const { hasAccess, loading } = useUpdateAccess();
 * 
 *   if (loading) return <Loading />;
 *   if (!hasAccess) {
 *     return (
 *       <Message type="warning">
 *         You don't have permission to update your profile. Contact administrator.
 *       </Message>
 *     );
 *   }
 * 
 *   return <ProfileForm />;
 * }
 * ```
 */

import { useState, useEffect } from 'react';
import { getProfile } from '@/lib/api';

export function useUpdateAccess() {
  const [hasAccess, setHasAccess] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkUpdateAccess = async () => {
      // Check if user is authenticated
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      
      if (!token) {
        setHasAccess(false);
        setLoading(false);
        return;
      }

      try {
        const response = await getProfile();
        const user = response.data?.user;
        
        // Default to true if update_access is not explicitly set to false
        setHasAccess(user?.update_access !== false);
        setError(null);
      } catch (err) {
        // If there's an error, assume no access for safety
        console.error('Error checking update access:', err);
        setHasAccess(false);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    checkUpdateAccess();
  }, []);

  return { hasAccess, loading, error };
}

export default useUpdateAccess;
