import assert from "node:assert/strict";
import test from "node:test";
import { classifyFailure } from "../../lib/failure-classifier.mjs";

test("Playwright test timeouts are classified before layer defaults", () => {
  const classification = classifyFailure(
    {
      name: "smoke-e2e",
      failureClassification: "product",
    },
    {
      timedOut: false,
      startError: null,
      stdout: "Test timeout of 30000ms exceeded.",
      stderr: "",
    },
  );

  assert.equal(classification, "timeout");
});
