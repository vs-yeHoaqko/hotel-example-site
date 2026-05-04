# Tasks: E2E Assertion Thinning

**Input**: Design documents from `evaluation/specs/006-e2e-thinning/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`,
`contracts/thinning-decision-contract.md`, `quickstart.md`

**Tests**: Tests are included because the feature changes report contracts and
root E2E assertions. Validation must prove both the decision data/reporting and
the thinned E2E suite remain trustworthy.

**Fork drift**: Tasks that touch files outside `evaluation/` name the exact root
E2E files, avoid unrelated formatting or restructuring, and include validation
against the latest fork `main`.

**Organization**: Tasks are grouped by user story so each story can be
implemented and validated independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel because it touches different files and does not
  depend on an incomplete task
- **[Story]**: Maps to the user story from `spec.md`
- Every task names exact repository paths

## Phase 1: Setup

**Purpose**: Confirm the fork/base state and the current candidate inventory
before editing base-branch-owned root E2E files.

- [x] T001 Fetch latest fork refs, confirm `006-e2e-thinning` is based on `origin/main`, and compare `e2e/en-US/reserve.spec.ts` and `e2e/ja/reserve.spec.ts` against latest fork `main`; if either file changed, re-review affected candidates before editing and mark unsafe candidates `deferred`
- [x] T002 Regenerate the current migration report with `node evaluation/bin/generate-migration-candidates.mjs` and review `evaluation/reports/migration-candidates.md`
- [x] T003 [P] Confirm lower-layer evidence exists in `evaluation/tests/unit/billing.test.mjs` for unit-owned billing candidates
- [x] T004 [P] Confirm lower-layer evidence exists in `evaluation/tests/integration/reservation-form.spec.mjs` for integration-owned validation/form-state candidates

---

## Phase 2: Foundational

**Purpose**: Add canonical thinning decision data and validation/report plumbing
before root E2E assertions are edited.

**CRITICAL**: No root E2E thinning should begin until this phase is complete.

- [x] T005 [P] Create the canonical thinning decision data skeleton and schema-compatible fixtures in `evaluation/config/thinning-decisions.config.json` without assigning final candidate outcomes
- [x] T006 [P] Add thinning decision contract validation tests, including `retained` outcome handling, in `evaluation/tests/unit/thinning-decision-model.test.mjs`
- [x] T007 [P] Add migration report outcome rendering tests, including `retained` reason text, in `evaluation/tests/unit/migration-candidate-report.test.mjs`
- [x] T008 Implement thinning decision loading and validation in `evaluation/lib/thinning-decision-model.mjs`
- [x] T009 Integrate thinning decisions into candidate model output in `evaluation/lib/migration-candidate-model.mjs`
- [x] T010 Render thinning outcomes, decision reasons, outside files, and conflict risk in `evaluation/lib/migration-candidate-report.mjs`
- [x] T011 Run `node --test evaluation/tests/unit/thinning-decision-model.test.mjs evaluation/tests/unit/migration-candidate-report.test.mjs`

**Checkpoint**: The report pipeline can validate and display thinning outcomes
without relying on root E2E diffs as the only decision record.

---

## Phase 3: User Story 1 - Thin Lower-Layer-Owned Details (Priority: P1) MVP

**Goal**: Remove or reduce detailed validation, form-state, and billing
assertions from root E2E only where lower-layer evidence already owns that
behavior.

**Independent Test**: Regenerate `evaluation/reports/migration-candidates.md`
and verify all 28 reviewed candidates have `thinned` or `deferred` outcomes,
with lower-layer evidence for every `thinned` outcome.

### Tests for User Story 1

- [x] T012 [P] [US1] Add or update report tests that reject `thinned` outcomes without lower-layer evidence in `evaluation/tests/unit/thinning-decision-model.test.mjs`
- [x] T013 [P] [US1] Add or update report tests that require every reviewed `ready_to_thin` candidate to have an outcome in `evaluation/tests/unit/migration-candidate-report.test.mjs`

### Implementation for User Story 1

