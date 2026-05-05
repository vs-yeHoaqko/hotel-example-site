import assert from "node:assert/strict";
import test from "node:test";
import { renderQualityGateReport } from "../../lib/quality-gate-report.mjs";

test("renders final status evidence sources findings and actions", () => {
  const report = renderQualityGateReport({
    metadata: {
      command: "node evaluation/bin/generate-quality-gate.mjs",
      configPath: "evaluation/config/quality-gate.config.json",
      reportPath: "evaluation/reports/quality-gate.md",
      checkedAt: "2026-01-01T00:00:00.000Z",
    },
    status: "warn",
    evidenceSources: [
      "evaluation/reports/run-health.md",
      "evaluation/reports/test-meaningfulness.md",
    ],
    metrics: {
      totalTests: 136,
      weakSignalTests: 1,
    },
    requiredEvidenceFindings: [
      finding({
        id: "environment-layer",
        source: "summary",
        status: "fail",
        message: "environment layer status is failed.",
      }),
    ],
    thresholdFindings: [
      finding({
        id: "weak-signal-tests",
        source: "test-meaningfulness",
        status: "warn",
        message: "weakSignalTests=1 breaches <= 0.",
      }),
    ],
    baselineFindings: [],
    diagnosticFindings: [
      {
        id: "environment-run-a",
        category: "environment",
        confidence: "high",
        message: "environment failed",
        recommendedAction: "fix_environment",
        artifactPath: "evaluation/runs/run-a/artifacts/environment.json",
      },
    ],
    thinningFindings: [],
    recommendedActions: ["Review warning or failure findings before merging."],
    warnings: [],
  });

  assert.match(report, /^# Evaluation Quality Gate Report/m);
  assert.match(report, /Status: `warn`/);
  assert.match(report, /Required Evidence Findings/);
  assert.match(report, /environment-layer/);
  assert.match(report, /weak-signal-tests/);
  assert.match(report, /environment-run-a/);
  assert.match(report, /Review warning or failure findings/);
  assert.match(report, /evaluation\/reports\/run-health\.md/);
});

function finding(overrides = {}) {
  return {
    id: "sample",
    source: "sample",
    status: "pass",
    message: "sample",
    ...overrides,
  };
}
