# Evaluation Quality Gate Report

## Metadata

- Generated command: `node evaluation/bin/generate-quality-gate.mjs`
- Config: `evaluation/config/quality-gate.config.json`
- Report path: `evaluation/reports/quality-gate.md`
- Checked at: 2026-05-08T08:34:01.233Z

## Final Status

- Status: `pass`

## Evidence Sources

- `evaluation/reports/run-health.md`
- `evaluation/reports/test-meaningfulness.md`
- `evaluation/reports/migration-candidates.md`
- `evaluation/reports/thinning-execution.md`

## Metrics

| Metric              | Value |
| ------------------- | ----- |
| approvedToThin      | 28    |
| assertionCount      | 643   |
| baselineMissing     | 0     |
| baselineNew         | 0     |
| baselineRegressions | 0     |
| blockedThinning     | 0     |
| deferredThinning    | 0     |
| environmentEvidence | 0     |
| flakyEvidence       | 0     |
| keepE2E             | 4     |
| meaningfulTests     | 156   |
| totalTests          | 156   |
| weakSignalTests     | 0     |

## Required Evidence Findings

| ID                | Source  | Status | Message                                                                                                                   |
| ----------------- | ------- | ------ | ------------------------------------------------------------------------------------------------------------------------- |
| latest-summary    | summary | pass   | Latest evaluation summary is readable: evaluation/runs/20260508T083122Z-013-feature-coverage-matrix-5a913ae/summary.json. |
| environment-layer | summary | pass   | environment layer passed in latest run 20260508T083122Z-013-feature-coverage-matrix-5a913ae.                              |
| smoke-e2e-layer   | summary | pass   | smoke-e2e layer passed in latest run 20260508T083122Z-013-feature-coverage-matrix-5a913ae.                                |

## Threshold Findings

| ID                    | Source              | Status | Message                               |
| --------------------- | ------------------- | ------ | ------------------------------------- |
| weak-signal-tests     | test-meaningfulness | pass   | weakSignalTests=0 is within <= 0.     |
| total-tests           | test-meaningfulness | pass   | totalTests=156 is within >= 136.      |
| assertion-like-checks | test-meaningfulness | pass   | assertionCount=643 is within >= 572.  |
| baseline-regressions  | run-health          | pass   | baselineRegressions=0 is within <= 0. |
| baseline-missing      | run-health          | pass   | baselineMissing=0 is within <= 0.     |
| environment-evidence  | diagnostics         | pass   | environmentEvidence=0 is within <= 0. |
| flaky-evidence        | diagnostics         | pass   | flakyEvidence=0 is within <= 0.       |

## Baseline Findings

| ID   | Source | Status | Message |
| ---- | ------ | ------ | ------- |
| None | -      | -      | -       |

## Diagnostic Findings

| ID                                                                                       | Category | Confidence | Message                        | Recommended Action                                   | Artifact                                                                            |
| ---------------------------------------------------------------------------------------- | -------- | ---------- | ------------------------------ | ---------------------------------------------------- | ----------------------------------------------------------------------------------- |
| flaky-20260508T074623Z-013-feature-coverage-matrix-dcef17d-integration-integration layer | unknown  | low        | integration: integration layer | Inspect failure evidence before assigning ownership. | `evaluation/runs/20260508T074623Z-013-feature-coverage-matrix-dcef17d/summary.json` |

## Thinning Findings

| ID   | Source | Status | Message |
| ---- | ------ | ------ | ------- |
| None | -      | -      | -       |

## Recommended Actions

- No quality-gate follow-up is required.
- Review unstable product/test evidence before timeout changes.
- Review slow layers against configured thresholds.
- Review top slow Playwright tests for lower-layer coverage or setup cost.
- Resolve unreadable artifacts if the missing evidence affects a decision.

## Warnings

- evaluation/runs/20260508T074623Z-013-feature-coverage-matrix-dcef17d/artifacts/integration-results.json: missing
