import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Loader2 } from "lucide-react";

export default function QrCode({
  value,
  label,
  className,
}: {
  value: string;
  label: string;
  className?: string;
}) {
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    setError(false);
    setSvg(null);
    QRCode.toString(value, {
      type: "svg",
      errorCorrectionLevel: "M",
      width: 170,
      margin: 1,
      color: {
        dark: "#0a0a0d",
        light: "#ffffff",
      },
    })
      .then((data: string) => {
        if (active) setSvg(data);
      })
      .catch(() => {
        if (active) setError(true);
      });
    return () => {
      active = false;
    };
  }, [value]);

  if (error) {
    return (
      <div className="flex items-center justify-center py-4 text-xs text-dark-400">
        QR code unavailable
      </div>
    );
  }

  if (svg === null) {
    return (
      <div
        className={`flex items-center justify-center py-8 text-brand-yellow ${className ?? ""}`}
        aria-label={label}
      >
        <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
      </div>
    );
  }

  return (
    <div
      className={`rounded-xl bg-white p-3 shadow-lg shadow-black/50 ${className ?? ""}`}
      dangerouslySetInnerHTML={{ __html: svg }}
      aria-label={label}
    />
  );
}
