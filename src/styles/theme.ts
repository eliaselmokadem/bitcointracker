export const getTheme = (isDarkMode: boolean) => ({
  background: isDarkMode ? '#0D1117' : '#FFFFFF',
  cardBackground: isDarkMode ? '#161B22' : '#F6F8FA',
  text: isDarkMode ? '#FFFFFF' : '#0D1117',
  secondaryText: isDarkMode ? '#8B949E' : '#57606A',
  accent: '#2E77D0',
  positive: '#4CAF50',
  negative: '#FF5252',
  border: isDarkMode ? '#30363D' : '#D0D7DE',
});
