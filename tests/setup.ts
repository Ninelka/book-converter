/* eslint-disable @typescript-eslint/no-require-imports -- Jest mock factories must load modules inside the factory. */
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);
jest.mock('react-native-toast-message', () => {
  const Toast = () => null;
  Toast.show = jest.fn();
  return { __esModule: true, default: Toast };
});
jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    FontAwesome: ({ name }: { name: string }) =>
      React.createElement(Text, null, name),
  };
});
jest.mock('@react-native-picker/picker', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  const Picker = (props: object) =>
    React.createElement(View, { ...props, testID: 'format-picker' });
  Picker.Item = function PickerItem({ label }: { label: string }) {
    return React.createElement(Text, null, label);
  };
  return { Picker };
});
