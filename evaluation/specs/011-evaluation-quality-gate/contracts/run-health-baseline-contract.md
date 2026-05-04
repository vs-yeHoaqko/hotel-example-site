# Contract: Run Health Baseline

## Inputs

- `evaluation/baselines/run-health-baseline.json`
- Selected run summaries loaded by the existing run health model.

## Outputs

- Baseline comparison data embedded in the run health model.
- Baseline comparison section in `evaluation/reports/run-health.md`.
- Quality gate findings derived from baseline regressions.

## Required Comparisons

Each configured layer comparison must include:

- layer name
- observed status and duration
- baseline status and duration
- tolerance
- comparison status
- message

## Partial Evidence Rules

- Missing observed layer: report `missing`.
- New observed layer without baseline: report `new`.
- Malformed baseline entry: warning finding and skipped comparison for that entry.
- Missing baseline file: warning finding in initial rollout, not silent pass.
