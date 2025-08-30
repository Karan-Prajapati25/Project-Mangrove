import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { isAdminEmail } from '@/config/admin';
import { 
  Building, 
  Shield, 
  Eye, 
  EyeOff,
  Lock,
  User,
  AlertTriangle
} from 'lucide-react';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { signIn } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // First, check if email is in admin list
      if (!isAdminEmail(email)) {
        setError('Access denied. This email is not authorized for administrative access.');
        toast({
          title: "Access Denied",
          description: "This email is not authorized for administrative access.",
          variant: "destructive",
        });
        return;
      }

      // Then, sign in the user
      const { data: authData, error: authError } = await signIn(email, password);
      
      if (authError) {
        setError('Invalid email or password');
        return;
      }

      if (!authData.user) {
        setError('Authentication failed');
        return;
      }

      // Check if user has admin privileges in admin_roles table
      const { data: adminRole, error: roleError } = await supabase
        .from('admin_roles')
        .select('*')
        .eq('user_id', authData.user.id)
        .eq('verification_status', 'approved')
        .single();

      if (roleError || !adminRole) {
        // Create admin role if it doesn't exist (since email is in admin list)
        const { error: createRoleError } = await supabase
          .from('admin_roles')
          .insert({
            user_id: authData.user.id,
            email: email,
            verification_status: 'approved',
            role: 'administrator',
            created_at: new Date().toISOString()
          });

        if (createRoleError) {
          console.warn('Failed to create admin role:', createRoleError);
        }
      }

      // Success! User has admin access
      toast({
        title: "Welcome, Administrator!",
        description: "You have successfully logged in to the admin dashboard.",
      });

      // Navigate to admin dashboard
      navigate('/admin-dashboard');
      
    } catch (error) {
      console.error('Admin login error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToMain = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center">
              <Building className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Admin Access</h1>
          <p className="text-blue-200">Administrative Dashboard Login</p>
        </div>

        {/* Login Card */}
        <Card className="bg-white/10 backdrop-blur-lg border-white/20 shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-white flex items-center justify-center gap-2">
              <Shield className="h-5 w-5" />
              Administrator Login
            </CardTitle>
            <CardDescription className="text-blue-200">
              Access the administrative dashboard to manage user reports
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdminLogin} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">Email Address</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@mangrove.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-white/20 border-white/30 text-white placeholder:text-gray-300"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 bg-white/20 border-white/30 text-white placeholder:text-gray-300"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-red-400" />
                  <span className="text-red-200 text-sm">{error}</span>
                </div>
              )}

              {/* Login Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    Authenticating...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Access Admin Dashboard
                  </div>
                )}
              </Button>
            </form>

            {/* Back to Main */}
            <div className="mt-6 text-center">
              <Button
                variant="ghost"
                onClick={handleBackToMain}
                className="text-blue-200 hover:text-white hover:bg-white/10"
              >
                ← Back to Main Site
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <div className="mt-6 text-center">
          <p className="text-blue-200 text-sm">
            <Shield className="h-3 w-3 inline mr-1" />
            Secure administrative access only
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
