import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Star, Users, Fuel, Settings } from 'lucide-react';
import { isFavorite, addToFavorites, removeFromFavorites } from '@/utils/localStorage';

export const CarCard = ({ car }) => {
  const [favorite, setFavorite] = useState(false);

  useEffect(() => {
    setFavorite(isFavorite(car.id));
  }, [car.id]);

  const toggleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (favorite) {
      removeFromFavorites(car.id);
      setFavorite(false);
    } else {
      addToFavorites(car.id);
      setFavorite(true);
    }
    
    // Dispatch event to update navbar count
    window.dispatchEvent(new Event('favoritesUpdated'));
  };

  return (
    <Link to={`/cars/${car.id}`}>
      <Card className="group overflow-hidden hover-glow transition-all h-full flex flex-col">
        {/* Image */}
        <div className="relative overflow-hidden aspect-[4/3]">
          <img
            src={car.image}
            alt={`${car.brand} ${car.model}`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          
          {/* Favorite Button */}
          <button
            onClick={toggleFavorite}
            className="absolute top-3 right-3 w-10 h-10 rounded-full glass-strong backdrop-blur-md flex items-center justify-center transition-all hover:scale-110 z-10"
          >
            <Heart
              className={`w-5 h-5 transition-all ${
                favorite
                  ? 'fill-accent text-accent'
                  : 'text-white'
              }`}
            />
          </button>

          {/* Type Badge */}
          <div className="absolute top-3 left-3">
            <Badge variant="secondary" className="glass-strong backdrop-blur-md text-white border-white/20">
              {car.type}
            </Badge>
          </div>

          {/* Popular Badge */}
          {car.popular && (
            <div className="absolute bottom-3 left-3">
              <Badge className="bg-accent text-accent-foreground font-semibold">
                Popular
              </Badge>
            </div>
          )}
        </div>

        <CardContent className="p-5 flex-grow">
          {/* Brand & Model */}
          <div className="mb-3">
            <p className="text-sm text-muted-foreground">{car.brand}</p>
            <h3 className="text-xl font-bold mt-1 group-hover:text-primary transition-colors">
              {car.model}
            </h3>
          </div>

          {/* Rating */}
          <div className="flex items-center space-x-1 mb-4">
            <Star className="w-4 h-4 fill-accent text-accent" />
            <span className="font-semibold">{car.rating}</span>
            <span className="text-sm text-muted-foreground">({car.reviews} reviews)</span>
          </div>

          {/* Specs */}
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
            <div className="flex items-center space-x-1">
              <Users className="w-4 h-4" />
              <span>{car.seats}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Settings className="w-4 h-4" />
              <span>{car.transmission}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Fuel className="w-4 h-4" />
              <span>{car.fuelType}</span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="p-5 pt-0 flex items-center justify-between mt-auto">
          <div>
            <p className="text-sm text-muted-foreground">From</p>
            <p className="text-2xl font-bold gradient-text-accent">
              ${car.price}
              <span className="text-sm font-normal text-muted-foreground">/day</span>
            </p>
          </div>
          <Button className="bg-primary hover:bg-primary-light text-primary-foreground">
            View Details
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
};