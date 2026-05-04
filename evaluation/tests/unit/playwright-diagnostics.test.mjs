import assert from "node:assert/strict";
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import {
  failedPlaywrightResult,
  passedPlaywrightResult,
} from "../fixtures/diagnostics/playwright-results.mjs";
import {
  malformedPlaywrightText,
  missingSuitesResult,
} from "../fixtures/diagnostics/malformed-results.mjs";
import {
  collectFailedTests,
  extractPlaywrightDiagnostics,
} from "../../lib/playwright-diagnostics.mjs";

test("extracts failed Playwright test-case diagnostics", async () => {
  const { repoRoot, runDirRel } = await writePlaywrightResult(
    failedPlaywrightResult,
  );
  const diagnostics = await extractPlaywrightDiagnostics(integrationLayer(), {
    repoRoot,
    runDirRel,
  });

  assert.equal(diagnostics.length, 1);
  assert.equal(diagnostics[0].type, "test_case");
  assert.equal(
    diagnostics[0].title,
    "reservation form > shows validation message when name is missing",
  );
  assert.deepEqual(diagnostics[0].source, {
    path: "evaluation/tests/integration/reservation-form.spec.mjs",
    line: 42,
  });
  assert.equal(diagnostics[0].reproduction.level, "test");
  assert.match(
    diagnostics[0].reproduction.display,
    /reservation-form\.spec\.mjs -g "shows validation message when name is missing"/,
  );
  assert.deepEqual(
    diagnostics[0].artifacts.map((artifact) => artifact.path),
    [
      "artifacts/integration-results.json",
      "artifacts/name-missing.png",
      "artifacts/trace.zip",
    ],
  );
});

test("ignores passed Playwright results", () => {
  assert.deepEqual(collectFailedTests(passedPlaywrightResult), []);
});

test("malformed or missing Playwright JSON produces no test-case diagnostics", async () => {
  const { repoRoot, runDirRel } = await writePlaywrightResult(
    malformedPlaywrightText,
    { raw: true },
  );
  const diagnostics = await extractPlaywrightDiagnostics(integrationLayer(), {
    repoRoot,
    runDirRel,
  });

  assert.deepEqual(diagnostics, []);
  assert.deepEqual(collectFailedTests(missingSuitesResult), []);
});

async function writePlaywrightResult(payload, { raw = false } = {}) {
  const repoRoot = await mkdtemp(path.join(os.tmpdir(), "hotel-eval-"));
  const runDirRel = "evaluation/runs/run-1";
  const artifactsDir = path.join(repoRoot, runDirRel, "artifacts");
  await mkdir(artifactsDir, { recursive: true });
  await writeFile(
    path.join(artifactsDir, "integration-results.json"),
    raw ? payload : JSON.stringify(payload, null, 2),
    "utf8",
  );
  return { repoRoot, runDirRel };
}

function integrationLayer() {
  return {
    name: "integration",
    required: true,
    status: "failed",
    command: {
      configuredArgv: ["node", "node_modules/@playwright/test/cli.js", "test"],
      executedArgv: ["node", "node_modules/@playwright/test/cli.js", "test"],
      env: {},
      display:
        "node node_modules/@playwright/test/cli.js test --config evaluation/config/playwright.integration.config.mjs",
    },
    exitCode: 1,
    durationMs: 1000,
    timedOut: false,
    skippedReason: null,
    counts: { passed: 0, failed: 1, skipped: 0, timeout: 0 },
    classification: "product",
    artifacts: ["artifacts/integration-results.json"],
    stdout: "",
    stderr: "",
  };
}
