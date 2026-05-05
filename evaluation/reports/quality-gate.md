# Evaluation Quality Gate Report

## Metadata

- Generated command: `node evaluation/bin/generate-quality-gate.mjs`
- Config: `evaluation/config/quality-gate.config.json`
- Report path: `evaluation/reports/quality-gate.md`
- Checked at: 2026-05-05T02:44:48.006Z

## Final Status

- Status: `warn`

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
| environmentEvidence | 2     |
| flakyEvidence       | 0     |
| keepE2E             | 4     |
| meaningfulTests     | 156   |
| totalTests          | 156   |
| weakSignalTests     | 0     |

## Required Evidence Findings

| ID                | Source  | Status | Message                                                                                                                   |
| ----------------- | ------- | ------ | ------------------------------------------------------------------------------------------------------------------------- |
| latest-summary    | summary | pass   | Latest evaluation summary is readable: evaluation/runs/20260505T024104Z-013-feature-coverage-matrix-2e9046b/summary.json. |
| environment-layer | summary | pass   | environment layer passed in latest run 20260505T024104Z-013-feature-coverage-matrix-2e9046b.                              |
| smoke-e2e-layer   | summary | pass   | smoke-e2e layer passed in latest run 20260505T024104Z-013-feature-coverage-matrix-2e9046b.                                |

## Threshold Findings

| ID                    | Source              | Status | Message                               |
| --------------------- | ------------------- | ------ | ------------------------------------- |
| weak-signal-tests     | test-meaningfulness | pass   | weakSignalTests=0 is within <= 0.     |
| total-tests           | test-meaningfulness | pass   | totalTests=156 is within >= 136.      |
| assertion-like-checks | test-meaningfulness | pass   | assertionCount=643 is within >= 572.  |
| baseline-regressions  | run-health          | pass   | baselineRegressions=0 is within <= 0. |
| baseline-missing      | run-health          | pass   | baselineMissing=0 is within <= 0.     |
| environment-evidence  | diagnostics         | warn   | environmentEvidence=2 breaches <= 0.  |
| flaky-evidence        | diagnostics         | pass   | flakyEvidence=0 is within <= 0.       |

## Baseline Findings

| ID   | Source | Status | Message |
| ---- | ------ | ------ | ------- |
| None | -      | -      | -       |

## Diagnostic Findings

| ID                                                                                                 | Category    | Confidence | Message                    | Recommended Action                                      | Artifact                                                                                    |
| -------------------------------------------------------------------------------------------------- | ----------- | ---------- | -------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| environment-20260505T005842Z-012-ci-gate-summary-and-enforcement-e46cb73-smoke-e2e-Run diagnostic  | environment | high       | smoke-e2e: Run diagnostic  | Fix environment/tooling evidence before changing tests. | `evaluation/runs/20260505T005842Z-012-ci-gate-summary-and-enforcement-e46cb73/summary.json` |
| environment-20260505T005842Z-012-ci-gate-summary-and-enforcement-e46cb73-smoke-e2e-smoke-e2e layer | environment | high       | smoke-e2e: smoke-e2e layer | Fix environment/tooling evidence before changing tests. | `evaluation/runs/20260505T005842Z-012-ci-gate-summary-and-enforcement-e46cb73/summary.json` |

## Thinning Findings

| ID   | Source | Status | Message |
| ---- | ------ | ------ | ------- |
| None | -      | -      | -       |

## Recommended Actions

- Review warning or failure findings before merging.
- Fix environment/tooling evidence before changing tests.
- Review slow layers against configured thresholds.
- Review top slow Playwright tests for lower-layer coverage or setup cost.
- environmentEvidence=2 breaches <= 0.
- smoke-e2e: Run diagnostic
- smoke-e2e: smoke-e2e layer

## Warnings

- None
