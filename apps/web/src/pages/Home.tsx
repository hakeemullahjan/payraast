import { ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { SUPPORTED_ASSET_CODES } from "@payraast/shared";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 text-center">
      <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
        <ShieldCheck className="h-4 w-4" aria-hidden="true" />
        Stellar Testnet
      </span>
      <h1 className="text-4xl font-bold tracking-tight text-navy-900 sm:text-5xl">
        Get paid globally. Keep your money in stable value.
      </h1>
      <p className="mt-4 text-lg text-navy-500">
        Create an invoice, share a payment link, and get paid in{" "}
        {SUPPORTED_ASSET_CODES.join(", ")}.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/invoices/new"
          className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700"
        >
          Create invoice
        </Link>
        <Link
          to="/invoices"
          className="rounded-lg border border-navy-200 bg-white px-5 py-2.5 text-sm font-medium text-navy-900 transition hover:bg-navy-50"
        >
          View invoices
        </Link>
      </div>
    </main>
  );
}
