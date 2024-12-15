// src/components/Header.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface HeaderProps {
  backgroundColor: string;
  error?: string | null;
}

const Header: React.FC<HeaderProps> = ({ backgroundColor, error }) => {
  return (
    <View style={[styles.header, { backgroundColor }]}>
      <View style={styles.headerContent}></View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  headerContent: {
    // Add styles for header content if needed
  },
  errorText: {
    color: "red",
    marginTop: 10,
    fontSize: 16,
  },
});

export default Header;
