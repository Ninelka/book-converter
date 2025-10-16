import React from 'react';
import { Text, Switch, StyleSheet, Pressable } from 'react-native';
import { COLORS, GlobalStyles } from '../constants';

interface SendingSwitchProps {
  isEnabled: boolean;
  onChange: () => void;
}

export const SendingSwitch = ({ isEnabled, onChange }: SendingSwitchProps) => {
  return (
    <Pressable onPress={onChange} style={styles.container}>
      <Text style={styles.label}>Send to device</Text>
      <Switch
        value={isEnabled}
        onValueChange={onChange}
        thumbColor={isEnabled ? COLORS.secondaryOrange : COLORS.grey6}
        trackColor={{ false: COLORS.grey1, true: COLORS.primaryOrange }}
      />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: GlobalStyles.spacing.m,
  },
  label: {
    fontSize: GlobalStyles.fontSize.callout,
  },
});
