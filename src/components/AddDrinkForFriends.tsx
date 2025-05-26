
import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useLocation } from '@/hooks/useLocation';
import { supabase } from '@/integrations/supabase/client';
import AddDrinkDialog from './AddDrinkDialog';

const AddDrinkForFriends = () => {
  const [open, setOpen] = useState(false);
  const [selectedDrinkType, setSelectedDrinkType] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeNightData, setActiveNightData] = useState<any>(null);
  
  const { allDrinkTypes, fetchRealTimeDrinks } = useApp();
  const { session } = useAuth();
  const { toast } = useToast();
  const { loading, error, location, getCurrentLocation } = useLocation(false);

  useEffect(() => {
    if (session?.user && open) {
      getCurrentLocation();
      fetchCurrentUser();
      fetchActiveNight();
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

  const availableUsers = currentUser ? [{
    id: currentUser.id,
    name: currentUser.name || 'You',
    username: currentUser.username || '',
    avatar: currentUser.avatar
  }] : [];

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
      
      fetchRealTimeDrinks();
      
      setOpen(false);
      setSelectedDrinkType('');
      setSelectedUserId('');
      
    } catch (error: any) {
      console.error('Error adding drink:', error);
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
      
      <AddDrinkDialog
        open={open}
        onOpenChange={setOpen}
        availableUsers={availableUsers}
        allDrinkTypes={allDrinkTypes}
        selectedUserId={selectedUserId}
        setSelectedUserId={setSelectedUserId}
        selectedDrinkType={selectedDrinkType}
        setSelectedDrinkType={setSelectedDrinkType}
        onAddDrink={handleAddDrink}
        location={location}
        loading={loading}
        error={error}
        getCurrentLocation={getCurrentLocation}
      />
    </>
  );
};

export default AddDrinkForFriends;
