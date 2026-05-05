# Run Health Report

## Metadata

- Generated command: `node evaluation/bin/generate-run-health.mjs`
- Config: `evaluation/config/run-health.config.json`
- Runs directory: `evaluation/runs`
- Report path: `evaluation/reports/run-health.md`
- Baseline: `evaluation/baselines/run-health-baseline.json`
- Selected runs: `20260505T024104Z-013-feature-coverage-matrix-2e9046b`, `20260505T023814Z-013-feature-coverage-matrix-2e9046b`, `20260505T010750Z-012-ci-gate-summary-and-enforcement-e46cb73`, `20260505T010423Z-012-ci-gate-summary-and-enforcement-e46cb73`, `20260505T005842Z-012-ci-gate-summary-and-enforcement-e46cb73`
- Max runs: 5
- Top slow tests: 10
- Slow test threshold: 3000ms

### Layer Thresholds

- `full-e2e`: 45000ms
- `integration`: 40000ms
- `smoke-e2e`: 30000ms
- `static`: 5000ms
- `unit`: 5000ms

## Selected Runs

| Run ID                                                       | Mode        | Target | Status | Started                  | Finished                 | Dirty | Summary                                                                                     |
| ------------------------------------------------------------ | ----------- | ------ | ------ | ------------------------ | ------------------------ | ----- | ------------------------------------------------------------------------------------------- |
| 20260505T024104Z-013-feature-coverage-matrix-2e9046b         | collect-all | local  | passed | 2026-05-05T02:41:04.556Z | 2026-05-05T02:44:29.177Z | yes   | `evaluation/runs/20260505T024104Z-013-feature-coverage-matrix-2e9046b/summary.json`         |
| 20260505T023814Z-013-feature-coverage-matrix-2e9046b         | gate        | local  | passed | 2026-05-05T02:38:14.389Z | 2026-05-05T02:39:52.554Z | yes   | `evaluation/runs/20260505T023814Z-013-feature-coverage-matrix-2e9046b/summary.json`         |
| 20260505T010750Z-012-ci-gate-summary-and-enforcement-e46cb73 | collect-all | local  | passed | 2026-05-05T01:07:50.876Z | 2026-05-05T01:14:18.509Z | yes   | `evaluation/runs/20260505T010750Z-012-ci-gate-summary-and-enforcement-e46cb73/summary.json` |
| 20260505T010423Z-012-ci-gate-summary-and-enforcement-e46cb73 | gate        | local  | passed | 2026-05-05T01:04:23.345Z | 2026-05-05T01:07:39.305Z | yes   | `evaluation/runs/20260505T010423Z-012-ci-gate-summary-and-enforcement-e46cb73/summary.json` |
| 20260505T005842Z-012-ci-gate-summary-and-enforcement-e46cb73 | gate        | local  | failed | 2026-05-05T00:58:42.708Z | 2026-05-05T01:01:30.828Z | yes   | `evaluation/runs/20260505T005842Z-012-ci-gate-summary-and-enforcement-e46cb73/summary.json` |

## Trend Summary

Selected run count: 5

### Selected Run Status Counts

- failed: 1
- passed: 4

### Layer Duration Trends

| Layer       | Latest Run                                           | Latest Status | Latest Duration | Previous Duration | Delta    | Observations | Slow | Failed |
| ----------- | ---------------------------------------------------- | ------------- | --------------- | ----------------- | -------- | ------------ | ---- | ------ |
| environment | 20260505T024104Z-013-feature-coverage-matrix-2e9046b | passed        | 1517ms          | 1271ms            | +246ms   | 5            | 0    | 0      |
| full-e2e    | 20260505T024104Z-013-feature-coverage-matrix-2e9046b | passed        | 110120ms        | 190438ms          | -80318ms | 2            | 2    | 0      |
| integration | 20260505T024104Z-013-feature-coverage-matrix-2e9046b | passed        | 53174ms         | 58471ms           | -5297ms  | 5            | 5    | 0      |
| smoke-e2e   | 20260505T024104Z-013-feature-coverage-matrix-2e9046b | passed        | 34844ms         | 33633ms           | +1211ms  | 5            | 5    | 1      |
| static      | 20260505T024104Z-013-feature-coverage-matrix-2e9046b | passed        | 3104ms          | 2994ms            | +110ms   | 5            | 0    | 0      |
| unit        | 20260505T024104Z-013-feature-coverage-matrix-2e9046b | passed        | 671ms           | 631ms             | +40ms    | 5            | 0    | 0      |

