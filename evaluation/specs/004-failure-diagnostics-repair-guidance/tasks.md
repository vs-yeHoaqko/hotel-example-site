# Tasks: Failure Diagnostics and Repair Guidance

**Input**: Design documents from
`evaluation/specs/004-failure-diagnostics-repair-guidance/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`,
`contracts/summary-diagnostics.schema.json`, `quickstart.md`

**Tests**: Tests are included because the spec and plan require controlled
diagnostic validation before implementation.

**Organization**: Tasks are grouped by user story so each story can be
implemented and validated independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel because it touches different files and does not
  depend on an incomplete task
- **[Story]**: Maps to the user story from `spec.md`
- Every task names exact repository paths

## Phase 1: Setup

**Purpose**: Prepare shared fixtures and constants used by the diagnostic
implementation.

- [x] T001 [P] Create Playwright diagnostic JSON fixtures in `evaluation/tests/fixtures/diagnostics/playwright-results.mjs`
- [x] T002 [P] Create malformed and missing-artifact diagnostic fixtures in `evaluation/tests/fixtures/diagnostics/malformed-results.mjs`
- [x] T003 [P] Add diagnostic enum and excerpt limit constants in `evaluation/lib/diagnostics.mjs`

---

## Phase 2: Foundational

**Purpose**: Shared schema and summary plumbing that blocks all diagnostic user
stories.

**CRITICAL**: No user story implementation should begin until this phase is
complete.

- [x] T004 Update `evaluation/schemas/summary.schema.json` to require top-level `diagnostics` with the contract shape from `evaluation/specs/004-failure-diagnostics-repair-guidance/contracts/summary-diagnostics.schema.json`
- [x] T005 Update `evaluation/lib/summary-model.mjs` to initialize passed runs with `diagnostics: []`
- [x] T006 Add relative artifact normalization and absolute-path rejection helpers in `evaluation/lib/diagnostics.mjs`
- [x] T007 Add bounded excerpt and redacted diagnostic text helpers in `evaluation/lib/diagnostics.mjs`
- [x] T008 Add passed-run fast path coverage that confirms `evaluation/lib/summary-model.mjs` produces `diagnostics: []` without parsing failed-layer artifacts in `evaluation/tests/unit/diagnostics.test.mjs`

**Checkpoint**: Summary generation can validate an empty diagnostics array for
passed runs.

---

## Phase 3: User Story 1 - Inspect a Failed Test Without Reading Raw Logs First (Priority: P1) MVP

**Goal**: Failed evaluation runs expose actionable test-case or layer-level
diagnostics in `summary.json` and `summary.md`.

**Independent Test**: Run diagnostic unit tests and a controlled failing
fixture. Verify failed test identity or layer command evidence appears in
`summary.json`, while `summary.md` links artifacts instead of requiring raw log
inspection first.

### Tests for User Story 1

- [x] T009 [P] [US1] Add unit tests for passed-run empty diagnostics and layer-command fallback diagnostics in `evaluation/tests/unit/diagnostics.test.mjs`
- [x] T010 [P] [US1] Add unit tests for Playwright test-case diagnostic extraction in `evaluation/tests/unit/playwright-diagnostics.test.mjs`
- [x] T011 [P] [US1] Add unit tests for malformed Playwright JSON fallback behavior in `evaluation/tests/unit/playwright-diagnostics.test.mjs`

### Implementation for User Story 1

