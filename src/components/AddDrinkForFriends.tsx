
import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Plus, User } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';
import { useLocation } from '@/hooks/useLocation';
import { useFriends } from '@/hooks/useFriends';
import { supabase } from '@/integrations/supabase/client';

const AddDrinkForFriends = () => {
  const [open, setOpen] = useState(false);
  const [selectedDrinkType, setSelectedDrinkType] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const { activeNight, allDrinkTypes } = useApp();
  const { session } = useAuth();
  const { friends } = useFriends();
  const { toast } = useToast();
  const { loading, error, location, getCurrentLocation } = useLocation(false);

  // Get current user profile
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    if (session?.user && open) {
      getCurrentLocation();
      fetchCurrentUser();
    }
  }, [session?.user, open]);

  const fetchCurrentUser = async () => {
    if (!session?.user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error) throw error;
      setCurrentUser(data);
    } catch (error: any) {
      console.error('Error fetching user profile:', error);
    }
  };

  // Get active night data
  const [activeNightData, setActiveNightData] = useState<any>(null);

  useEffect(() => {
    if (open) {
      fetchActiveNight();
    }
  }, [open]);

  const fetchActiveNight = async () => {
    if (!session?.user) return;

    try {
      const { data, error } = await supabase
        .from('nights')
        .select('*')
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;
      setActiveNightData(data);
    } catch (error: any) {
      console.error('Error fetching active night:', error);
    }
  };

  const availableUsers = [
    ...(currentUser ? [{
      id: currentUser.id,
      name: currentUser.name || 'You',
      username: currentUser.username || '',
      avatar: currentUser.avatar
    }] : []),
    ...friends
  ];

  const handleAddDrink = async () => {
    if (!selectedDrinkType || !selectedUserId) {
      toast({
        title: 'Missing information',
        description: 'Please select both a drink type and a person.',
        variant: 'destructive',
      });
      return;
    }
    
    if (!session?.user) {
      toast({
        title: 'Authentication required',
        description: 'You need to be logged in to add drinks.',
        variant: 'destructive',
      });
      return;
    }

    if (!activeNightData) {
      toast({
        title: 'No active night',
        description: 'Please start a night first before adding drinks.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      const timestamp = new Date().toISOString();
      
      const newDrink = {
        user_id: selectedUserId,
        type_id: selectedDrinkType,
        night_id: activeNightData.id,
        timestamp: timestamp,
        location_name: location?.name,
        location_lat: location?.lat,
        location_lng: location?.lng,
      };
      
      const { error } = await supabase
        .from('drinks')
        .insert(newDrink);
      
      if (error) throw error;

      const selectedUser = availableUsers.find(u => u.id === selectedUserId);
      const drinkType = allDrinkTypes.find(t => t.id === selectedDrinkType);
      
      toast({
        title: 'Drink added!',
        description: `Added ${drinkType?.name} for ${selectedUser?.name}${location ? ' with location' : ''}.`,
      });
      
      setOpen(false);
      setSelectedDrinkType('');
      setSelectedUserId('');
      
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
              <label className="text-sm font-medium">Who is drinking?</label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a person" />
                </SelectTrigger>
                <SelectContent>
                  {availableUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      <div className="flex items-center">
                        <Avatar className="h-6 w-6 mr-2">
                          {user.avatar ? (
                            <AvatarImage src={user.avatar} alt={user.name} />
                          ) : (
                            <AvatarFallback className="bg-app-purple text-white text-xs">
                              {user.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <span>{user.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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
                <User className="h-5 w-5 text-gray-500 mr-2" />
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
                <User className="h-4 w-4 mr-2" />
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

export default AddDrinkForFriends;