## Baseline Comparison

Baseline source: `evaluation/baselines/run-health-baseline.json`
Updated from: reviewed local gate evidence through 010-ci-health-trends

### Baseline Notes

- Initial baseline is warning-first and intentionally tolerant for browser layers.
- Per-run artifacts remain under evaluation/runs/ and are not committed.

### Baseline Status Counts

- improved: 0
- unchanged: 6
- regressed: 0
- missing: 0
- new: 0

### Layer Baseline Findings

| Layer       | Status    | Observed          | Baseline          | Tolerance | Message                             |
| ----------- | --------- | ----------------- | ----------------- | --------- | ----------------------------------- |
| environment | unchanged | passed / 1517ms   | passed / 2000ms   | 5000ms    | Layer is within baseline tolerance. |
| full-e2e    | unchanged | passed / 110120ms | passed / 110000ms | 30000ms   | Layer is within baseline tolerance. |
| integration | unchanged | passed / 53174ms  | passed / 70000ms  | 20000ms   | Layer is within baseline tolerance. |
| smoke-e2e   | unchanged | passed / 34844ms  | passed / 50000ms  | 20000ms   | Layer is within baseline tolerance. |
| static      | unchanged | passed / 3104ms   | passed / 5000ms   | 5000ms    | Layer is within baseline tolerance. |
| unit        | unchanged | passed / 671ms    | passed / 1000ms   | 5000ms    | Layer is within baseline tolerance. |

## Preflight Evidence

