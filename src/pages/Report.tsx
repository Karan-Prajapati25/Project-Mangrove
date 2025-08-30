import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useReports } from '@/hooks/useReports';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';
import { 
  Camera, 
  MapPin, 
  Upload, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Smartphone,
  Satellite
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Report = () => {
  const [formData, setFormData] = useState({
    incidentType: '',
    description: '',
    location: '',
    evidence: null as File | null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gpsLocation, setGpsLocation] = useState<{ lat: number; lng: number } | null>(null);
  const { toast } = useToast();
  const { submitReport } = useReports();
  const { getCurrentLocation, reverseGeocode } = useGoogleMaps();

  const incidentTypes = [
    { value: 'deforestation', label: 'Illegal Deforestation', icon: '🪓' },
    { value: 'pollution', label: 'Water Pollution', icon: '💧' },
    { value: 'construction', label: 'Illegal Construction', icon: '🏗️' },
    { value: 'dumping', label: 'Waste Dumping', icon: '🗑️' },
    { value: 'fishing', label: 'Illegal Fishing', icon: '🎣' },
    { value: 'positive', label: 'Positive Conservation', icon: '🌱' }
  ];


  const handleGetCurrentLocation = async () => {
    try {
      const location = await getCurrentLocation();
      setGpsLocation(location);
      
      // Get human-readable address
      const address = await reverseGeocode(location);
      if (address) {
        setFormData({ ...formData, location: address });
      }
      
      toast({
        title: "Location captured",
        description: `GPS coordinates: ${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`,
      });
    } catch (error) {
      toast({
        title: "Location error",
        description: "Unable to get your current location. Please enter manually.",
        variant: "destructive"
      });
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData({ ...formData, evidence: file });
      toast({
        title: "File uploaded",
        description: `${file.name} has been attached to your report.`,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate required fields
    if (!formData.incidentType || !formData.description) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      setIsSubmitting(false);
      return;
    }

    const reportData = {
      title: `${formData.incidentType} Report`,
      description: formData.description,
      incident_type: formData.incidentType,
      location: formData.location || 'Location not specified',
      latitude: gpsLocation?.lat,
      longitude: gpsLocation?.lng,
      evidence_urls: formData.evidence ? [formData.evidence.name] : []
    };

    const success = await submitReport(reportData);

    if (success) {
      // Reset form
      setFormData({
        incidentType: '',
        description: '',
        location: '',
        evidence: null
      });
      setGpsLocation(null);
    }

    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Header */}
      <div className="bg-gradient-hero text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <Camera className="h-8 w-8 text-accent" />
            <h1 className="text-3xl md:text-4xl font-bold">Submit Report</h1>
          </div>
          <p className="text-lg text-white/90 max-w-2xl">
            Help protect mangrove ecosystems by reporting threats or positive conservation 
            activities. Your contributions make a real difference.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Report Details</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Incident Type */}
                  <div>
                    <Label htmlFor="incidentType">Incident Type</Label>
                    <Select value={formData.incidentType} onValueChange={(value) => setFormData({ ...formData, incidentType: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select incident type" />
                      </SelectTrigger>
                      <SelectContent>
                        {incidentTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              <span>{type.icon}</span>
                              <span>{type.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>


                  {/* Location */}
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <div className="flex gap-2">
                      <Input
                        id="location"
                        placeholder="Enter location or use GPS"
                        value={gpsLocation ? `${gpsLocation.lat.toFixed(6)}, ${gpsLocation.lng.toFixed(6)}` : formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="flex-1"
                      />
                      <Button type="button" onClick={handleGetCurrentLocation} variant="outline" size="icon">
                        <MapPin className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Provide detailed description of the incident..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                    />
                  </div>

                  {/* Evidence Upload */}
                  <div>
                    <Label htmlFor="evidence">Evidence (Photos/Videos)</Label>
                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors duration-300">
                      <input
                        type="file"
                        id="evidence"
                        accept="image/*,video/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <label htmlFor="evidence" className="cursor-pointer">
                        <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground mb-1">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Images and videos up to 10MB
                        </p>
                      </label>
                      {formData.evidence && (
                        <div className="mt-3 p-2 bg-accent/10 rounded border">
                          <p className="text-sm font-medium">{formData.evidence.name}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button 
                    type="submit" 
                    className="w-full" 
                    variant="hero" 
                    size="lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Clock className="h-5 w-5 animate-spin" />
                        Processing Report...
                      </>
                    ) : (
                      <>
                        <Camera className="h-5 w-5" />
                        Submit Report
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Process Steps */}
            <Card>
              <CardHeader>
                <CardTitle>Report Process</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gradient-ocean rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">Submit Report</h4>
                    <p className="text-xs text-muted-foreground">Provide incident details and evidence</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gradient-ocean rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">AI Analysis</h4>
                    <p className="text-xs text-muted-foreground">Automated quality check and classification</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gradient-ocean rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">Expert Review</h4>
                    <p className="text-xs text-muted-foreground">Validation by conservation experts</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gradient-ocean rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">4</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">Action Taken</h4>
                    <p className="text-xs text-muted-foreground">Alerts sent to relevant authorities</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card>
              <CardHeader>
                <CardTitle>Reporting Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2">
                  <Smartphone className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm">Use your phone's camera for high-quality evidence</p>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm">Enable GPS for accurate location tagging</p>
                </div>
                <div className="flex items-start gap-2">
                  <Satellite className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm">Include multiple angles and wide shots when possible</p>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Report #2851 verified</p>
                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">High priority alert sent</p>
                    <p className="text-xs text-muted-foreground">4 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Report #2849 under review</p>
                    <p className="text-xs text-muted-foreground">6 hours ago</p>
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

export default Report;