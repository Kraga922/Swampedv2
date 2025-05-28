
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { User } from '@/types/models';

export const useUserProfile = () => {
  const { session } = useAuth();
  const [user, setUser] = useState<User>({
    id: '',
    name: '',
    username: '',
    email: '',
    avatar: '',
    isAdmin: false,
    isDesignatedDriver: false,
    friends: []
  });

  useEffect(() => {
    if (session?.user) {
      setUser({
        id: session.user.id,
        name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || '',
        username: session.user.user_metadata?.username || session.user.email?.split('@')[0] || '',
        email: session.user.email || '',
        avatar: session.user.user_metadata?.avatar || '',
        isAdmin: false,
        isDesignatedDriver: false,
        friends: []
      });
    }
  }, [session]);

  return user;
};
