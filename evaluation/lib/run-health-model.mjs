import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

export const DEFAULT_RUN_HEALTH_CONFIG_PATH =
  "evaluation/config/run-health.config.json";

const UNSTABLE_RESULT_STATUSES = new Set(["failed", "timedOut", "interrupted"]);
const UNSTABLE_TEST_STATUSES = new Set(["unexpected", "flaky", "timedOut"]);
const ENVIRONMENT_PATTERN =
  /(spawn EPERM|EACCES|ENOENT|ECONNREFUSED|permission|browser.*install|executable doesn't exist|timed out waiting for.*server|webserver|webpack)/i;

export async function createRunHealthModel({
  repoRoot = process.cwd(),
  configPath = DEFAULT_RUN_HEALTH_CONFIG_PATH,
  runsDirectory,
  reportPath,
  maxRuns,
} = {}) {
  const config = await loadRunHealthConfig({
    repoRoot,
    configPath,
    overrides: { runsDirectory, reportPath, maxRuns },
  });
  const warnings = [];
  const readableRuns = await readRunSummaries({ repoRoot, config, warnings });
  const selectedRuns = readableRuns.slice(0, config.maxRuns);
  const layerHealth = selectedRuns.flatMap((run) => run.layers);
  const slowLayers = layerHealth
    .filter((layer) => layer.slow)
    .sort(compareSlowLayers);
  const {
    slowTests,
    instabilityEvidence,
    environmentEvidence,
    preflightEvidence,
  } = await readPlaywrightEvidence({
    repoRoot,
    config,
    selectedRuns,
    warnings,
  });

  addLayerInstabilityEvidence({
    selectedRuns,
    instabilityEvidence,
    environmentEvidence,
  });

  slowTests.sort(compareTestFindings);
  instabilityEvidence.sort(compareEvidence);
  environmentEvidence.sort(compareEvidence);
  preflightEvidence.sort(compareEvidence);

  const truncatedSlowTests = slowTests.slice(0, config.topSlowTests);

  return {
    metadata: {
      command: "node evaluation/bin/generate-run-health.mjs",
      configPath: config.configPath,
      runsDirectory: config.runsDirectory,
      reportPath: config.reportPath,
      maxRuns: config.maxRuns,
      topSlowTests: config.topSlowTests,
      testSlowThresholdMs: config.testSlowThresholdMs,
      layerThresholdsMs: config.layerThresholdsMs,
      selectedRunIds: selectedRuns.map((run) => run.runId),
    },
    selectedRuns,
    layerHealth,
    slowLayers,
    slowTests: truncatedSlowTests,
    slowTestObservationCount: slowTests.length,
    preflightEvidence,
    instabilityEvidence,
    environmentEvidence,
    noFlakyEvidenceObserved: instabilityEvidence.length === 0,
    noEnvironmentEvidenceObserved: environmentEvidence.length === 0,
    warnings,
    recommendedReviewFocus: createRecommendedReviewFocus({
      slowLayers,
      slowTests: truncatedSlowTests,
      instabilityEvidence,
      environmentEvidence,
      warnings,
    }),
  };
}

export async function loadRunHealthConfig({
  repoRoot = process.cwd(),
  configPath = DEFAULT_RUN_HEALTH_CONFIG_PATH,
  overrides = {},
} = {}) {
  const normalizedConfigPath = normalizeEvaluationPath({
    repoRoot,
    inputPath: configPath,
    fieldName: "configPath",
  });
  const absoluteConfigPath = path.resolve(repoRoot, normalizedConfigPath);
  const rawConfig = JSON.parse(await readFile(absoluteConfigPath, "utf8"));
  const config = {
    ...rawConfig,
    ...removeUndefined(overrides),
    configPath: normalizedConfigPath,
  };

  if (config.schemaVersion !== 1) {
    throw new Error("run-health config schemaVersion must be 1");
  }

  const runsPath = normalizeEvaluationPath({
    repoRoot,
    inputPath: config.runsDirectory,
    fieldName: "runsDirectory",
  });
  const outputPath = normalizeEvaluationPath({
    repoRoot,
    inputPath: config.reportPath,
    fieldName: "reportPath",
  });

  const layerThresholdsMs = config.layerThresholdsMs ?? {};
  for (const [layerName, thresholdMs] of Object.entries(layerThresholdsMs)) {
    assertPositiveInteger(thresholdMs, `layerThresholdsMs.${layerName}`);
  }

  return {
    schemaVersion: 1,
    configPath: normalizedConfigPath,
    runsDirectory: runsPath,
    reportPath: outputPath,
    maxRuns: assertPositiveInteger(config.maxRuns, "maxRuns"),
    topSlowTests: assertPositiveInteger(config.topSlowTests, "topSlowTests"),
    layerThresholdsMs,
    testSlowThresholdMs: assertPositiveInteger(
      config.testSlowThresholdMs,
      "testSlowThresholdMs",
    ),
  };
}

async function readRunSummaries({ repoRoot, config, warnings }) {
  const runsRoot = path.resolve(repoRoot, config.runsDirectory);
  const entries = await safeReaddir(runsRoot, warnings, config.runsDirectory);
  const runs = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    const runDirectory = entry.name;
    const summaryPath = path.join(runsRoot, runDirectory, "summary.json");
    const relativeSummaryPath = toPosix(path.relative(repoRoot, summaryPath));
    if (!(await fileExists(summaryPath))) {
      const summaryMarkdownPath = path.join(
        runsRoot,
        runDirectory,
        "summary.md",
      );
      if (await fileExists(summaryMarkdownPath)) {
        warnings.push(`${relativeSummaryPath}: missing`);
      }
      continue;
    }
    const summary = await safeReadJson(
      summaryPath,
      warnings,
      relativeSummaryPath,
    );
    if (!summary) {
      continue;
    }

    const runId = stringOrDefault(summary.runId, runDirectory);
    const layers = Array.isArray(summary.layers)
      ? summary.layers.map((layer) =>
          createLayerHealth({
            runId,
            layer,
            config,
          }),
        )
      : [];

    if (!Array.isArray(summary.layers)) {
      warnings.push(`${relativeSummaryPath}: missing or invalid layers array`);
    }

    runs.push({
      runId,
      mode: stringOrDefault(summary.mode, "unknown"),
      target: stringOrDefault(summary.target, "unknown"),
      status: stringOrDefault(summary.status, "unknown"),
      startedAt: stringOrDefault(summary.startedAt, ""),
      finishedAt: stringOrDefault(summary.finishedAt, ""),
      repository: {
        branch: stringOrDefault(summary.repository?.branch, "unknown"),
        commit: stringOrDefault(summary.repository?.commit, "unknown"),
        dirty: Boolean(summary.repository?.dirty),
        changedFiles: Array.isArray(summary.repository?.changedFiles)
          ? summary.repository.changedFiles
          : [],
      },
      recommendedNextAction: {
        code: stringOrDefault(summary.recommendedNextAction?.code, "unknown"),
        message: stringOrDefault(summary.recommendedNextAction?.message, ""),
      },
      diagnostics: Array.isArray(summary.diagnostics)
        ? summary.diagnostics
        : [],
      summaryPath: relativeSummaryPath,
      runDirectory,
      layers,
    });
  }

  runs.sort(compareRunsDescending);
  if (runs.length === 0) {
    warnings.push(`${config.runsDirectory}: no readable run summaries found`);
  }
  return runs;
}

