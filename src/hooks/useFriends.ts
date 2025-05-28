
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
      // Query the friends table and get the profile data for each friend
      const { data: friendsData, error } = await supabase
        .from('friends')
        .select('friend_id')
        .eq('user_id', session.user.id)
        .eq('status', 'accepted');

      if (error) throw error;

      if (friendsData && friendsData.length > 0) {
        const friendIds = friendsData.map(f => f.friend_id);
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, name, username, avatar')
          .in('id', friendIds);

        if (profilesError) throw profilesError;
        setFriends(profilesData || []);
      } else {
        setFriends([]);
      }
    } catch (error: any) {
      console.error('Error fetching friends:', error);
      setFriends([]);
    }
  };

  const fetchFriendRequests = async () => {
    if (!session?.user) return;

    try {
      const { data: requestsData, error } = await supabase
        .from('friend_requests')
        .select('id, sender_id, receiver_id, status, created_at')
        .or(`sender_id.eq.${session.user.id},receiver_id.eq.${session.user.id}`)
        .eq('status', 'pending');

      if (error) throw error;

      if (requestsData && requestsData.length > 0) {
        // Get sender and receiver profile data
        const userIds = [...new Set([
          ...requestsData.map(r => r.sender_id),
          ...requestsData.map(r => r.receiver_id)
        ])];

        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, name, username, avatar')
          .in('id', userIds);

        if (profilesError) throw profilesError;

        const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || []);

        const formattedRequests: FriendRequest[] = requestsData.map(request => ({
          id: request.id,
          sender_id: request.sender_id,
          receiver_id: request.receiver_id,
          status: request.status as 'pending' | 'accepted' | 'rejected',
          created_at: request.created_at,
          sender: profilesMap.get(request.sender_id) || { id: request.sender_id, name: 'Unknown', username: 'unknown' },
          receiver: profilesMap.get(request.receiver_id) || { id: request.receiver_id, name: 'Unknown', username: 'unknown' }
        }));

        setFriendRequests(formattedRequests);
      } else {
        setFriendRequests([]);
      }
    } catch (error: any) {
      console.error('Error fetching friend requests:', error);
      setFriendRequests([]);
    }
  };

  const sendFriendRequest = async (receiverId: string) => {
    if (!session?.user) return false;

    try {
      const { error } = await supabase
        .from('friend_requests')
        .insert({
          sender_id: session.user.id,
          receiver_id: receiverId,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: 'Friend request sent!',
        description: 'Your friend request has been sent.',
      });

      fetchFriendRequests();
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
      // Update request status
      const { error: updateError } = await supabase
        .from('friend_requests')
        .update({ status: 'accepted' })
        .eq('id', requestId);

      if (updateError) throw updateError;

      // Create friendship entries for both users
      const { error: friendError } = await supabase
        .from('friends')
        .insert([
          { user_id: session.user.id, friend_id: senderId, status: 'accepted' },
          { user_id: senderId, friend_id: session.user.id, status: 'accepted' }
        ]);

      if (friendError) throw friendError;

      toast({
        title: 'Friend request accepted!',
        description: 'You are now friends.',
      });

      fetchFriends();
      fetchFriendRequests();
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
      const { error } = await supabase
        .from('friend_requests')
        .update({ status: 'rejected' })
        .eq('id', requestId);

      if (error) throw error;

      fetchFriendRequests();
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
