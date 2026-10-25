import { LogOut, Plus, ShieldCheck, User, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { clearSession, getSession, type UserSession } from "../lib/auth";
import { shortAddress } from "../lib/format";

function navClass({ isActive }: { isActive: boolean }) {
  return `rounded-lg px-3 py-1.5 text-xs font-semibold tracking-wide transition ${
    isActive
      ? "bg-dark-800 text-brand-yellow border border-dark-700 shadow-sm"
      : "text-dark-400 hover:text-dark-100 hover:bg-dark-850"
  }`;
}

export default function Layout() {
  const navigate = useNavigate();
  const [session, setSession] = useState<UserSession | null>(() => getSession());

  useEffect(() => {
    function onAuthUpdate() {
      setSession(getSession());
    }
    window.addEventListener("payraast:auth_changed", onAuthUpdate);
    return () => {
      window.removeEventListener("payraast:auth_changed", onAuthUpdate);
    };
  }, []);

  function handleLogout() {
    clearSession();
    navigate("/");
  }

  return (
    <div className="min-h-screen bg-dark-950 text-dark-100 flex flex-col">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 border-b border-dark-800/80 bg-dark-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-yellow text-dark-950 shadow-[0_0_15px_rgba(250,204,21,0.35)] transition group-hover:scale-105">
              <Zap className="h-5 w-5 fill-dark-950" aria-hidden="true" />
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

          {/* Navigation Links */}
          <nav className="flex items-center gap-1 sm:gap-2" aria-label="Main">
            <NavLink to="/invoices" end className={navClass}>
              Dashboard
            </NavLink>
            <NavLink to="/sep24" className={navClass}>
              SEP-24 Anchor
            </NavLink>
            <NavLink
              to="/invoices/new"
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-yellow px-3.5 py-1.5 text-xs font-bold text-dark-950 shadow-[0_0_20px_-3px_rgba(250,204,21,0.3)] transition hover:bg-brand-yellowHover hover:shadow-yellowGlow active:scale-95"
            >
              <Plus className="h-4 w-4 stroke-[2.5]" aria-hidden="true" />
              <span>New invoice</span>
            </NavLink>
          </nav>

          {/* User Auth or Network Pill */}
          <div className="flex items-center gap-2">
            {session ? (
              <div className="flex items-center gap-2 rounded-xl border border-dark-750 bg-dark-900 px-2.5 py-1 text-xs">
                <span className="h-2 w-2 rounded-full bg-brand-yellow animate-pulse" />
                <span className="font-mono text-dark-200 hidden sm:inline">
                  {shortAddress(session.publicKey)}
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  title="Logout"
                  className="text-dark-400 hover:text-brand-yellow transition ml-1"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="rounded-lg border border-dark-700 bg-dark-850 px-2.5 py-1 text-xs font-semibold text-dark-300 hover:text-white"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="hidden sm:inline-block rounded-lg border border-brand-yellow/30 bg-brand-yellow/10 px-2.5 py-1 text-xs font-bold text-brand-yellow hover:bg-brand-yellow/20"
                >
                  Signup
                </Link>
              </div>
            )}

            <div className="hidden lg:flex items-center">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-dark-700 bg-dark-900/80 px-2.5 py-1 text-xs font-medium text-dark-400">
                <ShieldCheck className="h-3.5 w-3.5 text-brand-yellow" aria-hidden="true" />
                <span>Testnet</span>
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <Outlet />
      </main>

      {/* Modern Dark Footer */}
      <footer className="border-t border-dark-800/60 bg-dark-950 py-6 text-center text-xs text-dark-500">
        <div className="mx-auto max-w-6xl px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            &copy; {new Date().getFullYear()} PayRaast &bull; Built for Pakistani Freelancers on Stellar.
          </p>
          <div className="flex items-center gap-4 text-dark-400">
            <Link to="/sep24" className="hover:text-brand-yellow transition">
              SEP-24 Anchor Demo
            </Link>
            <span>&bull;</span>
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-yellow" />
              USDC on Stellar Testnet
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

