import type { Payment, PublicInvoice } from "@payraast/shared";
import { getExplorerTxUrl } from "@payraast/shared";
import { CheckCircle2, ExternalLink, Printer, ShieldCheck } from "lucide-react";
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
      <div className="min-h-screen bg-slate-50 py-12">
        <Spinner label="Loading receipt" />
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <ErrorBox message={error ?? "Receipt not found"} onRetry={load} />
        <div className="mt-4 text-center">
          <Link to="/" className="text-sm font-medium text-emerald-700 underline">
            Go home
          </Link>
        </div>
      </div>
    );
  }

  if (invoice.status !== "paid") {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="text-xl font-bold text-navy-900">Payment Pending</h1>
        <p className="mt-2 text-sm text-navy-500">
          This invoice has not been paid yet.
        </p>
        <Link
          to={`/pay/${invoice.id}`}
          className="mt-4 inline-flex items-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
        >
          Go to payment page
        </Link>
      </div>
    );
  }

  const txHash = payment?.transactionHash ?? "";
  const explorerUrl = txHash ? getExplorerTxUrl(txHash) : "";

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold tracking-tight text-navy-900">
            PayRaast
          </Link>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-navy-200 bg-white px-3 py-1.5 text-xs font-medium text-navy-700 shadow-sm transition hover:bg-navy-50 print:hidden"
          >
            <Printer className="h-3.5 w-3.5" aria-hidden="true" />
            Print receipt
          </button>
        </div>

        <div className="rounded-2xl border border-navy-100 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col items-center text-center pb-6 border-b border-navy-100">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
            </div>
            <h1 className="mt-3 text-2xl font-bold tracking-tight text-navy-900">
              Payment Receipt
            </h1>
            <p className="mt-1 text-sm text-navy-500">
              Verified on Stellar Testnet
            </p>
            <div className="mt-3 flex items-center gap-2">
              <StatusBadge status="paid" />
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                <ShieldCheck className="h-3 w-3" aria-hidden="true" />
                Verified
              </span>
            </div>
          </div>

          <div className="py-6 border-b border-navy-100 text-center">
            <p className="text-xs uppercase font-medium tracking-wider text-navy-400">
              Amount Paid
            </p>
            <p className="mt-1 text-3xl font-extrabold tracking-tight text-navy-900">
              {formatAmount(invoice.amount, invoice.assetCode)}
            </p>
            <p className="mt-1 text-xs text-navy-500">
              Stellar Testnet {invoice.assetCode} (No real monetary value)
            </p>
          </div>

          <dl className="divide-y divide-navy-100 text-sm">
            <div className="flex justify-between py-3">
              <dt className="text-navy-500">Invoice ID</dt>
              <dd className="font-mono text-xs font-medium text-navy-900">
                {invoice.id}
              </dd>
            </div>
            <div className="flex justify-between py-3">
              <dt className="text-navy-500">Project</dt>
              <dd className="font-medium text-navy-900 text-right">
                {invoice.projectTitle}
              </dd>
            </div>
            <div className="flex justify-between py-3">
              <dt className="text-navy-500">Client</dt>
              <dd className="font-medium text-navy-900">{invoice.clientName}</dd>
            </div>
            {invoice.paidAt ? (
              <div className="flex justify-between py-3">
                <dt className="text-navy-500">Payment Date</dt>
                <dd className="font-medium text-navy-900">
                  {formatDate(invoice.paidAt)}
                </dd>
              </div>
            ) : null}
            {payment?.senderAddress ? (
              <div className="flex justify-between py-3">
                <dt className="text-navy-500">Sender</dt>
                <dd className="font-mono text-xs text-navy-900">
                  {shortAddress(payment.senderAddress)}
                </dd>
              </div>
            ) : null}
            <div className="flex justify-between py-3">
              <dt className="text-navy-500">Recipient</dt>
              <dd className="font-mono text-xs text-navy-900">
                {shortAddress(invoice.recipientAddress)}
              </dd>
            </div>
            {txHash ? (
              <div className="py-3">
                <dt className="text-navy-500 mb-1">Transaction Hash</dt>
                <dd className="flex items-center gap-2">
                  <code className="min-w-0 flex-1 truncate font-mono text-xs text-navy-800 bg-navy-50 px-2.5 py-1.5 rounded-lg border border-navy-100">
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
                      className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 hover:text-emerald-800 underline underline-offset-2"
                    >
                      View on Stellar Expert
                      <ExternalLink className="h-3 w-3" aria-hidden="true" />
                    </a>
                  </div>
                ) : null}
              </div>
            ) : null}
          </dl>

          <div className="mt-6 pt-4 border-t border-navy-100 flex flex-wrap items-center justify-between gap-3 print:hidden">
            <Link
              to={`/pay/${invoice.id}`}
              className="text-xs font-medium text-navy-500 hover:text-navy-900"
            >
              &larr; Back to invoice
            </Link>
            <Link
              to="/"
              className="rounded-lg bg-navy-900 px-4 py-2 text-xs font-medium text-white transition hover:bg-navy-800"
            >
              Done
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
