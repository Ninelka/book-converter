import { useRef, useState } from 'react';
import { DocumentPickerAsset, getDocumentAsync } from 'expo-document-picker';
import { Platform } from 'react-native';
import Toast from 'react-native-toast-message';
import { FileConversionService } from '../services/fileConversion.service';

export const useFileConverter = () => {
  const [selectedFile, setSelectedFile] = useState<DocumentPickerAsset | null>(
    null
  );
  const [outputFormat, setOutputFormat] = useState('epub');
  const [isConverting, setIsConverting] = useState(false);
  const [isSendingEnabled, setIsSendingEnabled] = useState(true);
  const busy = useRef(false);

  const toggleSwitch = () => {
    if (!busy.current) setIsSendingEnabled((prev) => !prev);
  };

  const handleFileUpload = async () => {
    if (busy.current) return;
    try {
      const result = await getDocumentAsync({
        copyToCacheDirectory: Platform.OS !== 'android',
      });
      const file = result.assets?.[0];
      if (!result.canceled && file) setSelectedFile(file);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Could not select file',
        text2: error instanceof Error ? error.message : String(error),
      });
    }
  };

  const convert = async (mode: 'send' | 'save', email?: string) => {
    if (busy.current) return;
    const validationMessage = FileConversionService.getValidationMessage(
      selectedFile,
      mode === 'send' ? (email ?? '') : undefined
    );
    if (validationMessage) {
      Toast.show({ type: 'error', text1: validationMessage });
      return;
    }
    if (!selectedFile) return;

    busy.current = true;
    setIsConverting(true);
    try {
      const result =
        mode === 'send'
          ? await FileConversionService.convertAndSend({
              file: selectedFile,
              outputFormat,
              email: email!,
            })
          : await FileConversionService.convertAndSave({
              file: selectedFile,
              outputFormat,
            });

      if (result === 'cancelled') {
        Toast.show({
          type: 'info',
          text1: mode === 'send' ? 'Sending cancelled' : 'Saving cancelled',
        });
      } else if (mode === 'send' && result === 'sent') {
        Toast.show({
          type: 'success',
          text1: 'File converted & sent successfully',
        });
        setSelectedFile(null);
      } else if (mode === 'save' && result === 'saved') {
        Toast.show({ type: 'success', text1: 'Converted file saved' });
        setSelectedFile(null);
      } else {
        Toast.show({
          type: 'info',
          text1:
            mode === 'save'
              ? 'File ready to save or share'
              : result === 'saved'
                ? 'Email draft saved'
                : 'Opened email app',
        });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error('Failed to convert file:', error);
      Toast.show({
        type: 'error',
        text1:
          mode === 'send'
            ? 'Failed to convert and send file'
            : 'Failed to convert and save file',
        text2: errorMessage,
      });
    } finally {
      busy.current = false;
      setIsConverting(false);
    }
  };

  return {
    selectedFile,
    outputFormat,
    handleFileUpload,
    handleSendToKindle: (email: string) => convert('send', email),
    handleSave: () => convert('save'),
    handleFormatChange: (format: string) => {
      if (!busy.current) setOutputFormat(format);
    },
    isConverting,
    isSendingEnabled,
    toggleSwitch,
  };
};
