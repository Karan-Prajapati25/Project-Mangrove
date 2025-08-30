import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { 
  MapPin, 
  Search, 
  Target, 
  X,
  Check,
  Loader2
} from 'lucide-react';

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

export default function LocationPicker({
  onLocationSelect,
  initialLocation,
  className = ""
}: LocationPickerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(initialLocation || null);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [userLocation, setUserLocation] = useState<Location | null>(null);

  // Get current location with optimized settings
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      return;
    }

    // Reset any previous state
    setUserLocation(null);
    setIsGettingLocation(true);
    console.log('Getting current location...');

    // Add a safety timeout to prevent infinite loading
    const safetyTimeout = setTimeout(() => {
      if (isGettingLocation) {
        console.log('Safety timeout triggered, resetting state');
        setIsGettingLocation(false);
        alert('Location acquisition timed out. Please try again.');
      }
    }, 10000);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        clearTimeout(safetyTimeout);
        console.log('Location obtained:', position);
        
        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        
        console.log('Coordinates:', pos);
        
        // Immediately set user location for instant feedback
        const userLoc: Location = {
          lat: pos.lat,
          lng: pos.lng,
          address: 'Your Current Location'
        };
        
        // Update state immediately
        setUserLocation(userLoc);
        setIsGettingLocation(false);
        
        // Also set as selected location
        setSelectedLocation(userLoc);
        onLocationSelect(userLoc);
        
        console.log('Location successfully set');
      },
      (error) => {
        clearTimeout(safetyTimeout);
        console.error('Error getting location:', error);
        setIsGettingLocation(false);
        
        let errorMessage = 'Unable to get your location.';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied. Please enable location access in your browser settings.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable. Please try again.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out. Please try again.';
            break;
          default:
            errorMessage = 'An unknown error occurred while getting your location.';
        }
        
        alert(errorMessage);
      },
      {
        enableHighAccuracy: false, // Changed to false for faster response
        timeout: 8000, // Reduced timeout for faster response
        maximumAge: 60000 // Accept cached location up to 1 minute old
      }
    );
  };

  // Clear selected location
  const clearLocation = () => {
    setSelectedLocation(null);
    setUserLocation(null);
    setSearchQuery('');
    onLocationSelect({ lat: 0, lng: 0, address: '' });
  };

  // Handle search input change
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (value.trim()) {
      // Simple search - you can implement Google Places API here if needed
      setSearchResults([]);
    } else {
      setSearchResults([]);
    }
  };

  // Cleanup effect to prevent state issues when switching tabs
  useEffect(() => {
    return () => {
      // Cleanup when component unmounts
      setIsGettingLocation(false);
      setUserLocation(null);
    };
  }, []);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Bar */}
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search for a location or use your current location"
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
            disabled={isGettingLocation}
          >
            {isGettingLocation ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Target className="h-4 w-4" />
            )}
          </Button>
        </div>
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

      {/* User Location Display */}
      {userLocation && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <Target className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="font-medium text-sm text-blue-800">Your Current Location</div>
                <div className="text-xs text-blue-600 mt-1">
                  Lat: {userLocation.lat.toFixed(6)}, Lng: {userLocation.lng.toFixed(6)}
                </div>
                <div className="text-xs text-green-600 mt-1 font-medium">
                  ✓ Location acquired successfully!
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Location Status Indicator */}
      {isGettingLocation && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-600"></div>
              <div>
                <div className="font-medium text-sm text-yellow-800">Acquiring Location...</div>
                <div className="text-xs text-yellow-600 mt-1">
                  Please wait while we get your current location
                </div>
                <div className="text-xs text-yellow-500 mt-1">
                  This usually takes 1-3 seconds
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>• Search for a location or use your current location</p>
        <p>• The selected location will be used for your report</p>
        <p>• Your current location is automatically shared when you click the location button</p>
        <p>• If the location button doesn't work, check your browser permissions and try refreshing the page</p>
      </div>

      {/* Troubleshooting Help */}
      <details className="text-xs text-gray-500">
        <summary className="cursor-pointer hover:text-gray-700 font-medium">
          Having trouble? Click here for help
        </summary>
        <div className="mt-2 space-y-1 pl-4 border-l-2 border-gray-200">
          <p><strong>Location button not working?</strong></p>
          <p>• Check if your browser has location permissions enabled</p>
          <p>• Try refreshing the page</p>
          <p>• Make sure you're using HTTPS (required for location access)</p>
          <p>• Check the browser console for error messages</p>
          <p><strong>How to enable location access:</strong></p>
          <p>• Chrome: Click the lock icon in the address bar → Site settings → Location → Allow</p>
          <p>• Firefox: Click the shield icon → Site permissions → Location → Allow</p>
          <p>• Safari: Safari → Preferences → Websites → Location → Allow</p>
        </div>
      </details>
    </div>
  );
}
