import React, { useState } from "react";
import { View, StyleSheet, Text, TouchableOpacity, TextInput, ScrollView } from "react-native";
import { useTheme } from "../hooks/useTheme";
import { API_ENDPOINTS, postData } from "../utils/api";
import { BitcoinPrice } from "../types/BitcoinPrice";
import DatePicker from "../components/DatePicker";
import { useNavigation } from "@react-navigation/native";
import { useNotifications } from "../hooks/useNotifications";

export const AddPriceScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const { showNotification } = useNotifications();
  const [priceData, setPriceData] = useState({
    Date: new Date().toLocaleDateString(),
    Price: "",
    Open: "",
    High: "",
    ChangePercentFromLastMonth: "",
    Volume: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!priceData.Price) {
        setError("Price is required");
        return;
      }

      const newPrice = {
        Date: priceData.Date,
        Price: parseFloat(priceData.Price),
        Open: parseFloat(priceData.Open) || 0,
        High: parseFloat(priceData.High) || 0,
        ChangePercentFromLastMonth: parseFloat(priceData.ChangePercentFromLastMonth) || 0,
        Volume: priceData.Volume || "0",
      };

      const response = await postData<BitcoinPrice>(API_ENDPOINTS.BITCOIN_PRICES, newPrice);
      if (response.error) {
        throw new Error(response.error);
      }

      showNotification(
        "Price Added",
        `New Bitcoin price for ${priceData.Date} has been added successfully.`
      );

      // Reset form and navigate back
      setPriceData({
        Date: new Date().toLocaleDateString(),
        Price: "",
        Open: "",
        High: "",
        ChangePercentFromLastMonth: "",
        Volume: "",
      });
      navigation.goBack();
    } catch (error) {
      console.error("Error adding price:", error);
      setError(error instanceof Error ? error.message : "Failed to add price");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Add New Bitcoin Price</Text>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Date</Text>
          <DatePicker
            initialDate={new Date("2024-12-15")}
            onConfirm={(date) => setPriceData(prev => ({ ...prev, Date: date.toLocaleDateString() }))}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Price *</Text>
          <TextInput
            style={[styles.input, { 
              color: theme.colors.text,
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border
            }]}
            value={priceData.Price}
            onChangeText={(text) => setPriceData(prev => ({ ...prev, Price: text }))}
            keyboardType="numeric"
            placeholder="Enter price"
            placeholderTextColor={theme.colors.text}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Open</Text>
          <TextInput
            style={[styles.input, { 
              color: theme.colors.text,
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border
            }]}
            value={priceData.Open}
            onChangeText={(text) => setPriceData(prev => ({ ...prev, Open: text }))}
            keyboardType="numeric"
            placeholder="Enter opening price"
            placeholderTextColor={theme.colors.text}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>High</Text>
          <TextInput
            style={[styles.input, { 
              color: theme.colors.text,
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border
            }]}
            value={priceData.High}
            onChangeText={(text) => setPriceData(prev => ({ ...prev, High: text }))}
            keyboardType="numeric"
            placeholder="Enter highest price"
            placeholderTextColor={theme.colors.text}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Change % (Last Month)</Text>
          <TextInput
            style={[styles.input, { 
              color: theme.colors.text,
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border
            }]}
            value={priceData.ChangePercentFromLastMonth}
            onChangeText={(text) => setPriceData(prev => ({ ...prev, ChangePercentFromLastMonth: text }))}
            keyboardType="numeric"
            placeholder="Enter change percentage"
            placeholderTextColor={theme.colors.text}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Volume</Text>
          <TextInput
            style={[styles.input, { 
              color: theme.colors.text,
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border
            }]}
            value={priceData.Volume}
            onChangeText={(text) => setPriceData(prev => ({ ...prev, Volume: text }))}
            keyboardType="numeric"
            placeholder="Enter volume"
            placeholderTextColor={theme.colors.text}
          />
        </View>

        {error && (
          <Text style={[styles.errorText, { color: theme.colors.negative }]}>{error}</Text>
        )}

        <TouchableOpacity
          style={[styles.submitButton, { 
            backgroundColor: theme.colors.primary,
            opacity: loading ? 0.7 : 1
          }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? "Adding..." : "Add Price"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  submitButton: {
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  errorText: {
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },
});
