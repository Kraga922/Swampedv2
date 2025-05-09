
import { User, DrinkType, Drink, Group, Night, Notification, HealthInsight } from "../types/models";

export const currentUser: User = {
  id: "u1",
  name: "Alex Johnson",
  username: "alex_j",
  avatar: "/avatar.png",
  isAdmin: false,
  isDesignatedDriver: false,
};

export const users: User[] = [
  currentUser,
  {
    id: "u2",
    name: "Jamie Smith",
    username: "jamie_s",
    avatar: "/avatar2.png",
    isAdmin: true,
    isDesignatedDriver: false,
  },
  {
    id: "u3",
    name: "Taylor Wilson",
    username: "taylor_w",
    avatar: "/avatar3.png",
    isAdmin: false,
    isDesignatedDriver: true,
  },
  {
    id: "u4",
    name: "Casey Brown",
    username: "casey_b",
    avatar: "/avatar4.png",
    isAdmin: false,
    isDesignatedDriver: false,
  },
  {
    id: "u5",
    name: "Jordan Lee",
    username: "jordan_l",
    avatar: "/avatar5.png",
    isAdmin: false,
    isDesignatedDriver: false,
  },
];

export const drinkTypes: DrinkType[] = [
  {
    id: "dt1",
    name: "Beer",
    icon: "🍺",
    alcoholContent: 5,
    standardDrinks: 1,
    volume: 355,
  },
  {
    id: "dt2",
    name: "Wine",
    icon: "🍷",
    alcoholContent: 12,
    standardDrinks: 1.5,
    volume: 150,
  },
  {
    id: "dt3",
    name: "Cocktail",
    icon: "🍸",
    alcoholContent: 15,
    standardDrinks: 2,
    volume: 180,
  },
  {
    id: "dt4",
    name: "Shot",
    icon: "🥃",
    alcoholContent: 40,
    standardDrinks: 1.5,
    volume: 45,
  },
  {
    id: "dt5",
    name: "Cider",
    icon: "🍎",
    alcoholContent: 4.5,
    standardDrinks: 0.8,
    volume: 330,
  },
  {
    id: "dt6",
    name: "Seltzer",
    icon: "🥂",
    alcoholContent: 5,
    standardDrinks: 1,
    volume: 355,
  },
];

export const generateDrinks = (count: number, users: User[], nightId: string): Drink[] => {
  const drinks: Drink[] = [];
  const now = new Date();
  const locations = ["The Pub", "Rooftop Bar", "Club Downtown", "Tiki Lounge", "Sports Bar"];
  
  for (let i = 0; i < count; i++) {
    const randomUser = users[Math.floor(Math.random() * users.length)];
    const randomDrink = drinkTypes[Math.floor(Math.random() * drinkTypes.length)];
    const randomLocation = locations[Math.floor(Math.random() * locations.length)];
    const randomTime = new Date(now.getTime() - Math.random() * 5 * 60 * 60 * 1000);
    
    drinks.push({
      id: `d${nightId}-${i}`,
      userId: randomUser.id,
      typeId: randomDrink.id,
      timestamp: randomTime.toISOString(),
      location: {
        name: randomLocation,
      }
    });
  }
  
  return drinks.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export const groups: Group[] = [
  {
    id: "g1",
    name: "Weekend Crew",
    members: [users[0], users[1], users[2]],
    createdAt: "2023-09-15T20:00:00Z",
    createdBy: "u1",
  },
  {
    id: "g2",
    name: "College Buddies",
    members: [users[0], users[3], users[4]],
    createdAt: "2023-08-20T19:30:00Z",
    createdBy: "u3",
  },
  {
    id: "g3",
    name: "Solo",
    members: [users[0]],
    createdAt: "2023-07-10T18:45:00Z",
    createdBy: "u1",
  }
];

export const nights: Night[] = [
  {
    id: "n1",
    groupId: "g1",
    group: groups[0],
    date: "2025-05-06",
    startTime: "2025-05-06T20:00:00Z",
    endTime: "2025-05-07T02:30:00Z",
    drinks: generateDrinks(12, [users[0], users[1], users[2]], "n1"),
    isActive: false,
    settings: {
      uberThreshold: 4,
      foodThreshold: 3,
      notificationThreshold: 5,
    },
  },
  {
    id: "n2",
    groupId: "g2",
    group: groups[1],
    date: "2025-04-29",
    startTime: "2025-04-29T21:00:00Z",
    endTime: "2025-04-30T01:00:00Z",
    drinks: generateDrinks(8, [users[0], users[3], users[4]], "n2"),
    isActive: false,
    settings: {
      uberThreshold: 3,
      foodThreshold: 2,
      notificationThreshold: 4,
    },
  },
  {
    id: "n3",
    groupId: "g1",
    group: groups[0],
    date: "2025-04-20",
    startTime: "2025-04-20T19:30:00Z",
    endTime: "2025-04-21T00:45:00Z",
    drinks: generateDrinks(15, [users[0], users[1], users[2]], "n3"),
    isActive: false,
    settings: {
      uberThreshold: 4,
      foodThreshold: 3,
      notificationThreshold: 5,
    },
  },
  {
    id: "n4",
    groupId: "g3",
    group: groups[2],
    date: "2025-05-08",
    startTime: "2025-05-08T21:30:00Z",
    drinks: generateDrinks(2, [users[0]], "n4"),
    isActive: true,
    settings: {
      uberThreshold: 3,
      foodThreshold: 2,
      notificationThreshold: 4,
    },
  },
];

export const notifications: Notification[] = [
  {
    id: "notif1",
    type: "groupInvite",
    title: "Group Invitation",
    message: "Jamie invited you to join 'Downtown Explorers'",
    timestamp: "2025-05-09T14:30:00Z",
    read: false,
    senderId: "u2",
    receiverId: "u1",
  },
  {
    id: "notif2",
    type: "drinkWarning",
    title: "Drink Threshold Alert",
    message: "You've reached your notification threshold (5 drinks)",
    timestamp: "2025-05-06T23:15:00Z",
    read: true,
    receiverId: "u1",
    nightId: "n1",
  },
  {
    id: "notif3",
    type: "rideOffer",
    title: "Need a ride?",
    message: "Taylor (Designated Driver) is offering rides home",
    timestamp: "2025-05-06T01:20:00Z",
    read: false,
    senderId: "u3",
    receiverId: "u1",
    nightId: "n1",
  },
  {
    id: "notif4",
    type: "foodSuggestion",
    title: "Time to grab food?",
    message: "You've had 3 drinks. Want to order some food?",
    timestamp: "2025-05-08T22:45:00Z",
    read: false,
    receiverId: "u1",
    nightId: "n4",
    actionUrl: "ubereats://",
  },
];

export const healthInsight: HealthInsight = {
  lifetimeDrinks: 243,
  estimatedLifeImpact: 0.8,
  weeklyAverage: 4.5,
  monthlyTrend: "decreasing",
  recommendations: [
    "Try alternating alcoholic drinks with water",
    "Consider alcohol-free days during the week",
    "Set drink limits before going out",
  ],
};
