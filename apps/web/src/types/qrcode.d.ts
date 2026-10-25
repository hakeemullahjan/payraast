declare module "qrcode" {
  export interface QRCodeToStringOptions {
    type?: "svg" | "utf8" | "terminal";
    errorCorrectionLevel?: "L" | "M" | "Q" | "H";
    width?: number;
    margin?: number;
    color?: {
      dark?: string;
      light?: string;
    };
  }

  export function toString(
    text: string,
    options?: QRCodeToStringOptions
  ): Promise<string>;

  export function toString(
    text: string,
    callback: (error: Error | null, string: string) => void
  ): void;

  export function toString(
    text: string,
    options: QRCodeToStringOptions,
    callback: (error: Error | null, string: string) => void
  ): void;

  export function toDataURL(
    text: string,
    options?: Record<string, unknown>
  ): Promise<string>;
}
