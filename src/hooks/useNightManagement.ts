
import { useState } from 'react';
import { Night, Group, NightSettings } from '@/types/models';

export const useNightManagement = () => {
  const [allNights, setAllNights] = useState<Night[]>([]);

  const activeNight = allNights.find((night) => night.isActive) || null;
  
  const pastNights = allNights
    .filter((night) => !night.isActive)
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

  const setActiveNight = (night: Night | null) => {
    setAllNights((prevNights) =>
      prevNights.map((n) =>
        n.id === night?.id ? { ...n, isActive: true } : { ...n, isActive: false }
      )
    );
  };

  const startNight = (groupId: string, group: Group, settings?: NightSettings) => {
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

  return {
    allNights,
    activeNight,
    pastNights,
    setActiveNight,
    startNight,
    endNight
  };
};