- [x] T012 [US1] Implement layer-command diagnostic creation in `evaluation/lib/diagnostics.mjs`
- [x] T013 [US1] Implement runner-error diagnostic creation in `evaluation/lib/diagnostics.mjs`
- [x] T014 [US1] Implement tolerant Playwright JSON traversal in `evaluation/lib/playwright-diagnostics.mjs`
- [x] T015 [US1] Implement Playwright attachment and source-location mapping in `evaluation/lib/playwright-diagnostics.mjs`
- [x] T016 [US1] Integrate diagnostic creation into `evaluation/lib/summary-model.mjs`
- [x] T017 [US1] Preserve existing run-level `recommendedNextAction` selection while adding diagnostics in `evaluation/lib/summary-model.mjs`
- [x] T018 [US1] Pass run directory context from `evaluation/bin/run-evaluation.mjs` to `evaluation/lib/summary-model.mjs`
- [x] T019 [US1] Render a concise Failure Diagnostics section in `evaluation/lib/summary-markdown.mjs`
- [x] T020 [US1] Run `node --test evaluation/tests/unit/diagnostics.test.mjs evaluation/tests/unit/playwright-diagnostics.test.mjs`

**Checkpoint**: User Story 1 is complete when failed layers produce diagnostic
entries and passed runs still produce `diagnostics: []`.

---

## Phase 4: User Story 2 - Receive Non-Mutating Repair Guidance (Priority: P1)

**Goal**: Each diagnostic includes deterministic, advisory guidance with likely
inspection targets, rationale, and confidence.

**Independent Test**: Trigger or fixture unit billing, reservation validation,
environment, and unknown failures. Verify the guidance points to distinct
inspection targets and never mutates files.

### Tests for User Story 2

- [x] T021 [P] [US2] Add billing guidance tests in `evaluation/tests/unit/diagnostic-guidance.test.mjs`
- [x] T022 [P] [US2] Add reservation validation guidance tests in `evaluation/tests/unit/diagnostic-guidance.test.mjs`
- [x] T023 [P] [US2] Add environment and unknown ownership guidance tests in `evaluation/tests/unit/diagnostic-guidance.test.mjs`

### Implementation for User Story 2

- [x] T024 [US2] Implement classification-to-action mapping in `evaluation/lib/diagnostic-guidance.mjs`
- [x] T025 [US2] Implement billing likely-target rules in `evaluation/lib/diagnostic-guidance.mjs`
- [x] T026 [US2] Implement reservation validation likely-target rules in `evaluation/lib/diagnostic-guidance.mjs`
- [x] T027 [US2] Implement environment, timeout, route, popup, storage, and unknown guidance rules in `evaluation/lib/diagnostic-guidance.mjs`
- [x] T028 [US2] Attach guidance objects to diagnostics in `evaluation/lib/diagnostics.mjs`
- [x] T029 [US2] Run `node --test evaluation/tests/unit/diagnostic-guidance.test.mjs evaluation/tests/unit/diagnostics.test.mjs`

**Checkpoint**: User Story 2 is complete when diagnostics include non-mutating
guidance with likely targets, rationale, and `low`/`medium`/`high` confidence.

---

## Phase 5: User Story 3 - Preserve a Stable Machine-Readable Diagnostic Contract (Priority: P2)

**Goal**: The diagnostics contract is stable, schema-validated, documented, and
represented in examples.

**Independent Test**: Validate the example summary and generated summaries
against `evaluation/schemas/summary.schema.json` for passed runs, failed runs,
skipped layers, command failures, and runner errors.

### Tests for User Story 3

- [x] T030 [P] [US3] Add schema validation tests for diagnostic enum values in `evaluation/tests/unit/diagnostics.test.mjs`
- [x] T031 [P] [US3] Add example summary validation coverage in `evaluation/tests/unit/summary-schema.test.mjs`

### Implementation for User Story 3

- [x] T032 [US3] Update `evaluation/examples/summary.example.json` with representative `test_case`, `layer_command`, and `runner_error` diagnostics
- [x] T033 [US3] Update `evaluation/baselines/README.md` to document diagnostic evidence and `diagnostics: []` for passed runs
- [x] T034 [US3] Update `evaluation/specs/004-failure-diagnostics-repair-guidance/quickstart.md` if implementation commands differ from the planned validation commands
- [x] T035 [US3] Run `node --test evaluation/tests/unit/summary-schema.test.mjs evaluation/tests/unit/diagnostics.test.mjs`

