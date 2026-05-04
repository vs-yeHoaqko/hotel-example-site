import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  DIAGNOSTIC_TYPES,
  artifactReferences,
  boundedExcerpt,
  ownerLayerForLayer,
} from "./diagnostics.mjs";

export async function extractPlaywrightDiagnostics(
  layer,
  { repoRoot, runDirRel },
) {
  const jsonArtifacts = (layer.artifacts ?? []).filter((artifact) =>
    artifact.endsWith(".json"),
  );
  const diagnostics = [];

  for (const artifact of jsonArtifacts) {
    const artifactPath = path.resolve(repoRoot, runDirRel, artifact);
    let payload;
    try {
      payload = JSON.parse(await readFile(artifactPath, "utf8"));
    } catch {
      continue;
    }

    const failedTests = collectFailedTests(payload);
    for (const failedTest of failedTests) {
      diagnostics.push(
        createPlaywrightDiagnostic(failedTest, layer, {
          repoRoot,
          runDirRel,
          jsonArtifact: artifact,
        }),
      );
    }
  }

  return diagnostics;
}

export function collectFailedTests(payload) {
  const tests = [];
  visitSuiteList(payload?.suites, [], tests);
  return tests;
}

function visitSuiteList(suites, titlePath, tests) {
  if (!Array.isArray(suites)) {
    return;
  }
  for (const suite of suites) {
    const nextTitlePath = suite.title ? [...titlePath, suite.title] : titlePath;
    visitSpecList(suite.specs, nextTitlePath, tests);
    visitSuiteList(suite.suites, nextTitlePath, tests);
  }
}

function visitSpecList(specs, titlePath, tests) {
  if (!Array.isArray(specs)) {
    return;
  }
  for (const spec of specs) {
    const specTitle = [...titlePath, spec.title].filter(Boolean);
    for (const test of spec.tests ?? []) {
      for (const result of test.results ?? []) {
        if (
          result.status &&
          result.status !== "passed" &&
          result.status !== "skipped"
        ) {
          const error = firstError(result);
          tests.push({
            title:
              specTitle.join(" > ") || spec.title || "Failed Playwright test",
            path: spec.file ?? null,
            line: Number.isInteger(spec.line) ? spec.line : null,
            projectName: test.projectName ?? null,
            status: result.status,
            error,
            attachments: result.attachments ?? [],
          });
        }
      }
    }
  }
}

function createPlaywrightDiagnostic(
  test,
  layer,
  { repoRoot, runDirRel, jsonArtifact },
) {
  const attachmentArtifacts = test.attachments
    .map((attachment) => attachment.path)
    .filter(Boolean);
  const artifacts = artifactReferences([jsonArtifact, ...attachmentArtifacts], {
    repoRoot,
    runDirRel,
  });
  const sourcePath = normalizeSourcePath(test.path, layer.name, repoRoot);
  const source = sourcePath
    ? {
        path: sourcePath,
        line: test.line,
      }
    : null;

  return {
    type: DIAGNOSTIC_TYPES.TEST_CASE,
    layer: layer.name,
    ownerLayer: ownerLayerForLayer(layer.name),
    classification: layer.classification ?? "unknown",
    title: test.title,
    source,
    message:
      test.error?.message ?? `Playwright test ended with ${test.status}.`,
    excerpt: boundedExcerpt(test.error?.stack ?? test.error?.message ?? null),
    expected: test.error?.expected ?? null,
    actual: test.error?.actual ?? null,
    reproduction: reproductionFor({ ...test, sourcePath }, layer),
    artifacts,
  };
}

function reproductionFor(test, layer) {
  if (test.sourcePath && test.title) {
    const titlePattern = escapeDoubleQuotes(test.title.split(" > ").at(-1));
    return {
      level: "test",
      display: `${layer.command.display} ${test.sourcePath} -g "${titlePattern}"`,
    };
  }
  return {
    level: "layer",
    display: layer.command.display,
  };
}

function normalizeSourcePath(value, layerName, repoRoot) {
  if (!value || typeof value !== "string") {
    return null;
  }
  if (path.isAbsolute(value)) {
    const relative = path.relative(repoRoot, value).replaceAll(path.sep, "/");
    if (relative.startsWith("..") || path.isAbsolute(relative)) {
      return null;
    }
    return relative;
  }

  const normalized = value.replaceAll("\\", "/");
  if (normalized.startsWith("evaluation/") || normalized.startsWith("e2e/")) {
    return normalized;
  }
  const prefix = sourcePrefixForLayer(layerName);
  return prefix ? `${prefix}/${normalized}` : normalized;
}

function sourcePrefixForLayer(layerName) {
  if (layerName === "integration") {
    return "evaluation/tests/integration";
  }
  if (layerName === "smoke-e2e") {
    return "evaluation/tests/e2e";
  }
  if (layerName === "full-e2e") {
    return "e2e";
  }
  return null;
}

function firstError(result) {
  const source = result.error ?? result.errors?.[0] ?? {};
  const message = stringOrNull(source.message) ?? stringOrNull(source.value);
  const stack = stringOrNull(source.stack);
  const expected = stringOrNull(source.expected);
  const actual = stringOrNull(source.actual);
  return {
    message,
    stack,
    expected,
    actual,
  };
}

function stringOrNull(value) {
  return typeof value === "string" && value.trim() ? value : null;
}

function escapeDoubleQuotes(value) {
  return value.replaceAll('"', '\\"');
}
