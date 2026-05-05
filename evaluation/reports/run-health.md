# Run Health Report

## Metadata

- Generated command: `node evaluation/bin/generate-run-health.mjs`
- Config: `evaluation/config/run-health.config.json`
- Runs directory: `evaluation/runs`
- Report path: `evaluation/reports/run-health.md`
- Baseline: `evaluation/baselines/run-health-baseline.json`
- Selected runs: `20260505T010750Z-012-ci-gate-summary-and-enforcement-e46cb73`, `20260505T010423Z-012-ci-gate-summary-and-enforcement-e46cb73`, `20260505T005842Z-012-ci-gate-summary-and-enforcement-e46cb73`, `20260504T152215Z-011-evaluation-quality-gate-ab15902`, `20260504T131557Z-010-ci-health-trends-4a6311a`
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
| 20260505T010750Z-012-ci-gate-summary-and-enforcement-e46cb73 | collect-all | local  | passed | 2026-05-05T01:07:50.876Z | 2026-05-05T01:14:18.509Z | yes   | `evaluation/runs/20260505T010750Z-012-ci-gate-summary-and-enforcement-e46cb73/summary.json` |
| 20260505T010423Z-012-ci-gate-summary-and-enforcement-e46cb73 | gate        | local  | passed | 2026-05-05T01:04:23.345Z | 2026-05-05T01:07:39.305Z | yes   | `evaluation/runs/20260505T010423Z-012-ci-gate-summary-and-enforcement-e46cb73/summary.json` |
| 20260505T005842Z-012-ci-gate-summary-and-enforcement-e46cb73 | gate        | local  | failed | 2026-05-05T00:58:42.708Z | 2026-05-05T01:01:30.828Z | yes   | `evaluation/runs/20260505T005842Z-012-ci-gate-summary-and-enforcement-e46cb73/summary.json` |
| 20260504T152215Z-011-evaluation-quality-gate-ab15902         | gate        | local  | passed | 2026-05-04T15:22:15.705Z | 2026-05-04T15:24:05.737Z | yes   | `evaluation/runs/20260504T152215Z-011-evaluation-quality-gate-ab15902/summary.json`         |
| 20260504T131557Z-010-ci-health-trends-4a6311a                | gate        | local  | passed | 2026-05-04T13:15:57.315Z | 2026-05-04T13:17:42.102Z | yes   | `evaluation/runs/20260504T131557Z-010-ci-health-trends-4a6311a/summary.json`                |

## Trend Summary

Selected run count: 5

### Selected Run Status Counts

- failed: 1
- passed: 4

### Layer Duration Trends

| Layer       | Latest Run                                                   | Latest Status | Latest Duration | Previous Duration | Delta   | Observations | Slow | Failed |
| ----------- | ------------------------------------------------------------ | ------------- | --------------- | ----------------- | ------- | ------------ | ---- | ------ |
| environment | 20260505T010750Z-012-ci-gate-summary-and-enforcement-e46cb73 | passed        | 1388ms          | 1098ms            | +290ms  | 5            | 0    | 0      |
| full-e2e    | 20260505T010750Z-012-ci-gate-summary-and-enforcement-e46cb73 | passed        | 190438ms        | -                 | -       | 1            | 1    | 0      |
| integration | 20260505T010750Z-012-ci-gate-summary-and-enforcement-e46cb73 | passed        | 111769ms        | 109507ms          | +2262ms | 5            | 5    | 0      |
| smoke-e2e   | 20260505T010750Z-012-ci-gate-summary-and-enforcement-e46cb73 | passed        | 78657ms         | 80588ms           | -1931ms | 5            | 5    | 1      |
| static      | 20260505T010750Z-012-ci-gate-summary-and-enforcement-e46cb73 | passed        | 3169ms          | 2877ms            | +292ms  | 5            | 0    | 0      |
| unit        | 20260505T010750Z-012-ci-gate-summary-and-enforcement-e46cb73 | passed        | 653ms           | 615ms             | +38ms   | 5            | 0    | 0      |

## Baseline Comparison

Baseline source: `evaluation/baselines/run-health-baseline.json`
Updated from: reviewed local gate evidence through 010-ci-health-trends

