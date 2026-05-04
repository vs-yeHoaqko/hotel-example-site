# Feature Specification: E2E Assertion Thinning

**Feature Branch**: `006-e2e-thinning`
**Created**: 2026-05-04
**Status**: Draft
**Input**: Thin existing root E2E assertions now that lower-layer evidence
exists, while preserving representative reservation completion journeys.
**Constitution**: `.specify/memory/constitution.md` v1.4.0 and
`evaluation/.specify/memory/constitution.md` v1.4.0

## Overview

Reduce detailed assertions from the existing root reservation E2E tests where
the same responsibility is already covered by lower-layer evaluation tests.
The goal is to make the root E2E suite narrower and easier to diagnose without
losing behavior coverage.

This feature starts from the committed migration-candidate report. The report
currently identifies 28 `ready_to_thin` candidates and 4 `keep_e2e`
reservation completion journeys. The implementation must thin only the reviewed
ready candidates, keep the explicitly marked E2E journeys, and update the
review evidence so future maintainers can see what moved down the pyramid.
All 28 currently reviewed `ready_to_thin` candidates are in scope; any
candidate found unsafe during implementation must be recorded as `deferred`
with a concrete reason rather than silently skipped.
Thinning decisions must be recorded in machine-readable evaluation data under
`evaluation/`; Markdown reporting is the human-readable view of that data.
Validation must include both the default `gate` and the `full` evaluation mode.
`collect-all` is reserved for failure investigation or additional evidence
collection, not for every normal thinning run.
Root E2E test case structure and titles must be preserved. Thinning should
remove or reduce only the target assertion statements needed to honor the
reviewed migration decisions.
If implementation review finds that a candidate's lower-layer evidence is
insufficient, that candidate must be deferred rather than expanding this
feature with new lower-layer coverage.

Product behavior changes, automatic repair mode, CI trigger changes, and new
test categories are out of scope.

Because this repository is a fork, the design must minimize changes to files
that are likely to change in the fork base branch. The default approach
is to keep decision records, evidence, and reports under `evaluation/`. When
root E2E edits are required, they must be limited to assertion-level thinning
for reviewed migration candidates and must avoid broad formatting,
restructuring, or unrelated cleanup.

## Clarifications

### Session 2026-05-04

- Q: Should this feature attempt all reviewed `ready_to_thin` candidates or
  split thinning by behavior group? A: Attempt all 28 reviewed candidates; mark
  only implementation-unsafe candidates as deferred with reasons.
- Q: What should be the canonical decision record for thinning outcomes? A: Use
  machine-readable evaluation data under `evaluation/` as canonical, with
  Markdown as the human-readable report.
- Q: Which evaluation modes are required to validate thinning? A: Require both
  `gate` and `full`; use `collect-all` only for failure investigation or
  additional evidence.
- Q: Should root E2E test cases be restructured while thinning assertions? A:
  Preserve existing root E2E test case structure and titles; thin only target
  assertions.
- Q: What should happen if a candidate's lower-layer evidence is insufficient
  during implementation review? A: Mark that candidate as deferred and leave
  its root E2E assertion in place.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Thin Lower-Layer-Owned Details (Priority: P1)

As a maintainer, I want detailed validation, form-state, and billing assertions
removed from root E2E paths when lower-layer evidence already owns that
behavior so that E2E failures point to browser journey problems instead of
page-local or calculation details.

**Why this priority**: This is the core value of the feature. The harness has
already produced lower-layer evidence and a migration report; this story turns
that reviewed evidence into a leaner E2E suite.

**Independent Test**: Compare the root reservation E2E files before and after
the change. Verify that each thinned assertion scope appears in the migration
evidence and remains covered by the owning lower-layer test.

**Acceptance Scenarios**:

1. **Given** a migration candidate is marked `ready_to_thin`, **When** its root
   E2E assertion is removed or reduced, **Then** the corresponding lower-layer
   evidence remains present and named in the report.
2. **Given** a candidate lacks lower-layer evidence, **When** thinning is
   considered, **Then** the candidate is not thinned and the reason is recorded.
3. **Given** a detailed billing assertion appears inside a completion E2E
   journey, **When** that assertion is thinned, **Then** the completion journey
   itself still verifies the browser-level reservation flow.

