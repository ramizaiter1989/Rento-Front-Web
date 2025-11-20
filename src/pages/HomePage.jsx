import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CarCard } from '@/components/CarCard';
import { featuredCars, testimonials } from '@/data/carsData';
import {
  Search,
  MapPin,
  Calendar,
  Car,
  Shield,
  Clock,
  DollarSign,
  Star,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

export const HomePage = () => {
  const [searchData, setSearchData] = useState({
    location: '',
    pickupDate: '',
    returnDate: ''
  });

  const handleSearch = (e) => {
    e.preventDefault();
    // In a real app, this would navigate to /cars with search params
    window.location.href = '/cars';
  };

  const features = [
    {
      icon: Shield,
      title: 'Premium Insurance',
      description: 'Comprehensive coverage included with every rental for your peace of mind'
    },
    {
      icon: Clock,
      title: '24/7 Support',
      description: 'Round-the-clock customer service to assist you whenever you need'
    },
    {
      icon: DollarSign,
      title: 'Best Price Guarantee',
      description: 'Competitive rates with no hidden fees or surprises'
    },
    {
      icon: Car,
      title: 'Premium Fleet',
      description: 'Exclusive selection of luxury and high-performance vehicles'
    }
  ];

  const stats = [
    { value: '10K+', label: 'Happy Customers' },
    { value: '50+', label: 'Luxury Vehicles' },
    { value: '15', label: 'Years Experience' },
    { value: '99%', label: 'Satisfaction Rate' }
  ];

  return (
    
    <div className="min-h-screen">
<section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
  <style>{`
    .cosmic-sparkle {
      position: absolute;
      inset: 0;
      z-index: 1;
      pointer-events: none;
      overflow: hidden;
    }

    .sparkle {
      position: absolute;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: linear-gradient(
        to right,
        transparent,
        rgba(255, 255, 255, 0.9),
        transparent
      );
      filter: drop-shadow(0 0 14px rgba(255, 255, 255, 0.9));
      animation: sparkleAnimation 1s linear infinite;
    }

    @keyframes sparkleAnimation {
      0% {
        transform: translate(0, 0) scale(0);
        opacity: 1;
      }
      10% {
        opacity: 0.9;
      }
      100% {
        transform: translate(200px, 150px) scale(2);
        opacity: 1;
      }
    }
  `}</style>

  <div className="absolute inset-0 z-0">
    <img
      src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1920&q=80"
      alt="Luxury Car with Cosmic Sparkle"
      className="w-full h-full object-cover"
    />
    <div className="cosmic-sparkle">
      {[...Array(30)].map((_, i) => (
        <div
          key={i}
          className="sparkle"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            width: `${Math.random() * 2 + 0.5}px`,
            height: `${Math.random() * 3 + 1}px`,
            animationDelay: `${Math.random() * 4}s`,
            animationDuration: `${Math.random() * 3 + 2}s`,
            transform: `rotate(${Math.random() * 360}deg)`,
          }}
        />
      ))}
    </div>
    <div className="absolute inset-0 bg-gradient-to-r from-primary-dark/80 via-primary/60 to-transparent" />
  </div>

  <div className="container mx-auto px-4 relative z-10 pt-20">
    {/* Rest of your hero section content */}
    <div className="max-w-3xl">
      <Badge className="mb-6 bg-accent/90 text-accent-foreground backdrop-blur-sm">
        Premium Car Rental Service
      </Badge>

      <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
        Experience Luxury
        <span className="block mt-2 text-accent">On Every Journey</span>
      </h1>

      <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-2xl">
        Drive the world's most prestigious vehicles. From sports cars to luxury SUVs,
        find your perfect ride for any occasion.
      </p>
      {/* Search Form */}
      <Card className="glass-strong backdrop-blur-md border-white/20 p-6">
        <form onSubmit={handleSearch}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Location"
                value={searchData.location}
                onChange={(e) => setSearchData({ ...searchData, location: e.target.value })}
                className="pl-10 bg-background/50 backdrop-blur-sm"
              />
            </div>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="date"
                placeholder="Pickup Date"
                value={searchData.pickupDate}
                onChange={(e) => setSearchData({ ...searchData, pickupDate: e.target.value })}
                className="pl-10 bg-background/50 backdrop-blur-sm"
              />
            </div>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="date"
                placeholder="Return Date"
                value={searchData.returnDate}
                onChange={(e) => setSearchData({ ...searchData, returnDate: e.target.value })}
                className="pl-10 bg-background/50 backdrop-blur-sm"
              />
            </div>
          </div>
          <Button
            type="submit"
            size="lg"
            className="w-full bg-secondary hover:bg-secondary-light text-secondary-foreground font-semibold"
          >
            <Search className="w-5 h-5 mr-2" />
            Search Available Cars
          </Button>
        </form>
      </Card>
    </div>
    {/* Scroll Indicator */}
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
      <div className="w-6 h-10 rounded-full border-2 border-white/50 flex items-start justify-center p-2">
        <div className="w-1 h-3 bg-white/50 rounded-full" />
      </div>
    </div>
  </div>
</section>




      {/* Stats Section */}
      <section className="py-12 bg-card border-y border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-3xl md:text-4xl font-bold gradient-text-accent mb-2">
                  {stat.value}
                </p>
                <p className="text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Cars Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-secondary/10 text-secondary border-secondary/20">
              Our Fleet
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Featured Luxury Vehicles
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore our handpicked selection of premium vehicles, ready to elevate your driving experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {featuredCars.slice(0, 6).map(car => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>

          <div className="text-center">
            <Link to="/cars">
              <Button size="lg" className="bg-primary hover:bg-primary-light text-primary-foreground">
                View All Vehicles
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-accent/10 text-accent-foreground border-accent/20">
              Why Choose Us
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Premium Service, Unforgettable Experience
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We're committed to providing exceptional service and the finest vehicles for your journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover-glow transition-all">
                <CardContent className="pt-8 pb-8">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-secondary/10 text-secondary border-secondary/20">
              Testimonials
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              What Our Customers Say
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Real experiences from our valued customers who trust us for their luxury car needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map(testimonial => (
              <Card key={testimonial.id} className="hover-glow transition-all">
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-6 line-clamp-4">
                    "{testimonial.comment}"
                  </p>
                  <div className="flex items-center space-x-3">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary via-primary-light to-secondary relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent rounded-full blur-3xl" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Ready to Experience Luxury?
            </h2>
            <p className="text-lg text-white/90 mb-8">
              Book your dream car today and enjoy an unforgettable driving experience
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/cars">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-semibold">
                  Browse Our Fleet
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};