### Baseline Notes

- Initial baseline is warning-first and intentionally tolerant for browser layers.
- Per-run artifacts remain under evaluation/runs/ and are not committed.

### Baseline Status Counts

- improved: 0
- unchanged: 3
- regressed: 3
- missing: 0
- new: 0

### Layer Baseline Findings

| Layer       | Status    | Observed          | Baseline          | Tolerance | Message                                                         |
| ----------- | --------- | ----------------- | ----------------- | --------- | --------------------------------------------------------------- |
| environment | unchanged | passed / 1388ms   | passed / 2000ms   | 5000ms    | Layer is within baseline tolerance.                             |
| full-e2e    | regressed | passed / 190438ms | passed / 110000ms | 30000ms   | duration 190438ms exceeds baseline 110000ms + tolerance 30000ms |
| integration | regressed | passed / 111769ms | passed / 70000ms  | 20000ms   | duration 111769ms exceeds baseline 70000ms + tolerance 20000ms  |
| smoke-e2e   | regressed | passed / 78657ms  | passed / 50000ms  | 20000ms   | duration 78657ms exceeds baseline 50000ms + tolerance 20000ms   |
| static      | unchanged | passed / 3169ms   | passed / 5000ms   | 5000ms    | Layer is within baseline tolerance.                             |
| unit        | unchanged | passed / 653ms    | passed / 1000ms   | 5000ms    | Layer is within baseline tolerance.                             |

## Preflight Evidence

| Run ID                                                       | Layer       | Kind      | Title                      | Status | Classification | Duration | Artifact                                                                                                            | Messages                                               |
| ------------------------------------------------------------ | ----------- | --------- | -------------------------- | ------ | -------------- | -------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| 20260504T131557Z-010-ci-health-trends-4a6311a                | environment | preflight | Playwright browser runtime | passed | -              | -        | `evaluation/runs/20260504T131557Z-010-ci-health-trends-4a6311a/artifacts/environment-preflight.json`                | Chromium executable is available.; No action required. |
| 20260504T131557Z-010-ci-health-trends-4a6311a                | environment | preflight | Playwright CLI             | passed | -              | -        | `evaluation/runs/20260504T131557Z-010-ci-health-trends-4a6311a/artifacts/environment-preflight.json`                | Playwright CLI is available.; No action required.      |
| 20260504T131557Z-010-ci-health-trends-4a6311a                | environment | preflight | Prettier CLI               | passed | -              | -        | `evaluation/runs/20260504T131557Z-010-ci-health-trends-4a6311a/artifacts/environment-preflight.json`                | Prettier CLI is available.; No action required.        |
| 20260504T131557Z-010-ci-health-trends-4a6311a                | environment | preflight | Subprocess spawn           | passed | -              | -        | `evaluation/runs/20260504T131557Z-010-ci-health-trends-4a6311a/artifacts/environment-preflight.json`                | Subprocess spawn is available.; No action required.    |
| 20260504T131557Z-010-ci-health-trends-4a6311a                | environment | preflight | Webpack CLI                | passed | -              | -        | `evaluation/runs/20260504T131557Z-010-ci-health-trends-4a6311a/artifacts/environment-preflight.json`                | Webpack CLI is available.; No action required.         |
| 20260504T152215Z-011-evaluation-quality-gate-ab15902         | environment | preflight | Playwright browser runtime | passed | -              | -        | `evaluation/runs/20260504T152215Z-011-evaluation-quality-gate-ab15902/artifacts/environment-preflight.json`         | Chromium executable is available.; No action required. |
| 20260504T152215Z-011-evaluation-quality-gate-ab15902         | environment | preflight | Playwright CLI             | passed | -              | -        | `evaluation/runs/20260504T152215Z-011-evaluation-quality-gate-ab15902/artifacts/environment-preflight.json`         | Playwright CLI is available.; No action required.      |
| 20260504T152215Z-011-evaluation-quality-gate-ab15902         | environment | preflight | Prettier CLI               | passed | -              | -        | `evaluation/runs/20260504T152215Z-011-evaluation-quality-gate-ab15902/artifacts/environment-preflight.json`         | Prettier CLI is available.; No action required.        |
| 20260504T152215Z-011-evaluation-quality-gate-ab15902         | environment | preflight | Subprocess spawn           | passed | -              | -        | `evaluation/runs/20260504T152215Z-011-evaluation-quality-gate-ab15902/artifacts/environment-preflight.json`         | Subprocess spawn is available.; No action required.    |
| 20260504T152215Z-011-evaluation-quality-gate-ab15902         | environment | preflight | Webpack CLI                | passed | -              | -        | `evaluation/runs/20260504T152215Z-011-evaluation-quality-gate-ab15902/artifacts/environment-preflight.json`         | Webpack CLI is available.; No action required.         |
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

