import assert from "node:assert/strict";
import test from "node:test";
import { renderCiGateSummaryReport } from "../../lib/ci-gate-summary-report.mjs";

test("renders result primary issue evidence and warnings", () => {
  const report = renderCiGateSummaryReport({
    metadata: {
      reportPath: "evaluation/reports/ci-gate-summary.md",
      generatedAt: "2026-01-01T00:00:00.000Z",
    },
    status: "fail",
    mode: "gate",
    target: "local",
    runId: "run-a",
    primaryIssue: {
      id: "environment-layer",
      kind: "missing_evidence",
      status: "fail",
      message: "environment layer status is failed.",
      recommendedAction: "Resolve the fail-enforced quality-gate finding.",
      evidencePath: null,
    },
    recommendedAction: "Resolve the fail-enforced quality-gate finding.",
    evidence: [
      { path: "evaluation/reports/quality-gate.md" },
      { path: "evaluation/reports/run-health.md" },
    ],
    warnings: ["evaluation/runs: no readable run summaries found"],
  });

  assert.match(report, /^# Evaluation Gate Summary/m);
  assert.match(report, /Status: `fail`/);
  assert.match(report, /Mode: `gate`/);
  assert.match(report, /environment-layer/);
  assert.match(report, /evaluation\/reports\/quality-gate\.md/);
  assert.match(report, /no readable run summaries/);
});
