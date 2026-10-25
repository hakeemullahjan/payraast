import { z } from "zod";

export const SUPPORTED_ASSET_CODES = ["USDC"] as const;
export type SupportedAssetCode = (typeof SUPPORTED_ASSET_CODES)[number];

export const STELLAR_TESTNET_NETWORK_PASSPHRASE =
  "Test SDF Network ; September 2015";
export const STELLAR_TESTNET_HORIZON_URL = "https://horizon-testnet.stellar.org";
export const STELLAR_TESTNET_EXPLORER_TX_URL =
  "https://stellar.expert/explorer/testnet/tx";
export const STELLAR_TESTNET_USDC_ISSUER =
  "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5";

export const STELLAR_CONFIG = {
  network: "TESTNET",
  networkPassphrase: STELLAR_TESTNET_NETWORK_PASSPHRASE,
  horizonUrl: STELLAR_TESTNET_HORIZON_URL,
  explorerTxUrl: STELLAR_TESTNET_EXPLORER_TX_URL,
  assets: {
    USDC: {
      code: "USDC",
      issuer: STELLAR_TESTNET_USDC_ISSUER,
    },
  },
} as const;

export function getExplorerTxUrl(txHash: string): string {
  return `${STELLAR_TESTNET_EXPLORER_TX_URL}/${encodeURIComponent(txHash)}`;
}

export const INVOICE_STATUSES = ["pending", "paid", "cancelled"] as const;
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

export const PAYMENT_VERIFICATION_STATUSES = ["verified"] as const;
export type PaymentVerificationStatus =
  (typeof PAYMENT_VERIFICATION_STATUSES)[number];

const STELLAR_PUBLIC_KEY_REGEX = /^G[A-Z2-7]{55}$/;
const AMOUNT_REGEX = /^\d+(\.\d{1,7})?$/;
const TX_HASH_REGEX = /^[a-f0-9]{64}$/i;

export const stellarPublicKeySchema = z
  .string()
  .trim()
  .regex(
    STELLAR_PUBLIC_KEY_REGEX,
    "Enter a valid Stellar public address (starts with G, 56 characters)"
  );

export const amountSchema = z
  .string()
  .trim()
  .regex(AMOUNT_REGEX, "Enter a number with up to 7 decimal places")
  .refine((value) => Number(value) > 0, "Amount must be greater than zero");

export const transactionHashSchema = z
  .string()
  .trim()
  .regex(TX_HASH_REGEX, "Enter a valid 64-character transaction hash");

export const createInvoiceSchema = z.object({
  clientName: z.string().trim().min(1, "Client name is required").max(100),
  clientEmail: z
    .string()
    .trim()
    .email("Enter a valid email")
    .max(254)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  projectTitle: z.string().trim().min(1, "Project title is required").max(150),
  description: z.string().trim().max(1000).optional(),
  amount: amountSchema,
  assetCode: z.enum(SUPPORTED_ASSET_CODES),
  recipientAddress: stellarPublicKeySchema,
  dueDate: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use the format YYYY-MM-DD")
    .optional()
    .or(z.literal("").transform(() => undefined)),
});
export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;

export const verifyPaymentSchema = z.object({
  transactionHash: transactionHashSchema,
});
export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;

export const buildTransactionSchema = z.object({
  senderAddress: stellarPublicKeySchema,
});
export type BuildTransactionInput = z.infer<typeof buildTransactionSchema>;

export const submitPaymentSchema = z.object({
  signedTxXdr: z.string().trim().min(1, "Signed transaction XDR is required"),
});
export type SubmitPaymentInput = z.infer<typeof submitPaymentSchema>;

export interface Invoice {
  id: string;
  clientName: string;
  clientEmail: string | null;
  projectTitle: string;
  description: string | null;
  amount: string;
  assetCode: SupportedAssetCode;
  recipientAddress: string;
  dueDate: string | null;
  status: InvoiceStatus;
  createdAt: string;
  paidAt: string | null;
}

export type PublicInvoice = Omit<Invoice, "clientEmail">;

export interface Payment {
  id: string;
  invoiceId: string;
  transactionHash: string;
  amount: string;
  assetCode: SupportedAssetCode;
  assetIssuer: string;
  senderAddress: string;
  recipientAddress: string;
  verificationStatus: PaymentVerificationStatus;
  ledgerCloseTime: string | null;
  verifiedAt: string;
}

export interface InvoiceSummary {
  totalInvoices: number;
  paidInvoices: number;
  pendingInvoices: number;
  totalPaidAmount: string;
  totalPendingAmount: string;
}

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
  };
}