- [x] T014 [US1] Mark evidence-backed English validation/form-state candidates as `thinned` in `evaluation/config/thinning-decisions.config.json`
- [x] T015 [US1] Mark evidence-backed Japanese validation/form-state candidates as `thinned` in `evaluation/config/thinning-decisions.config.json`
- [x] T016 [US1] Mark billing assertion candidates as `thinned` in `evaluation/config/thinning-decisions.config.json`
- [x] T017 [US1] Remove only target validation/form-state assertion details from `e2e/en-US/reserve.spec.ts` while preserving test titles and structure
- [x] T018 [US1] Remove only target validation/form-state assertion details from `e2e/ja/reserve.spec.ts` while preserving test titles and structure
- [x] T019 [US1] Remove only target `#total-bill` assertion details from completion tests in `e2e/en-US/reserve.spec.ts` while preserving browser journey assertions
- [x] T020 [US1] Remove only target `#total-bill` assertion details from completion tests in `e2e/ja/reserve.spec.ts` while preserving browser journey assertions
- [x] T021 [US1] Regenerate `evaluation/reports/migration-candidates.md` from the canonical decision data
- [x] T022 [US1] Run `node --test evaluation/tests/unit/thinning-decision-model.test.mjs evaluation/tests/unit/migration-candidate-report.test.mjs`

**Checkpoint**: User Story 1 is complete when lower-layer-owned details are
thinned or explicitly deferred, and the report identifies the lower-layer owner
for every thinned assertion.

---

## Phase 4: User Story 2 - Preserve Representative E2E Journeys (Priority: P1)

**Goal**: Keep the four `keep_e2e` reservation completion journeys as
browser-flow coverage after detail assertions are thinned.

**Independent Test**: Run `node evaluation/bin/run-evaluation.mjs --mode full`
and confirm the completion journeys still pass in the full root E2E suite.

### Tests for User Story 2

- [x] T023 [P] [US2] Add or update decision validation tests for `keep_e2e` outcomes in `evaluation/tests/unit/thinning-decision-model.test.mjs`
- [x] T024 [P] [US2] Add or update report rendering tests for remaining E2E coverage text in `evaluation/tests/unit/migration-candidate-report.test.mjs`

### Implementation for User Story 2

- [x] T025 [US2] Record `keep_e2e` decisions for English completion journeys in `evaluation/config/thinning-decisions.config.json`
- [x] T026 [US2] Record `keep_e2e` decisions for Japanese completion journeys in `evaluation/config/thinning-decisions.config.json`
- [x] T027 [US2] Verify completion journey assertions remain in `e2e/en-US/reserve.spec.ts` after billing detail thinning
- [x] T028 [US2] Verify completion journey assertions remain in `e2e/ja/reserve.spec.ts` after billing detail thinning
- [x] T029 [US2] Run `node evaluation/bin/run-evaluation.mjs --mode full`, or record a concrete environment reason in `evaluation/specs/006-e2e-thinning/quickstart.md` if full validation cannot complete

**Checkpoint**: User Story 2 is complete when the four completion journeys
remain in root E2E and full validation passes or records a concrete environment
reason.

---

## Phase 5: User Story 3 - Preserve Reviewable Thinning Evidence (Priority: P2)

**Goal**: Make the thinning outcome auditable from committed machine-readable
data and human-readable report output.

**Independent Test**: Open `evaluation/reports/migration-candidates.md` and
verify every reviewed candidate shows an outcome, reason, lower-layer evidence,
remaining E2E coverage, outside files, and conflict risk.

### Tests for User Story 3

- [x] T030 [P] [US3] Add deterministic sorting and duplicate-decision tests in `evaluation/tests/unit/thinning-decision-model.test.mjs`
- [x] T031 [P] [US3] Add report snapshot-style assertions for decision outcome sections in `evaluation/tests/unit/migration-candidate-report.test.mjs`

### Implementation for User Story 3

- [x] T032 [US3] Document canonical decision data and report interpretation in `evaluation/README.md`
- [x] T033 [US3] Ensure deferred candidate output includes reason text in `evaluation/lib/migration-candidate-report.mjs`
- [x] T034 [US3] Ensure outside-file and conflict-risk output is present in `evaluation/reports/migration-candidates.md`
- [x] T035 [US3] Run `node evaluation/bin/generate-migration-candidates.mjs` and confirm `evaluation/reports/migration-candidates.md` has no inventory warnings

**Checkpoint**: User Story 3 is complete when future maintainers can audit each
thinning decision without reconstructing it from git diff alone.

---

## Phase 6: Polish & Cross-Cutting Validation

**Purpose**: Validate the complete feature and keep operational artifacts out of
git.

