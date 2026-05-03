# Feature Specification: Migration Candidate Report

**Planned Feature Branch**: `002-migration-candidate-report`
**Created**: 2026-05-01
**Status**: Draft
**Input**: Produce a reviewable report that identifies existing E2E tests that
may be thinned after lower-layer ownership evidence exists.
**Constitution**: `evaluation/.specify/memory/constitution.md` v1.1.0

## Overview

Create an evaluation-local migration-candidate report that helps maintainers
review which existing root E2E tests can be simplified, moved down the test
pyramid, or kept as representative smoke coverage.

The report is a decision aid, not an automatic test rewrite. It must consume
current evaluation ownership evidence and the current root E2E test inventory,
then produce a stable Markdown report under `evaluation/` that names candidate
tests, explains the proposed owner layer, identifies existing lower-layer
coverage, and states what E2E coverage should remain.

No product source, root E2E test, CI workflow, package script, or root
configuration is changed by this feature.

## User Scenarios & Testing

### User Story 1 - Review E2E Thinning Candidates (Priority: P1)

As a maintainer, I want a readable report of E2E tests that overlap with lower
layers so that I can decide which E2E cases to thin without losing coverage.

**Why this priority**: Constitution v1.1.0 requires a reviewable
migration-candidate report before existing E2E tests are thinned, removed, or
replaced.

**Independent Test**: Run the report generator from the repository root and
verify that it writes a Markdown report under `evaluation/` listing candidate
root E2E tests and their proposed owner layers.

**Acceptance Scenarios**:

1. Given `ownership.json` identifies total bill calculation as unit-owned, when
   the report is generated, then root E2E tests that assert detailed billing
   totals are listed as candidates to thin with `unit` as the proposed owner.
2. Given `ownership.json` identifies reservation form page-local behavior as
   integration-owned, when the report is generated, then root E2E tests focused
   on field validation, contact visibility, or total recalculation are listed
   with `integration` as the proposed owner and a status that reflects whether
   direct lower-layer evidence already exists.
3. Given a root E2E test covers route, popup, storage, modal, or localized
   journey behavior, when the report is generated, then the report identifies
   the E2E smoke coverage that should remain rather than recommending complete
   removal.

### User Story 2 - Preserve Human Review Context (Priority: P1)

As a test owner, I want each candidate to include enough context to review the
recommendation without opening every file manually.

**Why this priority**: The report is only useful if the reviewer can understand
the recommendation, existing lower-layer evidence, and remaining E2E
responsibility.

**Independent Test**: Inspect the generated Markdown and verify that each
candidate includes the current test path, test title, candidate ID and assertion
scope, behavior, current layer, proposed owner layer, lower-layer evidence,
recommended action, and remaining E2E coverage.

**Acceptance Scenarios**:

1. Given a candidate maps to existing lower-layer coverage, when the report is
   generated, then it links or names the lower-layer evaluation test that
   already covers the behavior.
2. Given lower-layer coverage is missing or incomplete, when the report is
   generated, then it marks the candidate as blocked instead of recommending
   thinning.
3. Given multiple root E2E tests map to the same behavior, when the report is
   generated, then candidates are grouped by behavior to make review easier.

### User Story 3 - Keep Report Generation Evaluation-Local (Priority: P2)

As a repository maintainer, I want report generation to remain isolated under
`evaluation/` so that creating the report cannot silently change application
tests or CI behavior.

**Why this priority**: Harness growth must be reviewable and must not mutate
root E2E tests or CI before a human approves the next step.

**Independent Test**: Run the report generator on a clean working tree and
verify that the only changed or created tracked-path candidate is the
evaluation-local report or supporting evaluation-local files.

**Acceptance Scenarios**:

1. Given the report generator runs, when it completes, then it does not modify
   `e2e/`, `src/`, `.github/`, root package scripts, or root Playwright config.
