#!/usr/bin/env node
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseCliArgs, usage } from "../lib/cli.mjs";
import { loadEvaluationConfig } from "../lib/config.mjs";
import { executeLayer, skippedLayerResult } from "../lib/command-executor.mjs";
import { classifyFailure } from "../lib/failure-classifier.mjs";
import { getRepositoryState } from "../lib/git-state.mjs";
import {
  getDependencySkipReason,
  getMissingRequirements,
  selectLayers,
} from "../lib/layer-planner.mjs";
import { createOwnership } from "../lib/ownership.mjs";
import { createRunId } from "../lib/run-id.mjs";
import { createSummary } from "../lib/summary-model.mjs";
import { renderSummaryMarkdown } from "../lib/summary-markdown.mjs";

const repoRoot = process.cwd();

async function main() {
  let options;
  try {
    options = parseCliArgs(process.argv.slice(2), { repoRoot });
  } catch (error) {
    console.error(error.message);
    console.error(usage());
    process.exitCode = 1;
    return;
  }

  if (options.help) {
    console.log(usage());
    return;
  }

  const startedAtDate = new Date();
  const startedAt = startedAtDate.toISOString();
  const repository = getRepositoryState({ repoRoot });
  const runId = createRunId({
    now: startedAtDate,
    branch: repository.branch,
    commit: repository.commit,
  });
  const runDirRel = `evaluation/runs/${runId}`;
  const runDirAbs = path.resolve(repoRoot, runDirRel);
  await mkdir(path.join(runDirAbs, "artifacts"), { recursive: true });
  await mkdir(path.join(runDirAbs, "logs"), { recursive: true });

  const layers = [];
  const errors = [];

  try {
    const config = await loadEvaluationConfig(options.configPath, { repoRoot });
    const selectedLayers = selectLayers(config, options.mode);
    const resultsByName = new Map();
    let stopReason = null;

    for (const layer of selectedLayers) {
      let result;
      if (stopReason && options.mode !== "collect-all") {
        result = skippedLayerResult(layer, stopReason);
      } else {
        const missingRequirements = getMissingRequirements(layer);
        const dependencySkip = getDependencySkipReason(layer, resultsByName);
        if (missingRequirements.length > 0) {
          result = skippedLayerResult(
            layer,
            `Skipped because requirements are missing: ${missingRequirements.join(", ")}.`,
            "environment",
          );
          if (layer.required && options.mode !== "collect-all") {
            stopReason = `Skipped after required layer "${layer.name}" was ineligible.`;
          }
        } else if (dependencySkip) {
          result = skippedLayerResult(layer, dependencySkip);
          if (layer.required && options.mode !== "collect-all") {
            stopReason = `Skipped after required layer "${layer.name}" was ineligible.`;
          }
        } else {
          result = await executeLayer(layer, { repoRoot, runDirRel });
          if (result.status === "failed") {
            result.classification = classifyFailure(layer, result);
          }
          if (
            result.status === "failed" &&
            layer.required &&
            options.mode !== "collect-all"
          ) {
            stopReason = `Skipped after required layer "${layer.name}" failed.`;
          }
        }
      }
      layers.push(result);
      resultsByName.set(layer.name, result);
    }
  } catch (error) {
    errors.push(error.stack || error.message);
  }

  let ownership = { schemaVersion: 1, records: [] };
  try {
    ownership = await createOwnership({ repoRoot });
    await writeFile(
      path.join(runDirAbs, "ownership.json"),
      `${JSON.stringify(ownership, null, 2)}\n`,
      "utf8",
    );
  } catch (error) {
    errors.push(error.stack || error.message);
  }

  let summary;
  try {
    summary = await createSummary({
      mode: options.mode,
      target: process.env.USE_DEPLOYED_SITE === "true" ? "deployed" : "local",
      runId,
      repository,
      startedAt,
      finishedAt: new Date().toISOString(),
      layers,
      errors,
      repoRoot,
    });
  } catch (error) {
    errors.push(error.stack || error.message);
    summary = await createSummary({
      mode: options.mode,
      target: process.env.USE_DEPLOYED_SITE === "true" ? "deployed" : "local",
      runId,
      repository,
      startedAt,
      finishedAt: new Date().toISOString(),
      layers,
      errors,
      repoRoot,
    });
  }

  await writeFile(
    path.join(runDirAbs, "summary.json"),
    `${JSON.stringify(summary, null, 2)}\n`,
    "utf8",
  );
  await writeFile(
    path.join(runDirAbs, "summary.md"),
    renderSummaryMarkdown(summary, ownership),
    "utf8",
  );

  console.log(`Evaluation run: ${runDirRel}`);
  console.log(`Status: ${summary.status}`);
  console.log(`Recommended: ${summary.recommendedNextAction.code}`);
  process.exitCode = summary.status === "passed" ? 0 : 1;
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
