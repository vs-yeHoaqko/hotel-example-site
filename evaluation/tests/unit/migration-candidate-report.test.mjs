import assert from "node:assert/strict";
import test from "node:test";
import { renderMigrationCandidateReport } from "../../lib/migration-candidate-report.mjs";

test("renders thinning outcome sections with retained reason text", () => {
  const report = renderMigrationCandidateReport(model([candidate()]));

  assert.match(report, /## Thinning Outcome Counts/);
  assert.match(report, /- `retained`: 1/);
  assert.match(report, /- Thinning outcome: `retained`/);
  assert.match(
    report,
    /- Decision reason: Reviewed and intentionally left in root E2E\./,
  );
  assert.match(
    report,
    /- Decision remaining E2E coverage: Keep representative browser-flow coverage\./,
  );
  assert.match(report, /- Outside files: `e2e\/en-US\/reserve\.spec\.ts`/);
  assert.match(report, /- Conflict risk: `medium`/);
});

test("renders no inventory warnings when inventory is current", () => {
  const report = renderMigrationCandidateReport(model([candidate()]));

  assert.match(report, /## Inventory Warnings\n\n- None/);
});

test("renders every candidate decision outcome deterministically", () => {
  const report = renderMigrationCandidateReport(
    model([
      candidate({
        candidateId: "ready-thinned",
        thinningDecision: {
          ...decision(),
          candidateId: "ready-thinned",
          outcome: "thinned",
          reason: "Lower-layer evidence owns this detailed assertion.",
        },
      }),
      candidate(),
    ]),
  );

  assert.match(
    report,
    /#### `ready-thinned`[\s\S]*- Thinning outcome: `thinned`/,
  );
  assert.match(
    report,
    /#### `ready-retained`[\s\S]*- Thinning outcome: `retained`/,
  );
});

function model(candidates) {
  return {
    metadata: {
      command: "node evaluation/bin/generate-migration-candidates.mjs",
      scope: "reservation-billing",
      sourceCandidates: "evaluation/config/migration-candidates.config.json",
      thinningDecisionSource:
        "evaluation/config/thinning-decisions.config.json",
      ownershipSource: "evaluation/lib/ownership.mjs",
      inventorySource: "e2e/**/*.spec.ts",
      reportPath: "evaluation/reports/migration-candidates.md",
    },
    counts: {
      ready_to_thin: 1,
      blocked_missing_lower_layer: 0,
      keep_e2e: 0,
    },
    thinningDecisionCounts: {
      thinned: candidates.filter(
        (candidate) => candidate.thinningDecision.outcome === "thinned",
      ).length,
      retained: candidates.filter(
        (candidate) => candidate.thinningDecision.outcome === "retained",
      ).length,
      deferred: candidates.filter(
        (candidate) => candidate.thinningDecision.outcome === "deferred",
      ).length,
      keep_e2e: candidates.filter(
        (candidate) => candidate.thinningDecision.outcome === "keep_e2e",
      ).length,
    },
    groups: [
      {
        behavior: "Reservation form page-local state and validation",
        ownerLayer: "integration",
        ownershipEvidence: "Integration tests own page-local behavior.",
        candidates,
      },
    ],
    inventoryWarnings: [],
    candidates,
  };
}

function candidate(overrides = {}) {
  return {
    candidateId: "ready-retained",
    status: "ready_to_thin",
    path: "e2e/en-US/reserve.spec.ts",
    line: 10,
    ordinal: 0,
    sourceTitle: "sample title",
    assertionScope: "sample assertion scope",
    behaviorSummary: "Sample behavior summary.",
    currentLayer: "e2e",
    proposedOwnerLayer: "integration",
    lowerLayerEvidence: [
      "evaluation/tests/integration/reservation-form.spec.mjs",
    ],
    remainingE2ECoverage: "Keep representative browser-flow coverage.",
    recommendation: "Thin after review.",
    thinningDecision: decision(),
    ...overrides,
  };
}

function decision() {
  return {
    candidateId: "ready-retained",
    outcome: "retained",
    reason: "Reviewed and intentionally left in root E2E.",
    ownerLayer: "integration",
    lowerLayerEvidence: [
      "evaluation/tests/integration/reservation-form.spec.mjs",
    ],
    remainingE2ECoverage: "Keep representative browser-flow coverage.",
    outsideFiles: ["e2e/en-US/reserve.spec.ts"],
    conflictRisk: "medium",
    notes: [],
  };
}
