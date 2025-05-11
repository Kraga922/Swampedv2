
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, UserSession } from '@/types/models';
import { useToast } from '@/components/ui/use-toast';

interface AuthContextProps {
  session: UserSession;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  getProfile: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<UserSession>({ user: null, session: null });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession({
          user: currentSession?.user ? {
            id: currentSession.user.id,
            name: currentSession.user.user_metadata?.name || '',
            username: currentSession.user.user_metadata?.username || '',
            email: currentSession.user.email,
            avatar: currentSession.user.user_metadata?.avatar,
          } : null,
          session: currentSession,
        });
        setIsLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession({
        user: currentSession?.user ? {
          id: currentSession.user.id,
          name: currentSession.user.user_metadata?.name || '',
          username: currentSession.user.user_metadata?.username || '',
          email: currentSession.user.email,
          avatar: currentSession.user.user_metadata?.avatar,
        } : null,
        session: currentSession,
      });
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const getProfile = async (): Promise<User | null> => {
    try {
      if (!session.user) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        return {
          id: data.id,
          name: data.name,
          username: data.username,
          email: data.email,
          avatar: data.avatar,
          isAdmin: data.is_admin,
          isDesignatedDriver: data.is_designated_driver,
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) throw error;
      
      toast({
        title: "Welcome back!",
        description: "You've successfully signed in.",
      });
    } catch (error: any) {
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            name: name,
            username: email.split('@')[0],
          }
        }
      });
      
      if (error) throw error;
      
      toast({
        title: "Account created!",
        description: "Please check your email to verify your account.",
      });
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      toast({
        title: "Signed out",
        description: "You've been successfully signed out.",
      });
    } catch (error: any) {
      toast({
        title: "Sign out failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      session, 
      isLoading, 
      signIn, 
      signUp, 
      signOut,
      getProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextProps => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
