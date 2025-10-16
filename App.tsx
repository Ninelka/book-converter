import { useState } from 'react';
import { AppHeader } from './components/AppHeader';
import { SendButton } from './components/SendButton';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { ConverterPanel } from './components/ConverterPanel';
import Toast from 'react-native-toast-message';
import { SettingsProvider } from './context/SettingsProvider';
import { useFileConverter } from './hooks/useFileConverter';
import { COLORS } from './constants';
import { SendingSwitch } from './components/SendingSwitch';
import { SaveButton } from './components/SaveButton';

export default function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [email, setEmail] = useState('');

  const {
    selectedFile,
    outputFormat,
    handleFileUpload,
    handleFormatChange,
    handleSendToKindle,
    isConverting,
    isSendingEnabled,
    toggleSwitch,
  } = useFileConverter();

  return (
    <SettingsProvider
      isSettingsOpen={isSettingsOpen}
      setIsSettingsOpen={setIsSettingsOpen}
      email={email}
      setEmail={setEmail}
    >
      <View style={styles.container}>
        <AppHeader />
        <View style={styles.content}>
          {isConverting && (
            <View style={styles.overlay}>
              <ActivityIndicator size="large" color={COLORS.primaryOrange} />
            </View>
          )}
          <ConverterPanel
            selectedFile={selectedFile}
            outputFormat={outputFormat}
            onFileUpload={handleFileUpload}
            onFormatChange={handleFormatChange}
          />
        </View>
        <SendingSwitch isEnabled={isSendingEnabled} onChange={toggleSwitch} />
        {isSendingEnabled ? (
          <SendButton
            selectedFile={selectedFile}
            onSend={() => handleSendToKindle(email)}
            isConverting={isConverting}
          />
        ) : (
          <SaveButton
            selectedFile={selectedFile}
            // TODO: add saving converted file
            onSave={() => console.log('File saved to storage!')}
          />
        )}
        <Toast />
      </View>
    </SettingsProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  content: {
    position: 'relative',
    flex: 1,
    justifyContent: 'space-around',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    zIndex: 1,
  },
});
