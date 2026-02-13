import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Car, AlertCircle, MapPin, Navigation, Search } from "lucide-react";
import { toast } from "sonner";

// Lebanese regions for agency address dropdown (label -> form value)
const ADDRESS_OPTIONS = [
  { label: "Beirut", value: "beirut" },
  { label: "Mount Lebanon", value: "mount-liban" },
  { label: "North", value: "north" },
  { label: "South", value: "south" },
  { label: "Bekaa", value: "bekaa" },
  { label: "Baalbek", value: "baalbek" },
  { label: "Keserwan", value: "keserwan" },
  { label: "Nabatieh", value: "nabatieh" },
  { label: "Akkar", value: "akkar" },
];

function parseGoogleMapsLink(url) {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  const atMatch = trimmed.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
  if (atMatch) return { lat: parseFloat(atMatch[1]), lng: parseFloat(atMatch[2]) };
  const qMatch = trimmed.match(/[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
  if (qMatch) return { lat: parseFloat(qMatch[1]), lng: parseFloat(qMatch[2]) };
  const llMatch = trimmed.match(/(?:!3d|!4d|!1d)(-?\d+\.?\d*)/g);
  if (llMatch && llMatch.length >= 2) {
    const lat = parseFloat(String(llMatch[0]).replace(/\D/g, ""));
    const lng = parseFloat(String(llMatch[1]).replace(/\D/g, ""));
    if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
  }
  return null;
}

export default function CompleteProfilePage() {
  const navigate = useNavigate();

  // =========================
  // DEBUG HELPERS
  // =========================
  const DEBUG = true;

  const debugId = useMemo(() => {
    return `cp_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  }, []);

  const log = (...args) => {
    if (!DEBUG) return;
    console.log(`[CompleteProfile ${debugId}]`, ...args);
  };

  const logAxiosBase = () => {
    try {
      log("axios.baseURL =", api?.defaults?.baseURL);
      log("axios.withCredentials =", api?.defaults?.withCredentials);
      log(
        "axios.headers.Authorization =",
        api?.defaults?.headers?.common?.Authorization
      );
    } catch (e) {
      log("Failed to read axios defaults", e);
    }
  };

  const dumpFormData = (fd) => {
    try {
      const entries = [];
      for (const [k, v] of fd.entries()) {
        if (v instanceof File) {
          entries.push({
            key: k,
            type: "File",
            name: v.name,
            size: v.size,
            mime: v.type,
          });
        } else {
          entries.push({ key: k, type: typeof v, value: v });
        }
      }
      log("FormData entries =>", entries);
      return entries;
    } catch (e) {
      log("Failed to dump FormData", e);
      return null;
    }
  };

  // =========================
  // STATE
  // =========================
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [profileStatus, setProfileStatus] = useState(null);

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

    // Client-specific
    license_number: "",
    driver_license: null,
    profession: "",
    avg_salary: "",
    promo_code: "",

    // Agency-specific
    business_type: "",
    company_number: "",
    business_doc: null,
    location: "",
    app_fees: "",
    contract_form: "",
    policies: "",
    website: "",
  });

  const [showCompanyFields, setShowCompanyFields] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState({ lat: 33.8547, lng: 35.8623 }); // Default: Beirut
  const [googleLinkInput, setGoogleLinkInput] = useState("");
  const [locationSearchQuery, setLocationSearchQuery] = useState("");
  const [locationSearchLoading, setLocationSearchLoading] = useState(false);
  const [mapSearchQuery, setMapSearchQuery] = useState("");
  const [mapSearchLoading, setMapSearchLoading] = useState(false);

  const isClient = user?.role === "client";
  const isAgency = user?.role === "agency" || user?.role === "agency";

  const normalizeDate = (d) => {
    if (!d) return "";
    return String(d).slice(0, 10);
  };

  const prefillFromStatus = (status) => {
    const u = status?.user || {};
    const c = status?.client || u?.client || {};
    const a = status?.agency || u?.agency || status?.agency || {};

    setForm((prev) => ({
      ...prev,
      first_name: u.first_name ?? prev.first_name ?? "",
      last_name: u.last_name ?? prev.last_name ?? "",
      gender: u.gender ?? prev.gender ?? "",
      birth_date: normalizeDate(u.birth_date) || prev.birth_date || "",
      city: u.city ?? prev.city ?? "",
      bio: u.bio ?? prev.bio ?? "",

      // Client fields (prefill)
      license_number: c.license_number ?? prev.license_number ?? "",
      profession: c.profession ?? prev.profession ?? "",
      avg_salary: c.avg_salary ?? prev.avg_salary ?? "",
      promo_code: c.promo_code ?? prev.promo_code ?? "",

      // Agency fields (prefill)
      business_type: a.business_type ?? prev.business_type ?? "",
      company_number: a.company_number ?? prev.company_number ?? "",
      location: a.location
        ? typeof a.location === "string"
          ? a.location
          : JSON.stringify(a.location)
        : prev.location ?? "",
      app_fees: a.app_fees ?? prev.app_fees ?? "",
      contract_form: a.contract_form ?? prev.contract_form ?? "",
      policies: a.policies ?? prev.policies ?? "",
      website: a.website ?? prev.website ?? "",
    }));

    const bt = (a.business_type || "").toString();
    setShowCompanyFields(bt === "company");

    // Parse existing location if available
    if (a.location) {
      try {
        const locData = typeof a.location === "string" ? JSON.parse(a.location) : a.location;
        if (locData.latitude && locData.longitude) {
          setSelectedLocation({ lat: locData.latitude, lng: locData.longitude });
          setMapCenter({ lat: locData.latitude, lng: locData.longitude });
        }
      } catch (e) {
        log("Failed to parse existing location", e);
      }
    }
  };

  // =========================
  // LOCATION HANDLERS
  // =========================
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      openMapPicker();
      return;
    }

    toast.info("Getting your location...");
    const options = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 60000,
    };
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: parseFloat(position.coords.latitude.toFixed(6)),
          lng: parseFloat(position.coords.longitude.toFixed(6)),
        };
        setSelectedLocation(location);
        setMapCenter(location);
        
        // Store as proper JSON structure for backend
        const locationJson = {
          latitude: location.lat,
          longitude: location.lng,
          country: "Lebanon"
        };
        setForm((prev) => ({ ...prev, location: JSON.stringify(locationJson) }));
        toast.success("Location detected successfully!");
        log("Current location:", locationJson);
      },
      (error) => {
        log("Geolocation error:", error);
        toast.info("Location could not be detected. Select your location on the map.");
        setShowMapModal(true);
      },
      options
    );
  };

  const openMapPicker = () => {
    setShowMapModal(true);
  };

  const handleMapClick = (lat, lng) => {
    const location = {
      lat: parseFloat(lat.toFixed(6)),
      lng: parseFloat(lng.toFixed(6)),
    };
    setSelectedLocation(location);
    log("Map clicked location:", location);
  };

  const confirmLocationSelection = () => {
    if (selectedLocation) {
      // Store as proper JSON structure for backend
      const locationJson = {
        latitude: selectedLocation.lat,
        longitude: selectedLocation.lng,
        country: "Lebanon"
      };
      setForm((prev) => ({ ...prev, location: JSON.stringify(locationJson) }));
      toast.success("Location selected!");
      setShowMapModal(false);
    } else {
      toast.error("Please select a location on the map");
    }
  };

  const applyGoogleLink = (url) => {
    const coords = parseGoogleMapsLink(url);
    if (coords) {
      const location = { lat: parseFloat(coords.lat.toFixed(6)), lng: parseFloat(coords.lng.toFixed(6)) };
      setSelectedLocation(location);
      setMapCenter(location);
      const locationJson = { latitude: location.lat, longitude: location.lng, country: "Lebanon" };
      setForm((prev) => ({ ...prev, location: JSON.stringify(locationJson) }));
      toast.success("Location set from Google Maps link.");
    } else {
      toast.error("Could not read coordinates. Use a link with lat,lng (e.g. @33.89,35.50 or ?q=33.89,35.50).");
    }
  };

  const searchLocation = async (query, isMapModal) => {
    const q = query.trim();
    if (!q) return;
    if (isMapModal) setMapSearchLoading(true);
    else setLocationSearchLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1`,
        { headers: { Accept: "application/json" } }
      );
      const data = await res.json();
      if (data && data[0]) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        const location = { lat, lng };
        setSelectedLocation(location);
        setMapCenter(location);
        const locationJson = { latitude: lat, longitude: lng, country: "Lebanon" };
        setForm((prev) => ({ ...prev, location: JSON.stringify(locationJson) }));
        toast.success("Location found. Confirm in the modal if needed.");
      } else {
        toast.error("No results found. Try another search.");
      }
    } catch {
      toast.error("Search failed. Try again.");
    } finally {
      if (isMapModal) setMapSearchLoading(false);
      else setLocationSearchLoading(false);
    }
  };

  const handleLocationSearch = () => searchLocation(locationSearchQuery, false);
  const handleMapSearch = () => searchLocation(mapSearchQuery, true);

  // =========================
  // API CALLS
  // =========================
  const checkProfileStatus = async () => {
    try {
      logAxiosBase();
      log("GET /profile/status starting...");
      const res = await api.get("/profile/status", {
        headers: { "X-Debug-Id": debugId },
      });
      log("GET /profile/status success:", res.status, res.data);

      setProfileStatus(res.data);
      prefillFromStatus(res.data);

      if (res.data?.is_complete) {
        const userData = res.data.user;
        log("Profile already complete. Redirecting. role =", userData?.role);

        if (userData?.role === "agency" || userData?.role === "agency") {
          navigate("/Dashboard");
        } else {
          navigate("/");
        }
      }
    } catch (err) {
      log("GET /profile/status FAILED", err);
      if (err?.response) {
        log("Status error response:", err.response.status, err.response.data);
      }
    }
  };

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser) {
      toast.error("Please login first");
      navigate("/auth");
      return;
    }
    setUser(storedUser);
    log("Loaded user from localStorage:", storedUser);
    checkProfileStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  // =========================
  // HANDLERS
  // =========================
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (files) {
      const f = files[0] || null;
      setForm((prev) => ({ ...prev, [name]: f }));
      log("File changed:", name, f ? { name: f.name, size: f.size, type: f.type } : null);
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
    log("Field changed:", name, value);

    if (name === "business_type") {
      setShowCompanyFields(value === "company");
    }
  };

  const handleSelectChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    log("Select changed:", name, value);

    if (name === "business_type") {
      setShowCompanyFields(value === "company");
    }
  };

  const validateForm = () => {
    // Base fields validation
    if (!form.first_name || !form.last_name || !form.gender || !form.birth_date || !form.city) {
      toast.error("Please fill all required base fields");
      return false;
    }

    // ID cards are required
    if (!form.id_card_front || !form.id_card_back) {
      toast.error("Please upload both ID card photos");
      return false;
    }

    if (isClient) {
      // Client-specific validation
      if (!form.license_number || !form.driver_license || !form.profession || !form.avg_salary) {
        toast.error("Please fill all required client fields");
        return false;
      }

      // Validate profession enum
      const validClientProfessions = ['employee', 'freelancer', 'business', 'student', 'other'];
      if (!validClientProfessions.includes(form.profession)) {
        toast.error("Please select a valid profession");
        return false;
      }

      // Validate avg_salary enum
      const validSalaryRanges = ['200-500', '500-1000', '1000-2000', '2000+'];
      if (!validSalaryRanges.includes(form.avg_salary)) {
        toast.error("Please select a valid salary range");
        return false;
      }
    }

    if (isAgency) {
      console.log("[CompleteProfile Validate]", "Agency validation started", {
        business_type: form.business_type,
        profession: form.profession,
        hasLocation: !!form.location,
        locationLength: form.location?.length,
      });
      // Agency-specific validation
      if (!form.business_type || !form.profession) {
        console.log("[CompleteProfile Validate]", "Failed: missing business_type or profession");
        toast.error("Please fill all required agency fields");
        return false;
      }

      if (!form.location) {
        console.log("[CompleteProfile Validate]", "Failed: no location");
        toast.error("Please select your agency location. Opening map...");
        setShowMapModal(true);
        setTimeout(() => document.getElementById("agency-location-section")?.scrollIntoView({ behavior: "smooth" }), 100);
        return false;
      }

      // Validate business_type enum – must match backend:
      // rental, private, company, marina
      const allowedBusinessTypes = ['rental', 'private', 'company', 'marina'];
      if (!allowedBusinessTypes.includes(form.business_type)) {
        console.log("[CompleteProfile Validate]", "Failed: invalid business_type", form.business_type);
        toast.error("Please select a valid business type");
        return false;
      }

      // Validate profession enum for agency – must match backend:
      // owner, manager
      const validAgencyProfessions = ['owner', 'manager'];
      if (!validAgencyProfessions.includes(form.profession)) {
        console.log("[CompleteProfile Validate]", "Failed: invalid profession", form.profession);
        toast.error("Please select a valid profession");
        return false;
      }

      // Validate location JSON
      try {
        const locationData = JSON.parse(form.location);
        if (!locationData.latitude || !locationData.longitude) {
          console.log("[CompleteProfile Validate]", "Failed: location missing lat/lng", locationData);
          toast.error('Invalid location data. Please select your location again');
          return false;
        }
        console.log("[CompleteProfile Validate]", "Location OK", locationData);
      } catch (parseErr) {
        console.log("[CompleteProfile Validate]", "Failed: location parse error", parseErr, "raw:", form.location);
        toast.error('Invalid location format. Please select your location again');
        return false;
      }

      // Company-specific validation
      if (form.business_type === "company") {
        if (!form.company_number || !form.business_doc) {
          console.log("[CompleteProfile Validate]", "Failed: company fields", {
            company_number: form.company_number,
            business_doc: !!form.business_doc,
          });
          toast.error("Please fill company number and upload business document");
          return false;
        }
      }
      console.log("[CompleteProfile Validate]", "Agency validation passed");
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const debugPrefix = "[CompleteProfile Submit]";
    console.log(debugPrefix, "Submit clicked", {
      role: user?.role,
      isClient,
      isAgency,
      formKeys: Object.keys(form),
    });
    if (user?.role === "agency" || user?.role === "agency") {
      console.log(debugPrefix, "Agency form state", {
        business_type: form.business_type,
        profession: form.profession,
        location: form.location,
        locationParsed: (() => {
          try {
            return form.location ? JSON.parse(form.location) : null;
          } catch (e) {
            return { parseError: String(e.message) };
          }
        })(),
        company_number: form.company_number,
        business_doc: form.business_doc?.name ?? form.business_doc,
        app_fees: form.app_fees,
        contract_form: form.contract_form,
        policies: form.policies,
        website: form.website,
      });
    }
    log("Submit clicked. role =", user?.role, "isClient =", isClient, "isAgency =", isAgency);
    logAxiosBase();

    if (!validateForm()) {
      console.log(debugPrefix, "Validation failed on client side.");
      log("Validation failed on client side.");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      // Base fields - ALWAYS LOWERCASE ENUMS
      formData.append("first_name", form.first_name);
      formData.append("last_name", form.last_name);
      formData.append("gender", form.gender.toLowerCase()); // ✅ Lowercase
      formData.append("birth_date", form.birth_date);
      formData.append("city", form.city.toLowerCase()); // ✅ Lowercase

      // ✅ ALWAYS send bio (even if empty)
      formData.append("bio", form.bio || "");

      // Files (backend requires these as required)
      if (form.id_card_front) formData.append("id_card_front", form.id_card_front);
      if (form.id_card_back) formData.append("id_card_back", form.id_card_back);

      // Profile picture is optional
      if (form.profile_picture) formData.append("profile_picture", form.profile_picture);

      if (isClient) {
        formData.append("license_number", form.license_number);
        if (form.driver_license) formData.append("driver_license", form.driver_license);
        formData.append("profession", form.profession.toLowerCase()); // ✅ Lowercase
        formData.append("avg_salary", form.avg_salary); // Already in correct format
        
        // ✅ Only send promo_code if not empty
        if (form.promo_code?.trim()) {
          formData.append("promo_code", form.promo_code.trim());
        }
      } else if (isAgency) {
        console.log("[CompleteProfile Submit]", "Building agency FormData...");
        formData.append("business_type", form.business_type.toLowerCase()); // ✅ Lowercase
        formData.append("profession", form.profession.toLowerCase()); // ✅ Lowercase

        // ✅ Location as JSON string with correct structure
        let locationData;
        try {
          locationData = JSON.parse(form.location);
          const cleanedLocation = JSON.stringify({
            latitude: parseFloat(locationData.latitude),
            longitude: parseFloat(locationData.longitude),
            country: locationData.country || "Lebanon"
          });
          formData.append("location", cleanedLocation);
          console.log("[CompleteProfile Submit]", "Location appended", { cleanedLocation, locationData });
        } catch (locationErr) {
          console.error("[CompleteProfile Submit]", "Location parse/append error", locationErr);
          console.log("[CompleteProfile Submit]", "form.location raw:", form.location);
          throw locationErr;
        }

        // Optional fields - only send if not empty
        if (form.app_fees?.trim()) {
          formData.append("app_fees", form.app_fees.trim());
        }
        if (form.contract_form?.trim()) {
          formData.append("contract_form", form.contract_form.trim());
        }
        if (form.policies?.trim()) {
          formData.append("policies", form.policies.trim());
        }
        if (form.website?.trim()) {
          formData.append("website", form.website.trim());
        }

        // Company-specific fields
        if (form.business_type === "company") {
          formData.append("company_number", form.company_number);
          if (form.business_doc) formData.append("business_doc", form.business_doc);
          console.log("[CompleteProfile Submit]", "Company fields appended", {
            company_number: form.company_number,
            business_doc: form.business_doc?.name ?? (form.business_doc ? "present" : "missing"),
          });
        }
        const entries = [];
        formData.forEach((value, key) => {
          entries.push({ key, value: value instanceof File ? `File: ${value.name}` : value });
        });
        console.log("[CompleteProfile Submit]", "FormData entries (agency)", entries);
      }

      dumpFormData(formData);

      const apiUrl = api.defaults?.baseURL ? `${api.defaults.baseURL}/profile/complete` : "/profile/complete";
      console.log("[CompleteProfile Submit]", "POST /profile/complete", { apiUrl, contentType: "multipart/form-data" });
      log("POST /profile/complete starting...");
      const res = await api.post("/profile/complete", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "X-Debug-Id": debugId,
        },
      });

      console.log("[CompleteProfile Submit]", "POST /profile/complete success", res.status, res.data);
      log("POST /profile/complete success:", res.status, res.data);

      const updatedUser = res.data.user;
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);

      toast.success("Profile completed successfully!");

      log("Refreshing status...");
      const statusCheck = await api.get("/profile/status", {
        headers: { "X-Debug-Id": debugId },
      });

      log("GET /profile/status after submit:", statusCheck.status, statusCheck.data);
      setProfileStatus(statusCheck.data);

      const isComplete = statusCheck.data.is_complete;

      setTimeout(() => {
        if (isComplete) {
          if (updatedUser.role === "agency" || updatedUser.role === "agency") {
            navigate("/Dashboard");
          } else {
            navigate("/");
          }
        } else {
          toast.warning("Please complete all required fields");
        }
      }, 500);
    } catch (err) {
      console.error("[CompleteProfile Submit]", "Request failed", err);
      console.log("[CompleteProfile Submit]", "Error name:", err?.name, "message:", err?.message);
      log("POST /profile/complete FAILED:", err);

      if (err?.response) {
        console.log("[CompleteProfile Submit]", "Response status:", err.response.status);
        console.log("[CompleteProfile Submit]", "Response data:", err.response.data);
        console.log("[CompleteProfile Submit]", "Response headers:", JSON.stringify(err.response.headers, null, 2));
        log("Error response status:", err.response.status);
        log("Error response data:", err.response.data);
        log("Error response headers:", err.response.headers);

        // Handle 403 Forbidden
        if (err.response.status === 403) {
          const errorMessage = err.response?.data?.message || err.response?.data?.error || "You do not have permission to update your profile. Please contact administrator.";
          toast.error(errorMessage);
          return;
        }

        if (typeof err.response.data === "string") {
          log("Error response (string, first 500 chars):", err.response.data.slice(0, 500));
        }

        if (err.response?.data?.errors) {
          console.log("[CompleteProfile Submit]", "Validation errors (422)", err.response.data.errors);
          const errors = Object.values(err.response.data.errors).flat();
          errors.forEach((error) => toast.error(error));
        } else {
          console.log("[CompleteProfile Submit]", "Error message:", err.response?.data?.message);
          toast.error(err.response?.data?.message || "Failed to complete profile");
        }
      } else if (err?.request) {
        console.log("[CompleteProfile Submit]", "No response received (network/CORS)", err.request);
        log("No response received. Request:", err.request);
        toast.error("No response from server. Check network/CORS/auth.");
      } else {
        log("Unknown error:", err?.message || err);
        toast.error("Unexpected error occurred.");
      }

      log(
        "If you see https://.../api/api/... then your axios baseURL already contains /api and your proxy/route also adds /api."
      );
      log("Fix by adjusting api.defaults.baseURL OR Vite proxy OR route prefix so it becomes /api/profile/complete only once.");
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

          {profileStatus && (
            <div className="mt-4 w-full max-w-md">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Profile Completion</span>
                <span className="text-sm font-semibold">
                  {profileStatus.completion_percentage}%
                </span>
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
              Complete Your {user?.role === "client" ? "Client" : "agency"} Profile
            </CardTitle>
            <CardDescription>Please fill all required fields to continue</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* BASE FIELDS */}
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
                      max={new Date().toISOString().split("T")[0]}
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

              {/* CLIENT FIELDS */}
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

              {/* AGENCY FIELDS */}
              {(user?.role === "agency" || user?.role === "agency") && (
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
                          <SelectItem value="private">Private</SelectItem>
                          <SelectItem value="company">Company</SelectItem>
                          <SelectItem value="marina">Marina</SelectItem>
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
                          <SelectItem value="owner">Owner</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

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

                  <div id="agency-location-section">
                    <Label>Address (region) *</Label>
                    <Select
                      value={form.city || ""}
                      onValueChange={(value) => handleSelectChange("city", value)}
                    >
                      <SelectTrigger className="mb-3">
                        <SelectValue placeholder="Select your region" />
                      </SelectTrigger>
                      <SelectContent>
                        {ADDRESS_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Label>Location *</Label>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-muted-foreground text-xs">Paste Google Maps link</Label>
                        <div className="flex gap-2 mt-1">
                          <Input
                            placeholder="e.g. https://www.google.com/maps/@33.8938,35.5018,17z"
                            value={googleLinkInput}
                            onChange={(e) => setGoogleLinkInput(e.target.value)}
                            onBlur={(e) => {
                              const v = e.target.value?.trim();
                              if (v) applyGoogleLink(v);
                            }}
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => googleLinkInput.trim() && applyGoogleLink(googleLinkInput)}
                          >
                            Apply
                          </Button>
                        </div>
                      </div>

                      <div>
                        <Label className="text-muted-foreground text-xs">Search address</Label>
                        <div className="flex gap-2 mt-1">
                          <Input
                            placeholder="Search address or place..."
                            value={locationSearchQuery}
                            onChange={(e) => setLocationSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleLocationSearch())}
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleLocationSearch}
                            disabled={locationSearchLoading}
                          >
                            <Search className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex gap-2 flex-wrap">
                        <Button
                          type="button"
                          variant="outline"
                          className="flex-1 min-w-[140px]"
                          onClick={getCurrentLocation}
                        >
                          <Navigation className="w-4 h-4 mr-2" />
                          Use Current Location
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="flex-1 min-w-[140px]"
                          onClick={openMapPicker}
                        >
                          <MapPin className="w-4 h-4 mr-2" />
                          Select on Map
                        </Button>
                      </div>
                      
                      {selectedLocation ? (
                        <div className="p-4 bg-primary/10 border-2 border-primary/20 rounded-lg">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                              <MapPin className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-sm mb-1">Location Selected</p>
                              <p className="text-sm text-muted-foreground">
                                Latitude: {selectedLocation.lat}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Longitude: {selectedLocation.lng}
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 bg-muted/30 border-2 border-dashed rounded-lg text-center">
                          <MapPin className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">
                            No location selected yet
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Click one of the buttons above to set your location
                          </p>
                        </div>
                      )}

                      <input
                        type="hidden"
                        name="location"
                        value={form.location}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
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

      {/* Map Modal */}
      <Dialog open={showMapModal} onOpenChange={(open) => { setShowMapModal(open); if (!open) setMapSearchQuery(""); }}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Select Your Location</DialogTitle>
            <DialogDescription>
              Search for a place or click on the map to select your business location
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              <div className="flex flex-1 min-w-[200px] rounded-md overflow-hidden border border-input">
                <Input
                  placeholder="Search address or place..."
                  value={mapSearchQuery}
                  onChange={(e) => setMapSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleMapSearch())}
                  className="rounded-r-none border-0 h-10 focus-visible:ring-0"
                />
                <Button type="button" variant="secondary" onClick={handleMapSearch} disabled={mapSearchLoading} className="rounded-l-none h-10 px-4">
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="w-full h-[500px] bg-muted rounded-lg overflow-hidden">
              <MapComponent
                center={mapCenter}
                selectedLocation={selectedLocation}
                onLocationSelect={handleMapClick}
              />
            </div>

            {selectedLocation && (
              <div className="p-3 bg-muted/50 rounded-md">
                <p className="text-sm">
                  <span className="font-medium">Selected:</span> {selectedLocation.lat}, {selectedLocation.lng}
                </p>
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowMapModal(false)}>
                Cancel
              </Button>
              <Button onClick={confirmLocationSelection}>
                Confirm Location
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Simple Map Component using Leaflet
function MapComponent({ center, selectedLocation, onLocationSelect }) {
  const mapRef = React.useRef(null);
  const markerRef = React.useRef(null);

  useEffect(() => {
    // Load Leaflet dynamically
    if (typeof window !== "undefined" && !window.L) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);

      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = () => initMap();
      document.head.appendChild(script);
    } else if (window.L) {
      initMap();
    }
  }, []);

  useEffect(() => {
    if (mapRef.current && window.L) {
      mapRef.current.setView([parseFloat(center.lat), parseFloat(center.lng)], 13);
    }
  }, [center]);

  useEffect(() => {
    if (selectedLocation && markerRef.current && window.L) {
      markerRef.current.setLatLng([
        parseFloat(selectedLocation.lat),
        parseFloat(selectedLocation.lng),
      ]);
    }
  }, [selectedLocation]);

  const initMap = () => {
    if (!window.L || mapRef.current) return;

    const map = window.L.map("map-container").setView(
      [parseFloat(center.lat), parseFloat(center.lng)],
      13
    );

    window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    const marker = window.L.marker([parseFloat(center.lat), parseFloat(center.lng)], {
      draggable: true,
    }).addTo(map);

    marker.on("dragend", (e) => {
      const pos = e.target.getLatLng();
      onLocationSelect(pos.lat, pos.lng);
    });

    map.on("click", (e) => {
      marker.setLatLng(e.latlng);
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    });

    mapRef.current = map;
    markerRef.current = marker;
  };

  return <div id="map-container" className="w-full h-full" />;
}