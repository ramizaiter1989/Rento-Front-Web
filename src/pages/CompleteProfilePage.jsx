import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Car, Upload, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function CompleteProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [profileStatus, setProfileStatus] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser) {
      toast.error("Please login first");
      navigate("/auth");
      return;
    }
    setUser(storedUser);
    checkProfileStatus();
  }, [navigate]);

  // Check profile completion status from backend
  const checkProfileStatus = async () => {
    try {
      const res = await api.get("/profile/status");
      setProfileStatus(res.data);
      
      // If profile is already complete, redirect
      if (res.data.is_complete) {
        const userData = res.data.user;
        if (userData.role === "agency" || userData.role === "agent") {
          navigate("/Dashboard");
        } else {
          navigate("/");
        }
      }
    } catch (err) {
      console.error("Failed to check profile status:", err);
    }
  };

  // Base fields (common for all users)
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    gender: "",
    birth_date: "",
    city: "",
    bio: "",
    profile_picture: null,
    id_card_front: null,
    id_card_back: null,
    
    // Client-specific fields
    license_number: "",
    driver_license: null,
    profession: "",
    avg_salary: "",
    promo_code: "",
    
    // Agency-specific fields
    business_type: "",
    company_number: "",
    business_doc: null,
    location: "",
    app_fees: "",
    contract_form: "",
    policies: "",
    website: "",
  });

  // Show/hide company fields based on business type
  const [showCompanyFields, setShowCompanyFields] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setForm({ ...form, [name]: files[0] });
    } else {
      setForm({ ...form, [name]: value });
      
      // Toggle company fields for agency
      if (name === "business_type") {
        setShowCompanyFields(value === "company");
      }
    }
  };

  const handleSelectChange = (name, value) => {
    setForm({ ...form, [name]: value });
    if (name === "business_type") {
      setShowCompanyFields(value === "company");
    }
  };

  const validateForm = () => {
    // Base validation
    if (!form.first_name || !form.last_name || !form.gender || !form.birth_date || !form.city) {
      toast.error("Please fill all required base fields");
      return false;
    }
    
    if (!form.id_card_front || !form.id_card_back) {
      toast.error("Please upload both ID card photos");
      return false;
    }

    // Client validation
    if (user?.role === "client") {
      if (!form.license_number || !form.driver_license || !form.profession || !form.avg_salary) {
        toast.error("Please fill all required client fields");
        return false;
      }
    }

    // Agency validation
    if (user?.role === "agency") {
      if (!form.business_type || !form.profession || !form.location) {
        toast.error("Please fill all required agency fields");
        return false;
      }
      
      // Company-specific validation
      if (form.business_type === "company") {
        if (!form.company_number || !form.business_doc) {
          toast.error("Please fill company number and upload business document");
          return false;
        }
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLoading(true);
      const formData = new FormData();
      
      // Add base fields (REQUIRED)
      formData.append("first_name", form.first_name);
      formData.append("last_name", form.last_name);
      formData.append("gender", form.gender);
      formData.append("birth_date", form.birth_date);
      formData.append("city", form.city);
      
      // Add FILES (REQUIRED)
      formData.append("id_card_front", form.id_card_front);
      formData.append("id_card_back", form.id_card_back);
      
      // Optional fields
      if (form.bio) formData.append("bio", form.bio);
      if (form.profile_picture) formData.append("profile_picture", form.profile_picture);

      // Add role-specific fields
      if (user?.role === "client") {
        formData.append("license_number", form.license_number);
        formData.append("driver_license", form.driver_license);
        formData.append("profession", form.profession);
        formData.append("avg_salary", form.avg_salary);
        if (form.promo_code) formData.append("promo_code", form.promo_code);
      } else if (user?.role === "agency") {
        formData.append("business_type", form.business_type);
        formData.append("profession", form.profession);
        formData.append("location", form.location);
        
        // Optional agency fields
        if (form.app_fees) formData.append("app_fees", form.app_fees);
        if (form.contract_form) formData.append("contract_form", form.contract_form);
        if (form.policies) formData.append("policies", form.policies);
        if (form.website) formData.append("website", form.website);
        
        // Company-specific fields (required if business_type === "company")
        if (form.business_type === "company") {
          formData.append("company_number", form.company_number);
          formData.append("business_doc", form.business_doc);
        }
      }

      const res = await api.post("/profile/complete", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Update user in localStorage
      const updatedUser = res.data.user;
      localStorage.setItem("user", JSON.stringify(updatedUser));

      toast.success("Profile completed successfully!");

      // Check profile status from backend response
      const statusCheck = await api.get("/profile/status");
      const isComplete = statusCheck.data.is_complete;

      setTimeout(() => {
        if (isComplete) {
          // Redirect based on role
          if (updatedUser.role === "agency" || updatedUser.role === "agent") {
            navigate("/Dashboard");
          } else {
            navigate("/");
          }
        } else {
          toast.warning("Please complete all required fields");
        }
      }, 500);

    } catch (err) {
      if (err.response?.data?.errors) {
        const errors = Object.values(err.response.data.errors).flat();
        errors.forEach(error => toast.error(error));
      } else {
        toast.error(err.response?.data?.message || "Failed to complete profile");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-primary/5 to-secondary/5">
      <div className="w-full max-w-3xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg mb-4">
            <Car className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold gradient-text">Complete Your Profile</h1>
          <p className="text-muted-foreground mt-2">
            {user?.role === "client" ? "Client Profile" : "Agency Profile"}
          </p>
          
          {/* Show completion percentage if available */}
          {profileStatus && (
            <div className="mt-4 w-full max-w-md">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Profile Completion</span>
                <span className="text-sm font-semibold">{profileStatus.completion_percentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-teal-500 to-cyan-500 h-2 rounded-full transition-all"
                  style={{ width: `${profileStatus.completion_percentage}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        <Card className="hover-glow shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl">
              Complete Your {user?.role === "client" ? "Client" : "Agent"} Profile
            </CardTitle>
            <CardDescription>
              Please fill all required fields to continue
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* ========== BASE FIELDS (ALL USERS) ========== */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Basic Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>First Name *</Label>
                    <Input
                      type="text"
                      name="first_name"
                      value={form.first_name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div>
                    <Label>Last Name *</Label>
                    <Input
                      type="text"
                      name="last_name"
                      value={form.last_name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Gender *</Label>
                    <Select
                      value={form.gender}
                      onValueChange={(value) => handleSelectChange("gender", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Birth Date *</Label>
                    <Input
                      type="date"
                      name="birth_date"
                      value={form.birth_date}
                      onChange={handleChange}
                      max={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label>City *</Label>
                  <Select
                    value={form.city}
                    onValueChange={(value) => handleSelectChange("city", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your city" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beirut">Beirut</SelectItem>
                      <SelectItem value="mount-liban">Mount Liban</SelectItem>
                      <SelectItem value="south">South</SelectItem>
                      <SelectItem value="north">North</SelectItem>
                      <SelectItem value="bekaa">Bekaa</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Bio (optional)</Label>
                  <textarea
                    name="bio"
                    value={form.bio}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 rounded-md border border-input bg-background"
                    placeholder="Tell us about yourself..."
                  />
                </div>

                <div>
                  <Label>Profile Picture (optional)</Label>
                  <Input
                    type="file"
                    name="profile_picture"
                    onChange={handleChange}
                    accept="image/jpeg,image/jpg,image/png"
                  />
                  {form.profile_picture && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {form.profile_picture.name}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>ID Card - Front *</Label>
                    <Input
                      type="file"
                      name="id_card_front"
                      onChange={handleChange}
                      accept="image/jpeg,image/jpg,image/png,application/pdf"
                      required
                    />
                    {form.id_card_front && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {form.id_card_front.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label>ID Card - Back *</Label>
                    <Input
                      type="file"
                      name="id_card_back"
                      onChange={handleChange}
                      accept="image/jpeg,image/jpg,image/png,application/pdf"
                      required
                    />
                    {form.id_card_back && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {form.id_card_back.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <hr className="my-6" />

              {/* ========== CLIENT-SPECIFIC FIELDS ========== */}
              {user?.role === "client" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Client Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>License Number *</Label>
                      <Input
                        type="text"
                        name="license_number"
                        value={form.license_number}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div>
                      <Label>Driver License *</Label>
                      <Input
                        type="file"
                        name="driver_license"
                        onChange={handleChange}
                        accept="image/jpeg,image/jpg,image/png,application/pdf"
                        required
                      />
                      {form.driver_license && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {form.driver_license.name}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Profession *</Label>
                      <Select
                        value={form.profession}
                        onValueChange={(value) => handleSelectChange("profession", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="employee">Employee</SelectItem>
                          <SelectItem value="freelancer">Freelancer</SelectItem>
                          <SelectItem value="business">Business</SelectItem>
                          <SelectItem value="student">Student</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Average Salary *</Label>
                      <Select
                        value={form.avg_salary}
                        onValueChange={(value) => handleSelectChange("avg_salary", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="200-500">$200-500</SelectItem>
                          <SelectItem value="500-1000">$500-1000</SelectItem>
                          <SelectItem value="1000-2000">$1000-2000</SelectItem>
                          <SelectItem value="2000+">$2000+</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label>Promo Code (optional)</Label>
                    <Input
                      type="text"
                      name="promo_code"
                      value={form.promo_code}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              )}

              {/* ========== AGENCY-SPECIFIC FIELDS ========== */}
              {user?.role === "agency" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Agency Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Business Type *</Label>
                      <Select
                        value={form.business_type}
                        onValueChange={(value) => {
                          handleSelectChange("business_type", value);
                          setShowCompanyFields(value === "company");
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="rental">Rental</SelectItem>
                          <SelectItem value="dealer">Dealer</SelectItem>
                          <SelectItem value="private">Private</SelectItem>
                          <SelectItem value="company">Company</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Profession *</Label>
                      <Select
                        value={form.profession}
                        onValueChange={(value) => handleSelectChange("profession", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="agent">Agent</SelectItem>
                          <SelectItem value="driver">Driver</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Company-specific fields */}
                  {showCompanyFields && (
                    <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <AlertCircle className="w-4 h-4" />
                        <p>Company Details (Required)</p>
                      </div>
                      
                      <div>
                        <Label>Company Number *</Label>
                        <Input
                          type="text"
                          name="company_number"
                          value={form.company_number}
                          onChange={handleChange}
                          required={showCompanyFields}
                        />
                      </div>

                      <div>
                        <Label>Business Document *</Label>
                        <Input
                          type="file"
                          name="business_doc"
                          onChange={handleChange}
                          accept="image/jpeg,image/jpg,image/png,application/pdf"
                          required={showCompanyFields}
                        />
                        {form.business_doc && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {form.business_doc.name}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  <div>
                    <Label>Location (JSON format) *</Label>
                    <textarea
                      name="location"
                      value={form.location}
                      onChange={handleChange}
                      rows={2}
                      className="w-full px-3 py-2 rounded-md border border-input bg-background font-mono text-sm"
                      placeholder='{"lat": "33.8547", "lng": "35.8623"}'
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Enter location in JSON format
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                    {/* <div>
                      <Label>App Fees (%) (optional)</Label>
                      <Input
                        type="number"
                        name="app_fees"
                        value={form.app_fees}
                        onChange={handleChange}
                        step="0.01"
                        min="0"
                        max="99.99"
                        placeholder="15.00"
                      />
                    </div> */}

                    <div>
                      <Label>Website (optional)</Label>
                      <Input
                        type="url"
                        name="website"
                        value={form.website}
                        onChange={handleChange}
                        placeholder="https://example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Contract Form (optional)</Label>
                    <textarea
                      name="contract_form"
                      value={form.contract_form}
                      onChange={handleChange}
                      rows={2}
                      className="w-full px-3 py-2 rounded-md border border-input bg-background"
                    />
                  </div>

                  <div>
                    <Label>Policies (optional)</Label>
                    <textarea
                      name="policies"
                      value={form.policies}
                      onChange={handleChange}
                      rows={2}
                      className="w-full px-3 py-2 rounded-md border border-input bg-background"
                    />
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-secondary to-accent font-semibold text-lg py-6"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Profile"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}