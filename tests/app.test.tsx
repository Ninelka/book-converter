import React from 'react';
import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
  waitFor,
} from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDocumentAsync } from 'expo-document-picker';
import Toast from 'react-native-toast-message';
import App from '../App';
import { useFileConverter } from '../hooks/useFileConverter';
import { FileConversionService } from '../services/fileConversion.service';
import { EMAIL_KEY } from '../constants';

jest.mock('expo-document-picker', () => ({ getDocumentAsync: jest.fn() }));
jest.mock('../services/fileConversion.service', () => ({
  FileConversionService: {
    getValidationMessage: jest.fn(),
    convertAndSend: jest.fn(),
    convertAndSave: jest.fn(),
  },
}));
const service = FileConversionService as typeof FileConversionService & {
  convertAndSave: jest.Mock;
};
const file = {
  uri: 'file:///book.fb2',
  name: 'book.fb2',
  size: 1024,
  lastModified: 0,
};

async function openApp(email: string | null = 'reader@kindle.com') {
  jest.mocked(AsyncStorage.getItem).mockResolvedValue(email);
  await render(<App />);
  await waitFor(() =>
    expect(AsyncStorage.getItem).toHaveBeenCalledWith(EMAIL_KEY)
  );
  // Flush stored email hydration before interacting with the app.
  await act(async () => {});
}
async function upload() {
  jest
    .mocked(getDocumentAsync)
    .mockResolvedValue({ canceled: false, assets: [file] });
  await fireEvent.press(screen.getByText('Upload File'));
  await waitFor(() =>
    expect(screen.getAllByText(file.name).length).toBeGreaterThan(0)
  );
}
beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(service.getValidationMessage).mockReturnValue(null);
  jest.mocked(service.convertAndSend).mockResolvedValue('sent' as never);
  service.convertAndSave.mockResolvedValue('saved');
});

test('shows initial upload and EPUB default; requires email and file to send', async () => {
  await openApp(null);
  expect(screen.getByTestId('format-picker').props.selectedValue).toBe('epub');
  expect(screen.getByText(/Set your Kindle email/)).toBeTruthy();
  await fireEvent.press(screen.getByText('Send to Kindle by Email'));
  expect(service.convertAndSend).not.toHaveBeenCalled();
});
test('selects a file and displays its name, size and selected output format', async () => {
  await openApp();
  await upload();
  await fireEvent(screen.getByTestId('format-picker'), 'valueChange', 'pdf');
  expect(screen.getByTestId('format-picker').props.selectedValue).toBe('pdf');
  expect(screen.getByText('0.00 MB')).toBeTruthy();
  expect(screen.getAllByText('PDF').length).toBeGreaterThan(0);
});
test('cancelling the file picker preserves current selection', async () => {
  await openApp();
  await upload();
  jest
    .mocked(getDocumentAsync)
    .mockResolvedValue({ canceled: true, assets: null });
  await fireEvent.press(screen.getAllByText(file.name)[0]);
  await act(async () => {});
  expect(screen.getAllByText(file.name).length).toBeGreaterThan(0);
});
test('validates before attempting conversion', async () => {
  await openApp();
  await upload();
  jest
    .mocked(service.getValidationMessage)
    .mockReturnValue('File is too large');
  await fireEvent.press(screen.getByText('Send to Kindle by Email'));
  expect(Toast.show).toHaveBeenCalledWith(
    expect.objectContaining({ type: 'error', text1: 'File is too large' })
  );
  expect(service.convertAndSend).not.toHaveBeenCalled();
});
test('sends selected file, format and stored email, then clears selection', async () => {
  await openApp();
  await upload();
  await fireEvent(screen.getByTestId('format-picker'), 'valueChange', 'pdf');
  await fireEvent.press(screen.getByText('Send to Kindle by Email'));
  await waitFor(() => expect(screen.getByText('Upload File')).toBeTruthy());
  expect(service.convertAndSend).toHaveBeenCalledWith({
    file,
    outputFormat: 'pdf',
    email: 'reader@kindle.com',
  });
  expect(Toast.show).toHaveBeenCalledWith(
    expect.objectContaining({ type: 'success' })
  );
});
test('prevents repeated conversion while one is pending', async () => {
  let complete!: (value: never) => void;
  jest.mocked(service.convertAndSend).mockReturnValue(
    new Promise((resolve) => {
      complete = resolve;
    })
  );
  jest
    .mocked(getDocumentAsync)
    .mockResolvedValue({ canceled: false, assets: [file] });
  const { result } = await renderHook(() => useFileConverter());
  await act(async () => {
    await result.current.handleFileUpload();
  });
  await act(async () => {
    void result.current.handleSendToKindle('reader@kindle.com');
  });
  expect(result.current.isConverting).toBe(true);
  await act(async () => {
    await result.current.handleSendToKindle('reader@kindle.com');
  });
  expect(service.convertAndSend).toHaveBeenCalledTimes(1);
  await act(async () => {
    complete('sent' as never);
  });
  expect(result.current.isConverting).toBe(false);
});
test('preserves selection and shows server error for retry', async () => {
  const log = jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.mocked(service.convertAndSend).mockRejectedValue(new Error('offline'));
  await openApp();
  await upload();
  await fireEvent.press(screen.getByText('Send to Kindle by Email'));
  await waitFor(() =>
    expect(Toast.show).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'error', text2: 'offline' })
    )
  );
  expect(screen.getAllByText(file.name).length).toBeGreaterThan(0);
  log.mockRestore();
});
test.each(['cancelled', 'saved', 'opened'])(
  'does not claim successful sending when mail result is %s',
  async (status) => {
    jest.mocked(service.convertAndSend).mockResolvedValue(status as never);
    await openApp();
    await upload();
    await fireEvent.press(screen.getByText('Send to Kindle by Email'));
    await waitFor(() => expect(Toast.show).toHaveBeenCalled());
    expect(Toast.show).not.toHaveBeenCalledWith(
      expect.objectContaining({ text1: 'File converted & sent successfully' })
    );
    if (status === 'cancelled')
      expect(screen.getAllByText(file.name).length).toBeGreaterThan(0);
  }
);
test('converts and saves without requiring email', async () => {
  await openApp(null);
  await upload();
  await fireEvent.press(screen.getByText('Send to device'));
  await fireEvent.press(screen.getByText('Convert and save'));
  await waitFor(() =>
    expect(service.convertAndSave).toHaveBeenCalledWith({
      file,
      outputFormat: 'epub',
    })
  );
  expect(service.convertAndSend).not.toHaveBeenCalled();
});
test('keeps selection if the save dialog is cancelled', async () => {
  service.convertAndSave.mockResolvedValue('cancelled');
  await openApp();
  await upload();
  await fireEvent.press(screen.getByText('Send to device'));
  await fireEvent.press(screen.getByText('Convert and save'));
  await waitFor(() => expect(service.convertAndSave).toHaveBeenCalled());
  expect(screen.getAllByText(file.name).length).toBeGreaterThan(0);
});

