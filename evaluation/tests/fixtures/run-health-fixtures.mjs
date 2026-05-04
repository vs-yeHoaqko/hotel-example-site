import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

export async function createTempRepo() {
  const repoRoot = await mkdtemp(path.join(os.tmpdir(), "run-health-"));
  await mkdir(path.join(repoRoot, "evaluation/config"), { recursive: true });
  await mkdir(path.join(repoRoot, "evaluation/runs"), { recursive: true });
  return repoRoot;
}

export async function writeConfig(repoRoot, overrides = {}) {
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

export async function writeSummary(repoRoot, runId, overrides = {}) {
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

export function layer(overrides = {}) {
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

export async function writePlaywrightResult(
  repoRoot,
  runId,
  artifactPath,
  cases,
) {
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

export async function writeJson(repoRoot, relativePath, value) {
  await writeRawFile(
    repoRoot,
    relativePath,
    `${JSON.stringify(value, null, 2)}\n`,
  );
}

export async function writeRawFile(repoRoot, relativePath, content) {
  const absolutePath = path.join(repoRoot, relativePath);
  await mkdir(path.dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, content, "utf8");
}
