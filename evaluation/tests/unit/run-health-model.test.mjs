import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import {
  createRunHealthModel,
  loadRunHealthConfig,
} from "../../lib/run-health-model.mjs";

test("validates config paths and limits", async () => {
  const repoRoot = await createTempRepo();
  await writeConfig(repoRoot, {
    runsDirectory: "runs",
  });

  await assert.rejects(
    () => loadRunHealthConfig({ repoRoot }),
    /runsDirectory must stay under evaluation\//,
  );

  await writeConfig(repoRoot, {
    runsDirectory: "evaluation/runs",
    maxRuns: 0,
  });

  await assert.rejects(
    () => loadRunHealthConfig({ repoRoot }),
    /maxRuns must be a positive integer/,
  );
});

test("selects latest readable runs and records malformed or missing evidence warnings", async () => {
  const repoRoot = await createTempRepo();
  await writeConfig(repoRoot, { maxRuns: 2, testSlowThresholdMs: 3000 });
  await writeSummary(repoRoot, "20260101T000000Z-a", {
    startedAt: "2026-01-01T00:00:00.000Z",
    layers: [
      layer({
        name: "integration",
        durationMs: 41000,
        artifacts: ["artifacts/missing-results.json"],
      }),
    ],
  });
  await writeSummary(repoRoot, "20260102T000000Z-b", {
    startedAt: "2026-01-02T00:00:00.000Z",
    layers: [
      layer({
        name: "smoke-e2e",
        durationMs: 31000,
        artifacts: ["artifacts/smoke-results.json"],
      }),
    ],
  });
  await writePlaywrightResult(
    repoRoot,
    "20260102T000000Z-b",
    "artifacts/smoke-results.json",
    [
      {
        title: "slow happy path",
        duration: 3500,
        status: "passed",
      },
    ],
  );
  await mkdir(path.join(repoRoot, "evaluation/runs/20260103T000000Z-bad"), {
    recursive: true,
  });
  await writeFile(
    path.join(repoRoot, "evaluation/runs/20260103T000000Z-bad/summary.json"),
    "{not json",
    "utf8",
  );

  const model = await createRunHealthModel({ repoRoot });

  assert.deepEqual(model.metadata.selectedRunIds, [
    "20260102T000000Z-b",
    "20260101T000000Z-a",
  ]);
  assert.equal(model.slowLayers.length, 2);
  assert.equal(model.slowTests.length, 1);
  assert.match(model.warnings.join("\n"), /malformed JSON/);
  assert.match(model.warnings.join("\n"), /missing-results\.json: missing/);
});

test("extracts slow, unstable, retried, and environment Playwright evidence deterministically", async () => {
  const repoRoot = await createTempRepo();
  await writeConfig(repoRoot, { maxRuns: 1, testSlowThresholdMs: 1000 });
  await writeSummary(repoRoot, "20260104T000000Z-c", {
    layers: [
      layer({
        name: "full-e2e",
        durationMs: 46000,
        classification: "product",
        artifacts: ["artifacts/full-e2e-results.json"],
      }),
      layer({
        name: "integration",
        status: "failed",
        classification: "environment",
        durationMs: 100,
      }),
    ],
  });
  await writePlaywrightResult(
    repoRoot,
    "20260104T000000Z-c",
    "artifacts/full-e2e-results.json",
    [
      {
        title: "checkout failure",
        duration: 1200,
        status: "failed",
        retry: 0,
        message: "Expected confirmation modal",
      },
      {
        title: "retrying validation",
        duration: 1800,
        status: "passed",
        retry: 1,
      },
      {
        title: "sandbox start",
        duration: 2400,
        status: "failed",
        retry: 0,
        message: "spawn EPERM",
      },
    ],
  );

  const model = await createRunHealthModel({ repoRoot });

  assert.deepEqual(
    model.slowTests.map((finding) => finding.title),
    [
      "suite > nested > sandbox start",
      "suite > nested > retrying validation",
      "suite > nested > checkout failure",
    ],
  );
  assert.equal(model.instabilityEvidence.length, 2);
  assert.equal(model.environmentEvidence.length, 2);
  assert.equal(model.noFlakyEvidenceObserved, false);
  assert.equal(
    model.recommendedReviewFocus[0],
    "Fix environment/tooling evidence before changing tests.",
  );
});

