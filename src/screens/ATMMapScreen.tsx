import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ActivityIndicator } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useTheme } from '../hooks/useTheme';
import { useSettings } from '../context/SettingsContext';

interface ATM {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
}

export const ATMMapScreen: React.FC = () => {
  const theme = useTheme();
  const { showATMDistance } = useSettings();
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [atms, setAtms] = useState<ATM[]>([]);
  const [loading, setLoading] = useState(true);

  const formatDistance = (meters: number) => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)} km`;
    }
    return `${Math.round(meters)} m`;
  };
  // chatgpt
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  };

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        
        // Request location permissions
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Permission to access location was denied');
          setLoading(false);
          return;
        }

        // Get current location
        let currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation);

        // Mock ATM data - In a real app, you would fetch this from an API
        const mockAtms: ATM[] = [
          {
            id: '1',
            name: 'Bitcoin ATM - Bakker Farid',
            latitude: currentLocation.coords.latitude + 0.002,
            longitude: currentLocation.coords.longitude + 0.002,
            address: 'Liersesteenweg 125'
          },
          {
            id: '2',
            name: 'Crypto ATM - Stadion DePlaon',
            latitude: currentLocation.coords.latitude - 0.002,
            longitude: currentLocation.coords.longitude - 0.002,
            address: 'Plaon Stadion'
          },
          {
            id: '3',
            name: 'Digital Currency ATM discord city',
            latitude: currentLocation.coords.latitude + 0.003,
            longitude: currentLocation.coords.longitude - 0.001,
            address: 'Huis van Bilal'
          }
        ];
        
        setAtms(mockAtms);
      } catch (error) {
        setErrorMsg('Error fetching location or ATM data');
        console.error(error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (errorMsg) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.errorText, { color: theme.colors.negative }]}>{errorMsg}</Text>
      </View>
    );
  }

  if (!location) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.errorText, { color: theme.colors.text }]}>Waiting for location...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        {/* User's location marker */}
        <Marker
          coordinate={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          }}
          title="You are here"
          pinColor="blue"
        />

        {/* ATM markers */}
        {atms.map((atm) => (
          <Marker
            key={atm.id}
            coordinate={{
              latitude: atm.latitude,
              longitude: atm.longitude,
            }}
            title={atm.name}
            description={showATMDistance && location ? 
              `${atm.address}\nDistance: ${formatDistance(calculateDistance(
                location.coords.latitude,
                location.coords.longitude,
                atm.latitude,
                atm.longitude
              ))}` : 
              atm.address
            }
            pinColor="orange"
          />
        ))}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    margin: 20,
  },
});
