import assert from "node:assert/strict";
import test from "node:test";
import {
  aggregateRows,
  createFeatureCoverageModel,
  loadFeatureCoverageConfig,
} from "../../lib/feature-coverage-model.mjs";
import {
  createTempRepo,
  layer,
  writeConfig,
  writeJson,
  writeRawFile,
  writeSummary,
} from "../fixtures/run-health-fixtures.mjs";

test("validates feature coverage config boundaries and feature ids", async () => {
  const repoRoot = await createTempRepo();
  await writeBaseConfigs(repoRoot);
  await writeFeatureConfig(repoRoot, {
    reportPath: "reports/feature-coverage.md",
  });

  await assert.rejects(
    () => loadFeatureCoverageConfig({ repoRoot }),
    /reportPath must stay under evaluation\//,
  );

  await writeFeatureConfig(repoRoot, {
    features: [feature({ id: "duplicate" }), feature({ id: "duplicate" })],
  });

  await assert.rejects(
    () => loadFeatureCoverageConfig({ repoRoot }),
    /id must be unique/,
  );

  await writeFeatureConfig(repoRoot, {
    features: [feature({ evidence: [] })],
  });

  await assert.rejects(
    () => loadFeatureCoverageConfig({ repoRoot }),
    /evidence must contain at least one matcher/,
  );
});

test("creates passing rows from latest result, ownership, and unit layer evidence", async () => {
  const repoRoot = await createFeatureCoverageRepo();
  await writeFeatureConfig(repoRoot, {
    features: [
      feature({
        id: "login",
        label: "Login journey",
        ownerLayer: "root-e2e",
        evidence: [{ layer: "full-e2e", file: "en-US/login.spec.ts" }],
      }),
      feature({
        id: "billing",
        label: "Total bill calculation",
        category: "product-domain-rule",
        ownerLayer: "unit",
        evidence: [
          { layer: "unit", file: "evaluation/tests/unit/billing.test.mjs" },
        ],
      }),
    ],
  });
  await writeSummary(repoRoot, "20260102T000000Z-b", {
    mode: "collect-all",
    startedAt: "2026-01-02T00:00:00.000Z",
    layers: [
      layer({
        name: "full-e2e",
        artifacts: ["artifacts/full-e2e-results.json"],
      }),
      layer({ name: "unit", artifacts: [] }),
    ],
  });
  await writePlaywrightResult(repoRoot, "20260102T000000Z-b", [
    {
      file: "en-US/login.spec.ts",
      title: "logs in",
      status: "passed",
      duration: 100,
    },
  ]);
  await writeOwnership(repoRoot, "20260102T000000Z-b");
  await writeTestFiles(repoRoot);

  const model = await createFeatureCoverageModel({ repoRoot });

  assert.equal(model.status, "pass");
  assert.deepEqual(
    model.rows.map((row) => [row.id, row.status]),
    [
      ["login", "pass"],
      ["billing", "pass"],
    ],
  );
  assert.match(
    model.rows
      .find((row) => row.id === "billing")
      .evidence.map((item) => item.kind)
      .join("\n"),
    /ownership/,
  );
});

test("marks failed latest evidence as fail and slow latest evidence as warn", async () => {
  const repoRoot = await createFeatureCoverageRepo({
    testSlowThresholdMs: 1000,
  });
  await writeFeatureConfig(repoRoot, {
    features: [
      feature({
        id: "login",
        evidence: [{ layer: "full-e2e", file: "en-US/login.spec.ts" }],
      }),
      feature({
        id: "plans",
        label: "Plans journey",
        evidence: [{ layer: "full-e2e", file: "en-US/plans.spec.ts" }],
      }),
    ],
  });
  await writeSummary(repoRoot, "20260103T000000Z-c", {
    startedAt: "2026-01-03T00:00:00.000Z",
    status: "failed",
    layers: [
      layer({
        name: "full-e2e",
        status: "failed",
        artifacts: ["artifacts/full-e2e-results.json"],
      }),
    ],
  });
  await writePlaywrightResult(repoRoot, "20260103T000000Z-c", [
    {
      file: "en-US/login.spec.ts",
      title: "logs in",
      status: "failed",
      duration: 100,
    },
    {
      file: "en-US/plans.spec.ts",
      title: "shows plans",
      status: "passed",
      duration: 1500,
    },
  ]);
  await writeTestFiles(repoRoot);

  const model = await createFeatureCoverageModel({ repoRoot });

  assert.deepEqual(
    model.rows.map((row) => [row.id, row.status]),
    [
      ["login", "fail"],
      ["plans", "warn"],
    ],
  );
  assert.equal(aggregateRows(model.rows), "fail");
});

