
import { useState, useEffect, useRef } from "react";
import Layout from "@/components/Layout";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { MapPin, Car } from "lucide-react";
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useToast } from "@/components/ui/use-toast";

// Temporary mapbox token - in production, this should come from Supabase secrets
const MAPBOX_TOKEN = "pk.eyJ1IjoiZXhhbXBsZXRva2VuIiwiYSI6ImNrZXhhbXBsZSJ9.example";

const Location = () => {
  const { user, activeNight } = useApp();
  const [locationShared, setLocationShared] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const userMarker = useRef<mapboxgl.Marker | null>(null);
  const { toast } = useToast();
  
  const initializeMap = () => {
    if (!mapContainer.current || map.current) return;
    
    mapboxgl.accessToken = MAPBOX_TOKEN;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: userLocation || [-74.006, 40.7128], // Default to NYC if no user location
      zoom: 13
    });
    
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    
    if (userLocation) {
      userMarker.current = new mapboxgl.Marker({ color: '#7209B7' })
        .setLngLat(userLocation)
        .addTo(map.current);
    }
  };
  
  const updateUserMarker = () => {
    if (!map.current || !userLocation) return;
    
    if (userMarker.current) {
      userMarker.current.setLngLat(userLocation);
    } else {
      userMarker.current = new mapboxgl.Marker({ color: '#7209B7' })
        .setLngLat(userLocation)
        .addTo(map.current);
    }
    
    // Center map on user location
    map.current.flyTo({
      center: userLocation,
      zoom: 15
    });
  };
  
  // Simulate friends' locations (in a real app, this would come from backend)
  const addFriendsToMap = () => {
    if (!map.current || !activeNight) return;
    
    const friends = activeNight.group.members.filter(m => m.id !== user.id);
    
    friends.forEach(friend => {
      // Create random locations around the user for demo purposes
      const randomLng = (userLocation?.[0] || -74.006) + (Math.random() - 0.5) * 0.01;
      const randomLat = (userLocation?.[1] || 40.7128) + (Math.random() - 0.5) * 0.01;
      
      const el = document.createElement('div');
      el.className = 'friend-marker';
      el.style.width = '20px';
      el.style.height = '20px';
      el.style.borderRadius = '50%';
      el.style.backgroundColor = '#4361EE';
      el.style.border = '2px solid #fff';
      
      const popup = new mapboxgl.Popup({ offset: 25 })
        .setHTML(`<strong>${friend.name}</strong><br>Last updated: just now`);
      
      new mapboxgl.Marker(el)
        .setLngLat([randomLng, randomLat])
        .setPopup(popup)
        .addTo(map.current);
    });
  };
  
  const handleShareLocation = () => {
    if (locationShared) {
      // Stop sharing location
      setLocationShared(false);
      toast({
        title: "Location sharing disabled",
        description: "You are no longer sharing your location with your group."
      });
      return;
    }
    
    // Request user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { longitude, latitude } = position.coords;
          setUserLocation([longitude, latitude]);
          setLocationShared(true);
          
          toast({
            title: "Location sharing enabled",
            description: "Your location is now visible to your group members."
          });
          
          // In a real app, this is where you'd send location to Supabase
          console.log("Saving location to database:", [longitude, latitude]);
        },
        (error) => {
          console.error("Error getting location:", error);
          toast({
            title: "Location error",
            description: "Unable to access your location. Please check your device settings.",
            variant: "destructive"
          });
        }
      );
    } else {
      toast({
        title: "Location not supported",
        description: "Your browser does not support geolocation.",
        variant: "destructive"
      });
    }
  };
  
  // Set up real-time location tracking
  useEffect(() => {
    let watchId: number;
    
    if (locationShared) {
      // Continuous location tracking
      if (navigator.geolocation) {
        watchId = navigator.geolocation.watchPosition(
          (position) => {
            const { longitude, latitude } = position.coords;
            setUserLocation([longitude, latitude]);
            
            // In a real app, update location in Supabase
            console.log("Updating location in database:", [longitude, latitude]);
          },
          (error) => console.error("Error watching location:", error),
          { enableHighAccuracy: true }
        );
      }
    }
    
    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [locationShared]);
  
  // Initialize and update map
  useEffect(() => {
    if (!map.current) {
      initializeMap();
    } else if (userLocation) {
      updateUserMarker();
      if (locationShared && activeNight) {
        addFriendsToMap();
      }
    }
  }, [userLocation, locationShared, activeNight]);
  
  // Cleanup map on unmount
  useEffect(() => {
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);
  
  const handleCallUber = () => {
    if (!userLocation) {
      toast({
        title: "Location required",
        description: "Please enable location sharing to call an Uber",
        variant: "destructive"
      });
      return;
    }
    
    // In a real app, this would use the Uber API
    window.open(`https://m.uber.com/ul/?pickup=my_location`, '_blank');
    
    toast({
      title: "Opening Uber",
      description: "Redirecting you to Uber to book a ride."
    });
  };
  
  return (
    <Layout title="Location Sharing">
      <div className="space-y-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <h2 className="font-semibold mb-2">Your Location Status</h2>
          <div className="flex items-center mb-4">
            <div className={`h-3 w-3 rounded-full mr-2 ${locationShared ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
            <p>{locationShared ? "Currently sharing your location" : "Location sharing is off"}</p>
          </div>
          <Button
            onClick={handleShareLocation}
            className={locationShared ? "bg-red-500 hover:bg-red-600 w-full" : "bg-app-purple hover:bg-app-dark-blue w-full"}
          >
            <MapPin className="h-5 w-5 mr-2" />
            {locationShared ? "Stop Sharing" : "Share My Location"}
          </Button>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="font-semibold">Group Map</h2>
          </div>
          <div className="h-64 relative">
            <div ref={mapContainer} className="absolute inset-0" />
            {!locationShared && (
              <div className="absolute inset-0 bg-gray-100/80 flex items-center justify-center z-10">
                <div className="text-center p-4">
                  <MapPin className="h-10 w-10 mx-auto text-app-purple mb-2" />
                  <p className="text-gray-500">
                    Map is only available when location sharing is active.
                  </p>
                  <Button
                    onClick={handleShareLocation}
                    className="mt-3 bg-app-purple hover:bg-app-dark-blue"
                    size="sm"
                  >
                    Share My Location
                  </Button>
                </div>
              </div>
            )}
          </div>
          <div className="p-2 bg-gray-50 flex justify-center">
            <Button 
              onClick={handleCallUber}
              className="bg-black hover:bg-gray-800 text-white"
            >
              <Car className="h-4 w-4 mr-2" />
              Call an Uber
            </Button>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <h2 className="font-semibold mb-3">Location Settings</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Share with active groups only</p>
                <p className="text-sm text-gray-500">Only share location during active nights</p>
              </div>
              <input type="checkbox" checked className="h-4 w-4" />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Location accuracy</p>
                <p className="text-sm text-gray-500">High accuracy uses more battery</p>
              </div>
              <select className="border rounded p-1 text-sm">
                <option>High</option>
                <option selected>Medium</option>
                <option>Low</option>
              </select>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Update frequency</p>
                <p className="text-sm text-gray-500">How often your location updates</p>
              </div>
              <select className="border rounded p-1 text-sm">
                <option>1 minute</option>
                <option selected>5 minutes</option>
                <option>15 minutes</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Location;
