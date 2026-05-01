import path from "node:path";

const MODES = new Set(["gate", "full", "collect-all"]);

export function parseCliArgs(argv, { repoRoot = process.cwd() } = {}) {
  const options = {
    mode: "gate",
    configPath: "evaluation/config/evaluation.config.json",
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--mode") {
      const mode = argv[++i];
      if (!MODES.has(mode)) {
        throw new Error(
          `Invalid --mode "${mode}". Use gate, full, or collect-all.`,
        );
      }
      options.mode = mode;
    } else if (arg === "--config") {
      const configPath = argv[++i];
      if (!configPath) {
        throw new Error("Missing value for --config.");
      }
      options.configPath = validateConfigPath(configPath, repoRoot);
    } else if (arg === "--help" || arg === "-h") {
      options.help = true;
    } else if (arg.startsWith("--")) {
      throw new Error(`Unknown option "${arg}".`);
    } else {
      throw new Error(`Unexpected positional argument "${arg}".`);
    }
  }

  options.configPath = validateConfigPath(options.configPath, repoRoot);
  return options;
}

export function usage() {
  return [
    "Usage: node evaluation/bin/run-evaluation.mjs --mode gate|full|collect-all [--config evaluation/config/file.json]",
    "",
    "Options:",
    "  --mode    Select the runner mode. Defaults to gate.",
    "  --config  Select an alternate config under evaluation/config/.",
  ].join("\n");
}

function validateConfigPath(configPath, repoRoot) {
  const normalized = configPath.replaceAll("\\", "/");
  const resolved = path.resolve(repoRoot, normalized);
  const configRoot = path.resolve(repoRoot, "evaluation/config");
  if (!resolved.startsWith(configRoot + path.sep) && resolved !== configRoot) {
    throw new Error("--config must point to a file under evaluation/config/.");
  }
  if (!normalized.endsWith(".json")) {
    throw new Error("--config must point to a JSON file.");
  }
  return path.relative(repoRoot, resolved).replaceAll(path.sep, "/");
}
