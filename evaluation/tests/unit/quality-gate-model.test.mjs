import assert from "node:assert/strict";
import test from "node:test";
import {
  aggregateStatus,
  evaluateRequiredEvidence,
  evaluateThresholds,
  loadQualityGateConfig,
} from "../../lib/quality-gate-model.mjs";
import { createTempRepo, writeJson } from "../fixtures/run-health-fixtures.mjs";

test("validates quality gate config paths and thresholds", async () => {
  const repoRoot = await createTempRepo();
  await writeQualityGateConfig(repoRoot, {
    reportPath: "reports/quality-gate.md",
  });

  await assert.rejects(
    () => loadQualityGateConfig({ repoRoot }),
    /reportPath must stay under evaluation\//,
  );

  await writeQualityGateConfig(repoRoot, {
    thresholds: [
      {
        id: "bad",
        source: "test",
        metric: "metric",
        operator: "above",
        warnAt: 0,
        enforcement: "warn",
      },
    ],
  });

  await assert.rejects(
    () => loadQualityGateConfig({ repoRoot }),
    /operator must be max, min, or equals/,
  );
});

test("calculates threshold status for weak signals and coverage drops", () => {
  const findings = evaluateThresholds(
    [
      threshold({
        id: "weak",
        metric: "weakSignalTests",
        operator: "max",
        warnAt: 0,
      }),
      threshold({
        id: "tests",
        metric: "totalTests",
        operator: "min",
        warnAt: 136,
      }),
      threshold({
        id: "baseline",
        metric: "baselineRegressions",
        operator: "max",
        warnAt: 0,
        enforcement: "fail",
      }),
    ],
    {
      weakSignalTests: 2,
      totalTests: 130,
      baselineRegressions: 1,
    },
  );

  assert.deepEqual(
    findings.map((finding) => [finding.id, finding.status]),
    [
      ["weak", "warn"],
      ["tests", "warn"],
      ["baseline", "fail"],
    ],
  );
  assert.equal(aggregateStatus(findings), "fail");
});

test("reports missing metrics as warning-first findings", () => {
  const findings = evaluateThresholds(
    [threshold({ id: "missing", metric: "missingMetric" })],
    {},
  );

  assert.equal(findings[0].status, "warn");
  assert.match(findings[0].message, /unavailable/);
  assert.equal(aggregateStatus(findings), "warn");
});

test("validates required evidence policy", async () => {
  const repoRoot = await createTempRepo();
  await writeQualityGateConfig(repoRoot, {
    requiredEvidence: [
      {
        id: "bad",
        source: "summary",
        condition: "layer-passed",
        enforcement: "fail",
      },
    ],
  });

  await assert.rejects(
    () => loadQualityGateConfig({ repoRoot }),
    /layer must be set/,
  );
});

test("fails required evidence when latest summary is missing", () => {
  const findings = evaluateRequiredEvidence(
    [
      requiredEvidence({
        id: "latest-summary",
        condition: "latest-run-readable",
      }),
    ],
    null,
  );

  assert.equal(findings[0].status, "fail");
  assert.match(findings[0].message, /No readable latest evaluation summary/);
  assert.equal(aggregateStatus(findings), "fail");
});

test("fails required environment and smoke layers when they do not pass", () => {
  const findings = evaluateRequiredEvidence(
    [
      requiredEvidence({
        id: "environment-layer",
        condition: "layer-passed",
        layer: "environment",
      }),
      requiredEvidence({
        id: "smoke-e2e-layer",
        condition: "layer-passed",
        layer: "smoke-e2e",
      }),
    ],
    {
      runId: "run-a",
      mode: "gate",
      summaryPath: "evaluation/runs/run-a/summary.json",
      layers: [
        { name: "environment", status: "failed" },
        { name: "smoke-e2e", status: "skipped" },
      ],
    },
  );

  assert.deepEqual(
    findings.map((finding) => [finding.id, finding.status]),
    [
      ["environment-layer", "fail"],
      ["smoke-e2e-layer", "fail"],
    ],
  );
});

async function writeQualityGateConfig(repoRoot, overrides = {}) {
  await writeJson(repoRoot, "evaluation/config/quality-gate.config.json", {
    schemaVersion: 1,
    reportPath: "evaluation/reports/quality-gate.md",
    sources: {
      runHealthConfigPath: "evaluation/config/run-health.config.json",
      testMeaningfulnessConfigPath:
        "evaluation/config/test-meaningfulness.config.json",
      migrationCandidatesConfigPath:
        "evaluation/config/migration-candidates.config.json",
      thinningDecisionsConfigPath:
        "evaluation/config/thinning-decisions.config.json",
    },
    ciSummaryReportPath: "evaluation/reports/ci-gate-summary.md",
    thresholds: [threshold()],
    requiredEvidence: [requiredEvidence()],
    ...overrides,
  });
}

function threshold(overrides = {}) {
  return {
    id: "sample",
    source: "test",
    metric: "metric",
    operator: "max",
    warnAt: 0,
    enforcement: "warn",
    rationale: "Sample threshold.",
    ...overrides,
  };
}

function requiredEvidence(overrides = {}) {
  return {
    id: "latest-summary",
    source: "summary",
    condition: "latest-run-readable",
    modes: ["gate", "full", "collect-all"],
    enforcement: "fail",
    rationale: "Sample required evidence.",
    ...overrides,
  };
}
