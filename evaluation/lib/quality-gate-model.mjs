import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  normalizeEvaluationPath,
  removeUndefined,
  stringOrDefault,
} from "./run-health-common.mjs";
import { createMigrationCandidateModel } from "./migration-candidate-model.mjs";
import { createRunHealthModel } from "./run-health-model.mjs";
import { createTestMeaningfulnessModel } from "./test-meaningfulness-model.mjs";
import { createThinningExecutionSummary } from "./thinning-decision-model.mjs";

export const DEFAULT_QUALITY_GATE_CONFIG_PATH =
  "evaluation/config/quality-gate.config.json";

const STATUS_ORDER = ["pass", "warn", "fail"];

export async function createQualityGateModel({
  repoRoot = process.cwd(),
  configPath = DEFAULT_QUALITY_GATE_CONFIG_PATH,
  reportPath,
} = {}) {
  const config = await loadQualityGateConfig({
    repoRoot,
    configPath,
    overrides: { reportPath },
  });
  const warnings = [];
  const runHealth = await createRunHealthModel({
    repoRoot,
    configPath: config.sources.runHealthConfigPath,
  });
  const testMeaningfulness = await createTestMeaningfulnessModel({
    repoRoot,
    configPath: config.sources.testMeaningfulnessConfigPath,
  });
  const migrationCandidates = await createMigrationCandidateModel({
    repoRoot,
    configPath: config.sources.migrationCandidatesConfigPath,
    decisionConfigPath: config.sources.thinningDecisionsConfigPath,
  });
  const thinningExecution = createThinningExecutionSummary(
    migrationCandidates.candidates,
  );
  const diagnosticFindings = createDiagnosticFindings(runHealth);
  const metrics = createQualityMetrics({
    runHealth,
    testMeaningfulness,
    thinningExecution,
    diagnosticFindings,
  });
  const thresholdFindings = evaluateThresholds(config.thresholds, metrics);
  const allFindings = [
    ...thresholdFindings,
    ...createBaselineFindings(runHealth.baselineComparison),
    ...createDiagnosticQualityFindings(diagnosticFindings),
    ...createThinningQualityFindings(thinningExecution),
  ];
  const status = aggregateStatus(allFindings);

  return {
    metadata: {
      command: "node evaluation/bin/generate-quality-gate.mjs",
      configPath: config.configPath,
      reportPath: config.reportPath,
      checkedAt: new Date().toISOString(),
    },
    status,
    evidenceSources: [
      runHealth.metadata.reportPath,
      testMeaningfulness.metadata.reportPath,
      migrationCandidates.metadata.reportPath,
      migrationCandidates.metadata.thinningExecutionReportPath,
    ],
    metrics,
    thresholdFindings,
    baselineFindings: createBaselineFindings(runHealth.baselineComparison),
    diagnosticFindings,
    thinningFindings: createThinningQualityFindings(thinningExecution),
    recommendedActions: createRecommendedActions({
      status,
      allFindings,
      runHealth,
    }),
    warnings: [
      ...warnings,
      ...runHealth.warnings,
      ...testMeaningfulness.warnings,
    ],
  };
}

