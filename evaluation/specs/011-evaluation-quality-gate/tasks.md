# Tasks: Evaluation Quality Gate and Harness Hardening

**Input**: Design documents from `evaluation/specs/011-evaluation-quality-gate/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/
**Tests**: Include model/report tests before implementation for each story.
**Fork drift**: Outside-`evaluation/` edits are limited to `.specify/feature.json`, `AGENTS.md`, and additive `.github/workflows/evaluation.yml` report generation/upload changes.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel because it touches different files and has no dependency on an incomplete task.
- **[Story]**: Maps to user stories from `spec.md`.
- Every task names exact file paths.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add shared quality-gate and baseline entry points without changing product or root-suite E2E files.

- [x] T001 Create quality gate configuration in `evaluation/config/quality-gate.config.json`
- [x] T002 Create committed run health baseline in `evaluation/baselines/run-health-baseline.json`
- [x] T003 [P] Create quality gate CLI skeleton in `evaluation/bin/generate-quality-gate.mjs`
- [x] T004 [P] Create quality gate model skeleton in `evaluation/lib/quality-gate-model.mjs`
- [x] T005 [P] Create quality gate report renderer skeleton in `evaluation/lib/quality-gate-report.mjs`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared parsing, validation, and test registration required before story work.

**CRITICAL**: No user story work begins until config loading and unit-layer wiring exist.

- [x] T006 [P] Add quality gate model tests for config validation and threshold status calculation in `evaluation/tests/unit/quality-gate-model.test.mjs`
- [x] T007 [P] Add quality gate report tests for pass/warn/fail rendering in `evaluation/tests/unit/quality-gate-report.test.mjs`
- [x] T008 Add quality gate unit tests to the unit layer in `evaluation/config/evaluation.config.json`
- [x] T009 Add shared evidence-source helpers or exports needed by quality gate in `evaluation/lib/quality-gate-model.mjs`

**Checkpoint**: Quality gate config and test scaffolding are ready.

---

## Phase 3: User Story 1 - Turn Reports Into a Quality Gate (Priority: P1) MVP

**Goal**: Produce a deterministic quality gate result from existing run-health and test-meaningfulness evidence.

**Independent Test**: Run `node evaluation/bin/generate-quality-gate.mjs` against current reports and verify `evaluation/reports/quality-gate.md` shows final status, evidence sources, threshold findings, and recommended actions.

### Tests for User Story 1

- [x] T010 [P] [US1] Add threshold breach tests for weak-signal, discovered-test, and assertion-count metrics in `evaluation/tests/unit/quality-gate-model.test.mjs`
- [x] T011 [P] [US1] Add Markdown rendering tests for evidence sources, threshold findings, and recommended actions in `evaluation/tests/unit/quality-gate-report.test.mjs`

### Implementation for User Story 1

- [x] T012 [US1] Implement threshold evaluation and final status aggregation in `evaluation/lib/quality-gate-model.mjs`
- [x] T013 [US1] Implement Markdown report rendering in `evaluation/lib/quality-gate-report.mjs`
- [x] T014 [US1] Implement report generation and console summary in `evaluation/bin/generate-quality-gate.mjs`
- [x] T015 [US1] Generate committed quality gate report in `evaluation/reports/quality-gate.md`

**Checkpoint**: User Story 1 is independently usable as a local quality gate.

---

## Phase 4: User Story 2 - Compare Run Health Against a Baseline (Priority: P2)

**Goal**: Add stable baseline comparison to run health and feed regressions into the quality gate.

**Independent Test**: Generate run health with seeded baseline data and verify baseline findings classify improved, unchanged, regressed, missing, and new layers.

### Tests for User Story 2

- [x] T016 [P] [US2] Add baseline comparison tests in `evaluation/tests/unit/run-health-model.test.mjs`
- [x] T017 [P] [US2] Add baseline comparison rendering tests in `evaluation/tests/unit/run-health-report.test.mjs`
- [x] T018 [P] [US2] Add quality gate tests for baseline warning and fail-enforced findings in `evaluation/tests/unit/quality-gate-model.test.mjs`

### Implementation for User Story 2

- [x] T019 [US2] Load and validate `evaluation/baselines/run-health-baseline.json` from `evaluation/lib/run-health-model.mjs`
- [x] T020 [US2] Add baseline comparison data to the run health model in `evaluation/lib/run-health-model.mjs`
- [x] T021 [US2] Render baseline comparison in `evaluation/lib/run-health-report.mjs`
- [x] T022 [US2] Include baseline findings in quality gate evaluation in `evaluation/lib/quality-gate-model.mjs`
- [x] T023 [US2] Regenerate `evaluation/reports/run-health.md` and `evaluation/reports/quality-gate.md`

**Checkpoint**: User Story 2 can be validated without running the full browser suite.

---

## Phase 5: User Story 3 - Separate Product, Flaky, Environment, and Harness Failures (Priority: P3)

**Goal**: Improve diagnostic classification and recommended actions while keeping repair behavior non-mutating.

**Independent Test**: Evaluate representative diagnostic fixtures and verify product, flaky, environment, harness, and unknown categories are deterministic.

### Tests for User Story 3

- [x] T024 [P] [US3] Add failure classifier tests for product-regression, flaky, environment, harness-bug, and unknown evidence in `evaluation/tests/unit/failure-classifier.test.mjs`
- [x] T025 [P] [US3] Add diagnostic guidance tests for recommended actions and confidence wording in `evaluation/tests/unit/diagnostic-guidance.test.mjs`
- [x] T026 [P] [US3] Add quality gate diagnostic finding tests in `evaluation/tests/unit/quality-gate-model.test.mjs`

### Implementation for User Story 3

- [x] T027 [US3] Extend classification output in `evaluation/lib/failure-classifier.mjs`
- [x] T028 [US3] Extend advisory guidance in `evaluation/lib/diagnostic-guidance.mjs`
- [x] T029 [US3] Feed diagnostic findings into quality gate evaluation in `evaluation/lib/quality-gate-model.mjs`
- [x] T030 [US3] Render diagnostic findings in `evaluation/lib/quality-gate-report.mjs`

**Checkpoint**: User Story 3 gives actionable diagnostics without mutating files.

---

## Phase 6: User Story 4 - Execute E2E Thinning Safely (Priority: P4)

**Goal**: Produce reviewable thinning execution decisions without automatically modifying root-suite E2E files.

**Independent Test**: Generate thinning execution evidence and verify approved-to-thin requires lower-layer evidence, blocked lists missing coverage, deferred keeps rationale, and keep-e2e anchors remain intact.

### Tests for User Story 4

- [x] T031 [P] [US4] Add thinning execution state tests in `evaluation/tests/unit/thinning-decision-model.test.mjs`
- [x] T032 [P] [US4] Add migration candidate report tests for thinning execution output in `evaluation/tests/unit/migration-candidate-report.test.mjs`
- [x] T033 [P] [US4] Add quality gate thinning finding tests in `evaluation/tests/unit/quality-gate-model.test.mjs`

### Implementation for User Story 4

- [x] T034 [US4] Extend thinning decisions with execution states in `evaluation/config/thinning-decisions.config.json`
- [x] T035 [US4] Implement execution summary validation in `evaluation/lib/thinning-decision-model.mjs`
- [x] T036 [US4] Render thinning execution output in `evaluation/lib/migration-candidate-report.mjs`
- [x] T037 [US4] Update `evaluation/bin/generate-migration-candidates.mjs` to write `evaluation/reports/thinning-execution.md`
- [x] T038 [US4] Generate committed thinning execution report in `evaluation/reports/thinning-execution.md`
- [x] T039 [US4] Feed thinning findings into quality gate evaluation in `evaluation/lib/quality-gate-model.mjs`
- [x] T040 [US4] Review `git diff --name-only` to confirm no automatic root-suite E2E source edits were made

**Checkpoint**: User Story 4 produces actionable thinning decisions while preserving fork-drift boundaries.

---

## Phase 7: CI, Documentation, and Validation

**Purpose**: Preserve the new evidence in CI and validate the full feature.

- [x] T041 Update `.github/workflows/evaluation.yml` to always attempt `node evaluation/bin/generate-quality-gate.mjs`
- [x] T042 Update `.github/workflows/evaluation.yml` artifact upload paths to include `evaluation/reports/quality-gate.md` and `evaluation/reports/thinning-execution.md`
- [x] T043 Update `evaluation/README.md` with quality gate, baseline, diagnostics, and thinning execution guidance
- [x] T044 Run Prettier check for `.github/workflows/evaluation.yml`, `AGENTS.md`, `.specify/feature.json`, and `evaluation/`
- [x] T045 Run focused unit tests for quality gate, run health, diagnostics, and thinning decisions
- [x] T046 Run `node evaluation/bin/generate-run-health.mjs`
- [x] T047 Run `node evaluation/bin/generate-test-meaningfulness.mjs`
- [x] T048 Run `node evaluation/bin/generate-quality-gate.mjs`
- [x] T049 Run `node evaluation/bin/run-evaluation.mjs --mode gate`
- [x] T050 Review `git diff --name-only` to confirm no product source, product fixtures, root package scripts, root Playwright config, upstream push behavior, or automatic root-suite E2E edits changed
- [x] T051 Update task checkboxes in `evaluation/specs/011-evaluation-quality-gate/tasks.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 Setup**: No dependencies.
- **Phase 2 Foundational**: Depends on Setup.
- **US1 (P1)**: Depends on Foundational and is the MVP.
- **US2 (P2)**: Depends on US1 because baseline findings feed into quality gate.
- **US3 (P3)**: Depends on US1 because diagnostic findings feed into quality gate.
- **US4 (P4)**: Depends on US1 and existing thinning decisions.
- **Phase 7 Validation**: Depends on all implemented user stories.

