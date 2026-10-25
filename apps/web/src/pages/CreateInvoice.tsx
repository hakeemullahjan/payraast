import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { createInvoiceSchema, type CreateInvoiceInput } from "@payraast/shared";
import ErrorBox from "../components/ErrorBox";
import { createInvoice } from "../lib/api";

const inputClass =
  "block w-full rounded-lg border border-navy-200 bg-white px-3 py-2 text-sm text-navy-900 placeholder:text-navy-200 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 aria-[invalid=true]:border-red-400";

const AMOUNT_HINT = "Up to 7 decimal places";
const ADDRESS_HINT =
  "Starts with G, 56 characters. The payment goes to this address.";

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
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-navy-900">
        {label}
        {optional ? (
          <span className="ml-1 font-normal text-navy-500">(optional)</span>
        ) : null}
      </label>
      {children}
      {hint && !error ? (
        <p id={`${id}-hint`} className="mt-1 text-xs text-navy-500">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="mt-1 text-xs text-red-600">
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
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold tracking-tight text-navy-900">
        New invoice
      </h1>
      <p className="mt-1 text-sm text-navy-500">
        Create an invoice and share the payment link with your client.
      </p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="mt-6 space-y-5 rounded-xl border border-navy-100 bg-white p-5 shadow-sm sm:p-6"
      >
        {serverError ? <ErrorBox message={serverError} /> : null}

        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="clientName" label="Client name" error={errors.clientName?.message}>
            <input
              id="clientName"
              type="text"
              autoComplete="off"
              placeholder="Acme Inc."
              className={inputClass}
              aria-invalid={errors.clientName ? true : undefined}
              aria-describedby={describedBy("clientName", errors.clientName?.message)}
              {...register("clientName")}
            />
          </Field>
          <Field
            id="clientEmail"
            label="Client email"
            optional
            error={errors.clientEmail?.message}
          >
            <input
              id="clientEmail"
              type="email"
              autoComplete="off"
              placeholder="billing@acme.com"
              className={inputClass}
              aria-invalid={errors.clientEmail ? true : undefined}
              aria-describedby={describedBy("clientEmail", errors.clientEmail?.message)}
              {...register("clientEmail")}
            />
          </Field>
        </div>

        <Field id="projectTitle" label="Project title" error={errors.projectTitle?.message}>
          <input
            id="projectTitle"
            type="text"
            placeholder="Website redesign"
            className={inputClass}
            aria-invalid={errors.projectTitle ? true : undefined}
            aria-describedby={describedBy("projectTitle", errors.projectTitle?.message)}
            {...register("projectTitle")}
          />
        </Field>

        <Field
          id="description"
          label="Description"
          optional
          error={errors.description?.message}
        >
          <textarea
            id="description"
            rows={3}
            placeholder="What is this payment for?"
            className={inputClass}
            aria-invalid={errors.description ? true : undefined}
            aria-describedby={describedBy("description", errors.description?.message)}
            {...register("description")}
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            id="amount"
            label="Amount"
            error={errors.amount?.message}
            hint={AMOUNT_HINT}
          >
            <input
              id="amount"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              placeholder="150.00"
              className={inputClass}
              aria-invalid={errors.amount ? true : undefined}
              aria-describedby={describedBy(
                "amount",
                errors.amount?.message,
                AMOUNT_HINT
              )}
              {...register("amount")}
            />
          </Field>
          <Field id="assetCode" label="Currency" hint="Stablecoin on Stellar Testnet">
            <select
              id="assetCode"
              className={inputClass}
              aria-describedby="assetCode-hint"
              {...register("assetCode")}
            >
              <option value="USDC">USDC</option>
            </select>
          </Field>
        </div>

        <Field
          id="recipientAddress"
          label="Your Stellar address"
          error={errors.recipientAddress?.message}
          hint={ADDRESS_HINT}
        >
          <input
            id="recipientAddress"
            type="text"
            autoComplete="off"
            spellCheck={false}
            placeholder="G..."
            className={`${inputClass} font-mono`}
            aria-invalid={errors.recipientAddress ? true : undefined}
            aria-describedby={describedBy(
              "recipientAddress",
              errors.recipientAddress?.message,
              ADDRESS_HINT
            )}
            {...register("recipientAddress")}
          />
        </Field>

        <Field id="dueDate" label="Due date" optional error={errors.dueDate?.message}>
          <input
            id="dueDate"
            type="date"
            className={inputClass}
            aria-invalid={errors.dueDate ? true : undefined}
            aria-describedby={describedBy("dueDate", errors.dueDate?.message)}
            {...register("dueDate")}
          />
        </Field>

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : null}
            {isSubmitting ? "Creating..." : "Create invoice"}
          </button>
        </div>
      </form>
    </div>
  );
}
