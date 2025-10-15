import { SettingsDialog } from './SettingsDialog';
import { StyleSheet, Text, View } from 'react-native';
import { FONT_FAMILY, GlobalStyles } from '../constants';

export const AppHeader = () => {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>Book Converter</Text>
      <SettingsDialog />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: GlobalStyles.fontSize.title1,
  },
});
