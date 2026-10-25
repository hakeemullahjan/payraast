import { Router } from "express";
import {
  INVOICE_STATUSES,
  buildTransactionSchema,
  createInvoiceSchema,
  submitPaymentSchema,
  verifyPaymentSchema,
  type ApiErrorBody,
  type InvoiceStatus,
  type PublicInvoice,
} from "@payraast/shared";
import type { InvoicesRepository } from "../invoices.js";
import {
  PaymentVerificationError,
  buildPaymentTransaction,
  buildTrustlineTransaction,
  submitTransactionToNetwork,
  verifyStellarPayment,
} from "../stellar.js";

const INVOICE_ID_REGEX = /^inv_[A-Za-z0-9_-]{12}$/;

export function apiError(code: string, message: string): ApiErrorBody {
  return { error: { code, message } };
}

export function createInvoicesRouter(invoices: InvoicesRepository): Router {
  const router = Router();

  router.post("/", (req, res) => {
    const parsed = createInvoiceSchema.safeParse(req.body);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      const field = issue?.path.join(".");
      const message = issue
        ? field
          ? `${field}: ${issue.message}`
          : issue.message
        : "Invalid invoice data";
      res.status(400).json(apiError("VALIDATION_ERROR", message));
      return;
    }
    res.status(201).json(invoices.create(parsed.data));
  });

  router.get("/", (req, res) => {
    const status = req.query.status;
    if (status === undefined) {
      res.json(invoices.list());
      return;
    }
    if (
      typeof status !== "string" ||
      !(INVOICE_STATUSES as readonly string[]).includes(status)
    ) {
      res
        .status(400)
        .json(
          apiError(
            "VALIDATION_ERROR",
            `status must be one of: ${INVOICE_STATUSES.join(", ")}`
          )
        );
      return;
    }
    res.json(invoices.list(status as InvoiceStatus));
  });

  router.get("/summary", (_req, res) => {
    res.json(invoices.summary());
  });

  router.get("/:id/public", (req, res) => {
    const invoice = INVOICE_ID_REGEX.test(req.params.id)
      ? invoices.getById(req.params.id)
      : null;
    if (!invoice) {
      res.status(404).json(apiError("INVOICE_NOT_FOUND", "Invoice not found"));
      return;
    }
    const { clientEmail: _clientEmail, ...publicInvoice } = invoice;
    res.json(publicInvoice satisfies PublicInvoice);
  });

  router.get("/:id", (req, res) => {
    const invoice = INVOICE_ID_REGEX.test(req.params.id)
      ? invoices.getById(req.params.id)
      : null;
    if (!invoice) {
      res.status(404).json(apiError("INVOICE_NOT_FOUND", "Invoice not found"));
      return;
    }
    res.json(invoice);
  });

  router.get("/:id/payment", (req, res) => {
    if (!INVOICE_ID_REGEX.test(req.params.id)) {
      res.status(404).json(apiError("INVOICE_NOT_FOUND", "Invoice not found"));
      return;
    }
    const payment = invoices.getPaymentByInvoiceId(req.params.id);
    if (!payment) {
      res
        .status(404)
        .json(apiError("PAYMENT_NOT_FOUND", "No payment found for this invoice"));
      return;
    }
    res.json(payment);
  });

  router.post("/:id/build-transaction", async (req, res) => {
    if (!INVOICE_ID_REGEX.test(req.params.id)) {
      res.status(404).json(apiError("INVOICE_NOT_FOUND", "Invoice not found"));
      return;
    }

    const parsed = buildTransactionSchema.safeParse(req.body);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      res
        .status(400)
        .json(
          apiError(
            "VALIDATION_ERROR",
            issue?.message ?? "Invalid sender address"
          )
        );
      return;
    }

    const invoice = invoices.getById(req.params.id);
    if (!invoice) {
      res.status(404).json(apiError("INVOICE_NOT_FOUND", "Invoice not found"));
      return;
    }

    if (invoice.status === "paid") {
      res
        .status(409)
        .json(apiError("INVOICE_ALREADY_PAID", "This invoice is already paid"));
      return;
    }

    if (invoice.status === "cancelled") {
      res
        .status(400)
        .json(
          apiError(
            "INVOICE_CANCELLED",
            "This invoice was cancelled and cannot be paid"
          )
        );
      return;
    }

    try {
      const { xdr } = await buildPaymentTransaction({
        invoice,
        senderAddress: parsed.data.senderAddress,
      });
      res.json({ xdr });
    } catch (err: unknown) {
      if (err instanceof PaymentVerificationError) {
        res.status(400).json(apiError(err.code, err.message));
        return;
      }
      console.error("Failed to build payment transaction:", err);
      res
        .status(500)
        .json(
          apiError(
            "BUILD_FAILED",
            "Failed to construct transaction on Stellar Testnet"
          )
        );
    }
  });

  router.post("/:id/submit-payment", async (req, res) => {
    if (!INVOICE_ID_REGEX.test(req.params.id)) {
      res.status(404).json(apiError("INVOICE_NOT_FOUND", "Invoice not found"));
      return;
    }

    const parsed = submitPaymentSchema.safeParse(req.body);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      res
        .status(400)
        .json(
          apiError(
            "VALIDATION_ERROR",
            issue?.message ?? "Invalid signed transaction"
          )
        );
      return;
    }

    const invoice = invoices.getById(req.params.id);
    if (!invoice) {
      res.status(404).json(apiError("INVOICE_NOT_FOUND", "Invoice not found"));
      return;
    }

    if (invoice.status === "paid") {
      res
        .status(409)
        .json(apiError("INVOICE_ALREADY_PAID", "This invoice is already paid"));
      return;
    }

    if (invoice.status === "cancelled") {
      res
        .status(400)
        .json(
          apiError(
            "INVOICE_CANCELLED",
            "This invoice was cancelled and cannot be paid"
          )
        );
      return;
    }

    try {
      // 1. Submit signed XDR to Stellar Horizon
      const { hash } = await submitTransactionToNetwork(
        parsed.data.signedTxXdr
      );

      // 2. Independently verify payment operation details on Stellar Horizon
      const verified = await verifyStellarPayment({
        transactionHash: hash,
        expectedRecipient: invoice.recipientAddress,
        expectedAmount: invoice.amount,
        expectedAssetCode: invoice.assetCode,
      });

      // 3. Atomically record payment and update invoice state
      const result = invoices.recordPayment({
        invoiceId: invoice.id,
        transactionHash: verified.transactionHash,
        amount: verified.amount,
        assetCode: verified.assetCode,
        assetIssuer: verified.assetIssuer,
        senderAddress: verified.senderAddress,
        recipientAddress: verified.recipientAddress,
        ledgerCloseTime: verified.ledgerCloseTime,
      });

      res.status(200).json(result);
    } catch (err: unknown) {
      if (err instanceof PaymentVerificationError) {
        res.status(400).json(apiError(err.code, err.message));
        return;
      }
      if (err instanceof Error && err.message === "TRANSACTION_ALREADY_USED") {
        res
          .status(409)
          .json(
            apiError(
              "TRANSACTION_ALREADY_USED",
              "This transaction has already been used to pay an invoice"
            )
          );
        return;
      }
      console.error("Payment submission failed:", err);
      res
        .status(500)
        .json(
          apiError(
            "SUBMISSION_FAILED",
            "Failed to submit or verify transaction on Stellar Testnet"
          )
        );
    }
  });

  router.post("/:id/verify-payment", async (req, res) => {
    if (!INVOICE_ID_REGEX.test(req.params.id)) {
      res.status(404).json(apiError("INVOICE_NOT_FOUND", "Invoice not found"));
      return;
    }

    const parsed = verifyPaymentSchema.safeParse(req.body);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      res
        .status(400)
        .json(
          apiError(
            "VALIDATION_ERROR",
            issue?.message ?? "Invalid transaction hash"
          )
        );
      return;
    }

    const invoice = invoices.getById(req.params.id);
    if (!invoice) {
      res.status(404).json(apiError("INVOICE_NOT_FOUND", "Invoice not found"));
      return;
    }

    if (invoice.status === "paid") {
      res
        .status(409)
        .json(apiError("INVOICE_ALREADY_PAID", "This invoice is already paid"));
      return;
    }

    if (invoice.status === "cancelled") {
      res
        .status(400)
        .json(
          apiError(
            "INVOICE_CANCELLED",
            "This invoice was cancelled and cannot be paid"
          )
        );
      return;
    }

    // Check if the transaction hash was already used
    const existingPayment = invoices.getPaymentByTxHash(
      parsed.data.transactionHash
    );
    if (existingPayment) {
      res
        .status(409)
        .json(
          apiError(
            "TRANSACTION_ALREADY_USED",
            "This transaction has already been used to pay an invoice"
          )
        );
      return;
    }

    try {
      // Independently verify on Stellar Testnet Horizon
      const verified = await verifyStellarPayment({
        transactionHash: parsed.data.transactionHash,
        expectedRecipient: invoice.recipientAddress,
        expectedAmount: invoice.amount,
        expectedAssetCode: invoice.assetCode,
      });

      // Record payment and transition invoice state atomically
      const result = invoices.recordPayment({
        invoiceId: invoice.id,
        transactionHash: verified.transactionHash,
        amount: verified.amount,
        assetCode: verified.assetCode,
        assetIssuer: verified.assetIssuer,
        senderAddress: verified.senderAddress,
        recipientAddress: verified.recipientAddress,
        ledgerCloseTime: verified.ledgerCloseTime,
      });

      res.status(200).json(result);
    } catch (err: unknown) {
      if (err instanceof PaymentVerificationError) {
        res.status(400).json(apiError(err.code, err.message));
        return;
      }
      if (err instanceof Error && err.message === "TRANSACTION_ALREADY_USED") {
        res
          .status(409)
          .json(
            apiError(
              "TRANSACTION_ALREADY_USED",
              "This transaction has already been used to pay an invoice"
            )
          );
        return;
      }
      console.error("Payment verification failed:", err);
      res
        .status(500)
        .json(
          apiError(
            "VERIFICATION_FAILED",
            "Failed to verify transaction on Stellar Testnet"
          )
        );
    }
  });

  router.post("/trustline/build", async (req, res) => {
    const address = req.body?.address;
    if (typeof address !== "string" || !address.trim()) {
      res.status(400).json(apiError("VALIDATION_ERROR", "address is required"));
      return;
    }
    try {
      const { xdr } = await buildTrustlineTransaction(address.trim());
      res.json({ xdr });
    } catch (err: unknown) {
      if (err instanceof PaymentVerificationError) {
        res.status(400).json(apiError(err.code, err.message));
        return;
      }
      res
        .status(500)
        .json(
          apiError("BUILD_FAILED", "Failed to build trustline transaction")
        );
    }
  });

  router.post("/trustline/submit", async (req, res) => {
    const signedTxXdr = req.body?.signedTxXdr;
    if (typeof signedTxXdr !== "string" || !signedTxXdr.trim()) {
      res
        .status(400)
        .json(apiError("VALIDATION_ERROR", "signedTxXdr is required"));
      return;
    }
    try {
      const { hash } = await submitTransactionToNetwork(signedTxXdr.trim());
      res.json({ hash });
    } catch (err: unknown) {
      if (err instanceof PaymentVerificationError) {
        res.status(400).json(apiError(err.code, err.message));
        return;
      }
      res
        .status(500)
        .json(
          apiError(
            "SUBMISSION_FAILED",
            "Failed to submit trustline transaction"
          )
        );
    }
  });

  return router;
}
