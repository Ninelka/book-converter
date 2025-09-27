import { StyleSheet, View } from 'react-native';
import { COLORS, GlobalStyles } from '../../constants';

const Divider = () => <View style={styles.lineStyle} />;

export default Divider;

const styles = StyleSheet.create({
  lineStyle: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grey3,
    marginVertical: GlobalStyles.spacing.xs,
  },
});
