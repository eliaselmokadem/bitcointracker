import React, { useEffect, useState } from "react";
import { View, FlatList, Dimensions, ActivityIndicator, Text, TouchableOpacity } from "react-native";
import { styles } from "../styles/HomeScreen.styles";
import { BitcoinPrice } from "../types/BitcoinPrice";
import { HeaderButtons } from "../components/HeaderButtons";
import { PriceItem } from "../components/PriceItem";
import { DetailModal } from "../components/DetailModal";
import { AddPriceModal } from "../components/AddPriceModal";
import { useTheme } from "../hooks/useTheme";
import { API_ENDPOINTS, getData, postData } from "../utils/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { showNotification } from "../utils/notifications";
import { LineChart } from "react-native-chart-kit";

const FAVORITES_KEY = "bitcoin_favorites";

export const HomeScreen: React.FC = () => {
  const theme = useTheme();
  const [allPrices, setAllPrices] = useState<BitcoinPrice[]>([]);
  const [filteredPrices, setFilteredPrices] = useState<BitcoinPrice[]>([]);
  const [favorites, setFavorites] = useState<BitcoinPrice[]>([]);
  const [selectedPrice, setSelectedPrice] = useState<BitcoinPrice | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [newPriceData, setNewPriceData] = useState({
    Date: new Date().toLocaleDateString(),
    Price: "",
    Open: "",
    High: "",
    ChangePercentFromLastMonth: "",
    Volume: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatDateToString = (date: Date): string => {
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  const parseDate = (dateString: string): Date => {
    if (!dateString) {
      throw new Error('Date string is empty or undefined');
    }

    // First try parsing as ISO date string
    const isoDate = new Date(dateString);
    if (!isNaN(isoDate.getTime())) {
      return isoDate;
    }

    // Handle dates in format "YYYY-MM-DD"
    if (dateString.includes('-')) {
      const [year, month, day] = dateString.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      if (!isNaN(date.getTime())) {
        console.log('Parsed hyphenated date:', {
          input: dateString,
          parsed: date.toISOString()
        });
        return date;
      }
    }

    // Handle dates in format "MM/DD/YYYY"
    if (dateString.includes('/')) {
      const [month, day, year] = dateString.split('/').map(Number);
      const date = new Date(year, month - 1, day);
      if (!isNaN(date.getTime())) {
        console.log('Parsed slash date:', {
          input: dateString,
          parsed: date.toISOString()
        });
        return date;
      }
    }

    throw new Error(`Invalid date format: ${dateString}`);
  };

  useEffect(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    console.log('Setting initial dates:', {
      today: today.toISOString(),
      thirtyDaysAgo: thirtyDaysAgo.toISOString()
    });
    
    setStartDate(thirtyDaysAgo);
    setEndDate(today);
    
    loadBitcoinPrices();
    loadFavorites();
  }, []);

  const loadBitcoinPrices = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getData<BitcoinPrice[]>(API_ENDPOINTS.BITCOIN_PRICES);
      if (response.error) {
        throw new Error(response.error);
      }
      if (response.data) {
        console.log('Raw API response:', {
          sampleDates: response.data.slice(0, 3).map(p => p.Date),
          samplePrices: response.data.slice(0, 3).map(p => p.Price),
          totalCount: response.data.length
        });

        // Sort data by date before setting it
        const sortedData = response.data.sort((a, b) => {
          try {
            const dateA = parseDate(a.Date);
            const dateB = parseDate(b.Date);
            console.log('Comparing dates:', {
              dateAString: a.Date,
              dateBString: b.Date,
              dateAObj: dateA.toISOString(),
              dateBObj: dateB.toISOString()
            });
            return dateB.getTime() - dateA.getTime(); // newest first
          } catch (error) {
            console.error('Error sorting loaded prices:', error);
            return 0;
          }
        });

        setAllPrices(sortedData);
        
        console.log('Date range for filtering:', {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          firstDataDate: sortedData[0]?.Date,
          lastDataDate: sortedData[sortedData.length - 1]?.Date
        });
        
        const filtered = filterPricesByDateRange(sortedData);
        setFilteredPrices(filtered);
      }
    } catch (error) {
      console.error("Error loading bitcoin prices:", error);
      setError("Failed to load bitcoin prices. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = async () => {
    try {
      const storedFavorites = await AsyncStorage.getItem(FAVORITES_KEY);
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      }
    } catch (error) {
      console.error("Error loading favorites:", error);
    }
  };

  const addToFavorites = async (price: BitcoinPrice) => {
    try {
      const isFavorite = favorites.some((fav) => fav.Date === price.Date);
      if (!isFavorite) {
        const newFavorites = [...favorites, { ...price }];
        await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
        setFavorites(newFavorites);
        await showNotification(
          "Added to Favorites! ",
          `Bitcoin price from ${price.Date} has been added to your favorites`
        );
      }
    } catch (error) {
      console.error("Error adding to favorites:", error);
      await showNotification(
        "Error ",
        "Failed to add item to favorites. Please try again."
      );
    }
  };

  const removeFromFavorites = async (price: BitcoinPrice) => {
    try {
      const newFavorites = favorites.filter((fav) => fav.Date !== price.Date);
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
      setFavorites(newFavorites);
      setSelectedPrice(null);
      setShowDetailModal(false);
      await showNotification(
        "Removed from Favorites ",
        `Bitcoin price from ${price.Date} has been removed from your favorites`
      );
    } catch (error) {
      console.error("Error removing from favorites:", error);
      await showNotification(
        "Error ",
        "Failed to remove item from favorites. Please try again."
      );
    }
  };

  const getPercentageColor = (percentage: number) => {
    return percentage >= 0 ? theme.colors.positive : theme.colors.negative;
  };

  const isFavorite = (price: BitcoinPrice) => {
    return favorites.some((fav) => fav.Date === price.Date);
  };

  const handleAddPrice = async () => {
    try {
      const newPrice = {
        Date: newPriceData.Date,
        Price: parseFloat(newPriceData.Price),
        Open: parseFloat(newPriceData.Open),
        High: parseFloat(newPriceData.High),
        ChangePercentFromLastMonth: parseFloat(newPriceData.ChangePercentFromLastMonth),
        Volume: newPriceData.Volume,
      };

      const response = await postData<BitcoinPrice>(API_ENDPOINTS.BITCOIN_PRICES, newPrice);
      if (response.error) {
        throw new Error(response.error);
      }
      if (response.data) {
        const updatedPrices = [response.data, ...allPrices];
        setAllPrices(updatedPrices);
        const filtered = filterPricesByDateRange(updatedPrices);
        setFilteredPrices(filtered);
        setShowAddModal(false);
        setNewPriceData({
          Date: new Date().toLocaleDateString(),
          Price: "",
          Open: "",
          High: "",
          ChangePercentFromLastMonth: "",
          Volume: "",
        });
      }
    } catch (error) {
      console.error("Error adding new price:", error);
    }
  };

  const handleStartDateChange = (date: Date) => {
    console.log('Start date changing to:', date.toISOString());
    if (date > endDate) {
      // If start date is after end date, move end date to match
      setEndDate(new Date(date.getTime()));
    }
    setStartDate(date);
  };

  const handleEndDateChange = (date: Date) => {
    console.log('End date changing to:', date.toISOString());
    if (date < startDate) {
      // If end date is before start date, move start date to match
      setStartDate(new Date(date.getTime()));
    }
    setEndDate(date);
  };

  const filterPricesByDateRange = (data: BitcoinPrice[]) => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      console.log('No data to filter');
      return [];
    }

    if (!startDate || !endDate) {
      console.log('Missing start or end date');
      return data;
    }

    console.log('Starting date filter with:', {
      dataLength: data.length,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      firstDataDate: data[0]?.Date,
      lastDataDate: data[data.length - 1]?.Date
    });

    // Set times to ensure full day coverage
    const start = new Date(startDate);
    const end = new Date(endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    const filtered = data.filter(price => {
      try {
        if (!price.Date) {
          console.log('Price missing date:', price);
          return false;
        }

        // Handle both date formats (MM/DD/YYYY and YYYY-MM-DD)
        let priceDate: Date;
        if (price.Date.includes('-')) {
          const [year, month, day] = price.Date.split('-').map(Number);
          priceDate = new Date(year, month - 1, day);
        } else {
          const [month, day, year] = price.Date.split('/').map(Number);
          priceDate = new Date(year, month - 1, day);
        }
        
        // Ensure we're comparing at day level only
        priceDate.setHours(12, 0, 0, 0);
        
        const isInRange = priceDate >= start && priceDate <= end;
        
        if (!isInRange) {
          console.log('Price out of range:', {
            priceDate: price.Date,
            parsedDate: priceDate.toISOString(),
            start: start.toISOString(),
            end: end.toISOString()
          });
        }
        
        return isInRange;
      } catch (error) {
        console.error('Error processing date:', price.Date, error);
        return false;
      }
    });

    console.log('Filter results:', {
      inputCount: data.length,
      outputCount: filtered.length,
      startRange: start.toISOString(),
      endRange: end.toISOString(),
      firstFilteredDate: filtered[0]?.Date,
      lastFilteredDate: filtered[filtered.length - 1]?.Date
    });

    return filtered;
  };

  useEffect(() => {
    console.log('Date change detected:', {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    });
    
    if (allPrices.length > 0) {
      const filtered = filterPricesByDateRange(allPrices);
      setFilteredPrices(filtered);
    }
  }, [startDate, endDate]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <HeaderButtons
        theme={theme}
        onRefresh={loadBitcoinPrices}
        onAddNew={() => setShowAddModal(true)}
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={handleStartDateChange}
        onEndDateChange={handleEndDateChange}
      />

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.messageText, { color: theme.colors.text }]}>
            Loading prices...
          </Text>
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Text style={[styles.errorText, { color: theme.colors.negative }]}>
            {error}
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
            onPress={loadBitcoinPrices}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : filteredPrices.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={[styles.messageText, { color: theme.colors.text }]}>
            No prices found for the selected date range
          </Text>
        </View>
      ) : (
        <>
          {filteredPrices.length > 0 && (
            <LineChart
              data={{
                labels: [...filteredPrices].reverse().map(price => {
                  const date = parseDate(price.Date);
                  return `${date.getMonth() + 1}/${date.getDate()}`;
                }),
                datasets: [{
                  data: [...filteredPrices].reverse().map(price => Number(price.Price))
                }]
              }}
              width={Dimensions.get("window").width - 16}
              height={220}
              yAxisLabel="$"
              chartConfig={{
                backgroundColor: theme.colors.card,
                backgroundGradientFrom: theme.colors.card,
                backgroundGradientTo: theme.colors.card,
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(255, 149, 0, ${opacity})`,
                labelColor: (opacity = 1) => theme.colors.text,
                style: {
                  borderRadius: 16
                },
                propsForDots: {
                  r: "4",
                  strokeWidth: "2",
                  stroke: theme.colors.primary
                }
              }}
              bezier
              style={{
                marginVertical: 8,
                borderRadius: 16,
                padding: 8
              }}
            />
          )}

          <FlatList
            data={filteredPrices}
            renderItem={({ item }) => (
              <PriceItem
                item={item}
                theme={theme}
                onPress={() => {
                  setSelectedPrice(item);
                  setShowDetailModal(true);
                }}
                onLongPress={() => {
                  if (isFavorite(item)) {
                    removeFromFavorites(item);
                  } else {
                    addToFavorites(item);
                  }
                }}
                getPercentageColor={getPercentageColor}
              />
            )}
            keyExtractor={(item) => item.Date}
            style={styles.list}
          />

          <DetailModal
            visible={showDetailModal}
            onClose={() => setShowDetailModal(false)}
            price={selectedPrice}
            theme={theme}
            getPercentageColor={getPercentageColor}
            isFavorite={isFavorite}
            onAddToFavorites={addToFavorites}
            onRemoveFromFavorites={removeFromFavorites}
          />

          <AddPriceModal
            visible={showAddModal}
            onClose={() => setShowAddModal(false)}
            theme={theme}
            priceData={newPriceData}
            onPriceDataChange={(field, value) =>
              setNewPriceData({ ...newPriceData, [field]: value })
            }
            onSubmit={handleAddPrice}
          />
        </>
      )}
    </View>
  );
};
