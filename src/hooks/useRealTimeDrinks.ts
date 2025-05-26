
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Drink } from '@/types/models';

export const useRealTimeDrinks = () => {
  const { session } = useAuth();
  const [realTimeDrinks, setRealTimeDrinks] = useState<Drink[]>([]);

  const fetchRealTimeDrinks = async () => {
    if (!session?.user) return;

    try {
      const { data: activeNightData, error: nightError } = await supabase
        .from('nights')
        .select('id')
        .eq('is_active', true)
        .maybeSingle();

      if (nightError) throw nightError;

      if (!activeNightData) {
        setRealTimeDrinks([]);
        return;
      }

      const { data, error } = await supabase
        .from('drinks')
        .select(`
          *,
          profiles!drinks_user_id_fkey (
            name,
            username
          )
        `)
        .eq('night_id', activeNightData.id)
        .order('timestamp', { ascending: false });

      if (error) throw error;

      const formattedDrinks: Drink[] = data?.map(drink => ({
        id: drink.id,
        userId: drink.user_id,
        typeId: drink.type_id,
        timestamp: drink.timestamp || new Date().toISOString(),
        location: drink.location_name ? {
          name: drink.location_name,
          lat: drink.location_lat,
          lng: drink.location_lng
        } : undefined,
        photo: drink.photo,
        userName: drink.profiles?.name || 'Unknown User'
      })) || [];

      setRealTimeDrinks(formattedDrinks);
    } catch (error: any) {
      console.error('Error fetching real-time drinks:', error);
      setRealTimeDrinks([]);
    }
  };

  useEffect(() => {
    if (!session?.user) return;

    fetchRealTimeDrinks();

    const channel = supabase
      .channel('drinks-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'drinks'
        },
        () => {
          fetchRealTimeDrinks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.user]);

  return {
    realTimeDrinks,
    fetchRealTimeDrinks
  };
};
