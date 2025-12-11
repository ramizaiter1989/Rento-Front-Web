import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Heart, Menu, X, Moon, Sun, LogIn, LogOut } from 'lucide-react';
import { getFavorites } from '@/utils/localStorage';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [favCount, setFavCount] = useState(0);
  const location = useLocation();
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user')));

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    setIsDark(shouldBeDark);
    if (shouldBeDark) document.documentElement.classList.add('dark');
  }, []);

  useEffect(() => {
    const updateFavCount = () => setFavCount(getFavorites().length);
    updateFavCount();
    window.addEventListener('favoritesUpdated', updateFavCount);
    return () => window.removeEventListener('favoritesUpdated', updateFavCount);
  }, [location]);

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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/';
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/cars', label: 'Browse Cars' },
    { to: '/socialmedia', label: 'About' },
    { to: '/contact', label: 'Contact' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-teal-600 via-cyan-600 to-cyan-700 shadow-lg backdrop-blur-md transition-all duration-300 border-b border-white/20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-12">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center hover:animate-pulse hover:shadow-[0_0_15px_rgba(255,255,255,0.8)] transition-all duration-300">
                <img src="/rentologo.png" alt="Rento Logo" className="rounded-lg w-10 h-10 object-contain" />
              </div>
              <span className="text-xl md:text-2xl font-bold text-white hidden sm:block">
                RENTO LB
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-2 text-white">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    isActive(link.to)
                      ? 'bg-white/20 shadow-[0_0_5px_rgba(255,255,255,0.2)]'
                      : 'hover:bg-white/10 hover:shadow-[0_0_5px_rgba(255,255,255,0.2)]'
                  } glow-text`}
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
                  className="relative hover:glow-icon"
                  aria-label="Favorites"
                >
                  <Heart className={`w-5 h-5 ${favCount > 0 ? 'fill-teal-500 text-teal-500' : ''}`} />
                  {favCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-teal-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
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
                className="hover:glow-icon hidden sm:flex"
                aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>

              {/* Login / Logout */}
              {user ? (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  className="hover:glow-icon"
                  aria-label="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </Button>
              ) : (
                <Link to="/auth">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:glow-icon"
                    aria-label="Login or Register"
                  >
                    <LogIn className="w-5 h-5" />
                  </Button>
                </Link>
              )}

              {/* Mobile Menu */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden hover:glow-icon"
                aria-label={isOpen ? "Close Menu" : "Open Menu"}
              >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isOpen && (
            <div className="md:hidden pb-4 space-y-2 text-white">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 hover:shadow-[0_0_5px_rgba(255,255,255,0.2)] glow-text"
                >
                  {link.label}
                </Link>
              ))}

              {/* Login/Logout mobile */}
              {user ? (
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-3 rounded-lg text-sm font-medium text-white hover:shadow-[0_0_5px_rgba(255,255,255,0.2)] glow-text flex items-center justify-between"
                >
                  <span>Logout</span>
                  <LogOut className="w-5 h-5" />
                </button>
              ) : (
                <Link to="/auth">
                  <button
                    className="w-full px-4 py-3 rounded-lg text-sm font-medium text-white hover:shadow-[0_0_5px_rgba(255,255,255,0.2)] glow-text flex items-center justify-between"
                    onClick={() => setIsOpen(false)}
                  >
                    <span>Login / Register</span>
                    <LogIn className="w-5 h-5" />
                  </button>
                </Link>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Inline CSS for glow */}
      <style>{`
        .glow-text {
          text-shadow: 0 0 5px #fff, 0 0 5px #fff, 0 0 2px #7f00ff, 0 0 5px #7f00ff;
        }
        .hover\\:glow-icon:hover {
          box-shadow: 0 0 5px #fff, 0 0 10px #7f00ff, 0 0 2px #7f00ff, 0 0 5px #7f00ff;
          transition: box-shadow 0.3s ease-in-out;
        }
      `}</style>
    </>
  );
};
