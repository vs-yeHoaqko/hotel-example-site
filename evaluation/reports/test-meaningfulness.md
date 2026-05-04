# Test Meaningfulness Report

## Metadata

- Generated command: `node evaluation/bin/generate-test-meaningfulness.mjs`
- Config: `evaluation/config/test-meaningfulness.config.json`
- Report path: `evaluation/reports/test-meaningfulness.md`
- Test roots: `e2e`, `evaluation/tests/e2e`, `evaluation/tests/integration`, `evaluation/tests/unit`

## Summary

- Total discovered tests: 144
- Meaningful tests: 144
- Weak-signal tests: 0
- Assertion-like checks: 598

## By Layer

| Name                   | Tests | Meaningful | Assertions |
| ---------------------- | ----- | ---------- | ---------- |
| evaluation-integration | 9     | 9          | 27         |
| evaluation-smoke       | 3     | 3          | 6          |
| harness-unit           | 49    | 49         | 168        |
| product-unit           | 3     | 3          | 3          |
| root-e2e               | 80    | 80         | 394        |

## By Source

| Name       | Tests | Meaningful | Assertions |
| ---------- | ----- | ---------- | ---------- |
| evaluation | 64    | 64         | 204        |
| root-suite | 80    | 80         | 394        |

## By Category

| Name                | Tests | Meaningful | Assertions |
| ------------------- | ----- | ---------- | ---------- |
| harness-contract    | 49    | 49         | 168        |
| page-local-behavior | 9     | 9          | 27         |
| product-domain-rule | 3     | 3          | 3          |
| product-journey     | 60    | 60         | 356        |
| product-navigation  | 20    | 20         | 38         |
| smoke-journey       | 3     | 3          | 6          |

## Weak Signals

| File | Line | Layer | Title |
| ---- | ---- | ----- | ----- |
| None | -    | -     | -     |

## Files

| File                                                        | Layer                  | Source     | Tests | Meaningful | Assertions |
| ----------------------------------------------------------- | ---------------------- | ---------- | ----- | ---------- | ---------- |
| `e2e/en-US/login.spec.ts`                                   | root-e2e               | root-suite | 3     | 3          | 6          |
| `e2e/en-US/mypage.spec.ts`                                  | root-e2e               | root-suite | 9     | 9          | 60         |
| `e2e/en-US/plans.spec.ts`                                   | root-e2e               | root-suite | 3     | 3          | 13         |
| `e2e/en-US/redirection.spec.ts`                             | root-e2e               | root-suite | 10    | 10         | 19         |
| `e2e/en-US/reserve.spec.ts`                                 | root-e2e               | root-suite | 10    | 10         | 75         |
| `e2e/en-US/signup.spec.ts`                                  | root-e2e               | root-suite | 5     | 5          | 24         |
| `e2e/ja/login.spec.ts`                                      | root-e2e               | root-suite | 3     | 3          | 6          |
| `e2e/ja/mypage.spec.ts`                                     | root-e2e               | root-suite | 9     | 9          | 60         |
| `e2e/ja/plans.spec.ts`                                      | root-e2e               | root-suite | 3     | 3          | 13         |
| `e2e/ja/redirection.spec.ts`                                | root-e2e               | root-suite | 10    | 10         | 19         |
| `e2e/ja/reserve.spec.ts`                                    | root-e2e               | root-suite | 10    | 10         | 75         |
| `e2e/ja/signup.spec.ts`                                     | root-e2e               | root-suite | 5     | 5          | 24         |
| `evaluation/tests/e2e/smoke.spec.mjs`                       | evaluation-smoke       | evaluation | 3     | 3          | 6          |
| `evaluation/tests/integration/reservation-form.spec.mjs`    | evaluation-integration | evaluation | 9     | 9          | 27         |
| `evaluation/tests/unit/billing.test.mjs`                    | product-unit           | evaluation | 3     | 3          | 3          |
| `evaluation/tests/unit/diagnostic-guidance.test.mjs`        | harness-unit           | evaluation | 7     | 7          | 21         |
| `evaluation/tests/unit/diagnostics.test.mjs`                | harness-unit           | evaluation | 5     | 5          | 15         |
| `evaluation/tests/unit/environment-preflight.test.mjs`      | harness-unit           | evaluation | 4     | 4          | 10         |
| `evaluation/tests/unit/failure-classifier.test.mjs`         | harness-unit           | evaluation | 2     | 2          | 5          |
| `evaluation/tests/unit/migration-candidate-report.test.mjs` | harness-unit           | evaluation | 3     | 3          | 10         |
| `evaluation/tests/unit/playwright-diagnostics.test.mjs`     | harness-unit           | evaluation | 3     | 3          | 10         |
| `evaluation/tests/unit/quality-gate-model.test.mjs`         | harness-unit           | evaluation | 3     | 3          | 7          |
| `evaluation/tests/unit/quality-gate-report.test.mjs`        | harness-unit           | evaluation | 1     | 1          | 6          |
| `evaluation/tests/unit/run-health-model.test.mjs`           | harness-unit           | evaluation | 8     | 8          | 34         |
| `evaluation/tests/unit/run-health-report.test.mjs`          | harness-unit           | evaluation | 2     | 2          | 22         |
| `evaluation/tests/unit/summary-schema.test.mjs`             | harness-unit           | evaluation | 2     | 2          | 3          |
| `evaluation/tests/unit/test-meaningfulness-model.test.mjs`  | harness-unit           | evaluation | 2     | 2          | 9          |
| `evaluation/tests/unit/test-meaningfulness-report.test.mjs` | harness-unit           | evaluation | 1     | 1          | 7          |
| `evaluation/tests/unit/thinning-decision-model.test.mjs`    | harness-unit           | evaluation | 6     | 6          | 9          |

## Warnings

- None

## Interpretation

- Product behavior evidence: 95 tests.
- Harness contract evidence: 49 tests.
- Root E2E tests are broad behavior evidence; evaluation integration and product unit tests are lower-layer evidence.
- Weak-signal tests should be reviewed before treating their count as meaningful coverage.
