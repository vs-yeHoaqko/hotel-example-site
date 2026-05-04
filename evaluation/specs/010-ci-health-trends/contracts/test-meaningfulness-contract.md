# Contract: Test Meaningfulness Report

## Producer

`node evaluation/bin/generate-test-meaningfulness.mjs`

## Output

`evaluation/reports/test-meaningfulness.md`

## Required Sections

- `Summary`
- `By Layer`
- `By Source`
- `By Category`
- `Weak Signals`
- `Files`
- `Interpretation`

## Summary Requirements

- Reports total discovered tests.
- Reports meaningful tests.
- Reports weak-signal tests.
- Reports total assertion-like checks.

## Classification Requirements

- Keeps root E2E tests separate from evaluation-created tests.
- Keeps product behavior checks separate from harness contract checks.
- Flags tests with no assertion-like checks.
