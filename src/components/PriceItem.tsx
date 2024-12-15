import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { styles } from "../styles/HomeScreen.styles";
import { BitcoinPrice } from "../types/BitcoinPrice";

interface PriceItemProps {
  item: BitcoinPrice;
  theme: any;
  onPress: () => void;
  onLongPress: () => void;
  getPercentageColor: (percentage: number) => string;
}

export const PriceItem: React.FC<PriceItemProps> = ({
  item,
  theme,
  onPress,
  onLongPress,
  getPercentageColor,
}) => {
  return (
    <TouchableOpacity
      style={[styles.priceItem, { backgroundColor: theme.cardBackground }]}
      onPress={onPress}
      onLongPress={onLongPress}
    >
      <View style={styles.priceHeader}>
        <Text style={[styles.priceDate, { color: theme.text }]}>
          {item.Date}
        </Text>
        <Text
          style={[
            styles.priceChange,
            { color: getPercentageColor(item.ChangePercentFromLastMonth || 0) },
          ]}
        >
          {(item.ChangePercentFromLastMonth || 0) >= 0 ? "+" : ""}
          {(item.ChangePercentFromLastMonth || 0).toFixed(2)}%
        </Text>
      </View>
      <View style={styles.priceDetails}>
        <View style={styles.priceColumn}>
          <Text style={[styles.priceLabel, { color: theme.secondaryText }]}>
            Price
          </Text>
          <Text style={[styles.priceValue, { color: theme.text }]}>
            ${(item.Price || 0).toLocaleString()}
          </Text>
        </View>
        <View style={styles.priceColumn}>
          <Text style={[styles.priceLabel, { color: theme.secondaryText }]}>
            Volume
          </Text>
          <Text style={[styles.priceValue, { color: theme.text }]}>
            {item.Volume || "0"}
          </Text>
        </View>
        <View style={styles.priceColumn}>
          <Text style={[styles.priceLabel, { color: theme.secondaryText }]}>
            High
          </Text>
          <Text style={[styles.priceValue, { color: theme.text }]}>
            ${(item.High || 0).toLocaleString()}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};
