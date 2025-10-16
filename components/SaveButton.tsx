import Button from './ui/Button';
import { DocumentPickerAsset } from 'expo-document-picker';
import { useSettingsContext } from '../context/SettingsProvider';

interface SaveButtonProps {
  selectedFile: DocumentPickerAsset | null;
  onSave: () => void;
}

export const SaveButton = ({ selectedFile, onSave }: SaveButtonProps) => {
  const { email } = useSettingsContext();

  return (
    <Button
      shape="rounded"
      iconLeft="download"
      onPress={onSave}
      isDisabled={!selectedFile || !email}
    >
      Convert and save
    </Button>
  );
};
