import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const billingSource = await readFile(
  new URL("../../../src/lib/billing.js", import.meta.url),
  "utf8",
);
const { calcTotalBill } = await import(
  `data:text/javascript;charset=utf-8,${encodeURIComponent(billingSource)}`
);

test("calcTotalBill charges the base room bill per guest per night", () => {
  const total = calcTotalBill(
    70,
    new Date(2026, 4, 4),
    2,
    3,
    false,
    false,
    false,
    10,
  );

  assert.equal(total, 420);
});

test("calcTotalBill adds weekend surcharge for weekend nights only", () => {
  const friday = new Date(2026, 4, 1);
  const total = calcTotalBill(100, friday, 3, 2, false, false, false, 10);

  assert.equal(total, 700);
});

test("calcTotalBill adds additional plans at the documented cardinality", () => {
  const total = calcTotalBill(
    100,
    new Date(2026, 4, 4),
    2,
    2,
    true,
    true,
    true,
    10,
  );

  assert.equal(total, 480);
});
