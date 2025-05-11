
import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Plus, MapPin } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useLocation } from '@/hooks/useLocation';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const AddDrinkWithLocation = () => {
  const [open, setOpen] = useState(false);
  const [selectedDrinkType, setSelectedDrinkType] = useState('');
  const { activeNight, allDrinkTypes } = useApp();
  const { session } = useAuth();
  const { toast } = useToast();
  const { loading, error, location, getCurrentLocation } = useLocation(false);

  // Get location when dialog opens
  useEffect(() => {
    if (open) {
      getCurrentLocation();
    }
  }, [open]);
  
  const handleAddDrink = async () => {
    if (!selectedDrinkType) {
      toast({
        title: 'Missing information',
        description: 'Please select a drink type.',
        variant: 'destructive',
      });
      return;
    }
    
    if (!session.user) {
      toast({
        title: 'Authentication required',
        description: 'You need to be logged in to add drinks.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      const timestamp = new Date().toISOString();
      
      const newDrink = {
        user_id: session.user.id,
        type_id: selectedDrinkType,
        timestamp: timestamp,
        location_name: location?.name,
        location_lat: location?.lat,
        location_lng: location?.lng,
      };
      
      const { error } = await supabase
        .from('drinks')
        .insert(newDrink);
      
      if (error) throw error;
      
      toast({
        title: 'Drink added!',
        description: `Your drink has been logged${location ? ' with location' : ''}.`,
      });
      
      setOpen(false);
      setSelectedDrinkType('');
      
    } catch (error: any) {
      toast({
        title: 'Failed to add drink',
        description: error.message,
        variant: 'destructive',
      });
    }
  };
  
  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="rounded-full h-12 w-12 p-0 fixed right-6 bottom-20 shadow-lg bg-app-purple hover:bg-app-dark-blue"
      >
        <Plus className="h-6 w-6" />
      </Button>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add a Drink</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Drink Type</label>
              <Select value={selectedDrinkType} onValueChange={setSelectedDrinkType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a drink" />
                </SelectTrigger>
                <SelectContent>
                  {allDrinkTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      <span className="flex items-center">
                        <span className="mr-2">{type.icon}</span>
                        <span>{type.name}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Location</label>
              <div className="flex items-center p-3 bg-gray-50 rounded-md">
                <MapPin className="h-5 w-5 text-gray-500 mr-2" />
                {loading ? (
                  <p className="text-gray-500">Getting your location...</p>
                ) : error ? (
                  <p className="text-red-500 text-sm">{error}</p>
                ) : location ? (
                  <p className="text-sm">{location.name}</p>
                ) : (
                  <p className="text-gray-500">No location data</p>
                )}
              </div>
              
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                className="w-full mt-2"
                onClick={getCurrentLocation}
                disabled={loading}
              >
                <MapPin className="h-4 w-4 mr-2" />
                {loading ? 'Getting location...' : 'Update location'}
              </Button>
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddDrink}>
              Add Drink
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddDrinkWithLocation;
