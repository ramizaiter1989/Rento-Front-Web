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
 * CarCard:
 * - Favorite toggle via API: POST /cars/{id}/favorite
 * - Optional props:
 *    - forceFavorite: boolean
 *    - onToggleFavoriteApi: function
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
    setFavorite(next); // optimistic
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
      <Card className="relative overflow-hidden h-full flex flex-col bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border-2 border-transparent hover:border-cyan-700/40 transition-all duration-500 hover:shadow-2xl hover:shadow-cyan-950/30 hover:-translate-y-2">
        {/* Animated Background Gradient (darker cyan 700 feel) */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-700/12 via-cyan-700/6 to-teal-600/6 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Image Section */}
        <div className="relative overflow-hidden aspect-[16/10] bg-gradient-to-br from-cyan-200 to-teal-100 dark:from-cyan-950/40 dark:to-teal-950/25">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 animate-pulse" />
          )}

          <img
            src={car.image || '/placeholder.png'}
            alt={`${car.brand || car.make || ''} ${car.model || ''}`}
            onLoad={() => setImageLoaded(true)}
            className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:rotate-1 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Favorite Button */}
          <button
            onClick={toggleFavorite}
            disabled={favLoading}
            aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
            className={`absolute top-4 right-4 w-11 h-11 rounded-full backdrop-blur-md flex items-center justify-center transition-all duration-300 z-20 ${
              favorite
                ? 'bg-gradient-to-br from-red-500 to-pink-500 scale-110 shadow-lg shadow-red-500/50'
                : 'bg-white/90 dark:bg-gray-800/90 hover:scale-110 hover:shadow-lg hover:shadow-cyan-950/30'
            } ${favLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            <Heart
              className={`w-5 h-5 transition-all duration-300 ${
                favorite ? 'fill-white text-white scale-110' : 'text-gray-700 dark:text-gray-300'
              }`}
            />
          </button>

          {/* Type Badge */}
          {(car.type || car.category) && (
            <div className="absolute top-4 left-4 z-10">
              <Badge className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md text-gray-900 dark:text-white border-0 px-3 py-1.5 font-semibold shadow-lg">
                {car.type || car.category}
              </Badge>
            </div>
          )}

          {/* Popular */}
          {car.popular && (
            <div className="absolute bottom-4 left-4 z-10">
              <Badge className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white border-0 px-3 py-1.5 font-bold shadow-lg flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 fill-white" />
                Popular
              </Badge>
            </div>
          )}

          {/* View Details overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 z-10">
            <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm px-6 py-3 rounded-full transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 shadow-xl">
              <span className="font-bold text-cyan-800 dark:text-cyan-200 flex items-center gap-2">
                <Eye className="w-4 h-4" />
                View Details
              </span>
            </div>
          </div>
        </div>

        <CardContent className="p-6 flex-grow relative z-10">
          {/* Brand & Model */}
          <div className="mb-4">
            <p className="text-sm font-medium text-cyan-800 dark:text-cyan-200 mb-1">
              {car.brand || car.make || 'Car'}
            </p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-cyan-800 dark:group-hover:text-cyan-200 transition-colors duration-300">
              {car.model}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-1">
              Year {car.year}
            </p>
          </div>

          {/* Specs Grid */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="flex flex-col items-center p-3 rounded-xl bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-950/35 dark:to-cyan-900/20 group-hover:from-cyan-100 group-hover:to-cyan-200 dark:group-hover:from-cyan-900/30 dark:group-hover:to-cyan-800/20 transition-all duration-300">
              <Users className="w-5 h-5 text-cyan-800 dark:text-cyan-200 mb-1" />
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                {car.seats} Seats
              </span>
            </div>

            <div className="flex flex-col items-center p-3 rounded-xl bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-950/35 dark:to-cyan-900/20 group-hover:from-cyan-100 group-hover:to-cyan-200 dark:group-hover:from-cyan-900/30 dark:group-hover:to-cyan-800/20 transition-all duration-300">
              <Settings className="w-5 h-5 text-cyan-800 dark:text-cyan-200 mb-1" />
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                {car.transmission}
              </span>
            </div>

            <div className="flex flex-col items-center p-3 rounded-xl bg-gradient-to-br from-teal-50 to-cyan-100 dark:from-teal-950/25 dark:to-cyan-950/30 group-hover:from-teal-100 group-hover:to-cyan-200 dark:group-hover:from-teal-900/20 dark:group-hover:to-cyan-900/25 transition-all duration-300">
              <Fuel className="w-5 h-5 text-cyan-800 dark:text-cyan-200 mb-1" />
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                {car.fuelType ?? car.fuel_type ?? 'N/A'}
              </span>
            </div>
          </div>

          {/* Feedback Section */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowFeedbacksModal(true);
            }}
            className="w-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:border-cyan-700/30 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Open customer feedback"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-cyan-800 dark:text-cyan-200" />
                Customer Feedback
              </p>
              <Badge className="bg-cyan-100 dark:bg-cyan-950/40 text-cyan-800 dark:text-cyan-200 border-0">
                {car.feedbacks?.length || 0}
              </Badge>
            </div>
          </button>
        </CardContent>

        <CardFooter className="p-6 pt-0 flex items-center justify-between mt-auto relative z-10 border-t border-gray-100 dark:border-gray-800">
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">From</p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold bg-gradient-to-r from-cyan-700 via-cyan-600 to-teal-600 bg-clip-text text-transparent">
                ${car.price}
              </span>
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">/day</span>
            </div>
          </div>

          <Button
            className="bg-gradient-to-r from-cyan-700 via-cyan-600 to-teal-600 hover:from-cyan-800 hover:via-cyan-700 hover:to-teal-700 text-white font-bold px-6 py-6 rounded-xl shadow-lg hover:shadow-xl hover:shadow-cyan-950/35 transition-all duration-300 hover:scale-105"
            aria-label="View car details"
          >
            View Details
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
