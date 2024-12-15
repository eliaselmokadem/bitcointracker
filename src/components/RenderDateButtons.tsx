import React, { useState } from "react";
import { View, Text, Pressable, Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { modalStyles } from "../styles/HomeScreen.styles";

interface DateSelectorProps {
  startDate: Date;
  endDate: Date;
  onDateChange: (date: Date, type: "start" | "end") => void;
}

const DateSelector: React.FC<DateSelectorProps> = ({
  startDate,
  endDate,
  onDateChange,
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dateType, setDateType] = useState<"start" | "end">("start");

  const handleDateSelection = (dateType: "start" | "end") => {
    setDateType(dateType);
    setSelectedDate(dateType === "start" ? startDate : endDate);
    setShowDatePicker(true);
  };

  const onConfirm = (date: Date | undefined) => {
    if (date) {
      onDateChange(date, dateType);
    }
    setShowDatePicker(false);
  };

  return (
    <View style={modalStyles.datePickerContainer}>
      <Pressable
        style={[modalStyles.datePickerButton, { backgroundColor: "#f5f5f5" }]}
        onPress={() => handleDateSelection("start")}
      >
        <Text style={[modalStyles.datePickerButtonText, { color: "#000" }]}>
          {startDate.toLocaleDateString()}
        </Text>
      </Pressable>
      <Text style={[modalStyles.dateSeparator, { color: "#000" }]}>to</Text>
      <Pressable
        style={[modalStyles.datePickerButton, { backgroundColor: "#f5f5f5" }]}
        onPress={() => handleDateSelection("end")}
      >
        <Text style={[modalStyles.datePickerButtonText, { color: "#000" }]}>
          {endDate.toLocaleDateString()}
        </Text>
      </Pressable>
      {showDatePicker && (
        <DateTimePicker
          testID="dateTimePicker"
          value={selectedDate}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(event, date) => onConfirm(date)}
          minimumDate={dateType === "end" ? startDate : undefined}
          maximumDate={dateType === "end" ? new Date() : endDate}
        />
      )}
    </View>
  );
};

export default DateSelector;
