import * as MailComposer from 'expo-mail-composer';
import * as FileSystem from 'expo-file-system/legacy';

export const sendConvertedFileToEmail = async (
  email: string,
  outputPath: string
) => {
  // Проверяем наличие email клиента
  const isAvailable = await MailComposer.isAvailableAsync();

  if (!isAvailable) {
    throw new Error('Email client is not available!');
  }

  await MailComposer.composeAsync({
    recipients: [email],
    subject: '',
    body: '',
    attachments: [outputPath],
  });

  try {
    await FileSystem.deleteAsync(outputPath, { idempotent: true });
  } catch (e) {
    console.warn('Ошибка удаления временного файла:', e);
  }
};
