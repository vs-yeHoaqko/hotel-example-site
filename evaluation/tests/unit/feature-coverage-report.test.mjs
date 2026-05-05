import assert from "node:assert/strict";
import test from "node:test";
import { renderFeatureCoverageReport } from "../../lib/feature-coverage-report.mjs";

test("renders required sections and matrix row evidence", () => {
  const report = renderFeatureCoverageReport({
    metadata: {
      command: "node evaluation/bin/generate-feature-coverage-matrix.mjs",
      configPath: "evaluation/config/feature-coverage.config.json",
      reportPath: "evaluation/reports/feature-coverage-matrix.md",
      generatedAt: "2026-01-01T00:00:00.000Z",
    },
    status: "warn",
    latestRun: {
      runId: "run-a",
      mode: "gate",
      target: "local",
      status: "passed",
      summaryPath: "evaluation/runs/run-a/summary.json",
    },
    summary: {
      totalRows: 1,
      byStatus: {
        pass: 0,
        fail: 0,
        warn: 1,
        unknown: 0,
      },
    },
    rows: [
      {
        label: "Login journey",
        category: "product-journey",
        locale: "en-US",
        ownerLayer: "root-e2e",
        status: "warn",
        evidence: [
          {
            kind: "latest-result",
            layer: "full-e2e",
            file: "en-US/login.spec.ts",
            status: "pass",
            count: 3,
            artifactPath:
              "evaluation/runs/run-a/artifacts/full-e2e-results.json",
          },
        ],
        notes: ["Latest evidence passed, but warning-level evidence applies."],
      },
    ],
    unmappedEvidence: [
      {
        layer: "harness-unit",
        file: "evaluation/tests/unit/report.test.mjs",
        status: "pass",
        note: "Harness-contract evidence is outside the product coverage mapping.",
      },
    ],
    warnings: ["sample warning"],
  });

  assert.match(report, /^# Feature Coverage Matrix/m);
  assert.match(report, /^## Metadata/m);
  assert.match(report, /^## Summary/m);
  assert.match(report, /^## Matrix/m);
  assert.match(report, /^## Unmapped Evidence/m);
  assert.match(report, /^## Warnings/m);
  assert.match(report, /Login journey/);
  assert.match(report, /latest-result:full-e2e:en-US\/login\.spec\.ts x3/);
  assert.match(report, /sample warning/);
});
