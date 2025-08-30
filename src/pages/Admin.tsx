import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Building, Shield, Users, Award, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

const Admin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [organizationType, setOrganizationType] = useState('');
  
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const organizationTypes = [
    { value: 'ngo', label: 'Non-Governmental Organization (NGO)' },
    { value: 'government', label: 'Government Agency' },
    { value: 'research', label: 'Research Institution' },
  ];

  const handleAdminSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await signIn(email, password);
    
    if (error) {
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // Wait for auth state to update
    setTimeout(async () => {
      // Get current session after sign in
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user;

      if (!currentUser) {
        toast({
          title: "Sign in failed",
          description: "Authentication failed",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Special handling for super admin email
      if (email === 'baraiyaurvish611@gmail.com') {
        // Auto-create admin role for super admin if it doesn't exist
        const { data: existingRole } = await supabase
          .from('admin_roles')
          .select('*')
          .eq('user_id', currentUser.id)
          .single();

        if (!existingRole) {
          await supabase
            .from('admin_roles')
            .insert({
              user_id: currentUser.id,
              organization_name: 'MangroveWatch HQ',
              organization_type: 'government',
              verification_status: 'approved',
              is_super_admin: true,
              approved_at: new Date().toISOString(),
              approved_by: currentUser.id,
            });
        } else if (!existingRole.is_super_admin) {
          await supabase
            .from('admin_roles')
            .update({ 
              is_super_admin: true,
              verification_status: 'approved',
              approved_at: new Date().toISOString()
            })
            .eq('user_id', currentUser.id);
        }

        toast({
          title: "Welcome Super Admin!",
          description: "Successfully signed in with super admin privileges.",
        });
        navigate('/admin-dashboard');
      } else {
        // Regular admin login - check if user has admin role
        const { data: adminRole } = await supabase
          .from('admin_roles')
          .select('*')
          .eq('user_id', currentUser.id)
          .eq('verification_status', 'approved')
          .single();

        if (adminRole) {
          navigate('/admin-dashboard');
        } else {
          toast({
            title: "Access denied",
            description: "You don't have administrative privileges. Please apply for admin access or contact the super admin.",
            variant: "destructive",
          });
        }
      }

      setIsLoading(false);
    }, 1000);
  };

  const handleAdminSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await signUp(email, password, {
      display_name: organizationName,
      organization_type: organizationType,
    });

    if (error) {
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Application submitted!",
        description: "Your admin access request has been submitted for review by the super admin. You'll be notified once approved.",
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-secondary/10 to-accent/20">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-full max-w-lg">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <Building className="h-12 w-12 text-primary mr-2" />
                <h1 className="text-3xl font-bold">Admin Portal</h1>
              </div>
              <p className="text-muted-foreground">Administrative access for NGOs and Government agencies</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Admin Access</CardTitle>
                <CardDescription>
                  Sign in to your admin account or apply for administrative privileges
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="signin" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="signin">Admin Sign In</TabsTrigger>
                    <TabsTrigger value="apply">Apply for Access</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="signin">
                    <form onSubmit={handleAdminSignIn} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="admin-email">Admin Email</Label>
                        <Input
                          id="admin-email"
                          type="email"
                          placeholder="Enter your admin email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="admin-password">Password</Label>
                        <Input
                          id="admin-password"
                          type="password"
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? "Signing in..." : "Sign In to Admin Portal"}
                      </Button>
                    </form>
                  </TabsContent>
                  
                  <TabsContent value="apply">
                    <form onSubmit={handleAdminSignUp} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="org-name">Organization Name</Label>
                        <Input
                          id="org-name"
                          type="text"
                          placeholder="Enter your organization name"
                          value={organizationName}
                          onChange={(e) => setOrganizationName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="org-type">Organization Type</Label>
                        <Select value={organizationType} onValueChange={setOrganizationType}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select organization type" />
                          </SelectTrigger>
                          <SelectContent>
                            {organizationTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="apply-email">Email</Label>
                        <Input
                          id="apply-email"
                          type="email"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="apply-password">Password</Label>
                        <Input
                          id="apply-password"
                          type="password"
                          placeholder="Create a password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? "Submitting application..." : "Apply for Admin Access"}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>

                <div className="mt-8 pt-6 border-t">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="flex flex-col items-center space-y-2">
                      <Shield className="h-8 w-8 text-primary" />
                      <span className="text-sm font-medium">AI Validation</span>
                      <span className="text-xs text-muted-foreground">Automated</span>
                    </div>
                    <div className="flex flex-col items-center space-y-2">
                      <Users className="h-8 w-8 text-primary" />
                      <span className="text-sm font-medium">Report</span>
                      <span className="text-xs text-muted-foreground">Management</span>
                    </div>
                    <div className="flex flex-col items-center space-y-2">
                      <Award className="h-8 w-8 text-primary" />
                      <span className="text-sm font-medium">Coin</span>
                      <span className="text-xs text-muted-foreground">Rewards</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-accent/10 rounded-lg">
                  <h4 className="font-semibold text-sm mb-2">Admin Features</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs">
                      <CheckCircle className="h-3 w-3 text-success" />
                      <span>AI-powered report validation with Google Maps verification</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Clock className="h-3 w-3 text-warning" />
                      <span>Severity-based coin awarding (High: 50, Medium: 30, Low: 15)</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <AlertTriangle className="h-3 w-3 text-primary" />
                      <span>Comprehensive report management dashboard</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Shield className="h-3 w-3 text-primary" />
                      <span>Super admin can approve new admin applications</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;