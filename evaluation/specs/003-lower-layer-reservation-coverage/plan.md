# Implementation Plan: Lower-Layer Reservation Coverage

**Feature Branch**: `003-lower-layer-reservation-coverage`
**Spec**: `evaluation/specs/003-lower-layer-reservation-coverage/spec.md`

## Approach

Add direct integration coverage to
`evaluation/tests/integration/reservation-form.spec.mjs` for the currently
blocked reservation validation candidates. The tests will open the existing
reservation popup through localized plan pages, interact with stable DOM ids,
and assert the localized feedback text rendered by the application.

The implementation updates
`evaluation/config/migration-candidates.config.json` so the covered candidates
name the integration evidence and become newly reviewable for later thinning.
Then the stable migration-candidate report is regenerated.

## Files

- `evaluation/tests/integration/reservation-form.spec.mjs`
- `evaluation/config/migration-candidates.config.json`
- `evaluation/reports/migration-candidates.md`
- `evaluation/specs/003-lower-layer-reservation-coverage/spec.md`
- `evaluation/specs/003-lower-layer-reservation-coverage/plan.md`
- `evaluation/specs/003-lower-layer-reservation-coverage/tasks.md`

## Validation

1. Run the integration layer.
2. Regenerate the migration-candidate report.
3. Run Prettier checks for evaluation paths.
4. Run `node evaluation/bin/run-evaluation.mjs --mode gate`.
5. Confirm `evaluation/runs/` remains ignored/uncommitted.

## Risk Controls

- Do not edit root E2E tests in this feature.
- Do not treat newly ready candidates as approved for thinning; approval is a
  later human review step.
- Keep unrelated screen-operation coverage deferred unless it is required for
  the current migration evidence.