- [x] T036 Run Prettier check for evaluation-owned files with `node node_modules/prettier/bin/prettier.cjs --check evaluation/specs/006-e2e-thinning evaluation/config evaluation/lib evaluation/tests evaluation/reports evaluation/README.md`
- [x] T037 Run focused unit tests with `node --test evaluation/tests/unit/thinning-decision-model.test.mjs evaluation/tests/unit/migration-candidate-report.test.mjs`
- [x] T038 Run the default evaluation gate with `node evaluation/bin/run-evaluation.mjs --mode gate`
- [x] T039 Run full validation with `node evaluation/bin/run-evaluation.mjs --mode full`, or record a concrete environment reason in `evaluation/specs/006-e2e-thinning/quickstart.md` if full validation cannot complete
- [x] T040 Confirm generated `evaluation/runs/` artifacts remain ignored and uncommitted with `git status --short --ignored evaluation/runs`
- [x] T041 Review `git diff --name-only` and root E2E diffs to confirm outside-`evaluation/` edits are limited to `e2e/en-US/reserve.spec.ts` and `e2e/ja/reserve.spec.ts`, with no product source, package-script, CI, test title, test structure, or unrelated formatting changes
- [x] T042 Review `evaluation/specs/006-e2e-thinning/spec.md`, `evaluation/specs/006-e2e-thinning/plan.md`, and `evaluation/specs/006-e2e-thinning/tasks.md` for consistency after implementation

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; confirms fork/base and current evidence
- **Foundational (Phase 2)**: Depends on Setup; blocks root E2E edits
- **US1 (Phase 3)**: Depends on Foundational; MVP thinning outcome
- **US2 (Phase 4)**: Depends on Foundational and should be validated after US1 root E2E edits
- **US3 (Phase 5)**: Depends on Foundational; final report content depends on US1/US2 outcomes
- **Polish (Phase 6)**: Depends on all selected user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Start after Foundational; produces the core thinning edits
- **User Story 2 (P1)**: Start after Foundational; final full validation depends on US1 edits settling
- **User Story 3 (P2)**: Can start report/docs work after Foundational; final report verification depends on US1 and US2 outcome data

### Parallel Opportunities

- T003 and T004 can run in parallel after T002.
- T005, T006, and T007 can run in parallel.
- T012 and T013 can run in parallel.
- T014, T015, and T016 can be prepared in parallel once the decision schema exists, but final JSON merge must be serialized.
- T017 and T018 touch different root E2E files and can run in parallel after decision data is ready.
- T019 and T020 touch different root E2E files and can run in parallel after completion-journey review.
- T023 and T024 can run in parallel.
- T030 and T031 can run in parallel.

---

## Parallel Example: User Story 1

```text
Task: "T012 [US1] Add or update report tests that reject thinned outcomes without lower-layer evidence in evaluation/tests/unit/thinning-decision-model.test.mjs"
Task: "T013 [US1] Add or update report tests that require every reviewed ready_to_thin candidate to have an outcome in evaluation/tests/unit/migration-candidate-report.test.mjs"
```

```text
Task: "T017 [US1] Remove only target validation/form-state assertion details from e2e/en-US/reserve.spec.ts while preserving test titles and structure"
Task: "T018 [US1] Remove only target validation/form-state assertion details from e2e/ja/reserve.spec.ts while preserving test titles and structure"
```

## Parallel Example: User Story 2

```text
Task: "T023 [US2] Add or update decision validation tests for keep_e2e outcomes in evaluation/tests/unit/thinning-decision-model.test.mjs"
Task: "T024 [US2] Add or update report rendering tests for remaining E2E coverage text in evaluation/tests/unit/migration-candidate-report.test.mjs"
```

---

## Implementation Strategy

### MVP First

1. Complete Setup and Foundational tasks.
2. Complete User Story 1.
3. Stop and validate decision data, report output, and focused unit tests before
   proceeding to full validation.

### Incremental Delivery

1. Add canonical decision data and validation.
2. Thin lower-layer-owned details from root E2E with minimal diffs.
3. Confirm `keep_e2e` journeys remain.
4. Update report/docs for reviewability.
5. Run `gate` and `full`.

### Safety Rules

- Do not edit product source, product fixtures, package scripts, GitHub Actions,
  or root Playwright config.
- Do not split, rename, reorder, or broadly format root E2E tests.
- Do not add new lower-layer coverage solely to make an unsafe candidate
  eligible in this feature.
- Mark unsafe candidates `deferred` and leave their root E2E assertions in
  place.
- Do not commit generated `evaluation/runs/` artifacts.
