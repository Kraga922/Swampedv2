
import { useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Search, Star, Clock, Users } from "lucide-react";

const Venues = () => {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Mock data for nearby venues
  const venues = [
    {
      id: "v1",
      name: "The Underground",
      type: "Bar",
      distance: 0.3,
      rating: 4.5,
      image: "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&q=80&w=300&h=200",
      address: "123 Main St",
      openNow: true,
      crowdLevel: "Busy"
    },
    {
      id: "v2",
      name: "Skylight Club",
      type: "Nightclub",
      distance: 0.5,
      rating: 4.2,
      image: "https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?auto=format&fit=crop&q=80&w=300&h=200",
      address: "456 Park Ave",
      openNow: true,
      crowdLevel: "Very Busy"
    },
    {
      id: "v3",
      name: "Barrel & Brew",
      type: "Pub",
      distance: 0.7,
      rating: 4.7,
      image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&q=80&w=300&h=200",
      address: "789 Oak St",
      openNow: true,
      crowdLevel: "Moderate"
    },
    {
      id: "v4",
      name: "Vintage Lounge",
      type: "Bar",
      distance: 1.2,
      rating: 4.0,
      image: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&q=80&w=300&h=200",
      address: "101 Elm St",
      openNow: false,
      crowdLevel: "Closed"
    }
  ];
  
  const filteredVenues = searchQuery
    ? venues.filter(venue => 
        venue.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        venue.type.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : venues;
  
  return (
    <Layout title="Nearby Venues">
      <div className="space-y-6">
        <div className="sticky top-16 z-10 bg-app-background pt-2 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search bars, clubs, pubs..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
              <Button size="sm" variant="outline" className="rounded-full whitespace-nowrap">
                All Venues
              </Button>
              <Button size="sm" variant="outline" className="rounded-full whitespace-nowrap">
                Bars
              </Button>
              <Button size="sm" variant="outline" className="rounded-full whitespace-nowrap">
                Nightclubs
              </Button>
              <Button size="sm" variant="outline" className="rounded-full whitespace-nowrap">
                Pubs
              </Button>
              <Button size="sm" variant="outline" className="rounded-full whitespace-nowrap">
                Open Now
              </Button>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          {filteredVenues.length > 0 ? (
            filteredVenues.map(venue => (
              <Card key={venue.id} className="overflow-hidden">
                <div className="flex">
                  <div className="w-1/3 h-32 bg-gray-100">
                    {venue.image && (
                      <img 
                        src={venue.image} 
                        alt={venue.name} 
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  
                  <CardContent className="w-2/3 p-4">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-semibold text-lg">{venue.name}</h3>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm ml-1">{venue.rating}</span>
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-500">{venue.type}</div>
                    
                    <div className="flex items-center mt-2 text-sm text-gray-500">
                      <MapPin className="h-3 w-3 mr-1" />
                      <span>{venue.address} · {venue.distance} mi away</span>
                    </div>
                    
                    <div className="flex mt-3 gap-3">
                      <div className="flex items-center text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        <span className={venue.openNow ? "text-green-600" : "text-red-500"}>
                          {venue.openNow ? "Open Now" : "Closed"}
                        </span>
                      </div>
                      
                      <div className="flex items-center text-xs">
                        <Users className="h-3 w-3 mr-1" />
                        <span>{venue.crowdLevel}</span>
                      </div>
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center py-8">
              <MapPin className="h-10 w-10 mx-auto text-gray-400 mb-2" />
              <h3 className="font-medium text-gray-800">No venues found</h3>
              <p className="text-gray-500">Try adjusting your search</p>
            </div>
          )}
        </div>
        
        <div className="h-64 bg-gray-100 rounded-lg overflow-hidden">
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-500">Map view coming soon</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Venues;
