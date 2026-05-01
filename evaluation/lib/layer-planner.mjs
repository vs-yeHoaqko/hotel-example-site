import { spawnSync } from "node:child_process";

export function selectLayers(config, mode) {
  return config.layers.filter((layer) => layer.modes.includes(mode));
}

export function getMissingRequirements(layer) {
  const missing = [];
  for (const requirement of layer.requires) {
    if (!isRequirementAvailable(requirement)) {
      missing.push(requirement);
    }
  }
  return missing;
}

export function getDependencySkipReason(layer, resultsByName) {
  for (const dependency of layer.dependsOn) {
    const result = resultsByName.get(dependency);
    if (result && result.status !== "passed") {
      return `Skipped because dependency "${dependency}" did not pass.`;
    }
  }
  return null;
}

function isRequirementAvailable(requirement) {
  if (requirement === "node") {
    return true;
  }
  if (requirement === "dev-server") {
    return true;
  }
  if (requirement === "pnpm") {
    return (
      commandSucceeds("pnpm", ["--version"]) ||
      commandSucceeds("corepack", ["pnpm", "--version"])
    );
  }
  if (requirement === "playwright") {
    return commandSucceeds("node", [
      "node_modules/@playwright/test/cli.js",
      "--version",
    ]);
  }
  return false;
}

function commandSucceeds(command, args) {
  const result = spawnSync(command, args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    shell: false,
  });
  return result.status === 0;
}
