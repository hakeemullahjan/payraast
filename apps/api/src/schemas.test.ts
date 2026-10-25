import assert from "node:assert/strict";
import test from "node:test";
import {
  amountSchema,
  createInvoiceSchema,
  stellarPublicKeySchema,
  transactionHashSchema,
} from "@payraast/shared";
import { openDatabase } from "./db.js";
import { createInvoicesRepository } from "./invoices.js";

test("stellarPublicKeySchema validates valid and invalid addresses", () => {
  const validKey = "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5";
  assert.equal(stellarPublicKeySchema.safeParse(validKey).success, true);

  // Invalid: too short
  assert.equal(stellarPublicKeySchema.safeParse("G123").success, false);
  // Invalid: starts with S (secret seed)
  assert.equal(
    stellarPublicKeySchema.safeParse(
      "SBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5"
    ).success,
    false
  );
  // Invalid: lowercase
  assert.equal(stellarPublicKeySchema.safeParse(validKey.toLowerCase()).success, false);
});

test("amountSchema validates financial amount limits", () => {
  assert.equal(amountSchema.safeParse("10").success, true);
  assert.equal(amountSchema.safeParse("0.5").success, true);
  assert.equal(amountSchema.safeParse("0.0000001").success, true);

  // Rejects 0 or negative
  assert.equal(amountSchema.safeParse("0").success, false);
  assert.equal(amountSchema.safeParse("-5").success, false);

  // Rejects > 7 decimals
  assert.equal(amountSchema.safeParse("1.12345678").success, false);

  // Rejects non-numbers
  assert.equal(amountSchema.safeParse("abc").success, false);
});

test("transactionHashSchema validates 64 hex characters", () => {
  const validHash = "a".repeat(64);
  assert.equal(transactionHashSchema.safeParse(validHash).success, true);

  // Invalid length
  assert.equal(transactionHashSchema.safeParse("a".repeat(63)).success, false);
  assert.equal(transactionHashSchema.safeParse("a".repeat(65)).success, false);

  // Invalid chars
  assert.equal(transactionHashSchema.safeParse("g".repeat(64)).success, false);
});

test("invoices repository enforces replay attack protection", () => {
  const db = openDatabase(":memory:");
  const repo = createInvoicesRepository(db);

  const invoice = repo.create({
    clientName: "Test Client",
    projectTitle: "Test Project",
    amount: "50",
    assetCode: "USDC",
    recipientAddress: "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5",
  });

  const txHash = "f".repeat(64);

  // First payment records successfully
  const result = repo.recordPayment({
    invoiceId: invoice.id,
    transactionHash: txHash,
    amount: "50",
    assetCode: "USDC",
    assetIssuer: "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5",
    senderAddress: "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5",
    recipientAddress: invoice.recipientAddress,
    ledgerCloseTime: new Date().toISOString(),
  });

  assert.equal(result.invoice.status, "paid");
  assert.equal(result.payment.transactionHash, txHash);

  // Replaying the exact same transaction hash must throw
  const anotherInvoice = repo.create({
    clientName: "Client 2",
    projectTitle: "Project 2",
    amount: "50",
    assetCode: "USDC",
    recipientAddress: "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5",
  });

  assert.throws(
    () => {
      repo.recordPayment({
        invoiceId: anotherInvoice.id,
        transactionHash: txHash, // Reused!
        amount: "50",
        assetCode: "USDC",
        assetIssuer: "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5",
        senderAddress: "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5",
        recipientAddress: anotherInvoice.recipientAddress,
        ledgerCloseTime: new Date().toISOString(),
      });
    },
    /TRANSACTION_ALREADY_USED/
  );
});
