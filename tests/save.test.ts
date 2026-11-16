import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { saveConvertedFile } from '../services/saveConvertedFile';

jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn(),
  shareAsync: jest.fn(),
}));
jest.mock('expo-file-system/legacy', () => ({
  EncodingType: { Base64: 'base64' },
  readAsStringAsync: jest.fn(),
  writeAsStringAsync: jest.fn(),
  deleteAsync: jest.fn(),
  StorageAccessFramework: {
    requestDirectoryPermissionsAsync: jest.fn(),
    createFileAsync: jest.fn(),
  },
}));
const saf = FileSystem.StorageAccessFramework;
const output = 'file:///documents/book.epub';
const originalOS = Platform.OS;
beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(Sharing.isAvailableAsync).mockResolvedValue(true);
});
afterEach(() => {
  Platform.OS = originalOS;
});

test('saves exact converted bytes to a directory chosen on Android', async () => {
  Platform.OS = 'android';
  jest
    .mocked(saf.requestDirectoryPermissionsAsync)
    .mockResolvedValue({ granted: true, directoryUri: 'content://books' });
  jest
    .mocked(saf.createFileAsync)
    .mockResolvedValue('content://books/book.epub');
  jest.mocked(FileSystem.readAsStringAsync).mockResolvedValue('AP+A');
  expect(await saveConvertedFile(output, 'book.epub', 'epub')).toBe('saved');
  expect(saf.createFileAsync).toHaveBeenCalledWith(
    'content://books',
    'book',
    'application/epub+zip'
  );
  expect(FileSystem.writeAsStringAsync).toHaveBeenCalledWith(
    'content://books/book.epub',
    'AP+A',
    { encoding: 'base64' }
  );
});
test('cancelling Android directory selection keeps converted file', async () => {
  Platform.OS = 'android';
  jest
    .mocked(saf.requestDirectoryPermissionsAsync)
    .mockResolvedValue({ granted: false });
  expect(await saveConvertedFile(output, 'book.epub', 'epub')).toBe(
    'cancelled'
  );
  expect(saf.createFileAsync).not.toHaveBeenCalled();
  expect(FileSystem.deleteAsync).not.toHaveBeenCalled();
});
test('offers the iOS save/share sheet and retains the file because saving is not confirmed', async () => {
  Platform.OS = 'ios';
  expect(await saveConvertedFile(output, 'book.epub', 'epub')).toBe('opened');
  expect(Sharing.shareAsync).toHaveBeenCalledWith(
    output,
    expect.objectContaining({ mimeType: 'application/epub+zip' })
  );
  expect(FileSystem.deleteAsync).not.toHaveBeenCalled();
});
test('reports unavailable sharing', async () => {
  Platform.OS = 'ios';
  jest.mocked(Sharing.isAvailableAsync).mockResolvedValue(false);
  await expect(saveConvertedFile(output, 'book.epub', 'epub')).rejects.toThrow(
    /not available/
  );
});
test('propagates storage failures without reporting a successful save', async () => {
  Platform.OS = 'android';
  jest
    .mocked(saf.requestDirectoryPermissionsAsync)
    .mockResolvedValue({ granted: true, directoryUri: 'content://books' });
  jest.mocked(saf.createFileAsync).mockRejectedValue(new Error('disk full'));
  await expect(saveConvertedFile(output, 'book.epub', 'epub')).rejects.toThrow(
    'disk full'
  );
});
