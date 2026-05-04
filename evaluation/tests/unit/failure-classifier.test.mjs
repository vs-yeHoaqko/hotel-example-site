import assert from "node:assert/strict";
import test from "node:test";
import {
  classifyFailure,
  classifyFailureEvidence,
} from "../../lib/failure-classifier.mjs";

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

test("maps failure evidence into quality-gate diagnostic categories", () => {
  assert.equal(
    classifyFailureEvidence(
      { name: "smoke-e2e", failureClassification: "product" },
      {
        timedOut: false,
        stdout: "Error: expect(locator).toBeVisible()",
        stderr: "",
      },
    ).classification,
    "product_regression",
  );
  assert.equal(
    classifyFailureEvidence(
      { name: "unit", failureClassification: "test" },
      {
        timedOut: false,
        stdout: "ReferenceError: helper is not defined",
        stderr: "",
      },
    ).classification,
    "harness_bug",
  );
  assert.equal(
    classifyFailureEvidence(
      { name: "smoke-e2e", failureClassification: "product" },
      { timedOut: false, retry: 1, stdout: "retry passed", stderr: "" },
    ).classification,
    "flaky",
  );
  assert.equal(
    classifyFailureEvidence(
      { name: "custom" },
      { timedOut: false, stdout: "non-specific failure", stderr: "" },
    ).classification,
    "unknown",
  );
});
