import type { Invoice } from "@payraast/shared";
import { ArrowLeft } from "lucide-react";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import CopyButton from "../components/CopyButton";
import ErrorBox from "../components/ErrorBox";
import QrCode from "../components/QrCode";
import Spinner from "../components/Spinner";
import StatusBadge from "../components/StatusBadge";
import { ApiRequestError, getInvoice } from "../lib/api";
import { formatAmount, formatDate } from "../lib/format";

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-1 py-3 sm:grid-cols-3 sm:gap-4">
      <dt className="text-sm text-navy-500">{label}</dt>
      <dd className="text-sm text-navy-900 sm:col-span-2">{children}</dd>
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
        <h1 className="text-xl font-bold text-navy-900">Invoice not found</h1>
        <p className="mt-1 text-sm text-navy-500">
          This invoice does not exist or the link is wrong.
        </p>
        <Link
          to="/invoices"
          className="mt-4 inline-block text-sm font-medium text-emerald-700 underline underline-offset-2"
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

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        to="/invoices"
        className="inline-flex items-center gap-1 text-sm text-navy-500 hover:text-navy-900"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        All invoices
      </Link>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-navy-900">
            {invoice.projectTitle}
          </h1>
          <p className="mt-1 text-sm text-navy-500">for {invoice.clientName}</p>
        </div>
        <StatusBadge status={invoice.status} />
      </div>

      <div className="mt-6 rounded-xl border border-navy-100 bg-white p-5 shadow-sm sm:p-6">
        <p className="text-sm text-navy-500">Amount due</p>
        <p className="mt-1 text-3xl font-bold tracking-tight text-navy-900">
          {formatAmount(invoice.amount, invoice.assetCode)}
        </p>

        <dl className="mt-5 divide-y divide-navy-100 border-t border-navy-100">
          {invoice.description ? (
            <Row label="Description">{invoice.description}</Row>
          ) : null}
          {invoice.clientEmail ? (
            <Row label="Client email">{invoice.clientEmail}</Row>
          ) : null}
          {invoice.dueDate ? (
            <Row label="Due date">{formatDate(invoice.dueDate)}</Row>
          ) : null}
          <Row label="Created">{formatDate(invoice.createdAt)}</Row>
          {invoice.paidAt ? (
            <Row label="Paid">
              <div className="flex items-center justify-between">
                <span>{formatDate(invoice.paidAt)}</span>
                <Link
                  to={`/receipt/${invoice.id}`}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 underline underline-offset-2"
                >
                  View receipt &rarr;
                </Link>
              </div>
            </Row>
          ) : null}
          <Row label="Pay to">
            <div className="flex items-center gap-2">
              <code className="min-w-0 flex-1 break-all font-mono text-xs">
                {invoice.recipientAddress}
              </code>
              <CopyButton
                value={invoice.recipientAddress}
                label="Copy recipient address"
              />
            </div>
          </Row>
        </dl>
      </div>

      <div className="mt-4 rounded-xl border border-navy-100 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-sm font-semibold text-navy-900">Payment link</h2>
        <p className="mt-1 text-xs text-navy-500">
          Share this link with your client. They can view the invoice and pay
          using a Stellar Testnet wallet.
        </p>
        <div className="mt-3 flex items-center gap-2">
          <code className="min-w-0 flex-1 break-all rounded-lg bg-navy-50 px-3 py-2 font-mono text-xs text-navy-700">
            {paymentLink}
          </code>
          <CopyButton value={paymentLink} label="Copy payment link" />
        </div>

        <div className="mt-4 flex justify-center">
          <QrCode value={paymentLink} label={`QR code for invoice ${invoice.id}`} />
        </div>
      </div>
    </div>
  );
}
