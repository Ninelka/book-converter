import { useState } from 'react';
import { AppHeader } from './components/AppHeader';
import { SendButton } from './components/SendButton';
import { View, StyleSheet } from 'react-native';
import { ConverterPanel } from './components/ConverterPanel';
import Toast from 'react-native-toast-message';
import { SettingsProvider } from './context/SettingsProvider';
import { useFileConverter } from './hooks/useFileConverter';

export default function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [email, setEmail] = useState('');

  const {
    selectedFile,
    outputFormat,
    handleFileUpload,
    handleFormatChange,
    handleSendToKindle,
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
          <ConverterPanel
            selectedFile={selectedFile}
            outputFormat={outputFormat}
            onFileUpload={handleFileUpload}
            onFormatChange={handleFormatChange}
          />
        </View>
        <SendButton
          selectedFile={selectedFile}
          onSend={() => handleSendToKindle(email)}
        />
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
    flex: 1,
    justifyContent: 'space-around',
  },
});
