
import { useState } from "react";
import Layout from "@/components/Layout";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";

const Location = () => {
  const { user, activeNight } = useApp();
  const [locationShared, setLocationShared] = useState(false);
  
  const handleShareLocation = () => {
    // In a real app, this would request location permissions and share the location
    setLocationShared(true);
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
          <div className="h-64 bg-gray-100 flex items-center justify-center">
            {activeNight ? (
              <div className="text-center p-4">
                <MapPin className="h-10 w-10 mx-auto text-app-purple mb-2" />
                <p className="text-gray-500">
                  Map is only available when location sharing is active.
                </p>
                {!locationShared && (
                  <Button
                    onClick={handleShareLocation}
                    className="mt-3 bg-app-purple hover:bg-app-dark-blue"
                    size="sm"
                  >
                    Share My Location
                  </Button>
                )}
              </div>
            ) : (
              <p className="text-gray-500">
                Start a night to see group locations
              </p>
            )}
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
