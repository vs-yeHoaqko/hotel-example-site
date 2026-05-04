import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import {
  assertPositiveInteger,
  normalizeEvaluationPath,
  stringOrDefault,
  toPosix,
} from "./run-health-common.mjs";

export const DEFAULT_TEST_MEANINGFULNESS_CONFIG_PATH =
  "evaluation/config/test-meaningfulness.config.json";

const TEST_FILE_PATTERN = /\.(spec|test)\.(mjs|js|ts)$/;

export async function createTestMeaningfulnessModel({
  repoRoot = process.cwd(),
  configPath = DEFAULT_TEST_MEANINGFULNESS_CONFIG_PATH,
  reportPath,
} = {}) {
  const config = await loadTestMeaningfulnessConfig({
    repoRoot,
    configPath,
    overrides: { reportPath },
  });
  const warnings = [];
  const files = await readTestFiles({ repoRoot, config, warnings });
  const tests = [];

  for (const file of files) {
    const content = await readFile(path.resolve(repoRoot, file.path), "utf8");
    tests.push(
      ...extractTests({
        file,
        content,
      }),
    );
  }

  return {
    metadata: {
      command: "node evaluation/bin/generate-test-meaningfulness.mjs",
      configPath: config.configPath,
      reportPath: config.reportPath,
      testRoots: config.testRoots,
    },
    summary: createSummary(tests),
    files: createFileSummaries(files, tests),
    tests,
    weakSignals: tests.filter((test) => !test.meaningful),
    warnings,
  };
}

export async function loadTestMeaningfulnessConfig({
  repoRoot = process.cwd(),
  configPath = DEFAULT_TEST_MEANINGFULNESS_CONFIG_PATH,
  overrides = {},
} = {}) {
  const normalizedConfigPath = normalizeEvaluationPath({
    repoRoot,
    inputPath: configPath,
    fieldName: "configPath",
  });
  const rawConfig = JSON.parse(
    await readFile(path.resolve(repoRoot, normalizedConfigPath), "utf8"),
  );
  const config = {
    ...rawConfig,
    ...removeUndefined(overrides),
    configPath: normalizedConfigPath,
  };

  if (config.schemaVersion !== 1) {
    throw new Error("test-meaningfulness config schemaVersion must be 1");
  }
  if (!Array.isArray(config.testRoots) || config.testRoots.length === 0) {
    throw new Error("testRoots must contain at least one root");
  }

  return {
    schemaVersion: 1,
    configPath: normalizedConfigPath,
    reportPath: normalizeEvaluationPath({
      repoRoot,
      inputPath: config.reportPath,
      fieldName: "reportPath",
    }),
    testRoots: config.testRoots.map((root, index) => ({
      path: normalizeRepoPath({
        repoRoot,
        inputPath: root.path,
        fieldName: `testRoots.${index}.path`,
      }),
      defaultLayer: requireString(
        root.defaultLayer,
        `testRoots.${index}.defaultLayer`,
      ),
      source: requireString(root.source, `testRoots.${index}.source`),
    })),
  };
}

async function readTestFiles({ repoRoot, config, warnings }) {
  const files = [];
  for (const root of config.testRoots) {
    const absoluteRoot = path.resolve(repoRoot, root.path);
    const rootFiles = await readFilesRecursive(
      absoluteRoot,
      warnings,
      root.path,
    );
    for (const absolutePath of rootFiles) {
      const relativePath = toPosix(path.relative(repoRoot, absolutePath));
      if (!TEST_FILE_PATTERN.test(relativePath)) {
        continue;
      }
      files.push({
        path: relativePath,
        defaultLayer: root.defaultLayer,
        source: root.source,
      });
    }
  }
  return files.sort((a, b) => a.path.localeCompare(b.path));
}

async function readFilesRecursive(absoluteDirectory, warnings, label) {
  let entries;
  try {
    entries = await readdir(absoluteDirectory, { withFileTypes: true });
  } catch (error) {
    if (error?.code === "ENOENT") {
      warnings.push(`${label}: directory does not exist`);
      return [];
    }
    throw error;
  }

  const files = [];
  for (const entry of entries) {
    const absolutePath = path.join(absoluteDirectory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await readFilesRecursive(absolutePath, warnings, label)));
    } else if (entry.isFile()) {
      files.push(absolutePath);
    }
  }
  return files;
}

