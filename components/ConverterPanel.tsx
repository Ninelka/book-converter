import { GestureResponderEvent, View } from 'react-native';
import { FileUploadButton } from './FileUploadButton';
import { FileInfo } from './FileInfo';
import { SelectFormat } from './SelectFormat';
import { DocumentPickerAsset } from 'expo-document-picker';

interface ConverterPanelProps {
  selectedFile: DocumentPickerAsset | null;
  outputFormat: string;
  onFileUpload: (event: GestureResponderEvent) => void;
  onFormatChange: (format: string) => void;
}

export const ConverterPanel = ({
  selectedFile,
  outputFormat,
  onFileUpload,
  onFormatChange,
}: ConverterPanelProps) => {
  return (
    <View>
      <>
        <FileUploadButton
          selectedFile={selectedFile}
          onFileUpload={onFileUpload}
        />
        <SelectFormat
          outputFormat={outputFormat}
          onFormatChange={onFormatChange}
        />
      </>
      <FileInfo selectedFile={selectedFile} outputFormat={outputFormat} />
    </View>
  );
};
