import type { Invoice } from "@payraast/shared";
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  CheckCircle2,
  Coins,
  CreditCard,
  ExternalLink,
  Info,
  Loader2,
  Printer,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import CopyButton from "../components/CopyButton";
import ErrorBox from "../components/ErrorBox";
import Spinner from "../components/Spinner";
import { ApiRequestError, getInvoice } from "../lib/api";
import { formatAmount } from "../lib/format";

// Live standard exchange rate (USDC to PKR)
const PKR_RATE = 278.25;

type PayoutChannel = "raast" | "jazzcash" | "easypaisa" | "bank";

const PAKISTANI_BANKS = [
  "Meezan Bank",
  "Habib Bank Limited (HBL)",
  "Bank Alfalah",
  "United Bank Limited (UBL)",
  "MCB Bank",
  "Standard Chartered Pakistan",
  "Faysal Bank",
  "Nayapay",
  "Sadapay",
  "Allied Bank Limited",
  "Askari Bank",
];

export default function Cashout() {
  const { id = "" } = useParams();
  const navigate = useNavigate();

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [channel, setChannel] = useState<PayoutChannel>("raast");
  const [selectedBank, setSelectedBank] = useState("Meezan Bank");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountTitle, setAccountTitle] = useState("");
  const [verifyingTitle, setVerifyingTitle] = useState(false);

  // Simulation execution state
  const [step, setStep] = useState<"form" | "settling" | "receipt">("form");
  const [settlementStepIndex, setSettlementStepIndex] = useState(0);
  const [referenceNumber, setReferenceNumber] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const inv = await getInvoice(id);
      setInvoice(inv);
      if (inv.status !== "paid") {
        setError("Only paid invoices can be cashed out to local currency.");
      }
    } catch (err) {
      setError(
        err instanceof ApiRequestError
          ? err.message
          : "Could not load invoice details."
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  // Simulate title fetch when user types account number
  useEffect(() => {
    if (accountNumber.trim().length >= 10 && !accountTitle) {
      setVerifyingTitle(true);
      const timer = setTimeout(() => {
        setAccountTitle("Hakeem Ullah");
        setVerifyingTitle(false);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [accountNumber, accountTitle]);

  if (loading) {
    return (
      <div className="py-16">
        <Spinner label="Loading cashout details" />
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="mx-auto max-w-xl py-12">
        <ErrorBox message={error ?? "Invoice not found"} />
        <div className="mt-4 text-center">
          <Link
            to="/invoices"
            className="text-xs font-bold text-brand-yellow underline"
          >
            Back to invoices
          </Link>
        </div>
      </div>
    );
  }

  const usdcAmount = Number(invoice.amount) || 0;
  const grossPkr = Math.round(usdcAmount * PKR_RATE * 100) / 100;
  const netPkr = grossPkr; // 0% hackathon promo fee

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!accountNumber.trim()) return;

    setStep("settling");
    setSettlementStepIndex(0);

    const ref = `RST-PK-${Math.floor(100000000 + Math.random() * 900000000)}`;
    setReferenceNumber(ref);

    setTimeout(() => setSettlementStepIndex(1), 1200);
    setTimeout(() => setSettlementStepIndex(2), 2600);
    setTimeout(() => {
      setSettlementStepIndex(3);
      setStep("receipt");
    }, 4000);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        to={`/invoices/${invoice.id}`}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-dark-400 hover:text-brand-yellow transition print:hidden"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        <span>Back to invoice</span>
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
            Cash Out to PKR
          </h1>
          <p className="mt-1 text-sm text-dark-400">
            Convert your Stellar USDC into Pakistani Rupees via SBP Raast.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-yellow/30 bg-brand-yellow/10 px-3 py-1 text-xs font-semibold text-brand-yellow">
          <Zap className="h-3.5 w-3.5 fill-brand-yellow" aria-hidden="true" />
          <span>Instant Raast Rail</span>
        </span>
      </div>

      {/* DEMO NOTICE BANNER */}
      <div className="rounded-2xl border border-dark-750 bg-dark-900/90 p-4 text-xs">
        <div className="flex items-start gap-3">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand-yellow" aria-hidden="true" />
          <div className="flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-bold text-white">
                Stellar SEP-24 Anchor Architecture
              </p>
              <Link
                to="/sep24"
                className="inline-flex items-center gap-1 rounded-lg border border-brand-yellow/30 bg-brand-yellow/10 px-2.5 py-1 font-bold text-brand-yellow hover:bg-brand-yellow/20"
              >
                <span>Launch Interactive SEP-24 Portal</span>
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
            <p className="mt-1 text-dark-300 leading-relaxed">
              In production, PayRaast interfaces with an authorized Pakistani Stellar Anchor
              (licensed EMI / bank) using <strong>SEP-24 (Hosted Deposit & Withdrawal)</strong> to
              liquidate USDC and dispatch instant PKR payouts via the State Bank of Pakistan's (SBP)
              <strong>Raast</strong> network. You can test the instant Raast simulation below or open the live SEP-24 interactive demo.
            </p>
          </div>
        </div>
      </div>

      {step === "form" ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* CONVERSION CARD */}
          <div className="rounded-2xl border border-dark-750 bg-dark-900 p-6 shadow-xl sm:p-7">
            <h2 className="text-xs font-bold uppercase tracking-wider text-brand-yellow">
              Exchange Quote
            </h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-dark-700 bg-dark-950 p-4">
                <p className="text-xs font-medium text-dark-400">You withdraw</p>
                <p className="mt-1 text-2xl font-black font-mono tracking-tight text-white">
                  {formatAmount(invoice.amount, invoice.assetCode)}
                </p>
                <p className="mt-1 text-xs text-dark-400 truncate">
                  Invoice: {invoice.projectTitle}
                </p>
              </div>

              <div className="rounded-xl border border-brand-yellow/30 bg-brand-yellow/10 p-4 shadow-[0_0_20px_-5px_rgba(250,204,21,0.15)]">
                <p className="text-xs font-semibold text-brand-yellow">You receive in PKR</p>
                <p className="mt-1 text-2xl font-black font-mono tracking-tight text-brand-yellow">
                  PKR {netPkr.toLocaleString("en-PK", { minimumFractionDigits: 2 })}
                </p>
                <p className="mt-1 text-xs text-dark-300">
                  Rate: 1 USDC ≈ {PKR_RATE.toFixed(2)} PKR
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-dark-800 pt-3 text-xs text-dark-400">
              <span>Stellar Gas Fee: <strong className="text-white">&lt; 0.001 PKR</strong></span>
              <span>Anchor Processing: <strong className="text-brand-yellow">0% (Hackathon Promo)</strong></span>
              <span>Settlement Speed: <strong className="text-brand-yellow">Instant (&lt; 5s)</strong></span>
            </div>
          </div>

          {/* CHANNEL SELECTOR */}
          <div className="rounded-2xl border border-dark-750 bg-dark-900 p-6 shadow-xl sm:p-7">
            <h2 className="text-xs font-bold uppercase tracking-wider text-brand-yellow">
              Select Payout Method
            </h2>

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <button
                type="button"
                onClick={() => setChannel("raast")}
                className={`flex flex-col items-center justify-center rounded-xl border p-3.5 text-center transition ${
                  channel === "raast"
                    ? "border-brand-yellow bg-brand-yellow/15 text-white ring-1 ring-brand-yellow"
                    : "border-dark-700 bg-dark-950 text-dark-300 hover:border-dark-600 hover:text-white"
                }`}
              >
                <Zap className="h-5 w-5 text-brand-yellow fill-brand-yellow" aria-hidden="true" />
                <span className="mt-1.5 text-xs font-bold">Raast ID</span>
                <span className="text-[10px] text-dark-400">Mobile or IBAN</span>
              </button>

              <button
                type="button"
                onClick={() => setChannel("jazzcash")}
                className={`flex flex-col items-center justify-center rounded-xl border p-3.5 text-center transition ${
                  channel === "jazzcash"
                    ? "border-brand-yellow bg-brand-yellow/15 text-white ring-1 ring-brand-yellow"
                    : "border-dark-700 bg-dark-950 text-dark-300 hover:border-dark-600 hover:text-white"
                }`}
              >
                <Smartphone className="h-5 w-5 text-brand-yellow" aria-hidden="true" />
                <span className="mt-1.5 text-xs font-bold">JazzCash</span>
                <span className="text-[10px] text-dark-400">Mobile Wallet</span>
              </button>

              <button
                type="button"
                onClick={() => setChannel("easypaisa")}
                className={`flex flex-col items-center justify-center rounded-xl border p-3.5 text-center transition ${
                  channel === "easypaisa"
                    ? "border-brand-yellow bg-brand-yellow/15 text-white ring-1 ring-brand-yellow"
                    : "border-dark-700 bg-dark-950 text-dark-300 hover:border-dark-600 hover:text-white"
                }`}
              >
                <CreditCard className="h-5 w-5 text-brand-yellow" aria-hidden="true" />
                <span className="mt-1.5 text-xs font-bold">EasyPaisa</span>
                <span className="text-[10px] text-dark-400">Mobile Wallet</span>
              </button>

              <button
                type="button"
                onClick={() => setChannel("bank")}
                className={`flex flex-col items-center justify-center rounded-xl border p-3.5 text-center transition ${
                  channel === "bank"
                    ? "border-brand-yellow bg-brand-yellow/15 text-white ring-1 ring-brand-yellow"
                    : "border-dark-700 bg-dark-950 text-dark-300 hover:border-dark-600 hover:text-white"
                }`}
              >
                <Building2 className="h-5 w-5 text-brand-yellow" aria-hidden="true" />
                <span className="mt-1.5 text-xs font-bold">Bank Account</span>
                <span className="text-[10px] text-dark-400">Any PK Bank</span>
              </button>
            </div>

            {/* CHANNEL FORM FIELDS */}
            <div className="mt-5 space-y-4">
              {channel === "bank" ? (
                <div>
                  <label htmlFor="bankSelect" className="block text-xs font-semibold uppercase tracking-wider text-dark-300">
                    Select Bank
                  </label>
                  <select
                    id="bankSelect"
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    className="mt-1 block w-full rounded-xl border border-dark-700 bg-dark-950 px-3.5 py-2.5 text-sm text-white focus:border-brand-yellow focus:outline-none"
                  >
                    {PAKISTANI_BANKS.map((b) => (
                      <option key={b} value={b} className="bg-dark-900 text-white">
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}

              <div>
                <label htmlFor="accountNumber" className="block text-xs font-semibold uppercase tracking-wider text-dark-300">
                  {channel === "raast"
                    ? "Raast ID (Registered Mobile Number or IBAN)"
                    : channel === "jazzcash"
                    ? "JazzCash Mobile Number"
                    : channel === "easypaisa"
                    ? "EasyPaisa Mobile Number"
                    : "Account Number or IBAN"}
                </label>
                <input
                  id="accountNumber"
                  type="text"
                  required
                  placeholder={
                    channel === "bank"
                      ? "PK36MEZN0001234567890123"
                      : "03001234567"
                  }
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="mt-1 block w-full rounded-xl border border-dark-700 bg-dark-950 px-3.5 py-2.5 font-mono text-sm text-white placeholder-dark-500 focus:border-brand-yellow focus:outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="accountTitle" className="block text-xs font-semibold uppercase tracking-wider text-dark-300">
                    Account Title (Beneficiary Name)
                  </label>
                  {verifyingTitle ? (
                    <span className="inline-flex items-center gap-1 text-[11px] text-brand-yellow">
                      <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
                      Fetching verified title from 1Link / Raast...
                    </span>
                  ) : null}
                </div>
                <input
                  id="accountTitle"
                  type="text"
                  required
                  placeholder="e.g. Hakeem Ullah"
                  value={accountTitle}
                  onChange={(e) => setAccountTitle(e.target.value)}
                  className="mt-1 block w-full rounded-xl border border-dark-700 bg-dark-950 px-3.5 py-2.5 text-sm text-white placeholder-dark-500 focus:border-brand-yellow focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <Link
              to={`/invoices/${invoice.id}`}
              className="text-xs font-semibold text-dark-400 hover:text-white transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={!accountNumber.trim()}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-yellow px-6 py-2.5 text-xs font-bold text-dark-950 shadow-[0_0_20px_-3px_rgba(250,204,21,0.3)] transition hover:bg-brand-yellowHover hover:shadow-yellowGlow disabled:opacity-50"
            >
              <Zap className="h-4 w-4 fill-dark-950 stroke-[2]" aria-hidden="true" />
              <span>Transfer PKR {netPkr.toLocaleString("en-PK", { minimumFractionDigits: 2 })}</span>
            </button>
          </div>
        </form>
      ) : step === "settling" ? (
        /* SETTLEMENT ANIMATION */
        <div className="rounded-2xl border border-dark-750 bg-dark-900 p-8 shadow-2xl text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-yellow/15 text-brand-yellow border border-brand-yellow/30">
            <Loader2 className="h-7 w-7 animate-spin text-brand-yellow" aria-hidden="true" />
          </div>

          <h2 className="mt-4 text-xl font-black text-white">
            Processing Instant Payout
          </h2>
          <p className="mt-1 text-xs text-dark-400">
            Dispatched via Stellar Anchor SEP-24 & SBP Raast Engine
          </p>

          <div className="mx-auto mt-8 max-w-md space-y-4 text-left">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-xl text-xs font-bold ${
                  settlementStepIndex >= 1
                    ? "bg-brand-yellow text-dark-950"
                    : "bg-dark-800 text-dark-400"
                }`}
              >
                {settlementStepIndex >= 1 ? "✓" : "1"}
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-white">
                  Stellar Anchor SEP-24 Escrow
                </p>
                <p className="text-[11px] text-dark-400">
                  {settlementStepIndex >= 1
                    ? "USDC transferred to Anchor liquidity pool on Stellar"
                    : "Locking USDC in anchor bridge..."}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-xl text-xs font-bold ${
                  settlementStepIndex >= 2
                    ? "bg-brand-yellow text-dark-950"
                    : "bg-dark-800 text-dark-400"
                }`}
              >
                {settlementStepIndex >= 2 ? "✓" : "2"}
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-white">
                  FX Conversion (USDC → PKR)
                </p>
                <p className="text-[11px] text-dark-400">
                  {settlementStepIndex >= 2
                    ? `Settled at guaranteed rate: 1 USDC = ${PKR_RATE.toFixed(2)} PKR`
                    : "Matching orderbook liquidity..."}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-xl text-xs font-bold ${
                  settlementStepIndex >= 3
                    ? "bg-brand-yellow text-dark-950"
                    : "bg-dark-800 text-dark-400"
                }`}
              >
                {settlementStepIndex >= 3 ? "✓" : "3"}
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-white">
                  State Bank of Pakistan (SBP) Raast Rail
                </p>
                <p className="text-[11px] text-dark-400">
                  {settlementStepIndex >= 3
                    ? `Dispatched to ${accountTitle} (${channel.toUpperCase()})`
                    : "Routing through SBP 1Link / Raast switch..."}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* OFFICIAL SETTLEMENT RECEIPT */
        <div className="rounded-2xl border border-dark-750 bg-dark-900 p-6 shadow-2xl sm:p-8">
          <div className="flex flex-col items-center border-b border-dark-800 pb-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-yellow/15 text-brand-yellow border border-brand-yellow/30 shadow-[0_0_25px_-5px_rgba(250,204,21,0.25)]">
              <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
            </div>
            <h2 className="mt-3 text-2xl font-black text-white">
              Payout Dispatched!
            </h2>
            <p className="mt-1 text-xs text-dark-400">
              Funds credited to your Pakistani account via SBP Raast
            </p>
            <div className="mt-3 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full border border-brand-yellow/30 bg-brand-yellow/10 px-2.5 py-0.5 text-xs font-mono text-brand-yellow">
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                Raast Settled
              </span>
              <span className="text-xs text-dark-400">
                {new Date().toLocaleTimeString("en-PK")}
              </span>
            </div>
          </div>

          <div className="border-b border-dark-800 py-6 text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-dark-400">
              Total Amount Credited
            </p>
            <p className="mt-1 text-3xl font-black font-mono tracking-tight text-brand-yellow">
              PKR {netPkr.toLocaleString("en-PK", { minimumFractionDigits: 2 })}
            </p>
            <p className="mt-1 text-xs text-dark-400 font-mono">
              Liquidated from {invoice.amount} USDC on Stellar Testnet
            </p>
          </div>

          <dl className="divide-y divide-dark-800 text-sm">
            <div className="flex justify-between py-3">
              <dt className="text-xs uppercase font-semibold text-dark-400">Raast Reference</dt>
              <dd className="flex items-center gap-1.5 font-mono text-xs font-bold text-white">
                <span>{referenceNumber}</span>
                <CopyButton value={referenceNumber} label="Copy Raast reference" />
              </dd>
            </div>
            <div className="flex justify-between py-3">
              <dt className="text-xs uppercase font-semibold text-dark-400">Payout Channel</dt>
              <dd className="font-medium text-white capitalize">
                {channel === "bank" ? selectedBank : channel}
              </dd>
            </div>
            <div className="flex justify-between py-3">
              <dt className="text-xs uppercase font-semibold text-dark-400">Beneficiary Name</dt>
              <dd className="font-medium text-white">{accountTitle}</dd>
            </div>
            <div className="flex justify-between py-3">
              <dt className="text-xs uppercase font-semibold text-dark-400">Destination Account</dt>
              <dd className="font-mono text-xs text-brand-yellow">
                {accountNumber.slice(0, 4)}****{accountNumber.slice(-4)}
              </dd>
            </div>
            <div className="flex justify-between py-3">
              <dt className="text-xs uppercase font-semibold text-dark-400">Conversion Rate</dt>
              <dd className="font-mono text-xs font-medium text-white">
                1 USDC = {PKR_RATE.toFixed(2)} PKR
              </dd>
            </div>
          </dl>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-dark-800 pt-5 print:hidden">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 rounded-xl border border-dark-700 bg-dark-850 px-3 py-1.5 text-xs font-semibold text-dark-200 hover:text-white"
            >
              <Printer className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Print Payout Advice</span>
            </button>

            <Link
              to="/invoices"
              className="rounded-xl bg-brand-yellow px-4 py-2 text-xs font-bold text-dark-950 transition hover:bg-brand-yellowHover"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

