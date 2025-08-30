import React, { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useReports } from '@/hooks/useReports';
import { 
  MapPin, 
  Filter, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Satellite,
  Layers
} from 'lucide-react';
import mangroveAerial from '@/assets/mangrove-aerial.jpg';

const Map = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const { reports, loading } = useReports();
  const [filteredReports, setFilteredReports] = useState(reports);

  useEffect(() => {
    filterReports();
  }, [reports, activeFilter]);

  const filterReports = () => {
    let filtered = reports;
    
    switch (activeFilter) {
      case 'high':
        filtered = reports.filter(r => r.severity === 'high');
        break;
      case 'pending':
        filtered = reports.filter(r => r.status === 'pending');
        break;
      case 'verified':
        filtered = reports.filter(r => r.status === 'verified');
        break;
      default:
        filtered = reports;
    }
    
    setFilteredReports(filtered);
  };

  const mockReports = [
    {
      id: 1,
      title: 'Illegal Logging Activity',
      location: 'Sundarbans, Bangladesh',
      severity: 'high',
      status: 'verified',
      date: '2024-01-15',
      coordinates: [89.4, 21.9],
      reporter: 'Local Guardian Network'
    },
    {
      id: 2,
      title: 'Water Pollution Detected',
      location: 'Everglades, Florida',
      severity: 'medium',
      status: 'pending',
      date: '2024-01-12',
      coordinates: [-80.9, 25.3],
      reporter: 'Environmental Scientist'
    },
    {
      id: 3,
      title: 'Healthy Mangrove Growth',
      location: 'Great Barrier Reef, Australia',
      severity: 'low',
      status: 'verified',
      date: '2024-01-10',
      coordinates: [145.7, -16.2],
      reporter: 'Marine Biologist'
    }
  ];

  const filters = [
    { id: 'all', label: 'All Reports', count: reports.length },
    { id: 'high', label: 'High Priority', count: reports.filter(r => r.severity === 'high').length },
    { id: 'pending', label: 'Pending Review', count: reports.filter(r => r.status === 'pending').length },
    { id: 'verified', label: 'Verified', count: reports.filter(r => r.status === 'verified').length }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'secondary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Header */}
      <div className="bg-gradient-hero text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <MapPin className="h-8 w-8 text-accent" />
            <h1 className="text-3xl md:text-4xl font-bold">Interactive Map</h1>
          </div>
          <p className="text-lg text-white/90 max-w-2xl">
            Real-time monitoring of mangrove ecosystems worldwide. Track threats, 
            view reports, and monitor conservation efforts in your area.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar - Filters & Reports */}
          <div className="lg:col-span-1 space-y-6">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {filters.map((filter) => (
                  <Button
                    key={filter.id}
                    variant={activeFilter === filter.id ? 'ocean' : 'ghost'}
                    className="w-full justify-between"
                    onClick={() => setActiveFilter(filter.id)}
                  >
                    <span>{filter.label}</span>
                    <Badge variant="secondary">{filter.count}</Badge>
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Map Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5" />
                  Map Layers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Satellite className="h-4 w-4 mr-2" />
                  Satellite View
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <MapPin className="h-4 w-4 mr-2" />
                  Report Markers
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="h-4 w-4 mr-2" />
                  Time Slider
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Map Area */}
          <div className="lg:col-span-3">
            <Card className="mb-6">
              <div className="relative h-96 md:h-[500px] rounded-lg overflow-hidden">
                {/* Placeholder Map - In real app, this would be Mapbox */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10">
                  <img 
                    src={mangroveAerial} 
                    alt="Mangrove Map" 
                    className="w-full h-full object-cover opacity-50"
                  />
                  
                  {/* Map Markers */}
                  {filteredReports.slice(0, 10).map((report, index) => (
                    <div
                      key={report.id}
                      className="absolute group cursor-pointer"
                      style={{
                        left: `${20 + (index % 5) * 15}%`,
                        top: `${30 + Math.floor(index / 5) * 20}%`
                      }}
                    >
                      <div className={`w-6 h-6 rounded-full border-2 border-white shadow-lg animate-pulse bg-${getSeverityColor(report.severity)}`} />
                      
                      {/* Tooltip */}
                      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-card border border-border rounded-lg p-3 shadow-strong opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-48 z-10">
                        <h4 className="font-semibold text-sm mb-1">{report.title}</h4>
                        <p className="text-xs text-muted-foreground mb-2">{report.location}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant={getSeverityColor(report.severity) as any} className="text-xs">
                            {report.severity}
                          </Badge>
                          <Badge variant={getStatusColor(report.status) as any} className="text-xs">
                            {report.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Map Controls Overlay */}
                <div className="absolute top-4 right-4 space-y-2">
                  <Button size="icon" variant="outline" className="bg-white/90">
                    <Satellite className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="outline" className="bg-white/90">
                    <Layers className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>

            {/* Recent Reports */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredReports.slice(0, 5).map((report) => (
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
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm mb-1">{report.title}</h4>
                        <p className="text-xs text-muted-foreground mb-2">{report.location}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{new Date(report.created_at).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>Guardian User</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <Badge variant={getSeverityColor(report.severity) as any} className="text-xs">
                          {report.severity}
                        </Badge>
                        <Badge variant={getStatusColor(report.status) as any} className="text-xs">
                          {report.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
                
                {filteredReports.length === 0 && (
                  <div className="text-center py-8">
                    <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No reports found</h3>
                    <p className="text-muted-foreground">Try adjusting your filters or submit a new report.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Map;