/**
 * Admin API Service Usage Examples
 * 
 * This file demonstrates how to use the adminApi service functions.
 * Import the functions you need from '@/lib/adminApi'
 */

import {
  // Users
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  forceDeleteUser,
  
  // Cars
  getCars,
  getCar,
  updateCar,
  deleteCar,
  
  // Bookings
  getBookings,
  getBooking,
  updateBooking,
  forceCompleteBooking,
  
  // Payments
  getPayments,
  issuePayment,
  processRefund,
  
  // Announcements
  getAnnouncements,
  getAnnouncement,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  
  // Appeals
  getAppeals,
  getAppeal,
  updateAppeal,
  
  // Ads
  getAds,
  getAd,
  createAd,
  updateAd,
  deleteAd,
  
  // Featured Cars
  getFeaturedCars,
  createFeaturedCar,
  deleteFeaturedCar,
  
  // Holidays
  getHolidays,
  getHoliday,
  createHoliday,
  updateHoliday,
  deleteHoliday,
  
  // Real User Data
  getRealUserData,
  getRealUserDataByUser,
  createOrUpdateRealUserData,
  updateRealUserDataStatus,
  deleteRealUserData,
  
  // Suggestions
  getSuggestions,
  updateSuggestion,
  deleteSuggestion,
  
  // Notifications
  getNotifications,
  sendNotificationToAll,
  
  // Reports
  getSummaryReport,
  getStatistics,
  getRevenueReport,
  getChartData,
  getSystemLogs,
} from '@/lib/adminApi';

// ============================
// Example Usage
// ============================

// Example 1: Get all users with filters
async function exampleGetUsers() {
  try {
    const response = await getUsers({
      role: 'client',
      status: 'active',
      per_page: 25
    });
    
    console.log('Users:', response.data.users);
    // Response structure:
    // {
    //   users: {
    //     current_page: 1,
    //     data: [...],
    //     total: 100,
    //     per_page: 25,
    //     last_page: 4
    //   }
    // }
  } catch (error) {
    console.error('Error fetching users:', error.response?.data || error.message);
  }
}

// Example 2: Get user details
async function exampleGetUser() {
  try {
    const response = await getUser(1);
    console.log('User details:', response.data.user);
  } catch (error) {
    console.error('Error fetching user:', error.response?.data || error.message);
  }
}

// Example 3: Update user
async function exampleUpdateUser() {
  try {
    const response = await updateUser(1, {
      verified_by_admin: true,
      status: true,
      is_locked: false
    });
    
    console.log('User updated:', response.data.user);
    // Response: { message: "User updated successfully", user: {...} }
  } catch (error) {
    console.error('Error updating user:', error.response?.data || error.message);
  }
}

// Example 4: Get summary report
async function exampleGetSummary() {
  try {
    const response = await getSummaryReport();
    console.log('Summary:', response.data.summary);
    // Response structure:
    // {
    //   summary: {
    //     total_users: 1000,
    //     active_users: 800,
    //     total_bookings: 5000,
    //     ...
    //   }
    // }
  } catch (error) {
    console.error('Error fetching summary:', error.response?.data || error.message);
  }
}

// Example 5: Create announcement
async function exampleCreateAnnouncement() {
  try {
    const response = await createAnnouncement({
      title: "New Feature Announcement",
      message: "We've added new features!",
      status: "published",
      priority: "high",
      target_audience: ["client", "agency"],
      scheduled_at: "2024-01-01 00:00:00",
      expires_at: "2024-12-31 23:59:59"
    });
    
    console.log('Announcement created:', response.data.announcement);
  } catch (error) {
    console.error('Error creating announcement:', error.response?.data || error.message);
  }
}

// Example 6: Create holiday
async function exampleCreateHoliday() {
  try {
    const response = await createHoliday({
      car_id: 1,
      holiday_name: "New Year",
      holiday_dates: {
        start: "2024-01-01",
        end: "2024-01-07"
      },
      percentage_increase: 20.00,
      is_active: true
    });
    
    console.log('Holiday created:', response.data.holiday);
  } catch (error) {
    console.error('Error creating holiday:', error.response?.data || error.message);
  }
}

// Example 7: Issue payment/invoice
async function exampleIssuePayment() {
  try {
    const response = await issuePayment({
      user_id: 1,
      name: "Monthly Subscription",
      amount: 99.99, // Will be converted to cents internally
      source: "bank",
      type: "income",
      status: "pending",
      due_date: "2024-02-01 00:00:00",
      description: "Monthly subscription fee",
      metadata: {
        subscription_id: "sub_123"
      }
    });
    
    console.log('Payment issued:', response.data.invoice);
  } catch (error) {
    console.error('Error issuing payment:', error.response?.data || error.message);
  }
}

