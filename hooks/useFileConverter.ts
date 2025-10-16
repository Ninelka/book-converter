import { useState } from 'react';
import { DocumentPickerAsset, getDocumentAsync } from 'expo-document-picker';
import Toast from 'react-native-toast-message';
import { FileConversionService } from '../services/fileConversion.service';

export const useFileConverter = () => {
  const [selectedFile, setSelectedFile] = useState<DocumentPickerAsset | null>(
    null
  );
  const [outputFormat, setOutputFormat] = useState('epub');
  const [isConverting, setIsConverting] = useState(false);
  const [isSendingEnabled, setIsSendingEnabled] = useState(true);

  const toggleSwitch = () => setIsSendingEnabled((prev) => !prev);

  const handleFileUpload = async () => {
    const result = await getDocumentAsync({});
    const file = result?.assets?.[0];

    if (!result.canceled && file) {
      setSelectedFile(file);
    }
  };

  const handleSendToKindle = async (email: string) => {
    const validationMessage = FileConversionService.getValidationMessage(
      selectedFile,
      email
    );

    if (validationMessage) {
      Toast.show({
        type: 'error',
        text1: validationMessage,
      });
      return;
    }

    if (selectedFile) {
      try {
        setIsConverting(true);

        await FileConversionService.convertAndSend({
          file: selectedFile,
          outputFormat,
          email,
        }).then(() => {
          Toast.show({
            type: 'success',
            text1: `File converted & sent successfully`,
          });
          setSelectedFile(null);
          setIsConverting(false);
        });
      } catch (error) {
        setIsConverting(false);
        Toast.show({
          type: 'error',
          text1: 'Failed to convert and send file',
        });
      }
    }
  };

  return {
    selectedFile,
    outputFormat,
    handleFileUpload,
    handleSendToKindle,
    handleFormatChange: setOutputFormat,
    isConverting,
    isSendingEnabled,
    toggleSwitch,
  };
};
