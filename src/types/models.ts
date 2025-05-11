
export interface User {
  id: string;
  name: string;
  username: string;
  email?: string;
  avatar?: string;
  isAdmin?: boolean;
  isDesignatedDriver?: boolean;
  friends?: User[];
}

export interface DrinkType {
  id: string;
  name: string;
  icon: string;
  alcoholContent: number; // percentage
  standardDrinks: number; // standard drink equivalents
  volume: number; // ml
}

export interface Drink {
  id: string;
  userId: string;
  typeId: string;
  timestamp: string;
  location?: {
    name: string;
    lat?: number;
    lng?: number;
  };
  photo?: string;
}

export interface Group {
  id: string;
  name: string;
  members: User[];
  createdAt: string;
  createdBy: string;
}

export interface Night {
  id: string;
  groupId: string;
  group: Group;
  date: string;
  startTime: string;
  endTime?: string;
  drinks: Drink[];
  isActive: boolean;
  settings?: NightSettings;
  name?: string;
  mainLocation?: {
    name: string;
    lat?: number;
    lng?: number;
  };
}

export interface NightSettings {
  uberThreshold: number;
  foodThreshold: number;
  notificationThreshold: number;
}

export interface Notification {
  id: string;
  type: 'groupInvite' | 'drinkWarning' | 'rideOffer' | 'foodSuggestion' | 'message';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  senderId?: string;
  receiverId?: string;
  nightId?: string;
  actionUrl?: string;
}

export interface HealthInsight {
  lifetimeDrinks: number;
  estimatedLifeImpact: number; // years
  weeklyAverage: number;
  monthlyTrend: 'increasing' | 'decreasing' | 'stable';
  recommendations: string[];
}
