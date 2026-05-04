# Tasks: CI Health Trends and Test Meaningfulness

**Input**: Design documents from `evaluation/specs/010-ci-health-trends/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: This feature changes report models, generated reports, and CI evidence preservation, so unit/report validation and gate validation are required.

**Fork drift**: Only `.github/workflows/evaluation.yml` may be touched outside `evaluation/`, and only to generate/upload the new report.

## Phase 1: Setup

**Purpose**: Establish the feature docs and active Speckit context.

- [x] T001 Create 010 spec, plan, research, data model, contracts, and quickstart under `evaluation/specs/010-ci-health-trends/`
- [x] T002 Update active feature pointer in `.specify/feature.json`
- [x] T003 Update active plan pointer in `AGENTS.md`

---

## Phase 2: Foundational

**Purpose**: Define shared report paths and test inventory classification before user-story implementation.

- [x] T004 Create test meaningfulness config in `evaluation/config/test-meaningfulness.config.json`
- [x] T005 [P] Add test inventory model skeleton in `evaluation/lib/test-meaningfulness-model.mjs`
- [x] T006 [P] Add test meaningfulness report renderer skeleton in `evaluation/lib/test-meaningfulness-report.mjs`
- [x] T007 [P] Add CLI skeleton in `evaluation/bin/generate-test-meaningfulness.mjs`

**Checkpoint**: Foundational report structure exists and can be tested.

---

## Phase 3: User Story 1 - Review Run Health Trends (Priority: P1) MVP

**Goal**: Run health includes trend evidence from selected readable runs.

**Independent Test**: Generate a run health model from fixture runs and verify trend summary fields and rendered Markdown.

### Tests for User Story 1

- [x] T008 [P] [US1] Add trend summary model assertions in `evaluation/tests/unit/run-health-model.test.mjs`
- [x] T009 [P] [US1] Add trend summary report assertions in `evaluation/tests/unit/run-health-report.test.mjs`

### Implementation for User Story 1

- [x] T010 [US1] Add trend summary construction to `evaluation/lib/run-health-model.mjs`
- [x] T011 [US1] Render trend summary in `evaluation/lib/run-health-report.mjs`
- [x] T012 [US1] Regenerate `evaluation/reports/run-health.md`

**Checkpoint**: Run health trends work independently.

---

## Phase 4: User Story 2 - Understand Meaningful Test Coverage (Priority: P2)

**Goal**: Generate a report that counts and classifies meaningful tests.

**Independent Test**: Generate the report and verify layer/source/category counts plus weak-signal behavior.

### Tests for User Story 2

- [x] T013 [P] [US2] Add test inventory model tests in `evaluation/tests/unit/test-meaningfulness-model.test.mjs`
- [x] T014 [P] [US2] Add report rendering assertions in `evaluation/tests/unit/test-meaningfulness-report.test.mjs`

### Implementation for User Story 2

- [x] T015 [US2] Implement deterministic test scanning and classification in `evaluation/lib/test-meaningfulness-model.mjs`
- [x] T016 [US2] Implement Markdown rendering in `evaluation/lib/test-meaningfulness-report.mjs`
- [x] T017 [US2] Implement CLI output writing in `evaluation/bin/generate-test-meaningfulness.mjs`
- [x] T018 [US2] Add generated report `evaluation/reports/test-meaningfulness.md`
- [x] T019 [US2] Add new unit tests to the unit layer in `evaluation/config/evaluation.config.json`

**Checkpoint**: Meaningfulness report answers how much executable evidence exists.

---

## Phase 5: User Story 3 - Preserve CI Evidence (Priority: P3)

**Goal**: CI uploads both generated reports with evaluation evidence.

**Independent Test**: Inspect workflow and verify always-run report generation and upload paths include the new report.

### Implementation for User Story 3

- [x] T020 [US3] Add always-run test meaningfulness report generation to `.github/workflows/evaluation.yml`
- [x] T021 [US3] Add `evaluation/reports/test-meaningfulness.md` to workflow artifact upload paths in `.github/workflows/evaluation.yml`
- [x] T022 [US3] Update `evaluation/README.md` with trend and test meaningfulness report guidance

**Checkpoint**: CI preserves both reports without changing fork-scope guard.

---

## Phase 6: Polish & Validation

**Purpose**: Validate the complete feature and document the test inventory result.

- [x] T023 Run Prettier check for `.github/workflows/evaluation.yml`, `AGENTS.md`, `.specify/feature.json`, and `evaluation/`
- [x] T024 Run focused unit tests for run health and test meaningfulness reports
- [x] T025 Run `node evaluation/bin/generate-test-meaningfulness.mjs`
- [x] T026 Run `node evaluation/bin/generate-run-health.mjs`
- [x] T027 Run `node evaluation/bin/run-evaluation.mjs --mode gate`
- [x] T028 Review `git diff --name-only` to confirm no product source, product fixtures, root E2E tests, root Playwright config, or root package scripts changed
- [x] T029 Update task checkboxes in `evaluation/specs/010-ci-health-trends/tasks.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Complete
- **Foundational (Phase 2)**: Blocks user stories
- **US1 (Phase 3)**: Depends on Foundational
- **US2 (Phase 4)**: Depends on Foundational
- **US3 (Phase 5)**: Depends on US2 CLI/report path
- **Polish (Phase 6)**: Depends on desired user stories

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational
- **User Story 2 (P2)**: Can start after Foundational
- **User Story 3 (P3)**: Depends on User Story 2 report generation

### Parallel Opportunities

- T005, T006, and T007 can be created in parallel after T004.
- T008 and T009 can be written in parallel.
- T013 and T014 can be written in parallel.

## Implementation Strategy

### MVP First

1. Add run health trend model and report tests.
2. Implement trend summary.
3. Regenerate run health and validate.

### Incremental Delivery

1. Add trend evidence.
2. Add test meaningfulness inventory.
3. Preserve the new report in CI artifacts.
4. Run gate validation.

### Safety Rules

- Do not edit product source, product fixtures, root E2E tests, root Playwright config, or root package scripts.
- Do not commit `evaluation/runs/`.
- Do not add repair behavior.
- Do not require network or GitHub artifact history for local report generation.
