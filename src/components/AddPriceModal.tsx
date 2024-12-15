import React from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import { modalStyles } from "../styles/HomeScreen.styles";
import  DatePicker  from "./DatePicker";

interface AddPriceModalProps {
  visible: boolean;
  onClose: () => void;
  theme: any;
  priceData: {
    Date: string;
    Price: string;
    Open: string;
    High: string;
    ChangePercentFromLastMonth: string;
    Volume: string;
  };
  onPriceDataChange: (field: string, value: string) => void;
  onSubmit: () => void;
}

export const AddPriceModal: React.FC<AddPriceModalProps> = ({
  visible,
  onClose,
  theme,
  priceData,
  onPriceDataChange,
  onSubmit,
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={modalStyles.modalContainer}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
          style={[modalStyles.modalContent, { backgroundColor: theme.background }]}
        >
          <View style={modalStyles.modalHeader}>
            <Text style={[modalStyles.modalTitle, { color: theme.text }]}>
              Add New Bitcoin Price
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Text
                style={[
                  modalStyles.modalCloseButton,
                  { color: theme.secondaryText },
                ]}
              >
                ✕
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={modalStyles.modalScrollView}>
            <View style={modalStyles.formGroup}>
              <Text style={[modalStyles.label, { color: theme.text }]}>
                Date
              </Text>
              <DatePicker
                initialDate={new Date(priceData.Date)}
                onConfirm={(date) =>
                  onPriceDataChange("Date", date.toLocaleDateString())
                }
              />
            </View>

            <View style={modalStyles.formGroup}>
              <Text style={[modalStyles.label, { color: theme.text }]}>
                Price
              </Text>
              <TextInput
                style={[
                  modalStyles.input,
                  {
                    color: theme.text,
                    backgroundColor: theme.cardBackground,
                    borderColor: theme.border,
                  },
                ]}
                value={priceData.Price}
                onChangeText={(text) => onPriceDataChange("Price", text)}
                keyboardType="numeric"
                placeholder="Enter price"
                placeholderTextColor={theme.secondaryText}
              />
            </View>

            <View style={modalStyles.formGroup}>
              <Text style={[modalStyles.label, { color: theme.text }]}>
                Open
              </Text>
              <TextInput
                style={[
                  modalStyles.input,
                  {
                    color: theme.text,
                    backgroundColor: theme.cardBackground,
                    borderColor: theme.border,
                  },
                ]}
                value={priceData.Open}
                onChangeText={(text) => onPriceDataChange("Open", text)}
                keyboardType="numeric"
                placeholder="Enter opening price"
                placeholderTextColor={theme.secondaryText}
              />
            </View>

            <View style={modalStyles.formGroup}>
              <Text style={[modalStyles.label, { color: theme.text }]}>
                High
              </Text>
              <TextInput
                style={[
                  modalStyles.input,
                  {
                    color: theme.text,
                    backgroundColor: theme.cardBackground,
                    borderColor: theme.border,
                  },
                ]}
                value={priceData.High}
                onChangeText={(text) => onPriceDataChange("High", text)}
                keyboardType="numeric"
                placeholder="Enter highest price"
                placeholderTextColor={theme.secondaryText}
              />
            </View>

            <View style={modalStyles.formGroup}>
              <Text style={[modalStyles.label, { color: theme.text }]}>
                Change % from Last Month
              </Text>
              <TextInput
                style={[
                  modalStyles.input,
                  {
                    color: theme.text,
                    backgroundColor: theme.cardBackground,
                    borderColor: theme.border,
                  },
                ]}
                value={priceData.ChangePercentFromLastMonth}
                onChangeText={(text) =>
                  onPriceDataChange("ChangePercentFromLastMonth", text)
                }
                keyboardType="numeric"
                placeholder="Enter change percentage"
                placeholderTextColor={theme.secondaryText}
              />
            </View>

            <View style={modalStyles.formGroup}>
              <Text style={[modalStyles.label, { color: theme.text }]}>
                Volume
              </Text>
              <TextInput
                style={[
                  modalStyles.input,
                  {
                    color: theme.text,
                    backgroundColor: theme.cardBackground,
                    borderColor: theme.border,
                  },
                ]}
                value={priceData.Volume}
                onChangeText={(text) => onPriceDataChange("Volume", text)}
                placeholder="Enter volume (e.g., 500.00K)"
                placeholderTextColor={theme.secondaryText}
              />
            </View>
          </ScrollView>

          <View style={modalStyles.buttonContainer}>
            <TouchableOpacity
              style={[modalStyles.modalButton, modalStyles.cancelButton]}
              onPress={onClose}
            >
              <Text style={[modalStyles.buttonText, modalStyles.cancelButtonText]}>
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[modalStyles.submitButton, { backgroundColor: theme.primary }]}
              onPress={() => {
                if (!priceData.Price) {
                  Alert.alert("Error", "Price is required");
                  return;
                }
                onSubmit();
              }}
            >
              <Text style={modalStyles.submitButtonText}>Add Price</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};