function extractTests({ file, content }) {
  const definitions = findTestDefinitions(content);
  return definitions.map((definition, index) => {
    const bodyEnd =
      index + 1 < definitions.length
        ? definitions[index + 1].index
        : content.length;
    const testBody = content.slice(definition.bodyStart, bodyEnd);
    const assertionCount = countAssertionCalls(testBody);
    const classification = classifyTest({
      file: file.path,
      defaultLayer: file.defaultLayer,
      source: file.source,
      title: definition.title,
    });

    return {
      file: file.path,
      line: lineNumberAt(content, definition.index),
      title: definition.title,
      assertionCount,
      meaningful: assertionCount > 0,
      ...classification,
    };
  });
}

function findTestDefinitions(content) {
  const definitions = [];
  scanCode(content, (index) => {
    if (!startsWithIdentifier(content, index, "test")) {
      return;
    }
    let cursor = index + "test".length;
    if (content.startsWith(".describe", cursor)) {
      return;
    }
    cursor = skipWhitespace(content, cursor);
    if (content[cursor] !== "(") {
      return;
    }
    cursor = skipWhitespace(content, cursor + 1);
    if (!isQuote(content[cursor])) {
      return;
    }
    const parsed = parseStringLiteral(content, cursor);
    if (!parsed) {
      return;
    }
    definitions.push({
      index,
      bodyStart: parsed.end,
      title: parsed.value,
    });
  });
  return definitions;
}

function countAssertionCalls(content) {
  let count = 0;
  scanCode(content, (index) => {
    if (startsWithIdentifier(content, index, "expect")) {
      const cursor = skipWhitespace(content, index + "expect".length);
      if (content[cursor] === "(") {
        count += 1;
      }
      return;
    }
    if (startsWithIdentifier(content, index, "assert")) {
      let cursor = index + "assert".length;
      if (content[cursor] !== ".") {
        return;
      }
      cursor += 1;
      while (isIdentifierChar(content[cursor])) {
        cursor += 1;
      }
      cursor = skipWhitespace(content, cursor);
      if (content[cursor] === "(") {
        count += 1;
      }
    }
  });
  return count;
}

function classifyTest({ file, defaultLayer, source, title }) {
  const normalizedTitle = title.toLowerCase();
  const normalizedFile = file.toLowerCase();

  if (normalizedFile.startsWith("e2e/")) {
    return {
      layer: "root-e2e",
      source: "root-suite",
      category: normalizedFile.includes("redirection")
        ? "product-navigation"
        : "product-journey",
    };
  }
  if (normalizedFile.startsWith("evaluation/tests/e2e/")) {
    return {
      layer: "evaluation-smoke",
      source,
      category: "smoke-journey",
    };
  }
  if (normalizedFile.startsWith("evaluation/tests/integration/")) {
    return {
      layer: "evaluation-integration",
      source,
      category: "page-local-behavior",
    };
  }
  if (normalizedFile.includes("billing.test.")) {
    return {
      layer: "product-unit",
      source,
      category: "product-domain-rule",
    };
  }
  if (
    normalizedTitle.includes("schema") ||
    normalizedTitle.includes("report") ||
    normalizedTitle.includes("diagnostic") ||
    normalizedTitle.includes("preflight") ||
    normalizedTitle.includes("thinning") ||
    normalizedTitle.includes("config") ||
    normalizedTitle.includes("classifier") ||
    normalizedFile.includes("run-health") ||
    normalizedFile.includes("diagnostic") ||
    normalizedFile.includes("preflight") ||
    normalizedFile.includes("thinning") ||
    normalizedFile.includes("summary-schema") ||
    normalizedFile.includes("migration-candidate") ||
    normalizedFile.includes("failure-classifier")
  ) {
    return {
      layer: "harness-unit",
      source,
      category: "harness-contract",
    };
  }
  return {
    layer: defaultLayer,
    source,
    category: defaultLayer === "harness-unit" ? "harness-contract" : "unknown",
  };
}