| Run ID                                                       | Layer       | Kind      | Title                      | Status | Classification | Duration | Artifact                                                                                                            | Messages                                               |
| ------------------------------------------------------------ | ----------- | --------- | -------------------------- | ------ | -------------- | -------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| 20260505T005842Z-012-ci-gate-summary-and-enforcement-e46cb73 | environment | preflight | Playwright browser runtime | passed | -              | -        | `evaluation/runs/20260505T005842Z-012-ci-gate-summary-and-enforcement-e46cb73/artifacts/environment-preflight.json` | Chromium executable is available.; No action required. |
| 20260505T005842Z-012-ci-gate-summary-and-enforcement-e46cb73 | environment | preflight | Playwright CLI             | passed | -              | -        | `evaluation/runs/20260505T005842Z-012-ci-gate-summary-and-enforcement-e46cb73/artifacts/environment-preflight.json` | Playwright CLI is available.; No action required.      |
| 20260505T005842Z-012-ci-gate-summary-and-enforcement-e46cb73 | environment | preflight | Prettier CLI               | passed | -              | -        | `evaluation/runs/20260505T005842Z-012-ci-gate-summary-and-enforcement-e46cb73/artifacts/environment-preflight.json` | Prettier CLI is available.; No action required.        |
| 20260505T005842Z-012-ci-gate-summary-and-enforcement-e46cb73 | environment | preflight | Subprocess spawn           | passed | -              | -        | `evaluation/runs/20260505T005842Z-012-ci-gate-summary-and-enforcement-e46cb73/artifacts/environment-preflight.json` | Subprocess spawn is available.; No action required.    |
| 20260505T005842Z-012-ci-gate-summary-and-enforcement-e46cb73 | environment | preflight | Webpack CLI                | passed | -              | -        | `evaluation/runs/20260505T005842Z-012-ci-gate-summary-and-enforcement-e46cb73/artifacts/environment-preflight.json` | Webpack CLI is available.; No action required.         |
| 20260505T010423Z-012-ci-gate-summary-and-enforcement-e46cb73 | environment | preflight | Playwright browser runtime | passed | -              | -        | `evaluation/runs/20260505T010423Z-012-ci-gate-summary-and-enforcement-e46cb73/artifacts/environment-preflight.json` | Chromium executable is available.; No action required. |
| 20260505T010423Z-012-ci-gate-summary-and-enforcement-e46cb73 | environment | preflight | Playwright CLI             | passed | -              | -        | `evaluation/runs/20260505T010423Z-012-ci-gate-summary-and-enforcement-e46cb73/artifacts/environment-preflight.json` | Playwright CLI is available.; No action required.      |
| 20260505T010423Z-012-ci-gate-summary-and-enforcement-e46cb73 | environment | preflight | Prettier CLI               | passed | -              | -        | `evaluation/runs/20260505T010423Z-012-ci-gate-summary-and-enforcement-e46cb73/artifacts/environment-preflight.json` | Prettier CLI is available.; No action required.        |
| 20260505T010423Z-012-ci-gate-summary-and-enforcement-e46cb73 | environment | preflight | Subprocess spawn           | passed | -              | -        | `evaluation/runs/20260505T010423Z-012-ci-gate-summary-and-enforcement-e46cb73/artifacts/environment-preflight.json` | Subprocess spawn is available.; No action required.    |
| 20260505T010423Z-012-ci-gate-summary-and-enforcement-e46cb73 | environment | preflight | Webpack CLI                | passed | -              | -        | `evaluation/runs/20260505T010423Z-012-ci-gate-summary-and-enforcement-e46cb73/artifacts/environment-preflight.json` | Webpack CLI is available.; No action required.         |
| 20260505T010750Z-012-ci-gate-summary-and-enforcement-e46cb73 | environment | preflight | Playwright browser runtime | passed | -              | -        | `evaluation/runs/20260505T010750Z-012-ci-gate-summary-and-enforcement-e46cb73/artifacts/environment-preflight.json` | Chromium executable is available.; No action required. |
| 20260505T010750Z-012-ci-gate-summary-and-enforcement-e46cb73 | environment | preflight | Playwright CLI             | passed | -              | -        | `evaluation/runs/20260505T010750Z-012-ci-gate-summary-and-enforcement-e46cb73/artifacts/environment-preflight.json` | Playwright CLI is available.; No action required.      |
| 20260505T010750Z-012-ci-gate-summary-and-enforcement-e46cb73 | environment | preflight | Prettier CLI               | passed | -              | -        | `evaluation/runs/20260505T010750Z-012-ci-gate-summary-and-enforcement-e46cb73/artifacts/environment-preflight.json` | Prettier CLI is available.; No action required.        |
| 20260505T010750Z-012-ci-gate-summary-and-enforcement-e46cb73 | environment | preflight | Subprocess spawn           | passed | -              | -        | `evaluation/runs/20260505T010750Z-012-ci-gate-summary-and-enforcement-e46cb73/artifacts/environment-preflight.json` | Subprocess spawn is available.; No action required.    |
| 20260505T010750Z-012-ci-gate-summary-and-enforcement-e46cb73 | environment | preflight | Webpack CLI                | passed | -              | -        | `evaluation/runs/20260505T010750Z-012-ci-gate-summary-and-enforcement-e46cb73/artifacts/environment-preflight.json` | Webpack CLI is available.; No action required.         |
| 20260505T023814Z-013-feature-coverage-matrix-2e9046b         | environment | preflight | Playwright browser runtime | passed | -              | -        | `evaluation/runs/20260505T023814Z-013-feature-coverage-matrix-2e9046b/artifacts/environment-preflight.json`         | Chromium executable is available.; No action required. |
| 20260505T023814Z-013-feature-coverage-matrix-2e9046b         | environment | preflight | Playwright CLI             | passed | -              | -        | `evaluation/runs/20260505T023814Z-013-feature-coverage-matrix-2e9046b/artifacts/environment-preflight.json`         | Playwright CLI is available.; No action required.      |
| 20260505T023814Z-013-feature-coverage-matrix-2e9046b         | environment | preflight | Prettier CLI               | passed | -              | -        | `evaluation/runs/20260505T023814Z-013-feature-coverage-matrix-2e9046b/artifacts/environment-preflight.json`         | Prettier CLI is available.; No action required.        |
| 20260505T023814Z-013-feature-coverage-matrix-2e9046b         | environment | preflight | Subprocess spawn           | passed | -              | -        | `evaluation/runs/20260505T023814Z-013-feature-coverage-matrix-2e9046b/artifacts/environment-preflight.json`         | Subprocess spawn is available.; No action required.    |
| 20260505T023814Z-013-feature-coverage-matrix-2e9046b         | environment | preflight | Webpack CLI                | passed | -              | -        | `evaluation/runs/20260505T023814Z-013-feature-coverage-matrix-2e9046b/artifacts/environment-preflight.json`         | Webpack CLI is available.; No action required.         |
| 20260505T024104Z-013-feature-coverage-matrix-2e9046b         | environment | preflight | Playwright browser runtime | passed | -              | -        | `evaluation/runs/20260505T024104Z-013-feature-coverage-matrix-2e9046b/artifacts/environment-preflight.json`         | Chromium executable is available.; No action required. |
| 20260505T024104Z-013-feature-coverage-matrix-2e9046b         | environment | preflight | Playwright CLI             | passed | -              | -        | `evaluation/runs/20260505T024104Z-013-feature-coverage-matrix-2e9046b/artifacts/environment-preflight.json`         | Playwright CLI is available.; No action required.      |
| 20260505T024104Z-013-feature-coverage-matrix-2e9046b         | environment | preflight | Prettier CLI               | passed | -              | -        | `evaluation/runs/20260505T024104Z-013-feature-coverage-matrix-2e9046b/artifacts/environment-preflight.json`         | Prettier CLI is available.; No action required.        |
| 20260505T024104Z-013-feature-coverage-matrix-2e9046b         | environment | preflight | Subprocess spawn           | passed | -              | -        | `evaluation/runs/20260505T024104Z-013-feature-coverage-matrix-2e9046b/artifacts/environment-preflight.json`         | Subprocess spawn is available.; No action required.    |
| 20260505T024104Z-013-feature-coverage-matrix-2e9046b         | environment | preflight | Webpack CLI                | passed | -              | -        | `evaluation/runs/20260505T024104Z-013-feature-coverage-matrix-2e9046b/artifacts/environment-preflight.json`         | Webpack CLI is available.; No action required.         |

