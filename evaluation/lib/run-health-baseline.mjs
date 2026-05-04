import { readFile } from "node:fs/promises";
import path from "node:path";

export async function createBaselineComparison({
  repoRoot = process.cwd(),
  baselinePath = "evaluation/baselines/run-health-baseline.json",
  selectedRuns = [],
  warnings = [],
} = {}) {
  const baseline = await loadRunHealthBaseline({
    repoRoot,
    baselinePath,
    warnings,
  });
  if (!baseline) {
    return {
      available: false,
      baselinePath,
      summary: emptyBaselineCounts(),
      layers: [],
      notes: [],
    };
  }

  const latestRun = selectedRuns[0] ?? null;
  const observedByLayer = new Map(
    (latestRun?.layers ?? []).map((layer) => [layer.name, layer]),
  );
  const baselineLayerNames = new Set(
    baseline.layers.map((layer) => layer.name),
  );
  const comparisons = [];

  for (const baselineLayer of baseline.layers) {
    if (
      latestRun &&
      baselineLayer.modes.length > 0 &&
      !baselineLayer.modes.includes(latestRun.mode)
    ) {
      continue;
    }
    comparisons.push(
      compareLayerToBaseline({
        runId: latestRun?.runId ?? null,
        observed: observedByLayer.get(baselineLayer.name) ?? null,
        baseline: baselineLayer,
      }),
    );
  }

  for (const observed of latestRun?.layers ?? []) {
    if (!baselineLayerNames.has(observed.name)) {
      comparisons.push({
        layer: observed.name,
        status: "new",
        runId: latestRun.runId,
        observedStatus: observed.status,
        observedDurationMs: observed.durationMs,
        baselineStatus: null,
        baselineDurationMs: null,
        toleranceMs: null,
        message: "Layer exists in the latest run but not in the baseline.",
      });
    }
  }

  comparisons.sort((a, b) => a.layer.localeCompare(b.layer));

  return {
    available: true,
    baselinePath,
    updatedFrom: baseline.updatedFrom,
    notes: baseline.notes,
    summary: countBaselineComparison(comparisons),
    layers: comparisons,
  };
}

async function loadRunHealthBaseline({ repoRoot, baselinePath, warnings }) {
  try {
    const baseline = JSON.parse(
      await readFile(path.resolve(repoRoot, baselinePath), "utf8"),
    );
    return validateRunHealthBaseline(baseline, baselinePath);
  } catch (error) {
    if (error?.code === "ENOENT") {
      warnings.push(`${baselinePath}: missing baseline`);
      return null;
    }
    if (error instanceof SyntaxError) {
      warnings.push(`${baselinePath}: malformed baseline JSON`);
      return null;
    }
    throw error;
  }
}

function validateRunHealthBaseline(baseline, baselinePath) {
  if (!baseline || typeof baseline !== "object" || Array.isArray(baseline)) {
    throw new Error(`${baselinePath}: baseline must be an object`);
  }
  if (baseline.schemaVersion !== 1) {
    throw new Error(`${baselinePath}: schemaVersion must be 1`);
  }
  if (!Array.isArray(baseline.layers)) {
    throw new Error(`${baselinePath}: layers must be an array`);
  }

  return {
    updatedFrom:
      typeof baseline.updatedFrom === "string" ? baseline.updatedFrom : "",
    notes: Array.isArray(baseline.notes)
      ? baseline.notes.filter((note) => typeof note === "string")
      : [],
    layers: baseline.layers.map((layer, index) =>
      validateBaselineLayer(layer, `${baselinePath}.layers[${index}]`),
    ),
  };
}

function validateBaselineLayer(layer, label) {
  if (!layer || typeof layer !== "object" || Array.isArray(layer)) {
    throw new Error(`${label}: layer baseline must be an object`);
  }
  for (const key of ["name", "expectedStatus"]) {
    if (!layer[key] || typeof layer[key] !== "string") {
      throw new Error(`${label}.${key}: required string property is missing`);
    }
  }
  for (const key of ["durationMs", "durationToleranceMs"]) {
    if (!Number.isFinite(layer[key]) || layer[key] < 0) {
      throw new Error(`${label}.${key}: must be a non-negative number`);
    }
  }
  return {
    name: layer.name,
    expectedStatus: layer.expectedStatus,
    durationMs: layer.durationMs,
    durationToleranceMs: layer.durationToleranceMs,
    slowAllowed: layer.slowAllowed === true,
    timeoutAllowed: layer.timeoutAllowed === true,
    modes: Array.isArray(layer.modes)
      ? layer.modes.filter((mode) => typeof mode === "string")
      : [],
  };
}

function compareLayerToBaseline({ runId, observed, baseline }) {
  if (!observed) {
    return {
      layer: baseline.name,
      status: "missing",
      runId,
      observedStatus: null,
      observedDurationMs: null,
      baselineStatus: baseline.expectedStatus,
      baselineDurationMs: baseline.durationMs,
      toleranceMs: baseline.durationToleranceMs,
      message:
        "Layer is present in the baseline but missing from the latest run.",
    };
  }

  const reasons = [];
  if (observed.status !== baseline.expectedStatus) {
    reasons.push(
      `status ${observed.status} differs from expected ${baseline.expectedStatus}`,
    );
  }
  if (observed.timedOut && !baseline.timeoutAllowed) {
    reasons.push("timeout is not allowed by baseline");
  }
  if (observed.slow && !baseline.slowAllowed) {
    reasons.push("slow evidence is not allowed by baseline");
  }
  if (
    observed.durationMs >
    baseline.durationMs + baseline.durationToleranceMs
  ) {
    reasons.push(
      `duration ${observed.durationMs}ms exceeds baseline ${baseline.durationMs}ms + tolerance ${baseline.durationToleranceMs}ms`,
    );
  }

  let status = "unchanged";
  if (reasons.length > 0) {
    status = "regressed";
  } else if (
    observed.durationMs <
    baseline.durationMs - baseline.durationToleranceMs
  ) {
    status = "improved";
  }

  return {
    layer: baseline.name,
    status,
    runId,
    observedStatus: observed.status,
    observedDurationMs: observed.durationMs,
    baselineStatus: baseline.expectedStatus,
    baselineDurationMs: baseline.durationMs,
    toleranceMs: baseline.durationToleranceMs,
    message:
      reasons.join("; ") ||
      (status === "improved"
        ? "Layer is faster than the baseline tolerance."
        : "Layer is within baseline tolerance."),
  };
}

function countBaselineComparison(comparisons) {
  const counts = emptyBaselineCounts();
  for (const comparison of comparisons) {
    counts[comparison.status] += 1;
  }
  return counts;
}

function emptyBaselineCounts() {
  return {
    improved: 0,
    unchanged: 0,
    regressed: 0,
    missing: 0,
    new: 0,
  };
}
