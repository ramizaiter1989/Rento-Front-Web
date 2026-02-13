import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Users, Fuel, Settings, Star, Eye, MessageSquare, MapPin, ArrowRight } from 'lucide-react';
import api from '@/lib/axios';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

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
  const { isAuthenticated } = useAuth();

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
    if (!isAuthenticated) {
      toast.error('Please log in to save favorites.');
      return;
    }

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

  // Extract data with fallbacks
  const carData = {
    id: car.id,
    image: car.main_image_url || car.image || '/placeholder.png',
    brand: car.make || car.brand || 'Car',
    model: car.model || 'Model',
    year: car.year || 'N/A',
    category: car.car_category || car.type || car.category || 'Standard',
    seats: car.seats || 4,
    transmission: car.transmission || 'Auto',
    fuelType: car.fuel_type || car.fuelType || 'Petrol',
    price: car.daily_rate || car.price || 0,
    holidayRate: car.holiday_rate || null,
    deposit: car.deposit || null,
    isDeposit: car.is_deposit || false,
    feedbacks: car.feedbacks || [],
    popular: car.popular || false,
    location: car.live_location?.address || car.location || null,
  };

  const resolveImageSrc = (rawSrc) => {
    if (!rawSrc) return '/placeholder.png';
    if (rawSrc.startsWith('data:') || /^https?:\/\//i.test(rawSrc)) return rawSrc;
    if (rawSrc.startsWith('/api/')) return rawSrc;
    if (rawSrc.startsWith('/storage/')) return `/api${rawSrc}`;
    const cleaned = rawSrc.replace(/^storage\//i, '');
    return `/api/storage/${cleaned}`;
  };

  const imageSrc = resolveImageSrc(carData.image);

  return (
    <Link to={`/cars/${carData.id}`} className="block group">
      <Card className="relative overflow-hidden h-full flex flex-col bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-[#00A19C] transition-all duration-300 hover:shadow-lg hover:shadow-[#00A19C]/20 hover:-translate-y-1 aspect-[2/3]">
        
        {/* Image Section - 60% of card height */}
        <div className="relative overflow-hidden bg-gray-100 dark:bg-gray-700" style={{ height: '60%' }}>
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 animate-pulse" />
          )}
          <img
            src={imageSrc}
            alt={`${carData.brand} ${carData.model}`}
            onLoad={() => setImageLoaded(true)}
            onError={(e) => {
              if (e.currentTarget.src.endsWith('/placeholder.png')) return;
              e.currentTarget.onerror = null;
              e.currentTarget.src = '/placeholder.png';
              setImageLoaded(true);
            }}
            className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-50 group-hover:opacity-70 transition-opacity duration-300" />

          {/* Favorite Button */}
          <button
            onClick={toggleFavorite}
            disabled={favLoading}
            aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
            className={`absolute top-1.5 right-1.5 w-7 h-7 rounded-full backdrop-blur-sm flex items-center justify-center transition-all duration-300 z-20 ${
              favorite
                ? 'bg-red-500 shadow-md'
                : 'bg-white/90 dark:bg-gray-800/90 hover:scale-110'
            } ${favLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            <Heart
              className={`w-3.5 h-3.5 transition-all ${
                favorite ? 'fill-white text-white' : 'text-gray-700 dark:text-gray-300'
              }`}
            />
          </button>

          {/* Category Badge */}
          <div className="absolute top-1.5 left-1.5 z-10">
            <Badge className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm text-[#00A19C] dark:text-[#8EDC81] border border-[#00A19C]/30 dark:border-[#8EDC81]/30 text-[10px] font-semibold px-1.5 py-0.5">
              {carData.category}
            </Badge>
          </div>

          {/* Popular Badge */}
          {carData.popular && (
            <div className="absolute bottom-1.5 left-1.5 z-10">
              <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold border-0 px-1.5 py-0.5 flex items-center gap-0.5">
                <Star className="w-2.5 h-2.5 fill-white" />
                Popular
              </Badge>
            </div>
          )}

          {/* Price Badge */}
          <div className="absolute bottom-1.5 right-1.5 z-10">
            <Badge className="bg-gradient-to-r from-[#00A19C] to-[#8EDC81] text-white text-[10px] font-bold px-1.5 py-0.5">
              ${carData.price}/day
            </Badge>
          </div>
        </div>

        {/* Content Section - 40% of card height */}
        <CardContent className="p-2 flex-grow flex flex-col" style={{ height: '40%' }}>
          {/* Brand & Model */}
          <div className="mb-1">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <p className="text-[10px] font-semibold text-[#00A19C] dark:text-[#8EDC81] uppercase tracking-wide">
                  {carData.brand}
                </p>
                <h3 className="text-xs font-bold text-gray-900 dark:text-white line-clamp-1 group-hover:text-[#00A19C] dark:group-hover:text-[#8EDC81] transition-colors">
                  {carData.model}
                </h3>
              </div>
              <div className="flex flex-col items-end gap-0.5">
                <p className="text-[9px] text-gray-500 dark:text-gray-400">{carData.year}</p>
                {carData.location && carData.location.trim() !== '' && (
                  <div className="flex items-center gap-0.5">
                    <MapPin className="w-2.5 h-2.5 text-gray-400 dark:text-gray-500" />
                    <p className="text-[9px] text-gray-500 dark:text-gray-400 line-clamp-1">{carData.location.trim()}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Specs Grid */}
          <div className="grid grid-cols-3 gap-1 mb-1">
            <div className="flex flex-col items-center p-1 rounded bg-gray-50 dark:bg-gray-700/50 group-hover:bg-[#00A19C]/10 dark:group-hover:bg-[#00A19C]/20 transition-colors">
              <Users className="w-2.5 h-2.5 text-[#00A19C] dark:text-[#8EDC81] mb-0.5" />
              <span className="text-[9px] font-semibold text-gray-700 dark:text-gray-300">
                {carData.seats}
              </span>
            </div>

            <div className="flex flex-col items-center p-1 rounded bg-gray-50 dark:bg-gray-700/50 group-hover:bg-[#00A19C]/10 dark:group-hover:bg-[#00A19C]/20 transition-colors">
              <Settings className="w-2.5 h-2.5 text-[#00A19C] dark:text-[#8EDC81] mb-0.5" />
              <span className="text-[9px] font-semibold text-gray-700 dark:text-gray-300 truncate w-full text-center">
                {carData.transmission.slice(0, 4)}
              </span>
            </div>

            <div className="flex flex-col items-center p-1 rounded bg-gray-50 dark:bg-gray-700/50 group-hover:bg-[#00A19C]/10 dark:group-hover:bg-[#00A19C]/20 transition-colors">
              <Fuel className="w-2.5 h-2.5 text-[#00A19C] dark:text-[#8EDC81] mb-0.5" />
              <span className="text-[9px] font-semibold text-gray-700 dark:text-gray-300 truncate w-full text-center">
                {carData.fuelType.slice(0, 4)}
              </span>
            </div>
          </div>

          {/* Pricing Info */}
          {(carData.holidayRate || carData.isDeposit) && (
            <div className="flex items-center gap-1 mb-1 text-[9px]">
              {carData.holidayRate && (
                <div className="flex-1 text-center p-1 bg-gradient-to-br from-[#00A19C]/10 to-[#8EDC81]/10 dark:from-[#1e5f7a]/20 dark:to-[#00A19C]/20 rounded border border-[#00A19C]/20">
                  <p className="text-gray-600 dark:text-gray-400 font-medium text-[8px] leading-tight">Holiday</p>
                  <p className="font-bold text-[#1e5f7a] dark:text-[#8EDC81] text-[10px] leading-tight">${carData.holidayRate}</p>
                </div>
              )}
              {carData.isDeposit && (
                <div className="flex-1 text-center p-1 bg-amber-50 dark:bg-amber-900/20 rounded border border-amber-200 dark:border-amber-800">
                  <p className="text-gray-600 dark:text-gray-400 font-medium text-[8px] leading-tight">Deposit</p>
                  <p className="font-bold text-amber-600 dark:text-amber-400 text-[10px] leading-tight">${carData.deposit}</p>
                </div>
              )}
            </div>
          )}

          {/* Feedback Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowFeedbacksModal(true);
            }}
            className="w-full flex items-center justify-between p-1 rounded bg-gray-50 dark:bg-gray-700/50 hover:bg-[#00A19C]/10 dark:hover:bg-[#00A19C]/20 transition-all border border-gray-200 dark:border-gray-700 hover:border-[#00A19C] group/feedback mb-1"
            aria-label="Open customer feedback"
          >
            <div className="flex items-center gap-1">
              <MessageSquare className="w-2.5 h-2.5 text-[#00A19C] dark:text-[#8EDC81]" />
              <span className="text-[9px] font-semibold text-gray-900 dark:text-white">Reviews</span>
            </div>
            <Badge className="bg-gradient-to-r from-[#00A19C] to-[#8EDC81] text-white text-[9px] font-bold px-1 py-0">
              {carData.feedbacks.length}
            </Badge>
          </button>

          {/* CTA Button */}
          <Button className="w-full bg-gradient-to-r from-[#1e5f7a] via-[#00A19C] to-[#8EDC81] hover:from-[#184a5e] hover:via-[#008c88] hover:to-[#7bc876] text-white font-bold py-1.5 text-[10px] rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] group/btn">
            <span className="flex items-center justify-center gap-1">
              <Eye className="w-2.5 h-2.5" />
              View Details
              <ArrowRight className="w-2.5 h-2.5 group-hover/btn:translate-x-0.5 transition-transform" />
            </span>
          </Button>
        </CardContent>
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
