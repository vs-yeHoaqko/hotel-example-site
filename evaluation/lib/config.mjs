import { readFile } from "node:fs/promises";
import path from "node:path";

const ALLOWED_REQUIRES = new Set(["node", "pnpm", "playwright", "dev-server"]);
const ALLOWED_MODES = new Set(["gate", "full", "collect-all"]);

export async function loadEvaluationConfig(
  configPath,
  { repoRoot = process.cwd() } = {},
) {
  const absolutePath = path.resolve(repoRoot, configPath);
  const config = JSON.parse(await readFile(absolutePath, "utf8"));
  validateConfig(config);
  return config;
}

export function validateConfig(config) {
  if (!config || typeof config !== "object") {
    throw new Error("Evaluation config must be an object.");
  }
  if (config.schemaVersion !== 1) {
    throw new Error("Evaluation config schemaVersion must be 1.");
  }
  if (!Array.isArray(config.layers) || config.layers.length === 0) {
    throw new Error("Evaluation config must define a non-empty layers array.");
  }

  const names = new Set();
  for (const layer of config.layers) {
    validateLayer(layer, names);
  }
}

function validateLayer(layer, names) {
  if (!layer || typeof layer !== "object") {
    throw new Error("Layer must be an object.");
  }
  if (!layer.name || typeof layer.name !== "string") {
    throw new Error("Layer name must be a string.");
  }
  if (names.has(layer.name)) {
    throw new Error(`Duplicate layer name "${layer.name}".`);
  }
  names.add(layer.name);
  if (typeof layer.required !== "boolean") {
    throw new Error(`Layer "${layer.name}" must define required as boolean.`);
  }
  if (
    !Array.isArray(layer.modes) ||
    layer.modes.some((mode) => !ALLOWED_MODES.has(mode))
  ) {
    throw new Error(`Layer "${layer.name}" has invalid modes.`);
  }
  if (!Number.isInteger(layer.timeoutMs) || layer.timeoutMs <= 0) {
    throw new Error(`Layer "${layer.name}" must define a positive timeoutMs.`);
  }
  if (
    !Array.isArray(layer.command) ||
    layer.command.some((arg) => typeof arg !== "string")
  ) {
    throw new Error(`Layer "${layer.name}" command must be an argv array.`);
  }
  if (
    !Array.isArray(layer.dependsOn) ||
    layer.dependsOn.some((item) => typeof item !== "string")
  ) {
    throw new Error(
      `Layer "${layer.name}" dependsOn must be an array of strings.`,
    );
  }
  if (
    !Array.isArray(layer.requires) ||
    layer.requires.some((item) => !ALLOWED_REQUIRES.has(item))
  ) {
    throw new Error(`Layer "${layer.name}" has unsupported requires entries.`);
  }
}
