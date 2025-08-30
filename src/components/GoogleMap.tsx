import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GOOGLE_MAPS_CONFIG } from '@/config/googleMaps';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Navigation, 
  Layers, 
  Satellite, 
  Target,
  ZoomIn,
  ZoomOut,
  Filter,
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

interface GoogleMapProps {
  markers: MapMarker[];
  center?: { lat: number; lng: number };
  zoom?: number;
  onMarkerClick?: (marker: MapMarker) => void;
  onMapClick?: (position: { lat: number; lng: number }) => void;
  className?: string;
}

declare global {
  interface Window {
    google: any;
  }
}

export default function GoogleMap({
  markers,
  center = { lat: 21.9, lng: 89.4 }, // Default to Sundarbans
  zoom = 10,
  onMarkerClick,
  onMapClick,
  className = "h-96 md:h-[500px]"
}: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'hybrid' | 'terrain'>('roadmap');
  const [showInfoWindow, setShowInfoWindow] = useState<string | null>(null);
  const [currentZoom, setCurrentZoom] = useState(zoom);

  // Load Google Maps API
  useEffect(() => {
    if (window.google && window.google.maps) {
      setIsLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_CONFIG.apiKey}&libraries=places,geometry`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      setIsLoaded(true);
    };

    script.onerror = () => {
      console.error('Failed to load Google Maps API');
    };

    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  // Initialize map
  useEffect(() => {
    if (!isLoaded || !mapRef.current) return;

    const map = new window.google.maps.Map(mapRef.current, {
      center,
      zoom,
      mapTypeId: mapType,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      styles: [
        {
          featureType: 'water',
          elementType: 'geometry',
          stylers: [{ color: '#193341' }]
        },
        {
          featureType: 'landscape',
          elementType: 'geometry',
          stylers: [{ color: '#2c5a71' }]
        },
        {
          featureType: 'road',
          elementType: 'geometry',
          stylers: [{ color: '#29768a' }]
        },
        {
          featureType: 'poi',
          elementType: 'geometry',
          stylers: [{ color: '#406d80' }]
        },
        {
          featureType: 'transit',
          elementType: 'geometry',
          stylers: [{ color: '#406d80' }]
        },
        {
          featureType: 'administrative',
          elementType: 'geometry.stroke',
          stylers: [{ color: '#4a90a4' }]
        }
      ]
    });

    mapInstanceRef.current = map;

    // Add click listener to map
    map.addListener('click', (event: any) => {
      const position = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng()
      };
      onMapClick?.(position);
    });

    // Add zoom change listener
    map.addListener('zoom_changed', () => {
      setCurrentZoom(map.getZoom());
    });

  }, [isLoaded, center, zoom, mapType, onMapClick]);

  // Update map type when changed
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setMapTypeId(mapType);
    }
  }, [mapType]);

  // Add markers to map
  useEffect(() => {
    if (!isLoaded || !mapInstanceRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Add new markers
    markers.forEach(markerData => {
      const marker = new window.google.maps.Marker({
        position: markerData.position,
        map: mapInstanceRef.current,
        title: markerData.title,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: getSeverityColor(markerData.severity),
          fillOpacity: 0.8,
          strokeColor: '#ffffff',
          strokeWeight: 2
        },
        animation: window.google.maps.Animation.DROP
      });

      // Create info window
      const infoWindow = new window.google.maps.InfoWindow({
        content: createInfoWindowContent(markerData)
      });

      // Add click listener to marker
      marker.addListener('click', () => {
        onMarkerClick?.(markerData);
        infoWindow.open(mapInstanceRef.current, marker);
      });

      markersRef.current.push(marker);
    });

  }, [isLoaded, markers, onMarkerClick]);

  // Get current location
  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setCenter(pos);
          mapInstanceRef.current.setZoom(15);
        }
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Unable to get your location.');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  }, []);

  // Zoom controls
  const zoomIn = useCallback(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setZoom(mapInstanceRef.current.getZoom() + 1);
    }
  }, []);

  const zoomOut = useCallback(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setZoom(mapInstanceRef.current.getZoom() - 1);
    }
  }, []);

  // Helper functions
  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'Critical': return '#dc2626';
      case 'High': return '#ea580c';
      case 'Medium': return '#d97706';
      case 'Low': return '#16a34a';
      default: return '#6b7280';
    }
  };

  const createInfoWindowContent = (marker: MapMarker): string => {
    return `
      <div class="p-3 max-w-xs">
        <h3 class="font-semibold text-lg mb-2">${marker.title}</h3>
        <p class="text-sm text-gray-600 mb-3">${marker.description}</p>
        <div class="space-y-2">
          <div class="flex items-center gap-2">
            <span class="text-xs font-medium">Type:</span>
            <span class="text-xs">${marker.type}</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs font-medium">Severity:</span>
            <span class="text-xs px-2 py-1 rounded-full" style="background-color: ${getSeverityColor(marker.severity)}; color: white;">
              ${marker.severity}
            </span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs font-medium">Status:</span>
            <span class="text-xs">${marker.status}</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs font-medium">Date:</span>
            <span class="text-xs">${new Date(marker.date).toLocaleDateString()}</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs font-medium">Reporter:</span>
            <span class="text-xs">${marker.reporter}</span>
          </div>
        </div>
      </div>
    `;
  };

  if (!isLoaded) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-100 rounded-lg`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Google Maps...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Map Container */}
      <div ref={mapRef} className={`${className} rounded-lg`} />
      
      {/* Map Controls */}
      <div className="absolute top-4 left-4 space-y-2">
        <Button
          size="icon"
          variant="outline"
          className="bg-white/90 hover:bg-white shadow-lg"
          onClick={zoomIn}
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="outline"
          className="bg-white/90 hover:bg-white shadow-lg"
          onClick={zoomOut}
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
      </div>

      {/* Map Type Controls */}
      <div className="absolute top-4 right-4 space-y-2">
        <Button
          size="icon"
          variant="outline"
          className={`bg-white/90 hover:bg-white shadow-lg ${mapType === 'satellite' ? 'bg-primary text-white' : ''}`}
          onClick={() => setMapType('satellite')}
          title="Satellite View"
        >
          <Satellite className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="outline"
          className={`bg-white/90 hover:bg-white shadow-lg ${mapType === 'roadmap' ? 'bg-primary text-white' : ''}`}
          onClick={() => setMapType('roadmap')}
          title="Road Map"
        >
          <Layers className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="outline"
          className="bg-white/90 hover:bg-white shadow-lg"
          onClick={getCurrentLocation}
          title="My Location"
        >
          <Target className="h-4 w-4" />
        </Button>
      </div>

      {/* Zoom Level Display */}
      <div className="absolute bottom-4 left-4 bg-white/90 px-3 py-1 rounded-lg shadow-lg">
        <span className="text-sm font-medium">Zoom: {currentZoom}</span>
      </div>

      {/* Map Legend */}
      <div className="absolute bottom-4 right-4 bg-white/90 p-3 rounded-lg shadow-lg">
        <div className="text-sm font-medium mb-2">Severity Levels</div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-600"></div>
            <span className="text-xs">Critical</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-600"></div>
            <span className="text-xs">High</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-600"></div>
            <span className="text-xs">Medium</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-600"></div>
            <span className="text-xs">Low</span>
          </div>
        </div>
      </div>
    </div>
  );
}
