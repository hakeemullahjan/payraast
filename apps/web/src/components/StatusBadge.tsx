import type { InvoiceStatus } from "@payraast/shared";

const STYLES: Record<InvoiceStatus, string> = {
  pending: "bg-brand-yellow/10 text-brand-yellow border-brand-yellow/30 shadow-[0_0_12px_-3px_rgba(250,204,21,0.25)]",
  paid: "bg-brand-yellow text-dark-950 border-brand-yellow shadow-[0_0_15px_-2px_rgba(250,204,21,0.4)] font-bold",
  cancelled: "bg-dark-800 text-dark-400 border-dark-700",
};

const DOT_STYLES: Record<InvoiceStatus, string> = {
  pending: "bg-brand-yellow animate-pulse",
  paid: "bg-dark-950",
  cancelled: "bg-dark-500",
};

const LABELS: Record<InvoiceStatus, string> = {
  pending: "Pending",
  paid: "Paid",
  cancelled: "Cancelled",
};

export default function StatusBadge({ status }: { status: InvoiceStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STYLES[status]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${DOT_STYLES[status]}`} aria-hidden="true" />
      {LABELS[status]}
    </span>
  );
}

