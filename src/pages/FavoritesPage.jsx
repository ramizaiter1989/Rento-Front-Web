import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CarCard } from '@/components/CarCard';
import { Heart, ArrowRight, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '@/lib/axios';
import { toast } from 'sonner';

export const FavoritesPage = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 20,
    total: 0,
    next_page_url: null,
    prev_page_url: null
  });

  const mapCar = (carData) => {
    const feedbacks = carData.feedbacks ?? [];
    const rating =
      feedbacks.length > 0
        ? (
            feedbacks.reduce((sum, f) => sum + (Number(f.rating) || 0), 0) / feedbacks.length
          ).toFixed(1)
        : null;

    return {
      id: carData.id,

      // naming compatibility
      make: carData.make,
      brand: carData.make,
      model: carData.model,
      year: carData.year,
      type: carData.car_category,
      category: carData.car_category,

      seats: carData.seats,
      doors: carData.doors,
      transmission: carData.transmission,

      // keep BOTH because your UI sometimes uses fuel_type
      fuelType: carData.fuel_type,
      fuel_type: carData.fuel_type,

      drive: carData.wheels_drive,
      cylinders: carData.cylinder_number,
      mileage: carData.mileage,
      color: carData.color,

      dailyRate: Number(carData.daily_rate),
      holidayRate: Number(carData.holiday_rate),
      price: Number(carData.daily_rate),

      hasDeposit: !!carData.is_deposit,
      deposit: Number(carData.deposit),

      maxMileage: carData.max_driving_mileage,
      minDays: carData.min_rental_days,

      withDriver: !!carData.with_driver,
      driverFees: Number(carData.driver_fees),

      location: carData.live_location?.address ?? 'N/A',

      isDelivered: !!carData.is_delivered,
      deliveryFees: Number(carData.delivery_fees),

      description: carData.notes ?? '',
      features: carData.features ?? [],
      addons: carData.car_add_on ?? [],

      rating,
      reviews: feedbacks.length,
      feedbacks,

      images: [
        carData.main_image_url,
        carData.front_image_url,
        carData.back_image_url,
        carData.left_image_url,
        carData.right_image_url
      ].filter(Boolean),

      image: carData.main_image_url || carData.front_image_url || ''
    };
  };

  const fetchFavorites = useCallback(async (pageToLoad = 1) => {
    setLoading(true);
    try {
      const res = await api.get('/cars/favorites/list', { params: { page: pageToLoad } });
      const fav = res.data?.favorites;

      const cars = (fav?.data ?? []).map(mapCar);

      setFavorites(cars);
      setPagination({
        current_page: fav?.current_page ?? pageToLoad,
        last_page: fav?.last_page ?? 1,
        per_page: fav?.per_page ?? 20,
        total: fav?.total ?? cars.length,
        next_page_url: fav?.next_page_url ?? null,
        prev_page_url: fav?.prev_page_url ?? null
      });
      setPage(fav?.current_page ?? pageToLoad);
    } catch (err) {
      console.error('Favorites fetch error:', err);
      toast.error('Failed to load favorites. Please try again.');
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ API remove/toggle favorite (used by CarCard heart)
  const toggleFavorite = useCallback(
    async (carId) => {
      // Optimistic remove (we are in Favorites page)
      const prev = favorites;
      setFavorites((cur) => cur.filter((c) => c.id !== carId));

      try {
        await api.post(`/cars/${carId}/favorite`);
        toast.success('Removed from favorites');
        window.dispatchEvent(new Event('favoritesUpdated'));
        // refetch current page to keep pagination correct
        fetchFavorites(page);
      } catch (err) {
        console.error('Toggle favorite error:', err);
        toast.error('Failed to update favorite. Please try again.');
        setFavorites(prev); // rollback
      }
    },
    [favorites, fetchFavorites, page]
  );

  useEffect(() => {
    fetchFavorites(1);

    const onFavUpdated = () => fetchFavorites(page);
    window.addEventListener('favoritesUpdated', onFavUpdated);

    return () => window.removeEventListener('favoritesUpdated', onFavUpdated);
  }, [fetchFavorites, page]);

  const countText = useMemo(() => {
    if (loading) return 'Loading your favorites...';
    if (pagination.total === 0) return 'No favorites yet. Start exploring our fleet!';
    return `You have ${pagination.total} vehicle${pagination.total > 1 ? 's' : ''} in your favorites`;
  }, [loading, pagination.total]);

  const canPrev = pagination.prev_page_url && page > 1;
  const canNext = pagination.next_page_url && page < pagination.last_page;

  return (
    <div className="min-h-screen pt-20">
      {/* Header */}
      <section className="bg-gradient-to-br from-accent/5 via-secondary/5 to-primary/5 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 flex-wrap">
              <Badge className="mb-2 bg-accent/10 text-accent-foreground border-accent/20">
                <Heart className="w-3 h-3 mr-1 fill-current" />
                Favorites
              </Badge>

              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchFavorites(page)}
                disabled={loading}
                aria-label="Refresh favorites"
                className="mb-2"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-4">Your Favorite Vehicles</h1>
            <p className="text-lg text-muted-foreground">{countText}</p>

            {!loading && pagination.total > 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                Page {pagination.current_page} of {pagination.last_page}
              </p>
            )}
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="p-6">
                <div className="h-40 rounded-xl bg-muted animate-pulse mb-4" />
                <div className="h-4 bg-muted rounded animate-pulse w-2/3 mb-2" />
                <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
              </Card>
            ))}
          </div>
        ) : favorites.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((car) => (
                <CarCard
                  key={car.id}
                  car={car}
                  forceFavorite
                  onToggleFavoriteApi={() => toggleFavorite(car.id)}
                />
              ))}
            </div>

            {/* Pagination */}
            {(pagination.last_page ?? 1) > 1 && (
              <div className="flex items-center justify-center gap-3 mt-10">
                <Button
                  variant="outline"
                  onClick={() => fetchFavorites(page - 1)}
                  disabled={!canPrev || loading}
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Prev
                </Button>

                <span className="text-sm text-muted-foreground">
                  Page <span className="font-semibold">{pagination.current_page}</span> /{' '}
                  <span className="font-semibold">{pagination.last_page}</span>
                </span>

                <Button
                  variant="outline"
                  onClick={() => fetchFavorites(page + 1)}
                  disabled={!canNext || loading}
                  aria-label="Next page"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <Card className="p-12 text-center max-w-2xl mx-auto">
            <div className="w-24 h-24 rounded-full bg-muted mx-auto mb-6 flex items-center justify-center">
              <Heart className="w-12 h-12 text-muted-foreground" />
            </div>
            <h2 className="text-3xl font-bold mb-4">No Favorites Yet</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Start adding vehicles to your favorites to keep track of the cars you love.
              Click the heart icon on any vehicle card to add it here.
            </p>
            <Link to="/cars">
              <Button size="lg" className="bg-primary hover:bg-primary-light text-primary-foreground">
                Browse Our Fleet
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </Card>
        )}
      </div>
    </div>
  );
};
