import assert from "node:assert/strict";
import test from "node:test";
import { renderHarnessAdapterReadinessReport } from "../../lib/harness-adapter-report.mjs";
import { validateAdapterReadiness } from "../../lib/harness-adapter-readiness.mjs";

test("renders blocked, warning, unknown, pass, CI policy, and non-goal sections", () => {
  const report = renderHarnessAdapterReadinessReport(
    validateAdapterReadiness({
      layers: [],
      targets: [],
      artifacts: {
        runDirectory: {
          path: "evaluation/runs",
          source: "inferred",
          ignored: false,
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
    }),
  );

  assert.match(report, /## Blocked Findings/);
  assert.match(report, /layers-none-runnable/);
  assert.match(report, /## Warning Findings/);
  assert.match(report, /## Unknown Findings/);
  assert.match(report, /## Passing Findings/);
  assert.match(report, /Mode: `local-only`/);
  assert.match(report, /Does not generate or edit GitHub Actions workflows/);
});

test("escapes table pipes in finding content", () => {
  const report = renderHarnessAdapterReadinessReport({
    metadata: {
      checkedAt: "2026-05-18T00:00:00.000Z",
      configPath: "config",
      reportPath: "report",
    },
    status: "blocked",
    stage: "validate",
    nextAction: "Fix A | B",
    ciPolicy: {
      mode: "local-only",
      status: "confirmed",
      source: "confirmed",
    },
    findings: [
      {
        id: "pipe",
        status: "blocked",
        stage: "validate",
        message: "A | B",
        evidence: ["field"],
        nextAction: "Fix A | B",
      },
    ],
    nonGoals: [],
  });

  assert.match(report, /A \\| B/);
});
