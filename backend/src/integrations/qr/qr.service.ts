import QRCode from "qrcode";
import { env } from "../../config/environment";

export async function certificateQrPng(certificateCode: string): Promise<Buffer> {
  const url = `${env.frontendUrl}/verify/${certificateCode}`;
  return QRCode.toBuffer(url, { width: 180, margin: 1 });
}

export function certificateVerifyUrl(certificateCode: string): string {
  return `${env.frontendUrl}/verify/${certificateCode}`;
}