test("reports no flaky evidence when selected runs contain only expected passed tests", async () => {
  const repoRoot = await createTempRepo();
  await writeConfig(repoRoot, { maxRuns: 1, testSlowThresholdMs: 1000 });
  await writeSummary(repoRoot, "20260105T000000Z-d", {
    layers: [
      layer({
        name: "integration",
        durationMs: 1000,
        artifacts: ["artifacts/integration-results.json"],
      }),
    ],
  });
  await writePlaywrightResult(
    repoRoot,
    "20260105T000000Z-d",
    "artifacts/integration-results.json",
    [
      {
        title: "stable check",
        duration: 1200,
        status: "passed",
      },
    ],
  );

  const model = await createRunHealthModel({ repoRoot });

  assert.equal(model.noFlakyEvidenceObserved, true);
  assert.equal(model.instabilityEvidence.length, 0);
  assert.equal(model.environmentEvidence.length, 0);
  assert.equal(model.metadata.runsDirectory, "evaluation/runs");
});

async function createTempRepo() {
  const repoRoot = await mkdtemp(path.join(os.tmpdir(), "run-health-"));
  await mkdir(path.join(repoRoot, "evaluation/config"), { recursive: true });
  await mkdir(path.join(repoRoot, "evaluation/runs"), { recursive: true });
  return repoRoot;
}

async function writeConfig(repoRoot, overrides = {}) {
  await writeJson(repoRoot, "evaluation/config/run-health.config.json", {
    schemaVersion: 1,
    runsDirectory: "evaluation/runs",
    reportPath: "evaluation/reports/run-health.md",
    maxRuns: 5,
    topSlowTests: 10,
    layerThresholdsMs: {
      static: 5000,
      unit: 5000,
      integration: 40000,
      "smoke-e2e": 30000,
      "full-e2e": 45000,
    },
    testSlowThresholdMs: 3000,
    ...overrides,
  });
}

async function writeSummary(repoRoot, runId, overrides = {}) {
  await writeJson(repoRoot, `evaluation/runs/${runId}/summary.json`, {
    schemaVersion: 1,
    runId,
    mode: "gate",
    target: "local",
    repository: {
      branch: "007-slow-flaky-evidence",
      commit: "abc1234",
      dirty: false,
      changedFiles: [],
    },
    startedAt: "2026-01-01T00:00:00.000Z",
    finishedAt: "2026-01-01T00:00:01.000Z",
    status: "passed",
    counts: {
      passed: 1,
      failed: 0,
      skipped: 0,
      timeout: 0,
    },
    recommendedNextAction: {
      code: "none",
      message: "No action required.",
    },
    diagnostics: [],
    layers: [],
    errors: [],
    ...overrides,
  });
}

function layer(overrides = {}) {
  return {
    name: "integration",
    required: true,
    status: "passed",
    exitCode: 0,
    durationMs: 1000,
    timedOut: false,
    skippedReason: null,
    counts: {
      passed: 1,
      failed: 0,
      skipped: 0,
      timeout: 0,
    },
    classification: null,
    artifacts: [],
    ...overrides,
  };
}

async function writePlaywrightResult(repoRoot, runId, artifactPath, cases) {
  await writeJson(repoRoot, `evaluation/runs/${runId}/${artifactPath}`, {
    config: {},
    suites: [
      {
        title: "suite",
        suites: [
          {
            title: "nested",
            specs: cases.map((item, index) => ({
              title: item.title,
              ok: item.status === "passed",
              file: `example-${index}.spec.mjs`,
              line: index + 1,
              tests: [
                {
                  expectedStatus: "passed",
                  projectName: "chromium",
                  status:
                    item.status === "passed" && (item.retry ?? 0) === 0
                      ? "expected"
                      : "unexpected",
                  results: [
                    {
                      status: item.status,
                      duration: item.duration,
                      errors: item.message ? [{ message: item.message }] : [],
                      stdout: [],
                      stderr: [],
                      retry: item.retry ?? 0,
                    },
                  ],
                },
              ],
            })),
          },
        ],
      },
    ],
    errors: [],
    stats: {},
  });
}

async function writeJson(repoRoot, relativePath, value) {
  const absolutePath = path.join(repoRoot, relativePath);
  await mkdir(path.dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}
