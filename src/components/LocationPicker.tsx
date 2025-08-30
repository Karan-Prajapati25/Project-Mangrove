import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Search, 
  Target, 
  Navigation,
  X,
  Check
} from 'lucide-react';
import { GOOGLE_MAPS_CONFIG } from '@/config/googleMaps';

interface Location {
  lat: number;
  lng: number;
  address: string;
}

interface LocationPickerProps {
  onLocationSelect: (location: Location) => void;
  initialLocation?: Location;
  className?: string;
}

declare global {
  interface Window {
    google: any;
  }
}

export default function LocationPicker({
  onLocationSelect,
  initialLocation,
  className = ""
}: LocationPickerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(initialLocation || null);
  const [isMapVisible, setIsMapVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const searchBoxRef = useRef<any>(null);

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

  // Initialize map when loaded
  useEffect(() => {
    if (!isLoaded || !mapRef.current) return;

    const defaultCenter = selectedLocation || { lat: 21.9, lng: 89.4, address: '' }; // Sundarbans

    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: defaultCenter.lat, lng: defaultCenter.lng },
      zoom: 13,
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
      
      // Reverse geocode to get address
      reverseGeocode(position);
    });

    // Add marker if initial location exists
    if (selectedLocation) {
      addMarker(selectedLocation);
    }

  }, [isLoaded, selectedLocation]);

  // Add marker to map
  const addMarker = (location: Location) => {
    if (markerRef.current) {
      markerRef.current.setMap(null);
    }

    const marker = new window.google.maps.Marker({
      position: { lat: location.lat, lng: location.lng },
      map: mapInstanceRef.current,
      title: location.address,
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: '#3b82f6',
        fillOpacity: 0.8,
        strokeColor: '#ffffff',
        strokeWeight: 2
      },
      animation: window.google.maps.Animation.DROP
    });

    markerRef.current = marker;
    mapInstanceRef.current.setCenter({ lat: location.lat, lng: location.lng });
  };

  // Reverse geocoding
  const reverseGeocode = async (position: { lat: number; lng: number }) => {
    if (!window.google) return;

    const geocoder = new window.google.maps.Geocoder();
    
    try {
      const response = await geocoder.geocode({ location: position });
      
      if (response.results && response.results[0]) {
        const address = response.results[0].formatted_address;
        const location: Location = {
          lat: position.lat,
          lng: position.lng,
          address
        };
        
        setSelectedLocation(location);
        addMarker(location);
        onLocationSelect(location);
      }
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
    }
  };

  // Search for locations
  const searchLocations = async () => {
    if (!searchQuery.trim() || !window.google) return;

    setIsSearching(true);
    
    try {
      const service = new window.google.maps.places.AutocompleteService();
      const response = await service.getPlacePredictions({
        input: searchQuery,
        types: ['geocode'],
        componentRestrictions: { country: 'IN' } // Restrict to India for mangrove areas
      });

      setSearchResults(response.predictions || []);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle search result selection
  const handleSearchResultSelect = async (placeId: string) => {
    if (!window.google) return;

    const service = new window.google.maps.places.PlacesService(mapInstanceRef.current);
    
    service.getDetails(
      { placeId, fields: ['geometry', 'formatted_address'] },
      (place: any, status: any) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
          const location: Location = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
            address: place.formatted_address
          };
          
          setSelectedLocation(location);
          addMarker(location);
          onLocationSelect(location);
          setSearchResults([]);
          setSearchQuery(location.address);
        }
      }
    );
  };

  // Get current location
  const getCurrentLocation = () => {
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
        
        reverseGeocode(pos);
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
  };

  // Clear selected location
  const clearLocation = () => {
    setSelectedLocation(null);
    setSearchQuery('');
    if (markerRef.current) {
      markerRef.current.setMap(null);
    }
    onLocationSelect({ lat: 0, lng: 0, address: '' });
  };

  // Handle search input change
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (value.trim()) {
      searchLocations();
    } else {
      setSearchResults([]);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Bar */}
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search for a location or click on the map..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={getCurrentLocation}
            title="Use my current location"
          >
            <Target className="h-4 w-4" />
          </Button>
        </div>

        {/* Search Results Dropdown */}
        {searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
            {searchResults.map((result) => (
              <button
                key={result.place_id}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                onClick={() => handleSearchResultSelect(result.place_id)}
              >
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-sm">{result.structured_formatting.main_text}</div>
                    <div className="text-xs text-gray-500">{result.structured_formatting.secondary_text}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Selected Location Display */}
      {selectedLocation && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <Check className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="font-medium text-sm text-green-800">Location Selected</div>
                  <div className="text-sm text-green-700 mt-1">{selectedLocation.address}</div>
                  <div className="text-xs text-green-600 mt-1">
                    Lat: {selectedLocation.lat.toFixed(6)}, Lng: {selectedLocation.lng.toFixed(6)}
                  </div>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={clearLocation}
                className="text-green-600 hover:text-green-800"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Map Toggle */}
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Map View</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsMapVisible(!isMapVisible)}
        >
          {isMapVisible ? 'Hide Map' : 'Show Map'}
        </Button>
      </div>

      {/* Interactive Map */}
      {isMapVisible && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Click on the map to select a location</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoaded ? (
              <div ref={mapRef} className="h-64 rounded-lg" />
            ) : (
              <div className="h-64 flex items-center justify-center bg-gray-100 rounded-lg">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                  <p className="text-sm text-gray-600">Loading map...</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>• Search for a location or use your current location</p>
        <p>• Click on the map to select a specific point</p>
        <p>• The selected location will be used for your report</p>
      </div>
    </div>
  );
}
