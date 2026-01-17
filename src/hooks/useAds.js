/**
 * React Hook: Public Ads
 * 
 * Fetches and manages public ads. No authentication required.
 * Includes tracking functionality for views and clicks.
 * 
 * Usage:
 * ```jsx
 * function AdBanner() {
 *   const { ads, loading, trackView, trackClick } = useAds();
 * 
 *   useEffect(() => {
 *     if (ads.length > 0) {
 *       trackView(ads[0].id);
 *     }
 *   }, [ads]);
 * 
 *   const handleClick = (ad) => {
 *     trackClick(ad.id);
 *     window.open(ad.target_url, '_blank');
 *   };
 * 
 *   return <AdComponent ads={ads} onClick={handleClick} />;
 * }
 * ```
 */

import { useState, useEffect } from 'react';
import { getAds, trackAdView, trackAdClick } from '@/lib/api';

export function useAds() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        setLoading(true);
        const response = await getAds();
        // Response structure: { ads: [...] }
        const adsList = response.data?.ads || [];
        setAds(adsList);
        setError(null);
      } catch (err) {
        console.error('Error fetching ads:', err);
        setError(err.message || 'Failed to load ads');
        setAds([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAds();
  }, []);

  /**
   * Track ad view
   * @param {number} adId - Ad ID
   */
  const handleTrackView = async (adId) => {
    try {
      await trackAdView(adId);
    } catch (err) {
      // Silently fail - tracking shouldn't break the UI
      console.error('Error tracking ad view:', err);
    }
  };

  /**
   * Track ad click
   * @param {number} adId - Ad ID
   */
  const handleTrackClick = async (adId) => {
    try {
      await trackAdClick(adId);
    } catch (err) {
      // Silently fail - tracking shouldn't break the UI
      console.error('Error tracking ad click:', err);
    }
  };

  return {
    ads,
    loading,
    error,
    trackView: handleTrackView,
    trackClick: handleTrackClick,
  };
}

export default useAds;
