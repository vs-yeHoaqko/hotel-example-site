import assert from "node:assert/strict";
import test from "node:test";
import {
  aggregateStatus,
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
    thresholds: [threshold()],
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