## Slow Layers

| Run ID                                                       | Layer       | Status | Duration | Threshold | Classification | Artifacts                                                                                              |
| ------------------------------------------------------------ | ----------- | ------ | -------- | --------- | -------------- | ------------------------------------------------------------------------------------------------------ |
| 20260505T010750Z-012-ci-gate-summary-and-enforcement-e46cb73 | full-e2e    | passed | 190438ms | 45000ms   | -              | `logs/full-e2e.stdout.log`<br>`logs/full-e2e.stderr.log`<br>`artifacts/full-e2e-results.json`          |
| 20260505T010750Z-012-ci-gate-summary-and-enforcement-e46cb73 | integration | passed | 111769ms | 40000ms   | -              | `logs/integration.stdout.log`<br>`logs/integration.stderr.log`<br>`artifacts/integration-results.json` |
| 20260505T024104Z-013-feature-coverage-matrix-2e9046b         | full-e2e    | passed | 110120ms | 45000ms   | -              | `logs/full-e2e.stdout.log`<br>`logs/full-e2e.stderr.log`<br>`artifacts/full-e2e-results.json`          |
| 20260505T010423Z-012-ci-gate-summary-and-enforcement-e46cb73 | integration | passed | 109507ms | 40000ms   | -              | `logs/integration.stdout.log`<br>`logs/integration.stderr.log`<br>`artifacts/integration-results.json` |
| 20260505T005842Z-012-ci-gate-summary-and-enforcement-e46cb73 | integration | passed | 96936ms  | 40000ms   | -              | `logs/integration.stdout.log`<br>`logs/integration.stderr.log`<br>`artifacts/integration-results.json` |
| 20260505T010423Z-012-ci-gate-summary-and-enforcement-e46cb73 | smoke-e2e   | passed | 80588ms  | 30000ms   | -              | `logs/smoke-e2e.stdout.log`<br>`logs/smoke-e2e.stderr.log`<br>`artifacts/smoke-results.json`           |
| 20260505T010750Z-012-ci-gate-summary-and-enforcement-e46cb73 | smoke-e2e   | passed | 78657ms  | 30000ms   | -              | `logs/smoke-e2e.stdout.log`<br>`logs/smoke-e2e.stderr.log`<br>`artifacts/smoke-results.json`           |
| 20260505T005842Z-012-ci-gate-summary-and-enforcement-e46cb73 | smoke-e2e   | failed | 63098ms  | 30000ms   | environment    | `logs/smoke-e2e.stdout.log`<br>`logs/smoke-e2e.stderr.log`<br>`artifacts/smoke-results.json`           |
| 20260505T023814Z-013-feature-coverage-matrix-2e9046b         | integration | passed | 58471ms  | 40000ms   | -              | `logs/integration.stdout.log`<br>`logs/integration.stderr.log`<br>`artifacts/integration-results.json` |
| 20260505T024104Z-013-feature-coverage-matrix-2e9046b         | integration | passed | 53174ms  | 40000ms   | -              | `logs/integration.stdout.log`<br>`logs/integration.stderr.log`<br>`artifacts/integration-results.json` |
| 20260505T024104Z-013-feature-coverage-matrix-2e9046b         | smoke-e2e   | passed | 34844ms  | 30000ms   | -              | `logs/smoke-e2e.stdout.log`<br>`logs/smoke-e2e.stderr.log`<br>`artifacts/smoke-results.json`           |
| 20260505T023814Z-013-feature-coverage-matrix-2e9046b         | smoke-e2e   | passed | 33633ms  | 30000ms   | -              | `logs/smoke-e2e.stdout.log`<br>`logs/smoke-e2e.stderr.log`<br>`artifacts/smoke-results.json`           |

