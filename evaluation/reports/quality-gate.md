# Evaluation Quality Gate Report

## Metadata

- Generated command: `node evaluation/bin/generate-quality-gate.mjs`
- Config: `evaluation/config/quality-gate.config.json`
- Report path: `evaluation/reports/quality-gate.md`
- Checked at: 2026-05-04T15:24:22.642Z

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
| assertionCount      | 598   |
| baselineMissing     | 0     |
| baselineNew         | 0     |
| baselineRegressions | 0     |
| blockedThinning     | 0     |
| deferredThinning    | 0     |
| environmentEvidence | 0     |
| flakyEvidence       | 0     |
| keepE2E             | 4     |
| meaningfulTests     | 144   |
| totalTests          | 144   |
| weakSignalTests     | 0     |

## Threshold Findings

| ID                    | Source              | Status | Message                               |
| --------------------- | ------------------- | ------ | ------------------------------------- |
| weak-signal-tests     | test-meaningfulness | pass   | weakSignalTests=0 is within <= 0.     |
| total-tests           | test-meaningfulness | pass   | totalTests=144 is within >= 136.      |
| assertion-like-checks | test-meaningfulness | pass   | assertionCount=598 is within >= 572.  |
| baseline-regressions  | run-health          | pass   | baselineRegressions=0 is within <= 0. |
| baseline-missing      | run-health          | pass   | baselineMissing=0 is within <= 0.     |
| environment-evidence  | diagnostics         | pass   | environmentEvidence=0 is within <= 0. |
| flaky-evidence        | diagnostics         | pass   | flakyEvidence=0 is within <= 0.       |

## Baseline Findings

| ID   | Source | Status | Message |
| ---- | ------ | ------ | ------- |
| None | -      | -      | -       |

## Diagnostic Findings

| ID   | Category | Confidence | Message | Recommended Action | Artifact |
| ---- | -------- | ---------- | ------- | ------------------ | -------- |
| None | -        | -          | -       | -                  | -        |

## Thinning Findings

| ID   | Source | Status | Message |
| ---- | ------ | ------ | ------- |
| None | -      | -      | -       |

## Recommended Actions

- No quality-gate follow-up is required.
- Review slow layers against configured thresholds.

## Warnings

- None
