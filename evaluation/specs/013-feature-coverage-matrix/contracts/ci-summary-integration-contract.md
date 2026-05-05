# Contract: CI Summary Integration

## Scope

The existing CI gate summary should reference the feature coverage matrix once
the report exists.

## Required Behavior

- `evaluation/reports/feature-coverage-matrix.md` appears in CI summary
  evidence links.
- The GitHub Actions artifact upload includes
  `evaluation/reports/feature-coverage-matrix.md`.
- Missing matrix evidence should be shown as a warning, not as a hard failure,
  unless a later quality-gate policy promotes it.

## Non-Goals

- Do not change CI triggers.
- Do not change root package scripts.
- Do not change product or root E2E source files.
