# Run Health Report

## Metadata

- Generated command: `node evaluation/bin/generate-run-health.mjs`
- Config: `evaluation/config/run-health.config.json`
- Runs directory: `evaluation/runs`
- Report path: `evaluation/reports/run-health.md`
- Baseline: `evaluation/baselines/run-health-baseline.json`
- Selected runs: `20260508T083122Z-013-feature-coverage-matrix-5a913ae`, `20260508T083023Z-013-feature-coverage-matrix-5a913ae`, `20260508T081529Z-013-feature-coverage-matrix-dcef17d`, `20260508T081437Z-013-feature-coverage-matrix-dcef17d`, `20260508T074623Z-013-feature-coverage-matrix-dcef17d`
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

| Run ID                                               | Mode        | Target | Status | Started                  | Finished                 | Dirty | Summary                                                                             |
| ---------------------------------------------------- | ----------- | ------ | ------ | ------------------------ | ------------------------ | ----- | ----------------------------------------------------------------------------------- |
| 20260508T083122Z-013-feature-coverage-matrix-5a913ae | collect-all | local  | passed | 2026-05-08T08:31:22.011Z | 2026-05-08T08:33:31.192Z | no    | `evaluation/runs/20260508T083122Z-013-feature-coverage-matrix-5a913ae/summary.json` |
| 20260508T083023Z-013-feature-coverage-matrix-5a913ae | gate        | local  | passed | 2026-05-08T08:30:23.347Z | 2026-05-08T08:31:13.075Z | no    | `evaluation/runs/20260508T083023Z-013-feature-coverage-matrix-5a913ae/summary.json` |
| 20260508T081529Z-013-feature-coverage-matrix-dcef17d | collect-all | local  | passed | 2026-05-08T08:15:29.599Z | 2026-05-08T08:17:39.780Z | yes   | `evaluation/runs/20260508T081529Z-013-feature-coverage-matrix-dcef17d/summary.json` |
| 20260508T081437Z-013-feature-coverage-matrix-dcef17d | gate        | local  | passed | 2026-05-08T08:14:37.168Z | 2026-05-08T08:15:20.663Z | yes   | `evaluation/runs/20260508T081437Z-013-feature-coverage-matrix-dcef17d/summary.json` |
| 20260508T074623Z-013-feature-coverage-matrix-dcef17d | collect-all | local  | failed | 2026-05-08T07:46:23.376Z | 2026-05-08T07:50:08.953Z | no    | `evaluation/runs/20260508T074623Z-013-feature-coverage-matrix-dcef17d/summary.json` |

## Trend Summary

Selected run count: 5

### Selected Run Status Counts

- failed: 1
- passed: 4

### Layer Duration Trends

| Layer       | Latest Run                                           | Latest Status | Latest Duration | Previous Duration | Delta   | Observations | Slow | Failed |
| ----------- | ---------------------------------------------------- | ------------- | --------------- | ----------------- | ------- | ------------ | ---- | ------ |
| environment | 20260508T083122Z-013-feature-coverage-matrix-5a913ae | passed        | 802ms           | 800ms             | +2ms    | 5            | 0    | 0      |
| full-e2e    | 20260508T083122Z-013-feature-coverage-matrix-5a913ae | passed        | 87454ms         | 88118ms           | -664ms  | 3            | 3    | 0      |
| integration | 20260508T083122Z-013-feature-coverage-matrix-5a913ae | passed        | 26847ms         | 33549ms           | -6702ms | 5            | 1    | 1      |
| smoke-e2e   | 20260508T083122Z-013-feature-coverage-matrix-5a913ae | passed        | 9720ms          | 11428ms           | -1708ms | 5            | 0    | 0      |
| static      | 20260508T083122Z-013-feature-coverage-matrix-5a913ae | passed        | 2469ms          | 2585ms            | -116ms  | 5            | 0    | 0      |
| unit        | 20260508T083122Z-013-feature-coverage-matrix-5a913ae | passed        | 647ms           | 610ms             | +37ms   | 5            | 0    | 0      |

## Baseline Comparison

Baseline source: `evaluation/baselines/run-health-baseline.json`
Updated from: reviewed local gate evidence through 010-ci-health-trends

### Baseline Notes

