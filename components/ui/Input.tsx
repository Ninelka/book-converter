import {
  KeyboardType,
  StyleSheet,
  Text,
  TextInput,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { useRef, useMemo, useState } from 'react';
import Button from './Button';
import IconButton from './IconButton';
import { COLORS, FONT_FAMILY, GlobalStyles } from '../../constants';
import { IoniconsType } from '../../types/expo-icons';

interface InputProps {
  label?: string;
  value?: string;
  style?: TextStyle;
  invalid?: boolean;
  placeholder?: string;
  keyboardType?: KeyboardType;
  onBtnPress?: () => void;
  onChangeText?: (value: string) => void;
  iconRight?: IoniconsType;
  iconRightPress?: () => void;
  secureText?: boolean;
  inputStyle?: TextStyle;
  inputWrapperStyle?: ViewStyle;
  size?: 'large' | 'medium' | 'small';
}

function Input({
  label,
  value,
  style,
  invalid,
  placeholder,
  keyboardType,
  onBtnPress,
  onChangeText,
  iconRight,
  iconRightPress,
  secureText,
  inputStyle,
  inputWrapperStyle,
  size,
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const textInputRef = useRef<TextInput | null>(null);

  const inputHeight = useMemo(() => {
    switch (size) {
      case 'large':
        return { height: 56 };
      case 'medium':
        return { height: 44 };
      case 'small':
        return { height: 32 };
      default:
        return { height: 56 };
    }
  }, [size]);

  return (
    <View style={[styles.inputContainer, style]}>
      {label && (
        <Text style={[styles.label, invalid && styles.invalidLabel]}>
          {label}
        </Text>
      )}
      <View
        style={[
          styles.inputWrapper,
          inputWrapperStyle,
          isFocused && styles.focusedInput,
          (iconRight || onBtnPress) && styles.noPaddingRight,
          invalid && styles.invalidInput,
        ]}
      >
        <TextInput
          value={value}
          autoCapitalize="none"
          autoCorrect={false}
          style={[
            styles.input,
            inputHeight,
            inputStyle,
            invalid && styles.invalidInput,
            isFocused && styles.focusedInput,
          ]}
          placeholder={
            textInputRef.current?.isFocused() || value !== ''
              ? undefined
              : placeholder
          }
          keyboardType={keyboardType}
          placeholderTextColor={COLORS.labelsTertiary}
          secureTextEntry={secureText}
          cursorColor={COLORS.primaryGreen}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onChangeText={onChangeText}
        />
        {onBtnPress && (
          <Button
            onPress={onBtnPress}
            type="transparent"
            textStyle={styles.inputBtnText}
          >
            APPLY
          </Button>
        )}
        {iconRight && (
          <IconButton
            icon={iconRight}
            size="small"
            color={COLORS.grey1}
            bgColor="transparent"
            onPress={iconRightPress}
          />
        )}
      </View>
    </View>
  );
}

export default Input;

const styles = StyleSheet.create({
  inputContainer: {
    marginVertical: GlobalStyles.spacing.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: COLORS.separatorNotOpaque,
    borderRadius: 8,
    backgroundColor: 'transparent',
    paddingHorizontal: GlobalStyles.spacing.s,
    minWidth: GlobalStyles.spacing.l,
  },
  label: {
    fontFamily: FONT_FAMILY.regular,
    fontWeight: '400',
    fontSize: GlobalStyles.fontSize.headline,
    color: COLORS.labelsSecondary,
    marginBottom: GlobalStyles.spacing.xs,
  },
  input: {
    fontFamily: FONT_FAMILY.regular,
    fontWeight: '400',
    color: COLORS.labelsPrimary,
    fontSize: GlobalStyles.fontSize.headline,
    paddingVertical: 0,
  },
  invalidLabel: {
    color: COLORS.primaryOrange,
  },
  invalidInput: {
    borderColor: COLORS.primaryOrange,
  },
  focusedInput: {
    borderColor: COLORS.primaryGreen,
  },
  inputBtnText: {
    color: COLORS.primaryGreen,
    marginHorizontal: 0,
  },
  noPaddingRight: {
    paddingRight: 0,
  },
});
