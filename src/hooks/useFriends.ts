
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

export interface Friend {
  id: string;
  name: string;
  username: string;
  avatar?: string;
}

export interface FriendRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  sender: Friend;
  receiver: Friend;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
}

export const useFriends = () => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { session } = useAuth();
  const { toast } = useToast();

  const fetchFriends = async () => {
    if (!session?.user) return;

    try {
      // For now, return empty array until the friends table is properly set up
      // This will be populated once the database schema is updated
      setFriends([]);
    } catch (error: any) {
      console.error('Error fetching friends:', error);
    }
  };

  const fetchFriendRequests = async () => {
    if (!session?.user) return;

    try {
      // For now, return empty array until the friend_requests table is properly set up
      setFriendRequests([]);
    } catch (error: any) {
      console.error('Error fetching friend requests:', error);
    }
  };

  const sendFriendRequest = async (receiverId: string) => {
    if (!session?.user) return false;

    try {
      // This will be implemented once the friend_requests table is available
      toast({
        title: 'Feature Coming Soon',
        description: 'Friend requests will be available once the database is updated.',
      });
      return true;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }
  };

  const acceptFriendRequest = async (requestId: string, senderId: string) => {
    if (!session?.user) return false;

    try {
      // This will be implemented once the tables are available
      toast({
        title: 'Feature Coming Soon',
        description: 'Friend requests will be available once the database is updated.',
      });
      return true;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }
  };

  const rejectFriendRequest = async (requestId: string) => {
    try {
      // This will be implemented once the tables are available
      return true;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }
  };

  const searchUsers = async (query: string) => {
    if (!session?.user || !query.trim()) return [];

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, username, avatar')
        .neq('id', session.user.id)
        .or(`name.ilike.%${query}%,username.ilike.%${query}%`)
        .limit(10);

      if (error) throw error;

      return data || [];
    } catch (error: any) {
      console.error('Error searching users:', error);
      return [];
    }
  };

  useEffect(() => {
    if (session?.user) {
      setLoading(true);
      Promise.all([fetchFriends(), fetchFriendRequests()]).finally(() => {
        setLoading(false);
      });
    }
  }, [session?.user]);

  return {
    friends,
    friendRequests,
    loading,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    searchUsers,
    refetch: () => Promise.all([fetchFriends(), fetchFriendRequests()])
  };
};
