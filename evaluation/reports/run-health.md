# Run Health Report

## Metadata

- Generated command: `node evaluation/bin/generate-run-health.mjs`
- Config: `evaluation/config/run-health.config.json`
- Runs directory: `evaluation/runs`
- Report path: `evaluation/reports/run-health.md`
- Selected runs: `20260504T054926Z-007-slow-flaky-evidence-f7760fe`, `20260504T054809Z-007-slow-flaky-evidence-f7760fe`, `20260504T051530Z-006-e2e-thinning-a45d9f5`, `20260504T051359Z-006-e2e-thinning-a45d9f5`, `20260504T050838Z-006-e2e-thinning-a45d9f5`
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

| Run ID                                           | Mode | Target | Status | Started                  | Finished                 | Dirty | Summary                                                                         |
| ------------------------------------------------ | ---- | ------ | ------ | ------------------------ | ------------------------ | ----- | ------------------------------------------------------------------------------- |
| 20260504T054926Z-007-slow-flaky-evidence-f7760fe | full | local  | passed | 2026-05-04T05:49:26.979Z | 2026-05-04T05:51:22.139Z | yes   | `evaluation/runs/20260504T054926Z-007-slow-flaky-evidence-f7760fe/summary.json` |
| 20260504T054809Z-007-slow-flaky-evidence-f7760fe | gate | local  | passed | 2026-05-04T05:48:09.364Z | 2026-05-04T05:49:18.683Z | yes   | `evaluation/runs/20260504T054809Z-007-slow-flaky-evidence-f7760fe/summary.json` |
| 20260504T051530Z-006-e2e-thinning-a45d9f5        | full | local  | passed | 2026-05-04T05:15:30.640Z | 2026-05-04T05:17:35.083Z | yes   | `evaluation/runs/20260504T051530Z-006-e2e-thinning-a45d9f5/summary.json`        |
| 20260504T051359Z-006-e2e-thinning-a45d9f5        | gate | local  | passed | 2026-05-04T05:13:59.710Z | 2026-05-04T05:15:18.271Z | yes   | `evaluation/runs/20260504T051359Z-006-e2e-thinning-a45d9f5/summary.json`        |
| 20260504T050838Z-006-e2e-thinning-a45d9f5        | full | local  | passed | 2026-05-04T05:08:38.428Z | 2026-05-04T05:10:52.017Z | yes   | `evaluation/runs/20260504T050838Z-006-e2e-thinning-a45d9f5/summary.json`        |

## Slow Layers

| Run ID                                           | Layer       | Status | Duration | Threshold | Classification | Artifacts                                                                                              |
| ------------------------------------------------ | ----------- | ------ | -------- | --------- | -------------- | ------------------------------------------------------------------------------------------------------ |
| 20260504T050838Z-006-e2e-thinning-a45d9f5        | full-e2e    | passed | 52832ms  | 45000ms   | -              | `logs/full-e2e.stdout.log`<br>`logs/full-e2e.stderr.log`<br>`artifacts/full-e2e-results.json`          |
| 20260504T051359Z-006-e2e-thinning-a45d9f5        | integration | passed | 48242ms  | 40000ms   | -              | `logs/integration.stdout.log`<br>`logs/integration.stderr.log`<br>`artifacts/integration-results.json` |
| 20260504T051530Z-006-e2e-thinning-a45d9f5        | full-e2e    | passed | 46000ms  | 45000ms   | -              | `logs/full-e2e.stdout.log`<br>`logs/full-e2e.stderr.log`<br>`artifacts/full-e2e-results.json`          |
| 20260504T050838Z-006-e2e-thinning-a45d9f5        | integration | passed | 45762ms  | 40000ms   | -              | `logs/integration.stdout.log`<br>`logs/integration.stderr.log`<br>`artifacts/integration-results.json` |
| 20260504T051530Z-006-e2e-thinning-a45d9f5        | integration | passed | 44076ms  | 40000ms   | -              | `logs/integration.stdout.log`<br>`logs/integration.stderr.log`<br>`artifacts/integration-results.json` |
| 20260504T054926Z-007-slow-flaky-evidence-f7760fe | integration | passed | 42836ms  | 40000ms   | -              | `logs/integration.stdout.log`<br>`logs/integration.stderr.log`<br>`artifacts/integration-results.json` |
| 20260504T054809Z-007-slow-flaky-evidence-f7760fe | integration | passed | 40284ms  | 40000ms   | -              | `logs/integration.stdout.log`<br>`logs/integration.stderr.log`<br>`artifacts/integration-results.json` |
| 20260504T050838Z-006-e2e-thinning-a45d9f5        | smoke-e2e   | passed | 32276ms  | 30000ms   | -              | `logs/smoke-e2e.stdout.log`<br>`logs/smoke-e2e.stderr.log`<br>`artifacts/smoke-results.json`           |
| 20260504T051530Z-006-e2e-thinning-a45d9f5        | smoke-e2e   | passed | 31821ms  | 30000ms   | -              | `logs/smoke-e2e.stdout.log`<br>`logs/smoke-e2e.stderr.log`<br>`artifacts/smoke-results.json`           |

## Slow Tests

Total slow observations: 29

