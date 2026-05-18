import assert from "node:assert/strict";
import { access, mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import test from "node:test";
import {
  createTempRepo,
  writeJson,
  writeRawFile,
} from "../fixtures/run-health-fixtures.mjs";

const execFileAsync = promisify(execFile);
const INIT_CLI = path.resolve("evaluation/bin/init-harness-adapter.mjs");

test("dry-run reports discovery and writes no files", async () => {
  const repoRoot = await repoWithDiscovery();

  const { stdout } = await execFileAsync(
    process.execPath,
    [INIT_CLI, "--dry-run", "--non-interactive"],
    { cwd: repoRoot },
  );

  assert.match(stdout, /Harness adapter onboarding/);
  assert.match(stdout, /Dry run: no files written/);
  await assert.rejects(
    () => access(path.join(repoRoot, "evaluation/config/harness-adapter.json")),
    /ENOENT/,
  );
});

test("write mode creates adapter state", async () => {
  const repoRoot = await repoWithDiscovery();

  const { stdout } = await execFileAsync(
    process.execPath,
    [INIT_CLI, "--write", "--non-interactive"],
    { cwd: repoRoot },
  );
  const adapter = JSON.parse(
    await readFile(
      path.join(repoRoot, "evaluation/config/harness-adapter.json"),
      "utf8",
    ),
  );

  assert.match(stdout, /Wrote harness adapter/);
  assert.equal(adapter.schemaVersion, 1);
  assert.equal(
    adapter.layers.some((layer) => layer.name === "unit"),
    true,
  );
});

test("re-run preserves saved decisions and reports conflicts", async () => {
  const repoRoot = await repoWithDiscovery();
  await writeJson(repoRoot, "evaluation/config/harness-adapter.json", {
    ...validState(),
    layers: [
      {
        name: "unit",
        kind: "unit",
        command: ["node", "--test", "saved/unit"],
        required: true,
        status: "confirmed",
        source: "confirmed",
      },
    ],
  });

  const { stdout } = await execFileAsync(
    process.execPath,
    [INIT_CLI, "--write", "--non-interactive"],
    { cwd: repoRoot },
  );
  const adapter = JSON.parse(
    await readFile(
      path.join(repoRoot, "evaluation/config/harness-adapter.json"),
      "utf8",
    ),
  );

  assert.match(stdout, /Conflicts: 1/);
  assert.deepEqual(adapter.layers[0].command, ["node", "--test", "saved/unit"]);
});

async function repoWithDiscovery() {
  const repoRoot = await createTempRepo();
  await writeJson(repoRoot, "package.json", {
    scripts: {
      "fmt:check": "prettier --check .",
    },
    devEngines: {
      packageManager: [{ name: "pnpm" }],
    },
  });
  await mkdir(path.join(repoRoot, "evaluation/tests/unit"), {
    recursive: true,
  });
  await writeRawFile(repoRoot, ".gitignore", "evaluation/runs/\n");
  return repoRoot;
}

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
    layers: [],
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
