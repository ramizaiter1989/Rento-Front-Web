import '../styles/auth-animations.css';
import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/axios";
import { sendOtp, sendForgotPasswordOtp, verifyOtp } from "@/lib/otpApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Phone, Lock, User, RefreshCw, ArrowLeft, Car, Sparkles } from "lucide-react";
import { toast } from "sonner";
import countriesData from "@/lib/countries.json";

// ===================
// Feature flags
// ===================
// Toggle this to false later to re‑enable web OTP flows
const OTP_PAUSED = true;

// ===================
// PhoneRow Component
// ===================
const onlyDigits = (v) => v.replace(/\D/g, "");

const PhoneRow = ({ countries, iso2, setIso2, phone, setPhone, disabledPhone }) => (
  <div className="flex gap-2 w-full">
    <select
      value={iso2}
      onChange={(e) => setIso2(e.target.value)}
      className="w-[100px] sm:w-[120px] shrink-0 bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-[#00A19C] focus:border-transparent transition-all"
      disabled={disabledPhone}
    >
      {countries.map((c) => (
        <option key={c.iso2} value={c.iso2}>
          {c.iso2} ({c.dialCode})
        </option>
      ))}
    </select>

    <input
      type="tel"
      inputMode="numeric"
      value={phone}
      onChange={(e) => setPhone(onlyDigits(e.target.value))}
      placeholder="70123456"
      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-[#00A19C] focus:border-transparent transition-all"
      disabled={disabledPhone}
    />
  </div>
);

export function AuthPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("login");
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  // =============================
  // Countries
  // =============================
  const countries = useMemo(() => {
    return countriesData
      .map((c) => ({
        name: c.name,
        iso2: c.iso2,
        dialCode: c.dialCode.startsWith("+") ? c.dialCode : `+${c.dialCode}`,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  const dialCodeByIso2 = useMemo(() => {
    const map = new Map();
    for (const c of countries) map.set(c.iso2, c.dialCode);
    return map;
  }, [countries]);

  const getDialCode = (iso2) => dialCodeByIso2.get(iso2) || "+961";

  // =============================
  // LOGIN STATE
  // =============================
  const [loginPhone, setLoginPhone] = useState("");
  const [loginCountryIso2, setLoginCountryIso2] = useState("LB");
  const [loginPassword, setLoginPassword] = useState("");

  const handleLogin = async () => {
    const fullPhone = `${getDialCode(loginCountryIso2)}${loginPhone.replace(/^0+/, "")}`;
    if (!loginPhone || !loginPassword) {
      return toast.error("Please fill all fields");
    }
    if (!/^\+\d{8,15}$/.test(fullPhone)) {
      return toast.error("Invalid phone number.");
    }

    try {
      setLoading(true);
      const res = await api.post("/auth/login", {
        phone_number: fullPhone,
        password: loginPassword,
      });

      localStorage.setItem("authToken", res.data.token);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      toast.success("Login successful!");

      if (!res.data.user.profile_complete) {
        navigate("/Complete-Profile");
        return;
      }

      if (res.data.user.role === "agency" || res.data.user.role === "agency") {
        navigate("/Dashboard");
      } else {
        navigate("/");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  // =============================
  // REGISTRATION STATE & FLOW
  // =============================
  const [regPhone, setRegPhone] = useState("");
  const [regCountryIso2, setRegCountryIso2] = useState("LB");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const [registerData, setRegisterData] = useState({
    username: "",
    first_name: "",
    last_name: "",
    license_number: "",
    password: "",
    password_confirmation: "",
    role: "client",
    business_type: "",
  });
  const [registerErrors, setRegisterErrors] = useState({
    username: false,
    first_name: false,
    last_name: false,
    license_number: false,
    password: false,
    password_confirmation: false,
    role: false,
    business_type: false,
    terms: false,
  });
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Refs for scrolling/focusing first invalid field
  const usernameRef = useRef(null);
  const firstNameRef = useRef(null);
  const lastNameRef = useRef(null);
  const licenseNumberRef = useRef(null);
  const passwordRef = useRef(null);
  const passwordConfirmRef = useRef(null);
  const roleRef = useRef(null);
  const businessTypeRef = useRef(null);
  const termsRef = useRef(null);

  // Timer for resend OTP
  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const resetRegistrationFlow = () => {
    setRegPhone("");
    setOtpSent(false);
    setOtpCode("");
    setOtpVerified(false);
    setCanResend(false);
    setResendTimer(0);
    setTermsAccepted(false);
    setRegisterData({
      username: "",
      first_name: "",
      last_name: "",
      license_number: "",
      password: "",
      password_confirmation: "",
      role: "client",
      business_type: "",
    });
    setRegisterErrors({
      username: false,
      first_name: false,
      last_name: false,
      license_number: false,
      password: false,
      password_confirmation: false,
      role: false,
      business_type: false,
      terms: false,
    });
  };

  const changeRegisterNumber = () => {
    setOtpSent(false);
    setOtpCode("");
    setOtpVerified(false);
    setCanResend(false);
    setResendTimer(0);
    setRegPhone("");
  };

  const handleSendOtp = async () => {
    if (OTP_PAUSED) {
      toast.info(
        "Web OTP registration is temporarily disabled. Please use our mobile app at https://rento-lb.com/mobile-app."
      );
      return;
    }
    if (!regPhone) return toast.error("Please enter a phone number.");
    const fullPhone = `${getDialCode(regCountryIso2)}${regPhone.replace(/^0+/, "")}`;
    if (!/^\+\d{8,15}$/.test(fullPhone)) {
      return toast.error("Please enter a valid phone number with country code.");
    }

    try {
      setLoading(true);
      const response = await sendOtp(fullPhone);
      
      // Handle success message
      if (response.message) {
        toast.success(response.message);
      }
      
      // Handle warning (e.g., SMS delivery may be delayed)
      if (response.warning) {
        toast.warning(response.warning);
      }
      
      setOtpSent(true);
      setCanResend(false);
      setResendTimer(60);
    } catch (err) {
      // Handle validation errors
      if (err.response?.data?.errors) {
        const errors = err.response.data.errors;
        Object.keys(errors).forEach((key) => {
          errors[key].forEach((error) => toast.error(error));
        });
      } else {
        toast.error(err.response?.data?.message || "Failed to send OTP.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;
    await handleSendOtp();
  };

  const handleVerifyOtp = async () => {
    if (!otpCode) return toast.error("Please enter the OTP code.");
    if (otpCode.length !== 6) return toast.error("OTP code must be 6 digits.");
    const fullPhone = `${getDialCode(regCountryIso2)}${regPhone.replace(/^0+/, "")}`;

    try {
      setLoading(true);
      const response = await verifyOtp(fullPhone, otpCode);
      
      if (response.message) {
        toast.success(response.message);
      } else {
        toast.success("OTP verified! Complete your registration.");
      }
      
      setOtpVerified(true);
    } catch (err) {
      // Handle error response
      if (err.response?.data?.error) {
        toast.error(err.response.data.error);
      } else {
        toast.error(err.response?.data?.message || "Invalid or expired OTP.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    // Reset errors
    let hasError = false;
    const nextErrors = {
      username: false,
      first_name: false,
      last_name: false,
      license_number: false,
      password: false,
      password_confirmation: false,
      role: false,
      business_type: false,
      terms: false,
    };

    if (!registerData.username.trim()) {
      nextErrors.username = true;
      hasError = true;
    }
    if (!registerData.first_name.trim()) {
      nextErrors.first_name = true;
      hasError = true;
    }
    if (!registerData.last_name.trim()) {
      nextErrors.last_name = true;
      hasError = true;
    }
    if (registerData.role === "client" && !registerData.license_number.trim()) {
      nextErrors.license_number = true;
      hasError = true;
    }
    if (!registerData.password) {
      nextErrors.password = true;
      hasError = true;
    }
    if (registerData.password !== registerData.password_confirmation) {
      nextErrors.password = true;
      nextErrors.password_confirmation = true;
      hasError = true;
    }
    if (registerData.password.length < 6) {
      nextErrors.password = true;
      hasError = true;
    }
    if (!registerData.password_confirmation) {
      nextErrors.password_confirmation = true;
      hasError = true;
    }
    if (!registerData.role) {
      nextErrors.role = true;
      hasError = true;
    }
    // Business type is required when registering as agency
    if (registerData.role === "agency" && !registerData.business_type?.trim()) {
      nextErrors.business_type = true;
      hasError = true;
    }
    if (!termsAccepted) {
      nextErrors.terms = true;
      hasError = true;
    }

    if (hasError) {
      setRegisterErrors(nextErrors);

      // Scroll/focus first invalid field
      const fieldOrder = [
        "username",
        "first_name",
        "last_name",
        "license_number",
        "password",
        "password_confirmation",
        "role",
        "business_type",
        "terms",
      ];
      const fieldRefs = {
        username: usernameRef,
        first_name: firstNameRef,
        last_name: lastNameRef,
        license_number: licenseNumberRef,
        password: passwordRef,
        password_confirmation: passwordConfirmRef,
        role: roleRef,
        business_type: businessTypeRef,
        terms: termsRef,
      };

      const firstInvalidKey = fieldOrder.find((key) => nextErrors[key]);
      if (firstInvalidKey) {
        const ref = fieldRefs[firstInvalidKey];
        const el = ref?.current;
        if (el) {
          if (typeof el.focus === "function") {
            el.focus();
          }
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }

      toast.error("Please fill in the required fields highlighted in red.");
      return;
    }

    const fullPhone = `${getDialCode(regCountryIso2)}${regPhone.replace(/^0+/, "")}`;

    try {
      setLoading(true);
      // Remove + sign from phone number for API (as per API documentation)
      const cleanPhone = fullPhone.replace(/^\+/, '');
      
      const payload = {
        phone_number: cleanPhone,
        otp_code: otpCode,
        ...registerData,
        ...((registerData.role === "agency" || registerData.role === "agnecy") && { business_type: registerData.business_type }),
      };

      const res = await api.post("/auth/register", payload);

      localStorage.setItem("authToken", res.data.token);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      toast.success("Registration successful! Please complete your profile.");

      navigate("/Complete-Profile");
    } catch (err) {
      if (err.response?.data?.errors) {
        Object.keys(err.response.data.errors).forEach((key) => {
          err.response.data.errors[key].forEach((error) => toast.error(error));
        });
      } else {
        toast.error(err.response?.data?.message || "Registration failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  // =============================
  // FORGOT PASSWORD STATE
  // =============================
  const [forgotPhone, setForgotPhone] = useState("");
  const [forgotCountryIso2, setForgotCountryIso2] = useState("LB");
  const [forgotOtpSent, setForgotOtpSent] = useState(false);
  const [forgotOtpCode, setForgotOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [forgotCanResend, setForgotCanResend] = useState(false);
  const [forgotResendTimer, setForgotResendTimer] = useState(0);

  useEffect(() => {
    let interval;
    if (forgotResendTimer > 0) {
      interval = setInterval(() => {
        setForgotResendTimer((prev) => {
          if (prev <= 1) {
            setForgotCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [forgotResendTimer]);

  const resetForgotPasswordFlow = () => {
    setShowForgotPassword(false);
    setForgotPhone("");
    setForgotOtpSent(false);
    setForgotOtpCode("");
    setNewPassword("");
    setConfirmNewPassword("");
    setForgotCanResend(false);
    setForgotResendTimer(0);
  };

  const changeForgotNumber = () => {
    setForgotPhone("");
    setForgotOtpSent(false);
    setForgotOtpCode("");
    setNewPassword("");
    setConfirmNewPassword("");
    setForgotCanResend(false);
    setForgotResendTimer(0);
  };

  const handleSendForgotOtp = async () => {
    if (OTP_PAUSED) {
      toast.info(
        "Web password reset via OTP is temporarily disabled. Please use our mobile app at https://rento-lb.com/mobile-app."
      );
      return;
    }
    if (!forgotPhone) return toast.error("Please enter your phone number.");
    const fullPhone = `${getDialCode(forgotCountryIso2)}${forgotPhone.replace(/^0+/, "")}`;
    if (!/^\+\d{8,15}$/.test(fullPhone)) {
      return toast.error("Please enter a valid phone number with country code.");
    }

    try {
      setLoading(true);
      const response = await sendForgotPasswordOtp(fullPhone);

      if (response.message) toast.success(response.message);
      if (response.warning) toast.warning(response.warning);

      setForgotOtpSent(true);
      setForgotCanResend(false);
      setForgotResendTimer(60);
    } catch (err) {
      if (err.response?.status === 429) {
        toast.error("Too many requests. Please try again in a minute.");
      } else if (err.response?.data?.error) {
        toast.error(err.response.data.error);
      } else if (err.response?.data?.errors) {
        const errors = err.response.data.errors;
        Object.keys(errors).forEach((key) => {
          errors[key].forEach((error) => toast.error(error));
        });
      } else {
        toast.error(err.response?.data?.message || "Failed to send OTP.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendForgotOtp = async () => {
    if (!forgotCanResend) return;
    await handleSendForgotOtp();
  };

  const handleResetPassword = async () => {
    if (!forgotOtpCode) return toast.error("Please enter the OTP code.");
    if (forgotOtpCode.length !== 6) return toast.error("OTP code must be 6 digits.");
    if (!newPassword || !confirmNewPassword) {
      return toast.error("Please enter your new password.");
    }
    if (newPassword !== confirmNewPassword) {
      return toast.error("Passwords do not match!");
    }
    if (newPassword.length < 6) {
      return toast.error("Password must be at least 6 characters long.");
    }
    const fullPhone = `${getDialCode(forgotCountryIso2)}${forgotPhone.replace(/^0+/, "")}`;
    // Same format as forgot-password: phone with + (backend normalizes)
    const phoneForApi = fullPhone.trim().startsWith("+") ? fullPhone : `+${fullPhone}`;

    try {
      setLoading(true);
      const res = await api.post("/auth/reset-password", {
        phone_number: phoneForApi,
        otp_code: forgotOtpCode,
        new_password: newPassword,
        new_password_confirmation: confirmNewPassword,
      });
      toast.success(res.data?.message || "Password reset successfully! You can now login.");
      resetForgotPasswordFlow();
      setActiveTab("login");
    } catch (err) {
      if (err.response?.data?.error) {
        toast.error(err.response.data.error);
      } else if (err.response?.data?.errors) {
        const errors = err.response.data.errors;
        Object.keys(errors).forEach((key) => {
          errors[key].forEach((error) => toast.error(error));
        });
      } else {
        toast.error(err.response?.data?.message || "Failed to reset password.");
      }
    } finally {
      setLoading(false);
    }
  };

  // =============================
  // FORGOT PASSWORD VIEW
  // =============================
  if (showForgotPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-br from-gray-50 via-white to-[#8EDC81]/10 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 relative overflow-hidden">
        {/* Animated Background Orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#1e5f7a]/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#00A19C]/10 rounded-full blur-3xl animate-pulse animation-delay-700" />
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-[#8EDC81]/10 rounded-full blur-3xl animate-pulse animation-delay-1400" />
        </div>

        <div className="w-full max-w-md relative z-10 animate-fade-in-up">
          <Button
            variant="ghost"
            onClick={resetForgotPasswordFlow}
            className="mb-6 hover:bg-[#00A19C]/10 transition-all hover:scale-105"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Login
          </Button>

          <div className="flex flex-col items-center mb-8 animate-fade-in">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#1e5f7a] via-[#00A19C] to-[#8EDC81] flex items-center justify-center shadow-xl shadow-[#00A19C]/30 mb-4 animate-float">
              <Car className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-[#1e5f7a] via-[#00A19C] to-[#8EDC81] bg-clip-text text-transparent">
              Rento LB
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2 font-medium">Reset Your Password</p>
          </div>

          <Card className="border-2 border-gray-200 dark:border-gray-700 hover:border-[#00A19C] transition-all duration-500 hover:shadow-2xl hover:shadow-[#00A19C]/20 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Reset Password</CardTitle>
              <CardDescription>Enter your phone number to receive an OTP</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Phone Number</Label>
                  <PhoneRow
                    countries={countries}
                    iso2={forgotCountryIso2}
                    setIso2={setForgotCountryIso2}
                    phone={forgotPhone}
                    setPhone={setForgotPhone}
                    disabledPhone={false}
                  />
                  {forgotOtpSent && (
                    <Button 
                      type="button" 
                      variant="link" 
                      size="sm" 
                      onClick={changeForgotNumber} 
                      className="px-0 text-[#00A19C] hover:text-[#8EDC81] transition-colors"
                    >
                      Change number
                    </Button>
                  )}
                </div>

                {forgotOtpSent && (
                  <>
                    <div className="space-y-2 animate-fade-in-up">
                      <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">OTP Code</Label>
                      <Input
                        type="text"
                        inputMode="numeric"
                        value={forgotOtpCode}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, ''); // Only digits
                          if (value.length <= 6) setForgotOtpCode(value);
                        }}
                        placeholder="Enter 6-digit OTP"
                        maxLength={6}
                        className="border-2 border-gray-300 dark:border-gray-600 focus:border-[#00A19C] focus:ring-2 focus:ring-[#00A19C]/20 transition-all"
                      />
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Check your phone</p>
                        {forgotResendTimer > 0 ? (
                          <p className="text-xs text-[#00A19C] font-semibold">Resend in {forgotResendTimer}s</p>
                        ) : (
                          <Button
                            type="button"
                            variant="link"
                            size="sm"
                            onClick={handleResendForgotOtp}
                            disabled={!forgotCanResend || loading}
                            className="h-auto p-0 text-xs text-[#00A19C] hover:text-[#8EDC81] transition-colors"
                          >
                            <RefreshCw className="w-3 h-3 mr-1" />
                            Resend OTP
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2 animate-fade-in-up animation-delay-200">
                      <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">New Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="pl-10 border-2 border-gray-300 dark:border-gray-600 focus:border-[#00A19C] focus:ring-2 focus:ring-[#00A19C]/20 transition-all"
                          minLength={6}
                          placeholder="At least 6 characters"
                        />
                      </div>
                    </div>

                    <div className="space-y-2 animate-fade-in-up animation-delay-300">
                      <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Confirm New Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          type="password"
                          value={confirmNewPassword}
                          onChange={(e) => setConfirmNewPassword(e.target.value)}
                          className="pl-10 border-2 border-gray-300 dark:border-gray-600 focus:border-[#00A19C] focus:ring-2 focus:ring-[#00A19C]/20 transition-all"
                          placeholder="Re-enter password"
                        />
                      </div>
                    </div>
                  </>
                )}

                {!forgotOtpSent ? (
                  <Button
                    onClick={handleSendForgotOtp}
                    className="w-full bg-gradient-to-r from-[#1e5f7a] via-[#00A19C] to-[#8EDC81] hover:from-[#184a5e] hover:via-[#008c88] hover:to-[#7bc876] text-white font-bold py-6 rounded-xl shadow-lg shadow-[#00A19C]/30 hover:shadow-xl hover:shadow-[#00A19C]/40 transition-all duration-300 hover:scale-105"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Sending...
                      </span>
                    ) : (
                      "Send OTP"
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={handleResetPassword}
                    className="w-full bg-gradient-to-r from-[#1e5f7a] via-[#00A19C] to-[#8EDC81] hover:from-[#184a5e] hover:via-[#008c88] hover:to-[#7bc876] text-white font-bold py-6 rounded-xl shadow-lg shadow-[#00A19C]/30 hover:shadow-xl hover:shadow-[#00A19C]/40 transition-all duration-300 hover:scale-105"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Resetting...
                      </span>
                    ) : (
                      "Reset Password"
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // =============================
  // MAIN AUTH VIEW
  // =============================
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-br from-gray-50 via-white to-[#8EDC81]/10 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 relative overflow-hidden">
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#1e5f7a]/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#00A19C]/10 rounded-full blur-3xl animate-pulse animation-delay-700" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-[#8EDC81]/10 rounded-full blur-3xl animate-pulse animation-delay-1400" />
        
        {/* Floating Particles */}
        <div className="absolute top-[10%] left-[15%] w-3 h-3 bg-[#00A19C] rounded-full animate-float animation-delay-500 opacity-20" />
        <div className="absolute top-[60%] left-[80%] w-4 h-4 bg-[#8EDC81] rounded-full animate-float animation-delay-1000 opacity-20" />
        <div className="absolute top-[80%] left-[20%] w-2 h-2 bg-[#1e5f7a] rounded-full animate-float animation-delay-1500 opacity-20" />
        <div className="absolute top-[30%] left-[70%] w-3 h-3 bg-[#00A19C] rounded-full animate-float animation-delay-2000 opacity-20" />
      </div>

      <div className="w-full max-w-md relative z-10 animate-fade-in-up">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6 hover:bg-[#00A19C]/10 transition-all hover:scale-105 group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Button>

        <div className="flex flex-col items-center mb-8 animate-fade-in">
          <div className="w-24 h-24 rounded-2xl flex items-center justify-center mb-4 animate-float hover:scale-110 transition-transform duration-300 cursor-pointer shadow-md shadow-gray-400/20">
            <img
              src="/rentologo.png"
              alt="Rento LB Logo"
              className="w-24 h-24 object-contain"
            />
          </div>

          <h1 className="text-4xl font-black bg-gradient-to-r from-[#1e5f7a] via-[#00A19C] to-[#8EDC81] bg-clip-text text-transparent mb-2">
            Rento LB
          </h1>
          <p className="text-gray-600 dark:text-gray-400 font-medium flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#00A19C]" />
            Lebanon's Premier Car Rental
            <Sparkles className="w-4 h-4 text-[#8EDC81]" />
          </p>
        </div>

        <Card className="border-2 border-gray-200 dark:border-gray-700 hover:border-[#00A19C] transition-all duration-500 hover:shadow-2xl hover:shadow-[#00A19C]/20 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-black text-gray-900 dark:text-white">Welcome Back</CardTitle>
            <CardDescription className="text-base">
              Login or register to access your account
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Tabs
              value={activeTab}
              onValueChange={(val) => {
                setActiveTab(val);
                if (val === "register") resetRegistrationFlow();
              }}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-100 dark:bg-gray-700 p-1 rounded-xl">
                <TabsTrigger 
                  value="login" 
                  className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1e5f7a] data-[state=active]:via-[#00A19C] data-[state=active]:to-[#8EDC81] data-[state=active]:text-white font-semibold transition-all"
                >
                  Login
                </TabsTrigger>
                <TabsTrigger 
                  value="register"
                  className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1e5f7a] data-[state=active]:via-[#00A19C] data-[state=active]:to-[#8EDC81] data-[state=active]:text-white font-semibold transition-all"
                >
                  Register
                </TabsTrigger>
              </TabsList>

              {/* ========== LOGIN TAB ========== */}
              <TabsContent value="login" className="animate-fade-in">
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-[#00A19C]" />
                      Phone Number
                    </Label>
                    <PhoneRow
                      countries={countries}
                      iso2={loginCountryIso2}
                      setIso2={setLoginCountryIso2}
                      phone={loginPhone}
                      setPhone={setLoginPhone}
                      disabledPhone={false}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <Lock className="w-4 h-4 text-[#00A19C]" />
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        type="password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="pl-10 border-2 border-gray-300 dark:border-gray-600 focus:border-[#00A19C] focus:ring-2 focus:ring-[#00A19C]/20 transition-all"
                        placeholder="Enter your password"
                        onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                      />
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="link"
                    className="w-full text-sm p-0 h-auto text-[#00A19C] hover:text-[#8EDC81] font-semibold transition-colors"
                    onClick={() => setShowForgotPassword(true)}
                  >
                    Forgot Password?
                  </Button>

                  <Button
                    onClick={handleLogin}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-[#1e5f7a] via-[#00A19C] to-[#8EDC81] hover:from-[#184a5e] hover:via-[#008c88] hover:to-[#7bc876] text-white font-bold py-6 rounded-xl shadow-lg shadow-[#00A19C]/30 hover:shadow-xl hover:shadow-[#00A19C]/40 transition-all duration-300 hover:scale-105 group"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        Logging in...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        Login
                        <ArrowLeft className="w-5 h-5 rotate-180 group-hover:translate-x-1 transition-transform" />
                      </span>
                    )}
                  </Button>
                </div>
              </TabsContent>

              {/* ========== REGISTER TAB ========== */}
              <TabsContent value="register" className="animate-fade-in">
                {!otpVerified ? (
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <Phone className="w-4 h-4 text-[#00A19C]" />
                        Phone Number
                      </Label>
                      <PhoneRow
                        countries={countries}
                        iso2={regCountryIso2}
                        setIso2={setRegCountryIso2}
                        phone={regPhone}
                        setPhone={setRegPhone}
                        disabledPhone={otpSent}
                      />
                    </div>

                    {otpSent && (
                      <div className="space-y-2 animate-fade-in-up">
                        <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">OTP Code</Label>
                        <Input
                          type="text"
                          inputMode="numeric"
                          value={otpCode}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, ''); // Only digits
                            if (value.length <= 6) setOtpCode(value);
                          }}
                          placeholder="Enter 6-digit OTP"
                          maxLength={6}
                          className="border-2 border-gray-300 dark:border-gray-600 focus:border-[#00A19C] focus:ring-2 focus:ring-[#00A19C]/20 transition-all text-center text-2xl font-bold tracking-widest"
                        />
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-xs text-gray-500 dark:text-gray-400">Check your phone</p>
                          {resendTimer > 0 ? (
                            <p className="text-xs text-[#00A19C] font-semibold">
                              Resend in {resendTimer}s
                            </p>
                          ) : (
                            <Button
                              type="button"
                              variant="link"
                              size="sm"
                              onClick={handleResendOtp}
                              disabled={!canResend || loading}
                              className="h-auto p-0 text-xs text-[#00A19C] hover:text-[#8EDC81] transition-colors"
                            >
                              <RefreshCw className="w-3 h-3 mr-1" />
                              Resend OTP
                            </Button>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      {!otpSent ? (
                        <Button
                          onClick={handleSendOtp}
                          className="w-full bg-gradient-to-r from-[#1e5f7a] via-[#00A19C] to-[#8EDC81] hover:from-[#184a5e] hover:via-[#008c88] hover:to-[#7bc876] text-white font-bold py-6 rounded-xl shadow-lg shadow-[#00A19C]/30 hover:shadow-xl hover:shadow-[#00A19C]/40 transition-all duration-300 hover:scale-105"
                          disabled={loading}
                        >
                          {loading ? (
                            <span className="flex items-center gap-2">
                              <RefreshCw className="w-5 h-5 animate-spin" />
                              Sending...
                            </span>
                          ) : (
                            "Send OTP"
                          )}
                        </Button>
                      ) : (
                        <>
                          <Button
                            variant="outline"
                            onClick={changeRegisterNumber}
                            className="w-1/3 border-2 border-gray-300 hover:border-[#00A19C] hover:bg-[#00A19C]/10 transition-all"
                            disabled={loading}
                          >
                            Change
                          </Button>
                          <Button
                            onClick={handleVerifyOtp}
                            className="w-2/3 bg-gradient-to-r from-[#00A19C] to-[#8EDC81] hover:from-[#008c88] hover:to-[#7bc876] text-white font-bold py-6 rounded-xl shadow-lg shadow-[#00A19C]/30 hover:shadow-xl hover:shadow-[#00A19C]/40 transition-all duration-300 hover:scale-105"
                            disabled={loading}
                          >
                            {loading ? (
                              <span className="flex items-center gap-2">
                                <RefreshCw className="w-5 h-5 animate-spin" />
                                Verifying...
                              </span>
                            ) : (
                              "Verify OTP"
                            )}
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-5 animate-fade-in">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <User className="w-4 h-4 text-[#00A19C]" />
                        Username
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          type="text"
                          ref={usernameRef}
                          value={registerData.username}
                          onChange={(e) =>
                            {
                              setRegisterData({ ...registerData, username: e.target.value });
                              setRegisterErrors((prev) => ({ ...prev, username: false }));
                            }
                          }
                          className={`pl-10 border-2 ${
                            registerErrors.username ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                          } focus:border-[#00A19C] focus:ring-2 focus:ring-[#00A19C]/20 transition-all`}
                          placeholder="Choose a username"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">First Name</Label>
                        <Input
                          type="text"
                          ref={firstNameRef}
                          value={registerData.first_name}
                          onChange={(e) =>
                            {
                              setRegisterData({ ...registerData, first_name: e.target.value });
                              setRegisterErrors((prev) => ({ ...prev, first_name: false }));
                            }
                          }
                          className={`border-2 ${
                            registerErrors.first_name ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                          } focus:border-[#00A19C] focus:ring-2 focus:ring-[#00A19C]/20 transition-all`}
                          placeholder="First name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Last Name</Label>
                        <Input
                          type="text"
                          ref={lastNameRef}
                          value={registerData.last_name}
                          onChange={(e) =>
                            {
                              setRegisterData({ ...registerData, last_name: e.target.value });
                              setRegisterErrors((prev) => ({ ...prev, last_name: false }));
                            }
                          }
                          className={`border-2 ${
                            registerErrors.last_name ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                          } focus:border-[#00A19C] focus:ring-2 focus:ring-[#00A19C]/20 transition-all`}
                          placeholder="Last name"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Driver's License Number</Label>
                      <Input
                        type="text"
                        ref={licenseNumberRef}
                        value={registerData.license_number}
                        onChange={(e) =>
                          {
                            setRegisterData({ ...registerData, license_number: e.target.value });
                            setRegisterErrors((prev) => ({ ...prev, license_number: false }));
                          }
                        }
                        className={`border-2 ${
                          registerErrors.license_number ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                        } focus:border-[#00A19C] focus:ring-2 focus:ring-[#00A19C]/20 transition-all`}
                        placeholder="License number"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <Lock className="w-4 h-4 text-[#00A19C]" />
                        Password
                      </Label>
                      <Input
                        type="password"
                        ref={passwordRef}
                        value={registerData.password}
                        onChange={(e) =>
                          {
                            setRegisterData({ ...registerData, password: e.target.value });
                            setRegisterErrors((prev) => ({ ...prev, password: false }));
                          }
                        }
                        minLength={6}
                        className={`border-2 ${
                          registerErrors.password ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                        } focus:border-[#00A19C] focus:ring-2 focus:ring-[#00A19C]/20 transition-all`}
                        placeholder="At least 6 characters"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Minimum 6 characters</p>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Confirm Password</Label>
                      <Input
                        type="password"
                        ref={passwordConfirmRef}
                        value={registerData.password_confirmation}
                        onChange={(e) =>
                          {
                            setRegisterData({
                              ...registerData,
                              password_confirmation: e.target.value,
                            });
                            setRegisterErrors((prev) => ({ ...prev, password_confirmation: false }));
                          }
                        }
                        className={`border-2 ${
                          registerErrors.password_confirmation
                            ? "border-red-500"
                            : "border-gray-300 dark:border-gray-600"
                        } focus:border-[#00A19C] focus:ring-2 focus:ring-[#00A19C]/20 transition-all`}
                        placeholder="Re-enter password"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Role</Label>
                      <Select
                        value={registerData.role}
                        onValueChange={(value) => {
                          setRegisterData({ ...registerData, role: value });
                          setRegisterErrors((prev) => ({
                            ...prev,
                            role: false,
                            license_number: false,
                            business_type: false,
                          }));
                        }}
                      >
                        <SelectTrigger
                          ref={roleRef}
                          className={`border-2 ${
                            registerErrors.role ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                          } focus:border-[#00A19C] focus:ring-2 focus:ring-[#00A19C]/20 transition-all`}
                        >
                          <SelectValue placeholder="Select Role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="client">Client</SelectItem>
                          <SelectItem value="agency">Agency</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {registerData.role === "agency" && (
                      <div className="space-y-2 animate-fade-in-up">
                        <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Business Type <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={registerData.business_type}
                          onValueChange={(value) => {
                            setRegisterData({ ...registerData, business_type: value });
                            setRegisterErrors((prev) => ({ ...prev, business_type: false }));
                          }}
                        >
                          <SelectTrigger
                            ref={businessTypeRef}
                            className={`border-2 ${
                              registerErrors.business_type ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                            } focus:border-[#00A19C] focus:ring-2 focus:ring-[#00A19C]/20 transition-all`}
                          >
                            <SelectValue placeholder="Select Business Type" />
                          </SelectTrigger>
                          <SelectContent>
                            {/* Must match backend: rental, private, company, marina */}
                            <SelectItem value="rental">Rental</SelectItem>
                            <SelectItem value="private">Private</SelectItem>
                            <SelectItem value="company">Company</SelectItem>
                            <SelectItem value="marina">Marina</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        id="terms-accept"
                        ref={termsRef}
                        checked={termsAccepted}
                        onChange={(e) => {
                          setTermsAccepted(e.target.checked);
                          setRegisterErrors((prev) => ({ ...prev, terms: false }));
                        }}
                        className={`mt-1 h-4 w-4 rounded ${
                          registerErrors.terms ? "border-red-500" : "border-gray-300"
                        } text-[#00A19C] focus:ring-[#00A19C]`}
                      />
                      <Label htmlFor="terms-accept" className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer leading-tight">
                        I accept the{" "}
                        <a href="/Terms-and-Conditions" target="_blank" rel="noopener noreferrer" className="text-[#00A19C] hover:underline font-medium">
                          Terms of Use
                        </a>{" "}
                        and{" "}
                        <a href="/Privacy-Policy" target="_blank" rel="noopener noreferrer" className="text-[#00A19C] hover:underline font-medium">
                          Privacy Policy
                        </a>
                        <span className="text-red-500"> *</span>
                      </Label>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={() => setOtpVerified(false)}
                        className="w-1/3 border-2 border-gray-300 hover:border-[#00A19C] hover:bg-[#00A19C]/10 transition-all"
                        disabled={loading}
                      >
                        Back
                      </Button>
                      <Button
                        onClick={handleRegister}
                        className="w-2/3 bg-gradient-to-r from-[#00A19C] to-[#8EDC81] hover:from-[#008c88] hover:to-[#7bc876] text-white font-bold py-6 rounded-xl shadow-lg shadow-[#00A19C]/30 hover:shadow-xl hover:shadow-[#00A19C]/40 transition-all duration-300 hover:scale-105"
                        disabled={loading}
                      >
                        {loading ? (
                          <span className="flex items-center gap-2">
                            <RefreshCw className="w-5 h-5 animate-spin" />
                            Registering...
                          </span>
                        ) : (
                          "Complete Registration"
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>

            <div className="mt-6 text-center border-t border-gray-200 dark:border-gray-700 pt-6">
              <button
                onClick={() => navigate("/")}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-[#00A19C] dark:hover:text-[#8EDC81] transition-colors font-medium flex items-center gap-2 mx-auto group"
              >
                <Sparkles className="w-4 h-4 group-hover:animate-pulse" />
                Continue as Guest
                <Sparkles className="w-4 h-4 group-hover:animate-pulse" />
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Decorative Footer */}
        <div className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
          <p>© 2024 Rento LB. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}