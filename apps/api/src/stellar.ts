import {
  STELLAR_CONFIG,
  type Invoice,
  type PublicInvoice,
  type SupportedAssetCode,
} from "@payraast/shared";
import {
  Asset,
  Horizon,
  Operation,
  TransactionBuilder,
} from "@stellar/stellar-sdk";
import { toStroops } from "./amounts.js";

const horizonUrl =
  process.env.STELLAR_HORIZON_URL ?? STELLAR_CONFIG.horizonUrl;

export const horizonServer = new Horizon.Server(horizonUrl);

export interface VerifiedPaymentResult {
  transactionHash: string;
  senderAddress: string;
  recipientAddress: string;
  amount: string;
  assetCode: SupportedAssetCode;
  assetIssuer: string;
  ledgerCloseTime: string | null;
}

export class PaymentVerificationError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "PaymentVerificationError";
    this.code = code;
  }
}

function parseHorizonSubmissionError(err: unknown): string {
  const resultCodes = (
    err as {
      response?: {
        data?: {
          extras?: {
            result_codes?: {
              transaction?: string;
              operations?: string[];
            };
          };
        };
      };
    }
  )?.response?.data?.extras?.result_codes;

  if (resultCodes?.operations?.includes("op_no_trust")) {
    return "Payment failed (op_no_trust): Either your wallet or the recipient address does not have a trustline established for Testnet USDC. On Stellar, both sender and recipient accounts must establish a trustline to the USDC issuer before they can send or receive USDC.";
  }
  if (resultCodes?.operations?.includes("op_underfunded")) {
    return "Payment failed (op_underfunded): Your wallet does not have enough Testnet USDC to pay this invoice (or not enough XLM for the transaction fee).";
  }
  if (resultCodes?.operations?.includes("op_no_destination")) {
    return "Payment failed (op_no_destination): The recipient address does not exist on Stellar Testnet yet. It must be funded with test XLM first.";
  }
  if (resultCodes?.transaction === "tx_bad_seq") {
    return "Transaction sequence number was out of sync. Please try again.";
  }
  if (resultCodes) {
    return `Stellar network rejected transaction: ${JSON.stringify(resultCodes)}`;
  }
  return "Stellar transaction submission failed. Please check your wallet and try again.";
}

/**
 * Builds a changeTrust transaction to establish the USDC trustline for an account.
 */
export async function buildTrustlineTransaction(
  accountAddress: string
): Promise<{ xdr: string }> {
  let account: Horizon.AccountResponse;
  try {
    account = await horizonServer.loadAccount(accountAddress);
  } catch (err: unknown) {
    const status = (err as { response?: { status?: number } })?.response?.status;
    if (status === 404) {
      throw new PaymentVerificationError(
        "ACCOUNT_NOT_FOUND",
        "Your account is not funded on Stellar Testnet. Fund it with test XLM via Stellar Friendbot first."
      );
    }
    throw new PaymentVerificationError(
      "HORIZON_ERROR",
      "Failed to load account from Stellar Horizon"
    );
  }

  const expectedIssuer =
    process.env.STELLAR_ASSET_ISSUER ??
    STELLAR_CONFIG.assets.USDC.issuer;

  const usdcAsset = new Asset("USDC", expectedIssuer);

  const tx = new TransactionBuilder(account, {
    fee: "100000", // 0.01 XLM
    networkPassphrase: STELLAR_CONFIG.networkPassphrase,
  })
    .addOperation(
      Operation.changeTrust({
        asset: usdcAsset,
      })
    )
    .setTimeout(180)
    .build();

  return { xdr: tx.toXDR() };
}

/**
 * Builds an unsigned Stellar payment transaction for Freighter to sign.
 * Checks both sender and recipient accounts for account funding and USDC trustline.
 */
export async function buildPaymentTransaction(params: {
  invoice: Invoice | PublicInvoice;
  senderAddress: string;
}): Promise<{ xdr: string }> {
  const { invoice, senderAddress } = params;

  const expectedIssuer =
    process.env.STELLAR_ASSET_ISSUER ??
    STELLAR_CONFIG.assets[invoice.assetCode]?.issuer;

  if (!expectedIssuer) {
    throw new PaymentVerificationError(
      "CONFIGURATION_ERROR",
      `Missing asset issuer configuration for ${invoice.assetCode}`
    );
  }

  // 1. Check sender account, trustline and balance
  let senderAccount: Horizon.AccountResponse;
  try {
    senderAccount = await horizonServer.loadAccount(senderAddress);
  } catch (err: unknown) {
    const status = (err as { response?: { status?: number } })?.response?.status;
    if (status === 404) {
      throw new PaymentVerificationError(
        "SENDER_NOT_FOUND",
        "Your connected Stellar Testnet account is not funded. Use Stellar Friendbot to fund it with test XLM first."
      );
    }
    throw new PaymentVerificationError(
      "HORIZON_ERROR",
      "Failed to load sender account from Stellar Horizon"
    );
  }

  const senderUsdc = senderAccount.balances.find(
    (b) =>
      b.asset_type !== "native" &&
      b.asset_code === invoice.assetCode &&
      b.asset_issuer === expectedIssuer
  );

  if (!senderUsdc) {
    throw new PaymentVerificationError(
      "SENDER_NO_TRUSTLINE",
      "Your connected wallet does not have a trustline for Testnet USDC. Click 'Add USDC Trustline' below to enable USDC."
    );
  }

  if (toStroops(senderUsdc.balance) < toStroops(invoice.amount)) {
    throw new PaymentVerificationError(
      "INSUFFICIENT_FUNDS",
      `Your wallet only has ${senderUsdc.balance} USDC, but this invoice is for ${invoice.amount} USDC. Get more testnet USDC from the Circle Testnet Faucet.`
    );
  }

  // 2. Check recipient account and trustline
  let recipientAccount: Horizon.AccountResponse;
  try {
    recipientAccount = await horizonServer.loadAccount(invoice.recipientAddress);
  } catch (err: unknown) {
    const status = (err as { response?: { status?: number } })?.response?.status;
    if (status === 404) {
      throw new PaymentVerificationError(
        "RECIPIENT_NOT_FOUND",
        `The recipient address (${invoice.recipientAddress}) does not exist on Stellar Testnet yet. It must be funded with test XLM via Stellar Friendbot.`
      );
    }
    throw new PaymentVerificationError(
      "HORIZON_ERROR",
      "Failed to load recipient account from Stellar Horizon"
    );
  }

  const recipientHasTrustline = recipientAccount.balances.some(
    (b) =>
      b.asset_type !== "native" &&
      b.asset_code === invoice.assetCode &&
      b.asset_issuer === expectedIssuer
  );

  if (!recipientHasTrustline) {
    throw new PaymentVerificationError(
      "RECIPIENT_NO_TRUSTLINE",
      `The recipient address (${invoice.recipientAddress}) has not added the USDC trustline on Stellar Testnet. In Stellar, the recipient must add the USDC trustline before they can receive USDC.`
    );
  }

  // 3. Build payment transaction
  const usdcAsset = new Asset(invoice.assetCode, expectedIssuer);

  const tx = new TransactionBuilder(senderAccount, {
    fee: "100000", // 0.01 XLM base fee
    networkPassphrase: STELLAR_CONFIG.networkPassphrase,
  })
    .addOperation(
      Operation.payment({
        destination: invoice.recipientAddress,
        asset: usdcAsset,
        amount: invoice.amount,
      })
    )
    .setTimeout(180)
    .build();

  return { xdr: tx.toXDR() };
}

