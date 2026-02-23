import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronRight, Car, Shield, Clock, Star } from 'lucide-react';

export const IntroPage = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      icon: Car,
      title: 'Premium Luxury Fleet',
      description: 'Access the world\'s finest vehicles. From sports cars to luxury SUVs, find your perfect ride for any occasion.',
      image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=75&fm=webp',
      gradient: 'from-primary to-secondary'
    },
    {
      icon: Shield,
      title: 'Safe & Secure',
      description: 'Every vehicle is fully insured with comprehensive coverage. Drive with complete peace of mind.',
      image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80',
      gradient: 'from-secondary to-accent'
    },
    {
      icon: Clock,
      title: '24/7 Support',
      description: 'Our dedicated team is always here to help. Book instantly and get support whenever you need it.',
      image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80',
      gradient: 'from-accent to-primary'
    },
    {
      icon: Star,
      title: 'Best Price Guarantee',
      description: 'Competitive rates with no hidden fees. Experience luxury without breaking the bank.',
      image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80',
      gradient: 'from-primary-dark to-secondary-light'
    }
  ];

  const handleGetStarted = () => {
    localStorage.setItem('hasSeenIntro', 'true');
    navigate('/auth');
  };

  const handleSkip = () => {
    localStorage.setItem('hasSeenIntro', 'true');
    navigate('/auth');
  };

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      handleGetStarted();
    }
  };

  const currentSlideData = slides[currentSlide];
  const Icon = currentSlideData.icon;

  return (
<div className="relative min-h-screen flex flex-col">

  {/* Animated Background Image */}
  <div
    className="absolute inset-0 bg-cover bg-center bg-no-repeat blur-xl opacity-90 animate-bgZoom"
    style={{ backgroundImage: "url('/intro.jpeg')" }}
  />

  {/* Dark overlay (optional for readability) */}
  <div className="absolute inset-0 bg-black/5" />

  {/* Main content */}
  <div className="relative z-10 flex-1 flex flex-col bg-gradient-to-br from-background/10 via-primary/5 to-secondary/5">


      {/* Skip Button */}
      <div className="absolute top-4 right-4 z-10">
        <Button
          variant="ghost"
          onClick={handleSkip}
          className="text-muted-foreground hover:text-foreground"
        >
          Skip
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        {/* Logo */}
        {/* <div className="mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
            <Car className="w-8 h-8 text-primary-foreground" />
          </div>
        </div> */}

        {/* Slide Content */}
        <Card className="w-full max-w-md overflow-hidden hover-glow">
          {/* Image */}
          <div className="relative aspect-[4/3] overflow-hidden">
            <img
              src={currentSlideData.image}
              alt={currentSlideData.title}
              className="w-full h-full object-cover"
            />
            <div className={`absolute inset-0 bg-gradient-to-t ${currentSlideData.gradient} opacity-40`} />
          </div>

          <CardContent className="p-8 text-center">
            {/* Icon */}
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${currentSlideData.gradient} flex items-center justify-center mx-auto mb-6`}>
              <Icon className="w-8 h-8 text-white" />
            </div>

            {/* Title */}
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              {currentSlideData.title}
            </h2>

            {/* Description */}
            <p className="text-muted-foreground mb-8 leading-relaxed">
              {currentSlideData.description}
            </p>

            {/* Progress Dots */}
            <div className="flex items-center justify-center space-x-2 mb-8">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`transition-all ${
                    index === currentSlide
                      ? 'w-8 h-2 bg-primary rounded-full'
                      : 'w-2 h-2 bg-muted rounded-full hover:bg-primary/50'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

            {/* Navigation Buttons */}
            <Button
              onClick={nextSlide}
              size="lg"
              className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white font-semibold"
            >
              {currentSlide < slides.length - 1 ? (
                <>
                  Next
                  <ChevronRight className="w-5 h-5 ml-2" />
                </>
              ) : (
                'Get Started'
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Slide Counter */}
        <p className="mt-6 text-sm text-muted-foreground">
          {currentSlide + 1} of {slides.length}
        </p>
      </div>
    </div>
      </div>
    
  );
};