- Initial baseline is warning-first and intentionally tolerant for browser layers.
- Per-run artifacts remain under evaluation/runs/ and are not committed.

### Baseline Status Counts

- improved: 2
- unchanged: 4
- regressed: 0
- missing: 0
- new: 0

### Layer Baseline Findings

| Layer       | Status    | Observed         | Baseline          | Tolerance | Message                                      |
| ----------- | --------- | ---------------- | ----------------- | --------- | -------------------------------------------- |
| environment | unchanged | passed / 802ms   | passed / 2000ms   | 5000ms    | Layer is within baseline tolerance.          |
| full-e2e    | unchanged | passed / 87454ms | passed / 110000ms | 30000ms   | Layer is within baseline tolerance.          |
| integration | improved  | passed / 26847ms | passed / 70000ms  | 20000ms   | Layer is faster than the baseline tolerance. |
| smoke-e2e   | improved  | passed / 9720ms  | passed / 50000ms  | 20000ms   | Layer is faster than the baseline tolerance. |
| static      | unchanged | passed / 2469ms  | passed / 5000ms   | 5000ms    | Layer is within baseline tolerance.          |
| unit        | unchanged | passed / 647ms   | passed / 1000ms   | 5000ms    | Layer is within baseline tolerance.          |

## Preflight Evidence

