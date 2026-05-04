# Feature Specification: Lower-Layer Reservation Coverage

**Feature Branch**: `003-lower-layer-reservation-coverage`
**Created**: 2026-05-04
**Status**: Draft
**Input**:
`evaluation/reports/migration-candidates.md` and
`evaluation/reports/migration-candidate-review.md`

## User Story

As a test maintainer, I want direct lower-layer reservation-form coverage for
the currently blocked migration candidates so that later E2E thinning can be
reviewed against concrete integration evidence instead of broad E2E behavior.

## Scope

This feature adds lower-layer evidence only. It MUST NOT edit root E2E tests,
product source, package scripts, or CI workflows.

In scope:

- Add reservation integration coverage for the 18
  `blocked_missing_lower_layer` assertion scopes from the migration-candidate
  report.
- Cover both `en-US` and `ja` reservation validation feedback.
- Cover blank required fields, lower/upper date and numeric bounds, invalid
  date strings, and submit-time mail/tel feedback.
- Update migration-candidate source data and regenerated stable report so
  newly covered candidates show their lower-layer evidence.
- Record uncovered screen-operation candidates that are useful but not required
  for the current E2E thinning decision.

Out of scope:

- Root E2E thinning.
- CI wiring.
- Repair mode.
- New product behavior.
- Broad exploratory coverage for flows that are not part of the current
  reservation thinning evidence.

## Functional Requirements

- **FR-001**: The implementation MUST keep all file changes under
  `evaluation/`.
- **FR-002**: The implementation MUST add direct integration evidence for each
  currently blocked reservation validation candidate.
- **FR-003**: The integration evidence MUST cover `en-US` blank required-field
  feedback for date, stay, and guests.
- **FR-004**: The integration evidence MUST cover `en-US` check-in date lower
  and upper bound feedback.
- **FR-005**: The integration evidence MUST cover `en-US` stay and guest lower
  and upper bound feedback that was missing from the previous lower-layer
  evidence.
- **FR-006**: The integration evidence MUST cover `en-US` invalid date string
  feedback.
- **FR-007**: The integration evidence MUST cover `en-US` submit-time mail and
  tel feedback for required name/contact fields.
- **FR-008**: The integration evidence MUST cover the equivalent Japanese
  locale validation feedback candidates.
- **FR-009**: The implementation MUST update the migration-candidate mapping so
  candidates with direct lower-layer evidence name
  `evaluation/tests/integration/reservation-form.spec.mjs`.
- **FR-010**: The generated migration-candidate report MUST be regenerated from
  the source mapping rather than hand-edited.
- **FR-011**: The implementation MUST document screen-operation test ideas that
  are not currently in root E2E or lower layers and state why they are deferred
  or included.
- **FR-012**: The feature MUST leave representative reservation completion E2E
  journeys untouched.

## Non-Functional Requirements

- **NFR-001**: Integration tests SHOULD avoid locale-specific source-code
  duplication when expected text can be derived from committed message data.
- **NFR-002**: The additional integration coverage MUST remain suitable for the
  existing `gate` mode timeout.
- **NFR-003**: Generated run artifacts under `evaluation/runs/` MUST remain
  uncommitted.

## Additional Screen-Operation Coverage Decision

There are useful screen-operation tests that are not currently covered by root
E2E or lower-layer tests. They should not be added in this feature unless they
directly support the E2E thinning evidence above.

Deferred candidates:

- Datepicker widget interactions such as selecting a date from the calendar UI.
- Live total recalculation for each add-on checkbox independently.
- Direct navigation to confirmation without a transaction cookie/session item.
- Confirmation-page rendering of contact/comment/add-on combinations beyond
  the total-bill assertion split.
- Plan access restrictions for member-only or premium-only plans at the
  reservation page boundary.

Rationale: these are legitimate future coverage improvements, but adding them
now would mix migration evidence work with new exploratory coverage. The
current feature should first make the existing E2E thinning decision safer.

## Success Criteria

- **SC-001**: The integration test layer passes with the added reservation
  validation coverage.
- **SC-002**: The evaluation gate passes.
- **SC-003**: The regenerated migration-candidate report shows no
  `blocked_missing_lower_layer` candidates for the 18 covered reservation
  validation assertion scopes.
- **SC-004**: `git status` after implementation shows no changes outside
  `evaluation/`.
