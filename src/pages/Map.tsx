import React, { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import GoogleMap from '@/components/GoogleMap';
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
  Layers,
  Info
} from 'lucide-react';

interface MapMarker {
  id: string;
  position: {
    lat: number;
    lng: number;
  };
  title: string;
  description: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Pending' | 'Investigating' | 'Resolved' | 'Dismissed';
  type: string;
  date: string;
  reporter: string;
  evidence?: string[];
}

const Map = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const { reports, loading } = useReports();
  const [filteredReports, setFilteredReports] = useState(reports);
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);
  const [mapCenter, setMapCenter] = useState({ lat: 21.9, lng: 89.4 }); // Sundarbans

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

  // Convert reports to map markers
  const mapMarkers: MapMarker[] = filteredReports.map(report => ({
    id: report.id,
    position: {
      lat: report.latitude || 21.9,
      lng: report.longitude || 89.4
    },
    title: report.title,
    description: report.description || 'No description available',
    severity: report.severity as 'Low' | 'Medium' | 'High' | 'Critical',
    status: report.status as 'Pending' | 'Investigating' | 'Resolved' | 'Dismissed',
    type: report.incident_type,
    date: report.created_at,
    reporter: 'Guardian User',
    evidence: report.evidence_urls || []
  }));

  // Handle marker click
  const handleMarkerClick = (marker: MapMarker) => {
    setSelectedMarker(marker);
    setMapCenter(marker.position);
  };

  // Handle map click
  const handleMapClick = (position: { lat: number; lng: number }) => {
    console.log('Map clicked at:', position);
    // You can add functionality here, like opening a form to create a new report
  };

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

            {/* Selected Marker Info */}
            {selectedMarker && (
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    Selected Report
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-sm mb-1">{selectedMarker.title}</h4>
                    <p className="text-xs text-muted-foreground mb-2">{selectedMarker.description}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant={getSeverityColor(selectedMarker.severity) as any} className="text-xs">
                        {selectedMarker.severity}
                      </Badge>
                      <Badge variant={getStatusColor(selectedMarker.status) as any} className="text-xs">
                        {selectedMarker.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <p>Type: {selectedMarker.type}</p>
                    <p>Date: {new Date(selectedMarker.date).toLocaleDateString()}</p>
                    <p>Reporter: {selectedMarker.reporter}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Main Map Area */}
          <div className="lg:col-span-3">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Mangrove Ecosystem Monitor
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Click on markers to view report details. Use the controls to navigate and change map view.
                </p>
              </CardHeader>
              <CardContent>
                <GoogleMap
                  markers={mapMarkers}
                  center={mapCenter}
                  zoom={10}
                  onMarkerClick={handleMarkerClick}
                  onMapClick={handleMapClick}
                  className="h-96 md:h-[500px]"
                />
              </CardContent>
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