async function fileExists(absolutePath) {
  try {
    await stat(absolutePath);
    return true;
  } catch (error) {
    if (error?.code === "ENOENT") {
      return false;
    }
    throw error;
  }
}

async function safeReaddir(absoluteDirectory, warnings, label) {
  try {
    return await readdir(absoluteDirectory, { withFileTypes: true });
  } catch (error) {
    if (error?.code === "ENOENT") {
      warnings.push(`${label}: directory does not exist`);
      return [];
    }
    throw error;
  }
}

async function safeReadJson(absolutePath, warnings, label) {
  try {
    const file = await stat(absolutePath);
    if (!file.isFile()) {
      warnings.push(`${label}: not a file`);
      return null;
    }
    return JSON.parse(await readFile(absolutePath, "utf8"));
  } catch (error) {
    if (error?.code === "ENOENT") {
      warnings.push(`${label}: missing`);
      return null;
    }
    if (error instanceof SyntaxError) {
      warnings.push(`${label}: malformed JSON (${error.message})`);
      return null;
    }
    throw error;
  }
}

function createLayerHealth({ runId, layer, config }) {
  const name = stringOrDefault(layer.name, "unknown");
  const thresholdMs = config.layerThresholdsMs[name] ?? null;
  const durationMs = numberOrNull(layer.durationMs);
  return {
    runId,
    name,
    required: Boolean(layer.required),
    status: stringOrDefault(layer.status, "unknown"),
    classification: layer.classification ?? null,
    durationMs,
    thresholdMs,
    slow:
      durationMs !== null && thresholdMs !== null && durationMs > thresholdMs,
    timedOut: Boolean(layer.timedOut),
    skippedReason: layer.skippedReason ?? null,
    artifacts: Array.isArray(layer.artifacts) ? layer.artifacts : [],
  };
}

