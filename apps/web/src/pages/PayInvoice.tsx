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
  Lock,
  QrCode as QrIcon,
  ShieldCheck,
  Sparkles,
  Wallet,
  Zap,
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
    <div className="min-h-screen bg-dark-950 text-dark-100 flex flex-col">
      <header className="border-b border-dark-800/80 bg-dark-950/80 backdrop-blur-md sticky top-0 z-30">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3 sm:px-6">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-yellow text-dark-950 shadow-sm transition group-hover:scale-105">
              <Zap className="h-4 w-4 fill-dark-950 stroke-[2.5]" aria-hidden="true" />
            </div>
            <span className="text-base font-black tracking-tight text-white flex items-center gap-1">
              Pay<span className="text-brand-yellow">Raast</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-dark-700 bg-dark-900 px-3 py-1 text-xs font-medium text-dark-300">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-yellow animate-pulse" />
              <span>Stellar Testnet</span>
            </span>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 flex-1">{children}</main>
      <footer className="border-t border-dark-800/60 py-6 text-center text-xs text-dark-500">
        <p>Verified cryptographically on Stellar Horizon &bull; Non-custodial checkout</p>
      </footer>
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
      const { xdr } = await buildTransaction(invoice.id, walletAddress);

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
        <Spinner label="Loading checkout" />
      </Shell>
    );
  }

  if (error?.code === "INVOICE_NOT_FOUND") {
    return (
      <Shell>
        <div className="rounded-2xl border border-dark-800 bg-dark-900 p-8 text-center">
          <h1 className="text-xl font-bold text-white">Invoice Not Found</h1>
          <p className="mt-2 text-sm text-dark-400">
            This payment link is invalid or the invoice no longer exists.
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
      <div className="space-y-6">
        {/* Top Invoice Banner */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-dark-400">
              Invoice for {invoice.clientName}
            </p>
            <h1 className="mt-1 text-2xl font-black tracking-tight text-white sm:text-3xl">
              {invoice.projectTitle}
            </h1>
          </div>
          <StatusBadge status={invoice.status} />
        </div>

        {/* Amount Card */}
        <div className="rounded-2xl border border-dark-750 bg-dark-900 p-6 shadow-xl sm:p-7">
          <div className="flex items-baseline justify-between border-b border-dark-800 pb-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-dark-400">Amount Due</p>
              <p className="mt-1 text-3xl font-black font-mono tracking-tight text-brand-yellow sm:text-4xl">
                {formatAmount(invoice.amount, invoice.assetCode)}
              </p>
              <p className="text-[11px] text-dark-400 mt-1">
                Stellar Testnet &bull; Fast, non-custodial settlement
              </p>
            </div>
            <span className="rounded-lg border border-dark-700 bg-dark-800 px-3 py-1 text-xs font-mono font-semibold text-brand-yellow">
              {invoice.assetCode}
            </span>
          </div>

          <dl className="mt-5 divide-y divide-dark-800 text-sm">
            {invoice.description ? (
              <div className="grid gap-1 py-3 sm:grid-cols-3 sm:gap-4">
                <dt className="text-xs font-semibold uppercase tracking-wider text-dark-400">Description</dt>
                <dd className="text-dark-200 sm:col-span-2">{invoice.description}</dd>
              </div>
            ) : null}
            {invoice.dueDate ? (
              <div className="grid gap-1 py-3 sm:grid-cols-3 sm:gap-4">
                <dt className="text-xs font-semibold uppercase tracking-wider text-dark-400">Due date</dt>
                <dd className="font-mono text-dark-200 sm:col-span-2">{formatDate(invoice.dueDate)}</dd>
              </div>
            ) : null}
            <div className="grid gap-1 py-3 sm:grid-cols-3 sm:gap-4">
              <dt className="text-xs font-semibold uppercase tracking-wider text-dark-400">Recipient</dt>
              <dd className="sm:col-span-2">
                <div className="flex items-center gap-2">
                  <code className="min-w-0 flex-1 truncate rounded-lg bg-dark-950 p-2 font-mono text-xs text-brand-yellow/90 border border-dark-800">
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

          {!isPaid ? (
            <div className="mt-6 flex flex-col items-center justify-center border-t border-dark-800 pt-5">
              <p className="text-xs font-medium text-dark-400 mb-2.5 flex items-center gap-1.5">
                <QrIcon className="h-3.5 w-3.5 text-brand-yellow" />
                Scan to pay with mobile Stellar wallet
              </p>
              <QrCode
                value={`${window.location.origin}/pay/${invoice.id}`}
                label={`QR code for invoice ${invoice.id}`}
              />
            </div>
          ) : null}
        </div>

        {/* PAID STATE */}
        {isPaid ? (
          <div className="rounded-2xl border border-brand-yellow/40 bg-dark-900 p-8 text-center shadow-[0_0_30px_-5px_rgba(250,204,21,0.25)]">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-yellow/15 text-brand-yellow border border-brand-yellow/30">
              <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
            </div>
            <h2 className="mt-4 text-xl font-bold text-white">
              Invoice Paid Successfully!
            </h2>
            <p className="mt-1 text-sm text-dark-300">
              Transaction independently verified on Stellar Testnet Horizon.
            </p>
            {payment?.transactionHash ? (
              <div className="mt-4 flex flex-col items-center gap-2">
                <a
                  href={getExplorerTxUrl(payment.transactionHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-yellow hover:text-brand-yellowHover underline underline-offset-2"
                >
                  <span>View transaction on Stellar Expert</span>
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              </div>
            ) : null}
            <div className="mt-6">
              <Link
                to={`/receipt/${invoice.id}`}
                className="inline-flex items-center gap-2 rounded-xl bg-brand-yellow px-5 py-2.5 text-xs font-bold text-dark-950 shadow-md transition hover:bg-brand-yellowHover hover:scale-105"
              >
                <span>View Verified Receipt &rarr;</span>
              </Link>
            </div>
          </div>
        ) : isCancelled ? (
          <div className="rounded-2xl border border-dark-800 bg-dark-900 p-6 text-center text-sm text-dark-400">
            This invoice was cancelled and can no longer be paid.
          </div>
        ) : (
          /* PAYMENT CHECKOUT */
          <div className="space-y-5">
            <div className="rounded-2xl border border-dark-750 bg-dark-900 p-6 shadow-xl sm:p-7">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-white">
                    Pay with Stellar Wallet
                  </h2>
                  <p className="mt-0.5 text-xs text-dark-400">
                    Connect your Freighter wallet to review and approve payment in one click.
                  </p>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-yellow/10 text-brand-yellow">
                  <Wallet className="h-5 w-5" />
                </div>
              </div>

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
                  <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-200">
                    <p className="font-bold text-amber-300">Freighter Wallet Not Detected</p>
                    <p className="mt-1 leading-relaxed">
                      To approve this invoice with 1 click, install the{" "}
                      <a
                        href="https://www.freighter.app/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold text-brand-yellow underline hover:text-white"
                      >
                        Freighter Extension
                      </a>
                      . Alternatively, submit manual transaction hash below.
                    </p>
                  </div>
                ) : !walletAddress ? (
                  <button
                    type="button"
                    onClick={handleConnectWallet}
                    disabled={connectingWallet}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-yellow px-5 py-3 text-sm font-bold text-dark-950 shadow-[0_0_20px_-3px_rgba(250,204,21,0.3)] transition hover:bg-brand-yellowHover hover:shadow-yellowGlow active:scale-95 disabled:opacity-60"
                  >
                    {connectingWallet ? (
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <Wallet className="h-4 w-4 fill-dark-950 stroke-[2]" aria-hidden="true" />
                    )}
                    <span>{connectingWallet ? "Connecting Freighter..." : "Connect Freighter Wallet"}</span>
                  </button>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between rounded-xl border border-dark-700 bg-dark-950 px-4 py-2.5 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-brand-yellow animate-pulse" />
                        <span className="font-mono text-dark-200">
                          {shortAddress(walletAddress)}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setWalletAddress(null)}
                        className="text-xs font-semibold text-dark-400 hover:text-white underline"
                      >
                        Disconnect
                      </button>
                    </div>

                    {trustlineSuccess ? (
                      <div className="rounded-xl border border-brand-yellow/30 bg-brand-yellow/10 p-3 text-xs text-brand-yellow">
                        {trustlineSuccess}
                      </div>
                    ) : null}

                    <button
                      type="button"
                      onClick={handlePayWithFreighter}
                      disabled={paymentStep !== "idle" && paymentStep !== "error"}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-yellow px-5 py-3.5 text-sm font-bold text-dark-950 shadow-[0_0_25px_-5px_rgba(250,204,21,0.35)] transition hover:bg-brand-yellowHover hover:shadow-yellowGlow active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {paymentStep === "building" ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin text-dark-950" aria-hidden="true" />
                          <span>Preparing transaction XDR...</span>
                        </>
                      ) : paymentStep === "signing" ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin text-dark-950" aria-hidden="true" />
                          <span>Approve in Freighter popup...</span>
                        </>
                      ) : paymentStep === "submitting" ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin text-dark-950" aria-hidden="true" />
                          <span>Verifying on Stellar Testnet...</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="h-4 w-4 fill-dark-950 stroke-[2]" aria-hidden="true" />
                          <span>Pay {formatAmount(invoice.amount, invoice.assetCode)}</span>
                        </>
                      )}
                    </button>

                    <div className="text-center">
                      <button
                        type="button"
                        onClick={handleEstablishTrustline}
                        disabled={trustlineAdding}
                        className="inline-flex items-center gap-1.5 text-xs text-dark-400 hover:text-brand-yellow transition"
                      >
                        {trustlineAdding ? (
                          <Loader2 className="h-3 w-3 animate-spin text-brand-yellow" aria-hidden="true" />
                        ) : null}
                        <span>
                          {trustlineAdding
                            ? "Approving trustline in wallet..."
                            : "First time paying? Add USDC Trustline to your wallet"}
                        </span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* MANUAL VERIFICATION ACCORDION */}
            <div className="rounded-2xl border border-dark-800 bg-dark-900/80 p-5">
              <button
                type="button"
                onClick={() => setShowManual(!showManual)}
                className="flex w-full items-center justify-between text-left text-xs font-semibold text-dark-400 hover:text-white transition"
              >
                <span>Paid using another wallet or Stellar Laboratory?</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${showManual ? "rotate-180 text-brand-yellow" : ""}`}
                  aria-hidden="true"
                />
              </button>

              {showManual ? (
                <form onSubmit={handleManualVerify} className="mt-4 space-y-3 pt-3 border-t border-dark-800">
                  <p className="text-xs text-dark-400">
                    Paste your 64-character Stellar Testnet transaction hash here. Our
                    backend independently validates the payment against Horizon.
                  </p>

                  {manualError ? <ErrorBox message={manualError} /> : null}

                  <div>
                    <input
                      id="txHash"
                      type="text"
                      spellCheck={false}
                      placeholder="e.g. 5f04a... (64 hex characters)"
                      value={manualTxHash}
                      onChange={(e) => setManualTxHash(e.target.value)}
                      className="block w-full rounded-xl border border-dark-700 bg-dark-950 px-3.5 py-2.5 font-mono text-xs text-white placeholder-dark-500 focus:border-brand-yellow focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={manualSubmitting || !manualTxHash.trim()}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-dark-800 px-4 py-2.5 text-xs font-bold text-white hover:bg-dark-750 transition disabled:opacity-50"
                  >
                    {manualSubmitting ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-brand-yellow" aria-hidden="true" />
                    ) : null}
                    <span>{manualSubmitting ? "Verifying on Testnet..." : "Verify Transaction"}</span>
                  </button>
                </form>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </Shell>
  );
}

