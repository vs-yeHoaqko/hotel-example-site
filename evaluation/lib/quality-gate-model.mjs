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
  const latestRun = runHealth.selectedRuns[0] ?? null;
  const requiredEvidenceFindings = evaluateRequiredEvidence(
    config.requiredEvidence,
    latestRun,
  );
  const thresholdFindings = evaluateThresholds(config.thresholds, metrics);
  const baselineFindings = createBaselineFindings(runHealth.baselineComparison);
  const diagnosticQualityFindings =
    createDiagnosticQualityFindings(diagnosticFindings);
  const thinningFindings = createThinningQualityFindings(thinningExecution);
  const allFindings = [
    ...requiredEvidenceFindings,
    ...thresholdFindings,
    ...baselineFindings,
    ...diagnosticQualityFindings,
    ...thinningFindings,
  ];
  const status = aggregateStatus(allFindings);

  return {
    metadata: {
      command: "node evaluation/bin/generate-quality-gate.mjs",
      configPath: config.configPath,
      reportPath: config.reportPath,
      ciSummaryReportPath: config.ciSummaryReportPath,
      checkedAt: new Date().toISOString(),
    },
    status,
    latestRun: summarizeLatestRun(latestRun),
    evidenceSources: [
      runHealth.metadata.reportPath,
      testMeaningfulness.metadata.reportPath,
      migrationCandidates.metadata.reportPath,
      migrationCandidates.metadata.thinningExecutionReportPath,
    ],
    metrics,
    requiredEvidenceFindings,
    thresholdFindings,
    baselineFindings,
    diagnosticFindings,
    thinningFindings,
    recommendedActions: createRecommendedActions({
      status,
      allFindings,
      runHealth,
    }),
    warnings: [...runHealth.warnings, ...testMeaningfulness.warnings],
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
    ciSummaryReportPath: normalizeEvaluationPath({
      repoRoot,
      inputPath:
        config.ciSummaryReportPath ?? "evaluation/reports/ci-gate-summary.md",
      fieldName: "ciSummaryReportPath",
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
    requiredEvidence: Array.isArray(config.requiredEvidence)
      ? config.requiredEvidence.map(validateRequiredEvidence)
      : [],
    thresholds: config.thresholds.map(validateThreshold),
  };
}

export function evaluateThresholds(thresholds, metrics) {
  return thresholds.map((threshold) => {
    const actual = metrics[threshold.metric];
    const expected = describeThreshold(threshold);
    if (typeof actual !== "number") {
      return {
        id: threshold.id,
        source: threshold.source,
        metric: threshold.metric,
        status: threshold.enforcement === "fail" ? "fail" : "warn",
        actual: null,
        expected,
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
      expected,
      message: breached
        ? `${threshold.metric}=${actual} breaches ${expected}.`
        : `${threshold.metric}=${actual} is within ${expected}.`,
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

export function evaluateRequiredEvidence(requiredEvidence, latestRun) {
  return requiredEvidence.map((item) => {
    if (
      latestRun &&
      item.modes.length > 0 &&
      !item.modes.includes(latestRun.mode)
    ) {
      return requiredEvidenceFinding({
        item,
        status: "pass",
        message: `${item.id} is not required for ${latestRun.mode} mode.`,
      });
    }

    if (item.condition === "latest-run-readable") {
      return requiredEvidenceFinding({
        item,
        status: latestRun ? "pass" : item.enforcement,
        message: latestRun
          ? `Latest evaluation summary is readable: ${latestRun.summaryPath}.`
          : "No readable latest evaluation summary is available.",
      });
    }

    if (item.condition === "layer-passed") {
      const layer = latestRun?.layers?.find(
        (candidate) => candidate.name === item.layer,
      );
      if (!latestRun) {
        return requiredEvidenceFinding({
          item,
          status: item.enforcement,
          message: `${item.layer} layer cannot be evaluated without a latest run summary.`,
        });
      }
      if (!layer) {
        return requiredEvidenceFinding({
          item,
          status: item.enforcement,
          message: `${item.layer} layer is missing from latest run ${latestRun.runId}.`,
        });
      }
      return requiredEvidenceFinding({
        item,
        status: layer.status === "passed" ? "pass" : item.enforcement,
        message:
          layer.status === "passed"
            ? `${item.layer} layer passed in latest run ${latestRun.runId}.`
            : `${item.layer} layer status is ${layer.status} in latest run ${latestRun.runId}.`,
      });
    }

    return requiredEvidenceFinding({
      item,
      status: item.enforcement,
      message: `Unsupported required evidence condition: ${item.condition}.`,
    });
  });
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

function validateRequiredEvidence(item, index) {
  const label = `requiredEvidence[${index}]`;
  for (const key of ["id", "source", "condition", "enforcement"]) {
    if (!item[key] || typeof item[key] !== "string") {
      throw new Error(`${label}.${key} must be a non-empty string`);
    }
  }
  if (!["warn", "fail"].includes(item.enforcement)) {
    throw new Error(`${label}.enforcement must be warn or fail`);
  }
  if (!["latest-run-readable", "layer-passed"].includes(item.condition)) {
    throw new Error(
      `${label}.condition must be latest-run-readable or layer-passed`,
    );
  }
  if (item.condition === "layer-passed" && !item.layer) {
    throw new Error(`${label}.layer must be set for layer-passed conditions`);
  }
  return {
    id: item.id,
    source: item.source,
    condition: item.condition,
    layer: item.layer ?? null,
    modes: Array.isArray(item.modes) ? item.modes : [],
    enforcement: item.enforcement,
    rationale: stringOrDefault(item.rationale, ""),
  };
}

function requiredEvidenceFinding({ item, status, message }) {
  return {
    id: item.id,
    source: item.source,
    status,
    message,
    rationale: item.rationale,
  };
}

function summarizeLatestRun(latestRun) {
  if (!latestRun) {
    return null;
  }
  return {
    runId: latestRun.runId,
    mode: latestRun.mode,
    target: latestRun.target,
    status: latestRun.status,
    summaryPath: latestRun.summaryPath,
    recommendedNextAction: latestRun.recommendedNextAction,
    layers: latestRun.layers.map((layer) => ({
      name: layer.name,
      required: layer.required,
      status: layer.status,
      classification: layer.classification,
      timedOut: layer.timedOut,
      skippedReason: layer.skippedReason,
    })),
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
