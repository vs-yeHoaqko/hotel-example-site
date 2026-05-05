import { readFile } from "node:fs/promises";
import path from "node:path";
import { createRunHealthModel } from "./run-health-model.mjs";
import { extractPlaywrightObservations } from "./run-health-evidence.mjs";
import { createTestMeaningfulnessModel } from "./test-meaningfulness-model.mjs";
import {
  normalizeEvaluationPath,
  removeUndefined,
  safeReadJson,
  stringOrDefault,
  toPosix,
} from "./run-health-common.mjs";

export const DEFAULT_FEATURE_COVERAGE_CONFIG_PATH =
  "evaluation/config/feature-coverage.config.json";

const PASS_STATUSES = new Set(["pass", "passed", "expected"]);
const FAIL_STATUSES = new Set([
  "fail",
  "failed",
  "timedOut",
  "interrupted",
  "unexpected",
]);

export async function createFeatureCoverageModel({
  repoRoot = process.cwd(),
  configPath = DEFAULT_FEATURE_COVERAGE_CONFIG_PATH,
  reportPath,
} = {}) {
  const config = await loadFeatureCoverageConfig({
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
  const latestRun = runHealth.selectedRuns[0] ?? null;
  const latestEvidence = latestRun
    ? await readLatestResultEvidence({
        repoRoot,
        runHealth,
        latestRun,
        warnings,
      })
    : [];
  const ownershipEvidence = latestRun
    ? await readOwnershipEvidence({
        repoRoot,
        runHealth,
        latestRun,
        warnings,
      })
    : [];
  const usedEvidenceKeys = new Set();
  const rows = config.features.map((feature, index) =>
    createFeatureRow({
      feature,
      index,
      latestRun,
      latestEvidence,
      ownershipEvidence,
      testMeaningfulness,
      runHealth,
      usedEvidenceKeys,
    }),
  );
  const unmappedEvidence = createUnmappedEvidence({
    latestEvidence,
    testMeaningfulness,
    config,
    usedEvidenceKeys,
  });

  return {
    metadata: {
      command: "node evaluation/bin/generate-feature-coverage-matrix.mjs",
      configPath: config.configPath,
      reportPath: config.reportPath,
      generatedAt: new Date().toISOString(),
    },
    status: aggregateRows(rows),
    latestRun: latestRun
      ? {
          runId: latestRun.runId,
          mode: latestRun.mode,
          target: latestRun.target,
          status: latestRun.status,
          summaryPath: latestRun.summaryPath,
        }
      : null,
    rows,
    summary: createSummary(rows),
    unmappedEvidence,
    warnings: [
      ...warnings,
      ...runHealth.warnings,
      ...testMeaningfulness.warnings,
    ],
  };
}

export async function loadFeatureCoverageConfig({
  repoRoot = process.cwd(),
  configPath = DEFAULT_FEATURE_COVERAGE_CONFIG_PATH,
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
    throw new Error("feature-coverage config schemaVersion must be 1");
  }
  if (!config.sources || typeof config.sources !== "object") {
    throw new Error("feature-coverage sources must be an object");
  }
  if (!Array.isArray(config.features) || config.features.length === 0) {
    throw new Error("features must contain at least one feature");
  }

  const seenIds = new Set();
  const features = config.features.map((feature, index) => {
    const normalized = validateFeature(feature, index);
    if (seenIds.has(normalized.id)) {
      throw new Error(`features[${index}].id must be unique`);
    }
    seenIds.add(normalized.id);
    return normalized;
  });

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
    },
    features,
  };
}

export function aggregateRows(rows) {
  if (rows.some((row) => row.status === "fail")) {
    return "fail";
  }
  if (rows.some((row) => row.status === "warn" || row.status === "unknown")) {
    return "warn";
  }
  return "pass";
}

