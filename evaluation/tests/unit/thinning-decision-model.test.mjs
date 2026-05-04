import assert from "node:assert/strict";
import test from "node:test";
import {
  attachThinningDecisions,
  countThinningOutcomes,
  validateThinningDecisionSet,
} from "../../lib/thinning-decision-model.mjs";

test("validates and sorts thinned, retained, deferred, and keep_e2e outcomes", () => {
  const decisionSet = validateThinningDecisionSet(
    decisionConfig([
      decision({
        candidateId: "ready-retained",
        outcome: "retained",
        reason: "Reviewed and intentionally left in root E2E.",
      }),
      decision({
        candidateId: "keep-journey",
        outcome: "keep_e2e",
        ownerLayer: "e2e",
      }),
      decision({
        candidateId: "ready-deferred",
        outcome: "deferred",
        reason: "Lower-layer evidence was not specific enough.",
      }),
      decision({ candidateId: "ready-thinned" }),
    ]),
    { candidates: sampleCandidates() },
  );

  assert.deepEqual(
    decisionSet.decisions.map((item) => item.candidateId),
    ["keep-journey", "ready-deferred", "ready-retained", "ready-thinned"],
  );
  assert.deepEqual(countThinningOutcomes(decisionSet.decisions), {
    thinned: 1,
    retained: 1,
    deferred: 1,
    keep_e2e: 1,
  });
});

test("attaches thinning decisions to migration candidates", () => {
  const decisionSet = validateThinningDecisionSet(
    decisionConfig([
      decision({ candidateId: "ready-thinned" }),
      decision({
        candidateId: "ready-retained",
        outcome: "retained",
        reason: "Reviewed and intentionally left in root E2E.",
      }),
      decision({
        candidateId: "ready-deferred",
        outcome: "deferred",
        reason: "Lower-layer evidence was not specific enough.",
      }),
      decision({
        candidateId: "keep-journey",
        outcome: "keep_e2e",
        ownerLayer: "e2e",
      }),
    ]),
    { candidates: sampleCandidates() },
  );

  const candidates = attachThinningDecisions(sampleCandidates(), decisionSet);

  assert.equal(candidates[0].thinningDecision.outcome, "thinned");
  assert.equal(candidates[1].thinningDecision.outcome, "retained");
});

test("rejects thinned outcomes without lower-layer evidence", () => {
  assert.throws(
    () =>
      validateThinningDecisionSet(
        decisionConfig([
          decision({
            candidateId: "ready-thinned",
            lowerLayerEvidence: [],
          }),
          decision({
            candidateId: "ready-retained",
            outcome: "retained",
            reason: "Reviewed and intentionally left in root E2E.",
          }),
          decision({
            candidateId: "ready-deferred",
            outcome: "deferred",
            reason: "Lower-layer evidence was not specific enough.",
          }),
          decision({
            candidateId: "keep-journey",
            outcome: "keep_e2e",
            ownerLayer: "e2e",
          }),
        ]),
        { candidates: sampleCandidates() },
      ),
    /outcome "thinned" requires lowerLayerEvidence/,
  );
});

test("requires every reviewed ready_to_thin and keep_e2e candidate to have a decision", () => {
  assert.throws(
    () =>
      validateThinningDecisionSet(decisionConfig([decision()]), {
        candidates: sampleCandidates(),
      }),
    /missing thinning decision for candidateId "ready-retained"/,
  );
});

test("rejects duplicate decisions and unapproved outside files", () => {
  assert.throws(
    () =>
      validateThinningDecisionSet(
        decisionConfig([
          decision({ candidateId: "ready-thinned" }),
          decision({
            candidateId: "ready-thinned",
            outsideFiles: ["src/main.js"],
          }),
        ]),
        { candidates: [sampleCandidates()[0]] },
      ),
    /duplicate candidateId.*outsideFiles may only contain reviewed root reservation E2E files/s,
  );
});

function sampleCandidates() {
  return [
    candidate("ready-thinned"),
    candidate("ready-retained"),
    candidate("ready-deferred"),
    candidate("keep-journey", {
      status: "keep_e2e",
      proposedOwnerLayer: "e2e",
      lowerLayerEvidence: ["evaluation/tests/e2e/smoke.spec.mjs"],
    }),
  ];
}

function candidate(candidateId, overrides = {}) {
  return {
    candidateId,
    path: "e2e/en-US/reserve.spec.ts",
    ordinal: 0,
    assertionScope: `${candidateId} scope`,
    behavior: "Reservation form page-local state and validation",
    behaviorSummary: "Sample behavior",
    currentLayer: "e2e",
    proposedOwnerLayer: "integration",
    status: "ready_to_thin",
    lowerLayerEvidence: [
      "evaluation/tests/integration/reservation-form.spec.mjs",
    ],
    remainingE2ECoverage: "Keep representative browser-flow coverage.",
    recommendation: "Thin after review.",
    ...overrides,
  };
}

function decision(overrides = {}) {
  return {
    candidateId: "ready-thinned",
    outcome: "thinned",
    reason: "Lower-layer evidence owns this detailed assertion.",
    rootE2EPath: "e2e/en-US/reserve.spec.ts",
    assertionScope: "sample scope",
    ownerLayer: "integration",
    lowerLayerEvidence: [
      "evaluation/tests/integration/reservation-form.spec.mjs",
    ],
    remainingE2ECoverage: "Keep representative browser-flow coverage.",
    outsideFiles: ["e2e/en-US/reserve.spec.ts"],
    conflictRisk: "medium",
    notes: [],
    ...overrides,
  };
}

function decisionConfig(decisions) {
  return {
    schemaVersion: 1,
    scope: "reservation-billing",
    sourceCandidates: "evaluation/config/migration-candidates.config.json",
    decisions,
  };
}
