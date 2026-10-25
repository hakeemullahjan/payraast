import { Check, Copy } from "lucide-react";
import { useState } from "react";

export default function CopyButton({
  value,
  label,
  className,
}: {
  value: string;
  label: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={label}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-dark-700 bg-dark-850 px-2.5 py-1.5 text-xs font-medium text-dark-200 transition hover:border-brand-yellow/50 hover:bg-dark-800 hover:text-brand-yellow focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-yellow ${className ?? ""}`}
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-brand-yellow" aria-hidden="true" />
      ) : (
        <Copy className="h-3.5 w-3.5 text-dark-400 group-hover:text-brand-yellow" aria-hidden="true" />
      )}
      <span>{copied ? "Copied" : "Copy"}</span>
    </button>
  );
}