| Run ID                                           | Layer     | Title                                                                                                                     | File                         | Project  | Duration | Status | Retry | Artifact                                                                                           |
| ------------------------------------------------ | --------- | ------------------------------------------------------------------------------------------------------------------------- | ---------------------------- | -------- | -------- | ------ | ----- | -------------------------------------------------------------------------------------------------- |
| 20260504T050838Z-006-e2e-thinning-a45d9f5        | full-e2e  | en-US\redirection.spec.ts > Redirection > It should redirect Reserve to Top when normal user access premium member's plan | en-US/redirection.spec.ts:78 | chromium | 6697ms   | passed | 0     | `evaluation/runs/20260504T050838Z-006-e2e-thinning-a45d9f5/artifacts/full-e2e-results.json`        |
| 20260504T050838Z-006-e2e-thinning-a45d9f5        | full-e2e  | en-US\reserve.spec.ts > Reservation > It should be successful the reservation [logged in]                                 | en-US/reserve.spec.ts:380    | chromium | 4950ms   | passed | 0     | `evaluation/runs/20260504T050838Z-006-e2e-thinning-a45d9f5/artifacts/full-e2e-results.json`        |
| 20260504T050838Z-006-e2e-thinning-a45d9f5        | smoke-e2e | smoke.spec.mjs > smoke route opens the en-US reservation entry point                                                      | smoke.spec.mjs:19            | chromium | 4500ms   | passed | 0     | `evaluation/runs/20260504T050838Z-006-e2e-thinning-a45d9f5/artifacts/smoke-results.json`           |
| 20260504T051530Z-006-e2e-thinning-a45d9f5        | full-e2e  | ja\reserve.spec.ts > 宿泊予約 > 宿泊予約が完了すること\_ログイン                                                          | ja/reserve.spec.ts:367       | chromium | 4284ms   | passed | 0     | `evaluation/runs/20260504T051530Z-006-e2e-thinning-a45d9f5/artifacts/full-e2e-results.json`        |
| 20260504T050838Z-006-e2e-thinning-a45d9f5        | full-e2e  | en-US\mypage.spec.ts > MyPage > New User > It should be display icon image                                                | en-US/mypage.spec.ts:154     | chromium | 3990ms   | passed | 0     | `evaluation/runs/20260504T050838Z-006-e2e-thinning-a45d9f5/artifacts/full-e2e-results.json`        |
| 20260504T050838Z-006-e2e-thinning-a45d9f5        | full-e2e  | en-US\signup.spec.ts > Sign up > It should be an error when email has already been taken                                  | en-US/signup.spec.ts:92      | chromium | 3828ms   | passed | 0     | `evaluation/runs/20260504T050838Z-006-e2e-thinning-a45d9f5/artifacts/full-e2e-results.json`        |
| 20260504T050838Z-006-e2e-thinning-a45d9f5        | full-e2e  | ja\reserve.spec.ts > 宿泊予約 > 宿泊予約が完了すること\_ログイン                                                          | ja/reserve.spec.ts:367       | chromium | 3698ms   | passed | 0     | `evaluation/runs/20260504T050838Z-006-e2e-thinning-a45d9f5/artifacts/full-e2e-results.json`        |
| 20260504T051530Z-006-e2e-thinning-a45d9f5        | full-e2e  | en-US\reserve.spec.ts > Reservation > It should be successful the reservation [logged in]                                 | en-US/reserve.spec.ts:380    | chromium | 3686ms   | passed | 0     | `evaluation/runs/20260504T051530Z-006-e2e-thinning-a45d9f5/artifacts/full-e2e-results.json`        |
| 20260504T054926Z-007-slow-flaky-evidence-f7760fe | full-e2e  | en-US\mypage.spec.ts > MyPage > Preset Users > It should be display preset user [clark]                                   | en-US/mypage.spec.ts:15      | chromium | 3532ms   | passed | 0     | `evaluation/runs/20260504T054926Z-007-slow-flaky-evidence-f7760fe/artifacts/full-e2e-results.json` |
| 20260504T054926Z-007-slow-flaky-evidence-f7760fe | full-e2e  | en-US\mypage.spec.ts > MyPage > Preset Users > It should be display preset user [diana]                                   | en-US/mypage.spec.ts:33      | chromium | 3497ms   | passed | 0     | `evaluation/runs/20260504T054926Z-007-slow-flaky-evidence-f7760fe/artifacts/full-e2e-results.json` |

## Instability Evidence

| Run ID                                       | Layer | Kind | Title | Status | Classification | Duration | Artifact | Messages |
| -------------------------------------------- | ----- | ---- | ----- | ------ | -------------- | -------- | -------- | -------- |
| No flaky evidence observed in selected runs. | -     | -    | -     | -      | -              | -        | -        | -        |

## Environment Evidence

| Run ID | Layer | Kind | Title | Status | Classification | Duration | Artifact | Messages |
| ------ | ----- | ---- | ----- | ------ | -------------- | -------- | -------- | -------- |
| None   | -     | -    | -     | -      | -              | -        | -        | -        |

## Warnings

- None

## Recommended Review Focus

- Review slow layers against configured thresholds.
- Review top slow Playwright tests for lower-layer coverage or setup cost.
