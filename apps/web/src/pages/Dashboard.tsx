import {
  INVOICE_STATUSES,
  type Invoice,
  type InvoiceStatus,
  type InvoiceSummary,
} from "@payraast/shared";
import {
  ArrowUpRight,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  Filter as FilterIcon,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Wallet,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import CopyButton from "../components/CopyButton";
import ErrorBox from "../components/ErrorBox";
import Spinner from "../components/Spinner";
import StatusBadge from "../components/StatusBadge";
import { getSummary, listInvoices } from "../lib/api";
import { formatAmount, formatDate } from "../lib/format";

type Filter = "all" | InvoiceStatus;

const FILTERS: Filter[] = ["all", ...INVOICE_STATUSES];

const FILTER_LABELS: Record<Filter, string> = {
  all: "All Invoices",
  pending: "Pending",
  paid: "Paid & Verified",
  cancelled: "Cancelled",
};

interface MetricCardProps {
  label: string;
  value: string;
  subtext: string;
  icon: React.ReactNode;
  accent?: "yellow" | "default";
}

function MetricCard({ label, value, subtext, icon, accent = "default" }: MetricCardProps) {
  const borderClass =
    accent === "yellow"
      ? "border-brand-yellow/40 bg-gradient-to-b from-dark-850 to-dark-900 shadow-[0_0_25px_-5px_rgba(250,204,21,0.2)]"
      : "border-dark-750 bg-dark-900";

  const iconBg =
    accent === "yellow"
      ? "bg-brand-yellow/20 text-brand-yellow"
      : "bg-dark-800 text-dark-300";

  return (
    <div className={`relative overflow-hidden rounded-2xl border p-5 transition hover:border-dark-600 ${borderClass}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-dark-400">{label}</p>
          <p className="mt-1 text-2xl font-black tracking-tight text-white sm:text-3xl font-mono">
            {value}
          </p>
          <p className="mt-1 text-xs text-dark-400">{subtext}</p>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBg}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [filter, setFilter] = useState<Filter>("all");
  const [searchQuery, setSearchQuery] = useState("");
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

  // Client-side search filtering
  const filteredInvoices = useMemo(() => {
    if (!searchQuery.trim()) return invoices;
    const query = searchQuery.toLowerCase();
    return invoices.filter(
      (inv) =>
        inv.projectTitle.toLowerCase().includes(query) ||
        inv.clientName.toLowerCase().includes(query) ||
        inv.id.toLowerCase().includes(query) ||
        inv.amount.includes(query)
    );
  }, [invoices, searchQuery]);

  return (
    <div className="space-y-8">
      {/* Top Banner / Welcome Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
              Merchant Dashboard
            </h1>
            <span className="rounded-full border border-brand-yellow/30 bg-brand-yellow/10 px-2 py-0.5 text-[10px] font-bold text-brand-yellow">
              LIVE
            </span>
          </div>
          <p className="mt-1 text-sm text-dark-400">
            Monitor receivables, track verified Testnet settlements, and cash out to Raast.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={load}
            disabled={loading}
            title="Refresh dashboard data"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-dark-700 bg-dark-850 text-dark-300 transition hover:border-brand-yellow/40 hover:text-white"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-brand-yellow" : ""}`} />
          </button>
          <Link
            to="/invoices/new"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-yellow px-4 py-2 text-xs font-bold text-dark-950 shadow-[0_0_20px_-3px_rgba(250,204,21,0.3)] transition hover:bg-brand-yellowHover hover:shadow-yellowGlow active:scale-95"
          >
            <Plus className="h-4 w-4 stroke-[3]" aria-hidden="true" />
            <span>Create Invoice</span>
          </Link>
        </div>
      </div>

      {/* METRIC / SUMMARY CARDS */}
      {summary ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Total Invoices Created"
            value={String(summary.totalInvoices)}
            subtext={`${summary.pendingInvoices} awaiting payment`}
            icon={<FileText className="h-5 w-5" />}
          />
          <MetricCard
            label="Pending Receivables"
            value={formatAmount(summary.totalPendingAmount, "USDC")}
            subtext={`${summary.pendingInvoices} pending milestone${summary.pendingInvoices === 1 ? "" : "s"}`}
            icon={<Clock className="h-5 w-5" />}
            accent="yellow"
          />
          <MetricCard
            label="Total Settled & Paid"
            value={formatAmount(summary.totalPaidAmount, "USDC")}
            subtext={`${summary.paidInvoices} verified on Horizon`}
            icon={<CheckCircle2 className="h-5 w-5" />}
            accent="yellow"
          />
          <MetricCard
            label="Available for Raast Cashout"
            value={
              Number(summary.totalPaidAmount) > 0
                ? `PKR ${(Number(summary.totalPaidAmount) * 278.25).toLocaleString("en-PK", {
                    maximumFractionDigits: 0,
                  })}`
                : "PKR 0"
            }
            subtext="Rate: 1 USDC ≈ 278.25 PKR"
            icon={<Zap className="h-5 w-5 fill-current" />}
          />
        </div>
      ) : null}

      {/* QUICK STATUS PROMO NOTICE */}
      <div className="flex flex-col gap-3 rounded-2xl border border-brand-yellow/20 bg-dark-900/90 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-yellow text-dark-950">
            <Zap className="h-5 w-5 fill-dark-950" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">
              Instant Raast Settlement Engine
            </p>
            <p className="text-xs text-dark-400">
              Paid invoices can be liquidated directly into your Meezan, HBL, JazzCash, or EasyPaisa account in seconds.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-brand-yellow font-bold">
            1 USDC = 278.25 PKR
          </span>
        </div>
      </div>

      {/* SEARCH AND FILTERS */}
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Status Tabs */}
          <div
            className="flex flex-wrap gap-1.5 rounded-xl border border-dark-750 bg-dark-900 p-1"
            role="tablist"
            aria-label="Filter invoices by status"
          >
            {FILTERS.map((item) => {
              const active = filter === item;
              return (
                <button
                  key={item}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setFilter(item)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold tracking-wide transition ${
                    active
                      ? "bg-brand-yellow text-dark-950 shadow-sm"
                      : "text-dark-400 hover:text-dark-100 hover:bg-dark-800"
                  }`}
                >
                  {FILTER_LABELS[item]}
                  {summary && item === "pending" ? (
                    <span
                      className={`ml-1.5 rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                        active ? "bg-dark-950 text-brand-yellow" : "bg-dark-800 text-brand-yellow"
                      }`}
                    >
                      {summary.pendingInvoices}
                    </span>
                  ) : null}
                  {summary && item === "paid" ? (
                    <span
                      className={`ml-1.5 rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                        active ? "bg-dark-950 text-brand-yellow" : "bg-dark-800 text-brand-yellow"
                      }`}
                    >
                      {summary.paidInvoices}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-dark-400" />
            <input
              type="text"
              placeholder="Search by client or project..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-dark-750 bg-dark-900 py-1.5 pl-8 pr-3 text-xs text-white placeholder-dark-500 focus:border-brand-yellow focus:outline-none focus:ring-1 focus:ring-brand-yellow"
            />
          </div>
        </div>

        {/* INVOICE LIST / TABLE */}
        <div>
          {loading ? (
            <Spinner label="Loading dashboard invoices" />
          ) : error ? (
            <ErrorBox message={error} onRetry={load} />
          ) : filteredInvoices.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-dark-700 bg-dark-900/60 py-16 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-dark-800 text-dark-400">
                <FileText className="h-6 w-6 text-brand-yellow" />
              </div>
              <p className="mt-3 text-sm font-semibold text-white">
                {searchQuery
                  ? "No matching invoices found"
                  : filter === "all"
                  ? "No invoices created yet"
                  : `No ${FILTER_LABELS[filter].toLowerCase()} invoices`}
              </p>
              <p className="mt-1 text-xs text-dark-400 max-w-sm mx-auto">
                {searchQuery
                  ? "Try searching for a different project title or client name."
                  : "Start receiving payments from international clients on Stellar with zero wire fees."}
              </p>
              {filter === "all" && !searchQuery ? (
                <Link
                  to="/invoices/new"
                  className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-brand-yellow px-4 py-2 text-xs font-bold text-dark-950 transition hover:bg-brand-yellowHover"
                >
                  <Plus className="h-4 w-4" />
                  Create your first invoice
                </Link>
              ) : null}
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-dark-750 bg-dark-900 shadow-xl">
              <div className="divide-y divide-dark-800">
                {filteredInvoices.map((invoice) => {
                  const shareUrl = `${window.location.origin}/pay/${invoice.id}`;
                  return (
                    <div
                      key={invoice.id}
                      className="group flex flex-col gap-3 p-4 transition hover:bg-dark-850/70 sm:flex-row sm:items-center sm:justify-between"
                    >
                      {/* Left: Info */}
                      <Link
                        to={`/invoices/${invoice.id}`}
                        className="flex items-start gap-3.5 min-w-0 flex-1"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-dark-800 border border-dark-700 font-mono text-xs font-bold text-brand-yellow transition group-hover:border-brand-yellow/40">
                          {invoice.clientName.slice(0, 2).toUpperCase() || "IV"}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-white group-hover:text-brand-yellow transition">
                            {invoice.projectTitle}
                          </p>
                          <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-dark-400">
                            <span className="font-medium text-dark-300">{invoice.clientName}</span>
                            <span>&bull;</span>
                            <span>{formatDate(invoice.createdAt)}</span>
                            {invoice.dueDate ? (
                              <>
                                <span>&bull;</span>
                                <span className="text-dark-400">Due {formatDate(invoice.dueDate)}</span>
                              </>
                            ) : null}
                          </div>
                        </div>
                      </Link>

                      {/* Right: Amount, Badge, Quick Actions */}
                      <div className="flex flex-wrap items-center justify-between gap-3 sm:justify-end">
                        <div className="text-right">
                          <p className="text-base font-black font-mono text-white">
                            {formatAmount(invoice.amount, invoice.assetCode)}
                          </p>
                          <p className="text-[10px] text-dark-400 font-mono">
                            ≈ PKR {(Number(invoice.amount) * 278.25).toLocaleString("en-PK", {
                              maximumFractionDigits: 0,
                            })}
                          </p>
                        </div>

                        <StatusBadge status={invoice.status} />

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <CopyButton value={shareUrl} label="Copy payment link" />

                          {invoice.status === "paid" ? (
                            <Link
                              to={`/invoices/${invoice.id}/cashout`}
                              className="inline-flex items-center gap-1 rounded-lg bg-brand-yellow/15 border border-brand-yellow/40 px-3 py-1.5 text-xs font-bold text-brand-yellow transition hover:bg-brand-yellow hover:text-dark-950"
                            >
                              <Zap className="h-3.5 w-3.5 fill-current" />
                              <span>Cash out</span>
                            </Link>
                          ) : (
                            <Link
                              to={`/pay/${invoice.id}`}
                              className="inline-flex items-center gap-1 rounded-lg border border-dark-700 bg-dark-800 px-2.5 py-1.5 text-xs font-medium text-dark-200 transition hover:border-brand-yellow/30 hover:text-white"
                            >
                              <span>Pay page</span>
                              <ArrowUpRight className="h-3 w-3 text-brand-yellow" />
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

