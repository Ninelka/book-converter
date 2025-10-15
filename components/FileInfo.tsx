import { StyleSheet, Text, View } from 'react-native';
import { COLORS, GlobalStyles } from '../constants';
import { DocumentPickerAsset } from 'expo-document-picker';

interface FileInfoProps {
  selectedFile: DocumentPickerAsset | null;
  outputFormat: string;
}

export const FileInfo = ({ selectedFile, outputFormat }: FileInfoProps) => {
  const fileSize = selectedFile?.size
    ? (selectedFile.size / 1024 / 1024).toFixed(2)
    : '–';

  if (!selectedFile) return null;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.title}>File:</Text>
        <Text numberOfLines={3}>{selectedFile.name}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.title}>Size:</Text>
        <Text>{`${fileSize} MB`}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.title}>Convert to:</Text>
        <Text>{outputFormat.toUpperCase()}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.bgTertiary,
    padding: GlobalStyles.spacing.s,
    borderRadius: GlobalStyles.spacing.s,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: GlobalStyles.spacing.xs,
    flexWrap: 'wrap',
  },
  title: {
    fontWeight: 'bold',
    fontSize: GlobalStyles.fontSize.callout,
    width: 100,
  },
});
