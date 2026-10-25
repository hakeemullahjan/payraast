import type { Payment, PublicInvoice } from "@payraast/shared";
import { STELLAR_CONFIG, getExplorerTxUrl } from "@payraast/shared";
import {
  isConnected,
  requestAccess,
  signTransaction,
} from "@stellar/freighter-api";
import {
  CheckCircle2,
  ChevronDown,
  ExternalLink,
  Loader2,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import CopyButton from "../components/CopyButton";
import ErrorBox from "../components/ErrorBox";
import QrCode from "../components/QrCode";
import Spinner from "../components/Spinner";
import StatusBadge from "../components/StatusBadge";
import {
  ApiRequestError,
  buildTransaction,
  buildTrustline,
  getPayment,
  getPublicInvoice,
  submitPayment,
  submitTrustline,
  verifyPayment,
} from "../lib/api";
import { formatAmount, formatDate, shortAddress } from "../lib/format";

function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-navy-100 bg-white">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <Link to="/" className="text-lg font-bold tracking-tight text-navy-900">
            PayRaast
          </Link>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
            Stellar Testnet
          </span>
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-4 py-8">{children}</main>
    </div>
  );
}

type PaymentStep =
  | "idle"
  | "building"
  | "signing"
  | "submitting"
  | "verifying"
  | "success"
  | "error";

