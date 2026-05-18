import assert from "node:assert/strict";
import test from "node:test";
import {
  aggregateReadinessStatus,
  createReadinessFinding,
  validateAdapterReadiness,
} from "../../lib/harness-adapter-readiness.mjs";

test("orders aggregate status by blocked, warning, unknown, pass", () => {
  assert.equal(aggregateReadinessStatus([finding("unknown")]), "unknown");
  assert.equal(
    aggregateReadinessStatus([finding("warning"), finding("unknown")]),
    "warning",
  );
  assert.equal(
    aggregateReadinessStatus([finding("blocked"), finding("pass")]),
    "blocked",
  );
  assert.equal(aggregateReadinessStatus([finding("pass")]), "pass");
});

test("requires next action for non-pass findings", () => {
  assert.throws(
    () =>
      createReadinessFinding({
        id: "bad",
        status: "warning",
        stage: "validate",
        message: "Bad finding.",
      }),
    /nextAction/,
  );
});

test("blocks missing runnable layers and unignored artifacts", () => {
  const model = validateAdapterReadiness({
    ...state(),
    layers: [],
    artifacts: {
      runDirectory: {
        path: "evaluation/runs",
        source: "inferred",
        ignored: false,
      },
      reports: [],
    },
  });

  assert.equal(model.status, "blocked");
  assert.equal(hasFinding(model, "layers-none-runnable"), true);
  assert.equal(hasFinding(model, "artifact-run-directory-not-ignored"), true);
});

test("blocks browser layers without target policy", () => {
  const model = validateAdapterReadiness({
    ...state(),
    layers: [
      {
        name: "smoke-e2e",
        kind: "smoke-e2e",
        command: ["node", "test"],
        required: true,
        status: "confirmed",
        source: "confirmed",
      },
    ],
    targets: [],
  });

  assert.equal(model.status, "blocked");
  assert.equal(hasFinding(model, "browser-target-missing"), true);
});

test("keeps behavior mapping unknown and ownership weak-signal visible", () => {
  const model = validateAdapterReadiness(state());

  assert.equal(hasFinding(model, "behavior-mapping-unknown"), true);
  assert.equal(
    model.findings.find((item) => item.id === "behavior-mapping-unknown")
      .semantics,
    "unmapped",
  );
  assert.equal(hasFinding(model, "ownership-missing"), true);
});

test("accepts explicit local-only CI policy", () => {
  const model = validateAdapterReadiness(state());

  assert.equal(hasFinding(model, "ci-policy-recorded"), true);
  assert.equal(model.ciPolicy.mode, "local-only");
});

test("warns for inferred GitHub Actions and unreviewed fail-enforced policy", () => {
  const model = validateAdapterReadiness({
    ...state(),
    qualityPolicy: {
      status: "inferred",
      source: "inferred",
      enforcement: "fail-enforced",
    },
    ciPolicy: {
      mode: "github-actions",
      status: "inferred",
      source: "inferred",
      provider: "github-actions",
    },
  });

  assert.equal(
    hasFinding(model, "quality-policy-unreviewed-fail-enforced"),
    true,
  );
  assert.equal(hasFinding(model, "ci-policy-inferred-github-actions"), true);
});

function finding(status) {
  return createReadinessFinding({
    id: status,
    status,
    stage: "validate",
    message: status,
    nextAction: status === "pass" ? null : "Fix it.",
  });
}

function hasFinding(model, id) {
  return model.findings.some((finding) => finding.id === id);
}

function state(overrides = {}) {
  return {
    layers: [
      {
        name: "unit",
        kind: "unit",
        command: ["node", "--test", "evaluation/tests/unit"],
        required: true,
        status: "confirmed",
        source: "confirmed",
      },
    ],
    targets: [],
    artifacts: {
      runDirectory: {
        path: "evaluation/runs",
        source: "confirmed",
        ignored: true,
      },
      reports: [],
    },
    behaviorMapping: {
      status: "unknown",
      source: "deferred",
    },
    ownership: {
      status: "unknown",
      source: "deferred",
    },
    qualityPolicy: {
      status: "confirmed",
      source: "confirmed",
      enforcement: "warning-first",
    },
    ciPolicy: {
      mode: "local-only",
      status: "confirmed",
      source: "confirmed",
    },
    governance: {
      allowedEditBoundary: ["evaluation/"],
      rollback: "Remove adapter.",
      source: "confirmed",
    },
    ...overrides,
  };
}