2. Given generated run artifacts exist under `evaluation/runs/`, when the
   report is generated, then it does not copy per-run logs, screenshots, traces,
   or videos into committed guidance.
3. Given the current E2E inventory changes later, when the report generator is
   rerun, then the report output is deterministic for the same repository
   state.

## Requirements

### Functional Requirements

- **FR-001**: The feature MUST create all new scripts, config, templates,
  reports, and supporting files under `evaluation/`.
- **FR-002**: The feature MUST NOT modify product source, root E2E tests, root
  package scripts, root Playwright config, or GitHub Actions workflows.
- **FR-003**: The feature MUST produce a human-readable migration-candidate
  Markdown report at `evaluation/reports/migration-candidates.md`.
- **FR-004**: The report MUST identify each candidate by root E2E test path and
  test title.
- **FR-004a**: Each candidate MUST have a stable evaluation-local candidate ID
  and assertion scope. When multiple candidates come from the same root E2E
  test, those fields MUST distinguish intentional same-test candidates from
  duplicate mapping errors.
- **FR-005**: The report MUST include the behavior each candidate covers.
- **FR-006**: The report MUST include the current owner layer and the proposed
  owner layer for each candidate.
- **FR-007**: The report MUST include lower-layer evidence for each candidate,
  including evaluation-local test paths when coverage already exists.
- **FR-008**: The report MUST distinguish candidates that are ready to thin from
  candidates blocked by missing or incomplete lower-layer coverage.
- **FR-008a**: Candidate status values MUST be `ready_to_thin`,
  `blocked_missing_lower_layer`, or `keep_e2e`.
- **FR-008b**: `ready_to_thin` means lower-layer coverage already exists and the
  detailed E2E assertion can be reduced to representative flow coverage.
- **FR-008c**: `blocked_missing_lower_layer` means the proposed owner layer is
  lower than E2E but required lower-layer evidence is missing or incomplete.
- **FR-008d**: `keep_e2e` means the behavior depends on route, popup, storage,
  modal, locale journey, or another browser flow concern that should remain in
  E2E.
- **FR-009**: The report MUST state what E2E smoke or journey coverage should
  remain after thinning.
- **FR-010**: The report MUST group candidates by behavior before listing
  individual tests.
- **FR-011**: The report MUST use deterministic ordering so repeated generation
  on the same repository state produces stable diffs.
- **FR-012**: The report generator MUST consume committed ownership evidence or
  the same ownership source used by the evaluation runner.
- **FR-013**: The report generator MUST inspect the current root E2E test
  inventory from repository files rather than relying only on hand-written
  candidate text.
- **FR-013a**: The first report scope MUST be limited to reservation and
  billing-related root E2E tests that map to existing ownership records.
  Login, mypage, signup, and redirection tests are out of scope until their
  lower-layer ownership is defined.
- **FR-014**: The first implementation MAY use explicit evaluation-local
  mapping rules for known current E2E tests, but those rules MUST be versioned
  under `evaluation/` and reviewable.
- **FR-014a**: Explicit mapping rules MUST be checked against the current E2E
  inventory; missing mapped tests or unmapped relevant reservation tests MUST be
  surfaced in the report.
- **FR-015**: The feature MUST NOT automatically edit, delete, skip, or rewrite
  any root E2E tests.
- **FR-016**: The feature MUST NOT treat per-run artifacts under
  `evaluation/runs/` as committed guidance.
- **FR-017**: The report MUST include a short summary count for
  `ready_to_thin`, `blocked_missing_lower_layer`, and `keep_e2e` candidates.
- **FR-018**: The report MUST include a clear next-step section that says human
  approval is required before root E2E tests are thinned.
- **FR-019**: `evaluation/reports/migration-candidates.md` MUST be treated as a
  stable review artifact and committed when updated; it MUST NOT be written
  under `evaluation/runs/`.
- **FR-020**: For Japanese root E2E tests, the report MUST preserve the test
  title found in the source file and MUST also include an English behavior
  summary so reviewers can understand the candidate even when terminal or log
  encoding renders the original title poorly.
