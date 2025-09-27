import Button from './ui/Button';
import { StyleSheet, Text, View } from 'react-native';
import { DocumentPickerAsset } from 'expo-document-picker';
import { COLORS } from '../constants';
import { useSettingsContext } from '../context/SettingsProvider';

interface SendButtonProps {
  selectedFile: DocumentPickerAsset | null;
  onSend: () => void;
}

export const SendButton = ({ selectedFile, onSend }: SendButtonProps) => {
  const { email } = useSettingsContext();

  return (
    <View>
      {!email && (
        <Text style={styles.error}>
          Set your Kindle email in settings to enable sending
        </Text>
      )}
      <Button
        shape="rounded"
        iconLeft="send-o"
        onPress={onSend}
        isDisabled={!selectedFile || !email}
      >
        Send to Kindle by Email
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  error: {
    color: COLORS.red,
  },
});
