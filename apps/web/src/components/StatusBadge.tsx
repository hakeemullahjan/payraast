import type { InvoiceStatus } from "@payraast/shared";

const STYLES: Record<InvoiceStatus, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-100",
  paid: "bg-emerald-50 text-emerald-700 border-emerald-100",
  cancelled: "bg-slate-100 text-slate-600 border-slate-200",
};

const LABELS: Record<InvoiceStatus, string> = {
  pending: "Pending",
  paid: "Paid",
  cancelled: "Cancelled",
};

export default function StatusBadge({ status }: { status: InvoiceStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${STYLES[status]}`}
    >
      {LABELS[status]}
    </span>
  );
}
