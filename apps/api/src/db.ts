import { mkdirSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

const SCHEMA = `
CREATE TABLE IF NOT EXISTS invoices (
  id                TEXT PRIMARY KEY,
  client_name       TEXT NOT NULL,
  client_email      TEXT,
  project_title     TEXT NOT NULL,
  description       TEXT,
  amount            TEXT NOT NULL,
  asset_code        TEXT NOT NULL,
  recipient_address TEXT NOT NULL,
  due_date          TEXT,
  status            TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'paid', 'cancelled')),
  created_at        TEXT NOT NULL,
  paid_at           TEXT
);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON invoices(created_at);

CREATE TABLE IF NOT EXISTS payments (
  id                  TEXT PRIMARY KEY,
  invoice_id          TEXT NOT NULL UNIQUE,
  transaction_hash    TEXT NOT NULL UNIQUE,
  amount              TEXT NOT NULL,
  asset_code          TEXT NOT NULL,
  asset_issuer        TEXT NOT NULL,
  sender_address      TEXT NOT NULL,
  recipient_address   TEXT NOT NULL,
  verification_status TEXT NOT NULL DEFAULT 'verified'
                      CHECK (verification_status IN ('verified')),
  ledger_close_time   TEXT,
  verified_at         TEXT NOT NULL,
  FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE RESTRICT
);
CREATE INDEX IF NOT EXISTS idx_payments_transaction_hash ON payments(transaction_hash);
CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON payments(invoice_id);
`;

export function openDatabase(file: string): DatabaseSync {
  if (file !== ":memory:") {
    mkdirSync(path.dirname(path.resolve(file)), { recursive: true });
  }
  const db = new DatabaseSync(file);
  db.exec("PRAGMA journal_mode = WAL;");
  db.exec("PRAGMA foreign_keys = ON;");
  db.exec(SCHEMA);
  return db;
}