### User Story Dependencies

- **US1**: Can be completed independently after Foundational.
- **US2**: Can be developed after US1, independent of US3 and US4.
- **US3**: Can be developed after US1, independent of US2 and US4.
- **US4**: Can be developed after US1, independent of US2 and US3.

### Parallel Opportunities

- T003-T005 can run in parallel.
- T006-T007 can run in parallel.
- T010-T011 can run in parallel.
- T016-T018 can run in parallel.
- T024-T026 can run in parallel.
- T031-T033 can run in parallel.

## Parallel Example: User Story 3

```text
Task: "Add failure classifier tests for product-regression, flaky, environment, harness-bug, and unknown evidence in evaluation/tests/unit/failure-classifier.test.mjs"
Task: "Add diagnostic guidance tests for recommended actions and confidence wording in evaluation/tests/unit/diagnostic-guidance.test.mjs"
Task: "Add quality gate diagnostic finding tests in evaluation/tests/unit/quality-gate-model.test.mjs"
```

## Implementation Strategy

### MVP First

1. Complete Setup and Foundational tasks.
2. Complete US1 quality gate from existing reports.
3. Validate `node evaluation/bin/generate-quality-gate.mjs`.

### Incremental Delivery

1. Add baseline comparison and feed it into the quality gate.
2. Add stronger failure classification and recommended actions.
3. Add thinning execution evidence without root-suite rewrites.
4. Add CI artifact preservation and documentation.

### Safety Rules

- Do not modify product source, product fixtures, root package scripts, root Playwright config, or upstream push behavior.
- Do not modify root-suite E2E files automatically.
- Keep `evaluation/runs/` ignored and uncommitted.
- If root-suite thinning is later approved, it must be a separate explicit task naming exact root-suite files and candidate ids.
