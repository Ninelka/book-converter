import { DocumentPickerAsset } from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { arrayBufferToBase64 } from './arrayBufferToBase64';
import { MAX_FILE_SIZE } from '../constants/file';
import { sendConvertedFileToEmail } from './sendConvertedFileToEmail';

export interface ConversionRequest {
  file: DocumentPickerAsset;
  outputFormat: string;
  email: string;
}

export class FileConversionService {
  static validateFile(file: DocumentPickerAsset | null): boolean {
    return file !== null;
  }

  static validateFileSize(file: DocumentPickerAsset | null): boolean {
    if (!file?.size) return false;

    return file.size <= MAX_FILE_SIZE;
  }

  static validateEmail(email: string): boolean {
    if (!email) return false;

    return email.trim() !== '';
  }

  static async convertAndSend(request: ConversionRequest): Promise<void> {
    const formData = new FormData();

    // @ts-ignore В Expo/React Native допускается передавать файл как объект
    formData.append('file', {
      uri: request.file.uri,
      name: request.file.name,
      type: request.file.mimeType || 'application/octet-stream',
    });
    formData.append('format', request.outputFormat);

    const apiUrl = 'https://converter-server-five.vercel.app/api/convert';

    const response = await fetch(apiUrl, { method: 'POST', body: formData });

    if (!response.ok) {
      throw new Error(`Conversion failed: ${await response.text()}`);
    }

    // Получаем сконвертированный файл и преобразуем ArrayBuffer → base64 строку
    const arrayBuffer = await response.arrayBuffer();
    const base64String = arrayBufferToBase64(arrayBuffer);

    const outputFileName =
      request.file.name.replace(/\.[^/.]+$/, '') + '.' + request.outputFormat;
    const outputPath = FileSystem.documentDirectory + outputFileName;

    await FileSystem.writeAsStringAsync(outputPath, base64String, {
      encoding: FileSystem.EncodingType.Base64,
    });

    await sendConvertedFileToEmail(request.email, outputPath);
  }

  static getValidationMessage(
    file: DocumentPickerAsset | null,
    email: string
  ): string | null {
    if (!this.validateFile(file)) {
      return 'Please upload a file first';
    }
    if (!this.validateFileSize(file)) {
      return 'File is too large';
    }
    if (!this.validateEmail(email)) {
      return 'Please set your Kindle email in settings';
    }
    return null;
  }
}
