import assert from "node:assert/strict";
import test from "node:test";
import { createGuidance } from "../../lib/diagnostic-guidance.mjs";

test("billing diagnostics point to billing product and evaluation files", () => {
  const guidance = createGuidance(
    diagnostic({
      layer: "unit",
      title: "calcTotalBill charges weekend surcharge",
      message: "Expected total bill to include weekend surcharge.",
      source: { path: "evaluation/tests/unit/billing.test.mjs", line: 12 },
    }),
  );

  assert.equal(guidance.action, "inspect_product");
  assert.equal(guidance.confidence, "high");
  assert.deepEqual(
    guidance.likelyTargets.map((target) => target.path),
    ["src/lib/billing.js", "evaluation/tests/unit/billing.test.mjs"],
  );
});

test("reservation validation diagnostics point to UI, helper, and locale data", () => {
  const guidance = createGuidance(
    diagnostic({
      layer: "integration",
      title: "reservation validation shows message",
      message: "Expected required guest validation message.",
      source: {
        path: "evaluation/tests/integration/reservation-form.spec.mjs",
        line: 42,
      },
    }),
  );

  assert.equal(guidance.action, "inspect_product");
  assert.equal(guidance.confidence, "high");
  assert.deepEqual(
    guidance.likelyTargets.map((target) => target.path),
    [
      "src/reserve.js",
      "src/lib/validation.js",
      "data/ja/message.json",
      "data/en-US/message.json",
    ],
  );
});

test("environment and timeout diagnostics produce environment guidance", () => {
  for (const classification of ["environment", "timeout"]) {
    const guidance = createGuidance(diagnostic({ classification }));

    assert.equal(guidance.action, "fix_environment");
    assert.equal(guidance.confidence, "high");
    assert.equal(guidance.likelyTargets[0].kind, "environment");
  }
});

test("timeout evidence produces environment guidance before product heuristics", () => {
  const guidance = createGuidance(
    diagnostic({
      layer: "smoke-e2e",
      classification: "product",
      title: "smoke completes one en-US reservation happy path",
      message: "Test timeout of 30000ms exceeded.",
    }),
  );

  assert.equal(guidance.action, "fix_environment");
  assert.equal(guidance.confidence, "high");
});

test("smoke journey diagnostics point to browser-flow evidence", () => {
  const guidance = createGuidance(
    diagnostic({
      layer: "smoke-e2e",
      title: "smoke completes one en-US reservation happy path",
      message: "Expected completion modal to be visible.",
      source: { path: "evaluation/tests/e2e/smoke.spec.mjs", line: 35 },
    }),
  );

  assert.equal(guidance.action, "inspect_product");
  assert.equal(guidance.confidence, "medium");
  assert.equal(guidance.likelyTargets[0].kind, "behavior_area");
  assert.equal(
    guidance.likelyTargets[1].path,
    "evaluation/tests/e2e/smoke.spec.mjs",
  );
});

test("unknown ownership remains low-confidence and artifact-first", () => {
  const guidance = createGuidance(
    diagnostic({
      classification: "unknown",
      layer: "custom",
      title: "custom layer failed",
      message: "Non-specific failure.",
    }),
  );

  assert.equal(guidance.action, "investigate_unknown");
  assert.equal(guidance.confidence, "low");
  assert.equal(guidance.likelyTargets[0].label, "Recorded failure evidence");
});

test("new diagnostic categories produce actionable guidance", () => {
  assert.equal(
    createGuidance(diagnostic({ classification: "flaky" })).action,
    "investigate_flaky",
  );
  assert.equal(
    createGuidance(diagnostic({ classification: "harness_bug" })).action,
    "inspect_test",
  );
  assert.equal(
    createGuidance(diagnostic({ classification: "product_regression" })).action,
    "inspect_product",
  );
});

function diagnostic(overrides = {}) {
  return {
    type: "layer_command",
    layer: "unit",
    ownerLayer: "unit",
    classification: "product",
    title: "diagnostic",
    source: null,
    message: "diagnostic message",
    ...overrides,
  };
}
