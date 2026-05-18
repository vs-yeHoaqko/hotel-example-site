import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import test from "node:test";
import { createTempRepo, writeJson } from "../fixtures/run-health-fixtures.mjs";

const execFileAsync = promisify(execFile);
const VALIDATE_CLI = path.resolve(
  "evaluation/bin/validate-harness-adapter.mjs",
);

test("validation succeeds with warnings and writes report by default", async () => {
  const repoRoot = await createTempRepo();
  await writeJson(
    repoRoot,
    "evaluation/config/harness-adapter.json",
    validState(),
  );

  const { stdout } = await execFileAsync(process.execPath, [VALIDATE_CLI], {
    cwd: repoRoot,
  });
  const report = await readFile(
    path.join(repoRoot, "evaluation/reports/harness-adapter-readiness.md"),
    "utf8",
  );

  assert.match(stdout, /Status: warning/);
  assert.match(report, /## Warning Findings/);
});

test("validation fails for blocked adapter state", async () => {
  const repoRoot = await createTempRepo();
  await writeJson(repoRoot, "evaluation/config/harness-adapter.json", {
    ...validState(),
    layers: [],
    artifacts: {
      runDirectory: {
        path: "evaluation/runs",
        source: "confirmed",
        ignored: false,
      },
      reports: [],
    },
  });

  await assert.rejects(async () => {
    try {
      await execFileAsync(process.execPath, [VALIDATE_CLI], { cwd: repoRoot });
    } catch (error) {
      assert.match(error.stdout, /Status: blocked/);
      throw error;
    }
  });
});

test("--no-write-report skips report output", async () => {
  const repoRoot = await createTempRepo();
  await writeJson(
    repoRoot,
    "evaluation/config/harness-adapter.json",
    validState(),
  );

  await execFileAsync(process.execPath, [VALIDATE_CLI, "--no-write-report"], {
    cwd: repoRoot,
  });

  await assert.rejects(
    () =>
      access(
        path.join(repoRoot, "evaluation/reports/harness-adapter-readiness.md"),
      ),
    /ENOENT/,
  );
});

test("custom report path is honored", async () => {
  const repoRoot = await createTempRepo();
  await writeJson(
    repoRoot,
    "evaluation/config/harness-adapter.json",
    validState(),
  );

  await execFileAsync(
    process.execPath,
    [VALIDATE_CLI, "--report", "evaluation/reports/custom-readiness.md"],
    { cwd: repoRoot },
  );

  const report = await readFile(
    path.join(repoRoot, "evaluation/reports/custom-readiness.md"),
    "utf8",
  );
  assert.match(report, /Harness Adapter Readiness/);
});

function validState() {
  return {
    schemaVersion: 1,
    repository: {
      root: ".",
      discoveredAt: "2026-05-18T00:00:00.000Z",
      packageManager: {
        value: "pnpm",
        source: "confirmed",
      },
    },
    layers: [
      {
        name: "unit",
        kind: "unit",
        command: ["node", "--test", "evaluation/tests/unit"],
        required: true,
        status: "confirmed",
        source: "confirmed",
      },
    ],
    targets: [],
    artifacts: {
      runDirectory: {
        path: "evaluation/runs",
        source: "confirmed",
        ignored: true,
      },
      reports: [],
    },
    behaviorMapping: {
      status: "unknown",
      source: "deferred",
    },
    ownership: {
      status: "unknown",
      source: "deferred",
    },
    qualityPolicy: {
      status: "confirmed",
      source: "confirmed",
      enforcement: "warning-first",
    },
    ciPolicy: {
      mode: "local-only",
      status: "confirmed",
      source: "confirmed",
    },
    governance: {
      allowedEditBoundary: ["evaluation/"],
      rollback: "Remove adapter.",
      source: "confirmed",
    },
    decisions: [],
  };
}
