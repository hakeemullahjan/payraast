import type {
  ApiErrorBody,
  CreateInvoiceInput,
  Invoice,
  InvoiceStatus,
  InvoiceSummary,
  Payment,
  PublicInvoice,
} from "@payraast/shared";

const API_URL = import.meta.env.VITE_API_URL ?? import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";

export class ApiRequestError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "ApiRequestError";
    this.code = code;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...init?.headers },
    });
  } catch {
    throw new ApiRequestError(
      "NETWORK_ERROR",
      "Could not reach the server. Check that the API is running."
    );
  }

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as ApiErrorBody | null;
    throw new ApiRequestError(
      body?.error.code ?? "UNKNOWN_ERROR",
      body?.error.message ?? "Something went wrong. Please try again."
    );
  }

  return (await response.json()) as T;
}

export function createInvoice(input: CreateInvoiceInput): Promise<Invoice> {
  return request<Invoice>("/api/invoices", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function listInvoices(status?: InvoiceStatus): Promise<Invoice[]> {
  const query = status ? `?status=${status}` : "";
  return request<Invoice[]>(`/api/invoices${query}`);
}

export function getInvoice(id: string): Promise<Invoice> {
  return request<Invoice>(`/api/invoices/${encodeURIComponent(id)}`);
}

export function getPublicInvoice(id: string): Promise<PublicInvoice> {
  return request<PublicInvoice>(
    `/api/invoices/${encodeURIComponent(id)}/public`
  );
}

export function getSummary(): Promise<InvoiceSummary> {
  return request<InvoiceSummary>("/api/invoices/summary");
}

export function verifyPayment(
  id: string,
  transactionHash: string
): Promise<{ invoice: Invoice; payment: Payment }> {
  return request<{ invoice: Invoice; payment: Payment }>(
    `/api/invoices/${encodeURIComponent(id)}/verify-payment`,
    {
      method: "POST",
      body: JSON.stringify({ transactionHash }),
    }
  );
}

export function getPayment(id: string): Promise<Payment> {
  return request<Payment>(`/api/invoices/${encodeURIComponent(id)}/payment`);
}

export function buildTransaction(
  id: string,
  senderAddress: string
): Promise<{ xdr: string }> {
  return request<{ xdr: string }>(
    `/api/invoices/${encodeURIComponent(id)}/build-transaction`,
    {
      method: "POST",
      body: JSON.stringify({ senderAddress }),
    }
  );
}

export function submitPayment(
  id: string,
  signedTxXdr: string
): Promise<{ invoice: Invoice; payment: Payment }> {
  return request<{ invoice: Invoice; payment: Payment }>(
    `/api/invoices/${encodeURIComponent(id)}/submit-payment`,
    {
      method: "POST",
      body: JSON.stringify({ signedTxXdr }),
    }
  );
}

export function buildTrustline(address: string): Promise<{ xdr: string }> {
  return request<{ xdr: string }>("/api/invoices/trustline/build", {
    method: "POST",
    body: JSON.stringify({ address }),
  });
}

export function submitTrustline(
  signedTxXdr: string
): Promise<{ hash: string }> {
  return request<{ hash: string }>("/api/invoices/trustline/submit", {
    method: "POST",
    body: JSON.stringify({ signedTxXdr }),
  });
}
