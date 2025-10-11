import { useState } from 'react';
import { DocumentPickerAsset, getDocumentAsync } from 'expo-document-picker';
import Toast from 'react-native-toast-message';
import { FileConversionService } from '../services/fileConversion.service';

export const useFileConverter = () => {
  const [selectedFile, setSelectedFile] = useState<DocumentPickerAsset | null>(
    null
  );
  const [outputFormat, setOutputFormat] = useState('epub');

  const handleFileUpload = async () => {
    const result = await getDocumentAsync({});
    const file = result?.assets?.[0];

    if (!result.canceled && file) {
      setSelectedFile(file);
      Toast.show({
        type: 'success',
        text1: `File "${file.name}" uploaded successfully`,
      });
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
        await FileConversionService.convertAndSend({
          file: selectedFile,
          outputFormat,
          email,
        });
      } catch (error) {
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
  };
};
