import { Picker } from '@react-native-picker/picker';

const AVAILABLE_FORMATS = ['epub', 'fb2', 'mobi', 'pdf', 'txt', 'azw3'];

interface SelectFormatProps {
  outputFormat: string;
  onFormatChange: (format: string) => void;
}

export const SelectFormat = ({
  outputFormat,
  onFormatChange,
}: SelectFormatProps) => {
  return (
    <>
      <Picker
        mode="dropdown"
        selectedValue={outputFormat}
        onValueChange={(itemValue) => onFormatChange(itemValue)}
      >
        {AVAILABLE_FORMATS.map((format) => (
          <Picker.Item
            key={format}
            label={format.toUpperCase()}
            value={format}
          />
        ))}
      </Picker>
    </>
  );
};