async function readPlaywrightEvidence({
  repoRoot,
  config,
  selectedRuns,
  warnings,
}) {
  const slowTests = [];
  const instabilityEvidence = [];
  const environmentEvidence = [];
  const preflightEvidence = [];

  for (const run of selectedRuns) {
    for (const layer of run.layers) {
      for (const artifactPath of layer.artifacts) {
        if (!artifactPath.endsWith(".json")) {
          continue;
        }

        const absoluteArtifactPath = path.resolve(
          repoRoot,
          config.runsDirectory,
          run.runDirectory,
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
        if (artifactPath === "artifacts/environment-preflight.json") {
          if (result) {
            extractPreflightEvidence({
              result,
              run,
              layer,
              artifactPath: relativeArtifactPath,
              preflightEvidence,
              environmentEvidence,
              warnings,
            });
          }
          continue;
        }

        if (!result || !Array.isArray(result.suites)) {
          if (result) {
            warnings.push(
              `${relativeArtifactPath}: missing or invalid Playwright suites array`,
            );
          }
          continue;
        }

        const observations = extractPlaywrightObservations({
          result,
          run,
          layer,
          artifactPath: relativeArtifactPath,
        });

        for (const observation of observations) {
          if (observation.durationMs >= config.testSlowThresholdMs) {
            slowTests.push(observation);
          }

          if (isUnstableObservation(observation)) {
            const target =
              observation.classification === "environment"
                ? environmentEvidence
                : instabilityEvidence;
            target.push({
              kind: "test",
              runId: observation.runId,
              layer: observation.layer,
              title: observation.title,
              file: observation.file,
              status: observation.status,
              retry: observation.retry,
              durationMs: observation.durationMs,
              classification: observation.classification,
              artifactPath: observation.artifactPath,
              messages: observation.messages,
            });
          }
        }
      }
    }

    for (const diagnostic of run.diagnostics) {
      const message = stringOrDefault(diagnostic.message, "");
      const classification = stringOrDefault(
        diagnostic.classification,
        isEnvironmentMessage(message) ? "environment" : "unknown",
      );
      if (classification === "environment") {
        environmentEvidence.push({
          kind: "diagnostic",
          runId: run.runId,
          layer: stringOrDefault(diagnostic.layer, "unknown"),
          title: "Run diagnostic",
          file: "",
          status: stringOrDefault(diagnostic.status, run.status),
          retry: 0,
          durationMs: null,
          classification,
          artifactPath: run.summaryPath,
          messages: [message].filter(Boolean),
        });
      }
    }
  }

  return {
    slowTests,
    instabilityEvidence,
    environmentEvidence,
    preflightEvidence,
  };
}

function extractPreflightEvidence({
  result,
  run,
  layer,
  artifactPath,
  preflightEvidence,
  environmentEvidence,
  warnings,
}) {
  if (!Array.isArray(result.checks)) {
    warnings.push(`${artifactPath}: missing or invalid preflight checks array`);
    return;
  }

  for (const check of result.checks) {
    const item = {
      kind: "preflight",
      runId: run.runId,
      layer: layer.name,
      title: stringOrDefault(check.label, stringOrDefault(check.id, "check")),
      file: "",
      status: stringOrDefault(check.status, "unknown"),
      retry: 0,
      durationMs: null,
      classification: check.classification ?? null,
      artifactPath,
      messages: [
        stringOrDefault(check.message, ""),
        stringOrDefault(check.guidance, ""),
      ].filter(Boolean),
    };
    preflightEvidence.push(item);
    if (item.status === "failed" || item.classification === "environment") {
      environmentEvidence.push({
        ...item,
        classification: "environment",
      });
    }
  }
}

function extractPlaywrightObservations({ result, run, layer, artifactPath }) {
  const observations = [];
  walkSuites(result.suites, [], (suiteTitles, spec) => {
    const title = [...suiteTitles, spec.title].filter(Boolean).join(" > ");
    const file = spec.file ?? "";
    const line = Number.isInteger(spec.line) ? spec.line : null;

    for (const test of Array.isArray(spec.tests) ? spec.tests : []) {
      const testStatus = stringOrDefault(test.status, "unknown");
      const expectedStatus = stringOrDefault(test.expectedStatus, "unknown");
      const project = stringOrDefault(test.projectName, "");
      const results = Array.isArray(test.results) ? test.results : [];

      if (results.length === 0) {
        observations.push(
          createObservation({
            run,
            layer,
            title,
            file,
            line,
            project,
            status: testStatus,
            expectedStatus,
            retry: 0,
            durationMs: 0,
            artifactPath,
            messages: [],
          }),
        );
        continue;
      }

      for (const resultEntry of results) {
        const messages = extractResultMessages(resultEntry);
        observations.push(
          createObservation({
            run,
            layer,
            title,
            file,
            line,
            project,
            status: stringOrDefault(resultEntry.status, testStatus),
            testStatus,
            expectedStatus,
            retry: Number.isInteger(resultEntry.retry) ? resultEntry.retry : 0,
            durationMs: numberOrDefault(resultEntry.duration, 0),
            artifactPath,
            messages,
          }),
        );
      }
    }
  });
  return observations;
}

function walkSuites(suites, parentTitles, visitSpec) {
  for (const suite of suites) {
    const suiteTitle = typeof suite.title === "string" ? suite.title : "";
    const nextTitles = suiteTitle
      ? [...parentTitles, suiteTitle]
      : parentTitles;

    for (const spec of Array.isArray(suite.specs) ? suite.specs : []) {
      visitSpec(nextTitles, spec);
    }

    if (Array.isArray(suite.suites)) {
      walkSuites(suite.suites, nextTitles, visitSpec);
    }
  }
}

function createObservation({
  run,
  layer,
  title,
  file,
  line,
  project,
  status,
  testStatus,
  expectedStatus,
  retry,
  durationMs,
  artifactPath,
  messages,
}) {
  const classification = classifyObservation({
    layer,
    status,
    testStatus,
    messages,
  });

  return {
    runId: run.runId,
    layer: layer.name,
    title,
    file,
    line,
    project,
    durationMs,
    status,
    testStatus: testStatus ?? status,
    expectedStatus,
    retry,
    artifactPath,
    classification,
    messages,
  };
}

function extractResultMessages(resultEntry) {
  const messages = [];
  for (const error of Array.isArray(resultEntry.errors)
    ? resultEntry.errors
    : []) {
    const message = error?.message ?? error?.value ?? "";
    if (message) {
      messages.push(trimMessage(message));
    }
  }
  for (const stream of ["stderr", "stdout"]) {
    for (const item of Array.isArray(resultEntry[stream])
      ? resultEntry[stream]
      : []) {
      const text = typeof item === "string" ? item : item?.text;
      if (text) {
        messages.push(trimMessage(text));
      }
    }
  }
  return messages;
}

function addLayerInstabilityEvidence({
  selectedRuns,
  instabilityEvidence,
  environmentEvidence,
}) {
  for (const run of selectedRuns) {
    for (const layer of run.layers) {
      if (!isUnstableLayer(layer)) {
        continue;
      }
      const classification = classifyLayer(layer);
      const target =
        classification === "environment"
          ? environmentEvidence
          : instabilityEvidence;
      target.push({
        kind: "layer",
        runId: run.runId,
        layer: layer.name,
        title: `${layer.name} layer`,
        file: "",
        status: layer.timedOut ? "timedOut" : layer.status,
        retry: 0,
        durationMs: layer.durationMs,
        classification,
        artifactPath: run.summaryPath,
        messages: [layer.skippedReason].filter(Boolean),
      });
    }
  }
}

function isUnstableLayer(layer) {
  return (
    layer.timedOut ||
    ["failed", "timedOut", "interrupted"].includes(layer.status)
  );
}

function isUnstableObservation(observation) {
  return (
    UNSTABLE_RESULT_STATUSES.has(observation.status) ||
    UNSTABLE_TEST_STATUSES.has(observation.testStatus) ||
    observation.retry > 0
  );
}

function classifyObservation({ layer, status, testStatus, messages }) {
  if (
    layer.classification === "environment" ||
    messages.some(isEnvironmentMessage)
  ) {
    return "environment";
  }
  if (layer.classification) {
    return layer.classification;
  }
  if (status === "timedOut" || testStatus === "timedOut") {
    return "timeout";
  }
  return "test";
}

function classifyLayer(layer) {
  if (layer.classification) {
    return layer.classification;
  }
  if (layer.timedOut) {
    return "timeout";
  }
  return "unknown";
}

function isEnvironmentMessage(message) {
  return ENVIRONMENT_PATTERN.test(message);
}

function createRecommendedReviewFocus({
  slowLayers,
  slowTests,
  instabilityEvidence,
  environmentEvidence,
  warnings,
}) {
  const focus = [];
  if (environmentEvidence.length > 0) {
    focus.push("Fix environment/tooling evidence before changing tests.");
  }
  if (instabilityEvidence.length > 0) {
    focus.push("Review unstable product/test evidence before timeout changes.");
  }
  if (slowLayers.length > 0) {
    focus.push("Review slow layers against configured thresholds.");
  }
  if (slowTests.length > 0) {
    focus.push(
      "Review top slow Playwright tests for lower-layer coverage or setup cost.",
    );
  }
  if (warnings.length > 0) {
    focus.push(
      "Resolve unreadable artifacts if the missing evidence affects a decision.",
    );
  }
  if (focus.length === 0) {
    focus.push(
      "No immediate slow/flaky follow-up is indicated by selected runs.",
    );
  }
  return focus;
}

function compareRunsDescending(a, b) {
  const byStartedAt = compareDateDescending(a.startedAt, b.startedAt);
  if (byStartedAt !== 0) {
    return byStartedAt;
  }
  return b.runId.localeCompare(a.runId);
}

function compareSlowLayers(a, b) {
  return (
    compareNumberDescending(a.durationMs, b.durationMs) ||
    a.runId.localeCompare(b.runId) ||
    a.name.localeCompare(b.name)
  );
}

function compareTestFindings(a, b) {
  return (
    compareNumberDescending(a.durationMs, b.durationMs) ||
    a.layer.localeCompare(b.layer) ||
    a.title.localeCompare(b.title) ||
    a.file.localeCompare(b.file) ||
    a.runId.localeCompare(b.runId)
  );
}

function compareEvidence(a, b) {
  return (
    a.runId.localeCompare(b.runId) ||
    a.layer.localeCompare(b.layer) ||
    a.title.localeCompare(b.title) ||
    a.status.localeCompare(b.status)
  );
}

function compareDateDescending(a, b) {
  const aTime = Date.parse(a);
  const bTime = Date.parse(b);
  const normalizedA = Number.isNaN(aTime) ? 0 : aTime;
  const normalizedB = Number.isNaN(bTime) ? 0 : bTime;
  return normalizedB - normalizedA;
}

function compareNumberDescending(a, b) {
  return (b ?? 0) - (a ?? 0);
}

function normalizeEvaluationPath({ repoRoot, inputPath, fieldName }) {
  if (typeof inputPath !== "string" || inputPath.trim() === "") {
    throw new Error(`${fieldName} must be a non-empty string`);
  }
  if (path.isAbsolute(inputPath)) {
    throw new Error(`${fieldName} must be relative to the repository root`);
  }

  const resolved = path.resolve(repoRoot, inputPath);
  const evaluationRoot = path.resolve(repoRoot, "evaluation");
  if (
    resolved !== evaluationRoot &&
    !resolved.startsWith(`${evaluationRoot}${path.sep}`)
  ) {
    throw new Error(`${fieldName} must stay under evaluation/`);
  }
  return toPosix(path.relative(repoRoot, resolved));
}

function assertPositiveInteger(value, fieldName) {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${fieldName} must be a positive integer`);
  }
  return value;
}

function removeUndefined(value) {
  return Object.fromEntries(
    Object.entries(value).filter(([, item]) => item !== undefined),
  );
}

function stringOrDefault(value, fallback) {
  return typeof value === "string" ? value : fallback;
}

function numberOrNull(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function numberOrDefault(value, fallback) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function trimMessage(message) {
  return message.replace(/\s+/g, " ").trim().slice(0, 300);
}

function toPosix(value) {
  return value.replaceAll(path.sep, "/");
}
