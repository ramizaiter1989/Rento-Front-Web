import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Shield, Lock, User, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const COLORS = {
  darkBlue: '#0E4C81',
  teal: '#008C95',
  limeGreen: '#8AC640'
};

export default function AdminAuthPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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
      navigate('/admin-panel-page');
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Login failed.';
      toast.error(errorMessage);
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

