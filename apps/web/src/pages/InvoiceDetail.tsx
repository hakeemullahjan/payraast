import type { Invoice } from "@payraast/shared";
import { ArrowLeft, ArrowUpRight, CheckCircle2, Clock, ExternalLink, QrCode as QrIcon, Share2, Sparkles, Zap } from "lucide-react";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import CopyButton from "../components/CopyButton";
import ErrorBox from "../components/ErrorBox";
import QrCode from "../components/QrCode";
import Spinner from "../components/Spinner";
import StatusBadge from "../components/StatusBadge";
import { ApiRequestError, getInvoice } from "../lib/api";
import { formatAmount, formatDate } from "../lib/format";

function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-1 py-3.5 sm:grid-cols-3 sm:gap-4">
      <dt className="text-xs font-semibold uppercase tracking-wider text-dark-400">{label}</dt>
      <dd className="text-sm font-medium text-white sm:col-span-2">{children}</dd>
    </div>
  );
}

export default function InvoiceDetail() {
  const { id = "" } = useParams();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [error, setError] = useState<ApiRequestError | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setInvoice(await getInvoice(id));
    } catch (err) {
      setError(
        err instanceof ApiRequestError
          ? err
          : new ApiRequestError("UNKNOWN_ERROR", "Something went wrong.")
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) return <Spinner label="Loading invoice" />;

  if (error?.code === "INVOICE_NOT_FOUND") {
    return (
      <div className="py-16 text-center">
        <h1 className="text-xl font-bold text-white">Invoice not found</h1>
        <p className="mt-1 text-sm text-dark-400">
          This invoice does not exist or the link is invalid.
        </p>
        <Link
          to="/invoices"
          className="mt-4 inline-block text-xs font-bold text-brand-yellow underline underline-offset-2"
        >
          Back to invoices
        </Link>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <ErrorBox
        message={error?.message ?? "Could not load the invoice."}
        onRetry={load}
      />
    );
  }

  const paymentLink = `${window.location.origin}/pay/${invoice.id}`;
  const isPaid = invoice.status === "paid";
  const pkrValue = (Number(invoice.amount) * 278.25).toLocaleString("en-PK", {
    minimumFractionDigits: 2,
  });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Top Header */}
      <div>
        <Link
          to="/invoices"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-dark-400 hover:text-brand-yellow transition"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>All invoices</span>
        </Link>

        <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
              {invoice.projectTitle}
            </h1>
            <p className="mt-1 text-sm text-dark-400">
              Client: <span className="text-white font-medium">{invoice.clientName}</span>
            </p>
          </div>
          <StatusBadge status={invoice.status} />
        </div>
      </div>

      {/* CASHOUT BANNER IF PAID */}
      {isPaid ? (
        <div className="relative overflow-hidden rounded-2xl border border-brand-yellow/30 bg-gradient-to-r from-dark-900 via-dark-850 to-dark-900 p-5 shadow-[0_0_30px_-5px_rgba(250,204,21,0.2)]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-brand-yellow">
                <CheckCircle2 className="h-4 w-4 text-brand-yellow" />
                <span>Payment Verified on Stellar Horizon</span>
              </div>
              <p className="mt-1 text-base font-bold text-white">
                Ready to withdraw to PKR via SBP Raast?
              </p>
              <p className="text-xs text-dark-300">
                Guaranteed quote: <span className="font-mono font-bold text-brand-yellow">PKR {pkrValue}</span> at 0% fees.
              </p>
            </div>
            <Link
              to={`/invoices/${invoice.id}/cashout`}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-brand-yellow px-5 py-2.5 text-xs font-bold text-dark-950 shadow-md transition hover:bg-brand-yellowHover hover:scale-105"
            >
              <Zap className="h-4 w-4 fill-dark-950" />
              <span>Cash out to PKR &rarr;</span>
            </Link>
          </div>
        </div>
      ) : null}

      {/* MAIN INVOICE CARD */}
      <div className="rounded-2xl border border-dark-750 bg-dark-900 p-6 shadow-xl sm:p-7">
        <div className="flex items-baseline justify-between border-b border-dark-800 pb-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-dark-400">Amount Due</p>
            <p className="mt-1 text-3xl font-black font-mono tracking-tight text-brand-yellow sm:text-4xl">
              {formatAmount(invoice.amount, invoice.assetCode)}
            </p>
            <p className="text-xs text-dark-400 font-mono mt-0.5">
              ≈ PKR {pkrValue}
            </p>
          </div>
          <span className="rounded-lg border border-dark-700 bg-dark-800 px-2.5 py-1 text-xs font-mono text-dark-300">
            {invoice.assetCode} &bull; Stellar Testnet
          </span>
        </div>

        <dl className="divide-y divide-dark-800">
          {invoice.description ? (
            <DetailRow label="Scope & Description">{invoice.description}</DetailRow>
          ) : null}
          {invoice.clientEmail ? (
            <DetailRow label="Client Email">{invoice.clientEmail}</DetailRow>
          ) : null}
          {invoice.dueDate ? (
            <DetailRow label="Due Date">{formatDate(invoice.dueDate)}</DetailRow>
          ) : null}
          <DetailRow label="Created On">{formatDate(invoice.createdAt)}</DetailRow>
          {invoice.paidAt ? (
            <DetailRow label="Paid On">
              <div className="flex items-center justify-between">
                <span className="text-brand-yellow font-mono">{formatDate(invoice.paidAt)}</span>
                <Link
                  to={`/receipt/${invoice.id}`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-brand-yellow underline underline-offset-2 hover:text-brand-yellowHover"
                >
                  <span>View Verified Receipt</span>
                  <ArrowUpRight className="h-3 w-3" />
                </Link>
              </div>
            </DetailRow>
          ) : null}
          <DetailRow label="Receiving Address">
            <div className="flex items-center gap-2">
              <code className="min-w-0 flex-1 break-all rounded-lg bg-dark-950 p-2 font-mono text-xs text-brand-yellow/90 border border-dark-800">
                {invoice.recipientAddress}
              </code>
              <CopyButton
                value={invoice.recipientAddress}
                label="Copy recipient address"
              />
            </div>
          </DetailRow>
        </dl>
      </div>

      {/* SHAREABLE PAYMENT LINK & QR */}
      <div className="rounded-2xl border border-dark-750 bg-dark-900 p-6 shadow-xl sm:p-7">
        <div className="flex items-center gap-2">
          <Share2 className="h-4 w-4 text-brand-yellow" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-white">
            Client Payment Link
          </h2>
        </div>
        <p className="mt-1 text-xs text-dark-400">
          Send this public checkout page to your international client. They can connect Freighter or pay with any Stellar wallet.
        </p>

        <div className="mt-4 flex items-center gap-2">
          <code className="min-w-0 flex-1 truncate rounded-xl border border-dark-700 bg-dark-950 px-3.5 py-2.5 font-mono text-xs text-dark-200">
            {paymentLink}
          </code>
          <CopyButton value={paymentLink} label="Copy payment link" />
          <a
            href={paymentLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-dark-700 bg-dark-850 px-2.5 py-1.5 text-xs font-medium text-dark-200 hover:text-brand-yellow transition"
          >
            <span>Open</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>

        <div className="mt-6 flex flex-col items-center justify-center">
          <p className="text-[11px] font-medium text-dark-400 mb-2 flex items-center gap-1">
            <QrIcon className="h-3.5 w-3.5 text-brand-yellow" />
            Scan to pay on mobile wallet
          </p>
          <QrCode value={paymentLink} label={`QR code for invoice ${invoice.id}`} />
        </div>
      </div>
    </div>
  );
}

