
import { useState, useEffect } from 'react';

interface LocationState {
  loading: boolean;
  error: string | null;
  location: {
    lat: number;
    lng: number;
    name: string;
  } | null;
}

export const useLocation = (autoTrack: boolean = false) => {
  const [state, setState] = useState<LocationState>({
    loading: true,
    error: null,
    location: null
  });

  const getLocationName = async (lat: number, lng: number): Promise<string> => {
    try {
      // Use reverse geocoding to get location name
      // For simplicity, we'll use a free API without API key requirements
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await response.json();
      
      if (data.error) {
        return "Unknown location";
      }
      
      // Extract the place name (usually a venue or building)
      const locationName = data.name || 
                          data.address?.cafe || 
                          data.address?.pub || 
                          data.address?.bar || 
                          data.address?.restaurant || 
                          data.address?.road || 
                          "Unknown location";
      
      return locationName;
    } catch (error) {
      console.error("Error getting location name:", error);
      return "Unknown location";
    }
  };

  const getCurrentLocation = () => {
    setState(prev => ({ ...prev, loading: true }));

    if (!navigator.geolocation) {
      setState({
        loading: false,
        error: "Geolocation is not supported by your browser",
        location: null
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const locationName = await getLocationName(latitude, longitude);
        
        setState({
          loading: false,
          error: null,
          location: {
            lat: latitude,
            lng: longitude,
            name: locationName
          }
        });
      },
      (error) => {
        setState({
          loading: false,
          error: `Unable to retrieve your location: ${error.message}`,
          location: null
        });
      }
    );
  };

  useEffect(() => {
    if (autoTrack) {
      getCurrentLocation();
    }
  }, [autoTrack]);

  return {
    ...state,
    getCurrentLocation
  };
};
