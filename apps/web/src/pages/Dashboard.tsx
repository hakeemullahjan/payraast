import {
  INVOICE_STATUSES,
  type Invoice,
  type InvoiceStatus,
  type InvoiceSummary,
} from "@payraast/shared";
import { Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ErrorBox from "../components/ErrorBox";
import Spinner from "../components/Spinner";
import StatusBadge from "../components/StatusBadge";
import { getSummary, listInvoices } from "../lib/api";
import { formatAmount, formatDate } from "../lib/format";

type Filter = "all" | InvoiceStatus;

const FILTERS: Filter[] = ["all", ...INVOICE_STATUSES];

const FILTER_LABELS: Record<Filter, string> = {
  all: "All",
  pending: "Pending",
  paid: "Paid",
  cancelled: "Cancelled",
};

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-navy-100 bg-white p-4 shadow-sm">
      <p className="text-xs text-navy-500">{label}</p>
      <p className="mt-1 text-xl font-bold tracking-tight text-navy-900">
        {value}
      </p>
    </div>
  );
}

export default function Dashboard() {
  const [filter, setFilter] = useState<Filter>("all");
  const [summary, setSummary] = useState<InvoiceSummary | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [summaryData, invoiceData] = await Promise.all([
        getSummary(),
        listInvoices(filter === "all" ? undefined : filter),
      ]);
      setSummary(summaryData);
      setInvoices(invoiceData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-navy-900">
          Invoices
        </h1>
        <Link
          to="/invoices/new"
          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          New invoice
        </Link>
      </div>

      {summary ? (
        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <SummaryCard label="Total invoices" value={String(summary.totalInvoices)} />
          <SummaryCard
            label={`Pending (${summary.pendingInvoices})`}
            value={formatAmount(summary.totalPendingAmount, "USDC")}
          />
          <SummaryCard
            label={`Paid (${summary.paidInvoices})`}
            value={formatAmount(summary.totalPaidAmount, "USDC")}
          />
          <SummaryCard
            label="Cancelled"
            value={String(
              summary.totalInvoices -
                summary.pendingInvoices -
                summary.paidInvoices
            )}
          />
        </div>
      ) : null}

      <div
        className="mt-6 flex gap-1 border-b border-navy-100"
        role="tablist"
        aria-label="Filter invoices by status"
      >
        {FILTERS.map((item) => (
          <button
            key={item}
            type="button"
            role="tab"
            aria-selected={filter === item}
            onClick={() => setFilter(item)}
            className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium transition ${
              filter === item
                ? "border-emerald-600 text-navy-900"
                : "border-transparent text-navy-500 hover:text-navy-900"
            }`}
          >
            {FILTER_LABELS[item]}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {loading ? (
          <Spinner label="Loading invoices" />
        ) : error ? (
          <ErrorBox message={error} onRetry={load} />
        ) : invoices.length === 0 ? (
          <div className="rounded-xl border border-dashed border-navy-200 bg-white py-14 text-center">
            <p className="text-sm font-medium text-navy-900">
              {filter === "all"
                ? "No invoices yet"
                : `No ${FILTER_LABELS[filter].toLowerCase()} invoices`}
            </p>
            {filter === "all" ? (
              <Link
                to="/invoices/new"
                className="mt-3 inline-block text-sm font-medium text-emerald-700 underline underline-offset-2"
              >
                Create your first invoice
              </Link>
            ) : null}
          </div>
        ) : (
          <ul className="divide-y divide-navy-100 overflow-hidden rounded-xl border border-navy-100 bg-white shadow-sm">
            {invoices.map((invoice) => (
              <li key={invoice.id}>
                <Link
                  to={`/invoices/${invoice.id}`}
                  className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-3 transition hover:bg-navy-50"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-navy-900">
                      {invoice.projectTitle}
                    </p>
                    <p className="truncate text-xs text-navy-500">
                      {invoice.clientName} · {formatDate(invoice.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-navy-900">
                      {formatAmount(invoice.amount, invoice.assetCode)}
                    </span>
                    <StatusBadge status={invoice.status} />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
