
import { createContext, useContext, useState, ReactNode } from "react";
import { User, Group, Notification, DrinkType } from "../types/models";
import { drinkTypes } from "../data/mockData";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useRealTimeDrinks } from "@/hooks/useRealTimeDrinks";
import { useSupabaseNights } from "@/hooks/useSupabaseNights";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface AppContextProps {
  user: User;
  activeNight: any;
  pastNights: any[];
  userGroups: Group[];
  userNotifications: Notification[];
  allDrinkTypes: DrinkType[];
  realTimeDrinks: any[];
  setActiveNight: (night: any) => void;
  addDrink: (drink: any) => void;
  createGroup: (name: string, members: User[]) => void;
  startNight: (groupId: string, settings?: any) => Promise<boolean>;
  endNight: (nightId: string) => void;
  markNotificationAsRead: (notificationId: string) => void;
  addNotification: (notification: any) => void;
  getUserById: (id: string) => User | undefined;
  getDrinkTypeById: (id: string) => DrinkType | undefined;
  fetchRealTimeDrinks: () => void;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const user = useUserProfile();
  const { realTimeDrinks, fetchRealTimeDrinks } = useRealTimeDrinks();
  const { activeNight, pastNights, startNight, endNight } = useSupabaseNights();
  const { toast } = useToast();
  
  const [userGroups, setUserGroups] = useState<Group[]>([]);
  const [userNotifications, setUserNotifications] = useState<Notification[]>([]);
  const [allDrinkTypes] = useState<DrinkType[]>(drinkTypes);

  const getUserById = (id: string): User | undefined => {
    if (id === user.id) return user;
    return userGroups
      .flatMap((group) => group.members)
      .find((member) => member.id === id);
  };

  const getDrinkTypeById = (id: string): DrinkType | undefined => {
    return allDrinkTypes.find((type) => type.id === id);
  };

  const addDrink = (drink: any) => {
    console.log('Adding drink via legacy method:', drink);
  };

  const createGroup = async (name: string, members: User[]) => {
    try {
      // Create group in Supabase
      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .insert({
          name,
          created_by: user.id
        })
        .select()
        .single();

      if (groupError) throw groupError;

      // Add group members
      const groupMembers = members.map(member => ({
        group_id: groupData.id,
        user_id: member.id
      }));

      const { error: membersError } = await supabase
        .from('group_members')
        .insert(groupMembers);

      if (membersError) throw membersError;

      // Create local group object
      const newGroup: Group = {
        id: groupData.id,
        name: groupData.name,
        members: members,
        createdAt: groupData.created_at,
        createdBy: groupData.created_by,
      };
      
      setUserGroups((prevGroups) => [...prevGroups, newGroup]);
      
      toast({
        title: "Group created",
        description: `"${name}" has been created successfully.`,
      });
    } catch (error: any) {
      console.error('Error creating group:', error);
      toast({
        title: "Failed to create group",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const setActiveNight = (night: any) => {
    // This is now handled by useSupabaseNights
    console.log('setActiveNight called with:', night);
  };

  const markNotificationAsRead = (notificationId: string) => {
    setUserNotifications((prevNotifications) =>
      prevNotifications.map((notif) =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  const addNotification = (notification: any) => {
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
