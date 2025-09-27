import { DocumentPickerAsset } from 'expo-document-picker';
import * as MailComposer from 'expo-mail-composer';

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

    // TODO: move value to constants
    return file.size <= 200000000;
  }

  static validateEmail(email: string): boolean {
    if (!email) return false;

    return email.trim() !== '';
  }

  static async convertAndSend(request: ConversionRequest): Promise<void> {
    // TODO: add conversion by API
    console.log(`Converting ${request.file.name} to ${request.outputFormat}`);

    const isAvailable = await MailComposer.isAvailableAsync();
    if (!isAvailable) throw new Error('Email client is not available!');

    await MailComposer.composeAsync({
      recipients: [request.email],
      subject: '',
      body: '',
      attachments: [request.file.uri],
    });
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
