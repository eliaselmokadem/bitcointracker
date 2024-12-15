import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

type StylesType = {
  container: ViewStyle;
  list: ViewStyle;
  header: ViewStyle;
  datePickerContainer: ViewStyle;
  datePickerWrapper: ViewStyle;
  datePickerSeparator: TextStyle;
  buttonContainer: ViewStyle;
};

export const styles = StyleSheet.create<StylesType>({
  container: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    height: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    backgroundColor: '#fff',
  },
  datePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  datePickerWrapper: {
    marginHorizontal: 4,
  },
  datePickerSeparator: {
    marginHorizontal: 8,
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 8,
  },
});
