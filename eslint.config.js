import expoConfig from 'eslint-config-expo/flat.js';

export default [
  ...expoConfig,
  {
    files: ['*.ts', '*.tsx', '*.d.ts'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
      },
    },
  },
];
