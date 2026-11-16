import { FileConversionService } from '../services/fileConversion.service';
import { arrayBufferToBase64 } from '../services/arrayBufferToBase64';
import { sendConvertedFileToEmail } from '../services/sendConvertedFileToEmail';
import { File } from 'expo-file-system';
import * as FileSystem from 'expo-file-system/legacy';
import { fetch } from 'expo/fetch';
import { MAX_FILE_SIZE } from '../constants/file';
import { saveConvertedFile } from '../services/saveConvertedFile';

jest.mock('../services/sendConvertedFileToEmail', () => ({
  sendConvertedFileToEmail: jest.fn(),
}));
jest.mock('../services/saveConvertedFile', () => ({
  saveConvertedFile: jest.fn(),
}));
jest.mock('expo/fetch', () => ({ fetch: jest.fn() }));
jest.mock('expo-file-system', () => ({
  Paths: { cache: 'file:///cache/' },
  File: jest
    .fn()
    .mockImplementation((...parts: string[]) => ({
      uri: parts.join('/'),
      copy: jest.fn(),
      delete: jest.fn(),
    })),
}));
jest.mock('expo-file-system/legacy', () => ({
  documentDirectory: 'file:///documents/',
  EncodingType: { Base64: 'base64' },
  writeAsStringAsync: jest.fn(),
  deleteAsync: jest.fn(),
}));

const file = {
  uri: 'file:///input.fb2',
  name: 'book.fb2',
  size: 128,
  lastModified: 0,
};
const request = { file, email: 'reader@kindle.com', outputFormat: 'epub' };
const mockFetch = jest.mocked(fetch);
const mockSend = jest.mocked(sendConvertedFileToEmail);
const originalFormData = global.FormData;

beforeEach(() => {
  jest.clearAllMocks();
  global.FormData = class {
    append = jest.fn();
  } as unknown as typeof FormData;
  mockFetch.mockResolvedValue({
    ok: true,
    arrayBuffer: async () => new Uint8Array([0, 255, 128]).buffer,
  } as Awaited<ReturnType<typeof fetch>>);
  mockSend.mockResolvedValue(undefined as never);
});
afterEach(() => {
  global.FormData = originalFormData;
  jest.useRealTimers();
});

describe('validation', () => {
  test('requires a file and nonblank email', () => {
    expect(
      FileConversionService.getValidationMessage(null, request.email)
    ).toMatch(/upload/i);
    expect(FileConversionService.getValidationMessage(file, '  ')).toMatch(
      /email/i
    );
    expect(
      FileConversionService.getValidationMessage(file, request.email)
    ).toBeNull();
  });
  test('accepts the size boundary and rejects empty or oversized files', () => {
    expect(
      FileConversionService.validateFileSize({ ...file, size: MAX_FILE_SIZE })
    ).toBe(true);
    expect(
      FileConversionService.validateFileSize({
        ...file,
        size: MAX_FILE_SIZE + 1,
      })
    ).toBe(false);
    expect(FileConversionService.validateFileSize({ ...file, size: 0 })).toBe(
      false
    );
  });
  test('rejects a 10 MiB book before sending it through Vercel', () => {
    expect(
      FileConversionService.getValidationMessage(
        { ...file, size: 10 * 1024 * 1024 },
        request.email
      )
    ).toMatch(/large/i);
  });
});

describe('binary conversion', () => {
  test.each(
    [[], [0], [255, 128], [0, 255, 128], [0, 1, 2, 3, 254, 255]].map(
      (bytes) => ({ bytes })
    )
  )('encodes bytes $bytes', ({ bytes }) => {
    const input = Uint8Array.from(bytes);
    expect(arrayBufferToBase64(input.buffer)).toBe(
      Buffer.from(input).toString('base64')
    );
  });
  test('supports environments without btoa', () => {
    const original = global.btoa;
    Object.defineProperty(global, 'btoa', {
      value: undefined,
      configurable: true,
      writable: true,
    });
    try {
      for (let size = 0; size < 12; size++) {
        const input = Uint8Array.from(
          { length: size },
          (_, i) => (i * 71) % 256
        );
        expect(arrayBufferToBase64(input.buffer)).toBe(
          Buffer.from(input).toString('base64')
        );
      }
    } finally {
      global.btoa = original;
    }
  });
});

describe('convert and send', () => {
  test('uploads requested format, writes exact converted bytes and attaches output', async () => {
    await FileConversionService.convertAndSend(request);
    const options = mockFetch.mock.calls[0][1]!;
    expect(options.method).toBe('POST');
    expect((options.body as FormData).append).toHaveBeenCalledWith(
      'format',
      'epub'
    );
    expect(FileSystem.writeAsStringAsync).toHaveBeenCalledWith(
      expect.stringMatching(/book\.epub$/),
      'AP+A',
      { encoding: 'base64' }
    );
    expect(mockSend).toHaveBeenCalledWith(
      request.email,
      expect.stringMatching(/book\.epub$/)
    );
    expect(jest.mocked(File).mock.results[0].value.delete).toHaveBeenCalled();
  });
  test('propagates server error and cleans the upload without opening mail', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      text: async () => 'Bad format',
    } as Awaited<ReturnType<typeof fetch>>);
    await expect(FileConversionService.convertAndSend(request)).rejects.toThrow(
      'Bad format'
    );
    expect(
      jest.mocked(File).mock.results.at(-2)!.value.delete
    ).toHaveBeenCalled();
    expect(mockSend).not.toHaveBeenCalled();
  });
  test('propagates network errors and cleans the upload', async () => {
    mockFetch.mockRejectedValue(new Error('offline'));
    await expect(FileConversionService.convertAndSend(request)).rejects.toThrow(
      'offline'
    );
    expect(
      jest.mocked(File).mock.results.at(-2)!.value.delete
    ).toHaveBeenCalled();
  });
  test('aborts a conversion after two minutes', async () => {
    jest.useFakeTimers();
    mockFetch.mockImplementation(
      (_url, options) =>
        new Promise((_resolve, reject) => {
          options!.signal!.addEventListener('abort', () =>
            reject(new Error('aborted'))
          );
        })
    );
    const conversion = FileConversionService.convertAndSend(request);
    const assertion = expect(conversion).rejects.toThrow(/timed out/i);
    await jest.advanceTimersByTimeAsync(120_000);
    await assertion;
  });
});

test('convert and save reuses binary conversion without opening mail', async () => {
  jest.mocked(saveConvertedFile).mockResolvedValue('saved');
  expect(
    await FileConversionService.convertAndSave({ file, outputFormat: 'epub' })
  ).toBe('saved');
  expect(saveConvertedFile).toHaveBeenCalledWith(
    expect.stringMatching(/book\.epub$/),
    'book.epub',
    'epub'
  );
  expect(mockSend).not.toHaveBeenCalled();
});
test('rejects oversized input before making a network request', async () => {
  await expect(
    FileConversionService.convertAndSend({
      ...request,
      file: { ...file, size: MAX_FILE_SIZE + 1 },
    })
  ).rejects.toThrow(/large/);
  expect(mockFetch).not.toHaveBeenCalled();
});
