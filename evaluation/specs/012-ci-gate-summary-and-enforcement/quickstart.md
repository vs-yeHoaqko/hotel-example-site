# Quickstart: CI Gate Summary and Enforcement

## Generate The Standard Evidence

```powershell
node evaluation/bin/run-evaluation.mjs --mode gate
node evaluation/bin/generate-migration-candidates.mjs
node evaluation/bin/generate-run-health.mjs
node evaluation/bin/generate-test-meaningfulness.mjs
node evaluation/bin/generate-quality-gate.mjs
```

## Generate The CI Summary

```powershell
node evaluation/bin/generate-ci-gate-summary.mjs
```

Expected output:

```text
evaluation/reports/ci-gate-summary.md
```

`evaluation/reports/ci-gate-summary.md` is committed review guidance.
Per-run evidence remains under ignored `evaluation/runs/` directories and
should not be committed by default.

## Validate Focused Unit Coverage

```powershell
node --test evaluation/tests/unit/quality-gate-model.test.mjs evaluation/tests/unit/quality-gate-report.test.mjs evaluation/tests/unit/ci-gate-summary-model.test.mjs evaluation/tests/unit/ci-gate-summary-report.test.mjs
```

## Validate The Gate

```powershell
node evaluation/bin/run-evaluation.mjs --mode gate
node evaluation/bin/generate-quality-gate.mjs
node evaluation/bin/generate-ci-gate-summary.mjs
```

The quality gate should fail for missing required evidence, environment
preflight failure, and required smoke-e2e failure. Slow/flaky and meaningfulness
signals remain warning-only unless policy explicitly promotes them to fail.

## Verify Fork Boundaries

```powershell
git diff --name-only
git remote -v
```

Expected boundary:

- no product source, product fixtures, root package scripts, root Playwright
  config, or root E2E files changed
- `.github/workflows/evaluation.yml` keeps the fork-only repository guard
- `upstream` push remains disabled
