import assert from "node:assert/strict";
import test from "node:test";
import { renderRunHealthReport } from "../../lib/run-health-report.mjs";

test("renders required sections, source paths, warnings, and no-flaky wording", () => {
  const report = renderRunHealthReport(baseModel());

  assert.match(report, /^# Run Health Report/m);
  assert.match(report, /^## Metadata/m);
  assert.match(report, /^## Selected Runs/m);
  assert.match(report, /^## Slow Layers/m);
  assert.match(report, /^## Slow Tests/m);
  assert.match(report, /^## Instability Evidence/m);
  assert.match(report, /^## Environment Evidence/m);
  assert.match(report, /^## Warnings/m);
  assert.match(report, /^## Recommended Review Focus/m);
  assert.match(report, /`evaluation\/runs\/run-a\/summary\.json`/);
  assert.match(report, /`artifacts\/smoke-results\.json`/);
  assert.match(report, /No flaky evidence observed in selected runs\./);
  assert.match(report, /artifact missing/);
});

test("renders slow and environment evidence deterministically", () => {
  const model = baseModel({
    noFlakyEvidenceObserved: false,
    instabilityEvidence: [
      evidence({
        runId: "run-b",
        title: "failed validation",
        classification: "product",
      }),
    ],
    environmentEvidence: [
      evidence({
        runId: "run-a",
        title: "spawn EPERM",
        classification: "environment",
        messages: ["spawn EPERM"],
      }),
    ],
  });

  const first = renderRunHealthReport(model);
  const second = renderRunHealthReport(model);

  assert.equal(first, second);
  assert.match(first, /failed validation/);
  assert.match(first, /spawn EPERM/);
  assert.doesNotMatch(first, /No flaky evidence observed/);
});

function baseModel(overrides = {}) {
  return {
    metadata: {
      command: "node evaluation/bin/generate-run-health.mjs",
      configPath: "evaluation/config/run-health.config.json",
      runsDirectory: "evaluation/runs",
      reportPath: "evaluation/reports/run-health.md",
      maxRuns: 5,
      topSlowTests: 10,
      testSlowThresholdMs: 3000,
      layerThresholdsMs: {
        integration: 40000,
        "smoke-e2e": 30000,
      },
      selectedRunIds: ["run-a"],
    },
    selectedRuns: [
      {
        runId: "run-a",
        mode: "gate",
        target: "local",
        status: "passed",
        startedAt: "2026-01-01T00:00:00.000Z",
        finishedAt: "2026-01-01T00:00:01.000Z",
        repository: {
          dirty: false,
        },
        summaryPath: "evaluation/runs/run-a/summary.json",
      },
    ],
    slowLayers: [
      {
        runId: "run-a",
        name: "smoke-e2e",
        status: "passed",
        durationMs: 31000,
        thresholdMs: 30000,
        classification: null,
        artifacts: ["artifacts/smoke-results.json"],
      },
    ],
    slowTests: [
      {
        runId: "run-a",
        layer: "smoke-e2e",
        title: "reservation happy path",
        file: "smoke.spec.mjs",
        line: 35,
        project: "chromium",
        durationMs: 3200,
        status: "passed",
        retry: 0,
        artifactPath: "artifacts/smoke-results.json",
      },
    ],
    slowTestObservationCount: 1,
    instabilityEvidence: [],
    environmentEvidence: [],
    noFlakyEvidenceObserved: true,
    warnings: ["artifact missing"],
    recommendedReviewFocus: [
      "Review slow layers against configured thresholds.",
    ],
    ...overrides,
  };
}

function evidence(overrides = {}) {
  return {
    kind: "test",
    runId: "run-a",
    layer: "smoke-e2e",
    title: "evidence",
    file: "smoke.spec.mjs",
    status: "failed",
    retry: 0,
    durationMs: 1000,
    classification: "product",
    artifactPath: "artifacts/smoke-results.json",
    messages: [],
    ...overrides,
  };
}
