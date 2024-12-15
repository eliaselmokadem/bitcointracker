import React, { useState, useEffect } from "react";
import { Modal, View, Pressable, Text, Platform, StyleSheet } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useTheme } from "../context/ThemeContext";

interface DatePickerProps {
  initialDate?: Date;
  onConfirm: (date: Date) => void;
}

const DatePicker: React.FC<DatePickerProps> = ({
  initialDate = new Date(),
  onConfirm,
}) => {
  const { isDarkMode } = useTheme();
  const [date, setDate] = useState(initialDate);
  const [show, setShow] = useState(false);

  // Update internal date when initialDate prop changes
  useEffect(() => {
    setDate(initialDate);
  }, [initialDate]);

  const handleChange = (event: any, selectedDate: Date | undefined) => {
    if (event.type === 'dismissed') {
      setShow(false);
      return;
    }
    
    const currentDate = selectedDate || date;
    setShow(Platform.OS === 'ios');
    setDate(currentDate);
    
    if (Platform.OS === 'android') {
      onConfirm(currentDate);
    }
  };

  const handleIOSConfirm = () => {
    setShow(false);
    onConfirm(date);
  };

  const theme = {
    text: isDarkMode ? "#ffffff" : "#000000",
    background: isDarkMode ? "#1a1a1a" : "#ffffff",
    cardBackground: isDarkMode ? "#2a2a2a" : "#f5f5f5",
    border: isDarkMode ? "#333333" : "#e0e0e0",
  };

  const formatDate = (date: Date): string => {
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  return (
    <>
      <Pressable
        onPress={() => setShow(true)}
        style={[
          styles.dateButton,
          { backgroundColor: theme.cardBackground, borderColor: theme.border }
        ]}
      >
        <Text style={[styles.dateText, { color: theme.text }]}>
          {formatDate(date)}
        </Text>
      </Pressable>

      {show && (
        Platform.OS === 'ios' ? (
          <Modal
            transparent={true}
            animationType="slide"
            visible={show}
            onRequestClose={() => setShow(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
                <DateTimePicker
                  value={date}
                  mode="date"
                  display="spinner"
                  onChange={handleChange}
                  style={styles.datePicker}
                />
                <View style={styles.buttonContainer}>
                  <Pressable
                    style={[styles.button, { backgroundColor: theme.cardBackground }]}
                    onPress={() => setShow(false)}
                  >
                    <Text style={[styles.buttonText, { color: theme.text }]}>Cancel</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.button, { backgroundColor: '#007AFF' }]}
                    onPress={handleIOSConfirm}
                  >
                    <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>Confirm</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </Modal>
        ) : (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={handleChange}
          />
        )
      )}
    </>
  );
};

const styles = StyleSheet.create({
  dateButton: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    width: "100%",
  },
  dateText: {
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  modalContent: {
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  datePicker: {
    height: 200,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default DatePicker;
