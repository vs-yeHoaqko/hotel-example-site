import { readFile } from "node:fs/promises";
import { createDiagnostics } from "./diagnostics.mjs";
import { assertValid } from "./schema-validator.mjs";
import { selectRecommendedAction } from "./recommended-action.mjs";

export async function createSummary({
  mode,
  target,
  runId,
  repository,
  startedAt,
  finishedAt,
  layers,
  errors = [],
  repoRoot = process.cwd(),
  runDirRel = "",
}) {
  const publicLayers = layers.map(stripPrivateFields);
  const classifications = publicLayers
    .filter((layer) => layer.status !== "passed" && layer.classification)
    .map((layer) => layer.classification);
  const status =
    errors.length > 0
      ? "error"
      : publicLayers.some(
            (layer) =>
              layer.status === "failed" ||
              (layer.required &&
                layer.status === "skipped" &&
                layer.classification === "environment"),
          )
        ? "failed"
        : "passed";
  const diagnostics = await createDiagnostics({
    layers,
    errors,
    repoRoot,
    runDirRel,
  });
  const summary = {
    schemaVersion: 1,
    runId,
    mode,
    target,
    repository,
    startedAt,
    finishedAt,
    status,
    counts: aggregateCounts(publicLayers),
    recommendedNextAction: selectRecommendedAction(classifications),
    diagnostics,
    layers: publicLayers,
    errors,
  };
  const schema = JSON.parse(
    await readFile(
      `${repoRoot}/evaluation/schemas/summary.schema.json`,
      "utf8",
    ),
  );
  assertValid(summary, schema, "summary.json");
  return summary;
}

function stripPrivateFields(layer) {
  const { stdout, stderr, startError, ...publicLayer } = layer;
  return publicLayer;
}

function aggregateCounts(layers) {
  return layers.reduce(
    (acc, layer) => ({
      passed: acc.passed + layer.counts.passed,
      failed: acc.failed + layer.counts.failed,
      skipped: acc.skipped + layer.counts.skipped,
      timeout: acc.timeout + layer.counts.timeout,
    }),
    { passed: 0, failed: 0, skipped: 0, timeout: 0 },
  );
}
