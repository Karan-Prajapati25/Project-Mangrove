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
  Bell,
  X
} from 'lucide-react';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showAllAlerts, setShowAllAlerts] = useState(false);
  const [showAllReports, setShowAllReports] = useState(false);
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

  // Handle ESC key press for modals
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showAllAlerts) setShowAllAlerts(false);
        if (showAllReports) setShowAllReports(false);
      }
    };

    if (showAllAlerts || showAllReports) {
      document.addEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'unset';
    };
  }, [showAllAlerts, showAllReports]);

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

  // Extended alerts for "View All" functionality
  const allAlerts = [
    ...alerts,
    {
      type: 'critical',
      message: 'Illegal fishing activity detected',
      location: 'Mangrove Bay, Florida',
      time: '3 hours ago',
      action: 'Coast Guard dispatched'
    },
    {
      type: 'warning',
      message: 'Water quality alert - pH levels elevated',
      location: 'Everglades National Park',
      time: '5 hours ago',
      action: 'Environmental team investigating'
    },
    {
      type: 'success',
      message: 'New mangrove saplings planted successfully',
      location: 'Mumbai Coastal Area',
      time: '1 day ago',
      action: 'Restoration project milestone'
    },
    {
      type: 'warning',
      message: 'Storm damage assessment needed',
      location: 'Caribbean Mangrove Forests',
      time: '2 days ago',
      action: 'Survey team deployed'
    },
    {
      type: 'success',
      message: 'Community cleanup event completed',
      location: 'Bangkok Mangrove Reserve',
      time: '3 days ago',
      action: '500+ volunteers participated'
    },
    {
      type: 'critical',
      message: 'Oil spill detected near mangrove area',
      location: 'Gulf of Mexico Coast',
      time: '4 days ago',
      action: 'Emergency response activated'
    },
    {
      type: 'warning',
      message: 'Invasive species detected',
      location: 'Australian Mangrove Forests',
      time: '5 days ago',
      action: 'Biological control measures planned'
    },
    {
      type: 'success',
      message: 'Mangrove education program launched',
      location: 'Southeast Asian Schools',
      time: '1 week ago',
      action: '10,000+ students reached'
    }
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



  return (
    <>
      <Navigation />
      
      {/* Header */}
      <div className="bg-gradient-hero text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="h-8 w-8 text-accent" />
            <h1 className="text-3xl md:text-4xl font-bold">Dashboard</h1>
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
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowAllReports(true)}
                >
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
                <Button 
                  variant="outline" 
                  className="w-full mt-4"
                  onClick={() => setShowAllAlerts(true)}
                >
                  View All Alerts
                </Button>
              </CardContent>
            </Card>




          </div>
        </div>
      </div>

      {/* All Alerts Modal */}
      {showAllAlerts && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setShowAllAlerts(false)}
        >
          <div 
            className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
              <div>
                <h3 className="text-2xl font-bold text-blue-900">All System Alerts</h3>
                <p className="text-blue-700 mt-1">Complete overview of all system alerts and notifications</p>
              </div>
              <button 
                onClick={() => setShowAllAlerts(false)} 
                className="text-gray-500 hover:text-gray-700 transition-colors duration-200 p-2 rounded-full hover:bg-gray-100"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="flex-1 p-6 overflow-auto">
              <div className="grid gap-4">
                {allAlerts.map((alert, index) => (
                  <div 
                    key={index} 
                    className={`p-4 rounded-lg border-l-4 ${
                      alert.type === 'critical' 
                        ? 'bg-red-50 border-red-500' 
                        : alert.type === 'warning' 
                        ? 'bg-yellow-50 border-yellow-500' 
                        : 'bg-green-50 border-green-500'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-3 h-3 rounded-full mt-2 flex-shrink-0 ${
                        alert.type === 'critical' 
                          ? 'bg-red-500' 
                          : alert.type === 'warning' 
                          ? 'bg-yellow-500' 
                          : 'bg-green-500'
                      }`} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-gray-900">{alert.message}</h4>
                          <Badge variant={
                            alert.type === 'critical' ? 'destructive' :
                            alert.type === 'warning' ? 'secondary' : 'default'
                          }>
                            {alert.type.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          <strong>Location:</strong> {alert.location}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span><strong>Time:</strong> {alert.time}</span>
                          <span><strong>Action:</strong> {alert.action}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">
                  Total Alerts: {allAlerts.length} • Click outside or press ESC to close
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* All Reports Modal */}
      {showAllReports && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setShowAllReports(false)}
        >
          <div 
            className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-green-50 to-emerald-50">
              <div>
                <h3 className="text-2xl font-bold text-green-900">All Reports</h3>
                <p className="text-green-700 mt-1">Complete overview of all environmental reports and incidents</p>
              </div>
              <button 
                onClick={() => setShowAllReports(false)} 
                className="text-gray-500 hover:text-gray-700 transition-colors duration-200 p-2 rounded-full hover:bg-gray-100"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="flex-1 p-6 overflow-auto">
              <div className="space-y-4">
                {reports.map((report) => (
                  <div key={report.id} className="border rounded-lg p-6 hover:shadow-md transition-all duration-200 bg-white">
                    <div className="flex items-start justify-between mb-4">
                                           <div className="space-y-2">
                       <h4 className="text-lg font-semibold text-gray-900">{report.title}</h4>
                       <div className="flex items-center gap-4 text-sm text-gray-500">
                         <span className="flex items-center gap-1">
                           <MapPin className="h-4 w-4" />
                           {report.location}
                         </span>
                         <span>•</span>
                         <span>By: Guardian User</span>
                         <span>•</span>
                         <span>{new Date(report.created_at).toLocaleDateString()}</span>
                       </div>
                     </div>
                     <div className="flex flex-col gap-2">
                       <Badge variant={
                         report.severity === 'high' ? 'destructive' :
                         report.severity === 'medium' ? 'default' :
                         report.severity === 'low' ? 'secondary' : 'outline'
                       }>
                         {report.severity}
                       </Badge>
                       <Badge variant={
                         report.status === 'pending' ? 'outline' :
                         report.status === 'verified' ? 'default' :
                         report.status === 'rejected' ? 'destructive' : 'secondary'
                       }>
                         {report.status}
                       </Badge>
                     </div>
                   </div>
                   
                   <div className="text-sm text-gray-600 mt-4">
                     <strong className="text-gray-700">Report ID:</strong>
                     <span className="ml-2 font-mono">#{report.id.slice(-4)}</span>
                   </div>
                  </div>
                ))}
                
                {reports.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium mb-2">No Reports Found</h3>
                    <p>There are currently no environmental reports in the system.</p>
                  </div>
                )}
              </div>
              
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">
                  Total Reports: {reports.length} • Click outside or press ESC to close
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Dashboard;