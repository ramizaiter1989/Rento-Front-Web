import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Phone, Lock, User, RefreshCw, ArrowLeft, Car } from "lucide-react";
import { toast } from "sonner";
import countriesData from "@/lib/countries.json";

// ===================
// PhoneRow Component
// ===================
const onlyDigits = (v) => v.replace(/\D/g, "");

const PhoneRow = ({ countries, iso2, setIso2, phone, setPhone, disabledPhone }) => (
  <div className="flex gap-2 w-full">
    <select
      value={iso2}
      onChange={(e) => setIso2(e.target.value)}
      className="w-[140px] sm:w-[190px] shrink-0 bg-white text-black p-2 border rounded"
    >
      {countries.map((c) => (
        <option key={c.iso2} value={c.iso2}>
          {c.name} ({c.dialCode})
        </option>
      ))}
    </select>

    <input
      type="tel"
      inputMode="numeric"
      value={phone}
      onChange={(e) => setPhone(onlyDigits(e.target.value))}
      placeholder="70123456"
      className="flex-1 pl-2 border rounded text-black"
      disabled={disabledPhone}
    />
  </div>
);

// ===================
// AuthPage Component
// ===================
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
    if (!loginPhone || !loginPassword) return toast.error("Please fill all fields");
    if (!/^\+\d{8,15}$/.test(fullPhone)) return toast.error("Invalid phone number.");

    try {
      setLoading(true);
      const res = await api.post("/auth/login", { phone_number: fullPhone, password: loginPassword });
      localStorage.setItem("authToken", res.data.token);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      toast.success("Login successful!");
      if (!res.data.user.profile_complete) return navigate("/Complete-Profile");
      if (["agency", "agent"].includes(res.data.user.role)) navigate("/Dashboard");
      else navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  // =============================
  // REGISTRATION STATE
  // =============================
  const [regPhone, setRegPhone] = useState("");
  const [regCountryIso2, setRegCountryIso2] = useState("LB");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [registerData, setRegisterData] = useState({ username: "", password: "", password_confirmation: "" });

  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => setResendTimer((prev) => (prev <= 1 ? (setCanResend(true), 0) : prev - 1)), 1000);
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
    setRegisterData({ username: "", password: "", password_confirmation: "" });
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
    if (!regPhone) return toast.error("Please enter a phone number.");
    const fullPhone = `${getDialCode(regCountryIso2)}${regPhone.replace(/^0+/, "")}`;
    if (!/^\+\d{8,15}$/.test(fullPhone)) return toast.error("Invalid phone number.");

    try {
      setLoading(true);
      await api.post("/auth/send-otp", { phone_number: fullPhone });
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

  const handleResendOtp = async () => canResend && handleSendOtp();

  const handleVerifyOtp = async () => {
    if (!otpCode) return toast.error("Please enter OTP code.");
    const fullPhone = `${getDialCode(regCountryIso2)}${regPhone.replace(/^0+/, "")}`;

    try {
      setLoading(true);
      await api.post("/auth/verify-otp", { phone_number: fullPhone, otp_code: otpCode });
      toast.success("OTP verified! Complete registration.");
      setOtpVerified(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (registerData.password !== registerData.password_confirmation) return toast.error("Passwords do not match!");
    if (registerData.password.length < 6) return toast.error("Password must be at least 6 characters.");
    const fullPhone = `${getDialCode(regCountryIso2)}${regPhone.replace(/^0+/, "")}`;

    try {
      setLoading(true);
      const res = await api.post("/auth/register", {
        phone_number: fullPhone,
        otp_code: otpCode,
        username: registerData.username,
        password: registerData.password,
        password_confirmation: registerData.password_confirmation,
      });
      localStorage.setItem("authToken", res.data.token);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      toast.success("Registration successful! Complete your profile.");
      navigate("/Complete-Profile");
    } catch (err) {
      if (err.response?.data?.errors) {
        Object.keys(err.response.data.errors).forEach((key) =>
          err.response.data.errors[key].forEach((error) => toast.error(error))
        );
      } else toast.error(err.response?.data?.message || "Registration failed.");
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
      interval = setInterval(() => setForgotResendTimer((prev) => (prev <= 1 ? (setForgotCanResend(true), 0) : prev - 1)), 1000);
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
    if (!forgotPhone) return toast.error("Please enter your phone number.");
    const fullPhone = `${getDialCode(forgotCountryIso2)}${forgotPhone.replace(/^0+/, "")}`;
    if (!/^\+\d{8,15}$/.test(fullPhone)) return toast.error("Invalid phone number.");

    try {
      setLoading(true);
      await api.post("/auth/forgot-password", { phone_number: fullPhone });
      toast.success("OTP sent!");
      setForgotOtpSent(true);
      setForgotCanResend(false);
      setForgotResendTimer(60);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendForgotOtp = async () => forgotCanResend && handleSendForgotOtp();

  const handleResetPassword = async () => {
    if (!forgotOtpCode) return toast.error("Please enter OTP code.");
    if (!newPassword || !confirmNewPassword) return toast.error("Enter new password.");
    if (newPassword !== confirmNewPassword) return toast.error("Passwords do not match.");
    if (newPassword.length < 6) return toast.error("Password must be at least 6 characters.");

    const fullPhone = `${getDialCode(forgotCountryIso2)}${forgotPhone.replace(/^0+/, "")}`;

    try {
      setLoading(true);
      await api.post("/auth/reset-password", {
        phone_number: fullPhone,
        otp_code: forgotOtpCode,
        new_password: newPassword,
        new_password_confirmation: confirmNewPassword,
      });
      toast.success("Password reset successfully!");
      resetForgotPasswordFlow();
      setActiveTab("login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  // =============================
  // RENDER
  // =============================
  if (showForgotPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-br from-background via-primary/5 to-secondary/5">
        <div className="w-full max-w-md">
          <Button variant="ghost" onClick={resetForgotPasswordFlow} className="mb-6 hover:bg-muted">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Login
          </Button>

          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg mb-4">
              <Car className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold gradient-text">Rento LB</h1>
            <p className="text-muted-foreground mt-2">Reset Your Password</p>
          </div>

          <Card className="hover-glow shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl">Reset Password</CardTitle>
              <CardDescription>Enter your phone number to receive an OTP</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div>
                <Label>Phone Number</Label>
                <PhoneRow
                  countries={countries}
                  iso2={forgotCountryIso2}
                  setIso2={setForgotCountryIso2}
                  phone={forgotPhone}
                  setPhone={setForgotPhone}
                  disabledPhone={false}
                />

                {forgotOtpSent && (
                  <Button type="button" variant="link" size="sm" onClick={changeForgotNumber} className="px-0">
                    Change number
                  </Button>
                )}
              </div>

              {forgotOtpSent ? (
                <>
                  <div>
                    <Label>OTP Code</Label>
                    <Input
                      type="text"
                      value={forgotOtpCode}
                      onChange={(e) => setForgotOtpCode(e.target.value)}
                      placeholder="Enter 6-digit OTP"
                      maxLength={6}
                    />
                    <div className="flex items-center justify-between mt-2">
                      {forgotResendTimer > 0 ? (
                        <p className="text-xs text-muted-foreground">Resend in {forgotResendTimer}s</p>
                      ) : (
                        <Button
                          type="button"
                          variant="link"
                          size="sm"
                          onClick={handleResendForgotOtp}
                          disabled={!forgotCanResend || loading}
                          className="h-auto p-0 text-xs"
                        >
                          <RefreshCw className="w-3 h-3 mr-1" /> Resend OTP
                        </Button>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label>New Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="pl-10" />
                    </div>
                  </div>

                  <div>
                    <Label>Confirm New Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="password"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <Button onClick={handleResetPassword} className="w-full bg-gradient-to-r from-primary to-secondary">
                    {loading ? "Resetting..." : "Reset Password"}
                  </Button>
                </>
              ) : (
                <Button onClick={handleSendForgotOtp} className="w-full bg-gradient-to-r from-primary to-secondary">
                  {loading ? "Sending..." : "Send OTP"}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-br from-background via-primary/5 to-secondary/5">
      <div className="w-full max-w-md">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-6 hover:bg-muted">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </Button>

        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-transparent flex items-center justify-center shadow-lg mb-4">
            <img src="/rentologo.png" alt="Rento Logo" className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold gradient-text">Rento LB</h1>
          <p className="text-muted-foreground mt-2">Lebanon's Premier Car Rental</p>
        </div>

        <Card className="hover-glow shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Welcome</CardTitle>
            <CardDescription className="text-center">Login or register to continue</CardDescription>
          </CardHeader>

          <CardContent>
            <Tabs
              value={activeTab}
              onValueChange={(val) => {
                setActiveTab(val);
                if (val === "register") resetRegistrationFlow();
              }}
            >
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>

              {/* ===== LOGIN TAB ===== */}
              <TabsContent value="login">
                <div className="space-y-4 text-black">
                  <div>
                    <Label>Phone Number</Label>
                    <PhoneRow
                      countries={countries}
                      iso2={loginCountryIso2}
                      setIso2={setLoginCountryIso2}
                      phone={loginPhone}
                      setPhone={setLoginPhone}
                      disabledPhone={false}
                    />
                  </div>

                  <div>
                    <Label>Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="pl-10"
                        placeholder="Enter password"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleLogin}
                    className="w-full bg-gradient-to-r from-primary to-secondary"
                    disabled={loading}
                  >
                    {loading ? "Logging in..." : "Login"}
                  </Button>

                  <Button variant="link" size="sm" onClick={() => setShowForgotPassword(true)}>
                    Forgot Password?
                  </Button>
                </div>
              </TabsContent>

              {/* ===== REGISTER TAB ===== */}
              <TabsContent value="register">
                <div className="space-y-4 text-black">
                  {!otpSent ? (
                    <>
                      <Label>Phone Number</Label>
                      <PhoneRow
                        countries={countries}
                        iso2={regCountryIso2}
                        setIso2={setRegCountryIso2}
                        phone={regPhone}
                        setPhone={setRegPhone}
                        disabledPhone={false}
                      />
                      <Button onClick={handleSendOtp} className="w-full bg-gradient-to-r from-primary to-secondary">
                        {loading ? "Sending OTP..." : "Send OTP"}
                      </Button>
                    </>
                  ) : !otpVerified ? (
                    <>
                      <div>
                        <Label>OTP Code</Label>
                        <Input
                          type="text"
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value)}
                          placeholder="Enter OTP"
                        />
                        <div className="flex items-center justify-between mt-2">
                          {resendTimer > 0 ? (
                            <p className="text-xs text-muted-foreground">Resend in {resendTimer}s</p>
                          ) : (
                            <Button type="button" variant="link" size="sm" onClick={handleResendOtp} disabled={!canResend || loading}>
                              <RefreshCw className="w-3 h-3 mr-1" /> Resend OTP
                            </Button>
                          )}
                        </div>
                      </div>

                      <Button onClick={handleVerifyOtp} className="w-full bg-gradient-to-r from-primary to-secondary">
                        {loading ? "Verifying..." : "Verify OTP"}
                      </Button>

                      <Button variant="link" size="sm" onClick={changeRegisterNumber}>
                        Change phone number
                      </Button>
                    </>
                  ) : (
                    <>
                      <div>
                        <Label>Username</Label>
                        <Input
                          type="text"
                          value={registerData.username}
                          onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                        />
                      </div>

                      <div>
                        <Label>Password</Label>
                        <Input
                          type="password"
                          value={registerData.password}
                          onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                        />
                      </div>

                      <div>
                        <Label>Confirm Password</Label>
                        <Input
                          type="password"
                          value={registerData.password_confirmation}
                          onChange={(e) => setRegisterData({ ...registerData, password_confirmation: e.target.value })}
                        />
                      </div>

                      <Button onClick={handleRegister} className="w-full bg-gradient-to-r from-primary to-secondary">
                        {loading ? "Registering..." : "Register"}
                      </Button>
                    </>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
