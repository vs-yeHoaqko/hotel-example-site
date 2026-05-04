import path from "node:path";
import { redactText } from "./redaction.mjs";
import { createGuidance } from "./diagnostic-guidance.mjs";
import { extractPlaywrightDiagnostics } from "./playwright-diagnostics.mjs";

export const DIAGNOSTIC_TYPES = Object.freeze({
  TEST_CASE: "test_case",
  LAYER_COMMAND: "layer_command",
  RUNNER_ERROR: "runner_error",
});

export const OWNER_LAYERS = Object.freeze({
  UNIT: "unit",
  INTEGRATION: "integration",
  E2E: "e2e",
  GATE: "gate",
  UNKNOWN: "unknown",
});

export const EXCERPT_LIMIT = 600;

export async function createDiagnostics({
  layers,
  errors = [],
  repoRoot,
  runDirRel,
}) {
  const diagnostics = [];

  for (const layer of layers) {
    if (layer.status !== "failed") {
      continue;
    }

    const playwrightDiagnostics = await extractPlaywrightDiagnostics(layer, {
      repoRoot,
      runDirRel,
    });
    if (playwrightDiagnostics.length) {
      diagnostics.push(...playwrightDiagnostics);
    } else {
      diagnostics.push(
        createLayerCommandDiagnostic(layer, { repoRoot, runDirRel }),
      );
    }
  }

  for (const [index, error] of errors.entries()) {
    diagnostics.push(createRunnerErrorDiagnostic(error, index));
  }

  return diagnostics.map((diagnostic, index) =>
    finalizeDiagnostic(diagnostic, index),
  );
}

export function createLayerCommandDiagnostic(
  layer,
  { repoRoot, runDirRel } = {},
) {
  const message = summarizeLayerFailure(layer);
  return {
    type: DIAGNOSTIC_TYPES.LAYER_COMMAND,
    layer: layer.name,
    ownerLayer: ownerLayerForLayer(layer.name),
    classification: layer.classification ?? "unknown",
    title: `${layer.name} layer failed`,
    source: null,
    message,
    excerpt: boundedExcerpt(
      [layer.stderr, layer.stdout].filter(Boolean).join("\n"),
    ),
    expected: null,
    actual: null,
    reproduction: {
      level: "layer",
      display: layer.command?.display ?? "",
    },
    artifacts: artifactReferences(layer.artifacts ?? [], {
      repoRoot,
      runDirRel,
    }),
  };
}

export function createRunnerErrorDiagnostic(error, index = 0) {
  return {
    id: `runner-${String(index + 1).padStart(3, "0")}`,
    type: DIAGNOSTIC_TYPES.RUNNER_ERROR,
    layer: "gate",
    ownerLayer: OWNER_LAYERS.GATE,
    classification: "test",
    title: "Evaluation runner error",
    source: null,
    message: firstNonEmptyLine(error) ?? "Evaluation runner error.",
    excerpt: boundedExcerpt(error),
    expected: null,
    actual: null,
    reproduction: {
      level: "layer",
      display: "node evaluation/bin/run-evaluation.mjs --mode gate",
    },
    artifacts: [],
  };
}

export function boundedExcerpt(value, limit = EXCERPT_LIMIT) {
  if (typeof value !== "string") {
    return null;
  }
  const normalized = redactText(value).replace(/\s+\n/g, "\n").trim();
  if (!normalized) {
    return null;
  }
  if (normalized.length <= limit) {
    return normalized;
  }
  return `${normalized.slice(0, limit - 3).trimEnd()}...`;
}

export function artifactReferences(artifacts, { repoRoot, runDirRel } = {}) {
  return artifacts
    .map((artifact) =>
      normalizeRunRelativePath(artifact, { repoRoot, runDirRel }),
    )
    .filter(Boolean)
    .map((artifactPath) => ({
      path: artifactPath,
      kind: artifactKind(artifactPath),
      label: artifactLabel(artifactPath),
    }));
}

export function normalizeRunRelativePath(value, { repoRoot, runDirRel } = {}) {
  if (!value || typeof value !== "string") {
    return null;
  }
  const normalized = value.replaceAll("\\", "/");
  const runDirNormalized = runDirRel?.replaceAll("\\", "/");

  if (path.isAbsolute(value)) {
    if (!repoRoot || !runDirRel) {
      return null;
    }
    const runDirAbs = path.resolve(repoRoot, runDirRel);
    const relative = path.relative(runDirAbs, value).replaceAll(path.sep, "/");
    if (relative.startsWith("..") || path.isAbsolute(relative)) {
      return null;
    }
    return relative;
  }

  if (runDirNormalized && normalized.startsWith(`${runDirNormalized}/`)) {
    return normalized.slice(runDirNormalized.length + 1);
  }

  if (normalized.startsWith("../") || normalized === "..") {
    return null;
  }

  return normalized;
}

export function ownerLayerForLayer(layerName) {
  if (layerName === "unit") {
    return OWNER_LAYERS.UNIT;
  }
  if (layerName === "integration") {
    return OWNER_LAYERS.INTEGRATION;
  }
  if (layerName === "smoke-e2e" || layerName === "full-e2e") {
    return OWNER_LAYERS.E2E;
  }
  if (layerName === "static") {
    return OWNER_LAYERS.GATE;
  }
  return OWNER_LAYERS.UNKNOWN;
}

export function finalizeDiagnostic(diagnostic, index = 0) {
  const withId = {
    id:
      diagnostic.id ??
      `${diagnostic.layer}-${String(index + 1).padStart(3, "0")}`,
    ...diagnostic,
  };
  return {
    ...withId,
    message: redactText(withId.message),
    excerpt: boundedExcerpt(withId.excerpt),
    expected: boundedExcerpt(withId.expected),
    actual: boundedExcerpt(withId.actual),
    reproduction: {
      ...withId.reproduction,
      display: redactText(withId.reproduction?.display ?? ""),
    },
    guidance: createGuidance(withId),
  };
}

function summarizeLayerFailure(layer) {
  if (layer.timedOut) {
    return `${layer.name} timed out after ${layer.durationMs}ms.`;
  }
  if (layer.startError) {
    return `Failed to start ${layer.name}: ${layer.startError}`;
  }
  const line =
    firstNonEmptyLine(layer.stderr) ?? firstNonEmptyLine(layer.stdout);
  return line ?? `${layer.name} exited with code ${layer.exitCode}.`;
}

function firstNonEmptyLine(value) {
  if (typeof value !== "string") {
    return null;
  }
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find(Boolean);
}

function artifactKind(artifactPath) {
  const lower = artifactPath.toLowerCase();
  if (lower.endsWith(".stdout.log")) {
    return "stdout";
  }
  if (lower.endsWith(".stderr.log")) {
    return "stderr";
  }
  if (lower.endsWith(".json")) {
    return "playwright_json";
  }
  if (lower.endsWith(".zip")) {
    return "trace";
  }
  if (/\.(png|jpg|jpeg)$/.test(lower)) {
    return "screenshot";
  }
  if (lower.endsWith(".webm")) {
    return "video";
  }
  return "other";
}

function artifactLabel(artifactPath) {
  const kind = artifactKind(artifactPath);
  if (kind === "stdout") {
    return "stdout log";
  }
  if (kind === "stderr") {
    return "stderr log";
  }
  if (kind === "playwright_json") {
    return "Playwright JSON result";
  }
  return artifactPath.split("/").at(-1);
}
