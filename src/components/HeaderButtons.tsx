import React from "react";
import { View, TouchableOpacity, Text, StyleProp, TextStyle } from "react-native";
import { styles } from "../styles/HomeScreen.styles";
import  DatePicker  from "./DatePicker";

interface HeaderButtonsProps {
  theme: any;
  onRefresh: () => void;
  onAddNew: () => void;
  startDate: Date;
  endDate: Date;
  onStartDateChange: (date: Date) => void;
  onEndDateChange: (date: Date) => void;
}

export const HeaderButtons: React.FC<HeaderButtonsProps> = ({
  theme,
  onRefresh,
  onAddNew,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}) => {
  const handleStartDateChange = (date: Date) => {
    console.log('Start date changing to:', date.toISOString());
    if (date > endDate) {
      // If selected start date is after end date, adjust end date
      onEndDateChange(new Date(date.getTime()));
    }
    onStartDateChange(date);
  };

  const handleEndDateChange = (date: Date) => {
    console.log('End date changing to:', date.toISOString());
    if (date < startDate) {
      // If selected end date is before start date, adjust start date
      onStartDateChange(new Date(date.getTime()));
    }
    onEndDateChange(date);
  };

  return (
    <View style={styles.header}>
      <View style={styles.datePickerContainer}>
        <View style={styles.datePickerWrapper}>
          <DatePicker
            initialDate={startDate}
            onConfirm={handleStartDateChange}
          />
        </View>
        <Text style={[styles.datePickerSeparator, { color: theme.text }]}>
          to
        </Text>
        <View style={styles.datePickerWrapper}>
          <DatePicker
            initialDate={endDate}
            onConfirm={handleEndDateChange}
          />
        </View>
      </View>
      <View style={styles.headerButtons}>
        <TouchableOpacity
          style={[styles.headerButton, { backgroundColor: theme.accent }]}
          onPress={onRefresh}
        >
          <Text style={styles.headerButtonText}>Refresh</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.headerButton, { backgroundColor: theme.accent }]}
          onPress={onAddNew}
        >
          <Text style={styles.headerButtonText}>Add New</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
