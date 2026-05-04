import path from "node:path";
import {
  fileExists,
  numberOrNull,
  safeReaddir,
  safeReadJson,
  stringOrDefault,
  toPosix,
} from "./run-health-common.mjs";

export async function readRunSummaries({ repoRoot, config, warnings }) {
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

function compareRunsDescending(a, b) {
  const byStartedAt = compareDateDescending(a.startedAt, b.startedAt);
  if (byStartedAt !== 0) {
    return byStartedAt;
  }
  return b.runId.localeCompare(a.runId);
}

function compareDateDescending(a, b) {
  const aTime = Date.parse(a);
  const bTime = Date.parse(b);
  const normalizedA = Number.isNaN(aTime) ? 0 : aTime;
  const normalizedB = Number.isNaN(bTime) ? 0 : bTime;
  return normalizedB - normalizedA;
}
