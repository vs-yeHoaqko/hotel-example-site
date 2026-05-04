import assert from "node:assert/strict";
import test from "node:test";
import { renderTestMeaningfulnessReport } from "../../lib/test-meaningfulness-report.mjs";

test("renders summary aggregates weak signals and interpretation", () => {
  const report = renderTestMeaningfulnessReport({
    metadata: {
      command: "node evaluation/bin/generate-test-meaningfulness.mjs",
      configPath: "evaluation/config/test-meaningfulness.config.json",
      reportPath: "evaluation/reports/test-meaningfulness.md",
      testRoots: [
        {
          path: "e2e",
        },
      ],
    },
    summary: {
      totalTests: 2,
      meaningfulTests: 1,
      weakSignalTests: 1,
      assertionCount: 3,
      byLayer: [
        {
          name: "root-e2e",
          tests: 2,
          meaningfulTests: 1,
          assertions: 3,
        },
      ],
      bySource: [
        {
          name: "root-suite",
          tests: 2,
          meaningfulTests: 1,
          assertions: 3,
        },
      ],
      byCategory: [
        {
          name: "product-journey",
          tests: 2,
          meaningfulTests: 1,
          assertions: 3,
        },
      ],
    },
    files: [
      {
        file: "e2e/en-US/login.spec.ts",
        layer: "root-e2e",
        source: "root-suite",
        testCount: 2,
        meaningfulTests: 1,
        assertionCount: 3,
      },
    ],
    weakSignals: [
      {
        file: "e2e/en-US/login.spec.ts",
        line: 10,
        layer: "root-e2e",
        title: "navigates without assertion",
      },
    ],
    warnings: [],
  });

  assert.match(report, /^# Test Meaningfulness Report/m);
  assert.match(report, /^## Summary/m);
  assert.match(report, /^## By Layer/m);
  assert.match(report, /^## Weak Signals/m);
  assert.match(report, /Total discovered tests: 2/);
  assert.match(report, /navigates without assertion/);
  assert.match(report, /Product behavior evidence: 2 tests/);
});
