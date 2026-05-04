# Quickstart: E2E Assertion Thinning

## Prerequisites

- Work on branch `006-e2e-thinning`.
- Keep the working tree clean before implementation.
- Fetch the fork before touching root E2E files:

```powershell
git fetch origin
```

Confirm the branch is based on the latest fork `main` or merge the latest
`main` before editing `e2e/en-US/reserve.spec.ts` or `e2e/ja/reserve.spec.ts`.

## Generate the Current Candidate Report

```powershell
node evaluation/bin/generate-migration-candidates.mjs
```

Expected current inventory:

- `ready_to_thin`: 28
- `blocked_missing_lower_layer`: 0
- `keep_e2e`: 4

## Implement Thinning

1. Create or update `evaluation/config/thinning-decisions.config.json`.
2. Record all 28 `ready_to_thin` candidates as `thinned` or `deferred`.
3. Record all 4 `keep_e2e` journeys as `keep_e2e`.
4. Update migration candidate model/reporting to render thinning outcomes.
5. Edit only target assertions in:
   - `e2e/en-US/reserve.spec.ts`
   - `e2e/ja/reserve.spec.ts`
6. Preserve root E2E test case structure and titles.
7. Do not run broad formatting on root E2E files.

## Validate

Check formatting for evaluation-owned files:

```powershell
node node_modules/prettier/bin/prettier.cjs --check evaluation/specs/006-e2e-thinning evaluation/config evaluation/lib evaluation/tests evaluation/reports
```

Regenerate the report:

```powershell
node evaluation/bin/generate-migration-candidates.mjs
```

Run focused unit tests after adding them:

```powershell
node --test evaluation/tests/unit/thinning-decision-model.test.mjs evaluation/tests/unit/migration-candidate-report.test.mjs
```

Run the default gate:

```powershell
node evaluation/bin/run-evaluation.mjs --mode gate
```

Run full validation:

```powershell
node evaluation/bin/run-evaluation.mjs --mode full
```

Use `collect-all` only when a failure needs additional evidence:

```powershell
node evaluation/bin/run-evaluation.mjs --mode collect-all
```

## Review Checklist

- Every reviewed candidate has an outcome in machine-readable decision data.
- Every `thinned` candidate still has committed lower-layer evidence.
- Every `deferred` candidate keeps the root E2E assertion and states why.
- The 4 `keep_e2e` journeys still run as browser-flow coverage.
- Root E2E diffs contain no unrelated formatting, test splitting, title edits,
  or broad restructuring.
