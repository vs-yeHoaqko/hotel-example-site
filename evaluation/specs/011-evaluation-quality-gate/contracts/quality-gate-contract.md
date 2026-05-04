# Contract: Quality Gate

## Command

```powershell
node evaluation\bin\generate-quality-gate.mjs
```

## Inputs

- `evaluation/config/quality-gate.config.json`
- `evaluation/reports/run-health.md`
- `evaluation/reports/test-meaningfulness.md`
- Latest readable `evaluation/runs/*/summary.json` files
- Optional `evaluation/reports/thinning-execution.md`

## Outputs

- `evaluation/reports/quality-gate.md`
- Console summary with final status and finding count.

## Result Semantics

- `pass`: No warning or failure thresholds breached.
- `warn`: At least one warning threshold breached and no fail-enforced threshold breached.
- `fail`: At least one fail-enforced threshold breached.

## Required Report Sections

- Metadata
- Final Status
- Evidence Sources
- Threshold Findings
- Baseline Findings
- Diagnostic Findings
- Thinning Findings
- Recommended Actions

## Failure Behavior

- Missing optional evidence produces a warning finding.
- Missing required configuration exits non-zero.
- Malformed configuration exits non-zero and prints the invalid path.
