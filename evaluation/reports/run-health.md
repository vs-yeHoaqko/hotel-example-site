# Run Health Report

## Metadata

- Generated command: `node evaluation/bin/generate-run-health.mjs`
- Config: `evaluation/config/run-health.config.json`
- Runs directory: `evaluation/runs`
- Report path: `evaluation/reports/run-health.md`
- Baseline: `evaluation/baselines/run-health-baseline.json`
- Selected runs: `20260504T152215Z-011-evaluation-quality-gate-ab15902`, `20260504T131557Z-010-ci-health-trends-4a6311a`, `20260504T130425Z-010-ci-health-trends-4a6311a`, `20260504T070317Z-009-evaluation-refactor-c98569d`, `20260504T063255Z-008-environment-preflight-ad8aa95`
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

| Run ID                                               | Mode | Target | Status | Started                  | Finished                 | Dirty | Summary                                                                             |
| ---------------------------------------------------- | ---- | ------ | ------ | ------------------------ | ------------------------ | ----- | ----------------------------------------------------------------------------------- |
| 20260504T152215Z-011-evaluation-quality-gate-ab15902 | gate | local  | passed | 2026-05-04T15:22:15.705Z | 2026-05-04T15:24:05.737Z | yes   | `evaluation/runs/20260504T152215Z-011-evaluation-quality-gate-ab15902/summary.json` |
| 20260504T131557Z-010-ci-health-trends-4a6311a        | gate | local  | passed | 2026-05-04T13:15:57.315Z | 2026-05-04T13:17:42.102Z | yes   | `evaluation/runs/20260504T131557Z-010-ci-health-trends-4a6311a/summary.json`        |
| 20260504T130425Z-010-ci-health-trends-4a6311a        | gate | local  | passed | 2026-05-04T13:04:25.477Z | 2026-05-04T13:06:24.585Z | yes   | `evaluation/runs/20260504T130425Z-010-ci-health-trends-4a6311a/summary.json`        |
| 20260504T070317Z-009-evaluation-refactor-c98569d     | gate | local  | passed | 2026-05-04T07:03:17.658Z | 2026-05-04T07:05:18.713Z | yes   | `evaluation/runs/20260504T070317Z-009-evaluation-refactor-c98569d/summary.json`     |
| 20260504T063255Z-008-environment-preflight-ad8aa95   | full | local  | passed | 2026-05-04T06:32:55.737Z | 2026-05-04T06:35:53.013Z | yes   | `evaluation/runs/20260504T063255Z-008-environment-preflight-ad8aa95/summary.json`   |

## Trend Summary

Selected run count: 5

### Selected Run Status Counts

- passed: 5

### Layer Duration Trends

| Layer       | Latest Run                                           | Latest Status | Latest Duration | Previous Duration | Delta   | Observations | Slow | Failed |
| ----------- | ---------------------------------------------------- | ------------- | --------------- | ----------------- | ------- | ------------ | ---- | ------ |
| environment | 20260504T152215Z-011-evaluation-quality-gate-ab15902 | passed        | 2322ms          | 983ms             | +1339ms | 5            | 0    | 0      |
| full-e2e    | 20260504T063255Z-008-environment-preflight-ad8aa95   | passed        | 95288ms         | -                 | -       | 1            | 1    | 0      |
| integration | 20260504T152215Z-011-evaluation-quality-gate-ab15902 | passed        | 63812ms         | 60276ms           | +3536ms | 5            | 5    | 0      |
| smoke-e2e   | 20260504T152215Z-011-evaluation-quality-gate-ab15902 | passed        | 38890ms         | 39389ms           | -499ms  | 5            | 5    | 0      |
| static      | 20260504T152215Z-011-evaluation-quality-gate-ab15902 | passed        | 3344ms          | 2483ms            | +861ms  | 5            | 0    | 0      |
| unit        | 20260504T152215Z-011-evaluation-quality-gate-ab15902 | passed        | 561ms           | 461ms             | +100ms  | 5            | 0    | 0      |

## Baseline Comparison

Baseline source: `evaluation/baselines/run-health-baseline.json`
Updated from: reviewed local gate evidence through 010-ci-health-trends

### Baseline Notes

- Initial baseline is warning-first and intentionally tolerant for browser layers.
- Per-run artifacts remain under evaluation/runs/ and are not committed.

### Baseline Status Counts

