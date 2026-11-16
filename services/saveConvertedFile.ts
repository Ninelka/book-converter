import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

export type SaveResult = 'saved' | 'cancelled' | 'opened';

const mimeTypes: Record<string, string> = {
  epub: 'application/epub+zip',
  fb2: 'application/x-fictionbook+xml',
  mobi: 'application/x-mobipocket-ebook',
  pdf: 'application/pdf',
  txt: 'text/plain',
  azw3: 'application/vnd.amazon.mobi8-ebook',
};

export async function saveConvertedFile(
  outputPath: string,
  fileName: string,
  format: string
): Promise<SaveResult> {
  const mimeType = mimeTypes[format] ?? 'application/octet-stream';
  if (Platform.OS === 'android') {
    const saf = FileSystem.StorageAccessFramework;
    const permission = await saf.requestDirectoryPermissionsAsync();
    if (!permission.granted) return 'cancelled';
    const destination = await saf.createFileAsync(
      permission.directoryUri,
      fileName.replace(/\.[^/.]+$/, ''),
      mimeType
    );
    const contents = await FileSystem.readAsStringAsync(outputPath, {
      encoding: FileSystem.EncodingType.Base64,
    });
    await FileSystem.writeAsStringAsync(destination, contents, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return 'saved';
  }

  if (!(await Sharing.isAvailableAsync())) {
    throw new Error('File sharing is not available');
  }
  await Sharing.shareAsync(outputPath, {
    mimeType,
    dialogTitle: 'Save converted book',
  });
  // The sheet does not report whether the user saved or cancelled.
  // Retain the document so it remains accessible in the iOS Files app.
  return 'opened';
}
