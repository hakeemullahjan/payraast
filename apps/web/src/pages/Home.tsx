import {
  ArrowRight,
  Banknote,
  CheckCircle2,
  Clock,
  ExternalLink,
  Globe2,
  Layers,
  QrCode,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Sparkles,
  TrendingUp,
  Wallet,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";
import { SUPPORTED_ASSET_CODES } from "@payraast/shared";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-dark-950 text-dark-100">
      {/* Background radial yellow glow effects */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-brand-yellow/10 blur-[130px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute top-1/2 -left-40 h-96 w-96 rounded-full bg-brand-yellow/5 blur-[120px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-10 right-0 h-96 w-96 rounded-full bg-brand-yellow/5 blur-[120px]"
        aria-hidden="true"
      />

      {/* Top Navigation */}
      <header className="sticky top-0 z-40 border-b border-dark-800/80 bg-dark-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-yellow text-dark-950 shadow-[0_0_15px_rgba(250,204,21,0.35)] transition group-hover:scale-105">
              <Zap className="h-5 w-5 fill-dark-950 stroke-[2.5]" aria-hidden="true" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tight text-white flex items-center gap-1">
                Pay<span className="text-brand-yellow">Raast</span>
              </span>
              <span className="text-[10px] font-medium uppercase tracking-wider text-dark-400 -mt-1">
                Stellar &bull; Pakistan
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/sep24"
              className="hidden md:inline-flex items-center gap-1 text-xs font-semibold text-dark-300 hover:text-brand-yellow transition"
            >
              <span>SEP-24 Demo</span>
            </Link>
            <Link
              to="/login"
              className="rounded-lg border border-dark-700 bg-dark-850 px-3 py-1.5 text-xs font-semibold text-dark-200 transition hover:border-brand-yellow/40 hover:text-white"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-brand-yellow/30 bg-brand-yellow/10 px-3 py-1.5 text-xs font-bold text-brand-yellow hover:bg-brand-yellow/20 transition"
            >
              <span>Sign up</span>
            </Link>
            <Link
              to="/invoices/new"
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-yellow px-3.5 py-1.5 text-xs font-bold text-dark-950 shadow-[0_0_20px_-3px_rgba(250,204,21,0.3)] transition hover:bg-brand-yellowHover hover:shadow-yellowGlow active:scale-95"
            >
              <span>Create invoice</span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative mx-auto max-w-6xl px-4 pt-12 pb-20 sm:px-6 lg:pt-20">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-yellow/30 bg-brand-yellow/10 px-4 py-1.5 text-xs font-semibold text-brand-yellow shadow-[0_0_20px_-5px_rgba(250,204,21,0.3)] backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Built for Pakistani Freelancers & Global Clients</span>
            <span className="rounded bg-brand-yellow/20 px-1.5 py-0.2 text-[10px] font-bold text-brand-yellow">
              TESTNET LIVE
            </span>
          </div>

          {/* Catchy Main Title */}
          <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl leading-tight">
            Get Paid in Dollars. <br />
            <span className="text-brand-yellow drop-shadow-[0_0_35px_rgba(250,204,21,0.35)]">
              Settle to Raast in Seconds.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mt-6 max-w-2xl text-base text-dark-300 sm:text-lg">
            Say goodbye to expensive wire deductions, bank hold-ups, and currency decay.
            Issue on-chain invoices on Stellar, receive USDC instantly with zero fees,
            and cash out straight into your Pakistani bank via SBP Raast.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/invoices/new"
              className="inline-flex items-center gap-2 rounded-xl bg-brand-yellow px-6 py-3.5 text-sm font-bold text-dark-950 shadow-[0_0_30px_-5px_rgba(250,204,21,0.4)] transition hover:bg-brand-yellowHover hover:shadow-yellowGlow hover:scale-[1.02] active:scale-95"
            >
              <Zap className="h-4 w-4 fill-dark-950 stroke-[2]" aria-hidden="true" />
              <span>Create Free Invoice</span>
            </Link>

            <Link
              to="/invoices"
              className="inline-flex items-center gap-2 rounded-xl border border-dark-700 bg-dark-900/90 px-6 py-3.5 text-sm font-semibold text-dark-100 transition hover:border-brand-yellow/50 hover:bg-dark-850 active:scale-95"
            >
              <span>Explore Dashboard</span>
              <ArrowRight className="h-4 w-4 text-brand-yellow" aria-hidden="true" />
            </Link>
          </div>

          {/* Trust proof row */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-dark-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-brand-yellow" aria-hidden="true" />
              <span>Zero intermediary wire cuts</span>
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-brand-yellow" aria-hidden="true" />
              <span>Independent Stellar Horizon verification</span>
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-brand-yellow" aria-hidden="true" />
              <span>SBP Raast & 1Link Payout simulation</span>
            </span>
          </div>
        </div>

        {/* HERO INTERACTIVE / VISUAL DASHBOARD PREVIEW */}
        <div className="relative mx-auto mt-14 max-w-5xl">
          {/* Card Border Glow */}
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-brand-yellow/30 via-yellow-500/10 to-brand-yellow/30 opacity-70 blur-xl" />

          <div className="relative rounded-2xl border border-dark-700/80 bg-dark-900/95 p-5 shadow-2xl backdrop-blur-xl sm:p-7">
            {/* Top Mock Window Bar */}
            <div className="flex items-center justify-between border-b border-dark-800 pb-4">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-dark-600" />
                <span className="h-3 w-3 rounded-full bg-brand-yellow/80" />
                <span className="h-3 w-3 rounded-full bg-brand-yellow" />
                <span className="ml-2 font-mono text-xs text-dark-400">
                  payraast.app/invoices/demo
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full border border-brand-yellow/30 bg-brand-yellow/10 px-2.5 py-0.5 text-[11px] font-semibold text-brand-yellow">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-yellow animate-pulse" />
                  Live Demo
                </span>
              </div>
            </div>

            {/* Mock Dashboard Body */}
            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Left 2 Cols: Freelancer Invoicing Overview */}
              <div className="lg:col-span-2 space-y-4">
                {/* 3 Metric Pills */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-xl border border-dark-700 bg-dark-850 p-3.5">
                    <p className="text-[11px] font-medium text-dark-400">Pending Receivables</p>
                    <p className="mt-1 text-lg font-black text-white sm:text-xl">
                      $1,450.00 <span className="text-xs font-semibold text-brand-yellow">USDC</span>
                    </p>
                    <p className="text-[10px] text-dark-500 mt-0.5">2 active invoices</p>
                  </div>
                  <div className="rounded-xl border border-brand-yellow/30 bg-brand-yellow/5 p-3.5">
                    <p className="text-[11px] font-medium text-brand-yellow">Total Settled</p>
                    <p className="mt-1 text-lg font-black text-brand-yellow sm:text-xl">
                      $8,920.00 <span className="text-xs font-semibold text-white">USDC</span>
                    </p>
                    <p className="text-[10px] text-dark-400 mt-0.5">14 payments verified</p>
                  </div>
                  <div className="rounded-xl border border-dark-700 bg-dark-850 p-3.5">
                    <p className="text-[11px] font-medium text-dark-400">Available to Cash Out</p>
                    <p className="mt-1 text-lg font-black text-brand-yellow sm:text-xl font-mono">
                      PKR 2.48M
                    </p>
                    <p className="text-[10px] text-dark-400 mt-0.5">Instant Raast rail</p>
                  </div>
                </div>

                {/* Mock Active Invoice List */}
                <div className="rounded-xl border border-dark-700 bg-dark-850 overflow-hidden">
                  <div className="flex items-center justify-between border-b border-dark-750 bg-dark-800/60 px-4 py-2.5">
                    <span className="text-xs font-bold text-dark-200 uppercase tracking-wider">
                      Recent Invoices
                    </span>
                    <span className="text-[11px] text-brand-yellow font-medium">Auto-synced</span>
                  </div>
                  <div className="divide-y divide-dark-750/70 text-xs">
                    <div className="flex items-center justify-between p-3.5 hover:bg-dark-800/40 transition">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-yellow/10 text-brand-yellow font-bold">
                          US
                        </div>
                        <div>
                          <p className="font-semibold text-white">SaaS Mobile App UI/UX</p>
                          <p className="text-[11px] text-dark-400">Venture Studio Inc &bull; Due in 3 days</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-white">1,200.00 USDC</span>
                        <span className="rounded-full border border-brand-yellow/40 bg-brand-yellow/10 px-2 py-0.5 text-[10px] font-bold text-brand-yellow animate-pulse">
                          Pending
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3.5 hover:bg-dark-800/40 transition">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-yellow/20 text-brand-yellow font-bold">
                          DE
                        </div>
                        <div>
                          <p className="font-semibold text-white">Fullstack API Integration</p>
                          <p className="text-[11px] text-dark-400">FinTech Labs Berlin &bull; Verified on Horizon</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-brand-yellow">2,500.00 USDC</span>
                        <span className="rounded-full bg-brand-yellow text-dark-950 px-2 py-0.5 text-[10px] font-bold shadow-sm">
                          Paid &bull; Ready to Cash Out
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Instant Raast Payout Simulator preview */}
              <div className="rounded-xl border border-brand-yellow/20 bg-gradient-to-b from-dark-850 to-dark-900 p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-white">
                      <Zap className="h-3.5 w-3.5 text-brand-yellow fill-brand-yellow" />
                      Instant Raast Payout
                    </span>
                    <span className="text-[10px] font-semibold text-brand-yellow uppercase">
                      Direct Rail
                    </span>
                  </div>

                  <div className="mt-4 rounded-lg border border-dark-700 bg-dark-950 p-3">
                    <p className="text-[11px] text-dark-400">Liquidate USDC</p>
                    <p className="text-base font-black text-white font-mono">2,500.00 USDC</p>
                    <div className="mt-2 border-t border-dark-800 pt-2 flex items-center justify-between text-xs">
                      <span className="text-dark-400">Rate:</span>
                      <span className="font-bold text-brand-yellow font-mono">1 USDC = 278.25 PKR</span>
                    </div>
                  </div>

                  <div className="mt-3 rounded-lg border border-brand-yellow/30 bg-dark-950 p-3">
                    <p className="text-[11px] text-brand-yellow font-semibold">Deposits Directly Into</p>
                    <p className="text-base font-extrabold text-white font-mono">PKR 695,625.00</p>
                    <p className="text-[10px] text-dark-300 mt-0.5 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-brand-yellow" />
                      Meezan Bank &bull; Hakeem Ullah
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-dark-750">
                  <Link
                    to="/invoices"
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-yellow px-3 py-2 text-xs font-bold text-dark-950 shadow-sm transition hover:bg-brand-yellowHover"
                  >
                    <span>Open Live Dashboard</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHY PAYRAAST / SOLVING REAL PAIN POINTS */}
      <section className="border-t border-dark-800/80 bg-dark-900/50 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-yellow">
              The Freelancer Advantage
            </span>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">
              Why Top Pakistani Developers & Designers Switch to PayRaast
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-dark-400 sm:text-base">
              Traditional wire transfers bleed your hard-earned dollars with $40 fees, unfair exchange spreads, and 4-day delays. We built a faster, safer way.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Feature 1 */}
            <div className="rounded-2xl border border-dark-700 bg-dark-850 p-6 transition hover:border-brand-yellow/50 hover:shadow-[0_0_25px_-5px_rgba(250,204,21,0.15)] group">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-yellow/10 text-brand-yellow border border-brand-yellow/20 group-hover:bg-brand-yellow group-hover:text-dark-950 transition">
                <Globe2 className="h-6 w-6 stroke-[2]" aria-hidden="true" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-white">
                Shareable Invoices with 1-Click Pay
              </h3>
              <p className="mt-2 text-sm text-dark-300 leading-relaxed">
                Send a beautiful, branded invoice URL to international clients. They review the milestone and sign the payment with Freighter or any Stellar wallet in 10 seconds.
              </p>
              <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-brand-yellow">
                <span>Supports {SUPPORTED_ASSET_CODES.join(", ")}</span>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="rounded-2xl border border-dark-700 bg-dark-850 p-6 transition hover:border-brand-yellow/50 hover:shadow-[0_0_25px_-5px_rgba(250,204,21,0.15)] group">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-yellow/10 text-brand-yellow border border-brand-yellow/20 group-hover:bg-brand-yellow group-hover:text-dark-950 transition">
                <ShieldCheck className="h-6 w-6 stroke-[2]" aria-hidden="true" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-white">
                Cryptographic Backend Verification
              </h3>
              <p className="mt-2 text-sm text-dark-300 leading-relaxed">
                No fake payment screenshots or disputed chargebacks. Our backend independently verifies each transaction directly against Stellar Horizon with replay protection.
              </p>
              <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-brand-yellow">
                <span>Tamper-proof on-chain receipts</span>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="rounded-2xl border border-dark-700 bg-dark-850 p-6 transition hover:border-brand-yellow/50 hover:shadow-[0_0_25px_-5px_rgba(250,204,21,0.15)] group">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-yellow/10 text-brand-yellow border border-brand-yellow/20 group-hover:bg-brand-yellow group-hover:text-dark-950 transition">
                <Banknote className="h-6 w-6 stroke-[2]" aria-hidden="true" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-white">
                SBP Raast Payout Architecture
              </h3>
              <p className="mt-2 text-sm text-dark-300 leading-relaxed">
                Connect seamlessly with licensed Stellar Anchor SEP-24 infrastructure to cash out USDC directly into your Meezan, HBL, JazzCash, or EasyPaisa accounts.
              </p>
              <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-brand-yellow">
                <span>Zero FX markup &bull; Instant settlement</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS (3 SIMPLE STEPS) */}
      <section className="py-20 mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-yellow">
            Workflow Simplicity
          </span>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">
            How It Works
          </h2>
          <p className="mt-2 text-sm text-dark-400">
            A frictionless three-step payment cycle engineered for speed.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Step 1 */}
          <div className="relative rounded-2xl border border-dark-700 bg-dark-900 p-6">
            <span className="absolute -top-3.5 left-6 rounded-full bg-brand-yellow px-3 py-0.5 text-xs font-black text-dark-950">
              01
            </span>
            <div className="mt-2">
              <QrCode className="h-8 w-8 text-brand-yellow" />
              <h4 className="mt-4 text-base font-bold text-white">Create & Share</h4>
              <p className="mt-1.5 text-xs text-dark-300 leading-relaxed">
                Specify your client name, milestone title, amount in USDC, and your Stellar address. Receive an instant shareable payment link and QR code.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="relative rounded-2xl border border-dark-700 bg-dark-900 p-6">
            <span className="absolute -top-3.5 left-6 rounded-full bg-brand-yellow px-3 py-0.5 text-xs font-black text-dark-950">
              02
            </span>
            <div className="mt-2">
              <Wallet className="h-8 w-8 text-brand-yellow" />
              <h4 className="mt-4 text-base font-bold text-white">Client Signs via Wallet</h4>
              <p className="mt-1.5 text-xs text-dark-300 leading-relaxed">
                Your international client opens the link, connects their Freighter wallet or scans the QR, and approves the transaction with zero gas delays.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="relative rounded-2xl border border-dark-700 bg-dark-900 p-6">
            <span className="absolute -top-3.5 left-6 rounded-full bg-brand-yellow px-3 py-0.5 text-xs font-black text-dark-950">
              03
            </span>
            <div className="mt-2">
              <Zap className="h-8 w-8 text-brand-yellow fill-brand-yellow" />
              <h4 className="mt-4 text-base font-bold text-white">Instant Verification & Cashout</h4>
              <p className="mt-1.5 text-xs text-dark-300 leading-relaxed">
                Horizon verifies the stroop transfer cryptographically. The invoice marks Paid and you can cash out to PKR on SBP Raast or keep stable USDC.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* STATS BANNER */}
      <section className="border-y border-dark-800 bg-dark-900/60 py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 text-center">
            <div>
              <p className="text-3xl font-black text-brand-yellow font-mono sm:text-4xl">&lt; 5s</p>
              <p className="mt-1 text-xs font-medium text-dark-400">Finality Time</p>
            </div>
            <div>
              <p className="text-3xl font-black text-white font-mono sm:text-4xl">$0.00001</p>
              <p className="mt-1 text-xs font-medium text-dark-400">Stellar Network Fee</p>
            </div>
            <div>
              <p className="text-3xl font-black text-brand-yellow font-mono sm:text-4xl">100%</p>
              <p className="mt-1 text-xs font-medium text-dark-400">Non-Custodial Payments</p>
            </div>
            <div>
              <p className="text-3xl font-black text-white font-mono sm:text-4xl">24/7</p>
              <p className="mt-1 text-xs font-medium text-dark-400">SBP Raast Availability</p>
            </div>
          </div>
        </div>
      </section>

      {/* BOTTOM CTA SECTION */}
      <section className="relative mx-auto max-w-5xl px-4 py-20 text-center sm:px-6">
        <div className="rounded-3xl border border-brand-yellow/30 bg-gradient-to-b from-dark-850 to-dark-900 p-8 shadow-[0_0_50px_-15px_rgba(250,204,21,0.2)] sm:p-12">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-yellow text-dark-950 shadow-lg shadow-brand-yellow/30">
            <Zap className="h-7 w-7 fill-dark-950 stroke-[2.5]" />
          </div>

          <h2 className="mt-6 text-3xl font-black tracking-tight text-white sm:text-4xl">
            Start receiving payments on Stellar today.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-dark-300">
            No registration or credit card needed. Generate your first invoice in under 60 seconds on Stellar Testnet.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/invoices/new"
              className="rounded-xl bg-brand-yellow px-7 py-3 text-sm font-bold text-dark-950 shadow-[0_0_25px_rgba(250,204,21,0.3)] transition hover:bg-brand-yellowHover hover:scale-105 active:scale-95"
            >
              Create Your First Invoice
            </Link>
            <Link
              to="/invoices"
              className="rounded-xl border border-dark-700 bg-dark-800 px-7 py-3 text-sm font-semibold text-white transition hover:bg-dark-750"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-dark-800/60 bg-dark-950 py-8 text-xs text-dark-500">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-brand-yellow fill-brand-yellow" />
            <span className="font-bold text-white">PayRaast</span>
            <span>&bull; Built for HackMeridian Genesis</span>
          </div>

          <div className="flex items-center gap-4 text-dark-400">
            <span>Stellar Testnet Horizon</span>
            <span>&bull;</span>
            <span>Circle USDC</span>
            <span>&bull;</span>
            <span>State Bank of Pakistan Raast</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