## Slow Tests

Total slow observations: 12

| Run ID                                                       | Layer       | Title                                                                                                                        | File                          | Project  | Duration | Status | Retry | Artifact                                                                                                          |
| ------------------------------------------------------------ | ----------- | ---------------------------------------------------------------------------------------------------------------------------- | ----------------------------- | -------- | -------- | ------ | ----- | ----------------------------------------------------------------------------------------------------------------- |
| 20260505T010750Z-012-ci-gate-summary-and-enforcement-e46cb73 | integration | reservation-form.spec.mjs > reservation form page-local behavior > toggles contact fields without leaving the page           | reservation-form.spec.mjs:58  | chromium | 7749ms   | passed | 0     | `evaluation/runs/20260505T010750Z-012-ci-gate-summary-and-enforcement-e46cb73/artifacts/integration-results.json` |
| 20260505T010423Z-012-ci-gate-summary-and-enforcement-e46cb73 | integration | reservation-form.spec.mjs > reservation form page-local behavior > toggles contact fields without leaving the page           | reservation-form.spec.mjs:58  | chromium | 7683ms   | passed | 0     | `evaluation/runs/20260505T010423Z-012-ci-gate-summary-and-enforcement-e46cb73/artifacts/integration-results.json` |
| 20260505T010423Z-012-ci-gate-summary-and-enforcement-e46cb73 | smoke-e2e   | smoke.spec.mjs > smoke route opens the en-US reservation entry point                                                         | smoke.spec.mjs:19             | chromium | 7150ms   | passed | 0     | `evaluation/runs/20260505T010423Z-012-ci-gate-summary-and-enforcement-e46cb73/artifacts/smoke-results.json`       |
| 20260505T005842Z-012-ci-gate-summary-and-enforcement-e46cb73 | integration | reservation-form.spec.mjs > reservation form page-local behavior > toggles contact fields without leaving the page           | reservation-form.spec.mjs:58  | chromium | 5584ms   | passed | 0     | `evaluation/runs/20260505T005842Z-012-ci-gate-summary-and-enforcement-e46cb73/artifacts/integration-results.json` |
| 20260505T010750Z-012-ci-gate-summary-and-enforcement-e46cb73 | smoke-e2e   | smoke.spec.mjs > smoke route opens the en-US reservation entry point                                                         | smoke.spec.mjs:19             | chromium | 5460ms   | passed | 0     | `evaluation/runs/20260505T010750Z-012-ci-gate-summary-and-enforcement-e46cb73/artifacts/smoke-results.json`       |
| 20260505T010750Z-012-ci-gate-summary-and-enforcement-e46cb73 | full-e2e    | en-US\login.spec.ts > Login > It should be successful logged in preset user                                                  | en-US/login.spec.ts:13        | chromium | 5363ms   | passed | 0     | `evaluation/runs/20260505T010750Z-012-ci-gate-summary-and-enforcement-e46cb73/artifacts/full-e2e-results.json`    |
| 20260505T005842Z-012-ci-gate-summary-and-enforcement-e46cb73 | integration | reservation-form.spec.mjs > en-US reservation validation feedback > shows blank required feedback for date, stay, and guests | reservation-form.spec.mjs:116 | chromium | 3875ms   | passed | 0     | `evaluation/runs/20260505T005842Z-012-ci-gate-summary-and-enforcement-e46cb73/artifacts/integration-results.json` |
| 20260505T010423Z-012-ci-gate-summary-and-enforcement-e46cb73 | smoke-e2e   | smoke.spec.mjs > smoke completes one en-US reservation happy path                                                            | smoke.spec.mjs:35             | chromium | 3555ms   | passed | 0     | `evaluation/runs/20260505T010423Z-012-ci-gate-summary-and-enforcement-e46cb73/artifacts/smoke-results.json`       |
| 20260505T010750Z-012-ci-gate-summary-and-enforcement-e46cb73 | full-e2e    | ja\reserve.spec.ts > 宿泊予約 > 宿泊予約が完了すること\_ログイン                                                             | ja/reserve.spec.ts:367        | chromium | 3515ms   | passed | 0     | `evaluation/runs/20260505T010750Z-012-ci-gate-summary-and-enforcement-e46cb73/artifacts/full-e2e-results.json`    |
| 20260505T010750Z-012-ci-gate-summary-and-enforcement-e46cb73 | smoke-e2e   | smoke.spec.mjs > smoke completes one en-US reservation happy path                                                            | smoke.spec.mjs:35             | chromium | 3437ms   | passed | 0     | `evaluation/runs/20260505T010750Z-012-ci-gate-summary-and-enforcement-e46cb73/artifacts/smoke-results.json`       |

