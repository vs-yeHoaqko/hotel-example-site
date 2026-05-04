import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";
import {
  DIAGNOSTIC_TYPES,
  artifactReferences,
  boundedExcerpt,
  createDiagnostics,
} from "../../lib/diagnostics.mjs";
import { createSummary } from "../../lib/summary-model.mjs";

const repoRoot = process.cwd();

test("passed summaries include an empty diagnostics array", async () => {
  const summary = await createSummary({
    mode: "gate",
    target: "local",
    runId: "unit-passed",
    repository: repositoryState(),
    startedAt: "2026-05-04T00:00:00.000Z",
    finishedAt: "2026-05-04T00:00:01.000Z",
    layers: [
      layer({
        status: "passed",
        artifacts: ["artifacts/not-read-results.json"],
      }),
    ],
    repoRoot,
    runDirRel: "evaluation/runs/unit-passed",
  });

  assert.deepEqual(summary.diagnostics, []);
  assert.equal(summary.recommendedNextAction.code, "none");
});

test("failed layers fall back to layer-command diagnostics", async () => {
  const [diagnostic] = await createDiagnostics({
    layers: [
      layer({
        name: "controlled-failing-fixture",
        status: "failed",
        classification: "test",
        exitCode: 1,
        stderr: "Assertion failed: expected OK\n",
        artifacts: [
          "logs/controlled-failing-fixture.stdout.log",
          "logs/controlled-failing-fixture.stderr.log",
        ],
      }),
    ],
    repoRoot,
    runDirRel: "evaluation/runs/unit-failed",
  });

  assert.equal(diagnostic.type, DIAGNOSTIC_TYPES.LAYER_COMMAND);
  assert.equal(diagnostic.layer, "controlled-failing-fixture");
  assert.equal(diagnostic.classification, "test");
  assert.equal(diagnostic.reproduction.level, "layer");
  assert.equal(diagnostic.guidance.action, "inspect_test");
  assert.deepEqual(
    diagnostic.artifacts.map((artifact) => artifact.kind),
    ["stdout", "stderr"],
  );
});

test("runner errors become schema-valid diagnostics", async () => {
  const summary = await createSummary({
    mode: "gate",
    target: "local",
    runId: "unit-runner-error",
    repository: repositoryState(),
    startedAt: "2026-05-04T00:00:00.000Z",
    finishedAt: "2026-05-04T00:00:01.000Z",
    layers: [],
    errors: ["Error: config file could not be read"],
    repoRoot,
    runDirRel: "evaluation/runs/unit-runner-error",
  });

  assert.equal(summary.status, "error");
  assert.equal(summary.diagnostics[0].type, DIAGNOSTIC_TYPES.RUNNER_ERROR);
  assert.equal(summary.diagnostics[0].ownerLayer, "gate");
});

test("artifact references reject absolute paths outside the run directory", () => {
  const runDirRel = "evaluation/runs/unit-artifacts";
  const inside = path.resolve(repoRoot, runDirRel, "logs/unit.stderr.log");
  const outside = path.resolve(
    repoRoot,
    "evaluation/schemas/summary.schema.json",
  );

  const references = artifactReferences(
    [inside, outside, "../outside.log", "logs/unit.stdout.log"],
    { repoRoot, runDirRel },
  );

  assert.deepEqual(
    references.map((artifact) => artifact.path),
    ["logs/unit.stderr.log", "logs/unit.stdout.log"],
  );
});

test("bounded excerpts redact sensitive text and stay within the limit", () => {
  const excerpt = boundedExcerpt(
    "token=super-secret value that should be truncated",
    30,
  );

  assert.equal(excerpt.includes("super-secret"), false);
  assert.equal(excerpt.length <= 30, true);
  assert.equal(excerpt.endsWith("..."), true);
});

function repositoryState() {
  return {
    branch: "unit",
    commit: "abcdef0",
    dirty: false,
    changedFiles: [],
  };
}

function layer(overrides = {}) {
  return {
    name: "unit",
    required: true,
    status: "passed",
    command: {
      configuredArgv: ["node", "--test"],
      executedArgv: ["node", "--test"],
      env: {
        EVALUATION_LAYER_NAME: "unit",
        EVALUATION_RUN_DIR: "evaluation/runs/unit",
      },
      display: "node --test",
    },
    exitCode: 0,
    durationMs: 10,
    timedOut: false,
    skippedReason: null,
    counts: { passed: 1, failed: 0, skipped: 0, timeout: 0 },
    classification: null,
    artifacts: ["logs/unit.stdout.log", "logs/unit.stderr.log"],
    stdout: "",
    stderr: "",
    ...overrides,
  };
}