- improved: 0
- unchanged: 5
- regressed: 0
- missing: 0
- new: 0

### Layer Baseline Findings

| Layer       | Status    | Observed         | Baseline         | Tolerance | Message                             |
| ----------- | --------- | ---------------- | ---------------- | --------- | ----------------------------------- |
| environment | unchanged | passed / 2322ms  | passed / 2000ms  | 5000ms    | Layer is within baseline tolerance. |
| integration | unchanged | passed / 63812ms | passed / 70000ms | 20000ms   | Layer is within baseline tolerance. |
| smoke-e2e   | unchanged | passed / 38890ms | passed / 50000ms | 20000ms   | Layer is within baseline tolerance. |
| static      | unchanged | passed / 3344ms  | passed / 5000ms  | 5000ms    | Layer is within baseline tolerance. |
| unit        | unchanged | passed / 561ms   | passed / 1000ms  | 5000ms    | Layer is within baseline tolerance. |

## Preflight Evidence

| Run ID                                               | Layer       | Kind      | Title                      | Status | Classification | Duration | Artifact                                                                                                    | Messages                                               |
| ---------------------------------------------------- | ----------- | --------- | -------------------------- | ------ | -------------- | -------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| 20260504T063255Z-008-environment-preflight-ad8aa95   | environment | preflight | Playwright browser runtime | passed | -              | -        | `evaluation/runs/20260504T063255Z-008-environment-preflight-ad8aa95/artifacts/environment-preflight.json`   | Chromium executable is available.; No action required. |
| 20260504T063255Z-008-environment-preflight-ad8aa95   | environment | preflight | Playwright CLI             | passed | -              | -        | `evaluation/runs/20260504T063255Z-008-environment-preflight-ad8aa95/artifacts/environment-preflight.json`   | Playwright CLI is available.; No action required.      |
| 20260504T063255Z-008-environment-preflight-ad8aa95   | environment | preflight | Prettier CLI               | passed | -              | -        | `evaluation/runs/20260504T063255Z-008-environment-preflight-ad8aa95/artifacts/environment-preflight.json`   | Prettier CLI is available.; No action required.        |
| 20260504T063255Z-008-environment-preflight-ad8aa95   | environment | preflight | Subprocess spawn           | passed | -              | -        | `evaluation/runs/20260504T063255Z-008-environment-preflight-ad8aa95/artifacts/environment-preflight.json`   | Subprocess spawn is available.; No action required.    |
| 20260504T063255Z-008-environment-preflight-ad8aa95   | environment | preflight | Webpack CLI                | passed | -              | -        | `evaluation/runs/20260504T063255Z-008-environment-preflight-ad8aa95/artifacts/environment-preflight.json`   | Webpack CLI is available.; No action required.         |
| 20260504T070317Z-009-evaluation-refactor-c98569d     | environment | preflight | Playwright browser runtime | passed | -              | -        | `evaluation/runs/20260504T070317Z-009-evaluation-refactor-c98569d/artifacts/environment-preflight.json`     | Chromium executable is available.; No action required. |
| 20260504T070317Z-009-evaluation-refactor-c98569d     | environment | preflight | Playwright CLI             | passed | -              | -        | `evaluation/runs/20260504T070317Z-009-evaluation-refactor-c98569d/artifacts/environment-preflight.json`     | Playwright CLI is available.; No action required.      |
| 20260504T070317Z-009-evaluation-refactor-c98569d     | environment | preflight | Prettier CLI               | passed | -              | -        | `evaluation/runs/20260504T070317Z-009-evaluation-refactor-c98569d/artifacts/environment-preflight.json`     | Prettier CLI is available.; No action required.        |
| 20260504T070317Z-009-evaluation-refactor-c98569d     | environment | preflight | Subprocess spawn           | passed | -              | -        | `evaluation/runs/20260504T070317Z-009-evaluation-refactor-c98569d/artifacts/environment-preflight.json`     | Subprocess spawn is available.; No action required.    |
| 20260504T070317Z-009-evaluation-refactor-c98569d     | environment | preflight | Webpack CLI                | passed | -              | -        | `evaluation/runs/20260504T070317Z-009-evaluation-refactor-c98569d/artifacts/environment-preflight.json`     | Webpack CLI is available.; No action required.         |
| 20260504T130425Z-010-ci-health-trends-4a6311a        | environment | preflight | Playwright browser runtime | passed | -              | -        | `evaluation/runs/20260504T130425Z-010-ci-health-trends-4a6311a/artifacts/environment-preflight.json`        | Chromium executable is available.; No action required. |
| 20260504T130425Z-010-ci-health-trends-4a6311a        | environment | preflight | Playwright CLI             | passed | -              | -        | `evaluation/runs/20260504T130425Z-010-ci-health-trends-4a6311a/artifacts/environment-preflight.json`        | Playwright CLI is available.; No action required.      |
| 20260504T130425Z-010-ci-health-trends-4a6311a        | environment | preflight | Prettier CLI               | passed | -              | -        | `evaluation/runs/20260504T130425Z-010-ci-health-trends-4a6311a/artifacts/environment-preflight.json`        | Prettier CLI is available.; No action required.        |
| 20260504T130425Z-010-ci-health-trends-4a6311a        | environment | preflight | Subprocess spawn           | passed | -              | -        | `evaluation/runs/20260504T130425Z-010-ci-health-trends-4a6311a/artifacts/environment-preflight.json`        | Subprocess spawn is available.; No action required.    |
| 20260504T130425Z-010-ci-health-trends-4a6311a        | environment | preflight | Webpack CLI                | passed | -              | -        | `evaluation/runs/20260504T130425Z-010-ci-health-trends-4a6311a/artifacts/environment-preflight.json`        | Webpack CLI is available.; No action required.         |
| 20260504T131557Z-010-ci-health-trends-4a6311a        | environment | preflight | Playwright browser runtime | passed | -              | -        | `evaluation/runs/20260504T131557Z-010-ci-health-trends-4a6311a/artifacts/environment-preflight.json`        | Chromium executable is available.; No action required. |
| 20260504T131557Z-010-ci-health-trends-4a6311a        | environment | preflight | Playwright CLI             | passed | -              | -        | `evaluation/runs/20260504T131557Z-010-ci-health-trends-4a6311a/artifacts/environment-preflight.json`        | Playwright CLI is available.; No action required.      |
| 20260504T131557Z-010-ci-health-trends-4a6311a        | environment | preflight | Prettier CLI               | passed | -              | -        | `evaluation/runs/20260504T131557Z-010-ci-health-trends-4a6311a/artifacts/environment-preflight.json`        | Prettier CLI is available.; No action required.        |
| 20260504T131557Z-010-ci-health-trends-4a6311a        | environment | preflight | Subprocess spawn           | passed | -              | -        | `evaluation/runs/20260504T131557Z-010-ci-health-trends-4a6311a/artifacts/environment-preflight.json`        | Subprocess spawn is available.; No action required.    |
| 20260504T131557Z-010-ci-health-trends-4a6311a        | environment | preflight | Webpack CLI                | passed | -              | -        | `evaluation/runs/20260504T131557Z-010-ci-health-trends-4a6311a/artifacts/environment-preflight.json`        | Webpack CLI is available.; No action required.         |
| 20260504T152215Z-011-evaluation-quality-gate-ab15902 | environment | preflight | Playwright browser runtime | passed | -              | -        | `evaluation/runs/20260504T152215Z-011-evaluation-quality-gate-ab15902/artifacts/environment-preflight.json` | Chromium executable is available.; No action required. |
| 20260504T152215Z-011-evaluation-quality-gate-ab15902 | environment | preflight | Playwright CLI             | passed | -              | -        | `evaluation/runs/20260504T152215Z-011-evaluation-quality-gate-ab15902/artifacts/environment-preflight.json` | Playwright CLI is available.; No action required.      |
| 20260504T152215Z-011-evaluation-quality-gate-ab15902 | environment | preflight | Prettier CLI               | passed | -              | -        | `evaluation/runs/20260504T152215Z-011-evaluation-quality-gate-ab15902/artifacts/environment-preflight.json` | Prettier CLI is available.; No action required.        |
| 20260504T152215Z-011-evaluation-quality-gate-ab15902 | environment | preflight | Subprocess spawn           | passed | -              | -        | `evaluation/runs/20260504T152215Z-011-evaluation-quality-gate-ab15902/artifacts/environment-preflight.json` | Subprocess spawn is available.; No action required.    |
| 20260504T152215Z-011-evaluation-quality-gate-ab15902 | environment | preflight | Webpack CLI                | passed | -              | -        | `evaluation/runs/20260504T152215Z-011-evaluation-quality-gate-ab15902/artifacts/environment-preflight.json` | Webpack CLI is available.; No action required.         |

