import { randomBytes } from "node:crypto";
import type { DatabaseSync } from "node:sqlite";
import type {
  CreateInvoiceInput,
  Invoice,
  InvoiceStatus,
  InvoiceSummary,
  Payment,
  PaymentVerificationStatus,
  SupportedAssetCode,
} from "@payraast/shared";
import { fromStroops, toStroops } from "./amounts.js";

interface InvoiceRow {
  id: string;
  client_name: string;
  client_email: string | null;
  project_title: string;
  description: string | null;
  amount: string;
  asset_code: string;
  recipient_address: string;
  due_date: string | null;
  status: string;
  created_at: string;
  paid_at: string | null;
}

interface PaymentRow {
  id: string;
  invoice_id: string;
  transaction_hash: string;
  amount: string;
  asset_code: string;
  asset_issuer: string;
  sender_address: string;
  recipient_address: string;
  verification_status: string;
  ledger_close_time: string | null;
  verified_at: string;
}

function toInvoice(row: InvoiceRow): Invoice {
  return {
    id: row.id,
    clientName: row.client_name,
    clientEmail: row.client_email,
    projectTitle: row.project_title,
    description: row.description,
    amount: row.amount,
    assetCode: row.asset_code as SupportedAssetCode,
    recipientAddress: row.recipient_address,
    dueDate: row.due_date,
    status: row.status as InvoiceStatus,
    createdAt: row.created_at,
    paidAt: row.paid_at,
  };
}

function toPayment(row: PaymentRow): Payment {
  return {
    id: row.id,
    invoiceId: row.invoice_id,
    transactionHash: row.transaction_hash,
    amount: row.amount,
    assetCode: row.asset_code as SupportedAssetCode,
    assetIssuer: row.asset_issuer,
    senderAddress: row.sender_address,
    recipientAddress: row.recipient_address,
    verificationStatus: row.verification_status as PaymentVerificationStatus,
    ledgerCloseTime: row.ledger_close_time,
    verifiedAt: row.verified_at,
  };
}

function newInvoiceId(): string {
  return `inv_${randomBytes(9).toString("base64url")}`;
}

function newPaymentId(): string {
  return `pay_${randomBytes(9).toString("base64url")}`;
}

export function createInvoicesRepository(db: DatabaseSync) {
  const insert = db.prepare(`
    INSERT INTO invoices (
      id, client_name, client_email, project_title, description, amount,
      asset_code, recipient_address, due_date, status, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)
  `);
  const selectById = db.prepare("SELECT * FROM invoices WHERE id = ?");
  const selectAll = db.prepare(
    "SELECT * FROM invoices ORDER BY created_at DESC, rowid DESC"
  );
  const selectByStatus = db.prepare(
    "SELECT * FROM invoices WHERE status = ? ORDER BY created_at DESC, rowid DESC"
  );
  const selectAmounts = db.prepare(
    "SELECT status, amount FROM invoices WHERE status IN ('pending', 'paid')"
  );
  const insertPayment = db.prepare(`
    INSERT INTO payments (
      id, invoice_id, transaction_hash, amount, asset_code, asset_issuer,
      sender_address, recipient_address, verification_status, ledger_close_time, verified_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'verified', ?, ?)
  `);
  const updateInvoicePaid = db.prepare(`
    UPDATE invoices SET status = 'paid', paid_at = ? WHERE id = ?
  `);
  const selectPaymentByInvoiceId = db.prepare(
    "SELECT * FROM payments WHERE invoice_id = ?"
  );
  const selectPaymentByTxHash = db.prepare(
    "SELECT * FROM payments WHERE transaction_hash = ?"
  );

  return {
    create(input: CreateInvoiceInput): Invoice {
      const id = newInvoiceId();
      insert.run(
        id,
        input.clientName,
        input.clientEmail ?? null,
        input.projectTitle,
        input.description || null,
        input.amount,
        input.assetCode,
        input.recipientAddress,
        input.dueDate ?? null,
        new Date().toISOString()
      );
      return this.getById(id)!;
    },

    getById(id: string): Invoice | null {
      const row = selectById.get(id) as InvoiceRow | undefined;
      return row ? toInvoice(row) : null;
    },

    list(status?: InvoiceStatus): Invoice[] {
      const rows = (
        status ? selectByStatus.all(status) : selectAll.all()
      ) as unknown as InvoiceRow[];
      return rows.map(toInvoice);
    },

    summary(): InvoiceSummary {
      const rows = selectAmounts.all() as unknown as Pick<
        InvoiceRow,
        "status" | "amount"
      >[];
      let paidCount = 0;
      let pendingCount = 0;
      let paidTotal = 0n;
      let pendingTotal = 0n;
      for (const row of rows) {
        if (row.status === "paid") {
          paidCount += 1;
          paidTotal += toStroops(row.amount);
        } else {
          pendingCount += 1;
          pendingTotal += toStroops(row.amount);
        }
      }
      const total = (
        db.prepare("SELECT COUNT(*) AS count FROM invoices").get() as {
          count: number;
        }
      ).count;
      return {
        totalInvoices: total,
        paidInvoices: paidCount,
        pendingInvoices: pendingCount,
        totalPaidAmount: fromStroops(paidTotal),
        totalPendingAmount: fromStroops(pendingTotal),
      };
    },

    getPaymentByInvoiceId(invoiceId: string): Payment | null {
      const row = selectPaymentByInvoiceId.get(invoiceId) as
        | PaymentRow
        | undefined;
      return row ? toPayment(row) : null;
    },

    getPaymentByTxHash(txHash: string): Payment | null {
      const row = selectPaymentByTxHash.get(txHash) as PaymentRow | undefined;
      return row ? toPayment(row) : null;
    },

    recordPayment(params: {
      invoiceId: string;
      transactionHash: string;
      amount: string;
      assetCode: SupportedAssetCode;
      assetIssuer: string;
      senderAddress: string;
      recipientAddress: string;
      ledgerCloseTime: string | null;
    }): { invoice: Invoice; payment: Payment } {
      const existing = selectPaymentByTxHash.get(params.transactionHash);
      if (existing) {
        throw new Error("TRANSACTION_ALREADY_USED");
      }

      const invoice = this.getById(params.invoiceId);
      if (!invoice) {
        throw new Error("INVOICE_NOT_FOUND");
      }
      if (invoice.status === "paid") {
        throw new Error("INVOICE_ALREADY_PAID");
      }
      if (invoice.status === "cancelled") {
        throw new Error("INVOICE_CANCELLED");
      }

      const paymentId = newPaymentId();
      const verifiedAt = new Date().toISOString();

      db.exec("BEGIN IMMEDIATE;");
      try {
        insertPayment.run(
          paymentId,
          params.invoiceId,
          params.transactionHash,
          params.amount,
          params.assetCode,
          params.assetIssuer,
          params.senderAddress,
          params.recipientAddress,
          params.ledgerCloseTime,
          verifiedAt
        );
        updateInvoicePaid.run(verifiedAt, params.invoiceId);
        db.exec("COMMIT;");
      } catch (err) {
        db.exec("ROLLBACK;");
        throw err;
      }

      return {
        invoice: this.getById(params.invoiceId)!,
        payment: this.getPaymentByInvoiceId(params.invoiceId)!,
      };
    },
  };
}

export type InvoicesRepository = ReturnType<typeof createInvoicesRepository>;
