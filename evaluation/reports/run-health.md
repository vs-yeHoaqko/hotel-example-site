# Run Health Report

## Metadata

- Generated command: `node evaluation/bin/generate-run-health.mjs`
- Config: `evaluation/config/run-health.config.json`
- Runs directory: `evaluation/runs`
- Report path: `evaluation/reports/run-health.md`
- Selected runs: `20260504T063255Z-008-environment-preflight-ad8aa95`, `20260504T063129Z-008-environment-preflight-ad8aa95`, `20260504T062735Z-008-environment-preflight-ad8aa95`, `20260504T062324Z-008-environment-preflight-ad8aa95`, `20260504T061842Z-008-environment-preflight-ad8aa95`
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

| Run ID                                             | Mode | Target | Status | Started                  | Finished                 | Dirty | Summary                                                                           |
| -------------------------------------------------- | ---- | ------ | ------ | ------------------------ | ------------------------ | ----- | --------------------------------------------------------------------------------- |
| 20260504T063255Z-008-environment-preflight-ad8aa95 | full | local  | passed | 2026-05-04T06:32:55.737Z | 2026-05-04T06:35:53.013Z | yes   | `evaluation/runs/20260504T063255Z-008-environment-preflight-ad8aa95/summary.json` |
| 20260504T063129Z-008-environment-preflight-ad8aa95 | gate | local  | passed | 2026-05-04T06:31:29.148Z | 2026-05-04T06:32:45.938Z | yes   | `evaluation/runs/20260504T063129Z-008-environment-preflight-ad8aa95/summary.json` |
| 20260504T062735Z-008-environment-preflight-ad8aa95 | gate | local  | failed | 2026-05-04T06:27:35.613Z | 2026-05-04T06:29:55.080Z | yes   | `evaluation/runs/20260504T062735Z-008-environment-preflight-ad8aa95/summary.json` |
| 20260504T062324Z-008-environment-preflight-ad8aa95 | full | local  | passed | 2026-05-04T06:23:24.610Z | 2026-05-04T06:26:26.558Z | yes   | `evaluation/runs/20260504T062324Z-008-environment-preflight-ad8aa95/summary.json` |
| 20260504T061842Z-008-environment-preflight-ad8aa95 | full | local  | failed | 2026-05-04T06:18:42.998Z | 2026-05-04T06:21:12.349Z | yes   | `evaluation/runs/20260504T061842Z-008-environment-preflight-ad8aa95/summary.json` |

## Preflight Evidence

