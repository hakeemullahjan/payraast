import type { Payment, PublicInvoice } from "@payraast/shared";
import { getExplorerTxUrl } from "@payraast/shared";
import { ArrowLeft, CheckCircle2, ExternalLink, Printer, ShieldCheck, Zap } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import CopyButton from "../components/CopyButton";
import ErrorBox from "../components/ErrorBox";
import Spinner from "../components/Spinner";
import StatusBadge from "../components/StatusBadge";
import { ApiRequestError, getPayment, getPublicInvoice } from "../lib/api";
import { formatAmount, formatDate, shortAddress } from "../lib/format";

export default function Receipt() {
  const { id = "" } = useParams();
  const [invoice, setInvoice] = useState<PublicInvoice | null>(null);
  const [payment, setPayment] = useState<Payment | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const inv = await getPublicInvoice(id);
      setInvoice(inv);
      if (inv.status === "paid") {
        try {
          const pay = await getPayment(id);
          setPayment(pay);
        } catch {
          // Payment record might still be populating or public
        }
      }
    } catch (err) {
      setError(
        err instanceof ApiRequestError ? err.message : "Could not load receipt."
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 text-dark-100 py-16">
        <Spinner label="Loading receipt" />
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-dark-950 text-dark-100 flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full">
          <ErrorBox message={error ?? "Receipt not found"} onRetry={load} />
          <div className="mt-4 text-center">
            <Link to="/" className="text-xs font-bold text-brand-yellow underline">
              Return Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (invoice.status !== "paid") {
    return (
      <div className="min-h-screen bg-dark-950 text-dark-100 flex items-center justify-center px-4 py-16 text-center">
        <div className="max-w-md w-full rounded-2xl border border-dark-800 bg-dark-900 p-8">
          <h1 className="text-xl font-bold text-white">Payment Pending</h1>
          <p className="mt-2 text-sm text-dark-400">
            This invoice has not yet been paid or verified.
          </p>
          <Link
            to={`/pay/${invoice.id}`}
            className="mt-5 inline-flex items-center rounded-xl bg-brand-yellow px-5 py-2.5 text-xs font-bold text-dark-950 transition hover:bg-brand-yellowHover"
          >
            Go to payment page
          </Link>
        </div>
      </div>
    );
  }

  const txHash = payment?.transactionHash ?? "";
  const explorerUrl = txHash ? getExplorerTxUrl(txHash) : "";
  const pkrEquivalent = (Number(invoice.amount) * 278.25).toLocaleString("en-PK", {
    minimumFractionDigits: 2,
  });

  return (
    <div className="min-h-screen bg-dark-950 text-dark-100 py-10 px-4 sm:px-6">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Top Action Bar */}
        <div className="flex items-center justify-between print:hidden">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-yellow text-dark-950">
              <Zap className="h-4 w-4 fill-dark-950" />
            </div>
            <span className="text-base font-black text-white">
              Pay<span className="text-brand-yellow">Raast</span>
            </span>
          </Link>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-dark-700 bg-dark-850 px-3 py-1.5 text-xs font-semibold text-dark-200 transition hover:border-brand-yellow/40 hover:text-white"
          >
            <Printer className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Print Receipt</span>
          </button>
        </div>

        {/* RECEIPT CARD */}
        <div className="rounded-2xl border border-dark-750 bg-dark-900 p-6 shadow-2xl sm:p-8">
          {/* Header Status */}
          <div className="flex flex-col items-center text-center pb-6 border-b border-dark-800">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-yellow/15 text-brand-yellow border border-brand-yellow/30 shadow-[0_0_25px_-5px_rgba(250,204,21,0.25)]">
              <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
            </div>
            <h1 className="mt-4 text-2xl font-black tracking-tight text-white sm:text-3xl">
              Official Payment Receipt
            </h1>
            <p className="mt-1 text-xs text-dark-400">
              Cryptographically verified on Stellar Horizon Testnet
            </p>
            <div className="mt-3 flex items-center gap-2">
              <StatusBadge status="paid" />
              <span className="inline-flex items-center gap-1 rounded-full border border-dark-700 bg-dark-950 px-2.5 py-0.5 text-[11px] font-mono text-brand-yellow">
                <ShieldCheck className="h-3 w-3" />
                Verified
              </span>
            </div>
          </div>

          {/* Amount Box */}
          <div className="py-6 border-b border-dark-800 text-center">
            <p className="text-xs uppercase font-semibold tracking-wider text-dark-400">
              Total Amount Settled
            </p>
            <p className="mt-1 text-4xl font-black font-mono tracking-tight text-brand-yellow">
              {formatAmount(invoice.amount, invoice.assetCode)}
            </p>
            <p className="mt-1 text-xs text-dark-400 font-mono">
              ≈ PKR {pkrEquivalent} &bull; Stellar Testnet USDC
            </p>
          </div>

          {/* Details list */}
          <dl className="divide-y divide-dark-800 text-sm">
            <div className="flex justify-between py-3">
              <dt className="text-xs uppercase font-semibold text-dark-400">Invoice ID</dt>
              <dd className="font-mono text-xs font-bold text-white">
                {invoice.id}
              </dd>
            </div>
            <div className="flex justify-between py-3">
              <dt className="text-xs uppercase font-semibold text-dark-400">Project Title</dt>
              <dd className="font-medium text-white text-right">
                {invoice.projectTitle}
              </dd>
            </div>
            <div className="flex justify-between py-3">
              <dt className="text-xs uppercase font-semibold text-dark-400">Client</dt>
              <dd className="font-medium text-white">{invoice.clientName}</dd>
            </div>
            {invoice.paidAt ? (
              <div className="flex justify-between py-3">
                <dt className="text-xs uppercase font-semibold text-dark-400">Settled On</dt>
                <dd className="font-mono text-xs text-white">
                  {formatDate(invoice.paidAt)}
                </dd>
              </div>
            ) : null}
            {payment?.senderAddress ? (
              <div className="flex justify-between py-3">
                <dt className="text-xs uppercase font-semibold text-dark-400">Payer Address</dt>
                <dd className="font-mono text-xs text-brand-yellow">
                  {shortAddress(payment.senderAddress)}
                </dd>
              </div>
            ) : null}
            <div className="flex justify-between py-3">
              <dt className="text-xs uppercase font-semibold text-dark-400">Recipient</dt>
              <dd className="font-mono text-xs text-white">
                {shortAddress(invoice.recipientAddress)}
              </dd>
            </div>
            {txHash ? (
              <div className="py-3">
                <dt className="text-xs uppercase font-semibold text-dark-400 mb-1.5">
                  Stellar Transaction Hash
                </dt>
                <dd className="flex items-center gap-2">
                  <code className="min-w-0 flex-1 truncate font-mono text-xs text-dark-200 bg-dark-950 p-2 rounded-xl border border-dark-750">
                    {txHash}
                  </code>
                  <CopyButton value={txHash} label="Copy transaction hash" />
                </dd>
                {explorerUrl ? (
                  <div className="mt-2 text-right">
                    <a
                      href={explorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-bold text-brand-yellow hover:text-brand-yellowHover underline underline-offset-2"
                    >
                      <span>Inspect On-Chain Proof on Stellar Expert</span>
                      <ExternalLink className="h-3 w-3" aria-hidden="true" />
                    </a>
                  </div>
                ) : null}
              </div>
            ) : null}
          </dl>

          {/* Bottom Actions */}
          <div className="mt-6 pt-5 border-t border-dark-800 flex flex-wrap items-center justify-between gap-3 print:hidden">
            <Link
              to={`/pay/${invoice.id}`}
              className="inline-flex items-center gap-1 text-xs font-medium text-dark-400 hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Invoice Checkout</span>
            </Link>

            <div className="flex items-center gap-2">
              <Link
                to={`/invoices/${invoice.id}/cashout`}
                className="inline-flex items-center gap-1.5 rounded-xl bg-brand-yellow px-4 py-2 text-xs font-bold text-dark-950 shadow-md transition hover:bg-brand-yellowHover"
              >
                <Zap className="h-3.5 w-3.5 fill-dark-950" />
                <span>Cash out to PKR &rarr;</span>
              </Link>
              <Link
                to="/invoices"
                className="rounded-xl border border-dark-700 bg-dark-800 px-4 py-2 text-xs font-medium text-white transition hover:bg-dark-750"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

