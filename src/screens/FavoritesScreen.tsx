import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { modalStyles } from "../styles/shared.styles";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { useNotifications } from "../hooks/useNotifications";
import { showNotification } from "../utils/notifications";
import { BitcoinPrice } from "../types/BitcoinPrice";

const FAVORITES_KEY = "bitcoin_favorites";

export const FavoritesScreen = () => {
  const { isDarkMode } = useTheme();
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const { showNotification } = useNotifications();
  const [favorites, setFavorites] = useState<BitcoinPrice[]>([]);
  const [selectedPrice, setSelectedPrice] = useState<BitcoinPrice | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    loadFavorites();
  }, []);

  useEffect(() => {
    if (isFocused) {
      console.log("FavoritesScreen - Screen focused, reloading favorites");
      const checkClearedStatus = async () => {
        try {
          const wasCleared = await AsyncStorage.getItem('favorites_cleared');
          if (wasCleared) {
            await AsyncStorage.removeItem('favorites_cleared');
            setFavorites([]);
          } else {
            loadFavorites();
          }
        } catch (error) {
          console.error("Error checking cleared status:", error);
          loadFavorites();
        }
      };
      checkClearedStatus();
    }
  }, [isFocused]);

  const loadFavorites = async () => {
    try {
      const storedFavorites = await AsyncStorage.getItem(FAVORITES_KEY);
      console.log("FavoritesScreen - Loaded favorites:", storedFavorites);
      if (storedFavorites) {
        const parsedFavorites = JSON.parse(storedFavorites);
        console.log("FavoritesScreen - Parsed favorites:", parsedFavorites);
        setFavorites(parsedFavorites);
      }
    } catch (error) {
      console.error("Error loading favorites:", error);
    }
  };

  const removeFavorite = async (price: BitcoinPrice) => {
    try {
      const updatedFavorites = favorites.filter(
        (fav) => fav.Date !== price.Date
      );
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updatedFavorites));
      setFavorites(updatedFavorites);
      showNotification(
        "Favorite Removed",
        `Bitcoin price from ${price.Date} has been removed from your favorites.`
      );
      setSelectedPrice(null);
      setModalVisible(false);
    } catch (error) {
      console.error("Error removing favorite:", error);
      Alert.alert(
        "Error",
        "Failed to remove favorite. Please try again."
      );
    }
  };

  const getPercentageColor = (percentage: number) => {
    return percentage >= 0 ? "#4CAF50" : "#FF4444";
  };

  const renderItem = ({ item }: { item: BitcoinPrice }) => (
    <TouchableOpacity
      style={[
        styles.itemContainer,
        { backgroundColor: isDarkMode ? "#2a2a2a" : "#f5f5f5" },
      ]}
      onPress={() => {
        setSelectedPrice(item);
        setModalVisible(true);
      }}
    >
      <View style={styles.itemContent}>
        <View style={styles.itemHeader}>
          <Text
            style={[
              styles.dateText,
              { color: isDarkMode ? "#ffffff" : "#000000" },
            ]}
          >
            {item.Date}
          </Text>
          <Text
            style={[
              styles.priceText,
              { color: isDarkMode ? "#ffffff" : "#000000" },
            ]}
          >
            $
            {typeof item.Price === "number" ? item.Price.toLocaleString() : "0"}
          </Text>
        </View>
        <View style={styles.itemStats}>
          <Text
            style={[
              styles.changeText,
              {
                color: getPercentageColor(item.ChangePercentFromLastMonth || 0),
              },
            ]}
          >
            {(item.ChangePercentFromLastMonth || 0) >= 0 ? "+" : ""}
            {(item.ChangePercentFromLastMonth || 0).toFixed(2)}%
          </Text>
          <Text
            style={[
              styles.volumeText,
              { color: isDarkMode ? "#B0B0B0" : "#666666" },
            ]}
          >
            Vol: {item.Volume || "0"}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        onPress={() => {
          Alert.alert(
            "Remove Favorite",
            `Are you sure you want to remove ${item.Date} from favorites?`,
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Remove",
                onPress: () => removeFavorite(item),
                style: "destructive",
              },
            ]
          );
        }}
        style={styles.deleteButton}
      >
        <Ionicons
          name="trash-outline"
          size={24}
          color={isDarkMode ? "#ffffff" : "#000000"}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? "#1a1a1a" : "#ffffff" },
      ]}
    >
      <Text
        style={[styles.title, { color: isDarkMode ? "#ffffff" : "#000000" }]}
      >
        Favorites
      </Text>
      {favorites.length === 0 ? (
        <Text
          style={[
            styles.emptyText,
            { color: isDarkMode ? "#ffffff" : "#000000" },
          ]}
        >
          No favorites added yet
        </Text>
      ) : (
        <FlatList
          data={favorites}
          renderItem={renderItem}
          keyExtractor={(item) => item.Date}
          style={styles.list}
        />
      )}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={modalStyles.modalOverlay}>
          <View
            style={[
              modalStyles.modalView,
              { backgroundColor: isDarkMode ? "#2a2a2a" : "#ffffff" },
            ]}
          >
            {selectedPrice && (
              <>
                <Text
                  style={[
                    modalStyles.modalTitle,
                    { color: isDarkMode ? "#ffffff" : "#000000" },
                  ]}
                >
                  Bitcoin Price Details
                </Text>
                <View style={modalStyles.modalContent}>
                  <View style={modalStyles.modalRow}>
                    <Text
                      style={[
                        modalStyles.modalLabel,
                        { color: isDarkMode ? "#B0B0B0" : "#666666" },
                      ]}
                    >
                      Date:
                    </Text>
                    <Text
                      style={[
                        modalStyles.modalValue,
                        { color: isDarkMode ? "#ffffff" : "#000000" },
                      ]}
                    >
                      {selectedPrice.Date}
                    </Text>
                  </View>
                  <View style={modalStyles.modalRow}>
                    <Text
                      style={[
                        modalStyles.modalLabel,
                        { color: isDarkMode ? "#B0B0B0" : "#666666" },
                      ]}
                    >
                      Price:
                    </Text>
                    <Text
                      style={[
                        modalStyles.modalValue,
                        { color: isDarkMode ? "#ffffff" : "#000000" },
                      ]}
                    >
                      $
                      {typeof selectedPrice.Price === "number"
                        ? selectedPrice.Price.toLocaleString()
                        : "0"}
                    </Text>
                  </View>
                  <View style={modalStyles.modalRow}>
                    <Text
                      style={[
                        modalStyles.modalLabel,
                        { color: isDarkMode ? "#B0B0B0" : "#666666" },
                      ]}
                    >
                      Change:
                    </Text>
                    <Text
                      style={[
                        modalStyles.modalValue,
                        {
                          color: getPercentageColor(
                            selectedPrice.ChangePercentFromLastMonth || 0
                          ),
                        },
                      ]}
                    >
                      {(selectedPrice.ChangePercentFromLastMonth || 0) >= 0
                        ? "+"
                        : ""}
                      {(selectedPrice.ChangePercentFromLastMonth || 0).toFixed(
                        2
                      )}
                      %
                    </Text>
                  </View>
                  <View style={modalStyles.modalRow}>
                    <Text
                      style={[
                        modalStyles.modalLabel,
                        { color: isDarkMode ? "#B0B0B0" : "#666666" },
                      ]}
                    >
                      Volume:
                    </Text>
                    <Text
                      style={[
                        modalStyles.modalValue,
                        { color: isDarkMode ? "#ffffff" : "#000000" },
                      ]}
                    >
                      {selectedPrice.Volume || "0"}
                    </Text>
                  </View>
                  <View style={modalStyles.modalRow}>
                    <Text
                      style={[
                        modalStyles.modalLabel,
                        { color: isDarkMode ? "#B0B0B0" : "#666666" },
                      ]}
                    >
                      High:
                    </Text>
                    <Text
                      style={[
                        modalStyles.modalValue,
                        { color: isDarkMode ? "#ffffff" : "#000000" },
                      ]}
                    >
                      $
                      {typeof selectedPrice.High === "number"
                        ? selectedPrice.High.toLocaleString()
                        : "0"}
                    </Text>
                  </View>
                </View>
                <View style={modalStyles.modalButtons}>
                  <TouchableOpacity
                    style={[
                      modalStyles.modalButton,
                      { backgroundColor: "#dc3545" },
                    ]}
                    onPress={() => {
                      setModalVisible(false);
                      Alert.alert(
                        "Remove Favorite",
                        `Are you sure you want to remove ${selectedPrice.Date} from favorites?`,
                        [
                          { text: "Cancel", style: "cancel" },
                          {
                            text: "Remove",
                            onPress: () => {
                              removeFavorite(selectedPrice);
                            },
                            style: "destructive",
                          },
                        ]
                      );
                    }}
                  >
                    <Text style={modalStyles.modalButtonText}>
                      Remove from Favorites
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      modalStyles.modalButton,
                      { backgroundColor: isDarkMode ? "#666666" : "#999999" },
                    ]}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={modalStyles.modalButtonText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
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
    fontWeight: "bold",
    marginBottom: 16,
  },
  list: {
    flex: 1,
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
  },
  itemContent: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  itemStats: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dateText: {
    fontSize: 16,
    fontWeight: "500",
  },
  priceText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  changeText: {
    fontSize: 14,
    fontWeight: "500",
  },
  volumeText: {
    fontSize: 14,
  },
  deleteButton: {
    marginLeft: 12,
    padding: 8,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    marginTop: 20,
  },
});
