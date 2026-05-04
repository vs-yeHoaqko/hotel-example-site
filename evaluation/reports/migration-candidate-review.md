# Migration Candidate Review Decisions

## Metadata

- Source report: `evaluation/reports/migration-candidates.md`
- Review date: 2026-05-03
- Scope: reservation-billing
- Decision basis: human review accepted the proposed distinction between
  immediately safe thinning, partial thinning, and lower-layer evidence gaps.

## Decision Summary

- Approved for thinning now: 3 candidates
- Partially approved: 2 candidates
- Not approved for full thinning until lower-layer coverage is added or split:
  5 candidates
- Must remain E2E: 4 representative completion journeys

## Approved For Thinning Now

These candidates may be used by the next E2E thinning spec without adding new
lower-layer coverage first.

### `en-initial-not-logged-contact-visibility`

- Decision: approve.
- Scope approved: remove detailed not-logged-in contact visibility assertions
  from the root E2E path.
- Rationale: this is page-local DOM behavior and is already covered by
  `evaluation/tests/integration/reservation-form.spec.mjs`.
- Boundary: do not remove the broader route-opening or representative
  reservation journey coverage.

### `en-under-term-lower-bound`

- Decision: approve.
- Scope approved: remove the detailed stay-term lower-bound assertion from the
  root E2E path.
- Rationale: integration coverage already checks `#term = 0`, lower-bound
  validation feedback, and `#total-bill = -`.
- Boundary: if exact validation message wording is considered product-critical,
  strengthen integration coverage before removing exact-message checks.

### `en-over-head-count-upper-bound`

- Decision: approve.
- Scope approved: remove the detailed guest-count upper-bound assertion from
  the root E2E path.
- Rationale: integration coverage already checks `#head-count = 10`,
  upper-bound validation feedback, and `#total-bill = -`.
- Boundary: if exact max value wording must be preserved, strengthen
  integration coverage before removing exact-message checks.

## Partially Approved

These candidates can be thinned only for the explicitly approved assertion
scope. The next thinning spec must keep or add coverage for the unapproved
part.

### `en-initial-logged-contact-visibility`

- Decision: partial approve.
- Scope approved: contact field show/hide and required-state behavior.
- Scope not approved yet: logged-in default email/tel prefill values.
- Required next action: keep the prefill assertions in E2E, or add direct
  integration coverage for logged-in default email/tel values before removing
  them.

### `ja-initial-not-logged-contact-visibility`

- Decision: partial approve.
- Scope approved: locale-independent contact field show/hide behavior.
- Scope not approved yet: Japanese locale labels or locale-specific option
  text.
- Required next action: thin only DOM-state assertions, or add a Japanese
  integration case before removing locale-facing checks.

## Not Approved For Full Thinning Yet

These candidates should not be fully thinned by the next spec unless it first
adds or identifies lower-layer evidence for the missing responsibility.

### `ja-initial-logged-contact-visibility`

- Decision: do not fully thin yet.
- Missing evidence: Japanese locale path plus logged-in default email/tel
  prefill values.
- Required next action: add direct integration coverage for the Japanese
  logged-in contact defaults, or keep those assertions in E2E.

### `en-completion-initial-total-bill`

- Decision: split before thinning.
- Scope safe to move down: numeric total-bill calculation.
- Scope not covered by current unit evidence: confirmation-page message
  composition and currency formatting such as `Total $70.00 (included taxes)`.
- Required next action: keep display assertion in E2E, or add lower-layer
  coverage for confirm-page total-bill formatting before removing it.

### `en-completion-logged-total-bill`

- Decision: split before thinning.
- Scope safe to move down: numeric total-bill calculation.
- Scope not covered by current unit evidence: the specific logged-in completion
  scenario with selected add-ons, guest count, weekend adjustment, and
  confirmation-page formatting.
- Required next action: add a unit case matching this calculation scenario and
  lower-layer formatting coverage before fully removing the E2E assertion.

### `ja-completion-initial-total-bill`

- Decision: split before thinning.
- Scope safe to move down: numeric total-bill calculation.
- Scope not covered by current unit evidence: Japanese currency/message
  formatting such as `合計 7,000円（税込み）`.
- Required next action: keep the Japanese display assertion in E2E, or add
  formatter/message lower-layer coverage before removing it.

### `ja-completion-logged-total-bill`

- Decision: split before thinning.
- Scope safe to move down: numeric total-bill calculation.
- Scope not covered by current unit evidence: the specific logged-in Japanese
  completion scenario plus Japanese currency/message formatting.
- Required next action: add a unit case matching this calculation scenario and
  Japanese formatter/message coverage before fully removing the E2E assertion.

## Must Remain E2E

These representative journeys remain browser-flow smoke coverage and are not
approved for removal.

- `en-completion-initial-journey`
- `en-completion-logged-journey`
- `ja-completion-initial-journey`
- `ja-completion-logged-journey`

They may only lose lower-layer-owned detail assertions after the relevant
approved or split decisions above are implemented.

## Next Spec Input

The next thinning spec should use this review as its source of truth:

1. implement the 3 approved thinning changes;
2. implement only the approved parts of the 2 partial decisions;
3. add lower-layer evidence before fully thinning the 5 split or blocked
   decisions;
4. preserve the 4 representative E2E completion journeys.
