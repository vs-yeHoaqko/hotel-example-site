import assert from "node:assert/strict";
import { mkdtemp, readFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { validateConfig } from "../../lib/config.mjs";
import { executeLayer } from "../../lib/command-executor.mjs";
import {
  createEnvironmentPreflight,
  writeEnvironmentPreflightArtifact,
} from "../../lib/environment-preflight.mjs";

test("creates passing preflight evidence without starting the product app", async () => {
  const repoRoot = await mkdtemp(path.join(os.tmpdir(), "preflight-pass-"));
  const preflight = await createEnvironmentPreflight({
    repoRoot,
    spawnSyncImpl: () => ({
      status: 0,
      stdout: "v24.0.0\n",
      stderr: "",
    }),
    accessImpl: async () => undefined,
    importPlaywright: async () => ({
      chromium: {
        executablePath: () => path.join(repoRoot, "chromium"),
      },
    }),
  });

  assert.equal(preflight.status, "passed");
  assert.equal(preflight.checks.length, 5);
  assert.equal(
    preflight.checks.every((check) => check.status === "passed"),
    true,
  );
});

test("classifies simulated spawn failure as environment evidence", async () => {
  const repoRoot = await mkdtemp(path.join(os.tmpdir(), "preflight-fail-"));
  const preflight = await createEnvironmentPreflight({
    repoRoot,
    spawnSyncImpl: () => ({
      status: null,
      stdout: "",
      stderr: "",
      error: new Error("spawn EPERM"),
    }),
    accessImpl: async () => undefined,
    importPlaywright: async () => ({
      chromium: {
        executablePath: () => path.join(repoRoot, "chromium"),
      },
    }),
  });

  const spawnCheck = preflight.checks.find(
    (check) => check.id === "node-spawn",
  );

  assert.equal(preflight.status, "failed");
  assert.equal(spawnCheck.status, "failed");
  assert.equal(spawnCheck.classification, "environment");
  assert.match(spawnCheck.message, /spawn EPERM/);
});

test("writes preflight artifact under the evaluation run directory", async () => {
  const repoRoot = await mkdtemp(path.join(os.tmpdir(), "preflight-write-"));
  const preflight = {
    schemaVersion: 1,
    status: "passed",
    startedAt: "2026-05-04T00:00:00.000Z",
    finishedAt: "2026-05-04T00:00:00.001Z",
    durationMs: 1,
    checks: [],
  };

  const artifactPath = await writeEnvironmentPreflightArtifact({
    repoRoot,
    runDirRel: "evaluation/runs/test-run",
    preflight,
  });
  const stored = JSON.parse(
    await readFile(
      path.join(repoRoot, "evaluation/runs/test-run", artifactPath),
      "utf8",
    ),
  );

  assert.equal(artifactPath, "artifacts/environment-preflight.json");
  assert.equal(stored.status, "passed");
});

test("environment layer config is valid and artifact collection includes preflight JSON", async () => {
  const config = {
    schemaVersion: 1,
    layers: [
      {
        name: "environment",
        required: true,
        modes: ["gate", "full", "collect-all"],
        timeoutMs: 30000,
        command: ["node", "-e", "process.exit(0)"],
        dependsOn: [],
        requires: ["node"],
        failureClassification: "environment",
      },
    ],
  };
  validateConfig(config);

  const repoRoot = await mkdtemp(path.join(os.tmpdir(), "preflight-layer-"));
  const result = await executeLayer(config.layers[0], {
    repoRoot,
    runDirRel: "evaluation/runs/test-run",
  });

  assert.equal(
    result.artifacts.includes("artifacts/environment-preflight.json"),
    true,
  );
});
