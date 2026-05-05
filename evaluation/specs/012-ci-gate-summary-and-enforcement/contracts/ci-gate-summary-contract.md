# Contract: CI Gate Summary

## Producer

`node evaluation/bin/generate-ci-gate-summary.mjs`

## Inputs

- Latest readable evaluation run under `evaluation/runs/`
- `evaluation/reports/quality-gate.md`
- `evaluation/reports/run-health.md`
- `evaluation/reports/test-meaningfulness.md`
- `evaluation/reports/thinning-execution.md`
- Quality gate model data generated from current configuration

## Output

`evaluation/reports/ci-gate-summary.md`

## Required Sections

1. `# Evaluation Gate Summary`
2. `## Result`
   - status
   - mode
   - target
   - run id when available
3. `## Primary Issue`
   - one concise issue, or `None`
   - recommended next action
4. `## Evidence`
   - repository-relative paths to available reports
   - missing report/evidence notes when applicable

## Behavior

- The command exits successfully when it can produce a partial summary.
- The command exits non-zero only when summary generation itself cannot run.
- The workflow appends this Markdown to the GitHub Actions step summary when
  `GITHUB_STEP_SUMMARY` is available.
