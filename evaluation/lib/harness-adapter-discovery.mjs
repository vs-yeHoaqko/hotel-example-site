import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

const DEFAULT_TEST_ROOTS = [
  "evaluation/tests/unit",
  "evaluation/tests/integration",
  "evaluation/tests/e2e",
  "tests/unit",
  "tests/integration",
  "tests/e2e",
  "e2e",
];

const PLAYWRIGHT_CONFIGS = [
  "playwright.config.js",
  "playwright.config.mjs",
  "playwright.config.ts",
  "evaluation/config/playwright.shared.mjs",
  "evaluation/config/playwright.integration.config.mjs",
  "evaluation/config/playwright.smoke.config.mjs",
  "evaluation/config/playwright.full.config.mjs",
];

export async function discoverRepository({ repoRoot = process.cwd() } = {}) {
  const facts = [];
  await discoverPackageJson(repoRoot, facts);
  await discoverTestRoots(repoRoot, facts);
  await discoverCiFiles(repoRoot, facts);
  await discoverIgnoreRules(repoRoot, facts);
  await discoverConfigFiles(repoRoot, facts);
  facts.push({
    id: "tool-node",
    type: "tool",
    value: "node",
    sourcePath: "process.version",
    confidence: "high",
    status: "discovered",
  });
  return {
    repoRoot,
    facts: sortFacts(facts),
  };
}

export function summarizeDiscovery(discovery) {
  const facts = discovery.facts ?? [];
  return {
    totalFacts: facts.length,
    scripts: facts.filter((fact) => fact.type === "script").length,
    testRoots: facts.filter((fact) => fact.type === "test-root").length,
    ciFiles: facts.filter((fact) => fact.type === "ci-file").length,
    ignoreRules: facts.filter((fact) => fact.type === "ignore-rule").length,
  };
}

export function findFacts(discovery, type) {
  return (discovery.facts ?? []).filter((fact) => fact.type === type);
}

async function discoverPackageJson(repoRoot, facts) {
  const packagePath = path.join(repoRoot, "package.json");
  const packageJson = await readJsonIfExists(packagePath);
  if (!packageJson) {
    facts.push(
      fact("package-manager", "unknown", "package.json", "low", "inferred"),
    );
    return;
  }

  const packageManager = inferPackageManager(repoRoot, packageJson);
  facts.push(fact("package-manager", packageManager, "package.json", "high"));

  for (const [scriptName, scriptCommand] of Object.entries(
    packageJson.scripts ?? {},
  )) {
    facts.push({
      id: `script-${scriptName}`,
      type: "script",
      value: scriptName,
      command: scriptCommand,
      sourcePath: "package.json",
      confidence: "high",
      status: "discovered",
    });
  }
}

async function discoverTestRoots(repoRoot, facts) {
  for (const testRoot of DEFAULT_TEST_ROOTS) {
    if (await isDirectory(path.join(repoRoot, testRoot))) {
      facts.push(fact("test-root", normalizePath(testRoot), testRoot, "high"));
    }
  }
}

async function discoverCiFiles(repoRoot, facts) {
  const workflowsDir = path.join(repoRoot, ".github/workflows");
  if (!(await isDirectory(workflowsDir))) {
    return;
  }
  const entries = await readdir(workflowsDir, { withFileTypes: true });
  for (const entry of entries) {
    if (
      entry.isFile() &&
      (entry.name.endsWith(".yml") || entry.name.endsWith(".yaml"))
    ) {
      const sourcePath = normalizePath(
        path.join(".github/workflows", entry.name),
      );
      facts.push(fact("ci-file", "github-actions", sourcePath, "medium"));
    }
  }
}

async function discoverIgnoreRules(repoRoot, facts) {
  const ignoreFiles = [
    ".gitignore",
    ".prettierignore",
    "evaluation/.gitignore",
  ];
  for (const ignoreFile of ignoreFiles) {
    const content = await readTextIfExists(path.join(repoRoot, ignoreFile));
    if (!content) {
      continue;
    }
    for (const rawLine of content.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) {
        continue;
      }
      const normalized = normalizeIgnoreRule(line);
      facts.push({
        id: `ignore-${normalized.replaceAll("/", "-")}-${ignoreFile.replaceAll("/", "-")}`,
        type: "ignore-rule",
        value: normalized,
        sourcePath: ignoreFile,
        confidence: "medium",
        status: "discovered",
      });
    }
  }
}

async function discoverConfigFiles(repoRoot, facts) {
  for (const configPath of PLAYWRIGHT_CONFIGS) {
    if (await isFile(path.join(repoRoot, configPath))) {
      facts.push(
        fact("config-file", normalizePath(configPath), configPath, "high"),
      );
    }
  }
}

async function readJsonIfExists(filePath) {
  try {
    return JSON.parse(await readFile(filePath, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") {
      return null;
    }
    throw error;
  }
}

async function readTextIfExists(filePath) {
  try {
    return await readFile(filePath, "utf8");
  } catch (error) {
    if (error.code === "ENOENT") {
      return null;
    }
    throw error;
  }
}

async function isDirectory(filePath) {
  try {
    return (await stat(filePath)).isDirectory();
  } catch (error) {
    if (error.code === "ENOENT") {
      return false;
    }
    throw error;
  }
}

async function isFile(filePath) {
  try {
    return (await stat(filePath)).isFile();
  } catch (error) {
    if (error.code === "ENOENT") {
      return false;
    }
    throw error;
  }
}

function inferPackageManager(repoRoot, packageJson) {
  if (typeof packageJson.packageManager === "string") {
    return packageJson.packageManager.split("@")[0];
  }
  const devPackageManager = packageJson.devEngines?.packageManager?.[0]?.name;
  if (devPackageManager) {
    return devPackageManager;
  }
  return "unknown";
}

function fact(type, value, sourcePath, confidence, status = "discovered") {
  return {
    id: `${type}-${String(value).replaceAll("/", "-")}`,
    type,
    value,
    sourcePath: normalizePath(sourcePath),
    confidence,
    status,
  };
}

function sortFacts(facts) {
  return [...facts].sort((a, b) => a.id.localeCompare(b.id));
}

function normalizePath(value) {
  return String(value).replaceAll("\\", "/");
}

function normalizeIgnoreRule(rule) {
  let normalized = rule.replaceAll("\\", "/");
  normalized = normalized.replace(/^\//, "");
  normalized = normalized.replace(/\/$/, "");
  return normalized;
}
