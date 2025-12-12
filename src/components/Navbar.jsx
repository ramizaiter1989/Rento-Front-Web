import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Heart, Menu, X, Moon, Sun } from 'lucide-react';
import { getFavorites } from '@/utils/localStorage';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [favCount, setFavCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark);

    setIsDark(shouldBeDark);
    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  useEffect(() => {
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
    { to: '/contact', label: 'Contact' },
  ];

  // ✅ no type annotation here
  const isActive = (path) => location.pathname === path;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
        scrolled
          ? 'bg-[#020617]/95 backdrop-blur-xl border-slate-800 shadow-xl'
          : 'bg-gradient-to-b from-black/80 via-[#020617]/60 to-transparent border-transparent'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-14">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 rounded-lg bg-[#0B1120] flex items-center justify-center hover-glow border border-slate-800 shadow-md">
              <img
                src="/rentologo.png"
                alt="Rento Logo"
                className="rounded-lg w-8 h-8 object-contain"
              />
            </div>
            <span className="text-xl md:text-2xl font-bold hidden sm:block bg-gradient-to-r from-[#EAB308] via-[#FACC15] to-[#F97316] bg-clip-text text-transparent">
              RENTO LB
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1 text-[#F9FAFB]">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive(link.to)
                    ? 'bg-[#EAB308] text-[#020617] shadow-md'
                    : 'text-slate-200/80 hover:text-white hover:bg-slate-800/80'
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
                className="relative hover-glow text-slate-200 hover:text-[#EAB308]"
              >
                <Heart
                  className={`w-5 h-5 ${
                    favCount > 0 ? 'fill-[#EAB308] text-[#EAB308]' : ''
                  }`}
                />
                {favCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#EAB308] text-[#020617] text-xs font-bold rounded-full flex items-center justify-center">
                    {favCount}
                  </span>
                )}
              </Button>
            </Link>

            {/* Theme toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="hover-glow hidden sm:flex text-slate-200 hover:text-[#EAB308]"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden text-slate-200 hover:text-[#EAB308]"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden mt-2 mb-3 rounded-xl border border-slate-800 bg-[#020617]/95 shadow-xl px-2 pb-3 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  isActive(link.to)
                    ? 'bg-[#EAB308] text-[#020617] shadow-md'
                    : 'text-slate-200/80 hover:bg-slate-800/80 hover:text-white'
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
              className="w-full px-4 py-3 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800/80 flex items-center justify-between"
            >
              <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
              {isDark ? (
                <Sun className="w-5 h-5 text-[#EAB308]" />
              ) : (
                <Moon className="w-5 h-5 text-[#EAB308]" />
              )}
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};
