import { createContext, PropsWithChildren, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { EMAIL_KEY } from '../constants';

type SettingsContextType = {
  email: string;
  setEmail: (email: string) => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (isOpen: boolean) => void;
};

const SettingsContext = createContext<SettingsContextType | undefined>(
  {} as SettingsContextType
);

export const SettingsProvider = ({
  children,
  email,
  setEmail,
  isSettingsOpen,
  setIsSettingsOpen,
}: PropsWithChildren<SettingsContextType>) => {
  useEffect(() => {
    AsyncStorage.getItem(EMAIL_KEY).then((storedEmail) => {
      if (storedEmail) setEmail(storedEmail);
    });
  }, [setEmail]);

  return (
    <SettingsContext.Provider
      value={{ isSettingsOpen, setIsSettingsOpen, email, setEmail }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettingsContext = () => {
  const context = useContext(SettingsContext);
  if (!context)
    throw new Error('useSettings must be used within SettingsProvider');
  return context;
};
