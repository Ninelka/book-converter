import Dialog from './ui/Dialog';
import Input from './ui/Input';
import IconButton from './ui/IconButton';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS, GlobalStyles, EMAIL_KEY } from '../constants';
import Button from './ui/Button';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { useSettingsContext } from '../context/SettingsProvider';

export const SettingsDialog = () => {
  const { email, setEmail, isSettingsOpen, setIsSettingsOpen } =
    useSettingsContext();

  const saveSettings = async () => {
    await AsyncStorage.setItem(EMAIL_KEY, email);
    setEmail(email);

    setIsSettingsOpen(false);

    Toast.show({
      type: 'success',
      text1: 'Email settings saved',
    });
  };

  return (
    <View>
      <IconButton
        type="ellipse"
        bgColor="transparent"
        color={COLORS.primaryOrange}
        icon="cog"
        onPress={() => setIsSettingsOpen(true)}
      />
      <Dialog
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        title="Settings"
      >
        <Text>
          Configure your Kindle email address for sending converted files.
        </Text>
        <Input
          keyboardType="email-address"
          placeholder="your-kindle-email@kindle.com"
          value={email}
          label="Email"
          onChangeText={(value) => setEmail(value)}
        />
        <View style={styles.actions}>
          <Button
            type="secondary"
            shape="rounded"
            onPress={() => setIsSettingsOpen(false)}
          >
            Cancel
          </Button>
          <Button shape="rounded" onPress={saveSettings}>
            Save
          </Button>
        </View>
      </Dialog>
    </View>
  );
};

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    gap: GlobalStyles.spacing.xs,
    justifyContent: 'space-between',
  },
});
