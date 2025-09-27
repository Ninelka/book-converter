import { Picker } from '@react-native-picker/picker';

interface SelectFormatProps {
  outputFormat: string;
  onFormatChange: (format: string) => void;
}

export const SelectFormat = ({
  outputFormat,
  onFormatChange,
}: SelectFormatProps) => {
  const formats = ['epub', 'mobi', 'pdf', 'txt', 'azw3'];

  return (
    <>
      <Picker
        mode="dropdown"
        selectedValue={outputFormat}
        onValueChange={(itemValue) => onFormatChange(itemValue)}
      >
        {formats.map((format) => (
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