function createSummary(tests) {
  return {
    totalTests: tests.length,
    meaningfulTests: tests.filter((test) => test.meaningful).length,
    weakSignalTests: tests.filter((test) => !test.meaningful).length,
    assertionCount: tests.reduce((sum, test) => sum + test.assertionCount, 0),
    byLayer: aggregate(tests, "layer"),
    bySource: aggregate(tests, "source"),
    byCategory: aggregate(tests, "category"),
  };
}

function createFileSummaries(files, tests) {
  return files.map((file) => {
    const fileTests = tests.filter((test) => test.file === file.path);
    return {
      file: file.path,
      layer: fileTests[0]?.layer ?? file.defaultLayer,
      source: fileTests[0]?.source ?? file.source,
      testCount: fileTests.length,
      meaningfulTests: fileTests.filter((test) => test.meaningful).length,
      assertionCount: fileTests.reduce(
        (sum, test) => sum + test.assertionCount,
        0,
      ),
    };
  });
}

function aggregate(tests, key) {
  const counts = new Map();
  for (const test of tests) {
    const name = stringOrDefault(test[key], "unknown");
    const current = counts.get(name) ?? {
      tests: 0,
      meaningfulTests: 0,
      assertions: 0,
    };
    current.tests += 1;
    current.meaningfulTests += test.meaningful ? 1 : 0;
    current.assertions += test.assertionCount;
    counts.set(name, current);
  }

  return Array.from(counts.entries())
    .map(([name, value]) => ({ name, ...value }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

function normalizeRepoPath({ repoRoot, inputPath, fieldName }) {
  if (typeof inputPath !== "string" || inputPath.trim() === "") {
    throw new Error(`${fieldName} must be a non-empty string`);
  }
  if (path.isAbsolute(inputPath)) {
    throw new Error(`${fieldName} must be relative to the repository root`);
  }
  const resolved = path.resolve(repoRoot, inputPath);
  const relative = path.relative(repoRoot, resolved);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`${fieldName} must stay under the repository root`);
  }
  return toPosix(relative);
}

function requireString(value, fieldName) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${fieldName} must be a non-empty string`);
  }
  return value;
}

function lineNumberAt(content, index) {
  return assertPositiveInteger(
    content.slice(0, index).split("\n").length,
    "line",
  );
}

function scanCode(content, visit) {
  let index = 0;
  let state = "code";
  let quote = "";
  while (index < content.length) {
    const char = content[index];
    const next = content[index + 1];

    if (state === "line-comment") {
      if (char === "\n") {
        state = "code";
      }
      index += 1;
      continue;
    }
    if (state === "block-comment") {
      if (char === "*" && next === "/") {
        state = "code";
        index += 2;
      } else {
        index += 1;
      }
      continue;
    }
    if (state === "string") {
      if (char === "\\") {
        index += 2;
        continue;
      }
      if (char === quote) {
        state = "code";
      }
      index += 1;
      continue;
    }

    if (char === "/" && next === "/") {
      state = "line-comment";
      index += 2;
      continue;
    }
    if (char === "/" && next === "*") {
      state = "block-comment";
      index += 2;
      continue;
    }
    if (isQuote(char)) {
      state = "string";
      quote = char;
      index += 1;
      continue;
    }

    visit(index);
    index += 1;
  }
}

function parseStringLiteral(content, start) {
  const quote = content[start];
  let value = "";
  for (let index = start + 1; index < content.length; index += 1) {
    const char = content[index];
    if (char === "\\") {
      value += content[index + 1] ?? "";
      index += 1;
      continue;
    }
    if (char === quote) {
      return {
        value,
        end: index + 1,
      };
    }
    value += char;
  }
  return null;
}

function startsWithIdentifier(content, index, identifier) {
  if (!content.startsWith(identifier, index)) {
    return false;
  }
  const before = content[index - 1];
  const after = content[index + identifier.length];
  return !isIdentifierChar(before) && !isIdentifierChar(after);
}

function skipWhitespace(content, index) {
  let cursor = index;
  while (/\s/.test(content[cursor] ?? "")) {
    cursor += 1;
  }
  return cursor;
}

function isQuote(value) {
  return value === "'" || value === '"' || value === "`";
}

function isIdentifierChar(value) {
  return typeof value === "string" && /[A-Za-z0-9_$]/.test(value);
}

function removeUndefined(value) {
  return Object.fromEntries(
    Object.entries(value).filter(([, item]) => item !== undefined),
  );
}