export async function loadQualityGateConfig({
  repoRoot = process.cwd(),
  configPath = DEFAULT_QUALITY_GATE_CONFIG_PATH,
  overrides = {},
} = {}) {
  const normalizedConfigPath = normalizeEvaluationPath({
    repoRoot,
    inputPath: configPath,
    fieldName: "configPath",
  });
  const rawConfig = JSON.parse(
    await readFile(path.resolve(repoRoot, normalizedConfigPath), "utf8"),
  );
  const config = {
    ...rawConfig,
    ...removeUndefined(overrides),
    configPath: normalizedConfigPath,
  };

  if (config.schemaVersion !== 1) {
    throw new Error("quality-gate config schemaVersion must be 1");
  }
  if (!config.sources || typeof config.sources !== "object") {
    throw new Error("quality-gate sources must be an object");
  }
  if (!Array.isArray(config.thresholds)) {
    throw new Error("quality-gate thresholds must be an array");
  }

  return {
    schemaVersion: 1,
    configPath: normalizedConfigPath,
    reportPath: normalizeEvaluationPath({
      repoRoot,
      inputPath: config.reportPath,
      fieldName: "reportPath",
    }),
    sources: {
      runHealthConfigPath: normalizeEvaluationPath({
        repoRoot,
        inputPath: config.sources.runHealthConfigPath,
        fieldName: "sources.runHealthConfigPath",
      }),
      testMeaningfulnessConfigPath: normalizeEvaluationPath({
        repoRoot,
        inputPath: config.sources.testMeaningfulnessConfigPath,
        fieldName: "sources.testMeaningfulnessConfigPath",
      }),
      migrationCandidatesConfigPath: normalizeEvaluationPath({
        repoRoot,
        inputPath: config.sources.migrationCandidatesConfigPath,
        fieldName: "sources.migrationCandidatesConfigPath",
      }),
      thinningDecisionsConfigPath: normalizeEvaluationPath({
        repoRoot,
        inputPath: config.sources.thinningDecisionsConfigPath,
        fieldName: "sources.thinningDecisionsConfigPath",
      }),
    },
    thresholds: config.thresholds.map(validateThreshold),
  };
}

export function evaluateThresholds(thresholds, metrics) {
  return thresholds.map((threshold) => {
    const actual = metrics[threshold.metric];
    if (typeof actual !== "number") {
      return {
        id: threshold.id,
        source: threshold.source,
        metric: threshold.metric,
        status: threshold.enforcement === "fail" ? "fail" : "warn",
        actual: null,
        expected: describeThreshold(threshold),
        message: `Metric "${threshold.metric}" is unavailable.`,
        rationale: threshold.rationale,
      };
    }

    const breached = isThresholdBreached(threshold, actual);
    return {
      id: threshold.id,
      source: threshold.source,
      metric: threshold.metric,
      status: breached
        ? threshold.enforcement === "fail"
          ? "fail"
          : "warn"
        : "pass",
      actual,
      expected: describeThreshold(threshold),
      message: breached
        ? `${threshold.metric}=${actual} breaches ${describeThreshold(threshold)}.`
        : `${threshold.metric}=${actual} is within ${describeThreshold(threshold)}.`,
      rationale: threshold.rationale,
    };
  });
}

export function aggregateStatus(findings) {
  if (findings.some((finding) => finding.status === "fail")) {
    return "fail";
  }
  if (findings.some((finding) => finding.status === "warn")) {
    return "warn";
  }
  return "pass";
}

function validateThreshold(threshold, index) {
  const label = `thresholds[${index}]`;
  for (const key of ["id", "source", "metric", "operator", "enforcement"]) {
    if (!threshold[key] || typeof threshold[key] !== "string") {
      throw new Error(`${label}.${key} must be a non-empty string`);
    }
  }
  if (!["max", "min", "equals"].includes(threshold.operator)) {
    throw new Error(`${label}.operator must be max, min, or equals`);
  }
  if (!["warn", "fail"].includes(threshold.enforcement)) {
    throw new Error(`${label}.enforcement must be warn or fail`);
  }
  const expectedValue = threshold.warnAt ?? threshold.failAt;
  if (typeof expectedValue !== "number" || !Number.isFinite(expectedValue)) {
    throw new Error(`${label} must define numeric warnAt or failAt`);
  }
  return {
    id: threshold.id,
    source: threshold.source,
    metric: threshold.metric,
    operator: threshold.operator,
    warnAt: threshold.warnAt,
    failAt: threshold.failAt,
    enforcement: threshold.enforcement,
    rationale: stringOrDefault(threshold.rationale, ""),
  };
}

function isThresholdBreached(threshold, actual) {
  const expected = threshold.failAt ?? threshold.warnAt;
  if (threshold.operator === "max") {
    return actual > expected;
  }
  if (threshold.operator === "min") {
    return actual < expected;
  }
  return actual !== expected;
}

function describeThreshold(threshold) {
  const expected = threshold.failAt ?? threshold.warnAt;
  if (threshold.operator === "max") {
    return `<= ${expected}`;
  }
  if (threshold.operator === "min") {
    return `>= ${expected}`;
  }
  return `= ${expected}`;
}

