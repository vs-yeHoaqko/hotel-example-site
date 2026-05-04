import {
  DEFAULT_RUN_HEALTH_CONFIG_PATH,
  loadRunHealthConfig,
} from "./run-health-config.mjs";
import { createBaselineComparison } from "./run-health-baseline.mjs";
import {
  addLayerInstabilityEvidence,
  readRunHealthEvidence,
} from "./run-health-evidence.mjs";
import { readRunSummaries } from "./run-health-summaries.mjs";

export { DEFAULT_RUN_HEALTH_CONFIG_PATH, loadRunHealthConfig };

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
  const trendSummary = createTrendSummary(selectedRuns);
  const baselineComparison = await createBaselineComparison({
    repoRoot,
    baselinePath: config.baselinePath,
    selectedRuns,
    warnings,
  });
  const slowLayers = layerHealth
    .filter((layer) => layer.slow)
    .sort(compareSlowLayers);
  const {
    slowTests,
    instabilityEvidence,
    environmentEvidence,
    preflightEvidence,
  } = await readRunHealthEvidence({
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
      baselinePath: config.baselinePath,
      maxRuns: config.maxRuns,
      topSlowTests: config.topSlowTests,
      testSlowThresholdMs: config.testSlowThresholdMs,
      layerThresholdsMs: config.layerThresholdsMs,
      selectedRunIds: selectedRuns.map((run) => run.runId),
    },
    selectedRuns,
    layerHealth,
    trendSummary,
    baselineComparison,
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

function createTrendSummary(selectedRuns) {
  const statusCounts = {};
  const layerObservations = new Map();

  for (const run of selectedRuns) {
    statusCounts[run.status] = (statusCounts[run.status] ?? 0) + 1;
    for (const layer of run.layers) {
      if (!layerObservations.has(layer.name)) {
        layerObservations.set(layer.name, []);
      }
      layerObservations.get(layer.name).push({
        runId: run.runId,
        status: layer.status,
        durationMs: layer.durationMs,
        slow: layer.slow,
        failed: isFailedLayer(layer),
      });
    }
  }

  return {
    selectedRunCount: selectedRuns.length,
    statusCounts: sortObjectByKey(statusCounts),
    limitedEvidence: selectedRuns.length < 2,
    layerTrends: Array.from(layerObservations.entries())
      .map(([layer, observations]) => createLayerTrend(layer, observations))
      .sort((a, b) => a.layer.localeCompare(b.layer)),
  };
}

function createLayerTrend(layer, observations) {
  const latest = observations[0];
  const previous = observations[1] ?? null;
  return {
    layer,
    latestRunId: latest?.runId ?? null,
    latestStatus: latest?.status ?? "unknown",
    latestDurationMs: latest?.durationMs ?? null,
    previousRunId: previous?.runId ?? null,
    previousDurationMs: previous?.durationMs ?? null,
    deltaMs:
      typeof latest?.durationMs === "number" &&
      typeof previous?.durationMs === "number"
        ? latest.durationMs - previous.durationMs
        : null,
    observationCount: observations.length,
    slowCount: observations.filter((item) => item.slow).length,
    failedCount: observations.filter((item) => item.failed).length,
  };
}

function isFailedLayer(layer) {
  return (
    layer.timedOut ||
    ["failed", "timedOut", "interrupted"].includes(layer.status)
  );
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

function compareNumberDescending(a, b) {
  return (b ?? 0) - (a ?? 0);
}

function sortObjectByKey(value) {
  return Object.fromEntries(
    Object.entries(value).sort(([left], [right]) => left.localeCompare(right)),
  );
}
