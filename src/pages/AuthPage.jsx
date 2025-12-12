import React, { useState, useEffect } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Phone,
  Lock,
  User,
  RefreshCw,
  ArrowLeft,
  Car,
} from "lucide-react";
import { toast } from "sonner";

export function AuthPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("login");
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  // =============================
  // LOGIN STATE
  // =============================
  const [loginData, setLoginData] = useState({
    phone_number: "",
    password: "",
  });

  const handleLogin = async () => {
    if (!loginData.phone_number || !loginData.password) {
      return toast.error("Please fill all fields");
    }

    try {
      setLoading(true);
      const res = await api.post("/auth/login", loginData);

      localStorage.setItem("authToken", res.data.token);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      toast.success("Login successful!");

      if (!res.data.user.profile_complete) {
        navigate("/Complete-Profile");
        return;
      }

      if (res.data.user.role === "agency" || res.data.user.role === "agent") {
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
  const [phoneNumber, setPhoneNumber] = useState("");
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
    setPhoneNumber("");
    setOtpSent(false);
    setOtpCode("");
    setOtpVerified(false);
    setCanResend(false);
    setResendTimer(0);
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
  };

  const handleSendOtp = async () => {
    if (!phoneNumber) return toast.error("Please enter a phone number.");
    if (!/^\+\d{8,15}$/.test(phoneNumber)) {
      return toast.error("Please enter a valid phone number with country code.");
    }

    try {
      setLoading(true);
      await api.post("/auth/send-otp", { phone_number: phoneNumber });
      toast.success("OTP sent! Check your phone.");
      setOtpSent(true);
      setCanResend(false);
      setResendTimer(60);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send OTP.");
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

    try {
      setLoading(true);
      await api.post("/auth/verify-otp", {
        phone_number: phoneNumber,
        otp_code: otpCode,
      });
      toast.success("OTP verified! Complete your registration.");
      setOtpVerified(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (registerData.password !== registerData.password_confirmation) {
      return toast.error("Passwords do not match!");
    }
    if (registerData.password.length < 6) {
      return toast.error("Password must be at least 6 characters long.");
    }

    try {
      setLoading(true);
      const payload = {
        phone_number: phoneNumber,
        otp_code: otpCode,
        ...registerData,
        ...(registerData.role === "agency" && {
          business_type: registerData.business_type,
        }),
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

  const handleSendForgotOtp = async () => {
    if (!forgotPhone) return toast.error("Please enter your phone number.");
    if (!/^\+\d{10,15}$/.test(forgotPhone)) {
      return toast.error("Please enter a valid phone number with country code.");
    }

    try {
      setLoading(true);
      await api.post("/auth/forgot-password", { phone_number: forgotPhone });
      toast.success("OTP sent! Check your phone.");
      setForgotOtpSent(true);
      setForgotCanResend(false);
      setForgotResendTimer(60);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send OTP.");
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
    if (!newPassword || !confirmNewPassword) {
      return toast.error("Please enter your new password.");
    }
    if (newPassword !== confirmNewPassword) {
      return toast.error("Passwords do not match!");
    }
    if (newPassword.length < 6) {
      return toast.error("Password must be at least 6 characters long.");
    }

    try {
      setLoading(true);
      await api.post("/auth/reset-password", {
        phone_number: forgotPhone,
        otp_code: forgotOtpCode,
        new_password: newPassword,
        new_password_confirmation: confirmNewPassword,
      });
      toast.success("Password reset successfully! You can now login.");
      resetForgotPasswordFlow();
      setActiveTab("login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  // =============================
  // FORGOT PASSWORD VIEW
  // =============================
  if (showForgotPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-br from-black via-[#0B1120] to-[#020617] text-slate-100">
        <div className="w-full max-w-md">
          <Button
            variant="ghost"
            onClick={resetForgotPasswordFlow}
            className="mb-6 hover:bg-slate-900 text-slate-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Login
          </Button>

          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#EAB308] to-[#FACC15] flex items-center justify-center shadow-lg mb-4">
              <Car className="w-8 h-8 text-[#020617]" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#EAB308] via-[#FACC15] to-[#F97316] bg-clip-text text-transparent">
              Rento LB
            </h1>
            <p className="text-slate-400 mt-2">Reset Your Password</p>
          </div>

          <Card className="hover-glow shadow-xl bg-[#020617] border border-slate-800 text-slate-100">
            <CardHeader>
              <CardTitle className="text-2xl">Reset Password</CardTitle>
              <CardDescription className="text-slate-400">
                Enter your phone number to receive an OTP
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <Input
                      type="tel"
                      value={forgotPhone}
                      onChange={(e) => setForgotPhone(e.target.value)}
                      placeholder="+96170123456"
                      className="pl-10 bg-black/40 border-slate-700 text-slate-100"
                      disabled={forgotOtpSent}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Include country code
                  </p>
                </div>

                {forgotOtpSent && (
                  <>
                    <div>
                      <Label>OTP Code</Label>
                      <Input
                        type="text"
                        value={forgotOtpCode}
                        onChange={(e) => setForgotOtpCode(e.target.value)}
                        placeholder="Enter 6-digit OTP"
                        maxLength={6}
                        className="bg-black/40 border-slate-700 text-slate-100"
                      />
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-slate-500">
                          Check your phone
                        </p>
                        {forgotResendTimer > 0 ? (
                          <p className="text-xs text-slate-500">
                            Resend in {forgotResendTimer}s
                          </p>
                        ) : (
                          <Button
                            type="button"
                            variant="link"
                            size="sm"
                            onClick={handleResendForgotOtp}
                            disabled={!forgotCanResend || loading}
                            className="h-auto p-0 text-xs text-[#EAB308]"
                          >
                            <RefreshCw className="w-3 h-3 mr-1" />
                            Resend OTP
                          </Button>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label>New Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <Input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="pl-10 bg-black/40 border-slate-700 text-slate-100"
                          minLength={6}
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Confirm New Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <Input
                          type="password"
                          value={confirmNewPassword}
                          onChange={(e) =>
                            setConfirmNewPassword(e.target.value)
                          }
                          className="pl-10 bg-black/40 border-slate-700 text-slate-100"
                        />
                      </div>
                    </div>
                  </>
                )}

                {!forgotOtpSent ? (
                  <Button
                    onClick={handleSendForgotOtp}
                    className="w-full bg-gradient-to-r from-[#EAB308] to-[#FACC15] text-[#020617] font-semibold"
                    disabled={loading}
                  >
                    {loading ? "Sending..." : "Send OTP"}
                  </Button>
                ) : (
                  <Button
                    onClick={handleResetPassword}
                    className="w-full bg-gradient-to-r from-[#EAB308] to-[#FACC15] text-[#020617] font-semibold"
                    disabled={loading}
                  >
                    {loading ? "Resetting..." : "Reset Password"}
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
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-br from-black via-[#0B1120] to-[#020617] text-slate-100">
      <div className="w-full max-w-md">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6 hover:bg-slate-900 text-slate-200"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#EAB308] to-[#FACC15] flex items-center justify-center shadow-lg mb-4">
            <Car className="w-8 h-8 text-[#020617]" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#EAB308] via-[#FACC15] to-[#F97316] bg-clip-text text-transparent">
            Rento LB
          </h1>
          <p className="text-slate-400 mt-2">
            Lebanon&apos;s Premier Car Rental
          </p>
        </div>

        <Card className="hover-glow shadow-xl bg-[#020617] border border-slate-800 text-slate-100">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Welcome</CardTitle>
            <CardDescription className="text-center text-slate-400">
              Login or register to continue
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Tabs
              value={activeTab}
              onValueChange={(val) => {
                setActiveTab(val);
                if (val === "register") resetRegistrationFlow();
              }}
            >
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-slate-900">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>

              {/* ========== LOGIN TAB ========== */}
              <TabsContent value="login">
                <div className="space-y-4">
                  <div>
                    <Label>Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <Input
                        type="text"
                        value={loginData.phone_number}
                        onChange={(e) =>
                          setLoginData({
                            ...loginData,
                            phone_number: e.target.value,
                          })
                        }
                        placeholder="+96170123456"
                        className="pl-10 bg-black/40 border-slate-700 text-slate-100"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <Input
                        type="password"
                        value={loginData.password}
                        onChange={(e) =>
                          setLoginData({
                            ...loginData,
                            password: e.target.value,
                          })
                        }
                        className="pl-10 bg-black/40 border-slate-700 text-slate-100"
                      />
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="link"
                    className="w-full text-sm p-0 h-auto text-[#EAB308]"
                    onClick={() => setShowForgotPassword(true)}
                  >
                    Forgot Password?
                  </Button>

                  <Button
                    onClick={handleLogin}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-[#EAB308] to-[#FACC15] text-[#020617] font-semibold"
                  >
                    {loading ? "Logging in..." : "Login"}
                  </Button>
                </div>
              </TabsContent>

              {/* ========== REGISTER TAB ========== */}
              <TabsContent value="register">
                {!otpVerified ? (
                  <div className="space-y-4">
                    <div>
                      <Label>Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <Input
                          type="tel"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="+96170123456"
                          className="pl-10 bg-black/40 border-slate-700 text-slate-100"
                          disabled={otpSent}
                        />
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Include country code (e.g., +961)
                      </p>
                    </div>

                    {otpSent && (
                      <div>
                        <Label>OTP Code</Label>
                        <Input
                          type="text"
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value)}
                          placeholder="Enter 6-digit OTP"
                          maxLength={6}
                          className="bg-black/40 border-slate-700 text-slate-100"
                        />
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-xs text-slate-500">
                            Check your phone
                          </p>
                          {resendTimer > 0 ? (
                            <p className="text-xs text-slate-500">
                              Resend in {resendTimer}s
                            </p>
                          ) : (
                            <Button
                              type="button"
                              variant="link"
                              size="sm"
                              onClick={handleResendOtp}
                              disabled={!canResend || loading}
                              className="h-auto p-0 text-xs text-[#EAB308]"
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
                          className="w-full bg-gradient-to-r from-[#EAB308] to-[#FACC15] text-[#020617] font-semibold"
                          disabled={loading}
                        >
                          {loading ? "Sending..." : "Send OTP"}
                        </Button>
                      ) : (
                        <>
                          <Button
                            variant="outline"
                            onClick={resetRegistrationFlow}
                            className="w-1/3 border-slate-700 text-slate-200 hover:bg-slate-900"
                            disabled={loading}
                          >
                            Change
                          </Button>
                          <Button
                            onClick={handleVerifyOtp}
                            className="w-2/3 bg-gradient-to-r from-[#FACC15] to-[#F97316] text-[#020617] font-semibold"
                            disabled={loading}
                          >
                            {loading ? "Verifying..." : "Verify OTP"}
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label>Username</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <Input
                          type="text"
                          value={registerData.username}
                          onChange={(e) =>
                            setRegisterData({
                              ...registerData,
                              username: e.target.value,
                            })
                          }
                          className="pl-10 bg-black/40 border-slate-700 text-slate-100"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label>First Name</Label>
                        <Input
                          type="text"
                          value={registerData.first_name}
                          onChange={(e) =>
                            setRegisterData({
                              ...registerData,
                              first_name: e.target.value,
                            })
                          }
                          className="bg-black/40 border-slate-700 text-slate-100"
                        />
                      </div>
                      <div>
                        <Label>Last Name</Label>
                        <Input
                          type="text"
                          value={registerData.last_name}
                          onChange={(e) =>
                            setRegisterData({
                              ...registerData,
                              last_name: e.target.value,
                            })
                          }
                          className="bg-black/40 border-slate-700 text-slate-100"
                        />
                      </div>
                    </div>

                    <div>
                      <Label>License Number</Label>
                      <Input
                        type="text"
                        value={registerData.license_number}
                        onChange={(e) =>
                          setRegisterData({
                            ...registerData,
                            license_number: e.target.value,
                          })
                        }
                        className="bg-black/40 border-slate-700 text-slate-100"
                      />
                    </div>

                    <div>
                      <Label>Password</Label>
                      <Input
                        type="password"
                        value={registerData.password}
                        onChange={(e) =>
                          setRegisterData({
                            ...registerData,
                            password: e.target.value,
                          })
                        }
                        minLength={6}
                        className="bg-black/40 border-slate-700 text-slate-100"
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        Minimum 6 characters
                      </p>
                    </div>

                    <div>
                      <Label>Confirm Password</Label>
                      <Input
                        type="password"
                        value={registerData.password_confirmation}
                        onChange={(e) =>
                          setRegisterData({
                            ...registerData,
                            password_confirmation: e.target.value,
                          })
                        }
                        className="bg-black/40 border-slate-700 text-slate-100"
                      />
                    </div>

                    <div>
                      <Label>Role</Label>
                      <Select
                        value={registerData.role}
                        onValueChange={(value) =>
                          setRegisterData({ ...registerData, role: value })
                        }
                      >
                        <SelectTrigger className="bg-black/40 border-slate-700 text-slate-100">
                          <SelectValue placeholder="Select Role" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#020617] border-slate-700 text-slate-100">
                          <SelectItem value="client">Client</SelectItem>
                          <SelectItem value="agency">Agency</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {registerData.role === "agency" && (
                      <div>
                        <Label>Business Type</Label>
                        <Input
                          type="text"
                          value={registerData.business_type}
                          onChange={(e) =>
                            setRegisterData({
                              ...registerData,
                              business_type: e.target.value,
                            })
                          }
                          placeholder="e.g., Company, Individual"
                          className="bg-black/40 border-slate-700 text-slate-100"
                        />
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setOtpVerified(false)}
                        className="w-1/3 border-slate-700 text-slate-200 hover:bg-slate-900"
                        disabled={loading}
                      >
                        Back
                      </Button>
                      <Button
                        onClick={handleRegister}
                        className="w-2/3 bg-gradient-to-r from-[#FACC15] to-[#F97316] text-[#020617] font-semibold"
                        disabled={loading}
                      >
                        {loading ? "Registering..." : "Register"}
                      </Button>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>

            <div className="mt-6 text-center">
              <button
                onClick={() => navigate("/")}
                className="text-sm text-slate-400 hover:text-slate-200 transition-colors"
              >
                Continue as Guest
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
