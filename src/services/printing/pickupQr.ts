const trailer = /\n\[\[FLYFOODS_QR:(flyfoods:pickup:v1:[A-Za-z0-9_-]{1,64}:[A-Za-z0-9_-]{43})\]\]\n?$/;

export function splitPickupQr(content: string) {
  const match = trailer.exec(content);
  return { text: match ? content.slice(0, match.index) + "\n" : content, qrCode: match?.[1] ?? null };
}

export function pickupQrCommands(value: string) {
  const length = value.length + 3;
  // ESC/POS QR model 2, 5-dot modules, error correction M, store and print.
  return "\x1b\x61\x01\n" +
    "\x1d(k\x04\x00\x31\x41\x32\x00" +
    "\x1d(k\x03\x00\x31\x43\x05" +
    "\x1d(k\x03\x00\x31\x45\x31" +
    `\x1d(k${String.fromCharCode(length & 255, length >> 8)}\x31\x50\x30${value}` +
    "\x1d(k\x03\x00\x31\x51\x30\n\n\x1b\x61\x00";
}

export function pickupPrintData(content: string) {
  const { text, qrCode } = splitPickupQr(content);
  // Only our validated trailer may produce commands; order text stays plain text.
  const safeText = text.replace(/[\x00-\x08\x0b-\x1f\x7f-\x9f]/g, "");
  return safeText + (qrCode ? pickupQrCommands(qrCode) : "");
}
