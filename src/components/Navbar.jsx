import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Heart, Menu, X, Moon, Sun, Car } from 'lucide-react';
import { getFavorites } from '@/utils/localStorage';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [favCount, setFavCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    
    setIsDark(shouldBeDark);
    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  useEffect(() => {
    // Update favorites count
    const updateFavCount = () => {
      setFavCount(getFavorites().length);
    };
    
    updateFavCount();
    window.addEventListener('favoritesUpdated', updateFavCount);
    
    return () => window.removeEventListener('favoritesUpdated', updateFavCount);
  }, [location]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    
    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/cars', label: 'Browse Cars' },
    { to: '/socialmedia', label: 'About' },
    { to: '/contact', label: 'Contact' }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-strong shadow-lg transition-all duration-300">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-12">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 rounded-lg bg-transparent flex items-center justify-center hover-glow">
              <img
  src="/rentologo.png" // replace with your actual path
  alt="Rento Logo"
  className="rounded-lg w-10 h-10 object-contain"
/>

            </div>
            <span className="text-xl md:text-2xl text-primary-foreground font-bold gradient-text hidden sm:block">
              RENTO LB
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex text-primary-foreground items-center space-x-1">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive(link.to)
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground/80 hover:text-foreground hover:bg-muted'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-2">
            <Link to="/favorites">
              <Button
                variant="ghost"
                size="icon"
                className="relative hover-glow"
              >
                <Heart className={`w-5 h-5 ${
                  favCount > 0 ? 'fill-accent text-accent' : ''
                }`} />
                {favCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-accent-foreground text-xs font-bold rounded-full flex items-center justify-center">
                    {favCount}
                  </span>
                )}
              </Button>
            </Link>

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="hover-glow hidden sm:flex"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  isActive(link.to)
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground/80 hover:bg-muted'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <button
              onClick={() => {
                toggleTheme();
                setIsOpen(false);
              }}
              className="w-full px-4 py-3 rounded-lg text-sm font-medium text-foreground hover:bg-muted text-left flex items-center justify-between"
            >
              <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};