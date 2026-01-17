/**
 * Real User Data Management Page
 * 
 * Admin page for managing real user data verification.
 * Allows admins to view user ID cards and fill in real user data.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Search,
  Edit,
  X,
  Save,
  Loader2,
  Image as ImageIcon,
  UserCheck,
  FileText,
  Calendar,
  MapPin,
  CreditCard,
  User
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { getUsers, getUser, getRealUserDataByUser, createOrUpdateRealUserData } from '@/lib/adminApi';
import api from '@/lib/axios';

const COLORS = {
  darkBlue: '#0E4C81',
  teal: '#008C95',
  limeGreen: '#8AC640'
};

export default function RealUserDataPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    id_number: '',
    passport_number: '',
    driver_license_number: '',
    gender: '',
    date_of_birth: '',
    mother_name: '',
    place_of_birth: '',
    status: 'approved',
    reason_of_status: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [idCardFront, setIdCardFront] = useState(null);
  const [idCardBack, setIdCardBack] = useState(null);

  // Get image URL - matches pattern used in other components
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    // Use relative path pattern like other components
    return `/api/storage/${imagePath}`;
  };

  // Fetch users
  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredUsers(users);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredUsers(
        users.filter(
          (user) =>
            user.name?.toLowerCase().includes(query) ||
            user.email?.toLowerCase().includes(query) ||
            user.phone_number?.includes(query) ||
            user.username?.toLowerCase().includes(query) ||
            user.id?.toString().includes(query)
        )
      );
    }
  }, [searchQuery, users]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await getUsers({ per_page: 100 });
      setUsers(response.data.users.data || []);
      setFilteredUsers(response.data.users.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const openModal = async (user) => {
    setSelectedUser(user);
    setModalOpen(true);
    
    // Reset form
    setFormData({
      first_name: '',
      middle_name: '',
      last_name: '',
      id_number: '',
      passport_number: '',
      driver_license_number: '',
      gender: '',
      date_of_birth: '',
      mother_name: '',
      place_of_birth: '',
      status: 'approved',
      reason_of_status: ''
    });

    try {
      // Fetch user details to get ID card images
      const userDetailsResponse = await getUser(user.id);
      const userDetails = userDetailsResponse.data.user;
      
      // Set ID card images
      if (userDetails.id_card_front) {
        setIdCardFront(userDetails.id_card_front);
      } else {
        setIdCardFront(null);
      }
      
      if (userDetails.id_card_back) {
        setIdCardBack(userDetails.id_card_back);
      } else {
        setIdCardBack(null);
      }

      // Fetch existing real user data if available
      try {
        const realDataResponse = await getRealUserDataByUser(user.id);
        const realData = realDataResponse.data.real_user_data;
        
        if (realData) {
          setFormData({
            first_name: realData.first_name || '',
            middle_name: realData.middle_name || '',
            last_name: realData.last_name || '',
            id_number: realData.id_number || '',
            passport_number: realData.passport_number || '',
            driver_license_number: realData.driver_license_number || '',
            gender: realData.gender || '',
            date_of_birth: realData.date_of_birth || '',
            mother_name: realData.mother_name || '',
            place_of_birth: realData.place_of_birth || '',
            status: realData.status || 'approved',
            reason_of_status: realData.reason_of_status || ''
          });
        }
      } catch (error) {
        // No real user data exists yet, that's fine
        console.log('No existing real user data found');
      }
    } catch (error) {
      toast.error('Failed to load user details');
      console.error(error);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedUser(null);
    setFormData({
      first_name: '',
      middle_name: '',
      last_name: '',
      id_number: '',
      passport_number: '',
      driver_license_number: '',
      gender: '',
      date_of_birth: '',
      mother_name: '',
      place_of_birth: '',
      status: 'approved',
      reason_of_status: ''
    });
    setIdCardFront(null);
    setIdCardBack(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedUser) return;

    setSubmitting(true);
    try {
      // Prepare data (remove empty strings, keep only filled fields)
      const submitData = Object.fromEntries(
        Object.entries(formData).filter(([_, value]) => value !== '')
      );

      const response = await createOrUpdateRealUserData(selectedUser.id, submitData);
      
      toast.success(response.data.message || 'Real user data saved successfully');
      closeModal();
      fetchUsers(); // Refresh users list
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Failed to save real user data';
      toast.error(errorMessage);
      
      // Show validation errors if any
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        Object.keys(errors).forEach((key) => {
          toast.error(`${key}: ${errors[key][0]}`);
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent" style={{
              backgroundImage: `linear-gradient(to right, ${COLORS.darkBlue}, ${COLORS.teal}, ${COLORS.limeGreen})`
            }}>
              Real User Data Management
            </h1>
            <p className="text-muted-foreground mt-2">
              View user ID cards and fill in real user data for verification
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate('/admin-panel-page')}
            className="flex items-center gap-2"
          >
            <User className="w-4 h-4" />
            Back to Admin Panel
          </Button>
        </div>

        {/* Search Bar */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search users by name, email, phone, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Users List
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin" style={{ color: COLORS.teal }} />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No users found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">{user.id}</TableCell>
                        <TableCell>{user.name || 'N/A'}</TableCell>
                        <TableCell>{user.email || 'N/A'}</TableCell>
                        <TableCell>{user.phone_number || 'N/A'}</TableCell>
                        <TableCell>{user.username || 'N/A'}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            onClick={() => openModal(user)}
                            style={{
                              background: `linear-gradient(to right, ${COLORS.darkBlue}, ${COLORS.teal})`
                            }}
                            className="text-white"
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Fill Real Data
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modal */}
        <AnimatePresence>
          {modalOpen && selectedUser && (
            <Dialog open={modalOpen} onOpenChange={closeModal}>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <UserCheck className="w-5 h-5" />
                    Real User Data — {selectedUser.name || selectedUser.username || `User #${selectedUser.id}`}
                  </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* ID Card Previews */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-2">
                          <ImageIcon className="w-4 h-4" />
                          ID Card - Front
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="w-full h-48 bg-muted rounded-lg flex items-center justify-center overflow-hidden border-2 border-dashed">
                          {idCardFront ? (
                            <img
                              src={getImageUrl(idCardFront)}
                              alt="ID Card Front"
                              className="max-w-full max-h-full object-contain"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div
                            className={`w-full h-full flex items-center justify-center text-muted-foreground ${
                              idCardFront ? 'hidden' : ''
                            }`}
                          >
                            <div className="text-center">
                              <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                              <p className="text-sm">No Front ID</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-2">
                          <ImageIcon className="w-4 h-4" />
                          ID Card - Back
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="w-full h-48 bg-muted rounded-lg flex items-center justify-center overflow-hidden border-2 border-dashed">
                          {idCardBack ? (
                            <img
                              src={getImageUrl(idCardBack)}
                              alt="ID Card Back"
                              className="max-w-full max-h-full object-contain"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div
                            className={`w-full h-full flex items-center justify-center text-muted-foreground ${
                              idCardBack ? 'hidden' : ''
                            }`}
                          >
                            <div className="text-center">
                              <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                              <p className="text-sm">No Back ID</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Form Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first_name">
                        First Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="first_name"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleInputChange}
                        placeholder="First Name"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="middle_name">Middle Name</Label>
                      <Input
                        id="middle_name"
                        name="middle_name"
                        value={formData.middle_name}
                        onChange={handleInputChange}
                        placeholder="Middle Name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="last_name">
                        Last Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="last_name"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleInputChange}
                        placeholder="Last Name"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="id_number">ID Number</Label>
                      <Input
                        id="id_number"
                        name="id_number"
                        value={formData.id_number}
                        onChange={handleInputChange}
                        placeholder="ID Number"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="passport_number">Passport Number</Label>
                      <Input
                        id="passport_number"
                        name="passport_number"
                        value={formData.passport_number}
                        onChange={handleInputChange}
                        placeholder="Passport Number"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="driver_license_number">Driver License Number</Label>
                      <Input
                        id="driver_license_number"
                        name="driver_license_number"
                        value={formData.driver_license_number}
                        onChange={handleInputChange}
                        placeholder="Driver License Number"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gender">
                        Gender <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.gender}
                        onValueChange={(value) => handleSelectChange('gender', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="date_of_birth">Date of Birth</Label>
                      <Input
                        id="date_of_birth"
                        name="date_of_birth"
                        type="date"
                        value={formData.date_of_birth}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="mother_name">Mother's Name</Label>
                      <Input
                        id="mother_name"
                        name="mother_name"
                        value={formData.mother_name}
                        onChange={handleInputChange}
                        placeholder="Mother's Name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="place_of_birth">Place of Birth</Label>
                      <Input
                        id="place_of_birth"
                        name="place_of_birth"
                        value={formData.place_of_birth}
                        onChange={handleInputChange}
                        placeholder="Place of Birth"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value) => handleSelectChange('status', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="not_approved">Not Approved</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="reason_of_status">Reason for Status</Label>
                      <Input
                        id="reason_of_status"
                        name="reason_of_status"
                        value={formData.reason_of_status}
                        onChange={handleInputChange}
                        placeholder="Reason for status (optional)"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={closeModal}
                      disabled={submitting}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={submitting}
                      style={{
                        background: `linear-gradient(to right, ${COLORS.darkBlue}, ${COLORS.teal})`
                      }}
                      className="text-white"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Real Data
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

