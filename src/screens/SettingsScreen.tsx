import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useSettings } from '../context/SettingsContext';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { showNotification, requestNotificationPermissions } from '../utils/notifications';

export const SettingsScreen = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const {
    showPriceAlerts,
    setShowPriceAlerts,
    showATMDistance,
    setShowATMDistance,
    settings,
  } = useSettings();

  const clearFavorites = async () => {
    Alert.alert(
      'Clear Favorites',
      'Are you sure you want to clear all your favorites?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('bitcoin_favorites');
              // Force a reload of the FavoritesScreen by setting a flag in storage
              await AsyncStorage.setItem('favorites_cleared', Date.now().toString());
              showNotification('Success', 'All favorites have been cleared');
            } catch (error) {
              console.error('Error clearing favorites:', error);
              showNotification('Error', 'Failed to clear favorites. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleAbout = () => {
    Alert.alert(
      'About Bitcoin Tracker',
      'Versie 1.0.4 \n\n Dag meneer Similon, het was zeker een pleziertje om van u les te krijgen, alhoewel ik dit jaar veel thuis bleef vanwegens medische problemen had ik de paar weken van React veel bijgeleerd. Helaas gaan onze wegen hier scheiden dit is uiteindelijk mijn laatste jaar (hopelijk) maar ik wil u zeker nog steeds bedanken voor uw leerzame les. \n\nMet vriendelijke groeten,\n\nElias El Mokadem',
      [{ text: 'Tot ziens!' }]
    );
  };

  const handleNotificationToggle = async (value: boolean) => {
    try {
      if (value) {
        // If turning on notifications, request permissions
        const permissionGranted = await requestNotificationPermissions();
        if (permissionGranted) {
          await AsyncStorage.setItem('bitcoin_tracker_settings', JSON.stringify({
            ...settings,
            showPriceAlerts: true
          }));
          setShowPriceAlerts(true);
          showNotification('Notifications Enabled', 'You will now receive notifications from Bitcoin Tracker');
        } else {
          Alert.alert(
            'Permission Required',
            'Please enable notifications in your device settings to receive updates from Bitcoin Tracker.',
            [{ text: 'OK' }]
          );
          return;
        }
      } else {
        // If turning off notifications
        await AsyncStorage.setItem('bitcoin_tracker_settings', JSON.stringify({
          ...settings,
          showPriceAlerts: false
        }));
        setShowPriceAlerts(false);
      }
    } catch (error) {
      console.error('Error updating notification settings:', error);
      Alert.alert('Error', 'Failed to update notification settings');
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff' }]}>
      <Text style={[styles.title, { color: isDarkMode ? '#ffffff' : '#000000' }]}>
        Settings
      </Text>
      
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: isDarkMode ? '#ffffff' : '#000000' }]}>
          Appearance
        </Text>
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Ionicons name={isDarkMode ? "moon" : "sunny"} size={24} color={isDarkMode ? '#ffffff' : '#000000'} />
            <Text style={[styles.settingText, { color: isDarkMode ? '#ffffff' : '#000000' }]}>
              Dark Mode
            </Text>
          </View>
          <Switch 
            value={isDarkMode} 
            onValueChange={toggleTheme}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: isDarkMode ? '#ffffff' : '#000000' }]}>
          Notifications
        </Text>
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Ionicons name="notifications" size={24} color={isDarkMode ? '#ffffff' : '#000000'} />
            <Text style={[styles.settingText, { color: isDarkMode ? '#ffffff' : '#000000' }]}>
              All notifications
            </Text>
          </View>
          <Switch 
            value={showPriceAlerts} 
            onValueChange={handleNotificationToggle}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: isDarkMode ? '#ffffff' : '#000000' }]}>
          Display
        </Text>
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Ionicons name="location" size={24} color={isDarkMode ? '#ffffff' : '#000000'} />
            <Text style={[styles.settingText, { color: isDarkMode ? '#ffffff' : '#000000' }]}>
              Show ATM Distance (under construction)
            </Text>
          </View>
          <Switch 
            value={showATMDistance} 
            onValueChange={setShowATMDistance}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: isDarkMode ? '#ffffff' : '#000000' }]}>
          Data Management
        </Text>
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: isDarkMode ? '#333333' : '#f0f0f0' }]}
          onPress={clearFavorites}
        >
          <Ionicons name="trash-bin" size={24} color="#ff4444" />
          <Text style={[styles.buttonText, { color: isDarkMode ? '#ffffff' : '#000000' }]}>
            Clear Favorites
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: isDarkMode ? '#ffffff' : '#000000' }]}>
          About
        </Text>
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: isDarkMode ? '#333333' : '#f0f0f0' }]}
          onPress={handleAbout}
        >
          <Ionicons name="information-circle" size={24} color={isDarkMode ? '#ffffff' : '#000000'} />
          <Text style={[styles.buttonText, { color: isDarkMode ? '#ffffff' : '#000000' }]}>
            About Bitcoin Tracker
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#cccccc',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 16,
    marginLeft: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  buttonText: {
    fontSize: 16,
    marginLeft: 12,
  },
});
