
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { User, Group, Night, Notification, Drink, DrinkType, NightSettings } from "../types/models";
import { drinkTypes } from "../data/mockData";
import { calculateBAC, shouldCallUber, shouldOrderFood, shouldNotify } from "../utils/drinkUtils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface AppContextProps {
  user: User;
  activeNight: Night | null;
  pastNights: Night[];
  userGroups: Group[];
  userNotifications: Notification[];
  allDrinkTypes: DrinkType[];
  realTimeDrinks: Drink[];
  setActiveNight: (night: Night | null) => void;
  addDrink: (drink: Omit<Drink, "id">) => void;
  createGroup: (name: string, members: User[]) => void;
  startNight: (groupId: string, settings?: NightSettings) => void;
  endNight: (nightId: string) => void;
  markNotificationAsRead: (notificationId: string) => void;
  addNotification: (notification: Omit<Notification, "id" | "timestamp" | "read">) => void;
  getUserById: (id: string) => User | undefined;
  getDrinkTypeById: (id: string) => DrinkType | undefined;
  fetchRealTimeDrinks: () => void;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const { session } = useAuth();
  
  // Initialize with clean, empty state - no dummy data
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
  
  const [allNights, setAllNights] = useState<Night[]>([]);
  const [userGroups, setUserGroups] = useState<Group[]>([]);
  const [userNotifications, setUserNotifications] = useState<Notification[]>([]);
  const [allDrinkTypes, setAllDrinkTypes] = useState<DrinkType[]>(drinkTypes);
  const [realTimeDrinks, setRealTimeDrinks] = useState<Drink[]>([]);

  // Initialize user data from session
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

  // Fetch real-time drinks from database for current active night only
  const fetchRealTimeDrinks = async () => {
    if (!session?.user) return;

    try {
      // Only fetch drinks for the current active night
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

  // Listen for real-time updates to drinks for active night only
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

  // Get active night if there is one (should only be current session)
  const activeNight = allNights.find((night) => night.isActive) || null;
  
  // Get past nights sorted by date (clean history)
  const pastNights = allNights
    .filter((night) => !night.isActive)
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

  // Get user by ID
  const getUserById = (id: string): User | undefined => {
    if (id === user.id) return user;
    return userGroups
      .flatMap((group) => group.members)
      .find((member) => member.id === id);
  };

  // Get drink type by ID
  const getDrinkTypeById = (id: string): DrinkType | undefined => {
    return allDrinkTypes.find((type) => type.id === id);
  };

  // Add a new drink (for backward compatibility)
  const addDrink = (drink: Omit<Drink, "id">) => {
    // This is mainly for mock data compatibility
    // Real drinks should be added via the database
    console.log('Adding drink via legacy method:', drink);
  };

  // Create a new group
  const createGroup = (name: string, members: User[]) => {
    const newGroup: Group = {
      id: `g${Date.now()}`,
      name,
      members: [...members],
      createdAt: new Date().toISOString(),
      createdBy: user.id,
    };
    
    setUserGroups((prevGroups) => [...prevGroups, newGroup]);
  };

  const startNight = (groupId: string, settings?: NightSettings) => {
    const group = userGroups.find((g) => g.id === groupId);
    if (!group) return;
    
    // End any existing active night
    if (activeNight) {
      endNight(activeNight.id);
    }
    
    const defaultSettings: NightSettings = {
      uberThreshold: 4,
      foodThreshold: 3,
      notificationThreshold: 5,
    };
    
    const newNight: Night = {
      id: `n${Date.now()}`,
      groupId,
      group,
      date: new Date().toISOString().split("T")[0],
      startTime: new Date().toISOString(),
      drinks: [],
      isActive: true,
      settings: settings || defaultSettings,
    };
    
    setAllNights((prevNights) => [newNight, ...prevNights]);
    
    // Clear previous drinks when starting new night
    setRealTimeDrinks([]);
  };

  const endNight = (nightId: string) => {
    setAllNights((prevNights) =>
      prevNights.map((night) =>
        night.id === nightId
          ? { ...night, isActive: false, endTime: new Date().toISOString() }
          : night
      )
    );
    
    // Clear real-time drinks when night ends
    setRealTimeDrinks([]);
  };

  const markNotificationAsRead = (notificationId: string) => {
    setUserNotifications((prevNotifications) =>
      prevNotifications.map((notif) =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  const addNotification = (notification: Omit<Notification, "id" | "timestamp" | "read">) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif${Date.now()}`,
      timestamp: new Date().toISOString(),
      read: false,
    };
    
    setUserNotifications((prevNotifications) => [
      newNotification,
      ...prevNotifications,
    ]);
  };

  const setActiveNight = (night: Night | null) => {
    setAllNights((prevNights) =>
      prevNights.map((n) =>
        n.id === night?.id ? { ...n, isActive: true } : { ...n, isActive: false }
      )
    );
  };

  return (
    <AppContext.Provider
      value={{
        user,
        activeNight,
        pastNights,
        userGroups,
        userNotifications,
        allDrinkTypes,
        realTimeDrinks,
        setActiveNight,
        addDrink,
        createGroup,
        startNight,
        endNight,
        markNotificationAsRead,
        addNotification,
        getUserById,
        getDrinkTypeById,
        fetchRealTimeDrinks,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextProps => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
