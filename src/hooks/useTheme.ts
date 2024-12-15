import { useColorScheme } from 'react-native';

export const useTheme = () => {
  const colorScheme = useColorScheme();
  
  const isDarkMode = colorScheme === 'dark';
  
  const colors = {
    background: isDarkMode ? '#1a1a1a' : '#ffffff',
    text: isDarkMode ? '#ffffff' : '#000000',
    primary: '#ff9500',
    secondary: '#007AFF',
    border: isDarkMode ? '#333333' : '#e0e0e0',
    card: isDarkMode ? '#2a2a2a' : '#f5f5f5',
    positive: '#34C759',
    negative: '#FF3B30',
  };

  return {
    isDarkMode,
    colors,
  };
};