function createFeatureRow({
  feature,
  index,
  latestRun,
  latestEvidence,
  ownershipEvidence,
  testMeaningfulness,
  runHealth,
  usedEvidenceKeys,
}) {
  const evidence = [];
  const notes = [];
  const matchedLatest = latestEvidence.filter((item) =>
    matchesFeature(feature, item),
  );
  for (const group of groupLatestEvidence(matchedLatest)) {
    evidence.push(group);
    for (const source of group.sources) {
      usedEvidenceKeys.add(source.key);
    }
  }

  const layerEvidence = createLayerEvidence({
    feature,
    latestRun,
    testMeaningfulness,
  });
  if (
    layerEvidence &&
    !evidence.some((item) => item.kind === "latest-result")
  ) {
    evidence.push(layerEvidence);
  }

  const ownership = ownershipEvidence.filter((item) =>
    matchesFeature(feature, item),
  );
  for (const item of ownership) {
    evidence.push(item);
  }

  const meaningfulness = testMeaningfulness.files.filter((file) =>
    matchesFeature(feature, file),
  );
  for (const file of meaningfulness) {
    evidence.push({
      kind: "meaningfulness",
      layer: file.layer,
      file: file.file,
      title: "Discovered test file",
      status: file.meaningfulTests > 0 ? "pass" : "warn",
      count: file.testCount,
      artifactPath: testMeaningfulness.metadata.reportPath,
      note: `${file.meaningfulTests}/${file.testCount} tests have assertion-like checks.`,
    });
  }

  const weakSignals = testMeaningfulness.weakSignals.filter((test) =>
    matchesFeature(feature, test),
  );
  for (const test of weakSignals) {
    evidence.push({
      kind: "weak-signal",
      layer: test.layer,
      file: test.file,
      title: test.title,
      status: "warn",
      count: 1,
      artifactPath: testMeaningfulness.metadata.reportPath,
      note: "Test has no assertion-like checks.",
    });
  }

  const healthWarnings = createRunHealthWarnings({ feature, runHealth });
  evidence.push(...healthWarnings);

  if (evidence.length === 0 || !hasLatestStatusEvidence(evidence)) {
    evidence.push({
      kind: "missing",
      layer: feature.ownerLayer,
      file: feature.evidence[0]?.file ?? "",
      title: "Expected latest evidence missing",
      status: "unknown",
      count: 0,
      artifactPath: latestRun?.summaryPath ?? null,
      note: latestRun
        ? "No latest result matched the configured evidence."
        : "No readable latest evaluation run was available.",
    });
  }

  const status = aggregateEvidenceStatus(evidence);
  if (status === "pass") {
    notes.push("Latest matched evidence passed.");
  } else if (status === "fail") {
    notes.push("Latest matched evidence failed or was interrupted.");
  } else if (status === "warn") {
    notes.push("Latest evidence passed, but warning-level evidence applies.");
  } else {
    notes.push("Latest evidence is missing or unreadable.");
  }
  notes.push(...evidence.map((item) => item.note).filter(Boolean));

  return {
    id: feature.id,
    label: feature.label,
    category: feature.category,
    locale: feature.locale,
    ownerLayer: feature.ownerLayer,
    order: index,
    status,
    evidence,
    notes: [...new Set(notes)],
  };
}

async function readLatestResultEvidence({
  repoRoot,
  runHealth,
  latestRun,
  warnings,
}) {
  const items = [];
  for (const layer of latestRun.layers ?? []) {
    for (const artifactPath of layer.artifacts ?? []) {
      if (!artifactPath.endsWith(".json")) {
        continue;
      }
      const absoluteArtifactPath = path.resolve(
        repoRoot,
        runHealth.metadata.runsDirectory,
        latestRun.runDirectory,
        artifactPath,
      );
      const relativeArtifactPath = toPosix(
        path.relative(repoRoot, absoluteArtifactPath),
      );
      const result = await safeReadJson(
        absoluteArtifactPath,
        warnings,
        relativeArtifactPath,
      );
      if (!result || !Array.isArray(result.suites)) {
        continue;
      }
      for (const observation of extractPlaywrightObservations({
        result,
        run: latestRun,
        layer,
        artifactPath: relativeArtifactPath,
      })) {
        items.push({
          key: [
            observation.runId,
            observation.layer,
            observation.file,
            observation.title,
            observation.retry,
          ].join("|"),
          kind: "latest-result",
          layer: observation.layer,
          file: normalizeRepoPathValue(observation.file),
          title: observation.title,
          status: normalizeStatus(observation.status),
          testStatus: normalizeStatus(observation.testStatus),
          count: 1,
          artifactPath: observation.artifactPath,
          note: observation.messages[0] ?? "",
        });
      }
    }
  }
  return items;
}

