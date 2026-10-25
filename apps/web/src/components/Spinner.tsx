import { Loader2 } from "lucide-react";

export default function Spinner({ label = "Loading" }: { label?: string }) {
  return (
    <div
      role="status"
      className="flex items-center justify-center gap-2.5 py-16 text-dark-400"
    >
      <Loader2 className="h-5 w-5 animate-spin text-brand-yellow" aria-hidden="true" />
      <span className="text-sm font-medium">{label}...</span>
    </div>
  );
}