| Run ID                                             | Layer       | Kind      | Title                      | Status | Classification | Duration | Artifact                                                                                                  | Messages                                               |
| -------------------------------------------------- | ----------- | --------- | -------------------------- | ------ | -------------- | -------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| 20260504T061842Z-008-environment-preflight-ad8aa95 | environment | preflight | Playwright browser runtime | passed | -              | -        | `evaluation/runs/20260504T061842Z-008-environment-preflight-ad8aa95/artifacts/environment-preflight.json` | Chromium executable is available.; No action required. |
| 20260504T061842Z-008-environment-preflight-ad8aa95 | environment | preflight | Playwright CLI             | passed | -              | -        | `evaluation/runs/20260504T061842Z-008-environment-preflight-ad8aa95/artifacts/environment-preflight.json` | Playwright CLI is available.; No action required.      |
| 20260504T061842Z-008-environment-preflight-ad8aa95 | environment | preflight | Prettier CLI               | passed | -              | -        | `evaluation/runs/20260504T061842Z-008-environment-preflight-ad8aa95/artifacts/environment-preflight.json` | Prettier CLI is available.; No action required.        |
| 20260504T061842Z-008-environment-preflight-ad8aa95 | environment | preflight | Subprocess spawn           | passed | -              | -        | `evaluation/runs/20260504T061842Z-008-environment-preflight-ad8aa95/artifacts/environment-preflight.json` | Subprocess spawn is available.; No action required.    |
| 20260504T061842Z-008-environment-preflight-ad8aa95 | environment | preflight | Webpack CLI                | passed | -              | -        | `evaluation/runs/20260504T061842Z-008-environment-preflight-ad8aa95/artifacts/environment-preflight.json` | Webpack CLI is available.; No action required.         |
| 20260504T062324Z-008-environment-preflight-ad8aa95 | environment | preflight | Playwright browser runtime | passed | -              | -        | `evaluation/runs/20260504T062324Z-008-environment-preflight-ad8aa95/artifacts/environment-preflight.json` | Chromium executable is available.; No action required. |
| 20260504T062324Z-008-environment-preflight-ad8aa95 | environment | preflight | Playwright CLI             | passed | -              | -        | `evaluation/runs/20260504T062324Z-008-environment-preflight-ad8aa95/artifacts/environment-preflight.json` | Playwright CLI is available.; No action required.      |
| 20260504T062324Z-008-environment-preflight-ad8aa95 | environment | preflight | Prettier CLI               | passed | -              | -        | `evaluation/runs/20260504T062324Z-008-environment-preflight-ad8aa95/artifacts/environment-preflight.json` | Prettier CLI is available.; No action required.        |
| 20260504T062324Z-008-environment-preflight-ad8aa95 | environment | preflight | Subprocess spawn           | passed | -              | -        | `evaluation/runs/20260504T062324Z-008-environment-preflight-ad8aa95/artifacts/environment-preflight.json` | Subprocess spawn is available.; No action required.    |
| 20260504T062324Z-008-environment-preflight-ad8aa95 | environment | preflight | Webpack CLI                | passed | -              | -        | `evaluation/runs/20260504T062324Z-008-environment-preflight-ad8aa95/artifacts/environment-preflight.json` | Webpack CLI is available.; No action required.         |
| 20260504T062735Z-008-environment-preflight-ad8aa95 | environment | preflight | Playwright browser runtime | passed | -              | -        | `evaluation/runs/20260504T062735Z-008-environment-preflight-ad8aa95/artifacts/environment-preflight.json` | Chromium executable is available.; No action required. |
| 20260504T062735Z-008-environment-preflight-ad8aa95 | environment | preflight | Playwright CLI             | passed | -              | -        | `evaluation/runs/20260504T062735Z-008-environment-preflight-ad8aa95/artifacts/environment-preflight.json` | Playwright CLI is available.; No action required.      |
| 20260504T062735Z-008-environment-preflight-ad8aa95 | environment | preflight | Prettier CLI               | passed | -              | -        | `evaluation/runs/20260504T062735Z-008-environment-preflight-ad8aa95/artifacts/environment-preflight.json` | Prettier CLI is available.; No action required.        |
| 20260504T062735Z-008-environment-preflight-ad8aa95 | environment | preflight | Subprocess spawn           | passed | -              | -        | `evaluation/runs/20260504T062735Z-008-environment-preflight-ad8aa95/artifacts/environment-preflight.json` | Subprocess spawn is available.; No action required.    |
| 20260504T062735Z-008-environment-preflight-ad8aa95 | environment | preflight | Webpack CLI                | passed | -              | -        | `evaluation/runs/20260504T062735Z-008-environment-preflight-ad8aa95/artifacts/environment-preflight.json` | Webpack CLI is available.; No action required.         |
| 20260504T063129Z-008-environment-preflight-ad8aa95 | environment | preflight | Playwright browser runtime | passed | -              | -        | `evaluation/runs/20260504T063129Z-008-environment-preflight-ad8aa95/artifacts/environment-preflight.json` | Chromium executable is available.; No action required. |
| 20260504T063129Z-008-environment-preflight-ad8aa95 | environment | preflight | Playwright CLI             | passed | -              | -        | `evaluation/runs/20260504T063129Z-008-environment-preflight-ad8aa95/artifacts/environment-preflight.json` | Playwright CLI is available.; No action required.      |
| 20260504T063129Z-008-environment-preflight-ad8aa95 | environment | preflight | Prettier CLI               | passed | -              | -        | `evaluation/runs/20260504T063129Z-008-environment-preflight-ad8aa95/artifacts/environment-preflight.json` | Prettier CLI is available.; No action required.        |
| 20260504T063129Z-008-environment-preflight-ad8aa95 | environment | preflight | Subprocess spawn           | passed | -              | -        | `evaluation/runs/20260504T063129Z-008-environment-preflight-ad8aa95/artifacts/environment-preflight.json` | Subprocess spawn is available.; No action required.    |
| 20260504T063129Z-008-environment-preflight-ad8aa95 | environment | preflight | Webpack CLI                | passed | -              | -        | `evaluation/runs/20260504T063129Z-008-environment-preflight-ad8aa95/artifacts/environment-preflight.json` | Webpack CLI is available.; No action required.         |
| 20260504T063255Z-008-environment-preflight-ad8aa95 | environment | preflight | Playwright browser runtime | passed | -              | -        | `evaluation/runs/20260504T063255Z-008-environment-preflight-ad8aa95/artifacts/environment-preflight.json` | Chromium executable is available.; No action required. |
| 20260504T063255Z-008-environment-preflight-ad8aa95 | environment | preflight | Playwright CLI             | passed | -              | -        | `evaluation/runs/20260504T063255Z-008-environment-preflight-ad8aa95/artifacts/environment-preflight.json` | Playwright CLI is available.; No action required.      |
| 20260504T063255Z-008-environment-preflight-ad8aa95 | environment | preflight | Prettier CLI               | passed | -              | -        | `evaluation/runs/20260504T063255Z-008-environment-preflight-ad8aa95/artifacts/environment-preflight.json` | Prettier CLI is available.; No action required.        |
| 20260504T063255Z-008-environment-preflight-ad8aa95 | environment | preflight | Subprocess spawn           | passed | -              | -        | `evaluation/runs/20260504T063255Z-008-environment-preflight-ad8aa95/artifacts/environment-preflight.json` | Subprocess spawn is available.; No action required.    |
| 20260504T063255Z-008-environment-preflight-ad8aa95 | environment | preflight | Webpack CLI                | passed | -              | -        | `evaluation/runs/20260504T063255Z-008-environment-preflight-ad8aa95/artifacts/environment-preflight.json` | Webpack CLI is available.; No action required.         |