- **FR-020a**: Locale-specific validation message text MUST NOT be marked
  `ready_to_thin` unless locale-specific lower-layer evidence exists; otherwise
  those message-text candidates MUST be `blocked_missing_lower_layer`.

### Non-Functional Requirements

- **NFR-001**: Report generation SHOULD run quickly enough for local review and
  SHOULD NOT require browser execution.
- **NFR-002**: The output MUST be readable in plain Markdown without a custom
  renderer.
- **NFR-003**: The implementation SHOULD avoid new package dependencies unless a
  later plan documents why they are necessary.

## Success Criteria

- **SC-001**: A maintainer can run one command and receive a
  migration-candidate Markdown report under `evaluation/`.
- **SC-002**: The report lists detailed billing assertions in existing
  reservation E2E tests as candidates to thin because unit ownership exists.
- **SC-003**: The report classifies reservation form validation E2E tests by
  lower-layer evidence: directly covered page-local validation candidates are
  `ready_to_thin`, and validation details without direct integration evidence
  are `blocked_missing_lower_layer`.
- **SC-004**: The report keeps representative localized reservation completion
  journeys as E2E responsibility rather than recommending full removal.
- **SC-005**: Running the report generator does not modify files outside
  `evaluation/`.

## Clarifications

### Session 2026-05-01

- Q: Should 001 be merged before creating this feature branch?
  A: Yes. 001 is merged into `main`, and this feature starts from updated
  `main` so it can rely on the committed evaluation harness.
- Q: Should this feature change existing E2E tests?
  A: No. It only creates reviewable migration guidance. Actual E2E thinning is
  a later approved step.
- Q: Should generated run logs be used as the migration report?
  A: No. Layer logs are execution evidence. Migration candidates should be a
  stable, human-readable report derived from ownership and test inventory.
- Q: Should the report consume the latest generated
  `evaluation/runs/<run-id>/ownership.json` or the committed ownership source?
  A: Use the committed ownership source used by the runner
  (`evaluation/lib/ownership.mjs`) as the primary input so the report is stable
  for a given repository state. Generated `ownership.json` may be used as
  supporting evidence only.
- Q: Should the first candidate detection use automatic assertion-level
  analysis or explicit mapping for known current E2E tests?
  A: Use explicit evaluation-local mapping rules for the known current E2E
  tests. Keep the rules versioned and reviewable, and surface missing or
  unmapped relevant tests so stale mappings are visible.
- Q: Where should the report be written?
  A: Write the stable review report to
  `evaluation/reports/migration-candidates.md` and treat it as a committed
  guidance artifact, not as a generated run artifact under `evaluation/runs/`.
- Q: Should the first report cover all root E2E tests?
  A: No. Limit the first report to reservation and billing-related root E2E
  tests that map to existing ownership records. Leave login, mypage, signup,
  and redirection out of scope until their lower-layer ownership is defined.
- Q: Which candidate status values should the report use?
  A: Use `ready_to_thin`, `blocked_missing_lower_layer`, and `keep_e2e`.
- Q: How should Japanese E2E test titles be shown?
  A: Preserve the title string from the existing root E2E source and also show
  an English behavior summary. The Japanese root E2E tests are pre-existing
  repository tests, not files introduced by this evaluation harness work.

## Assumptions

- The evaluation harness from feature 001 is present on the branch.
- The first migration-candidate report can focus on the current reservation and
  billing overlap identified by `ownership.json`.
- Root E2E tests may include Japanese titles and must be read with UTF-8-safe
  tooling.

## Risks

- Static mapping rules can become stale if root E2E titles or paths change; the
  report generator must surface missing inventory matches clearly.
- Over-aggressive recommendations could remove valuable journey confidence, so
  the report must explicitly state remaining E2E smoke coverage.
- A report that is too verbose may be ignored, so candidates should be grouped
  by behavior with concise per-test details.
