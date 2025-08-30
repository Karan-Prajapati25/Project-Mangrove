import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Leaf, Shield, Users, Award, UserCheck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [country, setCountry] = useState('');
  const [loginType, setLoginType] = useState<'user' | 'admin'>('user');
  
  const { signIn, signUp, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      if (loginType === 'admin') {
        // Get current session to get user ID
        const { data: sessionData } = await supabase.auth.getSession();
        const currentUserId = sessionData?.session?.user?.id;

        if (currentUserId) {
          // Check if user has admin privileges
          const { data: adminData, error: adminError } = await supabase
            .from('admin_roles')
            .select('verification_status')
            .eq('user_id', currentUserId)
            .single();

          if (adminError || adminData?.verification_status !== 'Approved') {
            toast({
              title: "Access denied",
              description: "You don't have administrator privileges or your admin application hasn't been approved yet.",
              variant: "destructive",
            });
            setIsLoading(false);
            return;
          }
          navigate('/admin-dashboard');
        } else {
          toast({
            title: "Error",
            description: "Unable to verify admin status. Please try again.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
      } else {
        navigate('/dashboard');
      }
      
      toast({
        title: "Welcome back!",
        description: "You have been signed in successfully.",
      });
    }

    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await signUp(email, password, {
      display_name: displayName,
      country: country,
    });

    if (error) {
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Account created!",
        description: "Please check your email to confirm your account.",
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-secondary/10 to-accent/20">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <Shield className="h-12 w-12 text-primary mr-2" />
                <h1 className="text-3xl font-bold">Mangrove Guardian</h1>
              </div>
              <p className="text-muted-foreground">Join the conservation community</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Welcome</CardTitle>
                <CardDescription>
                  Sign in to your account or create a new one to start protecting our mangroves
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="signin" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="signin">Sign In</TabsTrigger>
                    <TabsTrigger value="signup">Sign Up</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="signin">
                    <div className="space-y-4">
                      {/* Login Type Selection */}
                      <div className="space-y-3">
                        <Label>Sign in as:</Label>
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            type="button"
                            variant={loginType === 'user' ? 'default' : 'outline'}
                            className="flex items-center gap-2"
                            onClick={() => setLoginType('user')}
                          >
                            <Users className="h-4 w-4" />
                            User
                          </Button>
                          <Button
                            type="button"
                            variant={loginType === 'admin' ? 'default' : 'outline'}
                            className="flex items-center gap-2"
                            onClick={() => setLoginType('admin')}
                          >
                            <UserCheck className="h-4 w-4" />
                            Admin
                          </Button>
                        </div>
                      </div>
                      
                      <form onSubmit={handleSignIn} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="password">Password</Label>
                          <Input
                            id="password"
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                          />
                        </div>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                          {isLoading ? "Signing in..." : `Sign In as ${loginType === 'admin' ? 'Administrator' : 'User'}`}
                        </Button>
                      </form>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="signup">
                    <form onSubmit={handleSignUp} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="displayName">Display Name</Label>
                        <Input
                          id="displayName"
                          type="text"
                          placeholder="Enter your display name"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="country">Country</Label>
                        <Input
                          id="country"
                          type="text"
                          placeholder="Enter your country"
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          placeholder="Create a password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? "Creating account..." : "Create Account"}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>

                <div className="mt-8 pt-6 border-t">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="flex flex-col items-center space-y-2">
                      <Leaf className="h-8 w-8 text-primary" />
                      <span className="text-sm font-medium">Protect</span>
                      <span className="text-xs text-muted-foreground">Ecosystems</span>
                    </div>
                    <div className="flex flex-col items-center space-y-2">
                      <Users className="h-8 w-8 text-primary" />
                      <span className="text-sm font-medium">Community</span>
                      <span className="text-xs text-muted-foreground">Driven</span>
                    </div>
                    <div className="flex flex-col items-center space-y-2">
                      <Award className="h-8 w-8 text-primary" />
                      <span className="text-sm font-medium">Earn</span>
                      <span className="text-xs text-muted-foreground">Rewards</span>
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

export default Auth;