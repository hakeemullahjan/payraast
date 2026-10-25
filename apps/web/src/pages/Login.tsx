import { KeyRound, Loader2, Lock, ShieldCheck, UserCheck, Wallet, Zap } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ErrorBox from "../components/ErrorBox";
import { getSession, loginWithPincode, loginWithWallet } from "../lib/auth";
import { shortAddress } from "../lib/format";
import { isConnected, requestAccess } from "@stellar/freighter-api";

export default function Login() {
  const navigate = useNavigate();
  const existingSession = getSession();

  const [pincode, setPincode] = useState("");
  const [loading, setLoading] = useState(false);
  const [connectingWallet, setConnectingWallet] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (pincode.length !== 6 || !/^\d{6}$/.test(pincode)) {
      setError("Please enter your 6-digit PIN.");
      return;
    }

    setLoading(true);
    try {
      loginWithPincode(pincode);
      navigate("/invoices");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Incorrect PIN code.");
    } finally {
      setLoading(false);
    }
  }

  async function handleWalletLogin() {
    setError(null);
    setConnectingWallet(true);
    try {
      const connected = await isConnected();
      const hasWallet = typeof connected === "boolean" ? connected : connected?.isConnected;
      if (!hasWallet) {
        throw new Error("Freighter wallet extension is not installed.");
      }
      const accessObj = await requestAccess();
      const address =
        typeof accessObj === "string" ? accessObj : (accessObj as { address?: string })?.address;
      if (!address) {
        throw new Error("Could not retrieve account address from Freighter.");
      }
      loginWithWallet(address, "Freighter User");
      navigate("/invoices");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wallet login failed.");
    } finally {
      setConnectingWallet(false);
    }
  }

  return (
    <div className="mx-auto max-w-md py-10">
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-yellow text-dark-950 shadow-[0_0_20px_rgba(250,204,21,0.35)]">
          <KeyRound className="h-6 w-6 stroke-[2.5]" />
        </div>
        <h1 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">
          Welcome Back
        </h1>
        <p className="mt-2 text-sm text-dark-300">
          Enter your 6-digit PIN to decrypt your Stellar keypair or connect your Freighter wallet.
        </p>
      </div>

      <div className="mt-8 rounded-2xl border border-dark-750 bg-dark-900 p-6 shadow-2xl sm:p-8">
        {error ? <div className="mb-5"><ErrorBox message={error} /></div> : null}

        {existingSession?.publicKey ? (
          <div className="mb-5 rounded-xl border border-brand-yellow/30 bg-brand-yellow/10 p-3.5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-dark-400">
              Registered Public Key
            </p>
            <p className="mt-1 font-mono text-xs font-bold text-brand-yellow">
              {shortAddress(existingSession.publicKey)}
            </p>
            {existingSession.name ? (
              <p className="text-xs text-dark-300 mt-0.5">Account: {existingSession.name}</p>
            ) : null}
          </div>
        ) : null}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label htmlFor="loginPin" className="block text-xs font-bold uppercase tracking-wider text-dark-300">
              Enter 6-Digit PIN
            </label>
            <input
              id="loginPin"
              type="password"
              inputMode="numeric"
              maxLength={6}
              required
              placeholder="••••••"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              className="mt-1.5 block w-full rounded-xl border border-dark-700 bg-dark-950 px-3.5 py-3 font-mono text-center tracking-[0.4em] text-2xl font-bold text-brand-yellow placeholder-dark-600 focus:border-brand-yellow focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-brand-yellow px-5 py-3 text-sm font-bold text-dark-950 shadow-[0_0_20px_-3px_rgba(250,204,21,0.3)] transition hover:bg-brand-yellowHover hover:shadow-yellowGlow active:scale-95 disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin text-dark-950" /> : <Lock className="h-4 w-4" />}
            <span>{loading ? "Decrypting..." : "Unlock Dashboard"}</span>
          </button>

          <div className="relative my-4 flex items-center justify-center border-t border-dark-800 pt-4">
            <span className="bg-dark-900 px-3 text-xs font-semibold uppercase tracking-wider text-dark-400">
              Or
            </span>
          </div>

          <button
            type="button"
            onClick={handleWalletLogin}
            disabled={connectingWallet}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-dark-700 bg-dark-850 px-4 py-2.5 text-xs font-bold text-white transition hover:border-brand-yellow/40 hover:text-brand-yellow"
          >
            {connectingWallet ? (
              <Loader2 className="h-4 w-4 animate-spin text-brand-yellow" />
            ) : (
              <Wallet className="h-4 w-4 text-brand-yellow" />
            )}
            <span>Login with Freighter Wallet</span>
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-dark-400">
          Need a new account?{" "}
          <Link to="/signup" className="font-bold text-brand-yellow hover:underline">
            Generate Stellar Keypair here
          </Link>
        </p>
      </div>
    </div>
  );
}
