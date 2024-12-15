import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { ThemeProvider } from './src/context/ThemeContext';
import { SettingsProvider } from './src/context/SettingsContext';
import { TabNavigator } from './src/navigation/TabNavigator';

export default function App() {
  return (
    <ThemeProvider>
      <SettingsProvider>
        <NavigationContainer>
          <TabNavigator />
        </NavigationContainer>
      </SettingsProvider>
    </ThemeProvider>
  );
}