function createQualityMetrics({
  runHealth,
  testMeaningfulness,
  thinningExecution,
  diagnosticFindings,
}) {
  return {
    totalTests: testMeaningfulness.summary.totalTests,
    meaningfulTests: testMeaningfulness.summary.meaningfulTests,
    weakSignalTests: testMeaningfulness.summary.weakSignalTests,
    assertionCount: testMeaningfulness.summary.assertionCount,
    baselineRegressions: runHealth.baselineComparison?.summary?.regressed ?? 0,
    baselineMissing: runHealth.baselineComparison?.summary?.missing ?? 0,
    baselineNew: runHealth.baselineComparison?.summary?.new ?? 0,
    environmentEvidence: diagnosticFindings.filter(
      (finding) => finding.category === "environment",
    ).length,
    flakyEvidence: diagnosticFindings.filter(
      (finding) => finding.category === "flaky",
    ).length,
    approvedToThin: thinningExecution.counts.approved_to_thin,
    blockedThinning: thinningExecution.counts.blocked,
    deferredThinning: thinningExecution.counts.deferred,
    keepE2E: thinningExecution.counts.keep_e2e,
  };
}

function createBaselineFindings(baselineComparison) {
  if (!baselineComparison?.available) {
    return [
      {
        id: "baseline-unavailable",
        source: "run-health",
        status: "warn",
        message: "Run health baseline comparison is unavailable.",
      },
    ];
  }
  return baselineComparison.layers
    .filter((layer) => ["regressed", "missing"].includes(layer.status))
    .map((layer) => ({
      id: `baseline-${layer.layer}`,
      source: "run-health",
      status: "warn",
      message: `${layer.layer}: ${layer.message}`,
    }));
}

function createDiagnosticFindings(runHealth) {
  const findings = [];
  for (const item of runHealth.environmentEvidence) {
    findings.push({
      id: `environment-${item.runId}-${item.layer}-${item.title}`,
      category: "environment",
      confidence: "high",
      source: "run-health",
      message: `${item.layer}: ${item.title}`,
      recommendedAction:
        "Fix environment/tooling evidence before changing tests.",
      artifactPath: item.artifactPath,
    });
  }
  for (const item of runHealth.instabilityEvidence) {
    if (item.classification === "environment") {
      continue;
    }
    findings.push({
      id: `flaky-${item.runId}-${item.layer}-${item.title}`,
      category: item.retry > 0 ? "flaky" : normalizeDiagnosticCategory(item),
      confidence: item.retry > 0 ? "medium" : "low",
      source: "run-health",
      message: `${item.layer}: ${item.title}`,
      recommendedAction:
        item.retry > 0
          ? "Review flaky retry evidence before changing product behavior."
          : "Inspect failure evidence before assigning ownership.",
      artifactPath: item.artifactPath,
    });
  }
  return findings.sort((left, right) => left.id.localeCompare(right.id));
}

function normalizeDiagnosticCategory(item) {
  if (item.classification === "product") {
    return "product_regression";
  }
  if (item.classification === "test") {
    return "harness_bug";
  }
  return "unknown";
}

function createDiagnosticQualityFindings(diagnosticFindings) {
  return diagnosticFindings
    .filter((finding) => finding.category === "environment")
    .map((finding) => ({
      id: finding.id,
      source: "diagnostics",
      status: "warn",
      message: finding.message,
    }));
}

function createThinningQualityFindings(thinningExecution) {
  const findings = [];
  for (const decision of thinningExecution.decisions) {
    if (decision.executionState === "blocked") {
      findings.push({
        id: `thinning-blocked-${decision.candidateId}`,
        source: "thinning",
        status: "warn",
        message: `${decision.candidateId}: ${decision.reason}`,
      });
    }
  }
  return findings;
}

function createRecommendedActions({ status, allFindings, runHealth }) {
  const actions = [];
  if (status === "pass") {
    actions.push("No quality-gate follow-up is required.");
  } else {
    actions.push("Review warning or failure findings before merging.");
  }
  actions.push(...runHealth.recommendedReviewFocus);
  for (const finding of allFindings.filter((item) => item.status !== "pass")) {
    actions.push(finding.message);
  }
  return [...new Set(actions)];
}
