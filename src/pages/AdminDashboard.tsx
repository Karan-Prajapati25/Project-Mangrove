import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Search, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Users, 
  FileText, 
  AlertTriangle,
  LogOut,
  Building,
  Filter,
  Brain,
  MapPin,
  Coins,
  Eye,
  Calendar,
  User,
  Shield,
  TrendingUp,
  Award,
  ArrowLeft,
  RefreshCw
} from 'lucide-react';

interface Report {
  id: string;
  title: string;
  description: string;
  incident_type: string;
  severity: string;
  status: string;
  location: string;
  latitude?: number;
  longitude?: number;
  created_at: string;
  user_id: string;
  profiles?: {
    display_name: string;
    country: string;
    is_admin: boolean;
  } | null;
}

interface AdminStats {
  totalReports: number;
  pendingReports: number;
  approvedReports: number;
  rejectedReports: number;
  totalNormalUsers: number;
  totalCoinsAwarded: number;
}

const AdminDashboard = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [validationResults, setValidationResults] = useState<{[key: string]: any}>({});
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [signingOut, setSigningOut] = useState(false);
  const [stats, setStats] = useState<AdminStats>({
    totalReports: 0,
    pendingReports: 0,
    approvedReports: 0,
    rejectedReports: 0,
    totalNormalUsers: 0,
    totalCoinsAwarded: 0,
  });

  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAccess();
    fetchReports();
    fetchStats();
  }, []);

  useEffect(() => {
    filterReports();
  }, [reports, searchTerm, statusFilter, severityFilter]);

  const checkAdminAccess = async () => {
    if (!user) {
      console.log('No user found, redirecting to admin login');
      navigate('/admin-login');
      return;
    }

    console.log('Checking admin access for user:', user.id);
    const { data: adminRole, error: roleError } = await supabase
      .from('admin_roles')
      .select('*')
      .eq('user_id', user.id)
      .eq('verification_status', 'approved')
      .single();

    if (roleError || !adminRole) {
      console.log('Admin access denied, redirecting to admin login');
      toast({
        title: "Access denied",
        description: "You don't have administrative privileges.",
        variant: "destructive",
      });
      navigate('/admin-login');
    } else {
      console.log('Admin access granted');
    }
  };

  const fetchReports = async () => {
    setLoading(true);
    
    // Fetch only reports from NORMAL users (not admins)
    const { data, error } = await supabase
      .from('reports')
      .select(`
        *,
        profiles!inner(display_name, country, is_admin)
      `)
      .eq('profiles.is_admin', false) // Only reports from normal users
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch reports",
        variant: "destructive",
      });
    } else {
      setReports((data as any) || []);
      // Pre-validate pending reports with AI
      const pendingReports = (data as any)?.filter((r: Report) => r.status === 'Pending') || [];
      preValidateReports(pendingReports);
    }
    setLoading(false);
  };

  const fetchStats = async () => {
    try {
      // Get all reports and filter in memory to avoid complex queries
      const { data: allReports } = await supabase
        .from('reports')
        .select('status, severity, user_id');

      // Get all profiles - check if admin_roles table exists
      const { data: allProfiles } = await supabase
        .from('profiles')
        .select('id');

      // Get admin users from admin_roles table
      const { data: adminRoles } = await supabase
        .from('admin_roles')
        .select('user_id')
        .eq('verification_status', 'approved');

      if (allReports && allProfiles && adminRoles) {
        // Get admin user IDs
        const adminUserIds = adminRoles.map(role => role.user_id);
        
        // Filter normal users (not in admin_roles)
        const normalUserIds = allProfiles
          .filter(p => !adminUserIds.includes(p.id))
          .map(p => p.id);

        // Filter reports from normal users
        const reportsData = allReports.filter(r => normalUserIds.includes(r.user_id));
        const usersData = allProfiles.filter(p => !adminUserIds.includes(p.id));

        const totalReports = reportsData.length;
        const pendingReports = reportsData.filter(r => r.status === 'Pending').length;
        const approvedReports = reportsData.filter(r => r.status === 'Approved').length;
        const rejectedReports = reportsData.filter(r => r.status === 'Rejected').length;
        const totalNormalUsers = usersData.length;
        
        // Calculate total coins awarded
        const totalCoinsAwarded = reportsData
          .filter(r => r.status === 'Approved')
          .reduce((total, report) => {
            switch (report.severity) {
              case 'High': return total + 50;
              case 'Medium': return total + 30;
              case 'Low': return total + 15;
              default: return total + 25;
            }
          }, 0);

        setStats({
          totalReports,
          pendingReports,
          approvedReports,
          rejectedReports,
          totalNormalUsers,
          totalCoinsAwarded,
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const filterReports = () => {
    let filtered = reports;

    if (searchTerm) {
      filtered = filtered.filter(report =>
        report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.profiles?.display_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      const capitalizedFilter = statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1);
      filtered = filtered.filter(report => report.status === capitalizedFilter);
    }

    if (severityFilter !== 'all') {
      const capitalizedFilter = severityFilter.charAt(0).toUpperCase() + severityFilter.slice(1);
      filtered = filtered.filter(report => report.severity === capitalizedFilter);
    }

    setFilteredReports(filtered);
  };

  const preValidateReports = async (pendingReports: Report[]) => {
    const results: {[key: string]: any} = {};
    
    for (const report of pendingReports) {
      try {
        const validation = await validateReportWithAI(report);
        results[report.id] = validation;
      } catch (error) {
        console.error(`Failed to validate report ${report.id}:`, error);
        results[report.id] = { 
          isValid: true, 
          reason: 'AI validation failed, manual review required',
          severity: report.severity 
        };
      }
    }
    
    setValidationResults(results);
  };

  const validateReportWithAI = async (report: Report): Promise<{ isValid: boolean; reason: string; severity?: string }> => {
    try {
      const { data, error } = await supabase.functions.invoke('validate-report', {
        body: {
          title: report.title,
          description: report.description,
          incident_type: report.incident_type,
          severity: report.severity,
          location: report.location,
          latitude: report.latitude,
          longitude: report.longitude,
        },
      });

      if (error) throw error;

      return {
        isValid: data.isValid,
        reason: data.reason,
        severity: data.severity || report.severity
      };
    } catch (error) {
      console.error('AI validation error:', error);
      return {
        isValid: true,
        reason: 'AI validation unavailable, manual review required',
        severity: report.severity
      };
    }
  };

  const updateReportStatus = async (reportId: string, status: 'Approved' | 'Rejected') => {
    setProcessingId(reportId);

    const report = reports.find(r => r.id === reportId);
    if (!report) return;

    try {
      // Get validation result or validate now
      let validation = validationResults[reportId];
      if (!validation) {
        validation = await validateReportWithAI(report);
      }
      
      // Update report severity if AI determined a different one
      const updatedSeverity = validation.severity || report.severity;
      
      const { error } = await supabase
        .from('reports')
        .update({ 
          status,
          severity: updatedSeverity,
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id
        })
        .eq('id', reportId);

      if (error) throw error;

      // Award coins based on severity level if approved
      if (status === 'Approved') {
        // Get coin amount based on severity level using the database function
        const { data: coinAmount } = await supabase
          .rpc('get_coin_amount_for_severity', { severity_level: updatedSeverity });

        const amount = coinAmount || 25; // Default fallback

        const { error: coinsError } = await supabase.functions.invoke('award-coins', {
          body: {
            userId: report.user_id,
            amount: amount,
            reason: `Approved ${updatedSeverity.toLowerCase()} severity environmental report`,
          },
        });

        if (coinsError) {
          console.error('Failed to award coins:', coinsError);
        }

        toast({
          title: `Report Approved ✅`,
          description: `${amount} coins awarded to user for ${updatedSeverity.toLowerCase()} severity report.`,
        });
      } else {
        toast({
          title: `Report Rejected ❌`,
          description: `Report rejected. AI: ${validation.reason}`,
          variant: "destructive",
        });
      }

      fetchReports();
      fetchStats();
      setSelectedReport(null);
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${status.toLowerCase()} report`,
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleSignOut = async () => {
    try {
      setSigningOut(true);
      console.log('Signing out admin...');
      await signOut();
      console.log('Admin signed out successfully');
      
      // Clear any local state
      setReports([]);
      setFilteredReports([]);
      setSelectedReport(null);
      setValidationResults({});
      
      // Navigate to admin login
      navigate('/admin-login');
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Sign Out Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSigningOut(false);
    }
  };

  const handleBackToMain = () => {
    navigate('/');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Approved</Badge>;
      case 'Rejected':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Rejected</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Pending</Badge>;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'High':
        return <Badge variant="destructive">High (50 🪙)</Badge>;
      case 'Medium':
        return <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">Medium (30 🪙)</Badge>;
      default:
        return <Badge variant="secondary">Low (15 🪙)</Badge>;
    }
  };

  const getValidationBadge = (reportId: string) => {
    const validation = validationResults[reportId];
    if (!validation) return null;

    return (
      <div className="flex items-center gap-1 text-xs">
        <Brain className="h-3 w-3" />
        <span className={validation.isValid ? "text-green-600" : "text-red-600"}>
          AI: {validation.isValid ? "Valid" : "Suspicious"}
        </span>
      </div>
    );
  };

  const openReportDetails = (report: Report) => {
    setSelectedReport(report);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToMain}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Main
            </Button>
            <div className="flex items-center space-x-2">
              <Building className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <Badge variant="outline" className="ml-2">Administrative Access Only</Badge>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => { fetchReports(); fetchStats(); }}
              className="text-muted-foreground hover:text-foreground"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                console.log('Sign out button clicked');
                handleSignOut();
              }}
              disabled={signingOut}
              className="text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-950"
            >
              {signingOut ? (
                <div className="animate-spin h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full mr-2" />
              ) : (
                <LogOut className="h-4 w-4 mr-2" />
              )}
              {signingOut ? 'Signing Out...' : 'Sign Out'}
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Admin Notice */}
        <Card className="mb-6 border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
              <Shield className="h-5 w-5" />
              <div>
                <p className="font-medium">Administrative Access</p>
                <p className="text-sm">You are logged in as an administrator. This dashboard provides administrative tools only.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">User Reports</p>
                  <p className="text-2xl font-bold">{stats.totalReports}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium">Pending</p>
                  <p className="text-2xl font-bold">{stats.pendingReports}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium">Approved</p>
                  <p className="text-2xl font-bold">{stats.approvedReports}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <XCircle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-sm font-medium">Rejected</p>
                  <p className="text-2xl font-bold">{stats.rejectedReports}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Normal Users</p>
                  <p className="text-2xl font-bold">{stats.totalNormalUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Coins className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium">Coins Awarded</p>
                  <p className="text-2xl font-bold">{stats.totalCoinsAwarded}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content - Admin Only */}
        <Tabs defaultValue="reports" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              User Reports Management
            </TabsTrigger>
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Administrative Overview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reports" className="space-y-6">
            {/* Search and Filter */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  User Reports Management
                </CardTitle>
                <CardDescription>
                  Manage reports submitted by normal users. Approve valid reports to award coins, reject invalid ones.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search user reports by title, description, location, or user..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-3 py-2 border rounded-md bg-background text-sm"
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                    <select
                      value={severityFilter}
                      onChange={(e) => setSeverityFilter(e.target.value)}
                      className="px-3 py-2 border rounded-md bg-background text-sm"
                    >
                      <option value="all">All Severity</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                </div>

                {/* Reports Table */}
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Report Details</TableHead>
                        <TableHead>User (Normal)</TableHead>
                        <TableHead>Type & Severity</TableHead>
                        <TableHead>AI Validation</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredReports.map((report) => (
                        <TableRow key={report.id} className="hover:bg-accent/5">
                          <TableCell>
                            <div>
                              <p className="font-medium">{report.title}</p>
                              <p className="text-sm text-muted-foreground truncate max-w-xs">
                                {report.description}
                              </p>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                <MapPin className="h-3 w-3" />
                                {report.location}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="font-medium">{report.profiles?.display_name || 'Unknown'}</p>
                                <p className="text-xs text-muted-foreground">{report.profiles?.country || 'Unknown'}</p>
                                <Badge variant="outline" className="text-xs mt-1">Normal User</Badge>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <Badge variant="outline" className="text-xs">{report.incident_type}</Badge>
                              {getSeverityBadge(report.severity)}
                            </div>
                          </TableCell>
                          <TableCell>
                            {getValidationBadge(report.id)}
                            {validationResults[report.id] && (
                              <p className="text-xs text-muted-foreground mt-1 max-w-32 truncate">
                                {validationResults[report.id].reason}
                              </p>
                            )}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(report.status)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              {new Date(report.created_at).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openReportDetails(report)}
                                className="text-blue-600 border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {report.status === 'Pending' && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => updateReportStatus(report.id, 'Approved')}
                                    disabled={processingId === report.id}
                                    className="text-green-600 border-green-600 hover:bg-green-50 dark:hover:bg-green-950"
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    {processingId === report.id ? '...' : 'Approve'}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => updateReportStatus(report.id, 'Rejected')}
                                    disabled={processingId === report.id}
                                    className="text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                                  >
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Reject
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  
                  {filteredReports.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                      <p>No user reports found matching your criteria</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Coin Awarding Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Coin Rewards for Users
                </CardTitle>
                <CardDescription>
                  Normal users earn coins when their reports are approved based on severity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-red-50 dark:bg-red-950 rounded-lg">
                    <h3 className="font-semibold text-red-800 dark:text-red-200">High Severity</h3>
                    <p className="text-2xl font-bold text-red-600">50 🪙</p>
                    <p className="text-sm text-red-600">Critical incidents</p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
                    <h3 className="font-semibold text-orange-800 dark:text-orange-200">Medium Severity</h3>
                    <p className="text-2xl font-bold text-orange-600">30 🪙</p>
                    <p className="text-sm text-orange-600">Moderate concerns</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-950 rounded-lg">
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200">Low Severity</h3>
                    <p className="text-2xl font-bold text-gray-600">15 🪙</p>
                    <p className="text-sm text-gray-600">Minor issues</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Administrative Overview</CardTitle>
                <CardDescription>
                  Summary of user reports and system status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">Recent Activity</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Reports from normal users only</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>AI-powered validation system</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span>Automatic coin rewards</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-3">System Status</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Admin Access:</span>
                        <Badge variant="default">Active</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>User Reports:</span>
                        <Badge variant="outline">{stats.totalReports}</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Pending Review:</span>
                        <Badge variant="secondary">{stats.pendingReports}</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Report Details Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">User Report Details</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedReport(null)}
                >
                  ✕
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{selectedReport.title}</h3>
                  <p className="text-muted-foreground">{selectedReport.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Incident Type</p>
                    <p>{selectedReport.incident_type}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Severity</p>
                    {getSeverityBadge(selectedReport.severity)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Location</p>
                    <p>{selectedReport.location}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                    {getStatusBadge(selectedReport.status)}
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground">User (Normal)</p>
                  <p>{selectedReport.profiles?.display_name || 'Unknown'} ({selectedReport.profiles?.country || 'Unknown'})</p>
                  <Badge variant="outline" className="mt-1">Normal User</Badge>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Submitted</p>
                  <p>{new Date(selectedReport.created_at).toLocaleString()}</p>
                </div>
                
                {selectedReport.status === 'Pending' && (
                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={() => updateReportStatus(selectedReport.id, 'Approved')}
                      disabled={processingId === selectedReport.id}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve Report
                    </Button>
                    <Button
                      onClick={() => updateReportStatus(selectedReport.id, 'Rejected')}
                      disabled={processingId === selectedReport.id}
                      variant="destructive"
                      className="flex-1"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject Report
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;