---

### User Story 2 - Preserve Representative E2E Journeys (Priority: P1)

As a maintainer, I want the explicitly marked reservation completion journeys
to remain in E2E so that the suite still proves localized browser flows,
popup handling, session storage, confirmation, success modal, and close
behavior.

**Why this priority**: E2E thinning is only safe if the browser-level journeys
that cannot be replaced by unit or integration tests remain intact.

**Independent Test**: Run the full E2E mode and confirm that the four
`keep_e2e` completion journeys are still present and passing after thinning.

**Acceptance Scenarios**:

1. **Given** a migration candidate is marked `keep_e2e`, **When** thinning work
   is implemented, **Then** the journey remains as E2E coverage.
2. **Given** lower-layer evidence covers a detail inside a `keep_e2e` journey,
   **When** the detail is thinned, **Then** the browser journey still reaches
   reservation success.
3. **Given** localized English and Japanese reservation flows exist, **When**
   the suite is thinned, **Then** both locale families retain representative
   completion coverage.

---

### User Story 3 - Preserve Reviewable Thinning Evidence (Priority: P2)

As a future maintainer, I want the migration report and documentation to show
which assertions were thinned, retained, or deferred so that I can audit the
test-level ownership decision without reconstructing it from diffs.

**Why this priority**: The root E2E edits are only trustworthy if the decision
record stays readable after implementation.

**Independent Test**: Open the migration report after implementation and verify
that every reviewed candidate has an explicit outcome and evidence reference.

**Acceptance Scenarios**:

1. **Given** a candidate was thinned, **When** the report is regenerated or
   updated, **Then** it records the thinned assertion scope and the lower-layer
   evidence that remains.
2. **Given** a candidate was intentionally retained, **When** the report is
   reviewed, **Then** it records why the E2E assertion remains.
3. **Given** a candidate could not be safely handled in this feature, **When**
   the report is reviewed, **Then** it is marked deferred with a concrete
   reason.

### Edge Cases

- A root E2E test combines browser-flow assertions and lower-layer-owned
  details in the same test case.
- The migration report identifies multiple assertion scopes within one root
  E2E test.
- Japanese test titles remain mojibake in the source inventory; the thinning
  decision must use file path, ordinal, and assertion scope as stable identity.
- A lower-layer evidence file exists but does not actually cover the assertion
  scope during implementation review.
- A candidate marked ready becomes unsafe because the root E2E assertion is the
  only coverage for a browser-specific behavior discovered during editing.
- The fork's base branch changes the same root E2E file before
  thinning is implemented.
- A root E2E file contains unrelated formatting drift that would be easy to
  normalize but would increase future merge conflicts.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The feature MUST use the committed migration-candidate report as
  the starting inventory for thinning decisions.
- **FR-001a**: The feature MUST evaluate all 28 currently reviewed
  `ready_to_thin` candidates for thinning in this feature.
- **FR-002**: The feature MUST NOT thin any root E2E assertion that lacks
  lower-layer evidence unless the implementation first adds and validates that
  evidence.
- **FR-002a**: If implementation review finds lower-layer evidence
  insufficient, the candidate MUST be marked `deferred` and left covered by the
  existing root E2E assertion.
- **FR-003**: The feature MUST keep the four `keep_e2e` reservation completion
  journeys as browser-flow E2E coverage.
- **FR-004**: The feature MUST preserve lower-layer tests that justify each
  thinned assertion.
- **FR-005**: The feature MUST record every reviewed candidate as thinned,
  retained, or deferred.
- **FR-005a**: The canonical thinning decision record MUST be machine-readable
  evaluation data under `evaluation/`.
- **FR-005b**: The human-readable migration report MUST be derived from or kept
  consistent with the canonical machine-readable decision data.
- **FR-006**: For each thinned candidate, the evidence record MUST identify the
  original root E2E path, original ordinal or stable identity, assertion scope,
  owner layer, and lower-layer evidence.
- **FR-007**: For each retained or deferred candidate, the evidence record MUST
  state the reason it was not thinned.
- **FR-008**: The feature MUST NOT change product source, product fixtures,
  application behavior, root package scripts, or CI triggers.