**Checkpoint**: User Story 3 is complete when the committed example and
generated summaries validate against the updated schema.

---

## Phase 6: Polish & Cross-Cutting Validation

**Purpose**: Verify the complete feature and keep operational artifacts out of
git.

- [x] T036 [P] Run a controlled failing evaluation config or fixture and confirm generated `summary.json` contains a `layer_command` diagnostic in `evaluation/runs/<run-id>/summary.json`
- [x] T037 [P] Run Prettier check for changed evaluation files with `node node_modules/prettier/bin/prettier.cjs --check evaluation`
- [x] T038 Run the full evaluation gate with `node evaluation/bin/run-evaluation.mjs --mode gate`
- [x] T039 Confirm `evaluation/runs/` remains ignored and uncommitted using `git status --short`
- [x] T040 Review `evaluation/specs/004-failure-diagnostics-repair-guidance/spec.md`, `evaluation/specs/004-failure-diagnostics-repair-guidance/plan.md`, and `evaluation/specs/004-failure-diagnostics-repair-guidance/tasks.md` for consistency after implementation

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: Depends on Setup; blocks all user stories
- **US1 (Phase 3)**: Depends on Foundational; MVP
- **US2 (Phase 4)**: Depends on Foundational and integrates with US1 diagnostic objects
- **US3 (Phase 5)**: Depends on Foundational; should be finalized after US1/US2 shape is stable
- **Polish (Phase 6)**: Depends on selected user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Start after Foundational; no dependency on US2 or US3
- **User Story 2 (P1)**: Start after Foundational; can build guidance module in parallel, but final integration depends on US1 diagnostic object shape
- **User Story 3 (P2)**: Start schema/example work after Foundational; final validation depends on US1 and US2 field shape

### Parallel Opportunities

- T001, T002, and T003 can run in parallel.
- T009, T010, and T011 can run in parallel after Foundational.
- T021, T022, and T023 can run in parallel.
- T030 and T031 can run in parallel.
- T036 and T037 can run while T040 review is prepared, after implementation
  files settle.

---

## Parallel Example: User Story 1

```text
Task: "T009 [US1] Add unit tests for passed-run empty diagnostics and layer-command fallback diagnostics in evaluation/tests/unit/diagnostics.test.mjs"
Task: "T010 [US1] Add unit tests for Playwright test-case diagnostic extraction in evaluation/tests/unit/playwright-diagnostics.test.mjs"
Task: "T011 [US1] Add unit tests for malformed Playwright JSON fallback behavior in evaluation/tests/unit/playwright-diagnostics.test.mjs"
```

## Parallel Example: User Story 2

```text
Task: "T021 [US2] Add billing guidance tests in evaluation/tests/unit/diagnostic-guidance.test.mjs"
Task: "T022 [US2] Add reservation validation guidance tests in evaluation/tests/unit/diagnostic-guidance.test.mjs"
Task: "T023 [US2] Add environment and unknown ownership guidance tests in evaluation/tests/unit/diagnostic-guidance.test.mjs"
```

---

## Implementation Strategy

### MVP First

1. Complete Setup and Foundational tasks.
2. Complete User Story 1.
3. Stop and validate that failed layers produce useful diagnostics and passed
   runs produce `diagnostics: []`.

### Incremental Delivery

1. Add US1 diagnostic extraction and markdown rendering.
2. Add US2 deterministic repair guidance.
3. Finalize US3 schema, examples, and docs.
4. Run Phase 6 validation.

### Safety Rules

- Do not modify product source under `src/`, static HTML pages, root E2E tests,
  root package scripts, root Playwright config, or GitHub Actions workflows.
- Do not implement repair mode in this feature.
- Do not commit generated `evaluation/runs/` artifacts.
- Keep diagnostic guidance advisory and include confidence plus rationale.
