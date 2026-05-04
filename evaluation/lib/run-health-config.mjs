import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  assertPositiveInteger,
  normalizeEvaluationPath,
  removeUndefined,
} from "./run-health-common.mjs";

export const DEFAULT_RUN_HEALTH_CONFIG_PATH =
  "evaluation/config/run-health.config.json";

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
  const baselinePath = normalizeEvaluationPath({
    repoRoot,
    inputPath:
      config.baselinePath ?? "evaluation/baselines/run-health-baseline.json",
    fieldName: "baselinePath",
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
    baselinePath,
    maxRuns: assertPositiveInteger(config.maxRuns, "maxRuns"),
    topSlowTests: assertPositiveInteger(config.topSlowTests, "topSlowTests"),
    layerThresholdsMs,
    testSlowThresholdMs: assertPositiveInteger(
      config.testSlowThresholdMs,
      "testSlowThresholdMs",
    ),
  };
}
