/**
 * Ads Popup Component
 * Shows ads after 2 minutes of loading the website
 * User can close it, and if multiple active ads exist, displays randomly
 */

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getActiveAds, trackAdView, trackAdClick } from '@/lib/adsApi';

export default function AdsPopup() {
  const [showPopup, setShowPopup] = useState(false);
  const [currentAd, setCurrentAd] = useState(null);

  useEffect(() => {
    // Check if popup was already shown in this session
    const popupShown = sessionStorage.getItem('adsPopupShown');
    if (popupShown) return;

    // Function to fetch and display random ad
    const fetchAndShowAd = async () => {
      try {
        const activeAds = await getActiveAds();

        if (activeAds.length > 0) {
          // Select random ad
          const randomAd = activeAds[Math.floor(Math.random() * activeAds.length)];
          setCurrentAd(randomAd);
          setShowPopup(true);
          
          // Track view
          if (randomAd.id) {
            await trackAdView(randomAd.id);
          }
        }
      } catch (error) {
        console.error('Error fetching ads:', error);
      }
    };

    // Set timeout for 2 minutes (120000 ms)
    const timer = setTimeout(() => {
      fetchAndShowAd();
    }, 20000); // 2 minutes

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setShowPopup(false);
    sessionStorage.setItem('adsPopupShown', 'true');
  };

  const handleClick = async () => {
    if (currentAd?.id) {
      try {
        // Track click
        await trackAdClick(currentAd.id);
      } catch (err) {
        console.error('Error tracking ad click:', err);
      } finally {
        // Open target URL if exists
        if (currentAd.target_url) {
          window.open(currentAd.target_url, '_blank');
        }
      }
    }
  };

  if (!showPopup || !currentAd) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full mx-4 animate-scale-in">
        {/* Close Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClose}
          className="absolute top-2 right-2 z-10"
        >
          <X className="w-5 h-5" />
        </Button>

        {/* Ad Content */}
        <div className="p-6">
          {currentAd.image_url && (
            <div 
              className="cursor-pointer mb-4 rounded-lg overflow-hidden"
              onClick={handleClick}
            >
              <img
                src={currentAd.image_url.startsWith('http') 
                  ? currentAd.image_url 
                  : `/api/storage/${currentAd.image_url}`}
                alt={currentAd.ads_text || 'Advertisement'}
                className="w-full h-auto object-contain max-h-96"
              />
            </div>
          )}
          
          {currentAd.ads_text && (
            <div 
              className="text-center cursor-pointer"
              onClick={handleClick}
            >
              <p className="text-lg font-semibold mb-2">{currentAd.ads_text}</p>
            </div>
          )}

          {currentAd.target_url && (
            <div className="mt-4 text-center">
              <Button
                onClick={handleClick}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
              >
                Visit Website
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