export default function PayInvoice() {
  const { id = "" } = useParams();
  const navigate = useNavigate();

  const [invoice, setInvoice] = useState<PublicInvoice | null>(null);
  const [payment, setPayment] = useState<Payment | null>(null);
  const [error, setError] = useState<ApiRequestError | null>(null);
  const [loading, setLoading] = useState(true);

  // Wallet connection state
  const [freighterInstalled, setFreighterInstalled] = useState<boolean | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [connectingWallet, setConnectingWallet] = useState(false);
  const [walletError, setWalletError] = useState<string | null>(null);

  // Payment execution state
  const [paymentStep, setPaymentStep] = useState<PaymentStep>("idle");
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [trustlineAdding, setTrustlineAdding] = useState(false);
  const [trustlineSuccess, setTrustlineSuccess] = useState<string | null>(null);

  // Manual tx hash verification
  const [manualTxHash, setManualTxHash] = useState("");
  const [manualSubmitting, setManualSubmitting] = useState(false);
  const [manualError, setManualError] = useState<string | null>(null);
  const [showManual, setShowManual] = useState(false);

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
          // Ignore if payment fetch fails
        }
      }
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

  // Check if Freighter extension is available
  useEffect(() => {
    let mounted = true;
    void isConnected()
      .then((res) => {
        if (!mounted) return;
        const installed = typeof res === "boolean" ? res : res?.isConnected ?? false;
        setFreighterInstalled(Boolean(installed));
      })
      .catch(() => {
        if (mounted) setFreighterInstalled(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  async function handleConnectWallet() {
    setConnectingWallet(true);
    setWalletError(null);
    try {
      const accessObj = await requestAccess();
      const address =
        typeof accessObj === "string"
          ? accessObj
          : (accessObj as { address?: string })?.address;

      if (!address) {
        throw new Error("Could not retrieve account address from Freighter.");
      }
      setWalletAddress(address);
    } catch (err) {
      setWalletError(
        err instanceof Error ? err.message : "Failed to connect wallet."
      );
    } finally {
      setConnectingWallet(false);
    }
  }

  async function handleEstablishTrustline() {
    if (!walletAddress) return;
    setTrustlineAdding(true);
    setPaymentError(null);
    setTrustlineSuccess(null);
    try {
      const { xdr } = await buildTrustline(walletAddress);
      const signResult = await signTransaction(xdr, {
        networkPassphrase: STELLAR_CONFIG.networkPassphrase,
      });
      const signedTxXdr =
        typeof signResult === "string"
          ? signResult
          : (signResult as { signedTxXdr?: string })?.signedTxXdr;

      if (!signedTxXdr) {
        throw new Error("Trustline signing was cancelled in wallet.");
      }

      await submitTrustline(signedTxXdr);
      setTrustlineSuccess(
        "USDC trustline established! You can now proceed to pay."
      );
    } catch (err: unknown) {
      setPaymentError(
        err instanceof ApiRequestError
          ? err.message
          : err instanceof Error
          ? err.message
          : "Failed to establish USDC trustline."
      );
    } finally {
      setTrustlineAdding(false);
    }
  }

  async function handlePayWithFreighter() {
    if (!invoice || !walletAddress) return;

    setPaymentStep("building");
    setPaymentError(null);

    try {
      // 1. Ask backend to build the unsigned payment transaction XDR
      const { xdr } = await buildTransaction(invoice.id, walletAddress);

      // 2. Request user to review and sign via Freighter wallet
      setPaymentStep("signing");
      const signResult = await signTransaction(xdr, {
        networkPassphrase: STELLAR_CONFIG.networkPassphrase,
      });

      const signedTxXdr =
        typeof signResult === "string"
          ? signResult
          : (signResult as { signedTxXdr?: string })?.signedTxXdr;

      if (!signedTxXdr) {
        const errorMsg =
          (signResult as { error?: { message?: string } })?.error?.message ??
          "Wallet signing was cancelled or rejected.";
        throw new Error(errorMsg);
      }

      // 3. Submit and verify transaction on Stellar Testnet
      setPaymentStep("submitting");
      const verified = await submitPayment(invoice.id, signedTxXdr);

      setInvoice(verified.invoice);
      setPayment(verified.payment);
      setPaymentStep("success");
      navigate(`/receipt/${invoice.id}`);
    } catch (err: unknown) {
      setPaymentStep("error");
      setPaymentError(
        err instanceof ApiRequestError
          ? err.message
          : err instanceof Error
          ? err.message
          : "An unexpected error occurred during payment."
      );
    }
  }

  async function handleManualVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!invoice || !manualTxHash.trim()) return;

    setManualSubmitting(true);
    setManualError(null);
    try {
      const verified = await verifyPayment(invoice.id, manualTxHash.trim());
      setInvoice(verified.invoice);
      setPayment(verified.payment);
      navigate(`/receipt/${invoice.id}`);
    } catch (err: unknown) {
      setManualError(
        err instanceof ApiRequestError
          ? err.message
          : err instanceof Error
          ? err.message
          : "Failed to verify transaction."
      );
    } finally {
      setManualSubmitting(false);
    }
  }

  if (loading) {
    return (
      <Shell>
        <Spinner label="Loading invoice" />
      </Shell>
    );
  }

  if (error?.code === "INVOICE_NOT_FOUND") {
    return (
      <Shell>
        <div className="py-16 text-center">
          <h1 className="text-xl font-bold text-navy-900">Invoice not found</h1>
          <p className="mt-1 text-sm text-navy-500">
            This payment link is invalid or the invoice no longer exists. Ask the
            sender for a new link.
          </p>
        </div>
      </Shell>
    );
  }

  if (error || !invoice) {
    return (
      <Shell>
        <ErrorBox
          message={error?.message ?? "Could not load the invoice."}
          onRetry={load}
        />
      </Shell>
    );
  }

  const isPaid = invoice.status === "paid";
  const isCancelled = invoice.status === "cancelled";

  return (
    <Shell>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm text-navy-500">Invoice for {invoice.clientName}</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-navy-900">
            {invoice.projectTitle}
          </h1>
        </div>
        <StatusBadge status={invoice.status} />
      </div>

      <div className="mt-6 rounded-xl border border-navy-100 bg-white p-5 shadow-sm sm:p-6">
        <p className="text-sm text-navy-500">Amount due</p>
        <p className="mt-1 text-3xl font-bold tracking-tight text-navy-900">
          {formatAmount(invoice.amount, invoice.assetCode)}
        </p>
        <p className="mt-1 text-xs text-navy-500">
          Stellar Testnet {invoice.assetCode}. No real monetary value.
        </p>

        {!isPaid ? (
          <div className="mt-4 flex justify-center">
            <div className="rounded-xl bg-white p-3 shadow-sm border border-navy-100">
              <QrCode
                value={`${window.location.origin}/pay/${invoice.id}`}
                label={`QR code for invoice ${invoice.id}`}
              />
            </div>
          </div>
        ) : null}

        <dl className="mt-5 divide-y divide-navy-100 border-t border-navy-100 text-sm">
          {invoice.description ? (
            <div className="grid gap-1 py-3 sm:grid-cols-3 sm:gap-4">
              <dt className="text-navy-500">Description</dt>
              <dd className="text-navy-900 sm:col-span-2">
                {invoice.description}
              </dd>
            </div>
          ) : null}
          {invoice.dueDate ? (
            <div className="grid gap-1 py-3 sm:grid-cols-3 sm:gap-4">
              <dt className="text-navy-500">Due date</dt>
              <dd className="text-navy-900 sm:col-span-2">
                {formatDate(invoice.dueDate)}
              </dd>
            </div>
          ) : null}
          <div className="grid gap-1 py-3 sm:grid-cols-3 sm:gap-4">
            <dt className="text-navy-500">Pay to</dt>
            <dd className="sm:col-span-2">
              <div className="flex items-center gap-2">
                <code className="min-w-0 flex-1 break-all font-mono text-xs text-navy-900">
                  {invoice.recipientAddress}
                </code>
                <CopyButton
                  value={invoice.recipientAddress}
                  label="Copy recipient address"
                />
              </div>
            </dd>
          </div>
        </dl>
      </div>

      {/* PAID STATE */}
      {isPaid ? (
        <div className="mt-6 rounded-xl border border-emerald-100 bg-emerald-50 p-6 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
          </div>
          <h2 className="mt-3 text-lg font-bold text-emerald-950">
            This invoice is paid!
          </h2>
          <p className="mt-1 text-sm text-emerald-800">
            Transaction was independently verified on Stellar Testnet.
          </p>
          {payment?.transactionHash ? (
            <div className="mt-4 flex flex-col items-center gap-2">
              <a
                href={getExplorerTxUrl(payment.transactionHash)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 underline underline-offset-2 hover:text-emerald-800"
              >
                View transaction on Stellar Expert
                <ExternalLink className="h-3 w-3" aria-hidden="true" />
              </a>
            </div>
          ) : null}
          <div className="mt-5">
            <Link
              to={`/receipt/${invoice.id}`}
              className="inline-flex items-center rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-800"
            >
              View verified receipt &rarr;
            </Link>
          </div>
        </div>
      ) : isCancelled ? (
        <div className="mt-6 rounded-xl border border-navy-100 bg-white p-4 text-center text-sm text-navy-600">
          This invoice was cancelled and can no longer be paid.
        </div>
      ) : (
        /* PENDING PAYMENT FLOW */
        <div className="mt-6 space-y-4">
          <div className="rounded-xl border border-navy-100 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-base font-semibold text-navy-900">
              Pay with Stellar Wallet
            </h2>
            <p className="mt-1 text-xs text-navy-500">
              Connect your Freighter wallet to sign and submit payment on Testnet.
            </p>

            {walletError ? (
              <div className="mt-4">
                <ErrorBox message={walletError} />
              </div>
            ) : null}

            {paymentError ? (
              <div className="mt-4">
                <ErrorBox message={paymentError} />
              </div>
            ) : null}

            <div className="mt-5">
              {freighterInstalled === false ? (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800">
                  <p className="font-semibold">Freighter wallet not detected</p>
                  <p className="mt-1">
                    To pay directly with one click, please install the{" "}
                    <a
                      href="https://www.freighter.app/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium underline hover:text-amber-950"
                    >
                      Freighter browser extension
                    </a>
                    . You can also send the payment manually and verify the transaction hash below.
                  </p>
                </div>
              ) : !walletAddress ? (
                <button
                  type="button"
                  onClick={handleConnectWallet}
                  disabled={connectingWallet}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-60"
                >
                  {connectingWallet ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Wallet className="h-4 w-4" aria-hidden="true" />
                  )}
                  {connectingWallet ? "Connecting wallet..." : "Connect Freighter Wallet"}
                </button>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg bg-navy-50 px-3.5 py-2.5 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      <span className="font-mono text-navy-800">
                        {shortAddress(walletAddress)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setWalletAddress(null)}
                      className="text-navy-500 hover:text-navy-900 underline"
                    >
                      Disconnect
                    </button>
                  </div>

                  {trustlineSuccess ? (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
                      {trustlineSuccess}
                    </div>
                  ) : null}

                  <button
                    type="button"
                    onClick={handlePayWithFreighter}
                    disabled={paymentStep !== "idle" && paymentStep !== "error"}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {paymentStep === "building" ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                        Preparing transaction...
                      </>
                    ) : paymentStep === "signing" ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                        Approve payment in Freighter...
                      </>
                    ) : paymentStep === "submitting" ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                        Submitting and verifying on Testnet...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                        Pay {formatAmount(invoice.amount, invoice.assetCode)}
                      </>
                    )}
                  </button>

                  <div className="pt-1 text-center">
                    <button
                      type="button"
                      onClick={handleEstablishTrustline}
                      disabled={trustlineAdding}
                      className="inline-flex items-center gap-1.5 text-xs text-navy-500 hover:text-navy-900 underline"
                    >
                      {trustlineAdding ? (
                        <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
                      ) : null}
                      {trustlineAdding
                        ? "Approving trustline in Freighter..."
                        : "First time paying? Add USDC Trustline to your wallet"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* MANUAL TX HASH VERIFICATION ACCORDION */}
          <div className="rounded-xl border border-navy-100 bg-white p-5 shadow-sm">
            <button
              type="button"
              onClick={() => setShowManual(!showManual)}
              className="flex w-full items-center justify-between text-left text-xs font-medium text-navy-600 hover:text-navy-900"
            >
              <span>Paid using another wallet or Stellar Lab?</span>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${showManual ? "rotate-180" : ""}`}
                aria-hidden="true"
              />
            </button>

            {showManual ? (
              <form onSubmit={handleManualVerify} className="mt-4 space-y-3">
                <p className="text-xs text-navy-500">
                  Paste your 64-character Stellar Testnet transaction hash here. Our
                  backend will independently verify the payment on Horizon.
                </p>

                {manualError ? <ErrorBox message={manualError} /> : null}

                <div>
                  <label htmlFor="txHash" className="sr-only">
                    Transaction hash
                  </label>
                  <input
                    id="txHash"
                    type="text"
                    spellCheck={false}
                    placeholder="Transaction hash (64 hex characters)"
                    value={manualTxHash}
                    onChange={(e) => setManualTxHash(e.target.value)}
                    className="block w-full rounded-lg border border-navy-200 bg-white px-3 py-2 font-mono text-xs text-navy-900 placeholder:text-navy-300 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>

                <button
                  type="submit"
                  disabled={manualSubmitting || !manualTxHash.trim()}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-navy-900 px-4 py-2 text-xs font-medium text-white transition hover:bg-navy-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {manualSubmitting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                  ) : null}
                  {manualSubmitting ? "Verifying on Testnet..." : "Verify payment"}
                </button>
              </form>
            ) : null}
          </div>
        </div>
      )}
    </Shell>
  );
}
