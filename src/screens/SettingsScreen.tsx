import React from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export const SettingsScreen = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff' }]}>
      <Text style={[styles.title, { color: isDarkMode ? '#ffffff' : '#000000' }]}>
        Settings
      </Text>
      <View style={styles.settingItem}>
        <Text style={[styles.settingText, { color: isDarkMode ? '#ffffff' : '#000000' }]}>
          Dark Mode
        </Text>
        <Switch value={isDarkMode} onValueChange={toggleTheme} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#cccccc',
  },
  settingText: {
    fontSize: 16,
  },
});
