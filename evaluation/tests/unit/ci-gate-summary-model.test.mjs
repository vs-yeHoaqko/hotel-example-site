import assert from "node:assert/strict";
import test from "node:test";
import {
  createCiGateSummaryFromQualityGate,
  selectPrimaryIssue,
} from "../../lib/ci-gate-summary-model.mjs";
import { createTempRepo } from "../fixtures/run-health-fixtures.mjs";

test("selects fail-enforced required evidence as the primary issue", () => {
  const issue = selectPrimaryIssue({
    status: "fail",
    requiredEvidenceFindings: [
      finding({ id: "latest-summary", status: "fail" }),
    ],
    thresholdFindings: [finding({ id: "weak", status: "warn" })],
    baselineFindings: [],
    diagnosticFindings: [],
    thinningFindings: [],
  });

  assert.equal(issue.id, "latest-summary");
  assert.equal(issue.kind, "missing_evidence");
  assert.equal(issue.status, "fail");
});

test("creates summary model with unknown-safe fields", async () => {
  const repoRoot = await createTempRepo();
  const model = createCiGateSummaryFromQualityGate({
    repoRoot,
    qualityGate: {
      status: "pass",
      metadata: {
        reportPath: "evaluation/reports/quality-gate.md",
      },
      latestRun: null,
      evidenceSources: ["evaluation/reports/run-health.md"],
      requiredEvidenceFindings: [],
      thresholdFindings: [],
      baselineFindings: [],
      diagnosticFindings: [],
      thinningFindings: [],
      recommendedActions: ["No quality-gate follow-up is required."],
      warnings: [],
    },
  });

  assert.equal(model.status, "pass");
  assert.equal(model.mode, "unknown");
  assert.equal(model.target, "unknown");
  assert.equal(model.primaryIssue.id, "none");
  assert.deepEqual(
    model.evidence.map((item) => item.path),
    [
      "evaluation/reports/ci-gate-summary.md",
      "evaluation/reports/quality-gate.md",
      "evaluation/reports/feature-coverage-matrix.md",
      "evaluation/reports/run-health.md",
    ],
  );
  assert.match(model.warnings.join("\n"), /feature coverage matrix/);
});

test("prioritizes environment diagnostics before warning thresholds", () => {
  const issue = selectPrimaryIssue({
    status: "fail",
    requiredEvidenceFindings: [],
    thresholdFindings: [finding({ id: "weak", status: "warn" })],
    baselineFindings: [],
    diagnosticFindings: [
      {
        id: "environment-run-a",
        category: "environment",
        message: "environment failed",
        recommendedAction: "Fix environment first.",
        artifactPath: "evaluation/runs/run-a/artifacts/environment.json",
      },
    ],
    thinningFindings: [],
  });

  assert.equal(issue.id, "environment-run-a");
  assert.equal(issue.kind, "diagnostic");
  assert.equal(issue.status, "warn");
});

function finding(overrides = {}) {
  return {
    id: "sample",
    source: "sample",
    status: "pass",
    message: "sample",
    rationale: "sample",
    ...overrides,
  };
}