| Run ID                                               | Layer       | Kind      | Title                      | Status | Classification | Duration | Artifact                                                                                                    | Messages                                               |
| ---------------------------------------------------- | ----------- | --------- | -------------------------- | ------ | -------------- | -------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| 20260508T074623Z-013-feature-coverage-matrix-dcef17d | environment | preflight | Playwright browser runtime | passed | -              | -        | `evaluation/runs/20260508T074623Z-013-feature-coverage-matrix-dcef17d/artifacts/environment-preflight.json` | Chromium executable is available.; No action required. |
| 20260508T074623Z-013-feature-coverage-matrix-dcef17d | environment | preflight | Playwright CLI             | passed | -              | -        | `evaluation/runs/20260508T074623Z-013-feature-coverage-matrix-dcef17d/artifacts/environment-preflight.json` | Playwright CLI is available.; No action required.      |
| 20260508T074623Z-013-feature-coverage-matrix-dcef17d | environment | preflight | Prettier CLI               | passed | -              | -        | `evaluation/runs/20260508T074623Z-013-feature-coverage-matrix-dcef17d/artifacts/environment-preflight.json` | Prettier CLI is available.; No action required.        |
| 20260508T074623Z-013-feature-coverage-matrix-dcef17d | environment | preflight | Subprocess spawn           | passed | -              | -        | `evaluation/runs/20260508T074623Z-013-feature-coverage-matrix-dcef17d/artifacts/environment-preflight.json` | Subprocess spawn is available.; No action required.    |
| 20260508T074623Z-013-feature-coverage-matrix-dcef17d | environment | preflight | Webpack CLI                | passed | -              | -        | `evaluation/runs/20260508T074623Z-013-feature-coverage-matrix-dcef17d/artifacts/environment-preflight.json` | Webpack CLI is available.; No action required.         |
| 20260508T081437Z-013-feature-coverage-matrix-dcef17d | environment | preflight | Playwright browser runtime | passed | -              | -        | `evaluation/runs/20260508T081437Z-013-feature-coverage-matrix-dcef17d/artifacts/environment-preflight.json` | Chromium executable is available.; No action required. |
| 20260508T081437Z-013-feature-coverage-matrix-dcef17d | environment | preflight | Playwright CLI             | passed | -              | -        | `evaluation/runs/20260508T081437Z-013-feature-coverage-matrix-dcef17d/artifacts/environment-preflight.json` | Playwright CLI is available.; No action required.      |
| 20260508T081437Z-013-feature-coverage-matrix-dcef17d | environment | preflight | Prettier CLI               | passed | -              | -        | `evaluation/runs/20260508T081437Z-013-feature-coverage-matrix-dcef17d/artifacts/environment-preflight.json` | Prettier CLI is available.; No action required.        |
| 20260508T081437Z-013-feature-coverage-matrix-dcef17d | environment | preflight | Subprocess spawn           | passed | -              | -        | `evaluation/runs/20260508T081437Z-013-feature-coverage-matrix-dcef17d/artifacts/environment-preflight.json` | Subprocess spawn is available.; No action required.    |
| 20260508T081437Z-013-feature-coverage-matrix-dcef17d | environment | preflight | Webpack CLI                | passed | -              | -        | `evaluation/runs/20260508T081437Z-013-feature-coverage-matrix-dcef17d/artifacts/environment-preflight.json` | Webpack CLI is available.; No action required.         |
| 20260508T081529Z-013-feature-coverage-matrix-dcef17d | environment | preflight | Playwright browser runtime | passed | -              | -        | `evaluation/runs/20260508T081529Z-013-feature-coverage-matrix-dcef17d/artifacts/environment-preflight.json` | Chromium executable is available.; No action required. |
| 20260508T081529Z-013-feature-coverage-matrix-dcef17d | environment | preflight | Playwright CLI             | passed | -              | -        | `evaluation/runs/20260508T081529Z-013-feature-coverage-matrix-dcef17d/artifacts/environment-preflight.json` | Playwright CLI is available.; No action required.      |
| 20260508T081529Z-013-feature-coverage-matrix-dcef17d | environment | preflight | Prettier CLI               | passed | -              | -        | `evaluation/runs/20260508T081529Z-013-feature-coverage-matrix-dcef17d/artifacts/environment-preflight.json` | Prettier CLI is available.; No action required.        |
| 20260508T081529Z-013-feature-coverage-matrix-dcef17d | environment | preflight | Subprocess spawn           | passed | -              | -        | `evaluation/runs/20260508T081529Z-013-feature-coverage-matrix-dcef17d/artifacts/environment-preflight.json` | Subprocess spawn is available.; No action required.    |
| 20260508T081529Z-013-feature-coverage-matrix-dcef17d | environment | preflight | Webpack CLI                | passed | -              | -        | `evaluation/runs/20260508T081529Z-013-feature-coverage-matrix-dcef17d/artifacts/environment-preflight.json` | Webpack CLI is available.; No action required.         |
| 20260508T083023Z-013-feature-coverage-matrix-5a913ae | environment | preflight | Playwright browser runtime | passed | -              | -        | `evaluation/runs/20260508T083023Z-013-feature-coverage-matrix-5a913ae/artifacts/environment-preflight.json` | Chromium executable is available.; No action required. |
| 20260508T083023Z-013-feature-coverage-matrix-5a913ae | environment | preflight | Playwright CLI             | passed | -              | -        | `evaluation/runs/20260508T083023Z-013-feature-coverage-matrix-5a913ae/artifacts/environment-preflight.json` | Playwright CLI is available.; No action required.      |
| 20260508T083023Z-013-feature-coverage-matrix-5a913ae | environment | preflight | Prettier CLI               | passed | -              | -        | `evaluation/runs/20260508T083023Z-013-feature-coverage-matrix-5a913ae/artifacts/environment-preflight.json` | Prettier CLI is available.; No action required.        |
| 20260508T083023Z-013-feature-coverage-matrix-5a913ae | environment | preflight | Subprocess spawn           | passed | -              | -        | `evaluation/runs/20260508T083023Z-013-feature-coverage-matrix-5a913ae/artifacts/environment-preflight.json` | Subprocess spawn is available.; No action required.    |
| 20260508T083023Z-013-feature-coverage-matrix-5a913ae | environment | preflight | Webpack CLI                | passed | -              | -        | `evaluation/runs/20260508T083023Z-013-feature-coverage-matrix-5a913ae/artifacts/environment-preflight.json` | Webpack CLI is available.; No action required.         |
| 20260508T083122Z-013-feature-coverage-matrix-5a913ae | environment | preflight | Playwright browser runtime | passed | -              | -        | `evaluation/runs/20260508T083122Z-013-feature-coverage-matrix-5a913ae/artifacts/environment-preflight.json` | Chromium executable is available.; No action required. |
| 20260508T083122Z-013-feature-coverage-matrix-5a913ae | environment | preflight | Playwright CLI             | passed | -              | -        | `evaluation/runs/20260508T083122Z-013-feature-coverage-matrix-5a913ae/artifacts/environment-preflight.json` | Playwright CLI is available.; No action required.      |
| 20260508T083122Z-013-feature-coverage-matrix-5a913ae | environment | preflight | Prettier CLI               | passed | -              | -        | `evaluation/runs/20260508T083122Z-013-feature-coverage-matrix-5a913ae/artifacts/environment-preflight.json` | Prettier CLI is available.; No action required.        |
| 20260508T083122Z-013-feature-coverage-matrix-5a913ae | environment | preflight | Subprocess spawn           | passed | -              | -        | `evaluation/runs/20260508T083122Z-013-feature-coverage-matrix-5a913ae/artifacts/environment-preflight.json` | Subprocess spawn is available.; No action required.    |
| 20260508T083122Z-013-feature-coverage-matrix-5a913ae | environment | preflight | Webpack CLI                | passed | -              | -        | `evaluation/runs/20260508T083122Z-013-feature-coverage-matrix-5a913ae/artifacts/environment-preflight.json` | Webpack CLI is available.; No action required.         |

