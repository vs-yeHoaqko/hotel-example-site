# Quickstart: Evaluation Quality Gate and Harness Hardening

## Local Validation

```powershell
node evaluation\bin\generate-run-health.mjs
node evaluation\bin\generate-test-meaningfulness.mjs
node evaluation\bin\generate-quality-gate.mjs
node evaluation\bin\run-evaluation.mjs --mode gate
```

## Expected Evidence

- `evaluation/reports/run-health.md` includes trend and baseline comparison.
- `evaluation/reports/test-meaningfulness.md` remains available for quality-gate thresholds.
- `evaluation/reports/quality-gate.md` shows final pass, warning, or fail status.
- `evaluation/reports/thinning-execution.md` shows reviewed E2E thinning decisions.
- `evaluation/runs/` remains ignored and uncommitted.

## CI Expectations

- Pull requests to `main` and pushes to `main` run the existing fork-scoped evaluation workflow.
- The workflow attempts report generation with always-run semantics.
- Uploaded artifacts include run evidence and all generated evaluation reports.

## Safety Check

Before implementation is considered complete, verify:

```powershell
git diff --name-only
```

The diff must not include product source, product fixtures, root package scripts, root Playwright configuration, or automatic root-suite E2E edits.
