import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CarCard } from '@/components/CarCard';
import { carsData } from '@/data/carsData';
import { getFavorites } from '@/utils/localStorage';
import { Heart, ArrowRight } from 'lucide-react';

export const FavoritesPage = () => {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    updateFavorites();
    window.addEventListener('favoritesUpdated', updateFavorites);
    return () => window.removeEventListener('favoritesUpdated', updateFavorites);
  }, []);

  const updateFavorites = () => {
    const favoriteIds = getFavorites();
    const favoriteCars = carsData.filter(car => favoriteIds.includes(car.id));
    setFavorites(favoriteCars);
  };

  return (
    <div className="min-h-screen pt-20">
      {/* Header */}
      <section className="bg-gradient-to-br from-accent/5 via-secondary/5 to-primary/5 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <Badge className="mb-4 bg-accent/10 text-accent-foreground border-accent/20">
              <Heart className="w-3 h-3 mr-1 fill-current" />
              Favorites
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Your Favorite Vehicles
            </h1>
            <p className="text-lg text-muted-foreground">
              {favorites.length > 0
                ? `You have ${favorites.length} vehicle${favorites.length > 1 ? 's' : ''} in your favorites`
                : 'No favorites yet. Start exploring our fleet!'}
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {favorites.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map(car => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>
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