## Slow Layers

| Run ID                                               | Layer       | Status | Duration | Threshold | Classification | Artifacts                                                                                              |
| ---------------------------------------------------- | ----------- | ------ | -------- | --------- | -------------- | ------------------------------------------------------------------------------------------------------ |
| 20260508T074623Z-013-feature-coverage-matrix-dcef17d | integration | failed | 120032ms | 40000ms   | timeout        | `logs/integration.stdout.log`<br>`logs/integration.stderr.log`<br>`artifacts/integration-results.json` |
| 20260508T074623Z-013-feature-coverage-matrix-dcef17d | full-e2e    | passed | 89528ms  | 45000ms   | -              | `logs/full-e2e.stdout.log`<br>`logs/full-e2e.stderr.log`<br>`artifacts/full-e2e-results.json`          |
| 20260508T081529Z-013-feature-coverage-matrix-dcef17d | full-e2e    | passed | 88118ms  | 45000ms   | -              | `logs/full-e2e.stdout.log`<br>`logs/full-e2e.stderr.log`<br>`artifacts/full-e2e-results.json`          |
| 20260508T083122Z-013-feature-coverage-matrix-5a913ae | full-e2e    | passed | 87454ms  | 45000ms   | -              | `logs/full-e2e.stdout.log`<br>`logs/full-e2e.stderr.log`<br>`artifacts/full-e2e-results.json`          |

## Slow Tests

Total slow observations: 1

| Run ID                                               | Layer    | Title                                                                                     | File                      | Project  | Duration | Status | Retry | Artifact                                                                                               |
| ---------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------- | ------------------------- | -------- | -------- | ------ | ----- | ------------------------------------------------------------------------------------------------------ |
| 20260508T074623Z-013-feature-coverage-matrix-dcef17d | full-e2e | en-US\reserve.spec.ts > Reservation > It should be successful the reservation [logged in] | en-US/reserve.spec.ts:380 | chromium | 3018ms   | passed | 0     | `evaluation/runs/20260508T074623Z-013-feature-coverage-matrix-dcef17d/artifacts/full-e2e-results.json` |

## Instability Evidence

| Run ID                                               | Layer       | Kind  | Title             | Status   | Classification | Duration | Artifact                                                                            | Messages |
| ---------------------------------------------------- | ----------- | ----- | ----------------- | -------- | -------------- | -------- | ----------------------------------------------------------------------------------- | -------- |
| 20260508T074623Z-013-feature-coverage-matrix-dcef17d | integration | layer | integration layer | timedOut | timeout        | 120032ms | `evaluation/runs/20260508T074623Z-013-feature-coverage-matrix-dcef17d/summary.json` | -        |

## Environment Evidence

| Run ID                                             | Layer | Kind | Title | Status | Classification | Duration | Artifact | Messages |
| -------------------------------------------------- | ----- | ---- | ----- | ------ | -------------- | -------- | -------- | -------- |
| No environment evidence observed in selected runs. | -     | -    | -     | -      | -              | -        | -        | -        |

## Warnings

- evaluation/runs/20260508T074623Z-013-feature-coverage-matrix-dcef17d/artifacts/integration-results.json: missing

## Recommended Review Focus

- Review unstable product/test evidence before timeout changes.
- Review slow layers against configured thresholds.
- Review top slow Playwright tests for lower-layer coverage or setup cost.
- Resolve unreadable artifacts if the missing evidence affects a decision.