test("surfaces missing and unmapped evidence", async () => {
  const repoRoot = await createFeatureCoverageRepo();
  await writeFeatureConfig(repoRoot, {
    features: [
      feature({
        id: "missing",
        label: "Missing journey",
        evidence: [{ layer: "full-e2e", file: "en-US/missing.spec.ts" }],
      }),
    ],
  });
  await writeSummary(repoRoot, "20260104T000000Z-d", {
    startedAt: "2026-01-04T00:00:00.000Z",
    layers: [
      layer({
        name: "full-e2e",
        artifacts: ["artifacts/full-e2e-results.json"],
      }),
    ],
  });
  await writePlaywrightResult(repoRoot, "20260104T000000Z-d", [
    {
      file: "en-US/unmapped.spec.ts",
      title: "unmapped journey",
      status: "passed",
      duration: 100,
    },
  ]);
  await writeRawFile(
    repoRoot,
    "e2e/en-US/unmapped.spec.ts",
    `import { test, expect } from "@playwright/test";
test("unmapped journey", async ({ page }) => {
  await expect(page).toHaveURL(/en-US/);
});
`,
  );

  const model = await createFeatureCoverageModel({ repoRoot });

  assert.equal(model.rows[0].status, "unknown");
  assert.match(
    model.unmappedEvidence.map((item) => item.file).join("\n"),
    /en-US\/unmapped\.spec\.ts/,
  );
  assert.equal(model.status, "warn");
});

async function createFeatureCoverageRepo(runHealthOverrides = {}) {
  const repoRoot = await createTempRepo();
  await writeBaseConfigs(repoRoot, runHealthOverrides);
  return repoRoot;
}

async function writeBaseConfigs(repoRoot, runHealthOverrides = {}) {
  await writeConfig(repoRoot, {
    maxRuns: 2,
    topSlowTests: 10,
    testSlowThresholdMs: 3000,
    ...runHealthOverrides,
  });
  await writeJson(
    repoRoot,
    "evaluation/config/test-meaningfulness.config.json",
    {
      schemaVersion: 1,
      reportPath: "evaluation/reports/test-meaningfulness.md",
      testRoots: [
        {
          path: "e2e",
          defaultLayer: "root-e2e",
          source: "root-suite",
        },
        {
          path: "evaluation/tests/unit",
          defaultLayer: "harness-unit",
          source: "evaluation",
        },
      ],
    },
  );
}

async function writeFeatureConfig(repoRoot, overrides = {}) {
  await writeJson(repoRoot, "evaluation/config/feature-coverage.config.json", {
    schemaVersion: 1,
    reportPath: "evaluation/reports/feature-coverage-matrix.md",
    sources: {
      runHealthConfigPath: "evaluation/config/run-health.config.json",
      testMeaningfulnessConfigPath:
        "evaluation/config/test-meaningfulness.config.json",
    },
    features: [feature()],
    ...overrides,
  });
}

function feature(overrides = {}) {
  return {
    id: "login",
    label: "Login journey",
    category: "product-journey",
    ownerLayer: "root-e2e",
    locale: "en-US",
    evidence: [{ layer: "full-e2e", file: "en-US/login.spec.ts" }],
    ...overrides,
  };
}

async function writePlaywrightResult(repoRoot, runId, cases) {
  await writeJson(
    repoRoot,
    `evaluation/runs/${runId}/artifacts/full-e2e-results.json`,
    {
      config: {},
      suites: [
        {
          title: "suite",
          specs: cases.map((item, index) => ({
            title: item.title,
            ok: item.status === "passed",
            file: item.file,
            line: index + 1,
            tests: [
              {
                expectedStatus: "passed",
                projectName: "chromium",
                status: item.status === "passed" ? "expected" : "unexpected",
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
      errors: [],
      stats: {},
    },
  );
}

async function writeOwnership(repoRoot, runId) {
  await writeJson(repoRoot, `evaluation/runs/${runId}/ownership.json`, {
    schemaVersion: 1,
    records: [
      {
        behavior: "Total bill calculation",
        ownerLayer: "unit",
        evidence: "Pure calculation logic.",
        coveredBy: ["evaluation/tests/unit/billing.test.mjs"],
      },
    ],
  });
}

async function writeTestFiles(repoRoot) {
  await writeRawFile(
    repoRoot,
    "e2e/en-US/login.spec.ts",
    `import { test, expect } from "@playwright/test";
test("logs in", async ({ page }) => {
  await expect(page).toHaveTitle(/Login/);
});
`,
  );
  await writeRawFile(
    repoRoot,
    "e2e/en-US/plans.spec.ts",
    `import { test, expect } from "@playwright/test";
test("shows plans", async ({ page }) => {
  await expect(page).toHaveURL(/plans/);
});
`,
  );
  await writeRawFile(
    repoRoot,
    "evaluation/tests/unit/billing.test.mjs",
    `import assert from "node:assert/strict";
import test from "node:test";
test("calculates billing", () => {
  assert.equal(1 + 1, 2);
});
`,
  );
}
