/**
 * UrbanTree - QR Code Service
 * Generates standards-compliant QR codes encoding public tree profile URLs.
 */

import QRCode from 'qrcode';

export async function generateQrDataUrl(publicCode: string): Promise<string> {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://urbantree.vn';
  const targetUrl = `${origin}/#tree-${publicCode}`;

  try {
    const dataUrl = await QRCode.toDataURL(targetUrl, {
      width: 320,
      margin: 2,
      color: {
        dark: '#174B36', // Brand dark forest green
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'M',
    });
    return dataUrl;
  } catch (err) {
    console.error('Failed to generate QR Code:', err);
    return '';
  }
}

export function downloadQrCode(dataUrl: string, publicCode: string) {
  if (!dataUrl) return;
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = `URBANTREE-QR-${publicCode}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
