import assert from "node:assert/strict";
import test from "node:test";
import { fromStroops, toStroops } from "./amounts.js";

test("toStroops converts whole numbers correctly", () => {
  assert.equal(toStroops("1"), 10000000n);
  assert.equal(toStroops("100"), 1000000000n);
  assert.equal(toStroops("0"), 0n);
});

test("toStroops converts fractional numbers up to 7 decimal places", () => {
  assert.equal(toStroops("0.1"), 1000000n);
  assert.equal(toStroops("0.01"), 100000n);
  assert.equal(toStroops("0.0000001"), 1n);
  assert.equal(toStroops("25.50"), 255000000n);
  assert.equal(toStroops("123.4567890"), 1234567890n);
});

test("fromStroops converts raw stroops back to decimal string", () => {
  assert.equal(fromStroops(10000000n), "1");
  assert.equal(fromStroops(1000000000n), "100");
  assert.equal(fromStroops(0n), "0");
  assert.equal(fromStroops(1000000n), "0.1");
  assert.equal(fromStroops(1n), "0.0000001");
  assert.equal(fromStroops(255000000n), "25.5");
});

test("roundtrip conversion is exact", () => {
  const values = ["1", "100", "0.5", "0.0000001", "25.75", "10000.1234567"];
  for (const v of values) {
    assert.equal(fromStroops(toStroops(v)), v);
  }
});
