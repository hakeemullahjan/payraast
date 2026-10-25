import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Coins, FileText, Info, Loader2, Sparkles, User, Wallet, Zap } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { createInvoiceSchema, type CreateInvoiceInput } from "@payraast/shared";
import ErrorBox from "../components/ErrorBox";
import { createInvoice } from "../lib/api";

const inputClass =
  "block w-full rounded-xl border border-dark-700 bg-dark-900 px-3.5 py-2.5 text-sm text-white placeholder-dark-500 transition focus:border-brand-yellow focus:outline-none focus:ring-1 focus:ring-brand-yellow aria-[invalid=true]:border-red-500/80";

const AMOUNT_HINT = "Specify amount in USDC (e.g. 250.00)";
const ADDRESS_HINT =
  "Starts with G, 56 characters. Payment will be routed to this Stellar public key.";

function Field({
  id,
  label,
  error,
  hint,
  optional,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  optional?: boolean;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-dark-300">
        {label}
        {optional ? (
          <span className="ml-1 text-[11px] font-normal lowercase tracking-normal text-dark-500">
            (optional)
          </span>
        ) : null}
      </label>
      {children}
      {hint && !error ? (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-dark-400">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-xs font-medium text-red-400">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function describedBy(id: string, error?: string, hint?: string) {
  if (error) return `${id}-error`;
  return hint ? `${id}-hint` : undefined;
}

export default function CreateInvoice() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateInvoiceInput>({
    resolver: zodResolver(createInvoiceSchema),
    defaultValues: {
      clientName: "",
      clientEmail: "",
      projectTitle: "",
      description: "",
      amount: "",
      assetCode: "USDC",
      recipientAddress: "",
      dueDate: "",
    },
  });

  const amountWatch = watch("amount");

  async function onSubmit(values: CreateInvoiceInput) {
    setServerError(null);
    try {
      const invoice = await createInvoice(values);
      navigate(`/invoices/${invoice.id}`);
    } catch (error) {
      setServerError(
        error instanceof Error ? error.message : "Something went wrong."
      );
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link
          to="/invoices"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-dark-400 hover:text-brand-yellow transition"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>Back to dashboard</span>
        </Link>
        <div className="mt-3 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
              Create New Invoice
            </h1>
            <p className="mt-1 text-sm text-dark-400">
              Generate an on-chain invoice and instant payment URL for your client.
            </p>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-brand-yellow/30 bg-brand-yellow/10 px-3 py-1 text-xs font-semibold text-brand-yellow">
            <Sparkles className="h-3.5 w-3.5" />
            Zero Platform Fees
          </span>
        </div>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="space-y-6 rounded-2xl border border-dark-750 bg-dark-900 p-6 shadow-xl sm:p-8"
      >
        {serverError ? <ErrorBox message={serverError} /> : null}

        {/* Client Details Section */}
        <div className="border-b border-dark-800 pb-6">
          <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-yellow">
            <User className="h-4 w-4" />
            <span>Client Information</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="clientName" label="Client or Company Name" error={errors.clientName?.message}>
              <input
                id="clientName"
                type="text"
                autoComplete="off"
                placeholder="e.g. Acme Corp / Sarah Jenkins"
                className={inputClass}
                aria-invalid={errors.clientName ? true : undefined}
                aria-describedby={describedBy("clientName", errors.clientName?.message)}
                {...register("clientName")}
              />
            </Field>

            <Field
              id="clientEmail"
              label="Client Email"
              optional
              error={errors.clientEmail?.message}
              hint="For your records (never shared publicly)"
            >
              <input
                id="clientEmail"
                type="email"
                autoComplete="off"
                placeholder="billing@client.com"
                className={inputClass}
                aria-invalid={errors.clientEmail ? true : undefined}
                aria-describedby={describedBy("clientEmail", errors.clientEmail?.message)}
                {...register("clientEmail")}
              />
            </Field>
          </div>
        </div>

        {/* Project Scope Section */}
        <div className="border-b border-dark-800 pb-6">
          <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-yellow">
            <FileText className="h-4 w-4" />
            <span>Project Scope</span>
          </div>

          <div className="space-y-4">
            <Field id="projectTitle" label="Project or Milestone Title" error={errors.projectTitle?.message}>
              <input
                id="projectTitle"
                type="text"
                placeholder="e.g. Mobile App Redesign & Frontend Delivery"
                className={inputClass}
                aria-invalid={errors.projectTitle ? true : undefined}
                aria-describedby={describedBy("projectTitle", errors.projectTitle?.message)}
                {...register("projectTitle")}
              />
            </Field>

            <Field
              id="description"
              label="Detailed Scope / Terms"
              optional
              error={errors.description?.message}
            >
              <textarea
                id="description"
                rows={3}
                placeholder="Deliverables: Figma designs, React Native components, final review approval."
                className={inputClass}
                aria-invalid={errors.description ? true : undefined}
                aria-describedby={describedBy("description", errors.description?.message)}
                {...register("description")}
              />
            </Field>
          </div>
        </div>

        {/* Payment Amount & Receiving Wallet */}
        <div>
          <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-yellow">
            <Coins className="h-4 w-4" />
            <span>Payment & Receiving Wallet</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              id="amount"
              label="Invoice Amount (USDC)"
              error={errors.amount?.message}
              hint={AMOUNT_HINT}
            >
              <input
                id="amount"
                type="text"
                inputMode="decimal"
                autoComplete="off"
                placeholder="500.00"
                className={`${inputClass} font-mono font-bold text-base text-brand-yellow`}
                aria-invalid={errors.amount ? true : undefined}
                aria-describedby={describedBy("amount", errors.amount?.message, AMOUNT_HINT)}
                {...register("amount")}
              />
            </Field>

            <Field id="assetCode" label="Settlement Currency" hint="Stellar Circle USDC (Testnet)">
              <select
                id="assetCode"
                className={`${inputClass} cursor-pointer font-semibold`}
                aria-describedby="assetCode-hint"
                {...register("assetCode")}
              >
                <option value="USDC">USDC &bull; Stable Value</option>
              </select>
            </Field>
          </div>

          {/* Real-time PKR conversion estimate */}
          {amountWatch && Number(amountWatch) > 0 ? (
            <div className="mt-3 flex items-center justify-between rounded-xl border border-brand-yellow/30 bg-brand-yellow/10 p-3 text-xs">
              <span className="text-dark-200">Approximate PKR Value at Raast Cashout:</span>
              <span className="font-mono font-bold text-brand-yellow">
                PKR {(Number(amountWatch) * 278.25).toLocaleString("en-PK", { minimumFractionDigits: 2 })}
              </span>
            </div>
          ) : null}

          <div className="mt-4 space-y-4">
            <Field
              id="recipientAddress"
              label="Your Stellar Public Key (G...)"
              error={errors.recipientAddress?.message}
              hint={ADDRESS_HINT}
            >
              <input
                id="recipientAddress"
                type="text"
                autoComplete="off"
                spellCheck={false}
                placeholder="GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5"
                className={`${inputClass} font-mono text-xs`}
                aria-invalid={errors.recipientAddress ? true : undefined}
                aria-describedby={describedBy(
                  "recipientAddress",
                  errors.recipientAddress?.message,
                  ADDRESS_HINT
                )}
                {...register("recipientAddress")}
              />
            </Field>

            <Field id="dueDate" label="Due Date" optional error={errors.dueDate?.message}>
              <input
                id="dueDate"
                type="date"
                className={inputClass}
                aria-invalid={errors.dueDate ? true : undefined}
                aria-describedby={describedBy("dueDate", errors.dueDate?.message)}
                {...register("dueDate")}
              />
            </Field>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-between border-t border-dark-800 pt-5">
          <Link
            to="/invoices"
            className="text-xs font-semibold text-dark-400 hover:text-white transition"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-yellow px-6 py-2.5 text-xs font-bold text-dark-950 shadow-[0_0_20px_-3px_rgba(250,204,21,0.3)] transition hover:bg-brand-yellowHover hover:shadow-yellowGlow disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin text-dark-950" aria-hidden="true" />
            ) : (
              <Zap className="h-4 w-4 fill-dark-950 stroke-[2]" aria-hidden="true" />
            )}
            <span>{isSubmitting ? "Generating on-chain invoice..." : "Create Invoice"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

