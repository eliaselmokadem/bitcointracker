import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  Modal,
  ActivityIndicator,
  Platform,
  StatusBar,
  Pressable,
  ScrollView,
  TextInput,
  Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LineChart } from 'react-native-chart-kit';
import DateTimePicker from '@react-native-community/datetimepicker';
import { styles, modalStyles, CHART_HEIGHT, ITEM_HEIGHT, HEADER_HEIGHT, SCREEN_WIDTH } from '../styles/HomeScreen.styles';
import { useTheme } from '../context/ThemeContext';
import { API_ENDPOINTS, getData, postData } from '../utils/api';
import { MaterialIcons } from '@expo/vector-icons';
import { showNotification } from '../utils/notifications';

interface BitcoinPrice {
  id: string;
  Date: string;
  Price: number;
  Open: number;
  High: number;
  ChangePercentFromLastMonth: number;
  Volume: string;
}

const FAVORITES_KEY = 'bitcoin_favorites';

export const HomeScreen = () => {
  const { isDarkMode } = useTheme();
  const theme = {
    text: isDarkMode ? '#ffffff' : '#000000',
    background: isDarkMode ? '#1a1a1a' : '#ffffff',
    cardBackground: isDarkMode ? '#2a2a2a' : '#f5f5f5',
    secondaryText: isDarkMode ? '#B0B0B0' : '#666666',
    accent: '#007AFF',
    negative: isDarkMode ? '#666666' : '#999999',
    positive: '#4CAF50',
    border: isDarkMode ? '#333333' : '#e0e0e0',
    primary: '#007AFF'
  };

  const [prices, setPrices] = useState<BitcoinPrice[]>([]);
  const [filteredPrices, setFilteredPrices] = useState<BitcoinPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState(new Date('2021-08-01'));
  const [endDate, setEndDate] = useState(new Date('2022-01-01'));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dateType, setDateType] = useState<'start' | 'end'>('start');
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPrice, setSelectedPrice] = useState<BitcoinPrice | null>(null);
  const [favorites, setFavorites] = useState<BitcoinPrice[]>([]);
  const [editingPrice, setEditingPrice] = useState<BitcoinPrice | null>(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editedPrice, setEditedPrice] = useState<string>('');
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [newPriceData, setNewPriceData] = useState({
    Date: new Date().toLocaleDateString('en-US'),
    Price: '',
    Open: '',
    High: '',
    ChangePercentFromLastMonth: '',
    Volume: ''
  });
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    fetchBitcoinPrices();
    loadFavorites();
  }, []);

  useEffect(() => {
    filterPricesByDate();
  }, [prices, startDate, endDate]);

  const onDateConfirm = () => {
    if (dateType === 'start') {
      if (selectedDate <= endDate) {
        setStartDate(selectedDate);
      } else {
        setStartDate(selectedDate);
        setEndDate(new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000));
      }
    } else {
      if (selectedDate >= startDate) {
        setEndDate(selectedDate);
      } else {
        setEndDate(selectedDate);
        setStartDate(new Date(selectedDate.getTime() - 24 * 60 * 60 * 1000));
      }
    }
    setShowDatePicker(false);
  };

  const loadFavorites = async () => {
    try {
      const storedFavorites = await AsyncStorage.getItem(FAVORITES_KEY);
      console.log('HomeScreen - Loaded favorites:', storedFavorites);
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const addToFavorites = async (price: BitcoinPrice) => {
    try {
      const isFavorite = favorites.some(fav => fav.id === price.id);
      if (!isFavorite) {
        const newFavorites = [...favorites, price];
        console.log('HomeScreen - Adding to favorites:', price);
        
        // First update the state and storage
        await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
        setFavorites(newFavorites);
        setModalVisible(false);
        
        // Then show the notification
        console.log('Showing add notification');
        await showNotification(
          'Added to Favorites! 🌟',
          `Bitcoin price from ${price.Date} (${price.Price.toLocaleString()} USD) has been added to your favorites`
        );
      }
    } catch (error) {
      console.error('Error adding to favorites:', error);
      await showNotification(
        'Error ❌',
        'Failed to add item to favorites. Please try again.'
      );
    }
  };

  const removeFromFavorites = async (price: BitcoinPrice) => {
    try {
      const newFavorites = favorites.filter(fav => fav.id !== price.id);
      
      // First update the state and storage
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
      setFavorites(newFavorites);
      
      // Then show the notification
      console.log('Showing remove notification');
      await showNotification(
        'Removed from Favorites ✨',
        `Bitcoin price from ${price.Date} has been removed from your favorites`
      );
    } catch (error) {
      console.error('Error removing from favorites:', error);
      await showNotification(
        'Error ❌',
        'Failed to remove item from favorites. Please try again.'
      );
    }
  };

  const isFavorite = (price: BitcoinPrice) => {
    return favorites.some(fav => fav.id === price.id);
  };

  const fetchBitcoinPrices = async () => {
    try {
      setError(null); // Clear any previous errors
      setLoading(true);
      const { data, error } = await getData<BitcoinPrice[]>(API_ENDPOINTS.BITCOIN_PRICES);
      
      if (error) {
        throw new Error(error);
      }

      if (data) {
        setPrices(data);
        setFilteredPrices(data);
      }
    } catch (error) {
      console.error('Error fetching Bitcoin prices:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch Bitcoin prices. Pull down to try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDateForAPI = (date: Date): string => {
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  const addNewBitcoinPrice = async () => {
    try {
      const currentDate = new Date();
      const newPrice = {
        Date: formatDateForAPI(currentDate),
        Price: 45000,
        Open: 44500,
        High: 46000,
        Volume: "517.02K",
        ChangePercentFromLastMonth: 1.12,
        id: Date.now().toString()
      };

      console.log('Attempting to post new price:', JSON.stringify(newPrice, null, 2));
      const response = await postData<BitcoinPrice>(API_ENDPOINTS.BITCOIN_PRICES, newPrice);
      
      if (response.error) {
        console.error('Error posting new price:', response.error);
        return;
      }

      console.log('Successfully posted new price:', response.data);
      
      // Add the new price to the local state immediately instead of fetching
      setPrices(prevPrices => [response.data as BitcoinPrice, ...prevPrices]);
      
      // Try to fetch in the background, but don't wait for it
      fetchBitcoinPrices().catch(error => {
        console.warn('Background refresh failed:', error);
        // It's okay if this fails since we already updated the UI
      });
    } catch (error) {
      console.error('Error adding new price:', error);
    }
  };

  const parseDate = (dateString: string) => {
    if (!dateString) return new Date();
    try {
      // Convert from MM/DD/YYYY to Date object
      const [month, day, year] = dateString.split('/');
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    } catch (error) {
      console.error('Error parsing date:', error);
      return new Date();
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      const [month, day, year] = dateString.split('/');
      return `${month}/${year}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  const filterPricesByDate = () => {
    if (!prices.length) return;
    
    const filtered = prices.filter(price => {
      const priceDate = parseDate(price.Date);
      return priceDate >= startDate && priceDate <= endDate;
    });
    setFilteredPrices(filtered);
  };

  const renderChart = () => {
    if (filteredPrices.length === 0) return null;

    const chartData = [...filteredPrices].reverse();
    const data = {
      labels: chartData.map(price => formatDate(price.Date)),
      datasets: [{
        data: chartData.map(price => price.Price),
        color: (opacity = 1) => `rgba(46, 119, 208, ${opacity})`,
        strokeWidth: 2
      }]
    };

    const latestPrice = chartData[0]?.Price ?? 0;
    const previousPrice = chartData[1]?.Price ?? 0;
    const priceChange = previousPrice !== 0 
      ? ((latestPrice - previousPrice) / previousPrice) * 100 
      : 0;

    return (
      <View style={modalStyles.chartContainer}>
        <View style={modalStyles.chartHeader}>
          <View>
            <Text style={[modalStyles.currentPrice, { color: theme.text }]}>
              ${latestPrice.toLocaleString()}
            </Text>
            <Text style={[modalStyles.priceChange, { color: getPercentageColor(priceChange) }]}>
              {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
            </Text>
          </View>
        </View>
        <LineChart
          data={data}
          width={SCREEN_WIDTH - 32}
          height={CHART_HEIGHT}
          chartConfig={{
            backgroundColor: 'transparent',
            backgroundGradientFrom: 'transparent',
            backgroundGradientTo: 'transparent',
            decimalPlaces: 2,
            color: (opacity = 1) => `rgba(46, 119, 208, ${opacity})`,
            style: {
              borderRadius: 16
            },
            propsForLabels: {
              fontSize: 10
            }
          }}
          bezier
          style={modalStyles.chart}
          onDataPointClick={({ index }) => scrollToIndex(index)}
        />
      </View>
    );
  };

  const renderDatePicker = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showDatePicker}
      onRequestClose={() => setShowDatePicker(false)}
    >
      <View style={modalStyles.modalContainer}>
        <View style={[modalStyles.modalContent, { backgroundColor: theme.cardBackground }]}>
          <View style={modalStyles.modalHeader}>
            <Text style={[modalStyles.modalTitle, { color: theme.text }]}>
              Select {dateType === 'start' ? 'Start' : 'End'} Date
            </Text>
            <Pressable onPress={() => setShowDatePicker(false)}>
              <Text style={[modalStyles.modalCloseButton, { color: theme.accent }]}>Cancel</Text>
            </Pressable>
          </View>
          <DateTimePicker
            testID="dateTimePicker"
            value={selectedDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, date) => date && setSelectedDate(date)}
            minimumDate={dateType === 'end' ? startDate : undefined}
            maximumDate={dateType === 'end' ? new Date() : endDate}
            style={modalStyles.datePicker}
          />
          <Pressable
            style={[modalStyles.confirmButton, { backgroundColor: theme.accent }]}
            onPress={onDateConfirm}
          >
            <Text style={modalStyles.confirmButtonText}>Confirm</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );

  const renderDateButtons = () => (
    <View style={modalStyles.datePickerContainer}>
      <Pressable
        style={[modalStyles.datePickerButton, { backgroundColor: theme.cardBackground }]}
        onPress={() => {
          setDateType('start');
          setSelectedDate(startDate);
          setShowDatePicker(true);
        }}
      >
        <Text style={[modalStyles.datePickerButtonText, { color: theme.text }]}>
          {startDate.toLocaleDateString()}
        </Text>
      </Pressable>
      <Text style={[modalStyles.dateSeparator, { color: theme.text }]}>to</Text>
      <Pressable
        style={[modalStyles.datePickerButton, { backgroundColor: theme.cardBackground }]}
        onPress={() => {
          setDateType('end');
          setSelectedDate(endDate);
          setShowDatePicker(true);
        }}
      >
        <Text style={[modalStyles.datePickerButtonText, { color: theme.text }]}>
          {endDate.toLocaleDateString()}
        </Text>
      </Pressable>
    </View>
  );

  const renderPriceItem = ({ item }: { item: BitcoinPrice }) => {
    return (
      <TouchableOpacity
        style={[styles.priceItem, { backgroundColor: theme.cardBackground }]}
        onPress={() => {
          setSelectedPrice(item);
          setModalVisible(true);
        }}
        onLongPress={() => {
          isFavorite(item) ? removeFromFavorites(item) : addToFavorites(item);
        }}
      >
        <View style={styles.priceHeader}>
          <Text style={[styles.priceDate, { color: theme.text }]}>
            {item.Date}
          </Text>
          <Text style={[styles.priceChange, { color: getPercentageColor(item.ChangePercentFromLastMonth) }]}>
            {item.ChangePercentFromLastMonth >= 0 ? '+' : ''}{item.ChangePercentFromLastMonth.toFixed(2)}%
          </Text>
        </View>
        <View style={styles.priceDetails}>
          <View style={styles.priceColumn}>
            <Text style={[styles.priceLabel, { color: theme.secondaryText }]}>Price</Text>
            <Text style={[styles.priceValue, { color: theme.text }]}>
              ${item.Price.toLocaleString()}
            </Text>
          </View>
          <View style={styles.priceColumn}>
            <Text style={[styles.priceLabel, { color: theme.secondaryText }]}>Volume</Text>
            <Text style={[styles.priceValue, { color: theme.text }]}>
              {item.Volume}
            </Text>
          </View>
          <View style={modalStyles.priceColumn}>
            <Text style={[modalStyles.priceLabel, { color: theme.secondaryText }]}>High</Text>
            <Text style={[modalStyles.priceValue, { color: theme.text }]}>
              ${item.High.toLocaleString()}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View style={[modalStyles.header, { backgroundColor: theme.background }]}>
      <View style={modalStyles.headerContent}>
      </View>
      {error && (
        <Text style={[modalStyles.errorText, { color: 'red' }]}>
          {error}
        </Text>
      )}
    </View>
  );

  const getPercentageColor = (percentage: number) => {
    return percentage >= 0 ? '#4CAF50' : '#FF4444';
  };

  const scrollToIndex = (index: number) => {
    if (listRef.current) {
      listRef.current.scrollToIndex({
        index,
        animated: true,
        viewPosition: 0.5,
      });
      setSelectedIndex(index);
    }
  };

  const renderModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={modalStyles.modalOverlay}>
        <View style={[modalStyles.modalView, { backgroundColor: theme.cardBackground }]}>
          {selectedPrice && (
            <>
              <Text style={[modalStyles.modalTitle, { color: theme.text }]}>
                Bitcoin Price Details
              </Text>
              <View style={modalStyles.modalContent}>
                <View style={modalStyles.modalRow}>
                  <Text style={[modalStyles.modalLabel, { color: theme.secondaryText }]}>Date:</Text>
                  <Text style={[modalStyles.modalValue, { color: theme.text }]}>
                    {selectedPrice.Date}
                  </Text>
                </View>
                <View style={modalStyles.modalRow}>
                  <Text style={[modalStyles.modalLabel, { color: theme.secondaryText }]}>Price:</Text>
                  <Text style={[modalStyles.modalValue, { color: theme.text }]}>
                    ${selectedPrice.Price.toLocaleString()}
                  </Text>
                </View>
                <View style={modalStyles.modalRow}>
                  <Text style={[modalStyles.modalLabel, { color: theme.secondaryText }]}>Change:</Text>
                  <Text style={[modalStyles.modalValue, { color: getPercentageColor(selectedPrice.ChangePercentFromLastMonth) }]}>
                    {selectedPrice.ChangePercentFromLastMonth >= 0 ? '+' : ''}
                    {selectedPrice.ChangePercentFromLastMonth.toFixed(2)}%
                  </Text>
                </View>
                <View style={modalStyles.modalRow}>
                  <Text style={[modalStyles.modalLabel, { color: theme.secondaryText }]}>Volume:</Text>
                  <Text style={[modalStyles.modalValue, { color: theme.text }]}>
                    {selectedPrice.Volume}
                  </Text>
                </View>
                <View style={modalStyles.modalRow}>
                  <Text style={[modalStyles.modalLabel, { color: theme.secondaryText }]}>High:</Text>
                  <Text style={[modalStyles.modalValue, { color: theme.text }]}>
                    ${selectedPrice.High.toLocaleString()}
                  </Text>
                </View>
              </View>
              <View style={modalStyles.modalButtons}>
                {selectedPrice && (
                  <>
                    {!isFavorite(selectedPrice) ? (
                      <TouchableOpacity
                        style={[modalStyles.modalButton, { backgroundColor: theme.accent }]}
                        onPress={() => addToFavorites(selectedPrice)}
                      >
                        <Text style={modalStyles.modalButtonText}>Add to Favorites</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={[modalStyles.modalButton, { backgroundColor: theme.negative }]}
                        onPress={() => removeFromFavorites(selectedPrice)}
                      >
                        <Text style={modalStyles.modalButtonText}>Remove from Favorites</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      style={[modalStyles.modalButton, { backgroundColor: theme.negative }]}
                      onPress={() => setModalVisible(false)}
                    >
                      <Text style={modalStyles.modalButtonText}>Close</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );

  const handleAddNewPrice = async () => {
    try {
      setLoading(true);
      const newPrice = {
        Date: newPriceData.Date,
        Price: parseFloat(newPriceData.Price),
        Open: parseFloat(newPriceData.Open),
        High: parseFloat(newPriceData.High),
        ChangePercentFromLastMonth: parseFloat(newPriceData.ChangePercentFromLastMonth),
        Volume: newPriceData.Volume
      };

      const response = await postData<BitcoinPrice>(API_ENDPOINTS.BITCOIN_PRICES, newPrice);
      
      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        // Add new price to the state
        const updatedPrices = [response.data, ...prices];
        setPrices(updatedPrices);
        setFilteredPrices(updatedPrices);
        setIsAddModalVisible(false);
        // Reset form
        setNewPriceData({
          Date: new Date().toLocaleDateString('en-US'),
          Price: '',
          Open: '',
          High: '',
          ChangePercentFromLastMonth: '',
          Volume: ''
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add new price');
    } finally {
      setLoading(false);
    }
  };

  const renderAddModal = () => (
    <Modal
      visible={isAddModalVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setIsAddModalVisible(false)}
    >
      <TouchableOpacity
        style={modalStyles.modalContainer}
        activeOpacity={1}
        onPress={() => setIsAddModalVisible(false)}
      >
        <TouchableOpacity 
          activeOpacity={1} 
          onPress={e => e.stopPropagation()}
          style={[modalStyles.modalContent, { backgroundColor: theme.background }]}
        >
          <View style={modalStyles.modalHeader}>
            <Text style={[modalStyles.modalTitle, { color: theme.text }]}>
              Add New Bitcoin Price
            </Text>
            <TouchableOpacity onPress={() => setIsAddModalVisible(false)}>
              <Text style={[modalStyles.modalCloseButton, { color: theme.secondaryText }]}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={modalStyles.modalScrollView}>
            <View style={modalStyles.formGroup}>
              <Text style={[modalStyles.label, { color: theme.text }]}>Date</Text>
              <TextInput
                style={[modalStyles.input, { 
                  color: theme.text,
                  backgroundColor: theme.cardBackground,
                  borderColor: theme.border
                }]}
                value={newPriceData.Date}
                onChangeText={(text) => setNewPriceData(prev => ({ ...prev, Date: text }))}
                placeholder="MM/DD/YYYY"
                placeholderTextColor={theme.secondaryText}
              />
            </View>

            <View style={modalStyles.formGroup}>
              <Text style={[modalStyles.label, { color: theme.text }]}>Price</Text>
              <TextInput
                style={[modalStyles.input, { 
                  color: theme.text,
                  backgroundColor: theme.cardBackground,
                  borderColor: theme.border
                }]}
                value={newPriceData.Price}
                onChangeText={(text) => setNewPriceData(prev => ({ ...prev, Price: text }))}
                keyboardType="numeric"
                placeholder="Enter price"
                placeholderTextColor={theme.secondaryText}
              />
            </View>

            <View style={modalStyles.formGroup}>
              <Text style={[modalStyles.label, { color: theme.text }]}>Open</Text>
              <TextInput
                style={[modalStyles.input, { 
                  color: theme.text,
                  backgroundColor: theme.cardBackground,
                  borderColor: theme.border
                }]}
                value={newPriceData.Open}
                onChangeText={(text) => setNewPriceData(prev => ({ ...prev, Open: text }))}
                keyboardType="numeric"
                placeholder="Enter opening price"
                placeholderTextColor={theme.secondaryText}
              />
            </View>

            <View style={modalStyles.formGroup}>
              <Text style={[modalStyles.label, { color: theme.text }]}>High</Text>
              <TextInput
                style={[modalStyles.input, { 
                  color: theme.text,
                  backgroundColor: theme.cardBackground,
                  borderColor: theme.border
                }]}
                value={newPriceData.High}
                onChangeText={(text) => setNewPriceData(prev => ({ ...prev, High: text }))}
                keyboardType="numeric"
                placeholder="Enter highest price"
                placeholderTextColor={theme.secondaryText}
              />
            </View>

            <View style={modalStyles.formGroup}>
              <Text style={[modalStyles.label, { color: theme.text }]}>Change % from Last Month</Text>
              <TextInput
                style={[modalStyles.input, { 
                  color: theme.text,
                  backgroundColor: theme.cardBackground,
                  borderColor: theme.border
                }]}
                value={newPriceData.ChangePercentFromLastMonth}
                onChangeText={(text) => setNewPriceData(prev => ({ ...prev, ChangePercentFromLastMonth: text }))}
                keyboardType="numeric"
                placeholder="Enter change percentage"
                placeholderTextColor={theme.secondaryText}
              />
            </View>

            <View style={modalStyles.formGroup}>
              <Text style={[modalStyles.label, { color: theme.text }]}>Volume</Text>
              <TextInput
                style={[modalStyles.input, { 
                  color: theme.text,
                  backgroundColor: theme.cardBackground,
                  borderColor: theme.border
                }]}
                value={newPriceData.Volume}
                onChangeText={(text) => setNewPriceData(prev => ({ ...prev, Volume: text }))}
                placeholder="Enter volume (e.g., 500.00K)"
                placeholderTextColor={theme.secondaryText}
              />
            </View>
          </ScrollView>

          <View style={modalStyles.buttonContainer}>
            <TouchableOpacity
              style={[modalStyles.modalButton, modalStyles.cancelButton]}
              onPress={() => setIsAddModalVisible(false)}
            >
              <Text style={[modalStyles.buttonText, modalStyles.cancelButtonText]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[modalStyles.modalButton, modalStyles.submitButton]}
              onPress={handleAddNewPrice}
            >
              <Text style={[modalStyles.buttonText, modalStyles.submitButtonText]}>Add</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={[styles.headerButton, { backgroundColor: theme.primary }]}
            onPress={fetchBitcoinPrices}
          >
            <View style={styles.headerButtonIcon}>
              <MaterialIcons name="refresh" size={20} color="#ffffff" />
            </View>
            <Text style={styles.headerButtonText}>Refresh</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.headerButton, { backgroundColor: theme.primary }]}
            onPress={() => setIsAddModalVisible(true)}
          >
            <View style={styles.headerButtonIcon}>
              <MaterialIcons name="add" size={20} color="#ffffff" />
            </View>
            <Text style={styles.headerButtonText}>Add New</Text>
          </TouchableOpacity>
        </View>
        {renderDateButtons()}
      </View>
      {renderHeader()}
      <ScrollView>
        {renderChart()}
        <FlatList
          ref={listRef}
          data={filteredPrices}
          renderItem={renderPriceItem}
          keyExtractor={(item) => item.id}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      </ScrollView>
      {renderModal()}
      {renderAddModal()}
      {renderDatePicker()}
    </SafeAreaView>
  );
};
