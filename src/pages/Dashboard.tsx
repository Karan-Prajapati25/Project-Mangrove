import React, { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import CoinsWidget from '@/components/CoinsWidget';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useReports } from '@/hooks/useReports';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { 
  BarChart3, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Users,
  MapPin,
  Camera,
  Shield,
  Award,
  Eye,
  Activity,
  Calendar,
  FileText,
  Bell
} from 'lucide-react';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState([
    { title: 'Total Reports', value: '0', change: '+0%', trend: 'up', icon: Camera, color: 'primary' },
    { title: 'Verified Reports', value: '0', change: '+0%', trend: 'up', icon: CheckCircle, color: 'success' },
    { title: 'Active Threats', value: '0', change: '0%', trend: 'down', icon: AlertTriangle, color: 'warning' },
    { title: 'Protected Areas', value: '0', change: '+0%', trend: 'up', icon: Shield, color: 'secondary' }
  ]);
  const { reports, loading } = useReports();
  const { user } = useAuth();

  useEffect(() => {
    updateStatsFromDatabase();
  }, [reports]);

  const updateStatsFromDatabase = async () => {
    if (!reports) return;

    const totalReports = reports.length;
    const verifiedReports = reports.filter(r => r.status === 'verified').length;
    const activeThreats = reports.filter(r => r.severity === 'high' && r.status !== 'resolved').length;
    const protectedAreas = new Set(reports.map(r => r.location)).size;

    setStats([
      { title: 'Total Reports', value: totalReports.toString(), change: '+12%', trend: 'up', icon: Camera, color: 'primary' },
      { title: 'Verified Reports', value: verifiedReports.toString(), change: '+8%', trend: 'up', icon: CheckCircle, color: 'success' },
      { title: 'Active Threats', value: activeThreats.toString(), change: '-15%', trend: 'down', icon: AlertTriangle, color: 'warning' },
      { title: 'Protected Areas', value: protectedAreas.toString(), change: '+5%', trend: 'up', icon: Shield, color: 'secondary' }
    ]);
  };

  const recentReports = reports.slice(0, 4).map(report => ({
    id: `#${report.id.slice(-4)}`,
    title: report.title,
    location: report.location,
    status: report.status,
    severity: report.severity,
    reporter: 'Guardian User',
    time: new Date(report.created_at).toLocaleDateString(),
    aiConfidence: Math.floor(Math.random() * 20) + 80 // Mock AI confidence
  }));

  const alerts = [
    {
      type: 'critical',
      message: 'High priority threat detected in protected area',
      location: 'Great Barrier Reef Marine Park',
      time: '30 minutes ago',
      action: 'Authorities notified'
    },
    {
      type: 'warning',
      message: 'AI confidence below threshold for Report #2843',
      location: 'Belize Barrier Reef',
      time: '2 hours ago',
      action: 'Expert review requested'
    },
    {
      type: 'success',
      message: 'Conservation milestone achieved',
      location: 'Sundarbans National Park',
      time: '1 day ago',
      action: 'Community celebrated'
    }
  ];

  const activeGuardians = [
    { name: 'Dr. Sarah Chen', reports: 12, location: 'Singapore', status: 'online' },
    { name: 'Ahmed Hassan', reports: 8, location: 'Egypt', status: 'online' },
    { name: 'Maria Santos', reports: 15, location: 'Philippines', status: 'away' },
    { name: 'David Kim', reports: 6, location: 'South Korea', status: 'online' },
    { name: 'Ana Rodriguez', reports: 9, location: 'Colombia', status: 'offline' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'success';
      case 'pending': return 'warning';
      case 'under_review': return 'secondary';
      case 'rejected': return 'destructive';
      default: return 'secondary';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'secondary';
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'critical': return 'destructive';
      case 'warning': return 'warning';
      case 'success': return 'success';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return '🟢';
      case 'away': return '🟡';
      case 'offline': return '⚫';
      default: return '⚫';
    }
  };

  return (
    <>
      <Navigation />
      
      {/* Header */}
      <div className="bg-gradient-hero text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="h-8 w-8 text-accent" />
            <h1 className="text-3xl md:text-4xl font-bold">Authority Dashboard</h1>
          </div>
          <p className="text-lg text-white/90 max-w-2xl">
            Real-time monitoring and management of mangrove conservation efforts. 
            Track reports, manage alerts, and coordinate response actions.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} className="hover:shadow-medium transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Icon className={`h-8 w-8 text-${stat.color}`} />
                    <div className={`flex items-center gap-1 text-sm ${
                      stat.trend === 'up' ? 'text-success' : 'text-destructive'
                    }`}>
                      <TrendingUp className={`h-4 w-4 ${stat.trend === 'down' ? 'rotate-180' : ''}`} />
                      {stat.change}
                    </div>
                  </div>
                  <div className="text-2xl font-bold mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.title}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Coins Widget */}
            <CoinsWidget />
            {/* Recent Reports */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Reports</CardTitle>
                <Button variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  View All
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentReports.map((report) => (
                    <div key={report.id} className="flex items-start gap-4 p-4 border border-border rounded-lg hover:bg-accent/5 transition-colors duration-200">
                      <div className="flex-shrink-0">
                        {report.status === 'verified' ? (
                          <CheckCircle className="h-5 w-5 text-success" />
                        ) : report.severity === 'high' ? (
                          <AlertTriangle className="h-5 w-5 text-destructive" />
                        ) : (
                          <Clock className="h-5 w-5 text-warning" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-sm">{report.title}</h4>
                          <Badge variant="outline" className="text-xs">
                            {report.id}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {report.location}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>{report.time}</span>
                          <span>•</span>
                          <span>{report.reporter}</span>
                          <span>•</span>
                          <span>AI: {report.aiConfidence}%</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <Badge variant={getStatusColor(report.status) as any} className="text-xs">
                          {report.status.replace('_', ' ')}
                        </Badge>
                        <Badge variant={getSeverityColor(report.severity) as any} className="text-xs">
                          {report.severity}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Activity Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Activity Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {alerts.map((alert, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className={`w-3 h-3 rounded-full bg-${getAlertColor(alert.type)} mt-2 flex-shrink-0`} />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{alert.message}</p>
                        <p className="text-xs text-muted-foreground mb-1">{alert.location}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{alert.time}</span>
                          <span>•</span>
                          <span className="font-medium">{alert.action}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Live Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Live Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
                      <span className="font-semibold text-sm text-destructive">Critical Alert</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Illegal deforestation detected in protected zone
                    </p>
                  </div>
                  <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 bg-warning rounded-full animate-pulse" />
                      <span className="font-semibold text-sm text-warning">Medium Priority</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Water quality deviation reported
                    </p>
                  </div>
                </div>
                <Button variant="outline" className="w-full mt-4">
                  View All Alerts
                </Button>
              </CardContent>
            </Card>

            {/* Active Guardians */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Active Guardians
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {activeGuardians.map((guardian, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-ocean rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {guardian.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm truncate">{guardian.name}</span>
                          <span className="text-xs">{getStatusIcon(guardian.status)}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {guardian.location} • {guardian.reports} reports
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="ocean" className="w-full justify-start">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Send Emergency Alert
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Eye className="h-4 w-4 mr-2" />
                  Review Pending Reports
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Inspection
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Award className="h-4 w-4 mr-2" />
                  Manage Rewards
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;