## Instability Evidence

| Run ID                                       | Layer | Kind | Title | Status | Classification | Duration | Artifact | Messages |
| -------------------------------------------- | ----- | ---- | ----- | ------ | -------------- | -------- | -------- | -------- |
| No flaky evidence observed in selected runs. | -     | -    | -     | -      | -              | -        | -        | -        |

## Environment Evidence

| Run ID                                                       | Layer     | Kind       | Title           | Status | Classification | Duration | Artifact                                                                                    | Messages                                                                 |
| ------------------------------------------------------------ | --------- | ---------- | --------------- | ------ | -------------- | -------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| 20260505T005842Z-012-ci-gate-summary-and-enforcement-e46cb73 | smoke-e2e | diagnostic | Run diagnostic  | failed | environment    | -        | `evaluation/runs/20260505T005842Z-012-ci-gate-summary-and-enforcement-e46cb73/summary.json` | [1A[2K[2m[WebServer] [22m<i> [webpack-dev-server] Project is running at: |
| 20260505T005842Z-012-ci-gate-summary-and-enforcement-e46cb73 | smoke-e2e | layer      | smoke-e2e layer | failed | environment    | 63098ms  | `evaluation/runs/20260505T005842Z-012-ci-gate-summary-and-enforcement-e46cb73/summary.json` | -                                                                        |

## Warnings

- None

## Recommended Review Focus

- Fix environment/tooling evidence before changing tests.
- Review slow layers against configured thresholds.
- Review top slow Playwright tests for lower-layer coverage or setup cost.
