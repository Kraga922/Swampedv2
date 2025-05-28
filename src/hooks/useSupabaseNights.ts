
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Night, Group, NightSettings } from '@/types/models';

export const useSupabaseNights = () => {
  const { session } = useAuth();
  const [activeNight, setActiveNight] = useState<Night | null>(null);
  const [pastNights, setPastNights] = useState<Night[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActiveNight = async () => {
    if (!session?.user) return;

    try {
      const { data: nightData, error } = await supabase
        .from('nights')
        .select(`
          *,
          groups (
            id,
            name,
            created_by,
            created_at
          )
        `)
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;

      if (nightData) {
        // Fetch group members
        const { data: membersData, error: membersError } = await supabase
          .from('group_members')
          .select(`
            profiles (
              id,
              name,
              username,
              avatar,
              is_admin,
              is_designated_driver
            )
          `)
          .eq('group_id', nightData.group_id);

        if (membersError) throw membersError;

        const members = membersData?.map(m => ({
          id: (m.profiles as any).id,
          name: (m.profiles as any).name || 'Unknown',
          username: (m.profiles as any).username || '',
          email: '',
          avatar: (m.profiles as any).avatar,
          isAdmin: (m.profiles as any).is_admin || false,
          isDesignatedDriver: (m.profiles as any).is_designated_driver || false,
          friends: []
        })) || [];

        const group: Group = {
          id: (nightData.groups as any).id,
          name: (nightData.groups as any).name,
          members,
          createdAt: (nightData.groups as any).created_at,
          createdBy: (nightData.groups as any).created_by
        };

        const night: Night = {
          id: nightData.id,
          groupId: nightData.group_id,
          group,
          date: nightData.date,
          startTime: nightData.start_time,
          endTime: nightData.end_time,
          drinks: [], // Drinks will be fetched separately by useRealTimeDrinks
          isActive: nightData.is_active,
          settings: {
            uberThreshold: 4,
            foodThreshold: 3,
            notificationThreshold: 5
          },
          mainLocation: nightData.main_location
        };

        setActiveNight(night);
      } else {
        setActiveNight(null);
      }
    } catch (error: any) {
      console.error('Error fetching active night:', error);
      setActiveNight(null);
    }
  };

  const fetchPastNights = async () => {
    if (!session?.user) return;

    try {
      const { data: nightsData, error } = await supabase
        .from('nights')
        .select(`
          *,
          groups (
            id,
            name,
            created_by,
            created_at
          )
        `)
        .eq('is_active', false)
        .order('start_time', { ascending: false });

      if (error) throw error;

      // For now, just set empty past nights since we need group members too
      setPastNights([]);
    } catch (error: any) {
      console.error('Error fetching past nights:', error);
      setPastNights([]);
    }
  };

  const startNight = async (groupId: string, settings?: NightSettings) => {
    if (!session?.user) return false;

    try {
      // End any existing active nights first
      await supabase
        .from('nights')
        .update({ is_active: false, end_time: new Date().toISOString() })
        .eq('is_active', true);

      // Create new night
      const { data: nightData, error } = await supabase
        .from('nights')
        .insert({
          group_id: groupId,
          is_active: true,
          start_time: new Date().toISOString(),
          date: new Date().toISOString().split('T')[0]
        })
        .select()
        .single();

      if (error) throw error;

      // Fetch the active night data
      await fetchActiveNight();
      return true;
    } catch (error: any) {
      console.error('Error starting night:', error);
      return false;
    }
  };

  const endNight = async (nightId: string) => {
    try {
      const { error } = await supabase
        .from('nights')
        .update({ 
          is_active: false, 
          end_time: new Date().toISOString() 
        })
        .eq('id', nightId);

      if (error) throw error;

      setActiveNight(null);
      await fetchPastNights();
    } catch (error: any) {
      console.error('Error ending night:', error);
    }
  };

  useEffect(() => {
    if (session?.user) {
      setLoading(true);
      Promise.all([fetchActiveNight(), fetchPastNights()]).finally(() => {
        setLoading(false);
      });
    }
  }, [session?.user]);

  return {
    activeNight,
    pastNights,
    loading,
    startNight,
    endNight,
    fetchActiveNight
  };
};
