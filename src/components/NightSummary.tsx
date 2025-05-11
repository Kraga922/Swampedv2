
import { useNavigate } from "react-router-dom";
import { formatDate, formatTime } from "@/utils/drinkUtils";
import { Night } from "@/types/models";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, ChevronRight, MapPin, Users, Camera } from "lucide-react";
import PhotoSlideshow from "./PhotoSlideshow";

interface NightSummaryProps {
  night: Night;
}

const NightSummary = ({ night }: NightSummaryProps) => {
  const navigate = useNavigate();
  
  // Mock photo URLs (in a real app, these would come from night.photos)
  const mockPhotos = night.id === "night-1" 
    ? [
        "https://images.unsplash.com/photo-1541532713592-79a0317b6b77?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8YmFyfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60",
        "https://images.unsplash.com/photo-1470337458703-46ad1756a187?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGJhcnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60",
        "https://images.unsplash.com/photo-1485872299829-c673f5194813?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGJhcnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60"
      ]
    : night.id === "night-2"
    ? [
        "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8YmFyfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60",
        "https://images.unsplash.com/photo-1539639885136-56332d18071d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzR8fGJhcnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60"
      ]
    : [];
  
  // Get night name or use a default
  const nightName = night.name || `Night with ${night.group.name}`;
  
  return (
    <Card className="overflow-hidden">
      {mockPhotos.length > 0 && (
        <PhotoSlideshow photos={mockPhotos} />
      )}
      
      <div className="p-4">
        <h3 className="text-lg font-medium mb-2">{nightName}</h3>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <CalendarDays className="h-4 w-4 mr-1" />
            <span>{formatDate(night.startTime)}</span>
            <span className="mx-1">•</span>
            <span>{formatTime(night.startTime)}</span>
          </div>
          
          {night.mainLocation && (
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{night.mainLocation.name}</span>
            </div>
          )}
          
          <div className="flex items-center text-sm text-muted-foreground">
            <Users className="h-4 w-4 mr-1" />
            <span>{night.group.members.length} people</span>
            <span className="mx-1">•</span>
            <span>{night.drinks.length} drinks</span>
          </div>
          
          {mockPhotos.length > 0 && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Camera className="h-4 w-4 mr-1" />
              <span>{mockPhotos.length} photos</span>
            </div>
          )}
        </div>
        
        <div className="flex justify-between">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate(`/night/${night.id}/gallery`)}
            disabled={mockPhotos.length === 0}
          >
            View Photos
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="ml-2"
            onClick={() => navigate(`/night/${night.id}`)}
          >
            Details
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default NightSummary;
