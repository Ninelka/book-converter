import { DocumentPickerAsset } from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { File, Paths } from 'expo-file-system';
import { fetch } from 'expo/fetch';
import { arrayBufferToBase64 } from './arrayBufferToBase64';
import { MAX_FILE_SIZE } from '../constants/file';
import {
  sendConvertedFileToEmail,
  MailResult,
} from './sendConvertedFileToEmail';
import { saveConvertedFile, SaveResult } from './saveConvertedFile';

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

  static async convertAndSend(request: ConversionRequest): Promise<MailResult> {
    const output = await this.convert(request);
    return sendConvertedFileToEmail(request.email.trim(), output.path);
  }

  static async convertAndSave(
    request: Omit<ConversionRequest, 'email'>
  ): Promise<SaveResult> {
    const output = await this.convert(request);
    return saveConvertedFile(output.path, output.name, request.outputFormat);
  }

  private static async convert(
    request: Omit<ConversionRequest, 'email'>
  ): Promise<{ path: string; name: string }> {
    if (!this.validateFileSize(request.file)) {
      throw new Error('File is too large or empty (maximum 4 MiB)');
    }
    const extension = request.file.name.match(/\.[^/.]+$/)?.[0] ?? '';
    const uploadFile = new File(
      Paths.cache,
      `book-converter-upload-${Date.now()}${extension}`
    );
    await new File(request.file.uri).copy(uploadFile);

    const formData = new FormData();

    formData.append('file', uploadFile, request.file.name);
    formData.append('format', request.outputFormat);

    const apiUrl = 'https://converter-server-five.vercel.app/api/convert';
    const controller = new AbortController();
    const requestTimeout = setTimeout(() => controller.abort(), 120_000);

    let response: Response;
    let arrayBuffer: ArrayBuffer;
    try {
      response = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Conversion failed: ${await response.text()}`);
      }

      arrayBuffer = await response.arrayBuffer();
    } catch (error) {
      if (controller.signal.aborted) {
        throw new Error('Conversion request timed out after 2 minutes');
      }
      throw error;
    } finally {
      clearTimeout(requestTimeout);
      try {
        uploadFile.delete();
      } catch (error) {
        console.warn('Не удалось удалить копию исходного файла:', error);
      }
    }

    // Получаем сконвертированный файл и преобразуем ArrayBuffer → base64 строку
    const base64String = arrayBufferToBase64(arrayBuffer);

    const outputFileName =
      request.file.name.replace(/\.[^/.]+$/, '') + '.' + request.outputFormat;
    const outputPath = FileSystem.documentDirectory + outputFileName;

    await FileSystem.writeAsStringAsync(outputPath, base64String, {
      encoding: FileSystem.EncodingType.Base64,
    });

    return { path: outputPath, name: outputFileName };
  }

  static getValidationMessage(
    file: DocumentPickerAsset | null,
    email?: string
  ): string | null {
    if (!this.validateFile(file)) {
      return 'Please upload a file first';
    }
    if (!this.validateFileSize(file)) {
      return 'File is too large or empty (maximum 4 MiB)';
    }
    if (email !== undefined && !this.validateEmail(email)) {
      return 'Please set your Kindle email in settings';
    }
    return null;
  }
}
