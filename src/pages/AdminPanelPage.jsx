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
  Plus, Download, Upload, MoreVertical, ChevronRight, LogOut, Home, UserCheck, KeyRound
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
  updateCar as updateCarApi
} from '@/lib/adminApi';
import { exportToExcel, exportTableToPDF } from '@/utils/exportUtils';
import AdForm from '@/components/admin/AdForm';
import PaymentForm from '@/components/admin/PaymentForm';
import FeaturedCarForm from '@/components/admin/FeaturedCarForm';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const COLORS = {
  darkBlue: '#0E4C81',
  teal: '#008C95',
  limeGreen: '#8AC640'
};

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
  const [appFeesData, setAppFeesData] = useState({}); // Store app fees data by agent ID
  const [carImages, setCarImages] = useState({}); // Store car image files for upload
  
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
    otps: { page: 1, per_page: 50 }
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
    otps: { phone_number: '', expired: 'all' }
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
    }
  }, [activeTab, statisticsPeriod]);

  return (
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
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 py-6 max-w-7xl">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 lg:grid-cols-12 mb-6 h-auto p-1 bg-gray-100 dark:bg-gray-800">
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
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {summary && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{summary.total_users}</div>
                    <p className="text-xs text-muted-foreground">
                      {summary.active_users} active
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{summary.total_bookings}</div>
                    <p className="text-xs text-muted-foreground">
                      {summary.pending_bookings} pending
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${summary.total_revenue?.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">
                      ${summary.total_refunds?.toLocaleString()} refunds
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Cars</CardTitle>
                    <Car className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{summary.total_cars}</div>
                    <p className="text-xs text-muted-foreground">
                      {summary.available_cars} available
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Search users..."
                  className="w-64"
                />
                <Select
                  value={filters.users.role}
                  onValueChange={(value) => setFilters(prev => ({
                    ...prev,
                    users: { ...prev.users, role: value }
                  }))}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="client">Client</SelectItem>
                    <SelectItem value="agency">Agency</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon" onClick={fetchUsers}>
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
              <Button
                onClick={() => navigate('/admin/real-user-data')}
                style={{
                  background: `linear-gradient(to right, ${COLORS.darkBlue}, ${COLORS.teal})`
                }}
                className="text-white flex items-center gap-2"
              >
                <UserCheck className="w-4 h-4" />
                Manage Real User Data
              </Button>
            </div>
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Verified</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.data?.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.id}</TableCell>
                        <TableCell>
                          {user.first_name && user.last_name 
                            ? `${user.first_name} ${user.last_name}` 
                            : user.username || 'N/A'}
                        </TableCell>
                        <TableCell>{user.email || user.phone_number || 'N/A'}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{user.role}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.status ? "default" : "secondary"}>
                            {user.status ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.verified_by_admin ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          ) : (
                            <XCircle className="w-4 h-4 text-gray-400" />
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={async () => {
                                const fullDetails = await fetchUserDetails(user.id);
                                if (fullDetails) {
                                  setSelectedItem(fullDetails);
                                  setModalType('view-user');
                                  setModalOpen(true);
                                }
                              }}
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={async () => {
                                const fullDetails = await fetchUserDetails(user.id);
                                if (fullDetails) {
                                  setSelectedItem(fullDetails);
                                  setModalType('edit-user');
                                  setModalOpen(true);
                                }
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => showConfirmDialog(
                                'Delete User',
                                'Are you sure you want to delete this user?',
                                () => deleteUser(user.id)
                              )}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cars Tab */}
          <TabsContent value="cars" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Select
                  value={filters.cars.status}
                  onValueChange={(value) => setFilters(prev => ({
                    ...prev,
                    cars: { ...prev.cars, status: value }
                  }))}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="rented">Rented</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="unavailable">Unavailable</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon" onClick={fetchCars}>
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Make/Model</TableHead>
                      <TableHead>Year</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Approved</TableHead>
                      <TableHead>Daily Rate</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cars.data?.map((car) => (
                      <TableRow key={car.id}>
                        <TableCell>{car.id}</TableCell>
                        <TableCell>{car.make} {car.model}</TableCell>
                        <TableCell>{car.year}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{car.status}</Badge>
                        </TableCell>
                        <TableCell>
                          {car.car_accepted ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          ) : (
                            <XCircle className="w-4 h-4 text-gray-400" />
                          )}
                        </TableCell>
                        <TableCell>${car.daily_rate}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={async () => {
                                const fullDetails = await fetchCarDetails(car.id);
                                if (fullDetails) {
                                  setSelectedItem(fullDetails);
                                  setModalType('view-car');
                                  setModalOpen(true);
                                }
                              }}
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={async () => {
                                const fullDetails = await fetchCarDetails(car.id);
                                if (fullDetails) {
                                  setSelectedItem(fullDetails);
                                  setModalType('edit-car');
                                  setModalOpen(true);
                                }
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => showConfirmDialog(
                                'Delete Car',
                                'Are you sure you want to delete this car?',
                                () => deleteCar(car.id)
                              )}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Select
                  value={filters.bookings.status}
                  onValueChange={(value) => setFilters(prev => ({
                    ...prev,
                    bookings: { ...prev.bookings, status: value }
                  }))}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon" onClick={fetchBookings}>
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Car</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Total Price</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.data?.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell>{booking.id}</TableCell>
                        <TableCell>
                          {booking.client?.first_name && booking.client?.last_name
                            ? `${booking.client.first_name} ${booking.client.last_name}`
                            : booking.client?.username || 'N/A'}
                        </TableCell>
                        <TableCell>{booking.car?.make} {booking.car?.model}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{booking.booking_request_status}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={booking.payment_status === 'paid' ? 'default' : 'secondary'}>
                            {booking.payment_status}
                          </Badge>
                        </TableCell>
                        <TableCell>${booking.total_booking_price}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={async () => {
                                const fullDetails = await fetchBookingDetails(booking.id);
                                if (fullDetails) {
                                  setSelectedItem(fullDetails);
                                  setModalType('view-booking');
                                  setModalOpen(true);
                                }
                              }}
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={async () => {
                                const fullDetails = await fetchBookingDetails(booking.id);
                                if (fullDetails) {
                                  setSelectedItem(fullDetails);
                                  setModalType('edit-booking');
                                  setModalOpen(true);
                                }
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            {booking.booking_request_status === 'confirmed' && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => forceCompleteBooking(booking.id)}
                                title="Force Complete"
                              >
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-4">
            <div className="flex items-center justify-between">
              <Button
                onClick={() => {
                  setSelectedItem(null);
                  setModalType('create-payment');
                  setModalOpen(true);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Issue Payment/Invoice
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    const columns = [
                      { key: 'id', label: 'ID' },
                      { key: 'user', label: 'User', transform: (p) => p.user?.name || 'N/A' },
                      { key: 'amount', label: 'Amount', transform: (p) => `$${p.amount}` },
                      { key: 'type', label: 'Type' },
                      { key: 'status', label: 'Status' },
                      { key: 'source', label: 'Source' },
                      { key: 'name', label: 'Name' },
                      { key: 'created_at', label: 'Created At', transform: (p) => new Date(p.created_at).toLocaleString() }
                    ];
                    const data = payments.data?.map(p => ({
                      ...p,
                      user: columns.find(c => c.key === 'user')?.transform?.(p) || p.user?.name || 'N/A',
                      amount: columns.find(c => c.key === 'amount')?.transform?.(p) || `$${p.amount}`,
                      created_at: columns.find(c => c.key === 'created_at')?.transform?.(p) || new Date(p.created_at).toLocaleString()
                    })) || [];
                    exportToExcel(data, columns, 'invoices');
                  }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Excel
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    const columns = [
                      { key: 'id', label: 'ID' },
                      { key: 'user', label: 'User', transform: (p) => p.user?.name || 'N/A' },
                      { key: 'amount', label: 'Amount', transform: (p) => `$${p.amount}` },
                      { key: 'type', label: 'Type' },
                      { key: 'status', label: 'Status' },
                      { key: 'source', label: 'Source' },
                      { key: 'name', label: 'Name' },
                      { key: 'created_at', label: 'Created At', transform: (p) => new Date(p.created_at).toLocaleString() }
                    ];
                    const data = payments.data || [];
                    exportTableToPDF(
                      data.map(p => ({
                        ...p,
                        user: p.user?.name || 'N/A',
                        amount: `$${p.amount}`,
                        created_at: new Date(p.created_at).toLocaleString()
                      })),
                      columns,
                      'Invoices Report',
                      'invoices'
                    );
                  }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export PDF
                </Button>
                <Button variant="outline" size="icon" onClick={fetchPayments}>
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.data?.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>{payment.id}</TableCell>
                        <TableCell>{payment.user?.name || 'N/A'}</TableCell>
                        <TableCell>${payment.amount}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{payment.type}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={payment.status === 'paid' ? 'default' : 'secondary'}>
                            {payment.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{payment.source}</TableCell>
                        <TableCell>
                          {payment.type === 'refund' && payment.status !== 'processed' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                // According to API documentation, refund endpoint expects invoice ID
                                // Using payment.reference_id if available (likely invoice ID), otherwise payment.id
                                const invoiceId = payment.reference_id || payment.id;
                                processRefund(invoiceId);
                              }}
                            >
                              Process Refund
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Announcements Tab */}
          <TabsContent value="announcements" className="space-y-4">
            <div className="flex items-center justify-between">
              <Button
                onClick={() => {
                  setSelectedItem(null);
                  setModalType('create-announcement');
                  setModalOpen(true);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Announcement
              </Button>
              <Button variant="outline" size="icon" onClick={fetchAnnouncements}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Target Audience</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {announcements.data?.map((announcement) => (
                      <TableRow key={announcement.id}>
                        <TableCell>{announcement.id}</TableCell>
                        <TableCell>{announcement.title}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{announcement.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{announcement.priority}</Badge>
                        </TableCell>
                        <TableCell>
                          {announcement.target_audience?.join(', ') || 'All'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedItem(announcement);
                                setModalType('edit-announcement');
                                setModalOpen(true);
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => showConfirmDialog(
                                'Delete Announcement',
                                'Are you sure you want to delete this announcement?',
                                () => deleteAnnouncement(announcement.id)
                              )}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appeals Tab */}
          <TabsContent value="appeals" className="space-y-4">
            <div className="flex items-center gap-2">
              <Select
                value={filters.appeals.status}
                onValueChange={(value) => setFilters(prev => ({
                  ...prev,
                  appeals: { ...prev.appeals, status: value }
                }))}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="escalated">Escalated</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={fetchAppeals}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {appeals.data?.map((appeal) => (
                      <TableRow key={appeal.id}>
                        <TableCell>{appeal.id}</TableCell>
                        <TableCell>{appeal.user?.name || 'N/A'}</TableCell>
                        <TableCell>{appeal.type_of_issue}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{appeal.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{appeal.priority}</Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedItem(appeal);
                              setModalType('edit-appeal');
                              setModalOpen(true);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Ads Tab */}
          <TabsContent value="ads" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => {
                    setSelectedItem(null);
                    setModalType('create-ad');
                    setModalOpen(true);
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Ad
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/admin/ads-analytics')}
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Analytics
                </Button>
              </div>
              <Button variant="outline" size="icon" onClick={fetchAds}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Website</TableHead>
                      <TableHead>Company Type</TableHead>
                      <TableHead>Online</TableHead>
                      <TableHead>Views</TableHead>
                      <TableHead>Clicks</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ads.data?.map((ad) => (
                      <TableRow key={ad.id}>
                        <TableCell>{ad.id}</TableCell>
                        <TableCell>{ad.website}</TableCell>
                        <TableCell>{ad.company_type}</TableCell>
                        <TableCell>
                          {ad.online ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          ) : (
                            <XCircle className="w-4 h-4 text-gray-400" />
                          )}
                        </TableCell>
                        <TableCell>{ad.nb_views}</TableCell>
                        <TableCell>{ad.nb_clicks}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedItem(ad);
                                setModalType('edit-ad');
                                setModalOpen(true);
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => showConfirmDialog(
                                'Delete Ad',
                                'Are you sure you want to delete this ad?',
                                () => deleteAd(ad.id)
                              )}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Featured Cars Tab */}
          <TabsContent value="featured-cars" className="space-y-4">
            <div className="flex items-center justify-between">
              <Button
                onClick={() => {
                  setSelectedItem(null);
                  setModalType('create-featured-car');
                  setModalOpen(true);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Featured Car
              </Button>
              <Button variant="outline" size="icon" onClick={fetchFeaturedCars}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Car</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>Expire Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {featuredCars.data?.map((featured) => (
                      <TableRow key={featured.id}>
                        <TableCell>{featured.id}</TableCell>
                        <TableCell>
                          {featured.car?.make} {featured.car?.model}
                        </TableCell>
                        <TableCell>{featured.duration} days</TableCell>
                        <TableCell>{new Date(featured.start_at).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(featured.expire_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => showConfirmDialog(
                              'Remove Featured Car',
                              'Are you sure you want to remove this featured car?',
                              () => deleteFeaturedCar(featured.id)
                            )}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Holidays Tab */}
          <TabsContent value="holidays" className="space-y-4">
            <div className="flex items-center justify-between">
              <Button
                onClick={() => {
                  setSelectedItem(null);
                  setModalType('create-holiday');
                  setModalOpen(true);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Holiday
              </Button>
              <Button variant="outline" size="icon" onClick={fetchHolidays}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Car</TableHead>
                      <TableHead>Holiday Name</TableHead>
                      <TableHead>Dates</TableHead>
                      <TableHead>Increase %</TableHead>
                      <TableHead>Active</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {holidays.data?.map((holiday) => (
                      <TableRow key={holiday.id}>
                        <TableCell>{holiday.id}</TableCell>
                        <TableCell>
                          {holiday.car?.make} {holiday.car?.model}
                        </TableCell>
                        <TableCell>{holiday.holiday_name}</TableCell>
                        <TableCell>
                          {holiday.holiday_dates?.start} - {holiday.holiday_dates?.end}
                        </TableCell>
                        <TableCell>{holiday.percentage_increase}%</TableCell>
                        <TableCell>
                          {holiday.is_active ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          ) : (
                            <XCircle className="w-4 h-4 text-gray-400" />
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedItem(holiday);
                                setModalType('edit-holiday');
                                setModalOpen(true);
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => showConfirmDialog(
                                'Delete Holiday',
                                'Are you sure you want to delete this holiday?',
                                () => deleteHoliday(holiday.id)
                              )}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Suggestions Tab */}
          <TabsContent value="suggestions" className="space-y-4">
            <Button variant="outline" size="icon" onClick={fetchSuggestions}>
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {suggestions.data?.map((suggestion) => (
                      <TableRow key={suggestion.id}>
                        <TableCell>{suggestion.id}</TableCell>
                        <TableCell>{suggestion.user?.name || 'N/A'}</TableCell>
                        <TableCell>{suggestion.title}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{suggestion.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedItem(suggestion);
                                setModalType('edit-suggestion');
                                setModalOpen(true);
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => showConfirmDialog(
                                'Delete Suggestion',
                                'Are you sure you want to delete this suggestion?',
                                () => deleteSuggestion(suggestion.id)
                              )}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-4">
            <div className="flex items-center justify-between">
              <Button
                onClick={() => {
                  setSelectedItem(null);
                  setModalType('send-notification');
                  setModalOpen(true);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Send to All Users
              </Button>
              <Button variant="outline" size="icon" onClick={fetchNotifications}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Read</TableHead>
                      <TableHead>Sent</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {notifications.data?.map((notification) => (
                      <TableRow key={notification.id}>
                        <TableCell>{notification.id}</TableCell>
                        <TableCell>{notification.title}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{notification.type}</Badge>
                        </TableCell>
                        <TableCell>
                          {notification.is_read ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          ) : (
                            <XCircle className="w-4 h-4 text-gray-400" />
                          )}
                        </TableCell>
                        <TableCell>
                          {notification.is_sent ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          ) : (
                            <XCircle className="w-4 h-4 text-gray-400" />
                          )}
                        </TableCell>
                        <TableCell>
                          {new Date(notification.created_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* OTPs Tab */}
          <TabsContent value="otps" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Search by phone number..."
                  className="w-64"
                  value={filters.otps.phone_number}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    otps: { ...prev.otps, phone_number: e.target.value }
                  }))}
                />
                <Select
                  value={filters.otps.expired}
                  onValueChange={(value) => setFilters(prev => ({
                    ...prev,
                    otps: { ...prev.otps, expired: value }
                  }))}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Expired" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All OTPs</SelectItem>
                    <SelectItem value="false">Active</SelectItem>
                    <SelectItem value="true">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" size="icon" onClick={fetchOtps}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Phone Number</TableHead>
                      <TableHead>OTP Code</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead>Expires At</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading && otps.data?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                          Loading OTPs...
                        </TableCell>
                      </TableRow>
                    ) : otps.data?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No OTPs found
                        </TableCell>
                      </TableRow>
                    ) : (
                      otps.data?.map((otp) => {
                        const isExpired = new Date(otp.expired_at) < new Date();
                        return (
                          <TableRow key={otp.id}>
                            <TableCell>{otp.id}</TableCell>
                            <TableCell>{otp.phone_number}</TableCell>
                            <TableCell className="font-mono font-bold">{otp.code}</TableCell>
                            <TableCell>{new Date(otp.created_at).toLocaleString()}</TableCell>
                            <TableCell>{new Date(otp.expired_at).toLocaleString()}</TableCell>
                            <TableCell>
                              {isExpired ? (
                                <Badge variant="destructive">Expired</Badge>
                              ) : (
                                <Badge variant="default">Active</Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
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
                    <div className="flex items-center justify-between">
                      <Label>Verified by Admin</Label>
                      <Switch
                        checked={selectedItem.verified_by_admin || false}
                        onCheckedChange={(checked) => setSelectedItem({...selectedItem, verified_by_admin: checked})}
                      />
                    </div>
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
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
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