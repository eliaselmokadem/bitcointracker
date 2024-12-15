import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsContextType {
  showPriceAlerts: boolean;
  setShowPriceAlerts: (value: boolean) => void;
  showATMDistance: boolean;
  setShowATMDistance: (value: boolean) => void;
  settings: {
    showPriceAlerts: boolean;
    showATMDistance: boolean;
  };
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const SETTINGS_STORAGE_KEY = 'bitcoin_tracker_settings';

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [showPriceAlerts, setShowPriceAlerts] = useState(true);
  const [showATMDistance, setShowATMDistance] = useState(true);

  // Load settings from storage on mount
  useEffect(() => {
    loadSettings();
  }, []);

  // Save settings whenever they change
  useEffect(() => {
    saveSettings();
  }, [showPriceAlerts, showATMDistance]);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        setShowPriceAlerts(settings.showPriceAlerts ?? true);
        setShowATMDistance(settings.showATMDistance ?? true);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async () => {
    try {
      const settings = {
        showPriceAlerts,
        showATMDistance,
      };
      await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  return (
    <SettingsContext.Provider
      value={{
        showPriceAlerts,
        setShowPriceAlerts,
        showATMDistance,
        setShowATMDistance,
        settings: {
          showPriceAlerts,
          showATMDistance,
        },
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return {
    ...context,
    settings: {
      showPriceAlerts: context.showPriceAlerts,
      showATMDistance: context.showATMDistance,
    },
  };
};
