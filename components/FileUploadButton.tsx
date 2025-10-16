import { COLORS, GlobalStyles } from '../constants';
import {
  GestureResponderEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { DocumentPickerAsset } from 'expo-document-picker';

interface FileUploadButtonProps {
  selectedFile: DocumentPickerAsset | null;
  onFileUpload: (event: GestureResponderEvent) => void;
}

export const FileUploadButton = ({
  selectedFile,
  onFileUpload,
}: FileUploadButtonProps) => {
  return (
    <Pressable
      onPress={onFileUpload}
      style={({ pressed }) => pressed && styles.pressed}
    >
      <View style={styles.container}>
        <FontAwesome name="upload" size={40} color={COLORS.primaryOrange} />
        <Text style={styles.title}>
          {selectedFile ? selectedFile.name : 'Upload File'}
        </Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.7,
  },
  title: {
    fontSize: GlobalStyles.fontSize.button,
  },
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    padding: GlobalStyles.spacing.xs,
    borderRadius: GlobalStyles.spacing.xs,
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: COLORS.grey3,
    width: 200,
    height: 200,
  },
});