## Slow Layers

| Run ID                                             | Layer       | Status | Duration | Threshold | Classification | Artifacts                                                                                              |
| -------------------------------------------------- | ----------- | ------ | -------- | --------- | -------------- | ------------------------------------------------------------------------------------------------------ |
| 20260504T062324Z-008-environment-preflight-ad8aa95 | full-e2e    | passed | 106291ms | 45000ms   | -              | `logs/full-e2e.stdout.log`<br>`logs/full-e2e.stderr.log`<br>`artifacts/full-e2e-results.json`          |
| 20260504T063255Z-008-environment-preflight-ad8aa95 | full-e2e    | passed | 95288ms  | 45000ms   | -              | `logs/full-e2e.stdout.log`<br>`logs/full-e2e.stderr.log`<br>`artifacts/full-e2e-results.json`          |
| 20260504T062735Z-008-environment-preflight-ad8aa95 | smoke-e2e   | failed | 92610ms  | 30000ms   | timeout        | `logs/smoke-e2e.stdout.log`<br>`logs/smoke-e2e.stderr.log`<br>`artifacts/smoke-results.json`           |
| 20260504T061842Z-008-environment-preflight-ad8aa95 | full-e2e    | failed | 65018ms  | 45000ms   | timeout        | `logs/full-e2e.stdout.log`<br>`logs/full-e2e.stderr.log`<br>`artifacts/full-e2e-results.json`          |
| 20260504T061842Z-008-environment-preflight-ad8aa95 | integration | passed | 52033ms  | 40000ms   | -              | `logs/integration.stdout.log`<br>`logs/integration.stderr.log`<br>`artifacts/integration-results.json` |
| 20260504T063255Z-008-environment-preflight-ad8aa95 | integration | passed | 48178ms  | 40000ms   | -              | `logs/integration.stdout.log`<br>`logs/integration.stderr.log`<br>`artifacts/integration-results.json` |
| 20260504T062735Z-008-environment-preflight-ad8aa95 | integration | passed | 43646ms  | 40000ms   | -              | `logs/integration.stdout.log`<br>`logs/integration.stderr.log`<br>`artifacts/integration-results.json` |
| 20260504T062324Z-008-environment-preflight-ad8aa95 | integration | passed | 42634ms  | 40000ms   | -              | `logs/integration.stdout.log`<br>`logs/integration.stderr.log`<br>`artifacts/integration-results.json` |
| 20260504T063129Z-008-environment-preflight-ad8aa95 | integration | passed | 41074ms  | 40000ms   | -              | `logs/integration.stdout.log`<br>`logs/integration.stderr.log`<br>`artifacts/integration-results.json` |
| 20260504T063129Z-008-environment-preflight-ad8aa95 | smoke-e2e   | passed | 32962ms  | 30000ms   | -              | `logs/smoke-e2e.stdout.log`<br>`logs/smoke-e2e.stderr.log`<br>`artifacts/smoke-results.json`           |
| 20260504T063255Z-008-environment-preflight-ad8aa95 | smoke-e2e   | passed | 30218ms  | 30000ms   | -              | `logs/smoke-e2e.stdout.log`<br>`logs/smoke-e2e.stderr.log`<br>`artifacts/smoke-results.json`           |

