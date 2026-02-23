/**
 * Admin Panel Page
 * 
 * This component implements the Admin Dashboard following the Admin Dashboard API Documentation.
 * All API endpoints used in this component are documented and follow the specification:
 * 
 * Base URL: /api/admin
 * Authentication: Bearer Token (automatically added via axios interceptor)
 * 
 * API Endpoints Used:
 * - GET /admin/reports/summary - Get summary statistics
 * - GET /admin/reports/statistics - Get detailed statistics
 * - GET /admin/reports/chart-data - Get chart data for analytics
 * - GET /admin/logs - Get system logs
 * - GET /admin/users - Get all users (with filters: role, status, per_page)
 * - GET /admin/users/{id} - Get user details
 * - PUT /admin/users/{id} - Update user
 * - DELETE /admin/users/{id} - Soft delete user
 * - DELETE /admin/users/{id}/force - Force delete user
 * - GET /admin/cars - Get all cars (with filters: status, car_accepted, agent_id, per_page)
 * - GET /admin/cars/{id} - Get car details
 * - PUT /admin/cars/{id} - Update car
 * - DELETE /admin/cars/{id} - Delete car
 * - GET /admin/bookings - Get all bookings (with filters: status, per_page)
 * - GET /admin/bookings/{id} - Get booking details
 * - PUT /admin/bookings/{id} - Update booking
 * - POST /admin/bookings/{id}/force-complete - Force complete booking
 * - GET /admin/payments - Get all payments (with filters: type, per_page)
 * - POST /admin/refunds/{id} - Process refund (id is invoice ID)
 * - GET /admin/announcements - Get all announcements (with filters: status, per_page)
 * - GET /admin/announcements/{id} - Get announcement details
 * - POST /admin/announcements - Create announcement
 * - PUT /admin/announcements/{id} - Update announcement
 * - DELETE /admin/announcements/{id} - Delete announcement
 * - GET /admin/appeals - Get all appeals (with filters: status, priority, per_page)
 * - GET /admin/appeals/{id} - Get appeal details
 * - PUT /admin/appeals/{id} - Update appeal
 * - GET /admin/ads - Get all ads (with filters: status, per_page)
 * - GET /admin/ads/{id} - Get ad details
 * - PUT /admin/ads/{id} - Update ad
 * - DELETE /admin/ads/{id} - Delete ad
 * - GET /admin/featured-cars - Get all featured cars (with filters: status, per_page)
 * - DELETE /admin/featured-cars/{id} - Delete featured car
 * - GET /admin/holidays - Get all holidays (with filters: car_id, active, per_page)
 * - GET /admin/holidays/{id} - Get holiday details
 * - POST /admin/holidays - Create holiday
 * - PUT /admin/holidays/{id} - Update holiday
 * - DELETE /admin/holidays/{id} - Delete holiday
 * - GET /admin/suggestions - Get all suggestions (with filters: status, per_page)
 * - PUT /admin/suggestions/{id} - Update suggestion status
 * - DELETE /admin/suggestions/{id} - Delete suggestion
 * - GET /admin/notifications - Get all notifications (with filters: type, is_read, per_page)
 * - POST /admin/notifications/send-to-all - Send notification to all users
 * 
 * All endpoints require:
 * - Authorization: Bearer {token} header (automatically added)
 * - Accept: application/json header (automatically added)
 * - Content-Type: application/json header (automatically added)
 * 
 * Pagination: Uses Laravel standard pagination with `page` and `per_page` query parameters.
 * Default per_page: 50 items per page.
 */
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Car, Calendar, DollarSign, Bell, FileText, AlertCircle, 
  Megaphone, Star, CalendarDays, Lightbulb, BarChart3, Settings,
  Search, Filter, RefreshCw, Edit, Trash2, Eye, CheckCircle2, XCircle,
  TrendingUp, TrendingDown, Activity, Shield, CreditCard, MessageSquare,
  Plus, Download, Upload, MoreVertical, ChevronRight, LogOut, Home, UserCheck, KeyRound,
  Briefcase, Package, Building2, MessageCircle, Tag
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import api from '@/lib/axios';
import { 
  getOtps, 
  createAd, 
  issuePayment, 
  createFeaturedCar, 
  getAgentFeeSummary,
  getAgentFeePercentage,
  setAgentFeePercentage,
  getCar,
  getCars,
  getUsers,
  getPayments,
  getNotifications,
  updateCar as updateCarApi,
  getAdminServices,
  getAdminService,
  createAdminServiceForThirdParty,
  updateAdminService,
  deleteAdminService,
  getAdminServiceItems,
  createAdminServiceItem,
  updateAdminServiceItem,
  deleteAdminServiceItem,
  getAdminThirdParties,
  createAdminThirdParty,
  updateAdminThirdParty,
  deleteAdminThirdParty,
  getAdminFeedbacks,
  deleteAdminFeedback,
  // Promo codes & broker referrals
  getPromoCodes,
  createPromoCode,
  updatePromoCode,
  deletePromoCode,
  getPromoCodeUsers,
  getBrokerReferrals,
  createBroker,
  getBrokerBalance,
  getBrokerPayouts,
  getBrokerCommissions,
  createBrokerPayout,
  getBrokerCommissionsList,
  cancelBrokerCommission,
  deleteBrokerReferral
} from '@/lib/adminApi';
import { exportToExcel, exportTableToPDF } from '@/utils/exportUtils';
import AdForm from '@/components/admin/AdForm';
import PaymentForm from '@/components/admin/PaymentForm';
import FeaturedCarForm from '@/components/admin/FeaturedCarForm';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { AdminContext, COLORS } from '@/contexts/AdminContext';
import {
  AdminDashboardTab,
  AdminUsersTab,
  AdminCarsTab,
  AdminBookingsTab,
  AdminPaymentsTab,
  AdminAnnouncementsTab,
  AdminAppealsTab,
  AdminAdsTab,
  AdminPromoCodesTab,
  AdminBrokersTab,
  AdminFeaturedCarsTab,
  AdminHolidaysTab,
  AdminSuggestionsTab,
  AdminNotificationsTab,
  AdminOtpsTab,
  AdminServicesTab
} from '@/pages/admin';

