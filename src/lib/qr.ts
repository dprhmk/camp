import "server-only";
import QRCode from "qrcode";

/** Render a code as a square SVG string (scales to its container). */
export async function qrSvg(text: string): Promise<string> {
  return QRCode.toString(text, {
    type: "svg",
    margin: 0,
    errorCorrectionLevel: "M",
  });
}
