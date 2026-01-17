import { useState, useEffect } from 'react';

/**
 * Custom hook for authentication and role management
 * Provides user data, role checking, and authentication status
 */
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = () => {
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('authToken');
        const userData = localStorage.getItem('user');
        
        if (token && userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error loading user:', error);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    loadUser();

    // Listen for storage changes (e.g., login/logout in another tab)
    const handleStorageChange = (e) => {
      if (e.key === 'user' || e.key === 'token' || e.key === 'authToken') {
        loadUser();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const updateUser = (userData) => {
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      setIsAuthenticated(true);
    } else {
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  // Role checking helpers
  const isClient = user?.role === 'client';
  const isAgent = user?.role === 'agency' || user?.role === 'agent';
  const isAgency = user?.role === 'agency';
  const isAgentRole = user?.role === 'agent';
  const isAdmin = user?.role === 'admin';

  // Permission checking
  const hasRole = (roles) => {
    if (!user) return false;
    if (Array.isArray(roles)) {
      return roles.includes(user.role);
    }
    return user.role === roles;
  };

  const hasPermission = (permission) => {
    if (!user) return false;
    
    // Define permissions based on roles
    const permissions = {
      client: [
        'view_cars',
        'book_cars',
        'view_own_bookings',
        'manage_own_profile',
        'view_favorites'
      ],
      agency: [
        'view_cars',
        'manage_cars',
        'view_all_bookings',
        'manage_bookings',
        'view_dashboard',
        'view_statistics',
        'manage_own_profile'
      ],
      agent: [
        'view_cars',
        'manage_cars',
        'view_all_bookings',
        'manage_bookings',
        'view_dashboard',
        'view_statistics',
        'manage_own_profile'
      ]
    };

    const rolePermissions = permissions[user.role] || [];
    return rolePermissions.includes(permission);
  };

  return {
    user,
    isAuthenticated,
    loading,
    updateUser,
    logout,
    // Role checks
    isClient,
    isAgent,
    isAgency,
    isAgentRole,
    isAdmin,
    hasRole,
    hasPermission
  };
};
