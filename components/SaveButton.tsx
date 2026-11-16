import Button from './ui/Button';
import { DocumentPickerAsset } from 'expo-document-picker';

interface SaveButtonProps {
  selectedFile: DocumentPickerAsset | null;
  onSave: () => void;
  isConverting?: boolean;
}

export const SaveButton = ({
  selectedFile,
  onSave,
  isConverting,
}: SaveButtonProps) => {
  return (
    <Button
      shape="rounded"
      iconLeft="download"
      onPress={onSave}
      isDisabled={!selectedFile || isConverting}
    >
      Convert and save
    </Button>
  );
};