- **FR-009**: The feature MUST NOT delete an entire root E2E journey merely
  because details inside it are covered at lower layers.
- **FR-010**: The feature MUST preserve localized English and Japanese
  representative E2E coverage.
- **FR-011**: The feature MUST keep generated run directories under
  `evaluation/runs/` ignored and uncommitted.
- **FR-012**: The feature MUST update human-readable guidance so future
  maintainers understand that root E2E has been thinned and where detailed
  coverage now lives.
- **FR-013**: The feature MUST validate the default gate after thinning.
- **FR-014**: The feature MUST validate the `full` evaluation mode after
  thinning or explicitly record why full validation could not complete in the
  current environment.
- **FR-015**: The feature MUST leave automatic repair mode out of scope.
- **FR-016**: The feature MUST minimize edits to files likely to change in the
  fork base branch.
- **FR-017**: When root E2E edits are required, they MUST be limited to the
  smallest assertion-level changes tied to reviewed migration candidates.
- **FR-018**: The feature MUST NOT apply broad formatting, reordering, renaming,
  or unrelated cleanup to root E2E files.
- **FR-019**: Every touched file outside `evaluation/` MUST be listed with the
  reason it must be touched and the expected conflict risk.
- **FR-020**: If the fork's `main` has changed a target root E2E path before
  implementation, the candidate must be re-reviewed against the latest fork
  base before editing.
- **FR-021**: The feature MUST treat `collect-all` as optional evidence
  collection for failure investigation, not as a required validation step for
  every successful thinning run.
- **FR-022**: The feature MUST preserve existing root E2E test case structure
  and titles.
- **FR-023**: Root E2E edits MUST remove or reduce only target assertion
  statements tied to reviewed thinning decisions.
- **FR-024**: The feature MUST NOT add new lower-layer coverage solely to make
  an unsafe candidate eligible for thinning in this feature.

### Key Entities

- **Migration Candidate**: A reviewed assertion scope from a root E2E test with
  current layer, proposed owner layer, status, lower-layer evidence, and
  remaining E2E coverage.
- **Thinning Decision**: The outcome for a candidate: thinned, retained, or
  deferred, with a reason and evidence reference.
- **Canonical Decision Data**: Machine-readable evaluation data under
  `evaluation/` that records thinning outcomes and feeds human-readable
  reporting.
- **Lower-Layer Evidence**: Unit or integration coverage that owns the behavior
  formerly asserted in detail by E2E.
- **Remaining E2E Journey**: Browser-flow coverage that remains after detailed
  assertions are removed or reduced.
- **Verification Run**: A `gate` or `full` evaluation run used to prove that
  the thinned suite and lower-layer evidence still pass together.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: All 28 currently reviewed `ready_to_thin` candidates have an
  explicit thinned, retained, or deferred outcome after implementation.
- **SC-002**: All 4 `keep_e2e` completion journeys remain represented as E2E
  browser-flow coverage.
- **SC-003**: The default evaluation gate passes after thinning.
- **SC-004**: The `full` evaluation mode passes after thinning, or the
  implementation records a concrete environment reason when full validation
  cannot complete.
- **SC-005**: No product source or package-script changes are required to
  complete the thinning feature.
- **SC-006**: A maintainer can identify the lower-layer owner for every
  thinned assertion from committed documentation or report data.
- **SC-007**: Outside-`evaluation/` edits are limited to reviewed root E2E
  assertion scopes and contain no unrelated formatting or restructuring.

## Assumptions

- The human review of the existing `ready_to_thin` candidates is complete and
  approves thinning according to the current recommendations.
- The current lower-layer evidence in `evaluation/tests/unit/` and
  `evaluation/tests/integration/` is the baseline for deciding whether a root
  E2E assertion can be thinned.
- The root E2E files may be edited for this feature because the constitution
  now permits evidence-preserving thinning with explicit rationale and minimal
  fork-drift impact.
- The feature does not need to add new product behavior coverage that was not
  already represented by the migration-candidate inventory.
- The fork-scoped CI gate from feature 005 remains the default automatic check.
- Upstream and fork `main` may continue to change independently; implementation
  should re-check the latest fork base before touching root E2E files.
