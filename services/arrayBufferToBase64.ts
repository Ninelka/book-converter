export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;

  if (typeof btoa === 'function') {
    let binary = '';
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  const alphabet =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let base64 = '';

  for (let i = 0; i < len; i += 3) {
    const byte1 = bytes[i];
    const byte2 = bytes[i + 1];
    const byte3 = bytes[i + 2];

    base64 += alphabet[byte1 >> 2];
    base64 += alphabet[((byte1 & 0b11) << 4) | ((byte2 ?? 0) >> 4)];
    base64 +=
      byte2 === undefined
        ? '='
        : alphabet[((byte2 & 0b1111) << 2) | ((byte3 ?? 0) >> 6)];
    base64 += byte3 === undefined ? '=' : alphabet[byte3 & 0b111111];
  }

  return base64;
}
