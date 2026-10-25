import { Eye, EyeOff, Key, Loader2, RefreshCw, ShieldCheck, Sparkles, UserCheck, Wallet, Zap } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import CopyButton from "../components/CopyButton";
import ErrorBox from "../components/ErrorBox";
import { generateNewKeypair, loginWithWallet, registerWithPincode } from "../lib/auth";
import { shortAddress } from "../lib/format";
import { isConnected, requestAccess } from "@stellar/freighter-api";

export default function Signup() {
  const navigate = useNavigate();

  // Generated Keypair
  const [keypair, setKeypair] = useState(() => generateNewKeypair());
  const [showSecret, setShowSecret] = useState(false);

  // Form Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pincode, setPincode] = useState("");
  const [confirmPincode, setConfirmPincode] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Wallet alternative
  const [connectingWallet, setConnectingWallet] = useState(false);

  function handleRegenerateKeypair() {
    setKeypair(generateNewKeypair());
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (pincode.length !== 6 || !/^\d{6}$/.test(pincode)) {
      setError("Please provide a valid 6-digit numeric PIN.");
      return;
    }

    if (pincode !== confirmPincode) {
      setError("PIN confirmation does not match.");
      return;
    }

    setLoading(true);
    try {
      await registerWithPincode({
        publicKey: keypair.publicKey,
        secretKey: keypair.secretKey,
        pincode,
        name: name.trim() || undefined,
        email: email.trim() || undefined,
      });

      navigate("/invoices");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to register account.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSignupWithWallet() {
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
        throw new Error("Failed to retrieve public address from Freighter.");
      }
      loginWithWallet(address, name.trim() || "Freighter User");
      navigate("/invoices");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wallet signup failed.");
    } finally {
      setConnectingWallet(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl py-6">
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-yellow text-dark-950 shadow-[0_0_20px_rgba(250,204,21,0.35)]">
          <Zap className="h-6 w-6 fill-dark-950 stroke-[2.5]" />
        </div>
        <h1 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">
          Create Your Account
        </h1>
        <p className="mt-2 text-sm text-dark-300">
          Non-custodial account creation based on Stellar standards. Your secret key is encrypted in your browser with a 6-digit PIN and never sent to a server.
        </p>
      </div>

      <div className="mt-8 rounded-2xl border border-dark-750 bg-dark-900 p-6 shadow-2xl sm:p-8">
        {error ? <div className="mb-5"><ErrorBox message={error} /></div> : null}

        <form onSubmit={handleSignup} className="space-y-5">
          {/* Public Key Display */}
          <div>
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-dark-300">
                Your Stellar Address (Testnet)
              </label>
              <button
                type="button"
                onClick={handleRegenerateKeypair}
                className="inline-flex items-center gap-1 text-xs font-semibold text-brand-yellow hover:underline"
              >
                <RefreshCw className="h-3 w-3" />
                <span>Generate New</span>
              </button>
            </div>
            <div className="mt-1.5 flex items-center gap-2">
              <code className="min-w-0 flex-1 truncate rounded-xl border border-dark-700 bg-dark-950 px-3.5 py-2 font-mono text-xs text-brand-yellow">
                {keypair.publicKey}
              </code>
              <CopyButton value={keypair.publicKey} label="Copy address" />
            </div>
            <p className="mt-1 text-[11px] text-dark-400">
              Auto-funded with 10,000 Testnet XLM via Friendbot upon registration.
            </p>
          </div>

          {/* Show/Hide Secret Key */}
          <div className="rounded-xl border border-dark-750 bg-dark-950/60 p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-dark-300">Secret Key Preview</span>
              <button
                type="button"
                onClick={() => setShowSecret(!showSecret)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-brand-yellow hover:text-white"
              >
                {showSecret ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                <span>{showSecret ? "Hide" : "Show"}</span>
              </button>
            </div>
            {showSecret ? (
              <div className="mt-2">
                <code className="block break-all rounded-lg bg-dark-900 p-2 font-mono text-xs text-red-300 border border-dark-800">
                  {keypair.secretKey}
                </code>
                <p className="mt-1 text-[10px] text-red-400">
                  Warning: Never share your secret key. It will be encrypted by your PIN.
                </p>
              </div>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="block text-xs font-bold uppercase tracking-wider text-dark-300">
                Your Name
              </label>
              <input
                id="name"
                type="text"
                placeholder="e.g. Hakeem"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1.5 block w-full rounded-xl border border-dark-700 bg-dark-950 px-3.5 py-2.5 text-sm text-white placeholder-dark-500 focus:border-brand-yellow focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-dark-300">
                Email (Optional)
              </label>
              <input
                id="email"
                type="email"
                placeholder="hakeem@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 block w-full rounded-xl border border-dark-700 bg-dark-950 px-3.5 py-2.5 text-sm text-white placeholder-dark-500 focus:border-brand-yellow focus:outline-none"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="pincode" className="block text-xs font-bold uppercase tracking-wider text-dark-300">
                6-Digit PIN Code
              </label>
              <input
                id="pincode"
                type="password"
                inputMode="numeric"
                maxLength={6}
                required
                placeholder="123456"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className="mt-1.5 block w-full rounded-xl border border-dark-700 bg-dark-950 px-3.5 py-2.5 font-mono text-center tracking-widest text-lg font-bold text-brand-yellow placeholder-dark-600 focus:border-brand-yellow focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="confirmPin" className="block text-xs font-bold uppercase tracking-wider text-dark-300">
                Confirm 6-Digit PIN
              </label>
              <input
                id="confirmPin"
                type="password"
                inputMode="numeric"
                maxLength={6}
                required
                placeholder="123456"
                value={confirmPincode}
                onChange={(e) => setConfirmPincode(e.target.value)}
                className="mt-1.5 block w-full rounded-xl border border-dark-700 bg-dark-950 px-3.5 py-2.5 font-mono text-center tracking-widest text-lg font-bold text-brand-yellow placeholder-dark-600 focus:border-brand-yellow focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-brand-yellow px-5 py-3 text-sm font-bold text-dark-950 shadow-[0_0_20px_-3px_rgba(250,204,21,0.3)] transition hover:bg-brand-yellowHover hover:shadow-yellowGlow active:scale-95 disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin text-dark-950" /> : <UserCheck className="h-4 w-4 stroke-[2.5]" />}
            <span>{loading ? "Encrypting and funding account..." : "Sign Up & Encrypt Key"}</span>
          </button>

          <div className="relative my-4 flex items-center justify-center border-t border-dark-800 pt-4">
            <span className="bg-dark-900 px-3 text-xs font-semibold uppercase tracking-wider text-dark-400">
              Or connect wallet
            </span>
          </div>

          <button
            type="button"
            onClick={handleSignupWithWallet}
            disabled={connectingWallet}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-dark-700 bg-dark-850 px-4 py-2.5 text-xs font-bold text-white transition hover:border-brand-yellow/40 hover:text-brand-yellow"
          >
            {connectingWallet ? (
              <Loader2 className="h-4 w-4 animate-spin text-brand-yellow" />
            ) : (
              <Wallet className="h-4 w-4 text-brand-yellow" />
            )}
            <span>Sign up with Freighter Wallet</span>
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-dark-400">
          Already have an account?{" "}
          <Link to="/login" className="font-bold text-brand-yellow hover:underline">
            Login with PIN here
          </Link>
        </p>
      </div>
    </div>
  );
}
