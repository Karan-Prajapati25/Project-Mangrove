// Google Maps API configuration
export const GOOGLE_MAPS_API_KEY = "AIzaSyB6RjjvabBqSEbZNJBktfBVjyixeb8wpUE";

// API endpoints and configurations
export const GOOGLE_MAPS_CONFIG = {
  apiKey: GOOGLE_MAPS_API_KEY,
  libraries: ['places', 'geometry'] as const,
} as const;

export default GOOGLE_MAPS_CONFIG;