## Slow Layers

| Run ID                                                       | Layer       | Status | Duration | Threshold | Classification | Artifacts                                                                                              |
| ------------------------------------------------------------ | ----------- | ------ | -------- | --------- | -------------- | ------------------------------------------------------------------------------------------------------ |
| 20260505T010750Z-012-ci-gate-summary-and-enforcement-e46cb73 | full-e2e    | passed | 190438ms | 45000ms   | -              | `logs/full-e2e.stdout.log`<br>`logs/full-e2e.stderr.log`<br>`artifacts/full-e2e-results.json`          |
| 20260505T010750Z-012-ci-gate-summary-and-enforcement-e46cb73 | integration | passed | 111769ms | 40000ms   | -              | `logs/integration.stdout.log`<br>`logs/integration.stderr.log`<br>`artifacts/integration-results.json` |
| 20260505T010423Z-012-ci-gate-summary-and-enforcement-e46cb73 | integration | passed | 109507ms | 40000ms   | -              | `logs/integration.stdout.log`<br>`logs/integration.stderr.log`<br>`artifacts/integration-results.json` |
| 20260505T005842Z-012-ci-gate-summary-and-enforcement-e46cb73 | integration | passed | 96936ms  | 40000ms   | -              | `logs/integration.stdout.log`<br>`logs/integration.stderr.log`<br>`artifacts/integration-results.json` |
| 20260505T010423Z-012-ci-gate-summary-and-enforcement-e46cb73 | smoke-e2e   | passed | 80588ms  | 30000ms   | -              | `logs/smoke-e2e.stdout.log`<br>`logs/smoke-e2e.stderr.log`<br>`artifacts/smoke-results.json`           |
| 20260505T010750Z-012-ci-gate-summary-and-enforcement-e46cb73 | smoke-e2e   | passed | 78657ms  | 30000ms   | -              | `logs/smoke-e2e.stdout.log`<br>`logs/smoke-e2e.stderr.log`<br>`artifacts/smoke-results.json`           |
| 20260504T152215Z-011-evaluation-quality-gate-ab15902         | integration | passed | 63812ms  | 40000ms   | -              | `logs/integration.stdout.log`<br>`logs/integration.stderr.log`<br>`artifacts/integration-results.json` |
| 20260505T005842Z-012-ci-gate-summary-and-enforcement-e46cb73 | smoke-e2e   | failed | 63098ms  | 30000ms   | environment    | `logs/smoke-e2e.stdout.log`<br>`logs/smoke-e2e.stderr.log`<br>`artifacts/smoke-results.json`           |
| 20260504T131557Z-010-ci-health-trends-4a6311a                | integration | passed | 60276ms  | 40000ms   | -              | `logs/integration.stdout.log`<br>`logs/integration.stderr.log`<br>`artifacts/integration-results.json` |
| 20260504T131557Z-010-ci-health-trends-4a6311a                | smoke-e2e   | passed | 39389ms  | 30000ms   | -              | `logs/smoke-e2e.stdout.log`<br>`logs/smoke-e2e.stderr.log`<br>`artifacts/smoke-results.json`           |
| 20260504T152215Z-011-evaluation-quality-gate-ab15902         | smoke-e2e   | passed | 38890ms  | 30000ms   | -              | `logs/smoke-e2e.stdout.log`<br>`logs/smoke-e2e.stderr.log`<br>`artifacts/smoke-results.json`           |

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