## Slow Tests

Total slow observations: 15

| Run ID                                             | Layer     | Title                                                                                                          | File                      | Project  | Duration | Status   | Retry | Artifact                                                                                             |
| -------------------------------------------------- | --------- | -------------------------------------------------------------------------------------------------------------- | ------------------------- | -------- | -------- | -------- | ----- | ---------------------------------------------------------------------------------------------------- |
| 20260504T062735Z-008-environment-preflight-ad8aa95 | smoke-e2e | smoke.spec.mjs > smoke completes one en-US reservation happy path                                              | smoke.spec.mjs:35         | chromium | 62405ms  | timedOut | 0     | `evaluation/runs/20260504T062735Z-008-environment-preflight-ad8aa95/artifacts/smoke-results.json`    |
| 20260504T061842Z-008-environment-preflight-ad8aa95 | full-e2e  | en-US\reserve.spec.ts > Reservation > It should be successful the reservation [not logged in] [initial values] | en-US/reserve.spec.ts:315 | chromium | 30038ms  | timedOut | 0     | `evaluation/runs/20260504T061842Z-008-environment-preflight-ad8aa95/artifacts/full-e2e-results.json` |
| 20260504T063129Z-008-environment-preflight-ad8aa95 | smoke-e2e | smoke.spec.mjs > smoke route opens the en-US reservation entry point                                           | smoke.spec.mjs:19         | chromium | 4044ms   | passed   | 0     | `evaluation/runs/20260504T063129Z-008-environment-preflight-ad8aa95/artifacts/smoke-results.json`    |
| 20260504T061842Z-008-environment-preflight-ad8aa95 | full-e2e  | en-US\reserve.spec.ts > Reservation > It should be successful the reservation [logged in]                      | en-US/reserve.spec.ts:380 | chromium | 3815ms   | passed   | 0     | `evaluation/runs/20260504T061842Z-008-environment-preflight-ad8aa95/artifacts/full-e2e-results.json` |
| 20260504T061842Z-008-environment-preflight-ad8aa95 | full-e2e  | en-US\login.spec.ts > Login > It should be an error when invalid user                                          | en-US/login.spec.ts:35    | chromium | 3793ms   | passed   | 0     | `evaluation/runs/20260504T061842Z-008-environment-preflight-ad8aa95/artifacts/full-e2e-results.json` |
| 20260504T061842Z-008-environment-preflight-ad8aa95 | full-e2e  | en-US\mypage.spec.ts > MyPage > New User > It should be display new user                                       | en-US/mypage.spec.ts:111  | chromium | 3760ms   | passed   | 0     | `evaluation/runs/20260504T061842Z-008-environment-preflight-ad8aa95/artifacts/full-e2e-results.json` |
| 20260504T061842Z-008-environment-preflight-ad8aa95 | full-e2e  | en-US\mypage.spec.ts > MyPage > Preset Users > It should be display preset user [ororo]                        | en-US/mypage.spec.ts:49   | chromium | 3627ms   | passed   | 0     | `evaluation/runs/20260504T061842Z-008-environment-preflight-ad8aa95/artifacts/full-e2e-results.json` |
| 20260504T061842Z-008-environment-preflight-ad8aa95 | full-e2e  | ja\reserve.spec.ts > 宿泊予約 > 宿泊予約が完了すること\_ログイン                                               | ja/reserve.spec.ts:367    | chromium | 3538ms   | passed   | 0     | `evaluation/runs/20260504T061842Z-008-environment-preflight-ad8aa95/artifacts/full-e2e-results.json` |
| 20260504T061842Z-008-environment-preflight-ad8aa95 | full-e2e  | en-US\mypage.spec.ts > MyPage > Preset Users > It should be display preset user [clark]                        | en-US/mypage.spec.ts:15   | chromium | 3469ms   | passed   | 0     | `evaluation/runs/20260504T061842Z-008-environment-preflight-ad8aa95/artifacts/full-e2e-results.json` |
| 20260504T061842Z-008-environment-preflight-ad8aa95 | full-e2e  | en-US\login.spec.ts > Login > It should be an error when empty input                                           | en-US/login.spec.ts:22    | chromium | 3398ms   | passed   | 0     | `evaluation/runs/20260504T061842Z-008-environment-preflight-ad8aa95/artifacts/full-e2e-results.json` |

