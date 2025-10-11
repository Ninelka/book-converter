import * as MailComposer from 'expo-mail-composer';

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
};