async function readOwnershipEvidence({
  repoRoot,
  runHealth,
  latestRun,
  warnings,
}) {
  const ownershipPath = path.resolve(
    repoRoot,
    runHealth.metadata.runsDirectory,
    latestRun.runDirectory,
    "ownership.json",
  );
  const relativeOwnershipPath = toPosix(path.relative(repoRoot, ownershipPath));
  const ownership = await safeReadJson(
    ownershipPath,
    warnings,
    relativeOwnershipPath,
  );
  if (!ownership || !Array.isArray(ownership.records)) {
    return [];
  }
  return ownership.records.flatMap((record) =>
    (Array.isArray(record.coveredBy) ? record.coveredBy : []).map((file) => ({
      kind: "ownership",
      layer: stringOrDefault(record.ownerLayer, "unknown"),
      file: normalizeRepoPathValue(file),
      title: stringOrDefault(record.behavior, "Ownership record"),
      status: "pass",
      count: 1,
      artifactPath: relativeOwnershipPath,
      note: stringOrDefault(record.evidence, ""),
    })),
  );
}

function createLayerEvidence({ feature, latestRun, testMeaningfulness }) {
  if (!latestRun) {
    return null;
  }
  const matchedFiles = testMeaningfulness.files.filter((file) =>
    matchesFeature(feature, file),
  );
  if (matchedFiles.length === 0) {
    return null;
  }
  const layer = latestRun.layers?.find((candidate) =>
    feature.evidence.some((matcher) =>
      layersMatch(matcher.layer, candidate.name),
    ),
  );
  if (!layer) {
    return null;
  }
  return {
    kind: "latest-layer",
    layer: layer.name,
    file: matchedFiles.map((file) => file.file).join(", "),
    title: `${layer.name} layer`,
    status: normalizeStatus(layer.timedOut ? "timedOut" : layer.status),
    count: matchedFiles.reduce((sum, file) => sum + file.testCount, 0),
    artifactPath: latestRun.summaryPath,
    note: `${layer.name} layer status is ${layer.status}.`,
  };
}

function groupLatestEvidence(items) {
  const groups = new Map();
  for (const item of items) {
    const key = `${canonicalLayer(item.layer)}|${item.file}|${item.artifactPath}`;
    const current = groups.get(key) ?? {
      kind: "latest-result",
      layer: item.layer,
      file: item.file,
      title: "Latest test results",
      status: "pass",
      count: 0,
      artifactPath: item.artifactPath,
      note: "",
      sources: [],
    };
    current.count += 1;
    current.sources.push(item);
    if (item.status === "fail" || item.testStatus === "fail") {
      current.status = "fail";
      current.note = item.note || "At least one latest test result failed.";
    }
    groups.set(key, current);
  }
  return Array.from(groups.values()).map((group) => ({
    ...group,
    note:
      group.note ||
      `${group.count} latest test result${group.count === 1 ? "" : "s"} matched.`,
  }));
}

function createRunHealthWarnings({ feature, runHealth }) {
  const warnings = [
    ...(runHealth.slowTests ?? []).map((item) =>
      runHealthWarning(item, "slow-test"),
    ),
    ...(runHealth.instabilityEvidence ?? []).map((item) =>
      runHealthWarning(item, "instability"),
    ),
    ...(runHealth.environmentEvidence ?? []).map((item) =>
      runHealthWarning(item, "environment"),
    ),
  ].filter((item) => matchesFeature(feature, item));

  return dedupeEvidence(warnings);
}

function runHealthWarning(item, warningKind) {
  return {
    kind: "run-health",
    layer: item.layer,
    file: normalizeRepoPathValue(item.file),
    title: item.title,
    status: "warn",
    count: 1,
    artifactPath: item.artifactPath,
    note: formatRunHealthWarning(item, warningKind),
  };
}

function formatRunHealthWarning(item, warningKind) {
  if (warningKind === "slow-test") {
    return `${item.runId}: slow test evidence (${item.durationMs ?? "unknown"}ms).`;
  }
  if (warningKind === "environment") {
    return `${item.runId}: environment evidence (${item.status}).`;
  }
  if (item.retry > 0) {
    return `${item.runId}: retried test evidence (${item.status}, retry ${item.retry}).`;
  }
  return `${item.runId}: unstable test evidence (${item.status}).`;
}

