import { Platform } from 'react-native';
import * as MailComposer from 'expo-mail-composer';
import * as FileSystem from 'expo-file-system/legacy';
import { sendConvertedFileToEmail } from '../services/sendConvertedFileToEmail';

jest.mock('expo-mail-composer', () => ({
  isAvailableAsync: jest.fn(),
  composeAsync: jest.fn(),
  MailComposerStatus: { SENT: 'sent', SAVED: 'saved', CANCELLED: 'cancelled' },
}));
jest.mock('expo-file-system/legacy', () => ({ deleteAsync: jest.fn() }));
const path = 'file:///documents/book.epub';
const originalOS = Platform.OS;
beforeEach(() => {
  jest.clearAllMocks();
  Platform.OS = 'ios';
  jest.mocked(MailComposer.isAvailableAsync).mockResolvedValue(true);
});
afterEach(() => {
  Platform.OS = originalOS;
});

test('requires an available email client', async () => {
  jest.mocked(MailComposer.isAvailableAsync).mockResolvedValue(false);
  await expect(
    sendConvertedFileToEmail('reader@kindle.com', path)
  ).rejects.toThrow(/not available/);
  expect(MailComposer.composeAsync).not.toHaveBeenCalled();
  expect(FileSystem.deleteAsync).not.toHaveBeenCalled();
});
test('attaches the converted file to the requested recipient', async () => {
  jest
    .mocked(MailComposer.composeAsync)
    .mockResolvedValue({ status: 'sent' } as MailComposer.MailComposerResult);
  await sendConvertedFileToEmail('reader@kindle.com', path);
  expect(MailComposer.composeAsync).toHaveBeenCalledWith(
    expect.objectContaining({
      recipients: ['reader@kindle.com'],
      attachments: [path],
    })
  );
});
test.each(['cancelled', 'saved'])(
  'preserves file when iOS reports %s',
  async (status) => {
    jest
      .mocked(MailComposer.composeAsync)
      .mockResolvedValue({ status } as MailComposer.MailComposerResult);
    expect(await sendConvertedFileToEmail('reader@kindle.com', path)).toBe(
      status
    );
    expect(FileSystem.deleteAsync).not.toHaveBeenCalled();
  }
);
test('reports confirmed iOS sending and cleans temporary attachment', async () => {
  jest
    .mocked(MailComposer.composeAsync)
    .mockResolvedValue({ status: 'sent' } as MailComposer.MailComposerResult);
  expect(await sendConvertedFileToEmail('reader@kindle.com', path)).toBe(
    'sent'
  );
  expect(FileSystem.deleteAsync).toHaveBeenCalledWith(path, {
    idempotent: true,
  });
});
test('reports Android handoff without claiming delivery or deleting the attachment', async () => {
  Platform.OS = 'android';
  jest
    .mocked(MailComposer.composeAsync)
    .mockResolvedValue({ status: 'sent' } as MailComposer.MailComposerResult);
  expect(await sendConvertedFileToEmail('reader@kindle.com', path)).toBe(
    'opened'
  );
  expect(FileSystem.deleteAsync).not.toHaveBeenCalled();
});
test('keeps the converted file if opening mail fails', async () => {
  jest
    .mocked(MailComposer.composeAsync)
    .mockRejectedValue(new Error('mail failed'));
  await expect(
    sendConvertedFileToEmail('reader@kindle.com', path)
  ).rejects.toThrow('mail failed');
  expect(FileSystem.deleteAsync).not.toHaveBeenCalled();
});