/**
 * Submits a signed transaction XDR to Stellar Testnet Horizon.
 */
export async function submitTransactionToNetwork(
  signedTxXdr: string
): Promise<{ hash: string }> {
  try {
    const tx = TransactionBuilder.fromXDR(
      signedTxXdr,
      STELLAR_CONFIG.networkPassphrase
    );
    const result = await horizonServer.submitTransaction(tx);
    return { hash: result.hash };
  } catch (err: unknown) {
    const message = parseHorizonSubmissionError(err);
    throw new PaymentVerificationError("SUBMISSION_FAILED", message);
  }
}

/**
 * Independently queries Stellar Testnet Horizon to verify that a transaction:
 * 1. Exists and succeeded.
 * 2. Contains a payment operation matching the recipient, asset, and amount.
 */
export async function verifyStellarPayment(params: {
  transactionHash: string;
  expectedRecipient: string;
  expectedAmount: string;
  expectedAssetCode: SupportedAssetCode;
}): Promise<VerifiedPaymentResult> {
  const {
    transactionHash,
    expectedRecipient,
    expectedAmount,
    expectedAssetCode,
  } = params;

  const expectedIssuer =
    process.env.STELLAR_ASSET_ISSUER ??
    STELLAR_CONFIG.assets[expectedAssetCode]?.issuer;

  if (!expectedIssuer) {
    throw new PaymentVerificationError(
      "CONFIGURATION_ERROR",
      `Missing asset issuer configuration for ${expectedAssetCode}`
    );
  }

  // 1. Fetch transaction details from Horizon
  let tx: Horizon.ServerApi.TransactionRecord;
  try {
    tx = await horizonServer.transactions().transaction(transactionHash).call();
  } catch (err: unknown) {
    const status = (err as { response?: { status?: number } })?.response?.status;
    if (status === 404) {
      throw new PaymentVerificationError(
        "TRANSACTION_NOT_FOUND",
        "Transaction was not found on Stellar Testnet"
      );
    }
    throw new PaymentVerificationError(
      "HORIZON_ERROR",
      "Failed to communicate with Stellar Horizon"
    );
  }

  if (!tx.successful) {
    throw new PaymentVerificationError(
      "TRANSACTION_FAILED",
      "Transaction failed on Stellar Testnet"
    );
  }

  // 2. Fetch operations for this transaction
  let operationsPage: Horizon.ServerApi.CollectionPage<Horizon.ServerApi.OperationRecord>;
  try {
    operationsPage = await horizonServer
      .operations()
      .forTransaction(transactionHash)
      .call();
  } catch {
    throw new PaymentVerificationError(
      "HORIZON_ERROR",
      "Failed to fetch transaction operations from Stellar Horizon"
    );
  }

  const expectedStroops = toStroops(expectedAmount);

  // 3. Look for a matching payment operation
  for (const op of operationsPage.records) {
    if (op.type !== "payment") {
      continue;
    }

    const paymentOp = op as Horizon.ServerApi.PaymentOperationRecord;

    const matchesRecipient = paymentOp.to === expectedRecipient;
    const matchesAssetCode = paymentOp.asset_code === expectedAssetCode;
    const matchesIssuer = paymentOp.asset_issuer === expectedIssuer;
    const matchesAmount = toStroops(paymentOp.amount) === expectedStroops;

    if (matchesRecipient && matchesAssetCode && matchesIssuer && matchesAmount) {
      return {
        transactionHash: tx.hash,
        senderAddress: paymentOp.from,
        recipientAddress: paymentOp.to,
        amount: paymentOp.amount,
        assetCode: expectedAssetCode,
        assetIssuer: expectedIssuer,
        ledgerCloseTime: tx.created_at ?? null,
      };
    }
  }

  throw new PaymentVerificationError(
    "PAYMENT_MISMATCH",
    "No payment operation in this transaction matched the invoice recipient, asset, and exact amount"
  );
}
