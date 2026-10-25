import { useEffect, useState } from "react";
import QRCode from "qrcode";

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
      width: 180,
    })
      .then((data) => {
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
      <div className="flex items-center justify-center py-4 text-sm text-navy-500">
        QR code unavailable
      </div>
    );
  }

  if (svg === null) {
    return (
      <div
        className={`flex items-center justify-center py-3 text-navy-400 ${className ?? ""}`}
        aria-label={label}
      >
        <svg
          className="h-4 w-4 animate-spin"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.172 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </div>
    );
  }

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: svg }}
      aria-label={label}
    />
  );
}
