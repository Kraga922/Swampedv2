
import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Beer, Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const AddDrinkForm = () => {
  const { user, activeNight, allDrinkTypes, addDrink } = useApp();
  const [open, setOpen] = useState(false);
  const [selectedTypeId, setSelectedTypeId] = useState("");
  const { toast } = useToast();
  
  const handleAddDrink = async () => {
    if (!selectedTypeId || !activeNight) return;
    
    try {
      // Get user's current location
      let locationData = null;
      
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
          });
        });
        
        const { latitude, longitude } = position.coords;
        
        // In a real app, you would use a reverse geocoding service to get the location name
        // For now, we'll just use a placeholder
        locationData = {
          name: "Current Location",
          lat: latitude,
          lng: longitude,
        };
      } catch (error) {
        console.error("Error getting location:", error);
        // Continue without location data
      }
      
      const newDrink = {
        userId: user.id,
        typeId: selectedTypeId,
        timestamp: new Date().toISOString(),
        location: locationData,
      };
      
      addDrink(newDrink);
      setSelectedTypeId("");
      setOpen(false);
      
      toast({
        title: "Drink added",
        description: "Your drink has been logged successfully.",
      });
    } catch (error) {
      console.error("Error adding drink:", error);
      toast({
        title: "Error adding drink",
        description: "There was a problem logging your drink.",
        variant: "destructive",
      });
    }
  };
  
  if (!activeNight) return null;
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-full h-10 w-10 p-0 bg-app-purple hover:bg-app-blue">
          <Plus className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a Drink</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="drinkType" className="text-sm font-medium">
              Drink Type
            </label>
            <Select
              value={selectedTypeId}
              onValueChange={setSelectedTypeId}
            >
              <SelectTrigger id="drinkType">
                <SelectValue placeholder="Select a drink type" />
              </SelectTrigger>
              <SelectContent>
                {allDrinkTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    <div className="flex items-center">
                      <span className="mr-2">{type.icon}</span>
                      <span>{type.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p className="flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              Location will be automatically logged
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={handleAddDrink}
            disabled={!selectedTypeId}
            className="w-full bg-app-purple hover:bg-app-blue"
          >
            <Beer className="mr-2 h-4 w-4" />
            Add Drink
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddDrinkForm;
