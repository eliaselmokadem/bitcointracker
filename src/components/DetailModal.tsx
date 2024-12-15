import React from "react";
import { View, Text, Modal, TouchableOpacity } from "react-native";
import { modalStyles } from "../styles/shared.styles";
import { BitcoinPrice } from "../types/BitcoinPrice";

interface DetailModalProps {
  visible: boolean;
  onClose: () => void;
  price: BitcoinPrice | null;
  theme: any;
  getPercentageColor: (percentage: number) => string;
  isFavorite: (price: BitcoinPrice) => boolean;
  onAddToFavorites: (price: BitcoinPrice) => void;
  onRemoveFromFavorites: (price: BitcoinPrice) => void;
}

export const DetailModal: React.FC<DetailModalProps> = ({
  visible,
  onClose,
  price,
  theme,
  getPercentageColor,
  isFavorite,
  onAddToFavorites,
  onRemoveFromFavorites,
}) => {
  if (!price) return null;

  const isCurrentlyFavorite = isFavorite(price);

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={modalStyles.modalOverlay}>
        <View
          style={[
            modalStyles.modalView,
            { backgroundColor: theme.colors.card },
          ]}
        >
          <Text style={[modalStyles.modalTitle, { color: theme.colors.text }]}>
            Bitcoin Price Details
          </Text>
          <View style={modalStyles.modalContent}>
            <View style={modalStyles.modalRow}>
              <Text
                style={[modalStyles.modalLabel, { color: theme.colors.secondaryText }]}
              >
                Date:
              </Text>
              <Text style={[modalStyles.modalValue, { color: theme.colors.text }]}>
                {price.Date}
              </Text>
            </View>
            <View style={modalStyles.modalRow}>
              <Text
                style={[modalStyles.modalLabel, { color: theme.colors.secondaryText }]}
              >
                Price:
              </Text>
              <Text style={[modalStyles.modalValue, { color: theme.colors.text }]}>
                ${Number(price.Price).toLocaleString()}
              </Text>
            </View>
            <View style={modalStyles.modalRow}>
              <Text
                style={[modalStyles.modalLabel, { color: theme.colors.secondaryText }]}
              >
                Change:
              </Text>
              <Text
                style={[
                  modalStyles.modalValue,
                  { color: getPercentageColor(price.ChangePercentFromLastMonth || 0) },
                ]}
              >
                {(price.ChangePercentFromLastMonth || 0) >= 0 ? "+" : ""}
                {(price.ChangePercentFromLastMonth || 0).toFixed(2)}%
              </Text>
            </View>
            <View style={modalStyles.modalRow}>
              <Text
                style={[modalStyles.modalLabel, { color: theme.colors.secondaryText }]}
              >
                Volume:
              </Text>
              <Text style={[modalStyles.modalValue, { color: theme.colors.text }]}>
                {price.Volume || "N/A"}
              </Text>
            </View>
            <View style={modalStyles.modalRow}>
              <Text
                style={[modalStyles.modalLabel, { color: theme.colors.secondaryText }]}
              >
                High:
              </Text>
              <Text style={[modalStyles.modalValue, { color: theme.colors.text }]}>
                ${Number(price.High).toLocaleString()}
              </Text>
            </View>
            <View style={[modalStyles.modalRow, { borderBottomWidth: 0 }]}>
              <Text
                style={[modalStyles.modalLabel, { color: theme.colors.secondaryText }]}
              >
                Open:
              </Text>
              <Text style={[modalStyles.modalValue, { color: theme.colors.text }]}>
                ${Number(price.Open).toLocaleString()}
              </Text>
            </View>
          </View>
          <View style={modalStyles.modalButtons}>
            <TouchableOpacity
              style={[
                modalStyles.modalButton,
                { backgroundColor: theme.colors.primary },
              ]}
              onPress={onClose}
            >
              <Text style={modalStyles.modalButtonText}>Close</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                modalStyles.modalButton,
                {
                  backgroundColor: isCurrentlyFavorite
                    ? theme.colors.negative
                    : theme.colors.positive,
                },
              ]}
              onPress={() => {
                if (isCurrentlyFavorite) {
                  onRemoveFromFavorites(price);
                } else {
                  onAddToFavorites(price);
                }
              }}
            >
              <Text style={modalStyles.modalButtonText}>
                {isCurrentlyFavorite ? "Remove from Favorites" : "Add to Favorites"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