## Slow Layers

| Run ID                                               | Layer       | Status | Duration | Threshold | Classification | Artifacts                                                                                              |
| ---------------------------------------------------- | ----------- | ------ | -------- | --------- | -------------- | ------------------------------------------------------------------------------------------------------ |
| 20260504T063255Z-008-environment-preflight-ad8aa95   | full-e2e    | passed | 95288ms  | 45000ms   | -              | `logs/full-e2e.stdout.log`<br>`logs/full-e2e.stderr.log`<br>`artifacts/full-e2e-results.json`          |
| 20260504T070317Z-009-evaluation-refactor-c98569d     | integration | passed | 76087ms  | 40000ms   | -              | `logs/integration.stdout.log`<br>`logs/integration.stderr.log`<br>`artifacts/integration-results.json` |
| 20260504T130425Z-010-ci-health-trends-4a6311a        | integration | passed | 66539ms  | 40000ms   | -              | `logs/integration.stdout.log`<br>`logs/integration.stderr.log`<br>`artifacts/integration-results.json` |
| 20260504T152215Z-011-evaluation-quality-gate-ab15902 | integration | passed | 63812ms  | 40000ms   | -              | `logs/integration.stdout.log`<br>`logs/integration.stderr.log`<br>`artifacts/integration-results.json` |
| 20260504T131557Z-010-ci-health-trends-4a6311a        | integration | passed | 60276ms  | 40000ms   | -              | `logs/integration.stdout.log`<br>`logs/integration.stderr.log`<br>`artifacts/integration-results.json` |
| 20260504T063255Z-008-environment-preflight-ad8aa95   | integration | passed | 48178ms  | 40000ms   | -              | `logs/integration.stdout.log`<br>`logs/integration.stderr.log`<br>`artifacts/integration-results.json` |
| 20260504T130425Z-010-ci-health-trends-4a6311a        | smoke-e2e   | passed | 46638ms  | 30000ms   | -              | `logs/smoke-e2e.stdout.log`<br>`logs/smoke-e2e.stderr.log`<br>`artifacts/smoke-results.json`           |
| 20260504T131557Z-010-ci-health-trends-4a6311a        | smoke-e2e   | passed | 39389ms  | 30000ms   | -              | `logs/smoke-e2e.stdout.log`<br>`logs/smoke-e2e.stderr.log`<br>`artifacts/smoke-results.json`           |
| 20260504T152215Z-011-evaluation-quality-gate-ab15902 | smoke-e2e   | passed | 38890ms  | 30000ms   | -              | `logs/smoke-e2e.stdout.log`<br>`logs/smoke-e2e.stderr.log`<br>`artifacts/smoke-results.json`           |
| 20260504T070317Z-009-evaluation-refactor-c98569d     | smoke-e2e   | passed | 38611ms  | 30000ms   | -              | `logs/smoke-e2e.stdout.log`<br>`logs/smoke-e2e.stderr.log`<br>`artifacts/smoke-results.json`           |
| 20260504T063255Z-008-environment-preflight-ad8aa95   | smoke-e2e   | passed | 30218ms  | 30000ms   | -              | `logs/smoke-e2e.stdout.log`<br>`logs/smoke-e2e.stderr.log`<br>`artifacts/smoke-results.json`           |

## Slow Tests

Total slow observations: 0

| Run ID | Layer | Title | File | Project | Duration | Status | Retry | Artifact |
| ------ | ----- | ----- | ---- | ------- | -------- | ------ | ----- | -------- |
| None   | -     | -     | -    | -       | -        | -      | -     | -        |

## Instability Evidence

| Run ID                                       | Layer | Kind | Title | Status | Classification | Duration | Artifact | Messages |
| -------------------------------------------- | ----- | ---- | ----- | ------ | -------------- | -------- | -------- | -------- |
| No flaky evidence observed in selected runs. | -     | -    | -     | -      | -              | -        | -        | -        |

## Environment Evidence

| Run ID                                             | Layer | Kind | Title | Status | Classification | Duration | Artifact | Messages |
| -------------------------------------------------- | ----- | ---- | ----- | ------ | -------------- | -------- | -------- | -------- |
| No environment evidence observed in selected runs. | -     | -    | -     | -      | -              | -        | -        | -        |

## Warnings

- None

## Recommended Review Focus

- Review slow layers against configured thresholds.