// Example 8: Process refund
async function exampleProcessRefund() {
  try {
    const response = await processRefund(1, {
      description: "Refund for booking cancellation"
    });
    
    console.log('Refund processed:', response.data.refund_invoice);
  } catch (error) {
    console.error('Error processing refund:', error.response?.data || error.message);
  }
}

// Example 9: Get chart data
async function exampleGetChartData() {
  try {
    const response = await getChartData({ period: 'month' });
    console.log('Chart data:', response.data);
    // Response structure:
    // {
    //   period: "month",
    //   start_date: "...",
    //   end_date: "...",
    //   revenue: [{ date: "2024-01-01", revenue: 1500.00 }, ...],
    //   bookings: [{ date: "2024-01-01", count: 15 }, ...],
    //   users: [{ date: "2024-01-01", count: 5 }, ...]
    // }
  } catch (error) {
    console.error('Error fetching chart data:', error.response?.data || error.message);
  }
}

// Example 10: Create featured car
async function exampleCreateFeaturedCar() {
  try {
    const response = await createFeaturedCar({
      car_id: 1,
      duration: 30, // days
      start_at: "2024-01-01 00:00:00" // optional, defaults to now
    });
    
    console.log('Featured car created:', response.data.featured_car);
  } catch (error) {
    console.error('Error creating featured car:', error.response?.data || error.message);
  }
}

// Example 11: Create ad
async function exampleCreateAd() {
  try {
    const response = await createAd({
      user_id: 1,
      start_at: "2024-01-01 00:00:00",
      expire_at: "2024-12-31 23:59:59",
      website: "example.com",
      company_type: "rental",
      image_url: "https://example.com/ad.jpg",
      target_url: "https://example.com",
      ads_text: "Great deals on car rentals!",
      amount_cost: 100.00,
      online: true
    });
    
    console.log('Ad created:', response.data.ad);
  } catch (error) {
    console.error('Error creating ad:', error.response?.data || error.message);
  }
}

// Example 12: Create or update real user data
async function exampleCreateRealUserData() {
  try {
    const response = await createOrUpdateRealUserData(1, {
      id_number: "123456789",
      passport_number: "P123456",
      driver_license_number: "DL123456",
      first_name: "John",
      middle_name: "Michael",
      last_name: "Doe",
      mother_name: "Jane",
      place_of_birth: "Beirut",
      gender: "male",
      date_of_birth: "1990-01-01",
      status: "approved",
      reason_of_status: "All documents verified"
    });
    
    console.log('Real user data:', response.data.real_user_data);
    console.log('User verified:', response.data.user_verified);
  } catch (error) {
    console.error('Error creating real user data:', error.response?.data || error.message);
  }
}

// Example 13: Send notification to all users
async function exampleSendNotification() {
  try {
    const response = await sendNotificationToAll({
      title: "Important Announcement",
      message: "We have important news for you!",
      type: "general",
      data: {
        action: "view_announcement",
        announcement_id: 1
      }
    });
    
    console.log('Notification sent:', response.data.message);
  } catch (error) {
    console.error('Error sending notification:', error.response?.data || error.message);
  }
}

// Example 14: React component usage
import React, { useState, useEffect } from 'react';
import { getUsers, getSummaryReport } from '@/lib/adminApi';
import { toast } from 'sonner';

function AdminUsersComponent() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    fetchUsers();
    fetchSummary();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getUsers({ per_page: 10 });
      setUsers(response.data.users.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await getSummaryReport();
      setSummary(response.data.summary);
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {summary && (
        <div>
          <p>Total Users: {summary.total_users}</p>
          <p>Active Users: {summary.active_users}</p>
        </div>
      )}
      <ul>
        {users.map(user => (
          <li key={user.id}>{user.name} - {user.email}</li>
        ))}
      </ul>
    </div>
  );
}

// Export examples (not needed in production)
export {
  exampleGetUsers,
  exampleGetUser,
  exampleUpdateUser,
  exampleGetSummary,
  exampleCreateAnnouncement,
  exampleCreateHoliday,
  exampleIssuePayment,
  exampleProcessRefund,
  exampleGetChartData,
  exampleCreateFeaturedCar,
  exampleCreateAd,
  exampleCreateRealUserData,
  exampleSendNotification,
  AdminUsersComponent,
};

