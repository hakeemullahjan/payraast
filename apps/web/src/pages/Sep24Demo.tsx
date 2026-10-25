import {
  ArrowDownLeft,
  ArrowUpRight,
  Building2,
  CheckCircle2,
  ExternalLink,
  Info,
  Layers,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import CopyButton from "../components/CopyButton";
import ErrorBox from "../components/ErrorBox";
import { getSession } from "../lib/auth";
import {
  DEFAULT_ANCHOR_DOMAIN,
  getSep24Info,
  initiateSep24Transfer,
  type Sep24Info,
  type Sep24Transaction,
} from "../lib/sep24";

export default function Sep24Demo() {
  const session = getSession();
  const [anchorDomain, setAnchorDomain] = useState(DEFAULT_ANCHOR_DOMAIN);
  const [sep24Info, setSep24Info] = useState<Sep24Info | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active Transfer Execution
  const [transferType, setTransferType] = useState<"deposit" | "withdraw">("withdraw");
  const [initiating, setInitiating] = useState(false);
  const [activeUrl, setActiveUrl] = useState<string | null>(null);
  const [activeTxId, setActiveTxId] = useState<string | null>(null);

  // Transfer history records (stored locally like basic-payment-app)
  const [history, setHistory] = useState<Sep24Transaction[]>(() => {
    try {
      const raw = localStorage.getItem("payraast:sep24_history");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  async function loadAnchorInfo() {
    setLoading(true);
    setError(null);
    try {
      const info = await getSep24Info(anchorDomain);
      setSep24Info(info);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load SEP-24 anchor info.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAnchorInfo();
  }, [anchorDomain]);

  async function handleStartTransfer(endpoint: "deposit" | "withdraw") {
    setTransferType(endpoint);
    setInitiating(true);
    setError(null);

    const account =
      session?.publicKey || "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5";

    try {
      const res = await initiateSep24Transfer({
        endpoint,
        assetCode: "USDC",
        account,
        domain: anchorDomain,
      });

      setActiveUrl(res.url);
      setActiveTxId(res.id);

      // Save to local history
      const newTx: Sep24Transaction = {
        id: res.id,
        kind: endpoint === "deposit" ? "deposit" : "withdrawal",
        status: "incomplete",
        amount_in: "150.00",
        amount_out: endpoint === "withdraw" ? "PKR 41,737.50" : "150.00 USDC",
        started_at: new Date().toISOString(),
        more_info_url: res.url,
      };

      const updated = [newTx, ...history];
      setHistory(updated);
      localStorage.setItem("payraast:sep24_history", JSON.stringify(updated));

      // Open interactive anchor popup window (per SEP-24 standard)
      window.open(res.url, "sep24_interactive", "width=520,height=680,scrollbars=yes");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to initiate transfer.");
    } finally {
      setInitiating(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
              Stellar SEP-24 Anchor Demo
            </h1>
            <span className="rounded-full border border-brand-yellow/30 bg-brand-yellow/10 px-2 py-0.5 text-[10px] font-bold text-brand-yellow">
              TESTNET
            </span>
          </div>
          <p className="mt-1 text-sm text-dark-400">
            Interactive deposit & withdrawal protocol powering PayRaast's off-ramp infrastructure.
          </p>
        </div>

        <button
          type="button"
          onClick={loadAnchorInfo}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-xl border border-dark-700 bg-dark-850 px-3.5 py-2 text-xs font-semibold text-dark-200 hover:text-white"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-brand-yellow" : ""}`} />
          <span>Refresh Anchor Info</span>
        </button>
      </div>

      {/* Educational Brief */}
      <div className="rounded-2xl border border-dark-750 bg-dark-900 p-5 shadow-xl sm:p-6">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 shrink-0 text-brand-yellow mt-0.5" />
          <div className="space-y-1 text-xs text-dark-300">
            <p className="font-bold text-white text-sm">
              How SEP-24 (Hosted Deposit & Withdrawal) Works in PayRaast
            </p>
            <p className="leading-relaxed">
              Stellar Ecosystem Proposal 24 defines the standard interactive protocol for wallets and fintechs to interface with regulated financial anchors (banks & EMIs). The user initiates the transfer within PayRaast, which queries the anchor's <code>stellar.toml</code>, gets authentication tokens, and opens the anchor's verified hosted window to gather KYC and dispatch local currency.
            </p>
          </div>
        </div>
      </div>

      {error ? <ErrorBox message={error} /> : null}

      {/* Anchor Settings & Transfer Actions */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: Action Triggers */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-dark-750 bg-dark-900 p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-dark-800 pb-4">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                  Anchor Actions (USDC on Testnet)
                </h2>
                <p className="mt-0.5 text-xs text-dark-400">
                  Target Domain: <code className="text-brand-yellow font-mono">{anchorDomain}</code>
                </p>
              </div>
              <span className="rounded-lg border border-dark-700 bg-dark-800 px-2.5 py-1 text-xs font-mono text-brand-yellow">
                SEP-24
              </span>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Withdraw Button */}
              <div className="rounded-xl border border-brand-yellow/30 bg-gradient-to-b from-dark-850 to-dark-900 p-5">
                <div className="flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-yellow/15 text-brand-yellow">
                    <ArrowUpRight className="h-5 w-5" />
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-yellow">
                    Off-Ramp
                  </span>
                </div>
                <h3 className="mt-3 text-base font-bold text-white">
                  Interactive Withdrawal (Off-ramp)
                </h3>
                <p className="mt-1 text-xs text-dark-400">
                  Withdraw USDC to Pakistani bank accounts or Raast ID via anchor portal.
                </p>
                <button
                  type="button"
                  onClick={() => handleStartTransfer("withdraw")}
                  disabled={initiating}
                  className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-brand-yellow px-4 py-2.5 text-xs font-bold text-dark-950 transition hover:bg-brand-yellowHover active:scale-95 disabled:opacity-50"
                >
                  {initiating && transferType === "withdraw" ? (
                    <Loader2 className="h-4 w-4 animate-spin text-dark-950" />
                  ) : (
                    <Zap className="h-4 w-4 fill-dark-950" />
                  )}
                  <span>Launch SEP-24 Withdrawal</span>
                </button>
              </div>

              {/* Deposit Button */}
              <div className="rounded-xl border border-dark-700 bg-dark-850 p-5">
                <div className="flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-dark-800 text-dark-300">
                    <ArrowDownLeft className="h-5 w-5 text-brand-yellow" />
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-dark-400">
                    On-Ramp
                  </span>
                </div>
                <h3 className="mt-3 text-base font-bold text-white">
                  Interactive Deposit (On-ramp)
                </h3>
                <p className="mt-1 text-xs text-dark-400">
                  Fund Stellar wallet with Testnet USDC using simulated debit/bank rails.
                </p>
                <button
                  type="button"
                  onClick={() => handleStartTransfer("deposit")}
                  disabled={initiating}
                  className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-xl border border-dark-700 bg-dark-800 px-4 py-2.5 text-xs font-bold text-white transition hover:border-brand-yellow/40 hover:text-brand-yellow active:scale-95 disabled:opacity-50"
                >
                  {initiating && transferType === "deposit" ? (
                    <Loader2 className="h-4 w-4 animate-spin text-brand-yellow" />
                  ) : (
                    <Building2 className="h-4 w-4" />
                  )}
                  <span>Launch SEP-24 Deposit</span>
                </button>
              </div>
            </div>

            {/* Active Transfer Notice */}
            {activeUrl ? (
              <div className="mt-6 rounded-xl border border-brand-yellow/40 bg-brand-yellow/10 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-white">
                    Interactive Anchor Session Active
                  </p>
                  <span className="font-mono text-[10px] text-brand-yellow">
                    ID: {activeTxId}
                  </span>
                </div>
                <p className="mt-1 text-xs text-dark-300">
                  The Anchor interface was opened in a popup window. If blocked by your browser, open it directly:
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <a
                    href={activeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-brand-yellow px-3 py-1.5 text-xs font-bold text-dark-950 hover:bg-brand-yellowHover"
                  >
                    <span>Open Anchor Web View</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                  <CopyButton value={activeUrl} label="Copy session URL" />
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Right Col: Anchor Specifications */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-dark-750 bg-dark-900 p-6 shadow-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-yellow">
              Anchor Capabilities
            </h3>
            <div className="mt-4 space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-dark-800">
                <span className="text-dark-400">Anchor Domain</span>
                <span className="font-mono font-semibold text-white">{anchorDomain}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-dark-800">
                <span className="text-dark-400">Supported Asset</span>
                <span className="font-semibold text-brand-yellow">USDC (Circle)</span>
              </div>
              <div className="flex justify-between py-2 border-b border-dark-800">
                <span className="text-dark-400">SEP-24 Endpoint</span>
                <span className="font-mono text-dark-200">/transactions/withdraw/interactive</span>
              </div>
              <div className="flex justify-between py-2 border-b border-dark-800">
                <span className="text-dark-400">Network</span>
                <span className="text-white font-medium">Stellar Testnet</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-dark-400">Auth Standard</span>
                <span className="text-white font-medium">SEP-10 WebAuth (JWT)</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-dark-800">
              <Link
                to="/invoices"
                className="block text-center text-xs font-bold text-brand-yellow hover:underline"
              >
                &larr; Return to Invoicing Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Transfer History Table */}
      <div className="rounded-2xl border border-dark-750 bg-dark-900 p-6 shadow-xl">
        <h3 className="text-sm font-bold uppercase tracking-wider text-white">
          SEP-24 Transfer Records
        </h3>
        <p className="mt-1 text-xs text-dark-400">
          History of interactive anchor transactions initiated from this browser.
        </p>

        {history.length === 0 ? (
          <div className="mt-6 rounded-xl border border-dashed border-dark-700 py-10 text-center">
            <p className="text-xs text-dark-400">No transfers recorded yet. Launch a withdrawal or deposit above.</p>
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-dark-800 text-dark-400 uppercase tracking-wider text-[11px]">
                  <th className="py-2.5 font-semibold">Direction</th>
                  <th className="py-2.5 font-semibold">Asset / Amount</th>
                  <th className="py-2.5 font-semibold">Status</th>
                  <th className="py-2.5 font-semibold">Protocol</th>
                  <th className="py-2.5 font-semibold">Date</th>
                  <th className="py-2.5 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-800">
                {history.map((tx) => (
                  <tr key={tx.id} className="hover:bg-dark-850/50">
                    <td className="py-3 font-bold text-white capitalize">{tx.kind}</td>
                    <td className="py-3 font-mono font-medium text-brand-yellow">
                      {tx.amount_in} USDC
                    </td>
                    <td className="py-3">
                      <span className="inline-flex items-center gap-1 rounded-full border border-brand-yellow/30 bg-brand-yellow/10 px-2 py-0.5 text-[10px] font-mono text-brand-yellow">
                        <CheckCircle2 className="h-3 w-3" />
                        {tx.status}
                      </span>
                    </td>
                    <td className="py-3 font-mono text-dark-400">SEP-24</td>
                    <td className="py-3 text-dark-400">{new Date(tx.started_at || "").toLocaleTimeString()}</td>
                    <td className="py-3 text-right">
                      {tx.more_info_url ? (
                        <a
                          href={tx.more_info_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-brand-yellow hover:underline"
                        >
                          <span>Session</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
