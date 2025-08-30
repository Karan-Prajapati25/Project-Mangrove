import { useState, useEffect, useCallback } from 'react';
import { GOOGLE_MAPS_API_KEY } from '@/config/googleMaps';

interface Location {
  lat: number;
  lng: number;
}

interface PlaceResult {
  place_id: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: () => number;
      lng: () => number;
    };
  };
}

export const useGoogleMaps = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (window.google && window.google.maps) {
      setIsLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,geometry`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      setIsLoaded(true);
    };

    script.onerror = () => {
      setError('Failed to load Google Maps API');
    };

    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const getCurrentLocation = useCallback((): Promise<Location> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser.'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          reject(new Error(`Geolocation error: ${error.message}`));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        }
      );
    });
  }, []);

  const geocodeAddress = useCallback(async (address: string): Promise<Location | null> => {
    if (!isLoaded || !window.google) return null;

    return new Promise((resolve) => {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const location = results[0].geometry.location;
          resolve({
            lat: location.lat(),
            lng: location.lng(),
          });
        } else {
          resolve(null);
        }
      });
    });
  }, [isLoaded]);

  const reverseGeocode = useCallback(async (location: Location): Promise<string | null> => {
    if (!isLoaded || !window.google) return null;

    return new Promise((resolve) => {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          resolve(results[0].formatted_address);
        } else {
          resolve(null);
        }
      });
    });
  }, [isLoaded]);

  const searchPlaces = useCallback(async (query: string, location?: Location): Promise<PlaceResult[]> => {
    if (!isLoaded || !window.google) return [];

    return new Promise((resolve) => {
      const service = new window.google.maps.places.PlacesService(
        document.createElement('div')
      );

      const request: any = {
        query,
        fields: ['place_id', 'formatted_address', 'geometry'],
      };

      if (location) {
        request.location = new window.google.maps.LatLng(location.lat, location.lng);
        request.radius = 50000; // 50km radius
      }

      service.textSearch(request, (results, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
          resolve(results);
        } else {
          resolve([]);
        }
      });
    });
  }, [isLoaded]);

  const calculateDistance = useCallback((point1: Location, point2: Location): number => {
    if (!isLoaded || !window.google) return 0;

    const lat1 = window.google.maps.geometry.spherical.computeDistanceBetween(
      new window.google.maps.LatLng(point1.lat, point1.lng),
      new window.google.maps.LatLng(point2.lat, point2.lng)
    );

    return lat1; // Distance in meters
  }, [isLoaded]);

  return {
    isLoaded,
    error,
    getCurrentLocation,
    geocodeAddress,
    reverseGeocode,
    searchPlaces,
    calculateDistance,
  };
};

// Type declarations for Google Maps API
declare global {
  interface Window {
    google: {
      maps: {
        Map: any;
        Marker: any;
        InfoWindow: any;
        LatLng: any;
        Geocoder: any;
        places: {
          PlacesService: any;
          PlacesServiceStatus: {
            OK: string;
          };
        };
        geometry: {
          spherical: {
            computeDistanceBetween: (point1: any, point2: any) => number;
          };
        };
      };
    };
  }
}