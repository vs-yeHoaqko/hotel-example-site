# Contract: Run Health Trends

## Producer

`node evaluation/bin/generate-run-health.mjs`

## Output

`evaluation/reports/run-health.md`

## Required Sections

- `Trend Summary`
- `Selected Runs`
- `Preflight Evidence`
- `Slow Layers`
- `Slow Tests`
- `Instability Evidence`
- `Environment Evidence`
- `Warnings`
- `Recommended Review Focus`

## Trend Summary Requirements

- Shows selected run count.
- Shows status counts for selected runs.
- Shows a per-layer trend table with latest run, latest status, latest duration, previous duration, delta, observation count, slow count, and failed count.
- Shows an explicit limited-evidence message when fewer than two runs are selected.
