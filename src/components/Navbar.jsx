import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Heart, Menu, X, Moon, Sun } from 'lucide-react';
import api from '@/lib/axios';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [favCount, setFavCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  // Theme init
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark);

    setIsDark(shouldBeDark);
    if (shouldBeDark) document.documentElement.classList.add('dark');
  }, []);

  // ✅ Favorite count from API (Laravel)
  // GET /cars/favorites/list returns: { favorites: { total, ... } }
  const fetchFavCount = useCallback(async () => {
    try {
      const res = await api.get('/cars/favorites/list', {
        params: { page: 1, per_page: 1 } // small request; we only need "total"
      });

      const total = Number(res.data?.favorites?.total ?? 0);
      setFavCount(Number.isFinite(total) ? total : 0);
    } catch (err) {
      console.error('Fav count fetch error:', err);
      setFavCount(0);
    }
  }, []);

  useEffect(() => {
    fetchFavCount();

    const onFavUpdated = () => fetchFavCount();
    window.addEventListener('favoritesUpdated', onFavUpdated);

    return () => window.removeEventListener('favoritesUpdated', onFavUpdated);
  }, [fetchFavCount, location.pathname]);

  // Scroll shadow
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
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
    <nav
      className={`fixed top-0 left-0 right-0 z-50 glass-strong shadow-lg transition-all duration-300 ${
        scrolled ? 'backdrop-blur' : ''
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-12">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 rounded-lg bg-transparent flex items-center justify-center hover-glow">
              <img
                src="/rentologo.png"
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
            {navLinks.map((link) => (
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
            {/* Favorites */}
            <Link to="/favorites">
              <Button
                variant="ghost"
                size="icon"
                className="relative hover-glow"
                aria-label="Open favorites"
              >
                <Heart
                  className={`w-5 h-5 ${favCount > 0 ? 'fill-accent text-accent' : ''}`}
                  aria-hidden="true"
                />
                {favCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-accent-foreground text-xs font-bold rounded-full flex items-center justify-center">
                    {favCount}
                  </span>
                )}
              </Button>
            </Link>

            {/* Theme toggle (desktop) */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="hover-glow hidden sm:flex"
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <Sun className="w-5 h-5" aria-hidden="true" /> : <Moon className="w-5 h-5" aria-hidden="true" />}
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden"
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isOpen}
              aria-controls="mobile-nav"
            >
              {isOpen ? <X className="w-6 h-6" aria-hidden="true" /> : <Menu className="w-6 h-6" aria-hidden="true" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div id="mobile-nav" className="md:hidden pb-4 space-y-2">
            {navLinks.map((link) => (
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

            {/* Theme toggle (mobile) */}
            <button
              onClick={() => {
                toggleTheme();
                setIsOpen(false);
              }}
              className="w-full px-4 py-3 rounded-lg text-sm font-medium text-foreground hover:bg-muted text-left flex items-center justify-between"
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
              {isDark ? <Sun className="w-5 h-5" aria-hidden="true" /> : <Moon className="w-5 h-5" aria-hidden="true" />}
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};