export default function AdminPanelPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  
  // Data states
  const [users, setUsers] = useState([]);
  const [cars, setCars] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [appeals, setAppeals] = useState([]);
  const [ads, setAds] = useState([]);
  const [featuredCars, setFeaturedCars] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [otps, setOtps] = useState([]);
  // Promo codes / referrals
  const [promoCodes, setPromoCodes] = useState([]);
  const [promoCodeUsers, setPromoCodeUsers] = useState([]);
  const [brokerReferrals, setBrokerReferrals] = useState([]);
  const [brokers, setBrokers] = useState([]);
  const [brokerForm, setBrokerForm] = useState({
    username: '',
    phone_number: '',
    email: '',
    password: '',
    password_confirmation: '',
    first_name: '',
    last_name: ''
  });
  // Broker detail & payouts
  const [selectedBroker, setSelectedBroker] = useState(null);
  const [brokerDetailTab, setBrokerDetailTab] = useState('overview');
  const [brokerBalance, setBrokerBalance] = useState(null);
  const [brokerCommissions, setBrokerCommissions] = useState({ data: [], statistics: {} });
  const [brokerPayouts, setBrokerPayouts] = useState({ data: [] });
  const [brokerCommissionsList, setBrokerCommissionsList] = useState({ data: [] });
  const [payoutForm, setPayoutForm] = useState({ broker_id: '', amount: '', reference: '', notes: '' });
  const [commissionStatusFilter, setCommissionStatusFilter] = useState('all');
  const [appFeesData, setAppFeesData] = useState({}); // Store app fees data by agent ID
  const [carImages, setCarImages] = useState({}); // Store car image files for upload
  
  // Services Management states
  const [services, setServices] = useState([]);
  const [thirdParties, setThirdParties] = useState([]);
  const [serviceItems, setServiceItems] = useState([]);
  const [serviceFeedbacks, setServiceFeedbacks] = useState([]);
  const [selectedServiceId, setSelectedServiceId] = useState(null); // For viewing items/feedbacks of a service
  
  // Pagination states
  const [pagination, setPagination] = useState({
    users: { page: 1, per_page: 50 },
    cars: { page: 1, per_page: 50 },
    bookings: { page: 1, per_page: 50 },
    payments: { page: 1, per_page: 50 },
    announcements: { page: 1, per_page: 50 },
    appeals: { page: 1, per_page: 50 },
    ads: { page: 1, per_page: 50 },
    featuredCars: { page: 1, per_page: 50 },
    holidays: { page: 1, per_page: 50 },
    suggestions: { page: 1, per_page: 50 },
    notifications: { page: 1, per_page: 50 },
    otps: { page: 1, per_page: 50 },
    services: { page: 1, per_page: 50 },
    thirdParties: { page: 1, per_page: 50 },
    serviceFeedbacks: { page: 1, per_page: 50 },
    promoCodes: { page: 1, per_page: 50 }
  });
  
  // Filter states
  const [filters, setFilters] = useState({
    users: { role: 'all', status: 'all' },
    cars: { status: 'all', car_accepted: 'all', agent_id: '' },
    bookings: { status: 'all' },
    payments: { type: 'all' },
    announcements: { status: 'all' },
    appeals: { status: 'all', priority: 'all' },
    ads: { status: 'all' }, // Changed from 'online' to 'status' to match documentation
    featuredCars: { status: 'all' },
    holidays: { car_id: '', active: 'all' }, // Changed from 'is_active' to 'active' to match documentation
    suggestions: { status: 'all' },
    notifications: { type: 'all', is_read: 'all' },
    otps: { phone_number: '', expired: 'all' },
    services: { category: 'all', city: '', featured: 'all', search: '' },
    thirdParties: { search: '' },
    promoCodes: { broker_id: 'all', is_active: 'all' }
  });
  
  // Statistics and chart data
  const [statistics, setStatistics] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [statisticsPeriod, setStatisticsPeriod] = useState('month');

  // Modal states
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('');
  
  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    message: '',
    onConfirm: null
  });

  // Fetch summary statistics
  const fetchSummary = async () => {
    try {
      const { data } = await api.get('/admin/reports/summary');
      setSummary(data.summary);
    } catch (error) {
      console.error('Error fetching summary:', error);
      toast.error('Failed to load dashboard summary');
    }
  };

  // Fetch users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.users.page,
        per_page: pagination.users.per_page
      };
      if (filters.users.role && filters.users.role !== 'all') params.role = filters.users.role;
      if (filters.users.status && filters.users.status !== 'all') {
        // Convert string to boolean as per API documentation
        params.status = filters.users.status === 'active' || filters.users.status === 'true';
      }
      
      const response = await getUsers(params);
      setUsers(response.data.users);
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch user details
  const fetchUserDetails = async (id) => {
    try {
      const { data } = await api.get(`/admin/users/${id}`);
      return data.user;
    } catch (error) {
      toast.error('Failed to fetch user details');
      return null;
    }
  };

  // Fetch cars
  const fetchCars = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.cars.page,
        per_page: pagination.cars.per_page,
        with_images: true
      };
      if (filters.cars.status && filters.cars.status !== 'all') params.status = filters.cars.status;
      if (filters.cars.car_accepted && filters.cars.car_accepted !== 'all') params.car_accepted = filters.cars.car_accepted;
      if (filters.cars.agent_id && filters.cars.agent_id !== 'all') params.agent_id = filters.cars.agent_id;
      
      const response = await getCars(params);
      setCars(response.data.cars);
    } catch (error) {
      toast.error('Failed to fetch cars');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch car details
  const fetchCarDetails = async (id) => {
    try {
      const { data } = await api.get(`/admin/cars/${id}`);
      return data.car;
    } catch (error) {
      toast.error('Failed to fetch car details');
      return null;
    }
  };

  // Fetch bookings
  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.bookings.status && filters.bookings.status !== 'all') params.append('status', filters.bookings.status);
      params.append('page', pagination.bookings.page);
      params.append('per_page', pagination.bookings.per_page);
      
      const { data } = await api.get(`/admin/bookings?${params}`);
      setBookings(data.bookings);
    } catch (error) {
      toast.error('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch booking details
  const fetchBookingDetails = async (id) => {
    try {
      const { data } = await api.get(`/admin/bookings/${id}`);
      return data.booking;
    } catch (error) {
      toast.error('Failed to fetch booking details');
      return null;
    }
  };

  // Fetch payments
  const fetchPayments = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.payments.page,
        per_page: pagination.payments.per_page
      };
      if (filters.payments.type && filters.payments.type !== 'all') params.type = filters.payments.type;
      
      const response = await getPayments(params);
      setPayments(response.data.payments);
    } catch (error) {
      toast.error('Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  };

  // Fetch announcements
  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.announcements.status && filters.announcements.status !== 'all') params.append('status', filters.announcements.status);
      params.append('page', pagination.announcements.page);
      params.append('per_page', pagination.announcements.per_page);
      
      const { data } = await api.get(`/admin/announcements?${params}`);
      setAnnouncements(data.announcements);
    } catch (error) {
      toast.error('Failed to fetch announcements');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch announcement details
  const fetchAnnouncementDetails = async (id) => {
    try {
      const { data } = await api.get(`/admin/announcements/${id}`);
      return data.announcement;
    } catch (error) {
      toast.error('Failed to fetch announcement details');
      return null;
    }
  };

  // Fetch appeals
  const fetchAppeals = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.appeals.status && filters.appeals.status !== 'all') params.append('status', filters.appeals.status);
      if (filters.appeals.priority && filters.appeals.priority !== 'all') params.append('priority', filters.appeals.priority);
      params.append('page', pagination.appeals.page);
      params.append('per_page', pagination.appeals.per_page);
      
      const { data } = await api.get(`/admin/appeals?${params}`);
      setAppeals(data.appeals);
    } catch (error) {
      toast.error('Failed to fetch appeals');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch appeal details
  const fetchAppealDetails = async (id) => {
    try {
      const { data } = await api.get(`/admin/appeals/${id}`);
      return data.appeal;
    } catch (error) {
      toast.error('Failed to fetch appeal details');
      return null;
    }
  };

  // Fetch ads
  const fetchAds = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.ads.status && filters.ads.status !== 'all') params.append('status', filters.ads.status);
      params.append('page', pagination.ads.page);
      params.append('per_page', pagination.ads.per_page);
      
      const { data } = await api.get(`/admin/ads?${params}`);
      setAds(data.ads);
    } catch (error) {
      toast.error('Failed to fetch ads');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch ad details
  const fetchAdDetails = async (id) => {
    try {
      const { data } = await api.get(`/admin/ads/${id}`);
      return data.ad;
    } catch (error) {
      toast.error('Failed to fetch ad details');
      return null;
    }
  };

  // Fetch featured cars
  const fetchFeaturedCars = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.featuredCars.status && filters.featuredCars.status !== 'all') params.append('status', filters.featuredCars.status);
      params.append('page', pagination.featuredCars.page);
      params.append('per_page', pagination.featuredCars.per_page);
      
      const { data } = await api.get(`/admin/featured-cars?${params}`);
      setFeaturedCars(data.featured_cars);
    } catch (error) {
      toast.error('Failed to fetch featured cars');
    } finally {
      setLoading(false);
    }
  };

  // Fetch holidays
  const fetchHolidays = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.holidays.car_id && filters.holidays.car_id !== 'all') params.append('car_id', filters.holidays.car_id);
      if (filters.holidays.active && filters.holidays.active !== 'all') params.append('active', filters.holidays.active);
      params.append('page', pagination.holidays.page);
      params.append('per_page', pagination.holidays.per_page);
      
      const { data } = await api.get(`/admin/holidays?${params}`);
      setHolidays(data.holidays);
    } catch (error) {
      toast.error('Failed to fetch holidays');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch holiday details
  const fetchHolidayDetails = async (id) => {
    try {
      const { data } = await api.get(`/admin/holidays/${id}`);
      return data.holiday;
    } catch (error) {
      toast.error('Failed to fetch holiday details');
      return null;
    }
  };
  
  // Create holiday
  const createHoliday = async (data) => {
    try {
      await api.post('/admin/holidays', data);
      toast.success('Holiday created successfully');
      fetchHolidays();
      setModalOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create holiday');
    }
  };
  
  // Update holiday
  const updateHoliday = async (id, data) => {
    try {
      await api.put(`/admin/holidays/${id}`, data);
      toast.success('Holiday updated successfully');
      fetchHolidays();
      setModalOpen(false);
    } catch (error) {
      toast.error('Failed to update holiday');
    }
  };
  
  // Delete holiday
  const deleteHoliday = async (id) => {
    try {
      await api.delete(`/admin/holidays/${id}`);
      toast.success('Holiday deleted successfully');
      fetchHolidays();
    } catch (error) {
      toast.error('Failed to delete holiday');
    }
  };

  // Fetch suggestions
  const fetchSuggestions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.suggestions.status && filters.suggestions.status !== 'all') params.append('status', filters.suggestions.status);
      params.append('page', pagination.suggestions.page);
      params.append('per_page', pagination.suggestions.per_page);
      
      const { data } = await api.get(`/admin/suggestions?${params}`);
      setSuggestions(data.suggestions);
    } catch (error) {
      toast.error('Failed to fetch suggestions');
    } finally {
      setLoading(false);
    }
  };

  // Fetch notifications
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.notifications.type && filters.notifications.type !== 'all') params.append('type', filters.notifications.type);
      if (filters.notifications.is_read && filters.notifications.is_read !== 'all') params.append('is_read', filters.notifications.is_read);
      params.append('page', pagination.notifications.page);
      params.append('per_page', pagination.notifications.per_page);
      
      const { data } = await api.get(`/admin/notifications?${params}`);
      setNotifications(data.notifications);
    } catch (error) {
      toast.error('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  // Fetch OTPs
  const fetchOtps = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.otps.phone_number) params.phone_number = filters.otps.phone_number;
      if (filters.otps.expired && filters.otps.expired !== 'all') params.expired = filters.otps.expired;
      params.per_page = pagination.otps.per_page;
      params.page = pagination.otps.page;
      
      const response = await getOtps(params);
      setOtps(response.data.otps);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch OTPs');
    } finally {
      setLoading(false);
    }
  };

  // ============================
  // Services Management Functions
  // ============================

  // Fetch services
  const fetchServices = async () => {
    setLoading(true);
    try {
      const params = {
        per_page: pagination.services.per_page,
        page: pagination.services.page
      };
      if (filters.services.category && filters.services.category !== 'all') params.category = filters.services.category;
      if (filters.services.city) params.city = filters.services.city;
      if (filters.services.featured && filters.services.featured !== 'all') params.featured = filters.services.featured === 'true';
      if (filters.services.search) params.search = filters.services.search;
      
      const response = await getAdminServices(params);
      setServices(response.data.services?.data || response.data.services || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch services');
    } finally {
      setLoading(false);
    }
  };

  // Create service
  const handleCreateService = async (data) => {
    try {
      const { third_party_id, ...serviceData } = data;
      if (!third_party_id) {
        toast.error('Please select a third party owner for this service');
        return;
      }

      // Map our simple form fields into backend-friendly shape.
      // For now we send the required and most common optional fields.
      const payload = {
        // Required
        category: serviceData.category,
        name: serviceData.name,
        // Optional, but commonly used
        description: serviceData.description || undefined,
        tagline: serviceData.tagline || undefined,
        city: serviceData.city || undefined,
        contact_phone: serviceData.contact_phone || serviceData.phone || undefined,
        contact_email: serviceData.contact_email || undefined,
        // Pricing: backend expects min_price / max_price
        min_price: serviceData.price ?? undefined,
        max_price: serviceData.price ?? undefined,
        currency: 'USD',
        // NOTE: backend 422s on is_featured validation; omit for now so it uses default
        // is_featured: serviceData.featured ?? false,
        // You can add location, operating_hours, amenities, etc. later
      };

      // Debug: inspect payload before sending the request
      console.log('Creating service for third party', third_party_id, 'with payload:', payload);

      await createAdminServiceForThirdParty(third_party_id, payload);
      toast.success('Service created successfully');
      fetchServices();
      setModalOpen(false);
    } catch (error) {
      // Log full error response for debugging 422 issues
      console.error('Create service failed:', {
        status: error.response?.status,
        data: error.response?.data,
      });
      const backendMessage =
        error.response?.data?.message ||
        (typeof error.response?.data === 'string' ? error.response.data : null);
      toast.error(backendMessage || 'Failed to create service');
    }
  };

  // Update service
  const handleUpdateService = async (id, data) => {
    try {
      await updateAdminService(id, data);
      toast.success('Service updated successfully');
      fetchServices();
      setModalOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update service');
    }
  };

  // Delete service
  const handleDeleteService = async (id) => {
    try {
      await deleteAdminService(id);
      toast.success('Service deleted successfully');
      fetchServices();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete service');
    }
  };

  // Fetch third parties
  const fetchThirdParties = async () => {
    setLoading(true);
    try {
      const params = {
        per_page: pagination.thirdParties.per_page,
        page: pagination.thirdParties.page
      };
      
      const response = await getAdminThirdParties(params);
      setThirdParties(response.data.third_parties?.data || response.data.third_parties || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch third parties');
    } finally {
      setLoading(false);
    }
  };

  // Create third party
  const handleCreateThirdParty = async (data) => {
    // The admin endpoint requires: username, business_name, phone_number, email, password
    const payload = {
      business_name: data.name,
      username: data.username,
      email: data.email,
      password: data.password,
      phone_number: data.phone,
      // Optional fields
      subscription: data.subscription || undefined,
      permissions: data.permissions || [],
    };

    // Debug: inspect request payload before sending
    // Remove this log in production if not needed
    console.log('Creating third party with payload:', payload);

    try {
      await createAdminThirdParty(payload);
      toast.success('Third party created successfully');
      fetchThirdParties();
      setModalOpen(false);
    } catch (error) {
      // Log full error response for debugging 422 issues
      console.error('Create third party failed:', {
        payload,
        status: error.response?.status,
        data: error.response?.data,
      });
      const backendMessage =
        error.response?.data?.message ||
        (typeof error.response?.data === 'string' ? error.response.data : null);
      toast.error(backendMessage || 'Failed to create third party');
    }
  };

  // Update third party
  const handleUpdateThirdParty = async (id, data) => {
    try {
      // Same allowed fields as create; password is optional on update
      const payload = {
        business_name: data.name,
        username: data.username,
        email: data.email,
        phone_number: data.phone,
        subscription: data.subscription || undefined,
        permissions: data.permissions || [],
      };
      if (data.password) {
        payload.password = data.password;
      }

      await updateAdminThirdParty(id, payload);
      toast.success('Third party updated successfully');
      fetchThirdParties();
      setModalOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update third party');
    }
  };

  // Delete third party
  const handleDeleteThirdParty = async (id) => {
    try {
      await deleteAdminThirdParty(id);
      toast.success('Third party deleted successfully');
      fetchThirdParties();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete third party');
    }
  };

  // Fetch service items
  const fetchServiceItems = async (serviceId) => {
    if (!serviceId) return;
    setLoading(true);
    try {
      const response = await getAdminServiceItems(serviceId);
      setServiceItems(response.data.items || []);
      setSelectedServiceId(serviceId);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch service items');
    } finally {
      setLoading(false);
    }
  };

  // Create service item
  const handleCreateServiceItem = async (serviceId, data) => {
    try {
      await createAdminServiceItem(serviceId, data);
      toast.success('Service item created successfully');
      fetchServiceItems(serviceId);
      setModalOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create service item');
    }
  };

  // Update service item
  const handleUpdateServiceItem = async (itemId, data) => {
    try {
      await updateAdminServiceItem(itemId, data);
      toast.success('Service item updated successfully');
      if (selectedServiceId) fetchServiceItems(selectedServiceId);
      setModalOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update service item');
    }
  };

  // Delete service item
  const handleDeleteServiceItem = async (itemId) => {
    try {
      await deleteAdminServiceItem(itemId);
      toast.success('Service item deleted successfully');
      if (selectedServiceId) fetchServiceItems(selectedServiceId);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete service item');
    }
  };

  // Fetch service feedbacks
  const fetchServiceFeedbacks = async () => {
    setLoading(true);
    try {
      const params = {
        per_page: pagination.serviceFeedbacks.per_page,
        page: pagination.serviceFeedbacks.page
      };
      
      const response = await getAdminFeedbacks(params);
      setServiceFeedbacks(response.data.feedbacks?.data || response.data.feedbacks || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch feedbacks');
    } finally {
      setLoading(false);
    }
  };

  // Delete feedback
  const handleDeleteFeedback = async (feedbackId) => {
    try {
      await deleteAdminFeedback(feedbackId);
      toast.success('Feedback deleted successfully');
      fetchServiceFeedbacks();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete feedback');
    }
  };
  
  // Fetch statistics
  const fetchStatistics = async (period = 'month') => {
    try {
      const { data } = await api.get(`/admin/reports/statistics?period=${period}`);
      setStatistics(data.statistics);
    } catch (error) {
      toast.error('Failed to fetch statistics');
    }
  };
  
  // Fetch chart data
  const fetchChartData = async (period = 'month') => {
    try {
      const { data } = await api.get(`/admin/reports/chart-data?period=${period}`);
      setChartData(data);
    } catch (error) {
      toast.error('Failed to fetch chart data');
    }
  };
  
  // Fetch system logs
  const fetchSystemLogs = async (limit = 100) => {
    try {
      const { data } = await api.get(`/admin/logs?limit=${limit}`);
      return data.logs;
    } catch (error) {
      toast.error('Failed to fetch system logs');
      return [];
    }
  };

  // Update user
  const updateUser = async (id, data) => {
    try {
      await api.put(`/admin/users/${id}`, data);
      toast.success('User updated successfully');
      fetchUsers();
      setModalOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update user');
    }
  };

  // Delete user
  const deleteUser = async (id, force = false) => {
    try {
      await api.delete(`/admin/users/${id}${force ? '/force' : ''}`);
      toast.success(force ? 'User permanently deleted' : 'User deactivated');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  // Update car
  const updateCar = async (id, data) => {
    try {
      // Prepare data with images
      const updateData = { ...data };
      
      // Add image files if they exist
      const imageFields = ['main_image', 'front_image', 'back_image', 'left_image', 'right_image'];
      imageFields.forEach(field => {
        if (carImages[id] && carImages[id][field]) {
          updateData[field] = carImages[id][field];
        }
      });
      
      await updateCarApi(id, updateData);
      toast.success('Car updated successfully');
      // Clear image state for this car
      setCarImages(prev => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });
      fetchCars();
      setModalOpen(false);
    } catch (error) {
      toast.error('Failed to update car');
    }
  };
  
  // Handle car image change
  const handleCarImageChange = (carId, imageType, file) => {
    if (!file) return;
    setCarImages(prev => ({
      ...prev,
      [carId]: {
        ...prev[carId],
        [imageType]: file
      }
    }));
  };

  // Delete car
  const deleteCar = async (id) => {
    try {
      await api.delete(`/admin/cars/${id}`);
      toast.success('Car deleted successfully');
      fetchCars();
    } catch (error) {
      toast.error('Failed to delete car');
    }
  };

  // Update booking
  const updateBooking = async (id, data) => {
    try {
      await api.put(`/admin/bookings/${id}`, data);
      toast.success('Booking updated successfully');
      fetchBookings();
      setModalOpen(false);
    } catch (error) {
      toast.error('Failed to update booking');
    }
  };

  // Force complete booking
  const forceCompleteBooking = async (id) => {
    try {
      await api.post(`/admin/bookings/${id}/force-complete`);
      toast.success('Booking force completed');
      fetchBookings();
    } catch (error) {
      toast.error('Failed to force complete booking');
    }
  };

  // Process refund
  // Note: According to API documentation, the {id} parameter is the invoice ID, not payment ID
  // Endpoint: POST /admin/refunds/{id} where {id} is the invoice ID
  const processRefund = async (invoiceId, description = '') => {
    try {
      await api.post(`/admin/refunds/${invoiceId}`, { description });
      toast.success('Refund processed successfully');
      fetchPayments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to process refund');
    }
  };

  // Create announcement
  const createAnnouncement = async (data) => {
    try {
      // Ensure dates are in correct format (YYYY-MM-DD HH:mm:ss)
      const submitData = {
        title: data.title,
        message: data.message,
        priority: data.priority || 'medium',
        target_audience: data.target_audience || [],
        status: data.status || 'draft'
      };
      
      // Add dates if provided
      if (data.scheduled_at) {
        submitData.scheduled_at = data.scheduled_at;
      }
      if (data.expires_at) {
        submitData.expires_at = data.expires_at;
      }
      
      // Add optional fields if provided
      if (data.categories && data.categories.length > 0) {
        submitData.categories = data.categories;
      }
      if (data.media && data.media.length > 0) {
        submitData.media = data.media;
      }
      
      await api.post('/admin/announcements', submitData);
      toast.success('Announcement created successfully');
      fetchAnnouncements();
      setModalOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create announcement');
    }
  };

  // Update announcement
  const updateAnnouncement = async (id, data) => {
    try {
      await api.put(`/admin/announcements/${id}`, data);
      toast.success('Announcement updated successfully');
      fetchAnnouncements();
      setModalOpen(false);
    } catch (error) {
      toast.error('Failed to update announcement');
    }
  };

  // Delete announcement
  const deleteAnnouncement = async (id) => {
    try {
      await api.delete(`/admin/announcements/${id}`);
      toast.success('Announcement deleted successfully');
      fetchAnnouncements();
    } catch (error) {
      toast.error('Failed to delete announcement');
    }
  };

  // Update appeal
  const updateAppeal = async (id, data) => {
    try {
      await api.put(`/admin/appeals/${id}`, data);
      toast.success('Appeal updated successfully');
      fetchAppeals();
      setModalOpen(false);
    } catch (error) {
      toast.error('Failed to update appeal');
    }
  };

  // Update ad
  const updateAd = async (id, data) => {
    try {
      await api.put(`/admin/ads/${id}`, data);
      toast.success('Ad updated successfully');
      fetchAds();
      setModalOpen(false);
    } catch (error) {
      toast.error('Failed to update ad');
    }
  };

  // Create ad
  const createAdHandler = async (data) => {
    try {
      await createAd(data);
      toast.success('Ad created successfully');
      fetchAds();
      setModalOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create ad');
    }
  };

  // Delete ad
  const deleteAd = async (id) => {
    try {
      await api.delete(`/admin/ads/${id}`);
      toast.success('Ad deleted successfully');
      fetchAds();
    } catch (error) {
      toast.error('Failed to delete ad');
    }
  };

  // Create payment/invoice
  const createPaymentHandler = async (data) => {
    try {
      await issuePayment(data);
      toast.success('Payment/Invoice issued successfully');
      fetchPayments();
      setModalOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to issue payment');
    }
  };

  // Create featured car
  const createFeaturedCarHandler = async (data) => {
    try {
      await createFeaturedCar(data);
      toast.success('Featured car created successfully');
      fetchFeaturedCars();
      setModalOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create featured car');
    }
  };

  // Delete featured car
  const deleteFeaturedCar = async (id) => {
    try {
      await api.delete(`/admin/featured-cars/${id}`);
      toast.success('Featured car removed successfully');
      fetchFeaturedCars();
    } catch (error) {
      toast.error('Failed to remove featured car');
    }
  };

  // Update suggestion
  const updateSuggestion = async (id, data) => {
    try {
      await api.put(`/admin/suggestions/${id}`, data);
      toast.success('Suggestion updated successfully');
      fetchSuggestions();
      setModalOpen(false);
    } catch (error) {
      toast.error('Failed to update suggestion');
    }
  };

  // Delete suggestion
  const deleteSuggestion = async (id) => {
    try {
      await api.delete(`/admin/suggestions/${id}`);
      toast.success('Suggestion deleted successfully');
      fetchSuggestions();
    } catch (error) {
      toast.error('Failed to delete suggestion');
    }
  };

  // Send notification to all users
  const sendNotificationToAll = async (data) => {
    try {
      await api.post('/admin/notifications/send-to-all', data);
      toast.success('Notification sent to all users successfully');
      setModalOpen(false);
    } catch (error) {
      toast.error('Failed to send notification');
    }
  };

  // Fetch agent fee summary
  const fetchAgentAppFeesBalance = async (agentId) => {
    try {
      const summaryResponse = await getAgentFeeSummary(agentId);
      const percentageResponse = await getAgentFeePercentage(agentId);
      
      setAppFeesData(prev => ({
        ...prev,
        [agentId]: {
          ...summaryResponse.data,
          app_fees_percentage: percentageResponse.data.fee_percentage || 0
        }
      }));
      return summaryResponse.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch agent fee data');
      return null;
    }
  };

  // Update agent fee percentage
  const updateAgentAppFeesPercentage = async (agentId, feePercentage) => {
    try {
      await setAgentFeePercentage(agentId, { app_fees: feePercentage });
      toast.success('Agent fee percentage updated successfully');
      await fetchAgentAppFeesBalance(agentId);
      fetchUsers(); // Refresh users list to show updated fee percentage
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update agent fee percentage');
    }
  };

  // Helper function to show confirmation dialog
  const showConfirmDialog = (title, message, onConfirm) => {
    setConfirmDialog({
      open: true,
      title,
      message,
      onConfirm
    });
  };

  // ============================
  // Promo Codes Helpers
  // ============================

  const fetchBrokers = async () => {
    try {
      const res = await getUsers({ role: 'broker', per_page: 200 });
      const raw = res.data?.users?.data ?? res.data?.users ?? res.data?.data;
      setBrokers(Array.isArray(raw) ? raw : []);
    } catch (error) {
      console.error('Failed to fetch brokers:', error);
    }
  };

  const fetchPromoCodes = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.promoCodes.page,
        per_page: pagination.promoCodes.per_page
      };
      if (filters.promoCodes.broker_id && filters.promoCodes.broker_id !== 'all') {
        params.broker_id = filters.promoCodes.broker_id;
      }
      if (filters.promoCodes.is_active !== 'all') {
        params.is_active = filters.promoCodes.is_active;
      }
      const res = await getPromoCodes(params);
      setPromoCodes(res.data?.promo_codes || res.data?.promoCodes || res.data || []);
    } catch (error) {
      console.error('Failed to fetch promo codes:', error);
      toast.error('Failed to load promo codes');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdatePromoCode = async (payload, existing) => {
    setLoading(true);
    try {
      if (existing) {
        await updatePromoCode(existing.id, payload);
        toast.success('Promo code updated successfully');
      } else {
        await createPromoCode(payload);
        toast.success('Promo code created successfully');
      }
      setModalOpen(false);
      setSelectedItem(null);
      await fetchPromoCodes();
    } catch (error) {
      console.error('Failed to save promo code:', error);
      const msg = error.response?.data?.message || 'Failed to save promo code';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePromoCode = async (id) => {
    setLoading(true);
    try {
      await deletePromoCode(id);
      toast.success('Promo code deleted successfully');
      await fetchPromoCodes();
    } catch (error) {
      console.error('Failed to delete promo code:', error);
      toast.error('Failed to delete promo code');
    } finally {
      setLoading(false);
    }
  };

  const fetchPromoCodeUsers = async (promoId) => {
    try {
      const res = await getPromoCodeUsers(promoId, { per_page: 50 });
      setPromoCodeUsers(res.data?.users || []);
    } catch (error) {
      console.error('Failed to fetch promo code users:', error);
      toast.error('Failed to load users for this promo code');
    }
  };

  const fetchBrokerReferrals = async (brokerId) => {
    try {
      const res = await getBrokerReferrals(brokerId, { per_page: 50 });
      setBrokerReferrals(res.data?.referrals || []);
    } catch (error) {
      console.error('Failed to fetch broker referrals:', error);
      toast.error('Failed to load broker referrals');
    }
  };

  const handleCreateBroker = async () => {
    const { username, phone_number, email, password, password_confirmation, first_name, last_name } = brokerForm;
    if (!username?.trim()) {
      toast.error('Username is required');
      return;
    }
    if (!phone_number?.trim()) {
      toast.error('Phone number is required');
      return;
    }
    if (!first_name?.trim()) {
      toast.error('First name is required');
      return;
    }
    if (!last_name?.trim()) {
      toast.error('Last name is required');
      return;
    }
    if (!password) {
      toast.error('Password is required');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (password !== password_confirmation) {
      toast.error('Password and confirmation do not match');
      return;
    }
    setLoading(true);
    try {
      await createBroker({
        username: username.trim(),
        phone_number: phone_number.trim().replace(/^\+?/, ''), // backend adds + prefix
        email: email?.trim() || undefined,
        password,
        password_confirmation: password_confirmation || password,
        first_name: first_name.trim(),
        last_name: last_name.trim()
      });
      toast.success('Broker created successfully');
      setModalOpen(false);
      setBrokerForm({ username: '', phone_number: '', email: '', password: '', password_confirmation: '', first_name: '', last_name: '' });
      await fetchBrokers();
    } catch (error) {
      console.error('Failed to create broker:', error);
      const errData = error.response?.data;
      const msg = errData?.message ||
        (errData?.errors ? Object.values(errData.errors).flat().join(' ') : null) ||
        'Failed to create broker';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Load data based on active tab
  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchSummary();
      fetchStatistics(statisticsPeriod);
      fetchChartData(statisticsPeriod);
    } else if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'cars') {
      fetchCars();
    } else if (activeTab === 'bookings') {
      fetchBookings();
    } else if (activeTab === 'payments') {
      fetchPayments();
    } else if (activeTab === 'announcements') {
      fetchAnnouncements();
    } else if (activeTab === 'appeals') {
      fetchAppeals();
    } else if (activeTab === 'ads') {
      fetchAds();
    } else if (activeTab === 'featured-cars') {
      fetchFeaturedCars();
    } else if (activeTab === 'holidays') {
      fetchHolidays();
    } else if (activeTab === 'suggestions') {
      fetchSuggestions();
    } else if (activeTab === 'notifications') {
      fetchNotifications();
    } else if (activeTab === 'otps') {
      fetchOtps();
    } else if (activeTab === 'services') {
      // Load services and third-party owners when entering Services tab
      fetchServices();
      fetchThirdParties();
    } else if (activeTab === 'promo-codes') {
      fetchPromoCodes();
      if (!brokers.length) {
        fetchBrokers();
      }
    } else if (activeTab === 'brokers') {
      fetchBrokers();
      fetchBrokerCommissionsList();
    }
  }, [activeTab, statisticsPeriod]);

  // Fetch broker detail when selected
  const openBrokerDetail = async (broker) => {
    setSelectedBroker(broker);
    setBrokerDetailTab('overview');
    if (broker?.id) {
      try {
        const [balanceRes, commissionsRes, payoutsRes, referralsRes] = await Promise.all([
          getBrokerBalance(broker.id).catch(() => ({ data: null })),
          getBrokerCommissions(broker.id).catch(() => ({ data: { data: [], statistics: {} } })),
          getBrokerPayouts(broker.id).catch(() => ({ data: { payouts: { data: [] }, summary: {} } })),
          getBrokerReferrals(broker.id).catch(() => ({ data: { referrals: [] } }))
        ]);
        setBrokerBalance(balanceRes.data);
        const commissionsRaw = commissionsRes.data?.commissions?.data ?? commissionsRes.data?.commissions;
        const commissionsArr = Array.isArray(commissionsRaw) ? commissionsRaw : [];
        setBrokerCommissions({
          data: commissionsArr,
          statistics: commissionsRes.data?.statistics || {}
        });
        const payoutsRaw = payoutsRes.data?.payouts || payoutsRes.data;
        const payoutsArr = Array.isArray(payoutsRaw) ? payoutsRaw : (Array.isArray(payoutsRaw?.data) ? payoutsRaw.data : []);
        setBrokerPayouts({ data: payoutsArr });
        const referralsRaw = referralsRes.data?.referrals ?? referralsRes.data?.data;
        setBrokerReferrals(Array.isArray(referralsRaw) ? referralsRaw : []);
      } catch (e) {
        console.error('Failed to load broker detail:', e);
      }
    }
  };

  const closeBrokerDetail = () => {
    setSelectedBroker(null);
    setBrokerBalance(null);
    setBrokerCommissions({ data: [], statistics: {} });
    setBrokerPayouts({ data: [] });
  };

  const refreshBrokerDetail = async () => {
    if (selectedBroker?.id) {
      await openBrokerDetail(selectedBroker);
      await fetchBrokerCommissionsList();
    }
  };

  const fetchBrokerCommissionsList = async () => {
    try {
      const res = await getBrokerCommissionsList({ per_page: 50 });
      const commList = res.data?.commissions?.data ?? res.data?.commissions;
      setBrokerCommissionsList({ data: Array.isArray(commList) ? commList : [] });
    } catch (e) {
      console.error('Failed to fetch broker commissions:', e);
    }
  };

  const handleCreateBrokerPayout = async () => {
    const brokerId = payoutForm.broker_id ? Number(payoutForm.broker_id) : selectedBroker?.id;
    const amount = parseFloat(payoutForm.amount);
    if (!brokerId || !amount || amount < 0.01) {
      toast.error('Select a broker and enter amount (min 0.01)');
      return;
    }
    setLoading(true);
    try {
      await createBrokerPayout({
        broker_id: brokerId,
        amount,
        reference: payoutForm.reference?.trim() || undefined,
        notes: payoutForm.notes?.trim() || undefined
      });
      toast.success('Broker payout created successfully');
      setModalOpen(false);
      setPayoutForm({ broker_id: '', amount: '', reference: '', notes: '' });
      await refreshBrokerDetail();
      await fetchBrokerCommissionsList();
    } catch (err) {
      const d = err.response?.data;
      const msg = d?.message || (d?.errors ? Object.values(d.errors).flat().join(' ') : null) || 'Failed to create payout';
      const pendingBal = d?.pending_balance;
      toast.error(pendingBal != null ? `${msg} (Max: $${Number(pendingBal).toFixed(2)})` : msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelCommission = async (id) => {
    try {
      await cancelBrokerCommission(id);
      toast.success('Commission cancelled');
      await refreshBrokerDetail();
      await fetchBrokerCommissionsList();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel commission');
    }
  };

  const handleDeleteBrokerReferral = async (id) => {
    try {
      await deleteBrokerReferral(id);
      toast.success('Referral deleted');
      await refreshBrokerDetail();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete referral');
    }
  };

  const adminContextValue = useMemo(() => ({
    COLORS,
    loading,
    summary,
    users,
    cars,
    bookings,
    payments,
    announcements,
    appeals,
    ads,
    featuredCars,
    holidays,
    suggestions,
    notifications,
    otps,
    promoCodes,
    promoCodeUsers,
    brokerReferrals,
    brokers,
    brokerForm,
    setBrokerForm,
    selectedBroker,
    setSelectedBroker,
    brokerDetailTab,
    setBrokerDetailTab,
    brokerBalance,
    brokerCommissions,
    setBrokerCommissions,
    brokerPayouts,
    brokerCommissionsList,
    payoutForm,
    setPayoutForm,
    commissionStatusFilter,
    setCommissionStatusFilter,
    filters,
    setFilters,
    pagination,
    setPagination,
    selectedItem,
    setSelectedItem,
    modalOpen,
    setModalOpen,
    modalType,
    setModalType,
    confirmDialog,
    setConfirmDialog,
    navigate,
    fetchUsers,
    fetchUserDetails,
    fetchCars,
    fetchCarDetails,
    fetchBookings,
    fetchBookingDetails,
    fetchPayments,
    fetchAnnouncements,
    fetchAppeals,
    fetchAds,
    fetchFeaturedCars,
    fetchHolidays,
    fetchSuggestions,
    fetchNotifications,
    fetchOtps,
    updateUser,
    deleteUser,
    updateCar,
    deleteCar,
    updateBooking,
    forceCompleteBooking,
    processRefund,
    deleteAnnouncement,
    deleteAd,
    deleteFeaturedCar,
    deleteHoliday,
    deleteSuggestion,
    showConfirmDialog,
    fetchPromoCodes,
    fetchPromoCodeUsers,
    fetchBrokerReferrals,
    fetchBrokers,
    handleCreateOrUpdatePromoCode,
    handleDeletePromoCode,
    handleCreateBroker,
    openBrokerDetail,
    closeBrokerDetail,
    refreshBrokerDetail,
    fetchBrokerCommissionsList,
    handleCreateBrokerPayout,
    handleCancelCommission,
    handleDeleteBrokerReferral,
    services,
    thirdParties,
    serviceItems,
    serviceFeedbacks,
    selectedServiceId,
    setSelectedServiceId,
    fetchServices,
    fetchThirdParties,
    fetchServiceItems,
    fetchServiceFeedbacks,
    handleCreateService,
    handleUpdateService,
    handleDeleteService,
    handleCreateThirdParty,
    handleUpdateThirdParty,
    handleDeleteThirdParty,
    handleCreateServiceItem,
    handleUpdateServiceItem,
    handleDeleteServiceItem,
    handleDeleteFeedback
  }), [
    loading, summary, users, cars, bookings, payments, announcements, appeals, ads,
    featuredCars, holidays, suggestions, notifications, otps, promoCodes, promoCodeUsers,
    brokerReferrals, brokers, brokerForm, selectedBroker, brokerDetailTab, brokerBalance,
    brokerCommissions, brokerPayouts, brokerCommissionsList, payoutForm, commissionStatusFilter,
    filters, pagination, selectedItem, modalOpen, modalType, confirmDialog,
    services, thirdParties, serviceItems, serviceFeedbacks, selectedServiceId
  ]);

  return (
    <AdminContext.Provider value={adminContextValue}>
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border-b border-gray-200/50 dark:border-gray-800/50 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/')}
                className="h-9 w-9"
                aria-label="Go to home page"
              >
                <Home className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold bg-clip-text text-transparent" style={{
                  backgroundImage: `linear-gradient(to right, ${COLORS.darkBlue}, ${COLORS.teal}, ${COLORS.limeGreen})`
                }}>
                  Admin Dashboard
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Manage your platform
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                localStorage.clear();
                navigate('/auth');
              }}
              className="h-9 w-9"
              aria-label="Logout"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 py-6 max-w-7xl">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-8 lg:grid-cols-16 mb-6 h-auto p-1 bg-gray-100 dark:bg-gray-800">
            <TabsTrigger value="dashboard" className="text-xs">
              <BarChart3 className="w-4 h-4 mr-1" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="users" className="text-xs">
              <Users className="w-4 h-4 mr-1" />
              Users
            </TabsTrigger>
            <TabsTrigger value="cars" className="text-xs">
              <Car className="w-4 h-4 mr-1" />
              Cars
            </TabsTrigger>
            <TabsTrigger value="bookings" className="text-xs">
              <Calendar className="w-4 h-4 mr-1" />
              Bookings
            </TabsTrigger>
            <TabsTrigger value="payments" className="text-xs">
              <DollarSign className="w-4 h-4 mr-1" />
              Payments
            </TabsTrigger>
            <TabsTrigger value="promo-codes" className="text-xs">
              <Tag className="w-4 h-4 mr-1" />
              Promo Codes
            </TabsTrigger>
            <TabsTrigger value="brokers" className="text-xs">
              <Users className="w-4 h-4 mr-1" />
              Brokers
            </TabsTrigger>
            <TabsTrigger value="announcements" className="text-xs">
              <Megaphone className="w-4 h-4 mr-1" />
              Announcements
            </TabsTrigger>
            <TabsTrigger value="appeals" className="text-xs">
              <AlertCircle className="w-4 h-4 mr-1" />
              Appeals
            </TabsTrigger>
            <TabsTrigger value="ads" className="text-xs">
              <FileText className="w-4 h-4 mr-1" />
              Ads
            </TabsTrigger>
            <TabsTrigger value="featured-cars" className="text-xs">
              <Star className="w-4 h-4 mr-1" />
              Featured
            </TabsTrigger>
            <TabsTrigger value="holidays" className="text-xs">
              <CalendarDays className="w-4 h-4 mr-1" />
              Holidays
            </TabsTrigger>
            <TabsTrigger value="suggestions" className="text-xs">
              <Lightbulb className="w-4 h-4 mr-1" />
              Suggestions
            </TabsTrigger>
            <TabsTrigger value="notifications" className="text-xs">
              <Bell className="w-4 h-4 mr-1" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="otps" className="text-xs">
              <KeyRound className="w-4 h-4 mr-1" />
              OTPs
            </TabsTrigger>
            <TabsTrigger value="services" className="text-xs">
              <Briefcase className="w-4 h-4 mr-1" />
              Services
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <AdminDashboardTab />
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <AdminUsersTab />
          </TabsContent>

          {/* Cars Tab */}
          <TabsContent value="cars" className="space-y-4">
            <AdminCarsTab />
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-4">
            <AdminBookingsTab />
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-4">
            <AdminPaymentsTab />
          </TabsContent>

          {/* Announcements Tab */}
          <TabsContent value="announcements" className="space-y-4">
            <AdminAnnouncementsTab />
          </TabsContent>

          {/* Appeals Tab */}
          <TabsContent value="appeals" className="space-y-4">
            <AdminAppealsTab />
          </TabsContent>

          {/* Ads Tab */}
          <TabsContent value="ads" className="space-y-4">
            <AdminAdsTab />
          </TabsContent>

          {/* Promo Codes Tab */}
          <TabsContent value="promo-codes" className="space-y-4">
            <AdminPromoCodesTab />
          </TabsContent>

          {/* Brokers Tab */}
          <TabsContent value="brokers" className="space-y-4">
            <AdminBrokersTab />
          </TabsContent>

          <TabsContent value="featured-cars" className="space-y-4">
            <AdminFeaturedCarsTab />
          </TabsContent>

          {/* Holidays Tab */}
          <TabsContent value="holidays" className="space-y-4">
            <AdminHolidaysTab />
          </TabsContent>

          {/* Suggestions Tab */}
          <TabsContent value="suggestions" className="space-y-4">
            <AdminSuggestionsTab />
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-4">
            <AdminNotificationsTab />
          </TabsContent>

          {/* OTPs Tab */}
          <TabsContent value="otps" className="space-y-4">
            <AdminOtpsTab />
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services" className="space-y-6">
            <AdminServicesTab />
          </TabsContent>
          <TabsContent value="services-legacy" style={{ display: 'none' }}>
            <Tabs defaultValue="services-list" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-4">
                <TabsTrigger value="services-list" className="text-xs">
                  <Briefcase className="w-4 h-4 mr-1" />
                  Services
                </TabsTrigger>
                <TabsTrigger value="third-parties" className="text-xs">
                  <Building2 className="w-4 h-4 mr-1" />
                  Third Parties
                </TabsTrigger>
                <TabsTrigger value="service-items" className="text-xs">
                  <Package className="w-4 h-4 mr-1" />
                  Service Items
                </TabsTrigger>
                <TabsTrigger value="service-feedbacks" className="text-xs">
                  <MessageCircle className="w-4 h-4 mr-1" />
                  Feedbacks
                </TabsTrigger>
              </TabsList>

              {/* Services List */}
              <TabsContent value="services-list" className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => {
                        setSelectedItem(null);
                        setModalType('create-service');
                        setModalOpen(true);
                      }}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Create Service
                    </Button>
                    <Button variant="outline" size="icon" onClick={fetchServices} aria-label="Refresh services">
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Search services..."
                      value={filters.services.search}
                      onChange={(e) => setFilters({...filters, services: {...filters.services, search: e.target.value}})}
                      className="w-48"
                    />
                    <Select
                      value={filters.services.category}
                      onValueChange={(value) => setFilters({...filters, services: {...filters.services, category: value}})}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="transport">Transport</SelectItem>
                        <SelectItem value="accommodation">Accommodation</SelectItem>
                        <SelectItem value="food">Food & Dining</SelectItem>
                        <SelectItem value="entertainment">Entertainment</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select
                      value={filters.services.featured}
                      onValueChange={(value) => setFilters({...filters, services: {...filters.services, featured: value}})}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Featured" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="true">Featured</SelectItem>
                        <SelectItem value="false">Not Featured</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={fetchServices}>
                      <Search className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Owner</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Rating</TableHead>
                          <TableHead>Featured</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loading ? (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center py-8">Loading...</TableCell>
                          </TableRow>
                        ) : services.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center py-8">No services found</TableCell>
                          </TableRow>
                        ) : (
                          services.map((service) => (
                            <TableRow key={service.id}>
                              <TableCell>{service.id}</TableCell>
                              <TableCell className="font-medium">{service.name}</TableCell>
                              <TableCell>
                                {service.third_party ? (
                                  <div className="text-sm">
                                    <p className="font-medium">{service.third_party.name}</p>
                                    <p className="text-xs text-muted-foreground">{service.third_party.email}</p>
                                  </div>
                                ) : service.third_party_id ? (
                                  <span className="text-muted-foreground">ID: {service.third_party_id}</span>
                                ) : (
                                  <span className="text-muted-foreground">-</span>
                                )}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">{service.category}</Badge>
                              </TableCell>
                              <TableCell>${(parseFloat(service.price) || 0).toFixed(2)}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                  {service.rating ? (parseFloat(service.rating) || 0).toFixed(1) : 'N/A'}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant={service.featured ? "default" : "secondary"}>
                                  {service.featured ? 'Yes' : 'No'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                      setSelectedItem(service);
                                      setModalType('view-service');
                                      setModalOpen(true);
                                    }}
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                      setSelectedItem(service);
                                      setModalType('edit-service');
                                      setModalOpen(true);
                                    }}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => fetchServiceItems(service.id)}
                                  >
                                    <Package className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-destructive"
                                    onClick={() => setConfirmDialog({
                                      open: true,
                                      title: 'Delete Service',
                                      message: `Are you sure you want to delete "${service.name}"?`,
                                      onConfirm: () => handleDeleteService(service.id)
                                    })}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Third Parties */}
              <TabsContent value="third-parties" className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => {
                        setSelectedItem(null);
                        setModalType('create-third-party');
                        setModalOpen(true);
                      }}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Create Third Party
                    </Button>
                    <Button variant="outline" size="icon" onClick={fetchThirdParties} aria-label="Refresh third parties">
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  </div>
                  <Input
                    placeholder="Search third parties..."
                    value={filters.thirdParties.search}
                    onChange={(e) => setFilters({...filters, thirdParties: {...filters.thirdParties, search: e.target.value}})}
                    className="w-64"
                  />
                </div>
                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Contact</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>City</TableHead>
                          <TableHead>Subscription</TableHead>
                          <TableHead>Created At</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loading ? (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center py-8">Loading...</TableCell>
                          </TableRow>
                        ) : thirdParties.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center py-8">No third parties found</TableCell>
                          </TableRow>
                        ) : (
                          thirdParties.map((tp) => (
                            <TableRow key={tp.id}>
                              <TableCell>{tp.id}</TableCell>
                              <TableCell>
                                <div>
                                  <p className="font-medium">{tp.name}</p>
                                  {tp.description && (
                                    <p className="text-xs text-muted-foreground truncate max-w-[200px]">{tp.description}</p>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">
                                  <p>{tp.email}</p>
                                  {tp.phone && <p className="text-muted-foreground">{tp.phone}</p>}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">{tp.category || 'N/A'}</Badge>
                              </TableCell>
                              <TableCell>{tp.city || 'N/A'}</TableCell>
                              <TableCell>
                                <Badge variant={tp.subscription === 'premium' || tp.subscription === 'enterprise' ? 'default' : 'secondary'}>
                                  {tp.subscription || 'Free'}
                                </Badge>
                              </TableCell>
                              <TableCell>{new Date(tp.created_at).toLocaleDateString()}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    title="View Details"
                                    onClick={() => {
                                      setSelectedItem(tp);
                                      setModalType('view-third-party');
                                      setModalOpen(true);
                                    }}
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    title="Edit"
                                    onClick={() => {
                                      setSelectedItem(tp);
                                      setModalType('edit-third-party');
                                      setModalOpen(true);
                                    }}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    title="Add Service for this Third Party"
                                    onClick={() => {
                                      setSelectedItem({ third_party_id: tp.id, third_party_name: tp.name });
                                      setModalType('create-service-for-tp');
                                      setModalOpen(true);
                                    }}
                                  >
                                    <Plus className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-destructive"
                                    title="Delete"
                                    onClick={() => setConfirmDialog({
                                      open: true,
                                      title: 'Delete Third Party',
                                      message: `Are you sure you want to delete "${tp.name}"?`,
                                      onConfirm: () => handleDeleteThirdParty(tp.id)
                                    })}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Service Items */}
              <TabsContent value="service-items" className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {selectedServiceId && (
                      <>
                        <Button
                          onClick={() => {
                            setSelectedItem(null);
                            setModalType('create-service-item');
                            setModalOpen(true);
                          }}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add Item
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => fetchServiceItems(selectedServiceId)} aria-label="Refresh service items">
                          <RefreshCw className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Select
                      value={selectedServiceId?.toString() || ''}
                      onValueChange={(value) => {
                        if (value) fetchServiceItems(parseInt(value));
                      }}
                    >
                      <SelectTrigger className="w-64">
                        <SelectValue placeholder="Select a service to view items" />
                      </SelectTrigger>
                      <SelectContent>
                        {services.map((service) => (
                          <SelectItem key={service.id} value={service.id.toString()}>
                            {service.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {!selectedServiceId ? (
                  <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                      <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Select a service from the dropdown above to view its items</p>
                      <p className="text-sm mt-2">Or click the <Package className="w-4 h-4 inline" /> icon on a service in the Services tab</p>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Items for Service #{selectedServiceId}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Image</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {loading ? (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center py-8">Loading...</TableCell>
                            </TableRow>
                          ) : serviceItems.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center py-8">No items found for this service</TableCell>
                            </TableRow>
                          ) : (
                            serviceItems.map((item) => (
                              <TableRow key={item.id}>
                                <TableCell>{item.id}</TableCell>
                                <TableCell className="font-medium">{item.name}</TableCell>
                                <TableCell className="max-w-xs truncate">{item.description || 'N/A'}</TableCell>
                                <TableCell>${(parseFloat(item.price) || 0).toFixed(2)}</TableCell>
                                <TableCell>
                                  {item.image ? (
                                    <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded" />
                                  ) : (
                                    <span className="text-muted-foreground">No image</span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-1">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => {
                                        setSelectedItem(item);
                                        setModalType('edit-service-item');
                                        setModalOpen(true);
                                      }}
                                    >
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="text-destructive"
                                      onClick={() => setConfirmDialog({
                                        open: true,
                                        title: 'Delete Item',
                                        message: `Are you sure you want to delete "${item.name}"?`,
                                        onConfirm: () => handleDeleteServiceItem(item.id)
                                      })}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Service Feedbacks */}
              <TabsContent value="service-feedbacks" className="space-y-4">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" onClick={fetchServiceFeedbacks} aria-label="Refresh service feedbacks">
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Service</TableHead>
                          <TableHead>User</TableHead>
                          <TableHead>Rating</TableHead>
                          <TableHead>Comment</TableHead>
                          <TableHead>Helpful</TableHead>
                          <TableHead>Created At</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loading ? (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center py-8">Loading...</TableCell>
                          </TableRow>
                        ) : serviceFeedbacks.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center py-8">No feedbacks found</TableCell>
                          </TableRow>
                        ) : (
                          serviceFeedbacks.map((feedback) => (
                            <TableRow key={feedback.id}>
                              <TableCell>{feedback.id}</TableCell>
                              <TableCell>{feedback.service?.name || feedback.service_id}</TableCell>
                              <TableCell>{feedback.user?.name || feedback.user_id}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-4 h-4 ${i < feedback.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                                    />
                                  ))}
                                </div>
                              </TableCell>
                              <TableCell className="max-w-xs truncate">{feedback.comment || 'N/A'}</TableCell>
                              <TableCell>{feedback.helpful_count || 0}</TableCell>
                              <TableCell>{new Date(feedback.created_at).toLocaleDateString()}</TableCell>
                              <TableCell>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-destructive"
                                  onClick={() => setConfirmDialog({
                                    open: true,
                                    title: 'Delete Feedback',
                                    message: 'Are you sure you want to delete this feedback?',
                                    onConfirm: () => handleDeleteFeedback(feedback.id)
                                  })}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </main>

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({...confirmDialog, open})}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmDialog.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog.message}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmDialog({...confirmDialog, open: false})}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmDialog.onConfirm) {
                  confirmDialog.onConfirm();
                }
                setConfirmDialog({...confirmDialog, open: false});
              }}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modals */}
      <AnimatePresence>
        {modalOpen && (
          <Dialog open={modalOpen} onOpenChange={setModalOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {modalType === 'view-user' && 'User Details'}
                  {modalType === 'edit-user' && 'Edit User'}
                  {modalType === 'view-car' && 'Car Details'}
                  {modalType === 'edit-car' && 'Edit Car'}
                  {modalType === 'view-booking' && 'Booking Details'}
                  {modalType === 'edit-booking' && 'Edit Booking'}
                  {modalType === 'create-announcement' && 'Create Announcement'}
                  {modalType === 'edit-announcement' && 'Edit Announcement'}
                  {modalType === 'edit-appeal' && 'Edit Appeal'}
                  {modalType === 'edit-ad' && 'Edit Ad'}
                  {modalType === 'edit-suggestion' && 'Edit Suggestion'}
                  {modalType === 'send-notification' && 'Send Notification to All Users'}
                  {modalType === 'create-holiday' && 'Create Holiday'}
                  {modalType === 'edit-holiday' && 'Edit Holiday'}
                  {modalType === 'create-ad' && 'Create Ad'}
                  {modalType === 'create-payment' && 'Issue Payment/Invoice'}
                  {modalType === 'create-featured-car' && 'Create Featured Car'}
                  {modalType === 'create-service' && 'Create Service'}
                  {modalType === 'view-service' && 'Service Details'}
                  {modalType === 'edit-service' && 'Edit Service'}
                  {modalType === 'create-third-party' && 'Create Third Party'}
                  {modalType === 'view-third-party' && 'Third Party Details'}
                  {modalType === 'edit-third-party' && 'Edit Third Party'}
                  {modalType === 'create-service-for-tp' && `Add Service for ${selectedItem?.third_party_name || 'Third Party'}`}
                  {modalType === 'create-service-item' && 'Create Service Item'}
                  {modalType === 'edit-service-item' && 'Edit Service Item'}
                  {modalType === 'create-promo-code' && 'Create Promo Code'}
                  {modalType === 'edit-promo-code' && 'Edit Promo Code'}
                  {modalType === 'create-broker' && 'Create Broker'}
                  {modalType === 'create-broker-payout' && 'Create Broker Payout'}
                  {modalType === 'view-promo-users' && 'Promo Code Users'}
                </DialogTitle>
              </DialogHeader>
              
              {/* View User Details Modal */}
              {modalType === 'view-user' && selectedItem && (
                <div className="space-y-4 max-h-[70vh] overflow-y-auto">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-semibold">ID</Label>
                      <p className="text-sm">{selectedItem.id}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold">Username</Label>
                      <p className="text-sm">{selectedItem.username || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold">Email</Label>
                      <p className="text-sm">{selectedItem.email || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold">Phone Number</Label>
                      <p className="text-sm">{selectedItem.phone_number || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold">First Name</Label>
                      <p className="text-sm">{selectedItem.first_name || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold">Last Name</Label>
                      <p className="text-sm">{selectedItem.last_name || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold">Gender</Label>
                      <p className="text-sm">{selectedItem.gender || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold">Birth Date</Label>
                      <p className="text-sm">{selectedItem.birth_date ? new Date(selectedItem.birth_date).toLocaleDateString() : 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold">City</Label>
                      <p className="text-sm">{selectedItem.city || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold">Role</Label>
                      <p className="text-sm">{selectedItem.role || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold">Status</Label>
                      <Badge variant={selectedItem.status ? "default" : "secondary"}>
                        {selectedItem.status ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold">Verified by Admin</Label>
                      <Badge variant={selectedItem.verified_by_admin ? "default" : "secondary"}>
                        {selectedItem.verified_by_admin ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold">Is Locked</Label>
                      <Badge variant={selectedItem.is_locked ? "destructive" : "default"}>
                        {selectedItem.is_locked ? 'Locked' : 'Unlocked'}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold">Created At</Label>
                      <p className="text-sm">{new Date(selectedItem.created_at).toLocaleString()}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold">Updated At</Label>
                      <p className="text-sm">{new Date(selectedItem.updated_at).toLocaleString()}</p>
                    </div>
                  </div>
                  {selectedItem.bio && (
                    <div>
                      <Label className="text-sm font-semibold">Bio</Label>
                      <p className="text-sm">{selectedItem.bio}</p>
                    </div>
                  )}
                  {selectedItem.client && (
                    <div className="border-t pt-4">
                      <Label className="text-sm font-semibold mb-2 block">Client Details</Label>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs">License Number</Label>
                          <p className="text-sm">{selectedItem.client.license_number || 'N/A'}</p>
                        </div>
                        <div>
                          <Label className="text-xs">Profession</Label>
                          <p className="text-sm">{selectedItem.client.profession || 'N/A'}</p>
                        </div>
                        <div>
                          <Label className="text-xs">Average Salary</Label>
                          <p className="text-sm">{selectedItem.client.avg_salary || 'N/A'}</p>
                        </div>
                        <div>
                          <Label className="text-xs">Promo Code</Label>
                          <p className="text-sm">{selectedItem.client.promo_code || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  {selectedItem.agent && (
                    <div className="border-t pt-4">
                      <Label className="text-sm font-semibold mb-2 block">Agent/Agency Details</Label>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs">Business Type</Label>
                          <p className="text-sm">{selectedItem.agent.business_type || 'N/A'}</p>
                        </div>
                        <div>
                          <Label className="text-xs">Company Number</Label>
                          <p className="text-sm">{selectedItem.agent.company_number || 'N/A'}</p>
                        </div>
                        <div>
                          <Label className="text-xs">Profession</Label>
                          <p className="text-sm">{selectedItem.agent.profession || 'N/A'}</p>
                        </div>
                        <div>
                          <Label className="text-xs">Website</Label>
                          <p className="text-sm">{selectedItem.agent.website || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="flex gap-2 pt-4">
                    <Button onClick={() => {
                      setModalType('edit-user');
                    }} className="flex-1">
                      Edit User
                    </Button>
                    <Button variant="outline" onClick={() => setModalOpen(false)}>
                      Close
                    </Button>
                  </div>
                </div>
              )}

              {/* Edit User Modal */}
              {modalType === 'edit-user' && selectedItem && (
                <div className="space-y-4 max-h-[70vh] overflow-y-auto">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>ID</Label>
                      <Input value={selectedItem.id || ''} disabled />
                    </div>
                    <div>
                      <Label>Username</Label>
                      <Input value={selectedItem.username || ''} disabled />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input type="email" value={selectedItem.email || ''} disabled />
                    </div>
                    <div>
                      <Label>Phone Number</Label>
                      <Input value={selectedItem.phone_number || ''} disabled />
                    </div>
                    <div>
                      <Label>First Name</Label>
                      <Input value={selectedItem.first_name || ''} disabled />
                    </div>
                    <div>
                      <Label>Last Name</Label>
                      <Input value={selectedItem.last_name || ''} disabled />
                    </div>
                    <div>
                      <Label>Gender</Label>
                      <Input value={selectedItem.gender || 'N/A'} disabled />
                    </div>
                    <div>
                      <Label>Birth Date</Label>
                      <Input
                        type="date"
                        value={selectedItem.birth_date ? new Date(selectedItem.birth_date).toISOString().split('T')[0] : ''}
                        disabled
                      />
                    </div>
                    <div>
                      <Label>City</Label>
                      <Input value={selectedItem.city || ''} disabled />
                    </div>
                    <div>
                      <Label>Role</Label>
                      <Input value={selectedItem.role || ''} disabled />
                    </div>
                    <div>
                      <Label>Created At</Label>
                      <Input value={new Date(selectedItem.created_at).toLocaleString()} disabled />
                    </div>
                    <div>
                      <Label>Updated At</Label>
                      <Input value={new Date(selectedItem.updated_at).toLocaleString()} disabled />
                    </div>
                  </div>
                  <div>
                    <Label>Bio</Label>
                    <Textarea value={selectedItem.bio || ''} disabled />
                  </div>
                  {selectedItem.client && (
                    <div className="border-t pt-4">
                      <Label className="text-sm font-semibold mb-2 block">Client Details (Read-only)</Label>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs">License Number</Label>
                          <Input value={selectedItem.client.license_number || 'N/A'} disabled />
                        </div>
                        <div>
                          <Label className="text-xs">Profession</Label>
                          <Input value={selectedItem.client.profession || 'N/A'} disabled />
                        </div>
                        <div>
                          <Label className="text-xs">Average Salary</Label>
                          <Input value={selectedItem.client.avg_salary || 'N/A'} disabled />
                        </div>
                        <div>
                          <Label className="text-xs">Promo Code</Label>
                          <Input value={selectedItem.client.promo_code || 'N/A'} disabled />
                        </div>
                      </div>
                    </div>
                  )}
                  {selectedItem.agent && (
                    <div className="border-t pt-4">
                      <Label className="text-sm font-semibold mb-2 block">Agent/Agency Details (Read-only)</Label>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs">Business Type</Label>
                          <Input value={selectedItem.agent.business_type || 'N/A'} disabled />
                        </div>
                        <div>
                          <Label className="text-xs">Company Number</Label>
                          <Input value={selectedItem.agent.company_number || 'N/A'} disabled />
                        </div>
                        <div>
                          <Label className="text-xs">Profession</Label>
                          <Input value={selectedItem.agent.profession || 'N/A'} disabled />
                        </div>
                        <div>
                          <Label className="text-xs">Website</Label>
                          <Input value={selectedItem.agent.website || 'N/A'} disabled />
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="border-t pt-4 space-y-3">
                    <Label className="text-sm font-semibold block">Editable Fields</Label>
                    {selectedItem.verified_by_admin && (
                      <div className="flex items-center justify-between">
                        <Label>Verified by Admin (can revoke only)</Label>
                        <Switch
                          checked={selectedItem.verified_by_admin || false}
                          onCheckedChange={(checked) => setSelectedItem({...selectedItem, verified_by_admin: checked})}
                        />
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <Label>Status (Active)</Label>
                      <Switch
                        checked={selectedItem.status !== undefined ? selectedItem.status : true}
                        onCheckedChange={(checked) => setSelectedItem({...selectedItem, status: checked})}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Is Locked</Label>
                      <Switch
                        checked={selectedItem.is_locked || false}
                        onCheckedChange={(checked) => setSelectedItem({...selectedItem, is_locked: checked})}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Update Access (Allow Profile Updates)</Label>
                      <Switch
                        checked={selectedItem.update_access !== undefined ? selectedItem.update_access : true}
                        onCheckedChange={(checked) => setSelectedItem({...selectedItem, update_access: checked})}
                      />
                    </div>
                  </div>
                  {/* App Fees Management for Agents */}
                  {(selectedItem.role === 'agency' || selectedItem.role === 'agent') && (
                    <div className="border-t pt-4 space-y-3">
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-sm font-semibold">App Fees Management</Label>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={async () => {
                            await fetchAgentAppFeesBalance(selectedItem.id);
                          }}
                        >
                          <RefreshCw className="w-4 h-4 mr-1" />
                          Refresh Balance
                        </Button>
                      </div>
                      {appFeesData[selectedItem.id] ? (
                        <div className="space-y-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                          <div className="flex justify-between">
                            <span className="text-sm">Current App Fees %:</span>
                            <span className="font-semibold">{appFeesData[selectedItem.id].app_fees_percentage || 0}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Total Balance:</span>
                            <span className="font-semibold">${appFeesData[selectedItem.id].total_balance || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Paid Amount:</span>
                            <span className="text-green-600">${appFeesData[selectedItem.id].breakdown?.paid_amount || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Remaining Balance:</span>
                            <span className="text-orange-600">${appFeesData[selectedItem.id].breakdown?.remaining_balance || 0}</span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">Click "Refresh Balance" to load app fees data</p>
                      )}
                      <div className="space-y-2">
                        <Label>Update App Fees Percentage</Label>
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            placeholder="e.g., 10.00"
                            defaultValue={appFeesData[selectedItem.id]?.app_fees_percentage || ''}
                            onChange={(e) => {
                              const value = parseFloat(e.target.value);
                              if (!isNaN(value) && value >= 0 && value <= 100) {
                                setSelectedItem({
                                  ...selectedItem,
                                  app_fees_percentage: value
                                });
                              }
                            }}
                          />
                          <Button
                            onClick={() => {
                              if (selectedItem.app_fees_percentage !== undefined) {
                                updateAgentAppFeesPercentage(selectedItem.id, selectedItem.app_fees_percentage);
                              } else {
                                toast.error('Please enter a valid app fees percentage');
                              }
                            }}
                            variant="outline"
                          >
                            Update %
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500">Enter percentage (0-100), e.g., 10.00 for 10%</p>
                      </div>
                    </div>
                  )}
                  <div className="flex gap-2 pt-4">
                    <Button onClick={() => updateUser(selectedItem.id, {
                      verified_by_admin: selectedItem.verified_by_admin,
                      status: selectedItem.status,
                      is_locked: selectedItem.is_locked,
                      update_access: selectedItem.update_access !== undefined ? selectedItem.update_access : true
                    })} className="flex-1">
                      Update User
                    </Button>
                    <Button variant="outline" onClick={() => setModalOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* View Car Details Modal */}
              {modalType === 'view-car' && selectedItem && (
                <div className="space-y-4 max-h-[70vh] overflow-y-auto">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-semibold">ID</Label>
                      <p className="text-sm">{selectedItem.id}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold">Make</Label>
                      <p className="text-sm">{selectedItem.make || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold">Model</Label>
                      <p className="text-sm">{selectedItem.model || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold">Year</Label>
                      <p className="text-sm">{selectedItem.year || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold">License Plate</Label>
                      <p className="text-sm">{selectedItem.license_plate || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold">Color</Label>
                      <p className="text-sm">{selectedItem.color || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold">Mileage</Label>
                      <p className="text-sm">{selectedItem.mileage?.toLocaleString() || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold">Fuel Type</Label>
                      <p className="text-sm">{selectedItem.fuel_type || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold">Transmission</Label>
                      <p className="text-sm">{selectedItem.transmission || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold">Wheels Drive</Label>
                      <p className="text-sm">{selectedItem.wheels_drive || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold">Category</Label>
                      <p className="text-sm">{selectedItem.car_category || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold">Seats</Label>
                      <p className="text-sm">{selectedItem.seats || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold">Doors</Label>
                      <p className="text-sm">{selectedItem.doors || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold">Daily Rate</Label>
                      <p className="text-sm">${selectedItem.daily_rate || '0.00'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold">Holiday Rate</Label>
                      <p className="text-sm">${selectedItem.holiday_rate || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold">Status</Label>
                      <Badge variant="outline">{selectedItem.status || 'N/A'}</Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold">Car Accepted</Label>
                      <Badge variant={selectedItem.car_accepted ? "default" : "secondary"}>
                        {selectedItem.car_accepted ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold">With Driver</Label>
                      <Badge variant={selectedItem.with_driver ? "default" : "secondary"}>
                        {selectedItem.with_driver ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold">Is Delivered</Label>
                      <Badge variant={selectedItem.is_delivered ? "default" : "secondary"}>
                        {selectedItem.is_delivered ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold">Min Rental Days</Label>
                      <p className="text-sm">{selectedItem.min_rental_days || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold">Views Count</Label>
                      <p className="text-sm">{selectedItem.views_count || 0}</p>
                    </div>
                  </div>
                  {selectedItem.features && selectedItem.features.length > 0 && (
                    <div>
                      <Label className="text-sm font-semibold">Features</Label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedItem.features.map((feature, idx) => (
                          <Badge key={idx} variant="outline">{feature}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedItem.car_add_on && selectedItem.car_add_on.length > 0 && (
                    <div>
                      <Label className="text-sm font-semibold">Add-ons</Label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedItem.car_add_on.map((addon, idx) => (
                          <Badge key={idx} variant="outline">{addon}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedItem.notes && (
                    <div>
                      <Label className="text-sm font-semibold">Notes</Label>
                      <p className="text-sm whitespace-pre-wrap">{selectedItem.notes}</p>
                    </div>
                  )}
                  {selectedItem.agent && (
                    <div className="border-t pt-4">
                      <Label className="text-sm font-semibold mb-2 block">Agent</Label>
                      <p className="text-sm">{selectedItem.agent.username || selectedItem.agent.first_name} {selectedItem.agent.last_name}</p>
                      <p className="text-xs text-gray-500">{selectedItem.agent.phone_number}</p>
                    </div>
                  )}
                  <div className="flex gap-2 pt-4">
                    <Button onClick={() => {
                      setModalType('edit-car');
                    }} className="flex-1">
                      Edit Car
                    </Button>
                    <Button variant="outline" onClick={() => setModalOpen(false)}>
                      Close
                    </Button>
                  </div>
                </div>
              )}

              {/* Edit Car Modal */}
              {modalType === 'edit-car' && selectedItem && (
                <div className="space-y-4 max-h-[70vh] overflow-y-auto">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>ID</Label>
                      <Input value={selectedItem.id || ''} disabled />
                    </div>
                    <div>
                      <Label>Make</Label>
                      <Input value={selectedItem.make || ''} disabled />
                    </div>
                    <div>
                      <Label>Model</Label>
                      <Input value={selectedItem.model || ''} disabled />
                    </div>
                    <div>
                      <Label>Year</Label>
                      <Input value={selectedItem.year || ''} disabled />
                    </div>
                    <div>
                      <Label>License Plate</Label>
                      <Input value={selectedItem.license_plate || ''} disabled />
                    </div>
                    <div>
                      <Label>Color</Label>
                      <Input value={selectedItem.color || ''} disabled />
                    </div>
                    <div>
                      <Label>Mileage</Label>
                      <Input value={selectedItem.mileage?.toLocaleString() || ''} disabled />
                    </div>
                    <div>
                      <Label>Fuel Type</Label>
                      <Input value={selectedItem.fuel_type || ''} disabled />
                    </div>
                    <div>
                      <Label>Transmission</Label>
                      <Input value={selectedItem.transmission || ''} disabled />
                    </div>
                    <div>
                      <Label>Wheels Drive</Label>
                      <Input value={selectedItem.wheels_drive || ''} disabled />
                    </div>
                    <div>
                      <Label>Category</Label>
                      <Input value={selectedItem.car_category || ''} disabled />
                    </div>
                    <div>
                      <Label>Seats</Label>
                      <Input value={selectedItem.seats || ''} disabled />
                    </div>
                    <div>
                      <Label>Doors</Label>
                      <Input value={selectedItem.doors || ''} disabled />
                    </div>
                    <div>
                      <Label>Daily Rate</Label>
                      <Input value={`$${selectedItem.daily_rate || '0.00'}`} disabled />
                    </div>
                    <div>
                      <Label>Holiday Rate</Label>
                      <Input value={`$${selectedItem.holiday_rate || 'N/A'}`} disabled />
                    </div>
                    <div>
                      <Label>Min Rental Days</Label>
                      <Input value={selectedItem.min_rental_days || ''} disabled />
                    </div>
                    <div>
                      <Label>Views Count</Label>
                      <Input value={selectedItem.views_count || 0} disabled />
                    </div>
                  </div>
                  {selectedItem.features && selectedItem.features.length > 0 && (
                    <div>
                      <Label>Features</Label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedItem.features.map((feature, idx) => (
                          <Badge key={idx} variant="outline">{feature}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedItem.car_add_on && selectedItem.car_add_on.length > 0 && (
                    <div>
                      <Label>Add-ons</Label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedItem.car_add_on.map((addon, idx) => (
                          <Badge key={idx} variant="outline">{addon}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Car Images Section */}
                  <div className="border-t pt-4">
                    <Label className="text-sm font-semibold block mb-3">Car Images</Label>
                    <div className="grid grid-cols-2 gap-4">
                      {/* Main Image */}
                      <div>
                        <Label>Main Image</Label>
                        {selectedItem.main_image_url && (
                          <div className="mb-2">
                            <img 
                              src={`/api/storage/${selectedItem.main_image_url}`} 
                              alt="Main" 
                              className="w-full h-32 object-cover rounded-lg border"
                            />
                          </div>
                        )}
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleCarImageChange(selectedItem.id, 'main_image', e.target.files[0])}
                          className="mt-1"
                        />
                      </div>
                      
                      {/* Front Image */}
                      <div>
                        <Label>Front Image</Label>
                        {selectedItem.front_image_url && (
                          <div className="mb-2">
                            <img 
                              src={`/api/storage/${selectedItem.front_image_url}`} 
                              alt="Front" 
                              className="w-full h-32 object-cover rounded-lg border"
                            />
                          </div>
                        )}
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleCarImageChange(selectedItem.id, 'front_image', e.target.files[0])}
                          className="mt-1"
                        />
                      </div>
                      
                      {/* Back Image */}
                      <div>
                        <Label>Back Image</Label>
                        {selectedItem.back_image_url && (
                          <div className="mb-2">
                            <img 
                              src={`/api/storage/${selectedItem.back_image_url}`} 
                              alt="Back" 
                              className="w-full h-32 object-cover rounded-lg border"
                            />
                          </div>
                        )}
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleCarImageChange(selectedItem.id, 'back_image', e.target.files[0])}
                          className="mt-1"
                        />
                      </div>
                      
                      {/* Left Image */}
                      <div>
                        <Label>Left Image</Label>
                        {selectedItem.left_image_url && (
                          <div className="mb-2">
                            <img 
                              src={`/api/storage/${selectedItem.left_image_url}`} 
                              alt="Left" 
                              className="w-full h-32 object-cover rounded-lg border"
                            />
                          </div>
                        )}
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleCarImageChange(selectedItem.id, 'left_image', e.target.files[0])}
                          className="mt-1"
                        />
                      </div>
                      
                      {/* Right Image */}
                      <div>
                        <Label>Right Image</Label>
                        {selectedItem.right_image_url && (
                          <div className="mb-2">
                            <img 
                              src={`/api/storage/${selectedItem.right_image_url}`} 
                              alt="Right" 
                              className="w-full h-32 object-cover rounded-lg border"
                            />
                          </div>
                        )}
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleCarImageChange(selectedItem.id, 'right_image', e.target.files[0])}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <Label className="text-sm font-semibold block mb-3">Editable Fields</Label>
                    <div>
                      <Label>Status</Label>
                      <Select
                        value={selectedItem.status || ''}
                        onValueChange={(value) => setSelectedItem({...selectedItem, status: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="available">Available</SelectItem>
                          <SelectItem value="rented">Rented</SelectItem>
                          <SelectItem value="maintenance">Maintenance</SelectItem>
                          <SelectItem value="unavailable">Unavailable</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="mt-3">
                      <Label>Notes</Label>
                      <Textarea
                        value={selectedItem.notes || ''}
                        onChange={(e) => setSelectedItem({...selectedItem, notes: e.target.value})}
                        rows={4}
                      />
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <Label>Car Accepted</Label>
                      <Switch
                        checked={selectedItem.car_accepted || false}
                        onCheckedChange={(checked) => setSelectedItem({...selectedItem, car_accepted: checked})}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button onClick={() => updateCar(selectedItem.id, {
                      status: selectedItem.status,
                      car_accepted: selectedItem.car_accepted,
                      notes: selectedItem.notes
                    })} className="flex-1" disabled={loading}>
                      Update Car
                    </Button>
                    <Button variant="outline" onClick={() => setModalOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* View Booking Details Modal */}
              {modalType === 'view-booking' && selectedItem && (
                <div className="space-y-4 max-h-[70vh] overflow-y-auto">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-semibold">Booking ID</Label>
                      <p className="text-sm">{selectedItem.id}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold">Client</Label>
                      <p className="text-sm">
                        {selectedItem.client?.first_name && selectedItem.client?.last_name
                          ? `${selectedItem.client.first_name} ${selectedItem.client.last_name}`
                          : selectedItem.client?.username || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold">Car</Label>
                      <p className="text-sm">{selectedItem.car?.make} {selectedItem.car?.model} ({selectedItem.car?.year})</p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold">Agent</Label>
                      <p className="text-sm">
                        {selectedItem.car?.agent?.username || selectedItem.car?.agent?.first_name || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold">Start Date</Label>
                      <p className="text-sm">{new Date(selectedItem.start_datetime).toLocaleString()}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold">End Date</Label>
                      <p className="text-sm">{new Date(selectedItem.end_datetime).toLocaleString()}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold">Total Price</Label>
                      <p className="text-sm font-semibold">${selectedItem.total_booking_price || '0.00'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold">Booking Status</Label>
                      <Badge variant="outline">{selectedItem.booking_request_status || 'N/A'}</Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold">Payment Status</Label>
                      <Badge variant={selectedItem.payment_status === 'paid' ? "default" : "secondary"}>
                        {selectedItem.payment_status || 'N/A'}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold">Payment Method</Label>
                      <p className="text-sm">{selectedItem.payment_method || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold">Is Paid Online</Label>
                      <Badge variant={selectedItem.is_paid_online ? "default" : "secondary"}>
                        {selectedItem.is_paid_online ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold">Is Delivered</Label>
                      <Badge variant={selectedItem.is_delivered ? "default" : "secondary"}>
                        {selectedItem.is_delivered ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold">Pickup Location</Label>
                      <p className="text-sm">{selectedItem.pickup_location || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold">Dropoff Location</Label>
                      <p className="text-sm">{selectedItem.dropoff_location || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold">Reason of Booking</Label>
                      <p className="text-sm">{selectedItem.reason_of_booking || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold">Extra Charge</Label>
                      <p className="text-sm">${selectedItem.extra_charge || '0.00'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold">Cancellation Date</Label>
                      <p className="text-sm">{selectedItem.cancelation_date ? new Date(selectedItem.cancelation_date).toLocaleString() : 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold">Cancellation Reason</Label>
                      <p className="text-sm">{selectedItem.cancelation_reason || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold">Created At</Label>
                      <p className="text-sm">{new Date(selectedItem.created_at).toLocaleString()}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold">Updated At</Label>
                      <p className="text-sm">{new Date(selectedItem.updated_at).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button onClick={() => {
                      setModalType('edit-booking');
                    }} className="flex-1">
                      Edit Booking
                    </Button>
                    <Button variant="outline" onClick={() => setModalOpen(false)}>
                      Close
                    </Button>
                  </div>
                </div>
              )}

              {/* Edit Booking Modal */}
              {modalType === 'edit-booking' && selectedItem && (
                <div className="space-y-4 max-h-[70vh] overflow-y-auto">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Booking ID</Label>
                      <Input value={selectedItem.id || ''} disabled />
                    </div>
                    <div>
                      <Label>Client</Label>
                      <Input
                        value={
                          selectedItem.client?.first_name && selectedItem.client?.last_name
                            ? `${selectedItem.client.first_name} ${selectedItem.client.last_name}`
                            : selectedItem.client?.username || 'N/A'
                        }
                        disabled
                      />
                    </div>
                    <div>
                      <Label>Car</Label>
                      <Input
                        value={`${selectedItem.car?.make || ''} ${selectedItem.car?.model || ''} (${selectedItem.car?.year || ''})`}
                        disabled
                      />
                    </div>
                    <div>
                      <Label>Start Date & Time</Label>
                      <Input
                        value={new Date(selectedItem.start_datetime).toLocaleString()}
                        disabled
                      />
                    </div>
                    <div>
                      <Label>End Date & Time</Label>
                      <Input
                        value={new Date(selectedItem.end_datetime).toLocaleString()}
                        disabled
                      />
                    </div>
                    <div>
                      <Label>Payment Status</Label>
                      <Input value={selectedItem.payment_status || 'N/A'} disabled />
                    </div>
                    <div>
                      <Label>Payment Method</Label>
                      <Input value={selectedItem.payment_method || 'N/A'} disabled />
                    </div>
                    <div>
                      <Label>Is Paid Online</Label>
                      <Input value={selectedItem.is_paid_online ? 'Yes' : 'No'} disabled />
                    </div>
                    <div>
                      <Label>Is Delivered</Label>
                      <Input value={selectedItem.is_delivered ? 'Yes' : 'No'} disabled />
                    </div>
                    <div>
                      <Label>Pickup Location</Label>
                      <Input value={selectedItem.pickup_location || 'N/A'} disabled />
                    </div>
                    <div>
                      <Label>Dropoff Location</Label>
                      <Input value={selectedItem.dropoff_location || 'N/A'} disabled />
                    </div>
                    <div>
                      <Label>Reason of Booking</Label>
                      <Input value={selectedItem.reason_of_booking || 'N/A'} disabled />
                    </div>
                    <div>
                      <Label>Extra Charge</Label>
                      <Input value={`$${selectedItem.extra_charge || '0.00'}`} disabled />
                    </div>
                    <div>
                      <Label>Cancellation Date</Label>
                      <Input
                        value={selectedItem.cancelation_date ? new Date(selectedItem.cancelation_date).toLocaleString() : 'N/A'}
                        disabled
                      />
                    </div>
                    <div>
                      <Label>Cancellation Reason</Label>
                      <Input value={selectedItem.cancelation_reason || 'N/A'} disabled />
                    </div>
                    <div>
                      <Label>Created At</Label>
                      <Input value={new Date(selectedItem.created_at).toLocaleString()} disabled />
                    </div>
                    <div>
                      <Label>Updated At</Label>
                      <Input value={new Date(selectedItem.updated_at).toLocaleString()} disabled />
                    </div>
                  </div>
                  <div className="border-t pt-4">
                    <Label className="text-sm font-semibold block mb-3">Editable Fields</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Booking Status</Label>
                        <Select
                          value={selectedItem.booking_request_status || ''}
                          onValueChange={(value) => setSelectedItem({...selectedItem, booking_request_status: value})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Total Booking Price</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={selectedItem.total_booking_price || ''}
                          onChange={(e) => setSelectedItem({...selectedItem, total_booking_price: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button onClick={() => updateBooking(selectedItem.id, {
                      booking_request_status: selectedItem.booking_request_status,
                      total_booking_price: selectedItem.total_booking_price
                    })} className="flex-1">
                      Update Booking
                    </Button>
                    <Button variant="outline" onClick={() => setModalOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Create/Edit Announcement Modal */}
              {(modalType === 'create-announcement' || modalType === 'edit-announcement') && (
                <AnnouncementForm
                  announcement={selectedItem}
                  onSubmit={(data) => {
                    if (modalType === 'create-announcement') {
                      createAnnouncement(data);
                    } else {
                      updateAnnouncement(selectedItem.id, data);
                    }
                  }}
                />
              )}

              {/* Edit Appeal Modal */}
              {modalType === 'edit-appeal' && selectedItem && (
                <div className="space-y-4">
                  <div>
                    <Label>Status</Label>
                    <Select
                      value={selectedItem.status}
                      onValueChange={(value) => setSelectedItem({...selectedItem, status: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="submitted">Submitted</SelectItem>
                        <SelectItem value="under_review">Under Review</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                        <SelectItem value="escalated">Escalated</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Priority</Label>
                    <Select
                      value={selectedItem.priority}
                      onValueChange={(value) => setSelectedItem({...selectedItem, priority: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Response</Label>
                    <Textarea
                      value={selectedItem.response || ''}
                      onChange={(e) => setSelectedItem({...selectedItem, response: e.target.value})}
                    />
                  </div>
                  <Button onClick={() => updateAppeal(selectedItem.id, {
                    status: selectedItem.status,
                    priority: selectedItem.priority,
                    response: selectedItem.response
                  })}>
                    Update Appeal
                  </Button>
                </div>
              )}

              {/* Edit Ad Modal */}
              {modalType === 'edit-ad' && selectedItem && (
                <div className="space-y-4">
                  <div>
                    <Label>Online</Label>
                    <Switch
                      checked={selectedItem.online}
                      onCheckedChange={(checked) => setSelectedItem({...selectedItem, online: checked})}
                    />
                  </div>
                  <Button onClick={() => updateAd(selectedItem.id, {
                    online: selectedItem.online
                  })}>
                    Update Ad
                  </Button>
                </div>
              )}

              {/* Edit Suggestion Modal */}
              {modalType === 'edit-suggestion' && selectedItem && (
                <div className="space-y-4">
                  <div>
                    <Label>Status</Label>
                    <Select
                      value={selectedItem.status}
                      onValueChange={(value) => setSelectedItem({...selectedItem, status: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="received">Received</SelectItem>
                        <SelectItem value="implemented">Implemented</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={() => updateSuggestion(selectedItem.id, {
                    status: selectedItem.status
                  })}>
                    Update Suggestion
                  </Button>
                </div>
              )}

              {/* Send Notification Modal */}
              {modalType === 'send-notification' && (
                <NotificationForm
                  onSubmit={(data) => sendNotificationToAll(data)}
                />
              )}

              {/* Create/Edit Holiday Modal */}
              {(modalType === 'create-holiday' || modalType === 'edit-holiday') && (
                <HolidayForm
                  holiday={selectedItem}
                  onSubmit={(data) => {
                    if (modalType === 'create-holiday') {
                      createHoliday(data);
                    } else {
                      updateHoliday(selectedItem.id, data);
                    }
                  }}
                />
              )}

              {/* Create Ad Modal */}
              {modalType === 'create-ad' && (
                <AdForm
                  onSubmit={createAdHandler}
                  loading={loading}
                />
              )}

              {/* Create Payment/Invoice Modal */}
              {modalType === 'create-payment' && (
                <PaymentForm
                  onSubmit={createPaymentHandler}
                  loading={loading}
                />
              )}

              {/* Create Featured Car Modal */}
              {modalType === 'create-featured-car' && (
                <FeaturedCarForm
                  onSubmit={createFeaturedCarHandler}
                  loading={loading}
                />
              )}

              {/* View Service Modal */}
              {modalType === 'view-service' && selectedItem && (
                <div className="space-y-4 max-h-[70vh] overflow-y-auto">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-semibold">ID</Label>
                      <p className="text-sm">{selectedItem.id}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold">Name</Label>
                      <p className="text-sm">{selectedItem.name || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold">Category</Label>
                      <p className="text-sm">{selectedItem.category || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold">Price</Label>
                      <p className="text-sm">${selectedItem.price?.toFixed(2) || '0.00'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold">Rating</Label>
                      <p className="text-sm">{selectedItem.rating?.toFixed(1) || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold">Featured</Label>
                      <Badge variant={selectedItem.featured ? "default" : "secondary"}>
                        {selectedItem.featured ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold">City</Label>
                      <p className="text-sm">{selectedItem.city || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold">Clicks</Label>
                      <p className="text-sm">{selectedItem.clicks || 0}</p>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold">Description</Label>
                    <p className="text-sm">{selectedItem.description || 'N/A'}</p>
                  </div>
                  {selectedItem.images && selectedItem.images.length > 0 && (
                    <div>
                      <Label className="text-sm font-semibold">Images</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedItem.images.map((img, idx) => (
                          <img key={idx} src={img} alt={`Service ${idx + 1}`} className="w-20 h-20 object-cover rounded" />
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex gap-2 pt-4">
                    <Button onClick={() => setModalType('edit-service')} className="flex-1">
                      Edit Service
                    </Button>
                    <Button variant="outline" onClick={() => setModalOpen(false)}>
                      Close
                    </Button>
                  </div>
                </div>
              )}

              {/* Create/Edit Service Modal */}
              {(modalType === 'create-service' || modalType === 'edit-service') && (
                <ServiceForm
                  service={modalType === 'edit-service' ? selectedItem : null}
                  thirdParties={thirdParties}
                  onSubmit={(data) => {
                    if (modalType === 'edit-service' && selectedItem) {
                      handleUpdateService(selectedItem.id, data);
                    } else {
                      handleCreateService(data);
                    }
                  }}
                />
              )}

              {/* Create Broker Payout Modal */}
              {modalType === 'create-broker-payout' && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Record a payment to a broker. Amount will be allocated to pending commissions (FIFO).
                  </p>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label>Broker *</Label>
                      <Select
                        value={payoutForm.broker_id || 'select'}
                        onValueChange={(v) => setPayoutForm((prev) => ({ ...prev, broker_id: v }))}
                        disabled={!!selectedBroker?.id}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select broker" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="select">Select broker</SelectItem>
                          {(Array.isArray(brokers) ? brokers : []).map((b) => (
                            <SelectItem key={b.id} value={String(b.id)}>
                              {b.username || `${b.first_name || ''} ${b.last_name || ''}` || `Broker #${b.id}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Amount *</Label>
                      <Input
                        type="number"
                        min={0.01}
                        step={0.01}
                        value={payoutForm.amount}
                        onChange={(e) => setPayoutForm((prev) => ({ ...prev, amount: e.target.value }))}
                        placeholder="e.g. 300.00"
                      />
                      {brokerBalance?.balance != null && selectedBroker && (
                        <p className="text-xs text-muted-foreground mt-1">Balance: ${Number(brokerBalance.balance).toFixed(2)}</p>
                      )}
                    </div>
                    <div>
                      <Label>Reference</Label>
                      <Input
                        value={payoutForm.reference}
                        onChange={(e) => setPayoutForm((prev) => ({ ...prev, reference: e.target.value }))}
                        placeholder="e.g. BANK-REF-123"
                        maxLength={255}
                      />
                    </div>
                    <div>
                      <Label>Notes</Label>
                      <Textarea
                        value={payoutForm.notes}
                        onChange={(e) => setPayoutForm((prev) => ({ ...prev, notes: e.target.value.slice(0, 1000) }))}
                        placeholder="Optional notes"
                        rows={3}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
                    <Button onClick={handleCreateBrokerPayout} disabled={loading || !payoutForm.broker_id || payoutForm.broker_id === 'select' || !payoutForm.amount || parseFloat(payoutForm.amount) < 0.01}>
                      {loading ? 'Creating...' : 'Create Payout'}
                    </Button>
                  </div>
                </div>
              )}

              {/* Create Broker Modal */}
              {modalType === 'create-broker' && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Create a new broker user (role: broker). Brokers can be assigned promo codes for the referral program.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Username *</Label>
                      <Input
                        value={brokerForm.username}
                        onChange={(e) => setBrokerForm((prev) => ({ ...prev, username: e.target.value }))}
                        placeholder="broker_john"
                        maxLength={100}
                      />
                    </div>
                    <div>
                      <Label>Phone number *</Label>
                      <Input
                        value={brokerForm.phone_number}
                        onChange={(e) => setBrokerForm((prev) => ({ ...prev, phone_number: e.target.value }))}
                        placeholder="9613123456"
                        maxLength={20}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label>Email</Label>
                      <Input
                        type="email"
                        value={brokerForm.email}
                        onChange={(e) => setBrokerForm((prev) => ({ ...prev, email: e.target.value }))}
                        placeholder="john@example.com (optional)"
                      />
                    </div>
                    <div>
                      <Label>Password *</Label>
                      <Input
                        type="password"
                        value={brokerForm.password}
                        onChange={(e) => setBrokerForm((prev) => ({ ...prev, password: e.target.value }))}
                        placeholder="Min 6 characters"
                      />
                    </div>
                    <div>
                      <Label>Confirm password *</Label>
                      <Input
                        type="password"
                        value={brokerForm.password_confirmation}
                        onChange={(e) => setBrokerForm((prev) => ({ ...prev, password_confirmation: e.target.value }))}
                        placeholder="Repeat password"
                      />
                    </div>
                    <div>
                      <Label>First name *</Label>
                      <Input
                        value={brokerForm.first_name}
                        onChange={(e) => setBrokerForm((prev) => ({ ...prev, first_name: e.target.value }))}
                        placeholder="John"
                        maxLength={100}
                      />
                    </div>
                    <div>
                      <Label>Last name *</Label>
                      <Input
                        value={brokerForm.last_name}
                        onChange={(e) => setBrokerForm((prev) => ({ ...prev, last_name: e.target.value }))}
                        placeholder="Doe"
                        maxLength={100}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button variant="outline" onClick={() => setModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateBroker}
                      disabled={
                        loading ||
                        !brokerForm.username?.trim() ||
                        !brokerForm.phone_number?.trim() ||
                        !brokerForm.first_name?.trim() ||
                        !brokerForm.last_name?.trim() ||
                        !brokerForm.password ||
                        brokerForm.password.length < 6 ||
                        brokerForm.password !== brokerForm.password_confirmation
                      }
                    >
                      {loading ? 'Creating...' : 'Create Broker'}
                    </Button>
                  </div>
                </div>
              )}

              {/* Create / Edit Promo Code Modal */}
              {(modalType === 'create-promo-code' || modalType === 'edit-promo-code') && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Code</Label>
                      <Input
                        value={selectedItem?.code || ''}
                        onChange={(e) =>
                          setSelectedItem((prev) => ({ ...(prev || {}), code: e.target.value }))
                        }
                        placeholder="SAVE20"
                      />
                    </div>
                    <div>
                      <Label>Broker *</Label>
                      <Select
                        value={selectedItem?.broker_id ? String(selectedItem.broker_id) : 'select'}
                        onValueChange={(val) =>
                          setSelectedItem((prev) => ({
                            ...(prev || {}),
                            broker_id: val && val !== 'select' ? Number(val) : null
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select broker" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="select">Select broker</SelectItem>
                          {(Array.isArray(brokers) ? brokers : []).map((b) => (
                            <SelectItem key={b.id} value={String(b.id)}>
                              {b.username || `${b.first_name || ''} ${b.last_name || ''}` || `Broker #${b.id}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="md:col-span-2">
                      <Label>Description</Label>
                      <Textarea
                        value={selectedItem?.description || ''}
                        onChange={(e) =>
                          setSelectedItem((prev) => ({ ...(prev || {}), description: e.target.value }))
                        }
                        placeholder="Optional description"
                      />
                    </div>
                    <div>
                      <Label>Max Uses</Label>
                      <Input
                        type="number"
                        min={1}
                        value={selectedItem?.max_uses ?? ''}
                        onChange={(e) =>
                          setSelectedItem((prev) => ({
                            ...(prev || {}),
                            max_uses: e.target.value ? Number(e.target.value) : null
                          }))
                        }
                        placeholder="Leave empty for unlimited"
                      />
                    </div>
                    <div>
                      <Label>Expires At</Label>
                      <Input
                        type="date"
                        value={selectedItem?.expires_at || ''}
                        onChange={(e) =>
                          setSelectedItem((prev) => ({ ...(prev || {}), expires_at: e.target.value }))
                        }
                      />
                    </div>
                    <div>
                      <Label>Commission %</Label>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        step={0.1}
                        value={selectedItem?.commission_percentage ?? ''}
                        onChange={(e) =>
                          setSelectedItem((prev) => ({
                            ...(prev || {}),
                            commission_percentage: e.target.value ? Number(e.target.value) : null
                          }))
                        }
                        placeholder="e.g. 5"
                      />
                    </div>
                    <div className="flex items-center gap-2 mt-6">
                      <Switch
                        checked={selectedItem?.is_active ?? true}
                        onCheckedChange={(val) =>
                          setSelectedItem((prev) => ({ ...(prev || {}), is_active: val }))
                        }
                      />
                      <span className="text-sm">Active</span>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button variant="outline" onClick={() => setModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={() => {
                        if (modalType === 'create-promo-code' && (!selectedItem?.code?.trim() || !selectedItem?.broker_id)) {
                          toast.error('Code and Broker are required');
                          return;
                        }
                        const payload = {
                          code: selectedItem?.code?.trim(),
                          broker_id: selectedItem?.broker_id || undefined,
                          description: selectedItem?.description?.trim() || undefined,
                          is_active: selectedItem?.is_active ?? true,
                          max_uses: selectedItem?.max_uses || undefined,
                          expires_at: selectedItem?.expires_at || undefined,
                          commission_percentage: selectedItem?.commission_percentage
                        };
                        handleCreateOrUpdatePromoCode(payload, modalType === 'edit-promo-code' ? selectedItem : null);
                      }}
                      disabled={loading}
                    >
                      {loading ? 'Saving...' : 'Save'}
                    </Button>
                  </div>
                </div>
              )}

              {/* View Promo Code Users / Referrals */}
              {modalType === 'view-promo-users' && selectedItem && (
                <div className="space-y-4 max-h-[70vh] overflow-y-auto">
                  <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      Promo Code: <span className="font-mono">{selectedItem.code}</span>
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Broker:{' '}
                      {selectedItem.broker
                        ? (selectedItem.broker.username ||
                           `${selectedItem.broker.first_name || ''} ${selectedItem.broker.last_name || ''}`)
                        : 'N/A'}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Users who used this code</h4>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Username</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Referred At</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {promoCodeUsers.map((u) => (
                          <TableRow key={u.id}>
                            <TableCell>{u.id}</TableCell>
                            <TableCell>{u.username}</TableCell>
                            <TableCell>
                              {u.first_name || u.last_name
                                ? `${u.first_name || ''} ${u.last_name || ''}`
                                : 'N/A'}
                            </TableCell>
                            <TableCell>{u.phone_number || 'N/A'}</TableCell>
                            <TableCell>{u.email || 'N/A'}</TableCell>
                            <TableCell>
                              {u.referred_at ? new Date(u.referred_at).toLocaleString() : 'N/A'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  {Array.isArray(brokerReferrals) && brokerReferrals.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <h4 className="font-semibold text-sm">Broker referrals (all codes)</h4>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Referred User</TableHead>
                            <TableHead>Promo Code</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {(Array.isArray(brokerReferrals) ? brokerReferrals : []).map((r) => (
                            <TableRow key={r.id}>
                              <TableCell>{r.id}</TableCell>
                              <TableCell>
                                {r.referredUser
                                  ? (r.referredUser.username ||
                                     `${r.referredUser.first_name || ''} ${r.referredUser.last_name || ''}`)
                                  : r.referred_user_id}
                              </TableCell>
                              <TableCell>{r.promoCode?.code || 'N/A'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                  <div className="flex justify-end pt-3">
                    <Button variant="outline" onClick={() => setModalOpen(false)}>
                      Close
                    </Button>
                  </div>
                </div>
              )}

              {/* View Third Party Modal */}
              {modalType === 'view-third-party' && selectedItem && (
                <div className="space-y-4 max-h-[70vh] overflow-y-auto">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-semibold">ID</Label>
                      <p className="text-sm">{selectedItem.id}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold">Name</Label>
                      <p className="text-sm">{selectedItem.name || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold">Email</Label>
                      <p className="text-sm">{selectedItem.email || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold">Phone</Label>
                      <p className="text-sm">{selectedItem.phone || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold">Contact Email</Label>
                      <p className="text-sm">{selectedItem.contact_email || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold">Category</Label>
                      <Badge variant="outline">{selectedItem.category || 'N/A'}</Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold">City</Label>
                      <p className="text-sm">{selectedItem.city || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold">Subscription</Label>
                      <Badge variant={selectedItem.subscription === 'premium' || selectedItem.subscription === 'enterprise' ? 'default' : 'secondary'}>
                        {selectedItem.subscription || 'Free'}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold">Created At</Label>
                      <p className="text-sm">{new Date(selectedItem.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                  {selectedItem.description && (
                    <div>
                      <Label className="text-sm font-semibold">Description</Label>
                      <p className="text-sm">{selectedItem.description}</p>
                    </div>
                  )}
                  {selectedItem.permissions && selectedItem.permissions.length > 0 && (
                    <div>
                      <Label className="text-sm font-semibold">Permissions</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedItem.permissions.map((perm, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {perm}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex gap-2 pt-4">
                    <Button onClick={() => setModalType('edit-third-party')} className="flex-1">
                      Edit Third Party
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setSelectedItem({ third_party_id: selectedItem.id, third_party_name: selectedItem.name });
                        setModalType('create-service-for-tp');
                      }}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Service
                    </Button>
                    <Button variant="outline" onClick={() => setModalOpen(false)}>
                      Close
                    </Button>
                  </div>
                </div>
              )}

              {/* Create/Edit Third Party Modal */}
              {(modalType === 'create-third-party' || modalType === 'edit-third-party') && (
                <ThirdPartyForm
                  thirdParty={modalType === 'edit-third-party' ? selectedItem : null}
                  onSubmit={(data) => {
                    if (modalType === 'edit-third-party' && selectedItem) {
                      handleUpdateThirdParty(selectedItem.id, data);
                    } else {
                      handleCreateThirdParty(data);
                    }
                  }}
                />
              )}

              {/* Create Service for Specific Third Party Modal */}
              {modalType === 'create-service-for-tp' && selectedItem && (
                <ServiceFormForThirdParty
                  thirdPartyId={selectedItem.third_party_id}
                  thirdPartyName={selectedItem.third_party_name}
                  onSubmit={(data) => {
                    handleCreateService({ ...data, third_party_id: selectedItem.third_party_id });
                  }}
                />
              )}

              {/* Create/Edit Service Item Modal */}
              {(modalType === 'create-service-item' || modalType === 'edit-service-item') && (
                <ServiceItemForm
                  item={modalType === 'edit-service-item' ? selectedItem : null}
                  onSubmit={(data) => {
                    if (modalType === 'edit-service-item' && selectedItem) {
                      handleUpdateServiceItem(selectedItem.id, data);
                    } else if (selectedServiceId) {
                      handleCreateServiceItem(selectedServiceId, data);
                    }
                  }}
                />
              )}
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
    </AdminContext.Provider>
  );
}

// Holiday Form Component
function HolidayForm({ holiday, onSubmit }) {
  const [formData, setFormData] = useState({
    car_id: holiday?.car_id || '',
    holiday_name: holiday?.holiday_name || '',
    holiday_dates: {
      start: holiday?.holiday_dates?.start || '',
      end: holiday?.holiday_dates?.end || ''
    },
    percentage_increase: holiday?.percentage_increase || '',
    is_active: holiday?.is_active !== undefined ? holiday.is_active : true
  });

  return (
    <div className="space-y-4">
      <div>
        <Label>Car ID *</Label>
        <Input
          type="number"
          value={formData.car_id}
          onChange={(e) => setFormData({...formData, car_id: e.target.value})}
          placeholder="Enter car ID"
          required
        />
      </div>
      <div>
        <Label>Holiday Name *</Label>
        <Input
          value={formData.holiday_name}
          onChange={(e) => setFormData({...formData, holiday_name: e.target.value})}
          placeholder="e.g., New Year"
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Start Date *</Label>
          <Input
            type="date"
            value={formData.holiday_dates.start}
            onChange={(e) => setFormData({
              ...formData,
              holiday_dates: {...formData.holiday_dates, start: e.target.value}
            })}
            required
          />
        </div>
        <div>
          <Label>End Date *</Label>
          <Input
            type="date"
            value={formData.holiday_dates.end}
            onChange={(e) => setFormData({
              ...formData,
              holiday_dates: {...formData.holiday_dates, end: e.target.value}
            })}
            required
          />
        </div>
      </div>
      <div>
        <Label>Percentage Increase *</Label>
        <Input
          type="number"
          step="0.01"
          min="0"
          max="100"
          value={formData.percentage_increase}
          onChange={(e) => setFormData({...formData, percentage_increase: e.target.value})}
          placeholder="20.00"
          required
        />
      </div>
      <div className="flex items-center space-x-2">
        <Switch
          id="is_active"
          checked={formData.is_active}
          onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
        />
        <Label htmlFor="is_active">Active</Label>
      </div>
      <Button onClick={() => onSubmit(formData)}>
        {holiday ? 'Update' : 'Create'} Holiday
      </Button>
    </div>
  );
}

// Announcement Form Component
function AnnouncementForm({ announcement, onSubmit }) {
  // Helper function to convert ISO date to YYYY-MM-DD HH:mm:ss format
  const formatDateForAPI = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  // Helper function to convert API date format to datetime-local input format
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    // If already in YYYY-MM-DD HH:mm:ss format, convert to datetime-local
    if (dateString.includes(' ')) {
      return dateString.replace(' ', 'T');
    }
    // If ISO format, convert
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16); // YYYY-MM-DDTHH:mm
  };

  const [formData, setFormData] = useState({
    title: announcement?.title || '',
    message: announcement?.message || '',
    scheduled_at: formatDateForInput(announcement?.scheduled_at) || '',
    expires_at: formatDateForInput(announcement?.expires_at) || '',
    priority: announcement?.priority || 'medium',
    target_audience: announcement?.target_audience || [],
    status: announcement?.status || 'draft',
    categories: announcement?.categories || [],
    media: announcement?.media || []
  });

  const handleTargetAudienceChange = (role, checked) => {
    setFormData(prev => {
      const current = prev.target_audience || [];
      if (checked) {
        return { ...prev, target_audience: [...current, role] };
      } else {
        return { ...prev, target_audience: current.filter(r => r !== role) };
      }
    });
  };

  const handleSubmit = () => {
    // Format dates to YYYY-MM-DD HH:mm:ss
    const submitData = {
      ...formData,
      scheduled_at: formData.scheduled_at ? formatDateForAPI(formData.scheduled_at) : undefined,
      expires_at: formData.expires_at ? formatDateForAPI(formData.expires_at) : undefined,
      // Only include categories and media if they have values
      categories: formData.categories.length > 0 ? formData.categories : undefined,
      media: formData.media.length > 0 ? formData.media : undefined
    };
    onSubmit(submitData);
  };

  return (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto">
      <div>
        <Label>Title *</Label>
        <Input
          required
          value={formData.title}
          onChange={(e) => setFormData({...formData, title: e.target.value})}
          placeholder="Enter announcement title"
        />
      </div>
      <div>
        <Label>Message *</Label>
        <Textarea
          required
          value={formData.message}
          onChange={(e) => setFormData({...formData, message: e.target.value})}
          placeholder="Enter announcement message"
          rows={5}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Scheduled At</Label>
          <Input
            type="datetime-local"
            value={formData.scheduled_at}
            onChange={(e) => setFormData({...formData, scheduled_at: e.target.value})}
          />
        </div>
        <div>
          <Label>Expires At</Label>
          <Input
            type="datetime-local"
            value={formData.expires_at}
            onChange={(e) => setFormData({...formData, expires_at: e.target.value})}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Priority</Label>
          <Select
            value={formData.priority}
            onValueChange={(value) => setFormData({...formData, priority: value})}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => setFormData({...formData, status: value})}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label>Target Audience</Label>
        <div className="flex flex-wrap gap-2 mt-2">
          {['client', 'agency', 'agent', 'admin'].map((role) => (
            <div key={role} className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={`target-${role}`}
                checked={formData.target_audience.includes(role)}
                onChange={(e) => handleTargetAudienceChange(role, e.target.checked)}
                className="rounded"
              />
              <Label htmlFor={`target-${role}`} className="text-sm font-normal cursor-pointer">
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </Label>
            </div>
          ))}
        </div>
      </div>
      <div className="flex gap-2 pt-4">
        <Button onClick={handleSubmit} className="flex-1">
          {announcement ? 'Update' : 'Create'} Announcement
        </Button>
      </div>
    </div>
  );
}

// Notification Form Component
function NotificationForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'general',
    data: {}
  });

  return (
    <div className="space-y-4">
      <div>
        <Label>Title</Label>
        <Input
          value={formData.title}
          onChange={(e) => setFormData({...formData, title: e.target.value})}
        />
      </div>
      <div>
        <Label>Message</Label>
        <Textarea
          value={formData.message}
          onChange={(e) => setFormData({...formData, message: e.target.value})}
        />
      </div>
      <div>
        <Label>Type</Label>
        <Select
          value={formData.type}
          onValueChange={(value) => setFormData({...formData, type: value})}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="general">General</SelectItem>
            <SelectItem value="booking">Booking</SelectItem>
            <SelectItem value="payment">Payment</SelectItem>
            <SelectItem value="system">System</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button onClick={() => onSubmit(formData)}>
        Send Notification
      </Button>
    </div>
  );
}

// Service Form Component
function ServiceForm({ service, onSubmit, thirdParties = [] }) {
  const [formData, setFormData] = useState({
    name: service?.name || '',
    description: service?.description || '',
    category: service?.category || '',
    price: service?.price || '',
    featured: service?.featured || false,
    images: service?.images || [],
    third_party_id: service?.third_party_id || '',
    city: service?.city || '',
    availability: service?.availability !== false
  });

  const [newImageUrl, setNewImageUrl] = useState('');

  const addImage = () => {
    if (newImageUrl.trim()) {
      setFormData({...formData, images: [...formData.images, newImageUrl.trim()]});
      setNewImageUrl('');
    }
  };

  const removeImage = (index) => {
    setFormData({...formData, images: formData.images.filter((_, i) => i !== index)});
  };

  return (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto">
      {/* Owner Selection */}
      {thirdParties.length > 0 && (
        <div>
          <Label>Service Owner (Third Party) *</Label>
          <Select
            value={formData.third_party_id?.toString() || ''}
            onValueChange={(value) => setFormData({...formData, third_party_id: parseInt(value)})}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select third party owner" />
            </SelectTrigger>
            <SelectContent>
              {thirdParties.map((tp) => (
                <SelectItem key={tp.id} value={tp.id.toString()}>
                  {tp.name} ({tp.email})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      
      <div>
        <Label>Name *</Label>
        <Input
          required
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          placeholder="Enter service name"
        />
      </div>
      <div>
        <Label>Description *</Label>
        <Textarea
          required
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          placeholder="Enter service description"
          rows={3}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Category *</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => setFormData({...formData, category: value})}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {/* Must match backend: hotel, restaurant, spa, nightclub, other */}
              <SelectItem value="hotel">Hotel</SelectItem>
              <SelectItem value="restaurant">Restaurant</SelectItem>
              <SelectItem value="spa">Spa</SelectItem>
              <SelectItem value="nightclub">Nightclub</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Price *</Label>
          <Input
            type="number"
            step="0.01"
            min="0"
            required
            value={formData.price}
            onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value) || ''})}
            placeholder="0.00"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>City</Label>
          <Input
            value={formData.city}
            onChange={(e) => setFormData({...formData, city: e.target.value})}
            placeholder="Enter city"
          />
        </div>
        <div className="flex items-center justify-between pt-6">
          <Label>Availability</Label>
          <Switch
            checked={formData.availability}
            onCheckedChange={(checked) => setFormData({...formData, availability: checked})}
          />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <Label>Featured</Label>
        <Switch
          checked={formData.featured}
          onCheckedChange={(checked) => setFormData({...formData, featured: checked})}
        />
      </div>
      <div>
        <Label>Images</Label>
        <div className="flex gap-2 mt-2">
          <Input
            value={newImageUrl}
            onChange={(e) => setNewImageUrl(e.target.value)}
            placeholder="Enter image URL"
            className="flex-1"
          />
          <Button type="button" variant="outline" onClick={addImage}>Add</Button>
        </div>
        {formData.images.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.images.map((img, idx) => (
              <div key={idx} className="relative">
                <img src={img} alt={`Image ${idx + 1}`} className="w-16 h-16 object-cover rounded" />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-xs"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="flex gap-2 pt-4">
        <Button onClick={() => onSubmit(formData)} className="flex-1">
          {service ? 'Update' : 'Create'} Service
        </Button>
      </div>
    </div>
  );
}

// Third Party Form Component
function ThirdPartyForm({ thirdParty, onSubmit }) {
  const [formData, setFormData] = useState({
    // Account Info
    name: thirdParty?.business_name || thirdParty?.name || '',
    username: thirdParty?.username || '',
    email: thirdParty?.email || '',
    password: '',
    subscription: thirdParty?.subscription || '',
    permissions: thirdParty?.permissions || [],
    // Profile Info
    description: thirdParty?.description || '',
    category: thirdParty?.category || '',
    city: thirdParty?.city || '',
    contact_email: thirdParty?.contact_email || '',
    phone: thirdParty?.phone || ''
  });

  const availablePermissions = ['services:read', 'services:write', 'items:read', 'items:write', 'feedbacks:read', 'feedbacks:respond'];

  const togglePermission = (perm) => {
    if (formData.permissions.includes(perm)) {
      setFormData({...formData, permissions: formData.permissions.filter(p => p !== perm)});
    } else {
      setFormData({...formData, permissions: [...formData.permissions, perm]});
    }
  };

  return (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto">
      {/* Account Information Section */}
      <div className="border-b pb-2 mb-2">
        <h3 className="font-semibold text-sm text-muted-foreground">Account Information</h3>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label>Business Name *</Label>
          <Input
            required
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            placeholder="Enter business/company name"
          />
        </div>
        <div>
          <Label>Username *</Label>
          <Input
            required
            value={formData.username}
            onChange={(e) => setFormData({...formData, username: e.target.value})}
            placeholder="Unique username for login"
          />
        </div>
        <div>
          <Label>Email *</Label>
          <Input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            placeholder="Enter login email"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>{thirdParty ? 'Password (leave blank to keep current)' : 'Password *'}</Label>
          <Input
            type="password"
            required={!thirdParty}
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            placeholder="Enter password"
          />
        </div>
        <div>
          <Label>Subscription</Label>
          <Select
            value={formData.subscription}
            onValueChange={(value) => setFormData({...formData, subscription: value})}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select subscription" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="free">Free</SelectItem>
              <SelectItem value="basic">Basic</SelectItem>
              <SelectItem value="premium">Premium</SelectItem>
              <SelectItem value="enterprise">Enterprise</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Profile Information Section */}
      <div className="border-b pb-2 mb-2 mt-4">
        <h3 className="font-semibold text-sm text-muted-foreground">Profile Information</h3>
      </div>
      <div>
        <Label>Description</Label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          placeholder="Enter business description"
          rows={3}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Category</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => setFormData({...formData, category: value})}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="transport">Transport</SelectItem>
              <SelectItem value="accommodation">Accommodation</SelectItem>
              <SelectItem value="food">Food & Dining</SelectItem>
              <SelectItem value="entertainment">Entertainment</SelectItem>
              <SelectItem value="tourism">Tourism</SelectItem>
              <SelectItem value="rental">Rental Services</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>City</Label>
          <Input
            value={formData.city}
            onChange={(e) => setFormData({...formData, city: e.target.value})}
            placeholder="Enter city"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Contact Email</Label>
          <Input
            type="email"
            value={formData.contact_email}
            onChange={(e) => setFormData({...formData, contact_email: e.target.value})}
            placeholder="Enter public contact email"
          />
        </div>
        <div>
          <Label>Phone</Label>
          <Input
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            placeholder="Enter phone number"
          />
        </div>
      </div>

      {/* Permissions Section */}
      <div className="border-b pb-2 mb-2 mt-4">
        <h3 className="font-semibold text-sm text-muted-foreground">Permissions</h3>
      </div>
      <div className="flex flex-wrap gap-3">
        {availablePermissions.map((perm) => (
          <div key={perm} className="flex items-center space-x-2">
            <input
              type="checkbox"
              id={`perm-${perm}`}
              checked={formData.permissions.includes(perm)}
              onChange={() => togglePermission(perm)}
              className="rounded"
            />
            <Label htmlFor={`perm-${perm}`} className="text-sm font-normal cursor-pointer">
              {perm}
            </Label>
          </div>
        ))}
      </div>
      <div className="flex gap-2 pt-4">
        <Button onClick={() => {
          const submitData = {...formData};
          // Remove password if it's empty and we're editing
          if (thirdParty && !submitData.password) {
            delete submitData.password;
          }
          onSubmit(submitData);
        }} className="flex-1">
          {thirdParty ? 'Update' : 'Create'} Third Party
        </Button>
      </div>
    </div>
  );
}

// Service Item Form Component
function ServiceItemForm({ item, onSubmit }) {
  const [formData, setFormData] = useState({
    name: item?.name || '',
    description: item?.description || '',
    price: item?.price || '',
    image: item?.image || ''
  });

  return (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto">
      <div>
        <Label>Name *</Label>
        <Input
          required
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          placeholder="Enter item name"
        />
      </div>
      <div>
        <Label>Description</Label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          placeholder="Enter item description"
          rows={3}
        />
      </div>
      <div>
        <Label>Price *</Label>
        <Input
          type="number"
          step="0.01"
          min="0"
          required
          value={formData.price}
          onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value) || ''})}
          placeholder="0.00"
        />
      </div>
      <div>
        <Label>Image URL</Label>
        <Input
          value={formData.image}
          onChange={(e) => setFormData({...formData, image: e.target.value})}
          placeholder="Enter image URL"
        />
        {formData.image && (
          <img src={formData.image} alt="Preview" className="w-20 h-20 object-cover rounded mt-2" />
        )}
      </div>
      <div className="flex gap-2 pt-4">
        <Button onClick={() => onSubmit(formData)} className="flex-1">
          {item ? 'Update' : 'Create'} Item
        </Button>
      </div>
    </div>
  );
}

// Service Form for Specific Third Party Component
function ServiceFormForThirdParty({ thirdPartyId, thirdPartyName, onSubmit }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    featured: false,
    images: [],
    city: '',
    availability: true
  });

  const [newImageUrl, setNewImageUrl] = useState('');

  const addImage = () => {
    if (newImageUrl.trim()) {
      setFormData({...formData, images: [...formData.images, newImageUrl.trim()]});
      setNewImageUrl('');
    }
  };

  const removeImage = (index) => {
    setFormData({...formData, images: formData.images.filter((_, i) => i !== index)});
  };

  return (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto">
      {/* Third Party Info Banner */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
        <p className="text-sm text-blue-700 dark:text-blue-300">
          <strong>Owner:</strong> {thirdPartyName} (ID: {thirdPartyId})
        </p>
      </div>
      
      <div>
        <Label>Service Name *</Label>
        <Input
          required
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          placeholder="Enter service name"
        />
      </div>
      <div>
        <Label>Description *</Label>
        <Textarea
          required
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          placeholder="Enter service description"
          rows={3}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Category *</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => setFormData({...formData, category: value})}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {/* Must match backend: hotel, restaurant, spa, nightclub, other */}
              <SelectItem value="hotel">Hotel</SelectItem>
              <SelectItem value="restaurant">Restaurant</SelectItem>
              <SelectItem value="spa">Spa</SelectItem>
              <SelectItem value="nightclub">Nightclub</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Price *</Label>
          <Input
            type="number"
            step="0.01"
            min="0"
            required
            value={formData.price}
            onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value) || ''})}
            placeholder="0.00"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>City</Label>
          <Input
            value={formData.city}
            onChange={(e) => setFormData({...formData, city: e.target.value})}
            placeholder="Enter city"
          />
        </div>
        <div className="flex items-center justify-between pt-6">
          <Label>Availability</Label>
          <Switch
            checked={formData.availability}
            onCheckedChange={(checked) => setFormData({...formData, availability: checked})}
          />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <Label>Featured</Label>
        <Switch
          checked={formData.featured}
          onCheckedChange={(checked) => setFormData({...formData, featured: checked})}
        />
      </div>
      <div>
        <Label>Images</Label>
        <div className="flex gap-2 mt-2">
          <Input
            value={newImageUrl}
            onChange={(e) => setNewImageUrl(e.target.value)}
            placeholder="Enter image URL"
            className="flex-1"
          />
          <Button type="button" variant="outline" onClick={addImage}>Add</Button>
        </div>
        {formData.images.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.images.map((img, idx) => (
              <div key={idx} className="relative">
                <img src={img} alt={`Image ${idx + 1}`} className="w-16 h-16 object-cover rounded" />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-xs"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="flex gap-2 pt-4">
        <Button onClick={() => onSubmit(formData)} className="flex-1">
          Create Service
        </Button>
      </div>
    </div>
  );
}