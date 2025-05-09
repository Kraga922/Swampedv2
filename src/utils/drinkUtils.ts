
import { Drink, DrinkType, User } from "../types/models";
import { drinkTypes } from "../data/mockData";

// Default values for estimation
const DEFAULT_WEIGHT_KG = 70;
const DEFAULT_GENDER_CONSTANT = 0.68; // Male constant, 0.55 for females
const METABOLISM_RATE = 0.015; // BAC decrease per hour

export const getDrinkTypeById = (id: string): DrinkType | undefined => {
  return drinkTypes.find((type) => type.id === id);
};

export const calculateTotalDrinks = (drinks: Drink[]): number => {
  return drinks.length;
};

export const calculateDrinkCountByType = (drinks: Drink[]): Record<string, number> => {
  const counts: Record<string, number> = {};
  
  drinks.forEach((drink) => {
    if (!counts[drink.typeId]) {
      counts[drink.typeId] = 0;
    }
    counts[drink.typeId]++;
  });
  
  return counts;
};

export const calculateUserDrinks = (drinks: Drink[], userId: string): Drink[] => {
  return drinks.filter((drink) => drink.userId === userId);
};

export const calculateBAC = (
  drinks: Drink[],
  userId: string,
  weightKg = DEFAULT_WEIGHT_KG,
  genderConstant = DEFAULT_GENDER_CONSTANT
): number => {
  const userDrinks = calculateUserDrinks(drinks, userId);
  let totalAlcohol = 0;
  
  userDrinks.forEach((drink) => {
    const drinkType = getDrinkTypeById(drink.typeId);
    if (drinkType) {
      const alcoholGrams = (drinkType.volume * drinkType.alcoholContent) / 100 * 0.789; // 0.789 is the density of ethanol
      totalAlcohol += alcoholGrams;
    }
  });
  
  // BAC formula: alcohol grams / (weight in kg * gender constant)
  const bac = totalAlcohol / (weightKg * genderConstant);
  
  // Account for metabolism over time
  const now = new Date();
  const earliestDrink = userDrinks.reduce((earliest, drink) => {
    const drinkTime = new Date(drink.timestamp);
    return drinkTime < earliest ? drinkTime : earliest;
  }, now);
  
  const hoursSinceFirstDrink = (now.getTime() - earliestDrink.getTime()) / (60 * 60 * 1000);
  const metabolizedBac = hoursSinceFirstDrink * METABOLISM_RATE;
  
  return Math.max(0, bac - metabolizedBac);
};

export const getBacLevel = (bac: number): {
  level: 'sober' | 'buzzed' | 'tipsy' | 'drunk' | 'danger';
  color: string;
} => {
  if (bac < 0.02) {
    return { level: 'sober', color: 'bg-green-500' };
  } else if (bac < 0.05) {
    return { level: 'buzzed', color: 'bg-emerald-500' };
  } else if (bac < 0.08) {
    return { level: 'tipsy', color: 'bg-yellow-500' };
  } else if (bac < 0.15) {
    return { level: 'drunk', color: 'bg-orange-500' };
  } else {
    return { level: 'danger', color: 'bg-red-500' };
  }
};

export const formatTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const formatDate = (timestamp: string): string => {
  const date = new Date(timestamp);
  return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
};

export const getTimeAgo = (timestamp: string): string => {
  const now = new Date();
  const date = new Date(timestamp);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return `${seconds} seconds ago`;
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  
  const months = Math.floor(days / 30);
  return `${months} ${months === 1 ? 'month' : 'months'} ago`;
};

export const shouldCallUber = (bac: number, threshold: number): boolean => {
  // This is a simplified approach. In a real app, you'd want to use the actual BAC calculation
  return bac >= threshold * 0.02; // Multiply by 0.02 to convert drinks to approximate BAC
};

export const shouldOrderFood = (bac: number, threshold: number): boolean => {
  return bac >= threshold * 0.02;
};

export const shouldNotify = (bac: number, threshold: number): boolean => {
  return bac >= threshold * 0.02;
};

export const estimateLifeImpact = (totalDrinks: number): number => {
  // Very simplified model - not medically accurate
  // A more accurate model would consider drinking patterns, frequency, etc.
  const weeklyAverage = totalDrinks / 52; // assume the total is for a year
  if (weeklyAverage < 7) return 0;
  return (weeklyAverage - 7) * 0.02; // very rough estimate: 1 week of life per year of heavy drinking
};
