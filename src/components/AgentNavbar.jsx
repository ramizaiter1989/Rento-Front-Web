import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  BarChart3, 
  Car, 
  Calendar, 
  Plus, 
  FileCheck,
  LogOut,
  User,
  Home,
  Wallet,
  MessageCircle,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/axios';
import { toast } from 'sonner';

export const AgentNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Scroll shadow
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await api.post('/logout');
    } catch (err) {
      console.error('Logout error:', err);
    }
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const agentTabs = [
    { 
      to: '/Dashboard', 
      label: 'Dashboard', 
      icon: LayoutDashboard 
    },
    { 
      to: '/Statistic', 
      label: 'Statistics', 
      icon: BarChart3 
    },
    { 
      to: '/Mycars', 
      label: 'My Cars', 
      icon: Car 
    },
    { 
      to: '/Mycars-bookings', 
      label: 'Bookings', 
      icon: Calendar 
    },
    { 
      to: '/BookingChat', 
      label: 'Chats', 
      icon: MessageCircle 
    },
    { 
      to: '/Balance', 
      label: 'Balance', 
      icon: Wallet 
    },
    { 
      to: '/add-car', 
      label: 'Add Car', 
      icon: Plus 
    },
    { 
      to: '/Add/car/qualification', 
      label: 'Qualifications', 
      icon: FileCheck 
    }
  ];

  const isActive = (path) => {
    if (path === '/Dashboard') {
      return location.pathname === '/Dashboard';
    }
    return location.pathname.startsWith(path);
  };

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

          {/* Desktop Navigation Tabs */}
          <div className="hidden md:flex text-primary-foreground items-center space-x-1 flex-1 justify-center">
            {agentTabs.map((tab) => (
              <Link
                key={tab.to}
                to={tab.to}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                  isActive(tab.to)
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground/80 hover:text-foreground hover:bg-muted'
                }`}
              >
                {tab.icon && <tab.icon className="w-4 h-4" />}
                {tab.label}
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-2">
            {/* Home Button */}
            <Link to="/">
              <Button
                variant="ghost"
                size="icon"
                className="hover-glow"
                aria-label="Go to home"
              >
                <Home className="w-5 h-5" />
              </Button>
            </Link>

            {/* User Info */}
            <div className="hidden md:flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 text-primary-foreground">
                <User className="w-4 h-4" />
                <span className="text-sm font-medium">{user?.username || 'Agent'}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="hover-glow hover:bg-red-500/10 hover:text-red-500"
                aria-label="Logout"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="hover-glow"
                aria-label="Menu"
              >
                {mobileMenuOpen ? (
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                ) : (
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M4 6h16M4 12h16M4 18h16"></path>
                  </svg>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 border-t border-border/40 mt-2 pt-4">
            <div className="flex flex-col space-y-2">
              {agentTabs.map((tab) => (
                <Link
                  key={tab.to}
                  to={tab.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                    isActive(tab.to)
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground/80 hover:text-foreground hover:bg-muted'
                  }`}
                >
                  {tab.icon && <tab.icon className="w-4 h-4" />}
                  {tab.label}
                </Link>
              ))}
              <div className="flex items-center gap-2 px-4 py-2 mt-2">
                <User className="w-4 h-4" />
                <span className="text-sm font-medium">{user?.username || 'Agent'}</span>
              </div>
              <Button
                variant="ghost"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full justify-start hover:bg-red-500/10 hover:text-red-500"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
