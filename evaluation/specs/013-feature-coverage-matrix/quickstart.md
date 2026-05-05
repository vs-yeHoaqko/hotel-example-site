# Quickstart: Feature Coverage Matrix

## Generate Required Evidence

```powershell
node evaluation/bin/run-evaluation.mjs --mode collect-all
node evaluation/bin/generate-run-health.mjs
node evaluation/bin/generate-test-meaningfulness.mjs
```

## Generate The Matrix

```powershell
node evaluation/bin/generate-feature-coverage-matrix.mjs
```

Expected output:

```text
evaluation/reports/feature-coverage-matrix.md
```

## Generate CI-Facing Reports

```powershell
node evaluation/bin/generate-quality-gate.mjs
node evaluation/bin/generate-ci-gate-summary.mjs
```

The CI summary should list `evaluation/reports/feature-coverage-matrix.md` as
one of the report paths.

## Validate Focused Unit Coverage

```powershell
node --test evaluation/tests/unit/feature-coverage-model.test.mjs evaluation/tests/unit/feature-coverage-report.test.mjs evaluation/tests/unit/ci-gate-summary-model.test.mjs
```

## Verify Fork Boundaries

```powershell
git diff --name-only
git remote -v
```

Expected boundary:

- no product source, product fixtures, root package scripts, root Playwright
  config, or root E2E source files changed
- `.github/workflows/evaluation.yml` changes are additive
- `upstream` push remains disabled
