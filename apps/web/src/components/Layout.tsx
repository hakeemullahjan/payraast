import { Plus, ShieldCheck } from "lucide-react";
import { Link, NavLink, Outlet } from "react-router-dom";

function navClass({ isActive }: { isActive: boolean }) {
  return `rounded-lg px-3 py-1.5 text-sm font-medium transition ${
    isActive ? "bg-navy-100 text-navy-900" : "text-navy-500 hover:text-navy-900"
  }`;
}

export default function Layout() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-navy-100 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <Link to="/" className="text-lg font-bold tracking-tight text-navy-900">
            PayRaast
          </Link>
          <nav className="flex items-center gap-1" aria-label="Main">
            <NavLink to="/invoices" end className={navClass}>
              Invoices
            </NavLink>
            <NavLink
              to="/invoices/new"
              className="ml-1 inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-emerald-700"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              New invoice
            </NavLink>
          </nav>
          <span className="hidden items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 sm:inline-flex">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
            Stellar Testnet
          </span>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
