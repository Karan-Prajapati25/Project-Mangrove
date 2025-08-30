import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
  Coins
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
  } | null;
}

interface AdminStats {
  totalReports: number;
  pendingReports: number;
  approvedReports: number;
  rejectedReports: number;
  totalUsers: number;
}

const AdminDashboard = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [validationResults, setValidationResults] = useState<{[key: string]: any}>({});
  const [stats, setStats] = useState<AdminStats>({
    totalReports: 0,
    pendingReports: 0,
    approvedReports: 0,
    rejectedReports: 0,
    totalUsers: 0,
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
  }, [reports, searchTerm, statusFilter]);

  const checkAdminAccess = async () => {
    if (!user) {
      navigate('/admin');
      return;
    }

    const { data: adminRole } = await supabase
      .from('admin_roles')
      .select('*')
      .eq('user_id', user.id)
      .eq('verification_status', 'approved')
      .single();

    if (!adminRole) {
      toast({
        title: "Access denied",
        description: "You don't have administrative privileges.",
        variant: "destructive",
      });
      navigate('/admin');
    }
  };

  const fetchReports = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('reports')
      .select(`
        *,
        profiles(display_name)
      `)
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
    const { data: reportsData } = await supabase
      .from('reports')
      .select('status');

    const { data: usersData } = await supabase
      .from('profiles')
      .select('id');

    if (reportsData && usersData) {
      const totalReports = reportsData.length;
      const pendingReports = reportsData.filter(r => r.status === 'Pending').length;
      const approvedReports = reportsData.filter(r => r.status === 'Approved').length;
      const rejectedReports = reportsData.filter(r => r.status === 'Rejected').length;
      const totalUsers = usersData.length;

      setStats({
        totalReports,
        pendingReports,
        approvedReports,
        rejectedReports,
        totalUsers,
      });
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
          severity: updatedSeverity
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
          description: `${amount} coins awarded for ${updatedSeverity.toLowerCase()} severity report. AI: ${validation.reason}`,
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
    await signOut();
    navigate('/admin');
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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
          <div className="flex items-center space-x-2">
            <Building className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <Badge variant="outline" className="ml-2">AI-Powered</Badge>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Total Reports</p>
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
                  <p className="text-sm font-medium">Total Users</p>
                  <p className="text-2xl font-bold">{stats.totalUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              AI-Enhanced Report Management
            </CardTitle>
            <CardDescription>
              Reports are automatically validated by AI and Google Maps before requiring admin approval
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search reports by title, description, location, or user..."
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
              </div>
            </div>

            {/* Reports Table */}
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Report Details</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Type & Severity</TableHead>
                    <TableHead>AI Validation</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReports.map((report) => (
                    <TableRow key={report.id}>
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
                        <p className="font-medium">{report.profiles?.display_name || 'Unknown'}</p>
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
                        <p className="text-sm">
                          {new Date(report.created_at).toLocaleDateString()}
                        </p>
                      </TableCell>
                      <TableCell>
                        {report.status === 'Pending' && (
                          <div className="flex space-x-2">
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
                              {processingId === report.id ? '...' : 'Reject'}
                            </Button>
                          </div>
                        )}
                        {report.status !== 'Pending' && (
                          <Badge variant="secondary">
                            {report.status}
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {filteredReports.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                  <p>No reports found matching your criteria</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Coin Awarding Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5" />
              Severity-Based Coin Rewards
            </CardTitle>
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
      </div>
    </div>
  );
};

export default AdminDashboard;