function dedupeEvidence(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = [
      item.kind,
      item.layer,
      item.file,
      item.title,
      item.artifactPath,
      item.note,
    ].join("|");
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function createUnmappedEvidence({
  latestEvidence,
  testMeaningfulness,
  config,
  usedEvidenceKeys,
}) {
  const rows = [];
  for (const item of latestEvidence) {
    if (usedEvidenceKeys.has(item.key)) {
      continue;
    }
    rows.push({
      layer: item.layer,
      file: item.file,
      status: item.status,
      artifactPath: item.artifactPath,
      note: "Latest result evidence did not match a configured feature row.",
    });
  }

  for (const file of testMeaningfulness.files) {
    if (config.features.some((feature) => matchesFeature(feature, file))) {
      continue;
    }
    rows.push({
      layer: file.layer,
      file: file.file,
      status: file.meaningfulTests > 0 ? "pass" : "warn",
      artifactPath: testMeaningfulness.metadata.reportPath,
      note: isHarnessContractFile(file)
        ? "Harness-contract evidence is outside the product coverage mapping."
        : "Discovered test file did not match a configured feature row.",
    });
  }

  return rows.sort(
    (a, b) =>
      a.layer.localeCompare(b.layer) ||
      a.file.localeCompare(b.file) ||
      a.note.localeCompare(b.note),
  );
}

function isHarnessContractFile(file) {
  return file.layer === "harness-unit" || file.source === "evaluation";
}

function aggregateEvidenceStatus(evidence) {
  const latestEvidence = evidence.filter((item) =>
    ["latest-result", "latest-layer", "missing"].includes(item.kind),
  );
  if (latestEvidence.some((item) => item.status === "fail")) {
    return "fail";
  }
  if (latestEvidence.some((item) => item.status === "unknown")) {
    return "unknown";
  }
  const hasWarning = evidence.some((item) => item.status === "warn");
  if (latestEvidence.some((item) => item.status === "pass")) {
    return hasWarning ? "warn" : "pass";
  }
  return hasWarning ? "warn" : "unknown";
}

function hasLatestStatusEvidence(evidence) {
  return evidence.some((item) =>
    ["latest-result", "latest-layer"].includes(item.kind),
  );
}

function createSummary(rows) {
  const counts = {
    pass: 0,
    fail: 0,
    warn: 0,
    unknown: 0,
  };
  for (const row of rows) {
    counts[row.status] = (counts[row.status] ?? 0) + 1;
  }
  return {
    totalRows: rows.length,
    byStatus: counts,
  };
}

function matchesFeature(feature, evidence) {
  return feature.evidence.some(
    (matcher) =>
      layersMatch(matcher.layer, evidence.layer) &&
      fileMatches(evidence.file, matcher.file),
  );
}

function validateFeature(feature, index) {
  const label = `features[${index}]`;
  const id = requireString(feature.id, `${label}.id`);
  const evidence = Array.isArray(feature.evidence) ? feature.evidence : [];
  if (evidence.length === 0) {
    throw new Error(`${label}.evidence must contain at least one matcher`);
  }
  return {
    id,
    label: requireString(feature.label, `${label}.label`),
    category: requireString(feature.category, `${label}.category`),
    ownerLayer: requireString(feature.ownerLayer, `${label}.ownerLayer`),
    locale: typeof feature.locale === "string" ? feature.locale : null,
    evidence: evidence.map((matcher, matcherIndex) => ({
      layer: requireString(
        matcher.layer,
        `${label}.evidence[${matcherIndex}].layer`,
      ),
      file: normalizeRepoPathValue(
        requireString(matcher.file, `${label}.evidence[${matcherIndex}].file`),
      ),
    })),
  };
}

function requireString(value, fieldName) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${fieldName} must be a non-empty string`);
  }
  return value;
}

function layersMatch(expected, actual) {
  return canonicalLayer(expected) === canonicalLayer(actual);
}

function canonicalLayer(value) {
  const normalized = String(value ?? "").toLowerCase();
  if (["full-e2e", "root-e2e", "e2e"].includes(normalized)) {
    return "full-e2e";
  }
  if (["smoke-e2e", "evaluation-smoke"].includes(normalized)) {
    return "smoke-e2e";
  }
  if (["integration", "evaluation-integration"].includes(normalized)) {
    return "integration";
  }
  if (["unit", "product-unit", "harness-unit"].includes(normalized)) {
    return "unit";
  }
  return normalized;
}

function fileMatches(candidateFile, matcherFile) {
  const candidate = normalizeRepoPathValue(candidateFile);
  const matcher = normalizeRepoPathValue(matcherFile);
  return (
    candidate === matcher ||
    candidate.endsWith(`/${matcher}`) ||
    matcher.endsWith(`/${candidate}`)
  );
}

function normalizeRepoPathValue(value) {
  return String(value ?? "").replaceAll("\\", "/");
}

function normalizeStatus(status) {
  if (PASS_STATUSES.has(status)) {
    return "pass";
  }
  if (FAIL_STATUSES.has(status)) {
    return "fail";
  }
  if (status === "warn") {
    return "warn";
  }
  return "unknown";
}
