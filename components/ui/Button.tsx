import {
  Pressable,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ReactNode, useMemo } from 'react';
import { COLORS, FONT_FAMILY, GlobalStyles } from '../../constants';
import { IoniconsType } from '../../types/expo-icons';

interface IButton {
  children: ReactNode;
  iconLeft?: IoniconsType;
  iconRight?: IoniconsType;
  onPress?: () => void;
  type?: 'primary' | 'secondary' | 'transparent';
  shape?: 'rectangle' | 'ellipse' | 'rounded';
  size?: 'large' | 'medium' | 'small';
  isCentered?: boolean;
  isDisabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const defaultButtonStyle = {};

function Button({
  children,
  iconLeft,
  iconRight,
  onPress,
  type = 'primary',
  shape = 'rectangle',
  size = 'medium',
  isCentered = true,
  isDisabled,
  style,
  textStyle,
}: IButton) {
  const btnBorderRadius = useMemo(() => {
    switch (shape) {
      case 'ellipse':
        return {
          borderRadius: 28,
        };
      case 'rounded':
        return {
          borderRadius: 8,
        };
      default:
        return;
    }
  }, [shape]);

  const btnBgColor = useMemo(() => {
    switch (type) {
      case 'primary':
        if (isDisabled) {
          return {
            backgroundColor: COLORS.grey5,
          };
        }
        return {
          backgroundColor: COLORS.primaryOrange,
        };
      case 'secondary':
        if (isDisabled) {
          return {
            backgroundColor: 'transparent',
            borderColor: COLORS.grey3,
            borderWidth: 1,
          };
        }

        return {
          backgroundColor: 'transparent',
          borderColor: COLORS.primaryOrange,
          borderWidth: 1,
        };
      case 'transparent':
        return {
          backgroundColor: 'transparent',
        };
    }
  }, [isDisabled, type]);

  const btnSize = useMemo(() => {
    switch (size) {
      case 'large':
        return {
          paddingVertical: GlobalStyles.spacing.s,
        };
      case 'medium':
        return {
          paddingVertical: 12,
        };
      case 'small':
        return {
          paddingVertical: 10,
        };
    }
  }, [size]);

  const iconColor = useMemo(() => {
    if (isDisabled) {
      return COLORS.disable;
    }

    switch (type) {
      case 'primary':
        return COLORS.white;
      case 'secondary':
        return COLORS.primaryOrange;
    }
  }, [type, isDisabled]);

  const btnTextAlign = useMemo(() => {
    return isCentered ? 'center' : 'space-between';
  }, [isCentered]);

  const buttonStyle: ViewStyle = useMemo(() => {
    return {
      ...defaultButtonStyle,
      ...btnBorderRadius,
      ...btnBgColor,
      ...btnSize,
      fontFamily: FONT_FAMILY.regular,
      fontWeight: '400',
      paddingHorizontal: GlobalStyles.spacing.s,
      flexDirection: 'row',
      justifyContent: btnTextAlign,
      alignItems: 'center',
      ...style,
    };
  }, [btnBorderRadius, btnBgColor, btnSize, btnTextAlign, style]);
  return (
    <View style={style}>
      <Pressable
        disabled={isDisabled}
        onPress={onPress}
        style={({ pressed }) => [pressed && styles.pressed]}
      >
        <View style={buttonStyle}>
          {iconLeft && <Ionicons name={iconLeft} size={20} color={iconColor} />}
          <Text
            style={[
              styles.buttonText,
              type === 'secondary' && styles.secondaryText,
              isCentered && styles.centeredText,
              isDisabled && styles.disabledText,
              textStyle,
            ]}
          >
            {children}
          </Text>
          {iconRight && (
            <Ionicons name={iconRight} size={20} color={iconColor} />
          )}
        </View>
      </Pressable>
    </View>
  );
}

export default Button;

const styles = StyleSheet.create({
  secondary: {
    backgroundColor: 'transparent',
  },
  buttonText: {
    color: COLORS.white,
    fontSize: GlobalStyles.fontSize.button,
  },
  secondaryText: {
    color: COLORS.primaryOrange,
  },
  disabledText: {
    color: COLORS.disable,
  },
  centeredText: {
    marginHorizontal: GlobalStyles.spacing.s,
  },
  pressed: {
    opacity: 0.75,
    borderRadius: 4,
  },
});
