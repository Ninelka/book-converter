import * as MailComposer from 'expo-mail-composer';
import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';

export type MailResult = 'sent' | 'saved' | 'cancelled' | 'opened';

export const sendConvertedFileToEmail = async (
  email: string,
  outputPath: string
): Promise<MailResult> => {
  // Проверяем наличие email клиента
  const isAvailable = await MailComposer.isAvailableAsync();

  if (!isAvailable) {
    throw new Error('Email client is not available!');
  }

  const result = await MailComposer.composeAsync({
    recipients: [email],
    subject: '',
    body: '',
    attachments: [outputPath],
  });

  // Android only confirms opening the email app, not sending the message.
  // Keep its attachment available while the email app reads or saves it.
  if (Platform.OS === 'android') return 'opened';
  if (result.status === MailComposer.MailComposerStatus.CANCELLED)
    return 'cancelled';
  if (result.status === MailComposer.MailComposerStatus.SAVED) return 'saved';
  if (result.status !== MailComposer.MailComposerStatus.SENT) {
    throw new Error('Email was not sent');
  }

  try {
    await FileSystem.deleteAsync(outputPath, { idempotent: true });
  } catch (e) {
    console.warn('Ошибка удаления временного файла:', e);
  }
  return 'sent';
};
