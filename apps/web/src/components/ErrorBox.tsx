import { AlertCircle } from "lucide-react";

export default function ErrorBox({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-950/20 p-4 text-sm text-red-200"
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" aria-hidden="true" />
      <div className="flex-1">
        <p className="leading-relaxed">{message}</p>
        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="mt-2 text-xs font-semibold text-brand-yellow underline underline-offset-2 hover:text-brand-yellowHover"
          >
            Try again
          </button>
        ) : null}
      </div>
    </div>
  );
}