test('settings Save persists address and uses it for sending', async () => {
  await openApp();
  await fireEvent.press(screen.getByText('cog'));
  await fireEvent.changeText(
    screen.getByDisplayValue('reader@kindle.com'),
    'new@kindle.com'
  );
  await fireEvent.press(screen.getByText('Save'));
  await waitFor(() =>
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      EMAIL_KEY,
      'new@kindle.com'
    )
  );
  await upload();
  await fireEvent.press(screen.getByText('Send to Kindle by Email'));
  await waitFor(() =>
    expect(service.convertAndSend).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'new@kindle.com' })
    )
  );
});
test('settings Cancel discards the draft and keeps stored recipient', async () => {
  await openApp();
  await fireEvent.press(screen.getByText('cog'));
  await fireEvent.changeText(
    screen.getByDisplayValue('reader@kindle.com'),
    'wrong@kindle.com'
  );
  await fireEvent.press(screen.getByText('Cancel'));
  await fireEvent.press(screen.getByText('cog'));
  expect(screen.getByDisplayValue('reader@kindle.com')).toBeTruthy();
  expect(AsyncStorage.setItem).not.toHaveBeenCalled();
});

test('reports a file picker error without selecting a file', async () => {
  jest.mocked(getDocumentAsync).mockRejectedValue(new Error('picker failed'));
  await openApp();
  await fireEvent.press(screen.getByText('Upload File'));
  expect(Toast.show).toHaveBeenCalledWith(
    expect.objectContaining({ type: 'error', text2: 'picker failed' })
  );
  expect(screen.getByText('Upload File')).toBeTruthy();
});
test('settings storage failure leaves draft open and preserves saved recipient', async () => {
  jest
    .mocked(AsyncStorage.setItem)
    .mockRejectedValueOnce(new Error('storage full'));
  await openApp();
  await fireEvent.press(screen.getByText('cog'));
  await fireEvent.changeText(
    screen.getByDisplayValue('reader@kindle.com'),
    'new@kindle.com'
  );
  await fireEvent.press(screen.getByText('Save'));
  expect(screen.getByDisplayValue('new@kindle.com')).toBeTruthy();
  expect(Toast.show).toHaveBeenCalledWith(
    expect.objectContaining({ type: 'error' })
  );
  await fireEvent.press(screen.getByText('Cancel'));
  await fireEvent.press(screen.getByText('cog'));
  expect(screen.getByDisplayValue('reader@kindle.com')).toBeTruthy();
});
