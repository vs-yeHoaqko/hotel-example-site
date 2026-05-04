import assert from "node:assert/strict";
import test from "node:test";
import {
  createRunHealthModel,
  loadRunHealthConfig,
} from "../../lib/run-health-model.mjs";
import {
  createTempRepo,
  layer,
  writeConfig,
  writeJson,
  writePlaywrightResult,
  writeRawFile,
  writeSummary,
} from "../fixtures/run-health-fixtures.mjs";

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
  await writeRawFile(
    repoRoot,
    "evaluation/runs/20260103T000000Z-bad/summary.json",
    "{not json",
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

test("extracts preflight evidence and no-environment wording state", async () => {
  const repoRoot = await createTempRepo();
  await writeConfig(repoRoot, { maxRuns: 1, testSlowThresholdMs: 1000 });
  await writeSummary(repoRoot, "20260106T000000Z-e", {
    layers: [
      layer({
        name: "environment",
        durationMs: 100,
        artifacts: ["artifacts/environment-preflight.json"],
      }),
    ],
  });
  await writeJson(
    repoRoot,
    "evaluation/runs/20260106T000000Z-e/artifacts/environment-preflight.json",
    {
      schemaVersion: 1,
      status: "passed",
      startedAt: "2026-01-06T00:00:00.000Z",
      finishedAt: "2026-01-06T00:00:00.100Z",
      durationMs: 100,
      checks: [
        {
          id: "node-spawn",
          label: "Subprocess spawn",
          status: "passed",
          classification: null,
          message: "Subprocess spawn is available.",
          guidance: "No action required.",
          details: {},
        },
      ],
    },
  );

  const model = await createRunHealthModel({ repoRoot });

  assert.equal(model.preflightEvidence.length, 1);
  assert.equal(model.environmentEvidence.length, 0);
  assert.equal(model.noEnvironmentEvidenceObserved, true);
  assert.equal(model.warnings.length, 0);
});

test("extracts failed preflight checks as environment evidence", async () => {
  const repoRoot = await createTempRepo();
  await writeConfig(repoRoot, { maxRuns: 1, testSlowThresholdMs: 1000 });
  await writeSummary(repoRoot, "20260107T000000Z-f", {
    status: "failed",
    layers: [
      layer({
        name: "environment",
        status: "failed",
        classification: "environment",
        durationMs: 100,
        artifacts: ["artifacts/environment-preflight.json"],
      }),
    ],
  });
  await writeJson(
    repoRoot,
    "evaluation/runs/20260107T000000Z-f/artifacts/environment-preflight.json",
    {
      schemaVersion: 1,
      status: "failed",
      startedAt: "2026-01-07T00:00:00.000Z",
      finishedAt: "2026-01-07T00:00:00.100Z",
      durationMs: 100,
      checks: [
        {
          id: "node-spawn",
          label: "Subprocess spawn",
          status: "failed",
          classification: "environment",
          message: "spawn EPERM",
          guidance: "Fix local process execution permissions.",
          details: {},
        },
      ],
    },
  );

  const model = await createRunHealthModel({ repoRoot });

  assert.equal(model.preflightEvidence.length, 1);
  assert.equal(model.environmentEvidence.length, 2);
  assert.equal(model.noEnvironmentEvidenceObserved, false);
  assert.match(
    model.environmentEvidence.map((item) => item.title).join("\n"),
    /Subprocess spawn/,
  );
});