## Instability Evidence

| Run ID                                             | Layer     | Kind  | Title                                                                                                          | Status   | Classification | Duration | Artifact                                                                                             | Messages                                  |
| -------------------------------------------------- | --------- | ----- | -------------------------------------------------------------------------------------------------------------- | -------- | -------------- | -------- | ---------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| 20260504T061842Z-008-environment-preflight-ad8aa95 | full-e2e  | test  | en-US\reserve.spec.ts > Reservation > It should be successful the reservation [not logged in] [initial values] | timedOut | timeout        | 30038ms  | `evaluation/runs/20260504T061842Z-008-environment-preflight-ad8aa95/artifacts/full-e2e-results.json` | [31mTest timeout of 30000ms exceeded.[39m |
| 20260504T061842Z-008-environment-preflight-ad8aa95 | full-e2e  | layer | full-e2e layer                                                                                                 | failed   | timeout        | 65018ms  | `evaluation/runs/20260504T061842Z-008-environment-preflight-ad8aa95/summary.json`                    | -                                         |
| 20260504T062735Z-008-environment-preflight-ad8aa95 | smoke-e2e | layer | smoke-e2e layer                                                                                                | failed   | timeout        | 92610ms  | `evaluation/runs/20260504T062735Z-008-environment-preflight-ad8aa95/summary.json`                    | -                                         |
| 20260504T062735Z-008-environment-preflight-ad8aa95 | smoke-e2e | test  | smoke.spec.mjs > smoke completes one en-US reservation happy path                                              | timedOut | timeout        | 62405ms  | `evaluation/runs/20260504T062735Z-008-environment-preflight-ad8aa95/artifacts/smoke-results.json`    | [31mTest timeout of 60000ms exceeded.[39m |

## Environment Evidence

| Run ID                                             | Layer | Kind | Title | Status | Classification | Duration | Artifact | Messages |
| -------------------------------------------------- | ----- | ---- | ----- | ------ | -------------- | -------- | -------- | -------- |
| No environment evidence observed in selected runs. | -     | -    | -     | -      | -              | -        | -        | -        |

## Warnings

- None

## Recommended Review Focus

- Review unstable product/test evidence before timeout changes.
- Review slow layers against configured thresholds.
- Review top slow Playwright tests for lower-layer coverage or setup cost.
