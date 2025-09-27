import { Image, Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { COLORS } from '../../constants';
import { IoniconsType } from '../../types/expo-icons';

interface IconButtonProps {
  icon?: IoniconsType;
  src?: string;
  color?: string;
  bgColor?: string;
  type?: 'rounded' | 'ellipse';
  size?: 'large' | 'medium' | 'small' | 'extra-small';
  isDisabled?: boolean;
  onPress?: () => void;
}

const defaultButtonStyle: ViewStyle = {
  justifyContent: 'center',
  alignItems: 'center',
};

function IconButton({
  icon,
  src,
  color,
  bgColor = COLORS.primaryOrange,
  type = 'rounded',
  size = 'medium',
  isDisabled,
  onPress,
}: IconButtonProps) {
  const buttonSize = useMemo(() => {
    switch (size) {
      case 'large':
        return 80;
      case 'medium':
        return 64;
      case 'small':
        return 48;
      case 'extra-small':
        return 32;
      default:
        return 64;
    }
  }, [size]);

  const iconSize = useMemo(() => {
    switch (size) {
      case 'large':
        return 40;
      case 'medium':
        return 32;
      case 'small':
        return 24;
      case 'extra-small':
        return 16;
      default:
        return 32;
    }
  }, [size]);

  const buttonStyle = useMemo(() => {
    if (type !== 'ellipse') {
      defaultButtonStyle.borderRadius = 8;
    }

    return {
      ...defaultButtonStyle,
      backgroundColor: bgColor,
      width: buttonSize,
      height: buttonSize,
    };
  }, [type, bgColor, buttonSize]);

  const ellipseStyle = useMemo(() => {
    switch (size) {
      case 'large':
        return { borderRadius: 40 };
      case 'medium':
        return { borderRadius: 32 };
      case 'small':
        return { borderRadius: 24 };
      case 'extra-small':
        return { borderRadius: 8 };
      default:
        return { borderRadius: 32 };
    }
  }, [size]);

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => pressed && styles.pressed}
    >
      <View style={[buttonStyle, type === 'ellipse' && ellipseStyle]}>
        {icon && <Ionicons name={icon} size={iconSize} color={color} />}
        {src && (
          <Image
            source={{ uri: src }}
            style={{ width: iconSize, height: iconSize, tintColor: color }}
          />
        )}
      </View>
    </Pressable>
  );
}

export default IconButton;

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.7,
  },
});
