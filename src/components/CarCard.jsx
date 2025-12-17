import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Users, Fuel, Settings, Star, Eye, MessageSquare } from 'lucide-react';
import api from '@/lib/axios';
import { toast } from 'sonner';

// Modal Component for Feedbacks
const FeedbacksModal = ({ feedbacks, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Customer Feedback</h3>
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            aria-label="Close feedbacks"
          >
            ✕
          </button>
        </div>

        {feedbacks && feedbacks.length > 0 ? (
          <ul className="space-y-4">
            {feedbacks.map((fb, index) => (
              <li key={index} className="border-b border-gray-200 dark:border-gray-700 pb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {fb.rating ? `${fb.rating}/5` : 'N/A'}
                  </span>
                </div>
                <p className="text-gray-700 dark:text-gray-300">
                  {fb.comments || 'No comment provided.'}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 italic">No feedback yet.</p>
        )}
      </div>
    </div>
  );
};

/**
 * CarCard - Compact Design
 */
export const CarCard = ({ car, forceFavorite = false, onToggleFavoriteApi }) => {
  const [favorite, setFavorite] = useState(false);
  const [favLoading, setFavLoading] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showFeedbacksModal, setShowFeedbacksModal] = useState(false);

  useEffect(() => {
    if (forceFavorite) {
      setFavorite(true);
      return;
    }
    setFavorite(false);
  }, [car?.id, forceFavorite]);

  const toggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!car?.id || favLoading) return;

    if (onToggleFavoriteApi) return onToggleFavoriteApi();

    const next = !favorite;
    setFavorite(next);
    setFavLoading(true);

    try {
      await api.post(`/cars/${car.id}/favorite`);
      toast.success(next ? 'Added to favorites' : 'Removed from favorites');
      window.dispatchEvent(new Event('favoritesUpdated'));
    } catch (err) {
      console.error('Favorite toggle error:', err);
      setFavorite(!next);
      toast.error('Failed to update favorite. Please try again.');
    } finally {
      setFavLoading(false);
    }
  };

  return (
    <Link to={`/cars/${car.id}`} className="block group">
      <Card className="relative overflow-hidden h-full flex flex-col bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-cyan-500 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20 hover:-translate-y-1">
        
        {/* Image Section - Reduced height */}
        <div className="relative overflow-hidden aspect-[16/9] bg-gray-100 dark:bg-gray-800">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 animate-pulse" />
          )}
          <img
            src={car.image || '/placeholder.png'}
            alt={`${car.brand || car.make || ''} ${car.model || ''}`}
            onLoad={() => setImageLoaded(true)}
            className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />

          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Favorite Button - Smaller */}
          <button
            onClick={toggleFavorite}
            disabled={favLoading}
            aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
            className={`absolute top-2 right-2 w-8 h-8 rounded-full backdrop-blur-md flex items-center justify-center transition-all duration-300 z-20 ${
              favorite
                ? 'bg-red-500 shadow-md'
                : 'bg-white/90 dark:bg-gray-800/90 hover:scale-110'
            } ${favLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            <Heart
              className={`w-4 h-4 transition-all ${
                favorite ? 'fill-white text-white' : 'text-gray-700 dark:text-gray-300'
              }`}
            />
          </button>

          {/* Type Badge - Smaller */}
          {(car.type || car.category) && (
            <div className="absolute top-2 left-2 z-10">
              <Badge className="bg-white/95 dark:bg-gray-800/95 text-xs text-gray-900 dark:text-white border-0 px-2 py-0.5">
                {car.type || car.category}
              </Badge>
            </div>
          )}

          {/* Popular Badge - Smaller */}
          {car.popular && (
            <div className="absolute bottom-2 left-2 z-10">
              <Badge className="bg-amber-500 text-white text-xs border-0 px-2 py-0.5 flex items-center gap-1">
                <Star className="w-3 h-3 fill-white" />
                Popular
              </Badge>
            </div>
          )}
        </div>

        {/* Content - Compact padding */}
        <CardContent className="p-3 flex-grow">
          {/* Brand & Model - Reduced spacing */}
          <div className="mb-2">
            <p className="text-xs font-medium text-cyan-700 dark:text-cyan-300">
              {car.brand || car.make || 'Car'}
            </p>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1 group-hover:text-cyan-700 transition-colors">
              {car.model}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {car.year}
            </p>
          </div>

          {/* Specs Grid - Compact */}
          <div className="grid grid-cols-3 gap-2 mb-2">
            <div className="flex flex-col items-center p-2 rounded-lg bg-gray-50 dark:bg-gray-800 group-hover:bg-cyan-50 dark:group-hover:bg-cyan-900/20 transition-colors">
              <Users className="w-4 h-4 text-cyan-700 dark:text-cyan-300 mb-0.5" />
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                {car.seats}
              </span>
            </div>

            <div className="flex flex-col items-center p-2 rounded-lg bg-gray-50 dark:bg-gray-800 group-hover:bg-cyan-50 dark:group-hover:bg-cyan-900/20 transition-colors">
              <Settings className="w-4 h-4 text-cyan-700 dark:text-cyan-300 mb-0.5" />
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate w-full text-center">
                {car.transmission}
              </span>
            </div>

            <div className="flex flex-col items-center p-2 rounded-lg bg-gray-50 dark:bg-gray-800 group-hover:bg-cyan-50 dark:group-hover:bg-cyan-900/20 transition-colors">
              <Fuel className="w-4 h-4 text-cyan-700 dark:text-cyan-300 mb-0.5" />
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate w-full text-center">
                {car.fuelType ?? car.fuel_type ?? 'N/A'}
              </span>
            </div>
          </div>

          {/* Feedback - Inline compact */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowFeedbacksModal(true);
            }}
            className="w-full flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Open customer feedback"
          >
            <div className="flex items-center gap-2">
              <MessageSquare className="w-3.5 h-3.5 text-cyan-700 dark:text-cyan-300" />
              <span className="text-xs font-medium text-gray-900 dark:text-white">Feedback</span>
            </div>
            <Badge className="bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300 text-xs px-1.5 py-0">
              {car.feedbacks?.length || 0}
            </Badge>
          </button>
        </CardContent>

        {/* Footer - Compact */}
        <CardFooter className="p-3 pt-0 flex items-center justify-between border-t border-gray-100 dark:border-gray-800">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-cyan-700 dark:text-cyan-400">
                ${car.price}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">/day</span>
            </div>
          </div>

          <Button
            size="sm"
            className="bg-cyan-700 hover:bg-cyan-800 text-white font-semibold px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
            aria-label="View car details"
          >
            Details
          </Button>
        </CardFooter>
      </Card>

      {showFeedbacksModal && (
        <FeedbacksModal
          feedbacks={car.feedbacks || []}
          onClose={() => setShowFeedbacksModal(false)}
        />
      )}
    </Link>
  );
};
