import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/axios';
import { sendOtp, verifyOtp } from '@/lib/otpApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Lock, User, ArrowRight, UserPlus, Phone, RefreshCw } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import countriesData from '@/lib/countries.json';

const onlyDigits = (v) => v.replace(/\D/g, '');

const PhoneRow = ({ countries, iso2, setIso2, phone, setPhone, disabledPhone }) => (
  <div className="flex gap-2 w-full">
    <select
      value={iso2}
      onChange={(e) => setIso2(e.target.value)}
      className="w-[100px] sm:w-[120px] shrink-0 bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-[#008C95] focus:border-transparent"
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
      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-[#008C95] focus:border-transparent"
      disabled={disabledPhone}
    />
  </div>
);

const COLORS = {
  darkBlue: '#0E4C81',
  teal: '#008C95',
  limeGreen: '#8AC640'
};

export default function AdminAuthPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [regPhone, setRegPhone] = useState('');
  const [regCountryIso2, setRegCountryIso2] = useState('LB');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const [regData, setRegData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    password_confirmation: '',
    role: 'admin',
    business_type: '',
  });

  const countries = useMemo(() => {
    return countriesData
      .map((c) => ({
        name: c.name,
        iso2: c.iso2,
        dialCode: c.dialCode.startsWith('+') ? c.dialCode : `+${c.dialCode}`,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  const dialCodeByIso2 = useMemo(() => {
    const map = new Map();
    for (const c of countries) map.set(c.iso2, c.dialCode);
    return map;
  }, [countries]);

  const getDialCode = (iso2) => dialCodeByIso2.get(iso2) || '+961';

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

  const resetRegFlow = () => {
    setRegPhone('');
    setOtpSent(false);
    setOtpCode('');
    setOtpVerified(false);
    setCanResend(false);
    setResendTimer(0);
    setRegData({
      username: '',
      email: '',
      first_name: '',
      last_name: '',
      password: '',
      password_confirmation: '',
      role: 'admin',
      business_type: '',
    });
  };

  const changeRegPhone = () => {
    setOtpSent(false);
    setOtpCode('');
    setOtpVerified(false);
    setCanResend(false);
    setResendTimer(0);
    setRegPhone('');
  };

  const handleSendOtp = async () => {
    if (!regPhone) return toast.error('Please enter a phone number.');
    const fullPhone = `${getDialCode(regCountryIso2)}${regPhone.replace(/^0+/, '')}`;
    if (!/^\+\d{8,15}$/.test(fullPhone)) {
      return toast.error('Please enter a valid phone number with country code.');
    }
    try {
      setLoading(true);
      const response = await sendOtp(fullPhone);
      if (response.message) toast.success(response.message);
      if (response.warning) toast.warning(response.warning);
      setOtpSent(true);
      setCanResend(false);
      setResendTimer(60);
    } catch (err) {
      if (err.response?.data?.errors) {
        Object.values(err.response.data.errors).flat().forEach((m) => toast.error(m));
      } else {
        toast.error(err.response?.data?.message || 'Failed to send OTP.');
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
    if (!otpCode) return toast.error('Please enter the OTP code.');
    if (otpCode.length !== 6) return toast.error('OTP code must be 6 digits.');
    const fullPhone = `${getDialCode(regCountryIso2)}${regPhone.replace(/^0+/, '')}`;
    try {
      setLoading(true);
      const response = await verifyOtp(fullPhone, otpCode);
      if (response.message) toast.success(response.message);
      else toast.success('OTP verified! Complete your registration.');
      setOtpVerified(true);
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.error || 'Invalid or expired OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      return toast.error('Please fill all fields');
    }

    try {
      setLoading(true);
      // Try email first, then phone_number if email doesn't work
      let loginPayload = {
        password: password,
      };
      
      // Check if input is email or phone
      if (email.includes('@')) {
        loginPayload.email = email;
      } else {
        // Assume it's a phone number
        loginPayload.phone_number = email;
      }

      const res = await api.post('/auth/login', loginPayload);

      const user = res.data.user;
      
      // Check if user is admin
      if (user.role !== 'admin') {
        toast.error('Access denied. Admin privileges required.');
        localStorage.removeItem('authToken');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return;
      }

      localStorage.setItem('authToken', res.data.token);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(user));

      toast.success('Login successful!');
      navigate('/admin');
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Login failed.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const { username, email, first_name, last_name, password, password_confirmation, role, business_type } = regData;
    if (!username?.trim() || !first_name?.trim() || !last_name?.trim() || !password || !password_confirmation) {
      return toast.error('Please fill all required fields');
    }
    if ((role === 'agency') && !business_type?.trim()) {
      return toast.error('Business type is required for agency');
    }
    if (password.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }
    if (password !== password_confirmation) {
      return toast.error('Passwords do not match');
    }

    const fullPhone = `${getDialCode(regCountryIso2)}${regPhone.replace(/^0+/, '')}`;
    const cleanPhone = fullPhone.replace(/^\+/, '');

    try {
      setLoading(true);
      const payload = {
        phone_number: cleanPhone,
        otp_code: otpCode,
        username: username.trim(),
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        password,
        password_confirmation,
        role: role || 'admin',
      };
      if (email?.trim()) payload.email = email.trim();
      if (role === 'agency' && business_type?.trim()) payload.business_type = business_type.trim();

      const res = await api.post('/auth/register', payload);
      const user = res.data?.user;

      const createdRole = user?.role || role || 'admin';

      localStorage.setItem('authToken', res.data.token);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(user || res.data.user));

      toast.success('Account created!');
      navigate(createdRole === 'admin' ? '/admin' : '/Complete-Profile');
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Registration failed.';
      if (err.response?.data?.errors) {
        Object.values(err.response.data.errors).flat().forEach((m) => toast.error(m));
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-0 shadow-2xl">
          <CardHeader className="text-center space-y-4 pb-8">
            <div className="flex justify-center">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ 
                  background: `linear-gradient(to right, ${COLORS.darkBlue}, ${COLORS.teal})`
                }}
              >
                <Shield className="w-8 h-8 text-white" />
              </div>
            </div>
            <div>
              <CardTitle className="text-2xl font-bold bg-clip-text text-transparent" style={{
                backgroundImage: `linear-gradient(to right, ${COLORS.darkBlue}, ${COLORS.teal}, ${COLORS.limeGreen})`
              }}>
                Admin Login
              </CardTitle>
              <CardDescription className="mt-2">
                Sign in to access the admin dashboard
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email or Phone</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="email"
                    type="text"
                    placeholder="admin@example.com or +96170123456"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full text-white"
                style={{
                  background: `linear-gradient(to right, ${COLORS.darkBlue}, ${COLORS.teal})`
                }}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </form>
              </TabsContent>

              <TabsContent value="register">
                {!otpVerified ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
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
                      <div className="space-y-2">
                        <Label>OTP Code</Label>
                        <Input
                          type="text"
                          inputMode="numeric"
                          value={otpCode}
                          onChange={(e) => {
                            const v = e.target.value.replace(/\D/g, '');
                            if (v.length <= 6) setOtpCode(v);
                          }}
                          placeholder="Enter 6-digit OTP"
                          maxLength={6}
                          className="text-center text-xl font-bold tracking-widest"
                        />
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Check your phone</span>
                          {resendTimer > 0 ? (
                            <span>Resend in {resendTimer}s</span>
                          ) : (
                            <Button
                              type="button"
                              variant="link"
                              size="sm"
                              className="h-auto p-0 text-xs"
                              onClick={handleResendOtp}
                              disabled={!canResend || loading}
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
                          type="button"
                          onClick={handleSendOtp}
                          className="w-full text-white"
                          style={{ background: `linear-gradient(to right, ${COLORS.darkBlue}, ${COLORS.teal})` }}
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            'Send OTP'
                          )}
                        </Button>
                      ) : (
                        <>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={changeRegPhone}
                            disabled={loading}
                          >
                            Change
                          </Button>
                          <Button
                            type="button"
                            onClick={handleVerifyOtp}
                            className="flex-1 text-white"
                            style={{ background: `linear-gradient(to right, ${COLORS.darkBlue}, ${COLORS.teal})` }}
                            disabled={loading}
                          >
                            {loading ? (
                              <>
                                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                Verifying...
                              </>
                            ) : (
                              'Verify OTP'
                            )}
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Username *</Label>
                      <Input
                        value={regData.username}
                        onChange={(e) => setRegData((p) => ({ ...p, username: e.target.value }))}
                        placeholder="admin_username"
                        disabled={loading}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input
                        type="email"
                        value={regData.email}
                        onChange={(e) => setRegData((p) => ({ ...p, email: e.target.value }))}
                        placeholder="admin@example.com"
                        disabled={loading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Role *</Label>
                      <Select
                        value={regData.role || 'admin'}
                        onValueChange={(v) => setRegData((p) => ({ ...p, role: v }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="client">Client</SelectItem>
                          <SelectItem value="agency">Agency</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {regData.role === 'agency' && (
                      <div className="space-y-2">
                        <Label>Business Type *</Label>
                        <Input
                          value={regData.business_type}
                          onChange={(e) => setRegData((p) => ({ ...p, business_type: e.target.value }))}
                          placeholder="e.g. Car Rental Agency"
                          disabled={loading}
                        />
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>First Name *</Label>
                        <Input
                          value={regData.first_name}
                          onChange={(e) => setRegData((p) => ({ ...p, first_name: e.target.value }))}
                          placeholder="First"
                          disabled={loading}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Last Name *</Label>
                        <Input
                          value={regData.last_name}
                          onChange={(e) => setRegData((p) => ({ ...p, last_name: e.target.value }))}
                          placeholder="Last"
                          disabled={loading}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Password *</Label>
                      <Input
                        type="password"
                        value={regData.password}
                        onChange={(e) => setRegData((p) => ({ ...p, password: e.target.value }))}
                        placeholder="Min 6 characters"
                        disabled={loading}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Confirm Password *</Label>
                      <Input
                        type="password"
                        value={regData.password_confirmation}
                        onChange={(e) => setRegData((p) => ({ ...p, password_confirmation: e.target.value }))}
                        placeholder="Repeat password"
                        disabled={loading}
                        required
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={resetRegFlow}
                        disabled={loading}
                      >
                        Back
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1 text-white"
                        style={{ background: `linear-gradient(to right, ${COLORS.darkBlue}, ${COLORS.teal})` }}
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-4 h-4 mr-2" />
                            Create Admin Account
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                )}
              </TabsContent>
            </Tabs>

            <div className="mt-6 text-center">
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
                className="text-sm text-gray-600 dark:text-gray-400"
              >
                ← Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

