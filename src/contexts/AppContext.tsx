
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { User, Group, Night, Notification, Drink, DrinkType, NightSettings } from "../types/models";
import { currentUser, groups, nights, notifications, drinkTypes } from "../data/mockData";
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
  const [user, setUser] = useState<User>(currentUser);
  const [allNights, setAllNights] = useState<Night[]>(nights);
  const [userGroups, setUserGroups] = useState<Group[]>(groups);
  const [userNotifications, setUserNotifications] = useState<Notification[]>(notifications);
  const [allDrinkTypes, setAllDrinkTypes] = useState<DrinkType[]>(drinkTypes);
  const [realTimeDrinks, setRealTimeDrinks] = useState<Drink[]>([]);

  // Fetch real-time drinks from database
  const fetchRealTimeDrinks = async () => {
    if (!session?.user) return;

    try {
      const { data, error } = await supabase
        .from('drinks')
        .select(`
          *,
          profiles!drinks_user_id_fkey (
            name,
            username
          )
        `)
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
    }
  };

  // Listen for real-time updates to drinks
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

  // Get active night if there is one
  const activeNight = allNights.find((night) => night.isActive) || null;
  
  // Get past nights sorted by date
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

  // Add a new drink (legacy method for mock data compatibility)
  const addDrink = (drink: Omit<Drink, "id">) => {
    if (!activeNight) return;
    
    const newDrink: Drink = {
      ...drink,
      id: `d${activeNight.id}-${activeNight.drinks.length + 1}`,
    };
    
    const updatedNight = {
      ...activeNight,
      drinks: [newDrink, ...activeNight.drinks],
    };
    
    setAllNights((prevNights) =>
      prevNights.map((night) =>
        night.id === activeNight.id ? updatedNight : night
      )
    );
    
    // Check thresholds and send notifications if needed
    const userBac = calculateBAC(updatedNight.drinks, user.id);
    
    if (activeNight.settings) {
      if (shouldCallUber(userBac, activeNight.settings.uberThreshold)) {
        addNotification({
          type: "rideOffer",
          title: "Time for a ride?",
          message: "You've reached your Uber threshold. Need a ride home?",
          receiverId: user.id,
          nightId: activeNight.id,
          actionUrl: "uber://",
        });
      }
      
      if (shouldOrderFood(userBac, activeNight.settings.foodThreshold)) {
        addNotification({
          type: "foodSuggestion",
          title: "Hungry?",
          message: "You've reached your food threshold. Order something to eat?",
          receiverId: user.id,
          nightId: activeNight.id,
          actionUrl: "ubereats://",
        });
      }
      
      if (shouldNotify(userBac, activeNight.settings.notificationThreshold)) {
        addNotification({
          type: "drinkWarning",
          title: "Drink Count Alert",
          message: `You've had ${updatedNight.drinks.filter(d => d.userId === user.id).length} drinks tonight. Consider slowing down.`,
          receiverId: user.id,
          nightId: activeNight.id,
        });
      }
    }
  };

  // Create a new group
  const createGroup = (name: string, members: User[]) => {
    const newGroup: Group = {
      id: `g${userGroups.length + 1}`,
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
    
    if (activeNight) {
      endNight(activeNight.id);
    }
    
    const defaultSettings: NightSettings = {
      uberThreshold: 4,
      foodThreshold: 3,
      notificationThreshold: 5,
    };
    
    const newNight: Night = {
      id: `n${allNights.length + 1}`,
      groupId,
      group,
      date: new Date().toISOString().split("T")[0],
      startTime: new Date().toISOString(),
      drinks: [],
      isActive: true,
      settings: settings || defaultSettings,
    };
    
    setAllNights((prevNights) => [newNight, ...prevNights]);
    
    group.members.forEach((member) => {
      if (member.id !== user.id) {
        addNotification({
          type: "message",
          title: "Night Started",
          message: `${user.name} has started a night with ${group.name}`,
          receiverId: member.id,
          nightId: newNight.id,
        });
      }
    });
  };

  const endNight = (nightId: string) => {
    setAllNights((prevNights) =>
      prevNights.map((night) =>
        night.id === nightId
          ? { ...night, isActive: false, endTime: new Date().toISOString() }
          : night
      )
    );
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
      id: `notif${userNotifications.length + 1}`,
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
