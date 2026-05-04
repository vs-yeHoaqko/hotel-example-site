import assert from "node:assert/strict";
import test from "node:test";
import {
  createTempRepo,
  writeJson,
  writeRawFile,
} from "../fixtures/run-health-fixtures.mjs";
import { createTestMeaningfulnessModel } from "../../lib/test-meaningfulness-model.mjs";

test("classifies meaningful tests by layer source and category", async () => {
  const repoRoot = await createTempRepo();
  await writeMeaningfulnessConfig(repoRoot);
  await writeRawFile(
    repoRoot,
    "e2e/en-US/login.spec.ts",
    `
import { test, expect } from "@playwright/test";
test("logs in", async ({ page }) => {
  await expect(page).toHaveTitle(/Login/);
});
test("navigates without assertion", async ({ page }) => {
  await page.goto("/en-US/index.html");
});
`,
  );
  await writeRawFile(
    repoRoot,
    "evaluation/tests/e2e/smoke.spec.mjs",
    `
import { test, expect } from "@playwright/test";
test("smoke route opens", async ({ page }) => {
  await expect(page).toHaveURL(/plans/);
});
`,
  );
  await writeRawFile(
    repoRoot,
    "evaluation/tests/integration/reservation-form.spec.mjs",
    `
import { test, expect } from "@playwright/test";
test("toggles contact fields", async ({ page }) => {
  await expect(page.locator("#email")).toBeVisible();
});
`,
  );
  await writeRawFile(
    repoRoot,
    "evaluation/tests/unit/billing.test.mjs",
    `
import assert from "node:assert/strict";
import test from "node:test";
test("calculates billing", () => {
  assert.equal(1 + 1, 2);
});
`,
  );
  await writeRawFile(
    repoRoot,
    "evaluation/tests/unit/run-health-model.test.mjs",
    `
import assert from "node:assert/strict";
import test from "node:test";
test("reports trend", () => {
  assert.match("Trend Summary", /Trend/);
});
`,
  );

  const model = await createTestMeaningfulnessModel({ repoRoot });

  assert.equal(model.summary.totalTests, 6);
  assert.equal(model.summary.meaningfulTests, 5);
  assert.equal(model.summary.weakSignalTests, 1);
  assert.equal(model.summary.assertionCount, 5);
  assert.deepEqual(countsByName(model.summary.byLayer), {
    "evaluation-integration": 1,
    "evaluation-smoke": 1,
    "harness-unit": 1,
    "product-unit": 1,
    "root-e2e": 2,
  });
  assert.deepEqual(countsByName(model.summary.byCategory), {
    "harness-contract": 1,
    "page-local-behavior": 1,
    "product-domain-rule": 1,
    "product-journey": 2,
    "smoke-journey": 1,
  });
  assert.equal(model.weakSignals[0].title, "navigates without assertion");
});

test("reports missing test roots as warnings", async () => {
  const repoRoot = await createTempRepo();
  await writeJson(
    repoRoot,
    "evaluation/config/test-meaningfulness.config.json",
    {
      schemaVersion: 1,
      reportPath: "evaluation/reports/test-meaningfulness.md",
      testRoots: [
        {
          path: "missing-tests",
          defaultLayer: "root-e2e",
          source: "root-suite",
        },
      ],
    },
  );

  const model = await createTestMeaningfulnessModel({ repoRoot });

  assert.equal(model.summary.totalTests, 0);
  assert.match(
    model.warnings.join("\n"),
    /missing-tests: directory does not exist/,
  );
});

async function writeMeaningfulnessConfig(repoRoot) {
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
          path: "evaluation/tests/e2e",
          defaultLayer: "evaluation-smoke",
          source: "evaluation",
        },
        {
          path: "evaluation/tests/integration",
          defaultLayer: "evaluation-integration",
          source: "evaluation",
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

function countsByName(rows) {
  return Object.fromEntries(rows.map((row) => [row.name, row.tests]));
}
