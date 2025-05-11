
import { useState, useEffect, useRef } from "react";
import Layout from "@/components/Layout";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { MapPin, Car, User, Users } from "lucide-react";
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

// Temporary mapbox token - in production, this should come from Supabase secrets
const MAPBOX_TOKEN = "pk.eyJ1IjoiZXhhbXBsZXRva2VuIiwiYSI6ImNrZXhhbXBsZSJ9.example";

const Location = () => {
  const { user, activeNight } = useApp();
  const [locationShared, setLocationShared] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [mapboxKey, setMapboxKey] = useState(localStorage.getItem('mapbox-key') || MAPBOX_TOKEN);
  const [showKeyInput, setShowKeyInput] = useState(!localStorage.getItem('mapbox-key'));
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const userMarker = useRef<mapboxgl.Marker | null>(null);
  const { toast } = useToast();
  
  const initializeMap = () => {
    if (!mapContainer.current || map.current) return;
    
    try {
      mapboxgl.accessToken = mapboxKey;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: userLocation || [-74.006, 40.7128], // Default to NYC if no user location
        zoom: 13
      });
      
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
      
      if (userLocation) {
        createUserMarker();
      }
    } catch (error) {
      console.error("Error initializing map:", error);
      toast({
        title: "Map error",
        description: "Unable to initialize the map. Please check your Mapbox API key.",
        variant: "destructive"
      });
      setShowKeyInput(true);
    }
  };

  const createUserMarker = () => {
    if (!map.current || !userLocation) return;

    const el = document.createElement('div');
    el.className = 'user-marker';
    el.innerHTML = `
      <div class="h-8 w-8 rounded-full bg-app-purple flex items-center justify-center text-white shadow-lg border-2 border-white">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user">
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
        </svg>
      </div>
    `;

    userMarker.current = new mapboxgl.Marker(el)
      .setLngLat(userLocation)
      .addTo(map.current);

    // Add a pulsing dot
    const pulsingDot = document.createElement('div');
    pulsingDot.className = 'pulsing-dot';
    pulsingDot.style.width = '50px';
    pulsingDot.style.height = '50px';
    pulsingDot.style.borderRadius = '50%';
    pulsingDot.style.backgroundColor = 'rgba(139, 92, 246, 0.3)';
    pulsingDot.style.animation = 'pulse 2s infinite';
    
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0% { transform: scale(0.8); opacity: 1; }
        70% { transform: scale(1.2); opacity: 0; }
        100% { transform: scale(0.8); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
    
    new mapboxgl.Marker(pulsingDot, { offset: [0, 0] })
      .setLngLat(userLocation)
      .addTo(map.current);
    
    // Center map on user location
    map.current.flyTo({
      center: userLocation,
      zoom: 15,
      essential: true
    });
  };
  
  const updateUserMarker = () => {
    if (!map.current || !userLocation) return;
    
    if (userMarker.current) {
      userMarker.current.setLngLat(userLocation);
    } else {
      createUserMarker();
    }
  };
  
  // Simulate friends' locations (in a real app, this would come from backend)
  const addFriendsToMap = () => {
    if (!map.current || !activeNight) return;
    
    const friends = activeNight.group.members.filter(m => m.id !== user.id);
    
    friends.forEach((friend, index) => {
      // Create random locations around the user for demo purposes
      const randomLng = (userLocation?.[0] || -74.006) + (Math.random() - 0.5) * 0.01;
      const randomLat = (userLocation?.[1] || 40.7128) + (Math.random() - 0.5) * 0.01;
      
      const el = document.createElement('div');
      el.className = 'friend-marker';
      
      const colors = ['#4361EE', '#3A0CA3', '#D946EF', '#4CC9F0'];
      const color = colors[index % colors.length];
      
      el.innerHTML = `
        <div class="h-6 w-6 rounded-full flex items-center justify-center text-white shadow-lg border-2 border-white"
             style="background-color: ${color}">
          ${friend.name.charAt(0)}
        </div>
      `;
      
      const popup = new mapboxgl.Popup({ offset: 25 })
        .setHTML(`
          <div class="p-2">
            <strong>${friend.name}</strong>
            <p class="text-xs text-gray-500">Last updated: just now</p>
          </div>
        `);
      
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

  const handleSetMapboxKey = (e: React.FormEvent) => {
    e.preventDefault();
    
    const input = document.getElementById('mapbox-key') as HTMLInputElement;
    const newKey = input.value.trim();
    
    if (!newKey) {
      toast({
        title: "Invalid API key",
        description: "Please enter a valid Mapbox API key",
        variant: "destructive"
      });
      return;
    }
    
    setMapboxKey(newKey);
    localStorage.setItem('mapbox-key', newKey);
    setShowKeyInput(false);
    
    // Reinitialize the map
    if (map.current) {
      map.current.remove();
      map.current = null;
    }
    
    setTimeout(() => {
      initializeMap();
    }, 100);
    
    toast({
      title: "API key saved",
      description: "Your Mapbox API key has been saved and will be used for maps."
    });
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
    if (!map.current && !showKeyInput) {
      initializeMap();
    } else if (userLocation) {
      updateUserMarker();
      if (locationShared && activeNight) {
        addFriendsToMap();
      }
    }
  }, [userLocation, locationShared, activeNight, showKeyInput]);
  
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

  const [accuracy, setAccuracy] = useState("medium");
  const [updateFrequency, setUpdateFrequency] = useState("5");
  const [shareActiveOnly, setShareActiveOnly] = useState(true);
  
  return (
    <Layout title="Location Sharing">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Your Location Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center mb-4">
              <div className={`h-3 w-3 rounded-full mr-2 ${locationShared ? 'bg-green-500 animate-pulse' : 'bg-muted'}`}></div>
              <p className="text-sm">{locationShared ? "Currently sharing your location" : "Location sharing is off"}</p>
            </div>
            <Button
              onClick={handleShareLocation}
              className={`w-full ${locationShared ? "bg-red-500 hover:bg-red-600" : "bg-app-purple hover:bg-app-blue"}`}
            >
              <MapPin className="h-5 w-5 mr-2" />
              {locationShared ? "Stop Sharing" : "Share My Location"}
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5 text-app-purple" />
              Group Map
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-hidden">
            {showKeyInput ? (
              <div className="p-4">
                <p className="text-sm text-muted-foreground mb-3">
                  You need a valid Mapbox API key to display the map. You can get one for free at <a href="https://mapbox.com" target="_blank" rel="noreferrer" className="text-app-purple hover:underline">mapbox.com</a>.
                </p>
                <form onSubmit={handleSetMapboxKey} className="space-y-4">
                  <div>
                    <label htmlFor="mapbox-key" className="text-sm font-medium">Mapbox API Key</label>
                    <input 
                      id="mapbox-key" 
                      type="text" 
                      className="w-full p-2 mt-1 border rounded-md bg-background"
                      placeholder="Enter your Mapbox public token" 
                      defaultValue={mapboxKey !== MAPBOX_TOKEN ? mapboxKey : ''}
                    />
                  </div>
                  <Button type="submit" className="w-full">Save API Key</Button>
                </form>
              </div>
            ) : (
              <div className="h-64 relative rounded-b-lg overflow-hidden">
                <div ref={mapContainer} className="absolute inset-0" />
                {!locationShared && (
                  <div className="absolute inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-10">
                    <div className="text-center p-4">
                      <MapPin className="h-10 w-10 mx-auto text-app-purple mb-2" />
                      <p className="text-muted-foreground">
                        Map is only available when location sharing is active.
                      </p>
                      <Button
                        onClick={handleShareLocation}
                        className="mt-3 bg-app-purple hover:bg-app-blue"
                        size="sm"
                      >
                        Share My Location
                      </Button>
                    </div>
                  </div>
                )}
                <div className="absolute top-2 left-2 z-20">
                  <Button 
                    size="sm" 
                    variant="secondary" 
                    className="bg-secondary/80 backdrop-blur-sm shadow"
                    onClick={() => {
                      if (userLocation && map.current) {
                        map.current.flyTo({ center: userLocation, zoom: 15 });
                      }
                    }}
                  >
                    <User className="h-4 w-4 mr-1" />
                    Center on me
                  </Button>
                </div>
              </div>
            )}
            <div className="p-3 flex justify-center">
              <Button 
                onClick={handleCallUber}
                className="bg-black hover:bg-gray-800 text-white"
                disabled={!locationShared}
              >
                <Car className="h-4 w-4 mr-2" />
                Call an Uber
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Location Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="active-only">Share with active groups only</Label>
                  <p className="text-sm text-muted-foreground">Only share location during active nights</p>
                </div>
                <Switch
                  id="active-only" 
                  checked={shareActiveOnly}
                  onCheckedChange={setShareActiveOnly}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="accuracy">Location accuracy</Label>
                <p className="text-sm text-muted-foreground">Higher accuracy uses more battery</p>
                <select 
                  id="accuracy" 
                  className="w-full p-2 rounded-md border bg-background"
                  value={accuracy}
                  onChange={(e) => setAccuracy(e.target.value)}
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="frequency">Update frequency</Label>
                <p className="text-sm text-muted-foreground">How often your location updates</p>
                <select 
                  id="frequency" 
                  className="w-full p-2 rounded-md border bg-background"
                  value={updateFrequency}
                  onChange={(e) => setUpdateFrequency(e.target.value)}
                >
                  <option value="1">1 minute</option>
                  <option value="5">5 minutes</option>
                  <option value="15">15 minutes</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Location;
