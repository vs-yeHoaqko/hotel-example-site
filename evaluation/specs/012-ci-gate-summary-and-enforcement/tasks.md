# Tasks: CI Gate Summary and Enforcement

**Input**: Design documents from `evaluation/specs/012-ci-gate-summary-and-enforcement/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/
**Tests**: Include model/report tests before implementation for each story.
**Fork drift**: Outside-`evaluation/` edits are limited to `.specify/feature.json`, `AGENTS.md`, and additive `.github/workflows/evaluation.yml` summary publication changes.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel because it touches different files and has no dependency on an incomplete task.
- **[Story]**: Maps to user stories from `spec.md`.
- Every task names exact file paths.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add shared CI-summary and enforcement entry points without changing product or root-suite E2E files.

- [x] T001 Add CI summary output path and required-evidence policy placeholders in `evaluation/config/quality-gate.config.json`
- [x] T002 [P] Create CI summary CLI skeleton in `evaluation/bin/generate-ci-gate-summary.mjs`
- [x] T003 [P] Create CI summary model skeleton in `evaluation/lib/ci-gate-summary-model.mjs`
- [x] T004 [P] Create CI summary report renderer skeleton in `evaluation/lib/ci-gate-summary-report.mjs`
- [x] T005 [P] Document that `evaluation/reports/ci-gate-summary.md` is committed guidance while `evaluation/runs/` remains ignored in `evaluation/specs/012-ci-gate-summary-and-enforcement/quickstart.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared policy parsing and latest-run evidence selection required before user stories.

**CRITICAL**: No user story work begins until quality-gate config loading and latest-run evidence selection are testable.

- [x] T006 [P] Add quality gate config tests for required evidence policy validation in `evaluation/tests/unit/quality-gate-model.test.mjs`
- [x] T007 [P] Add CI summary model tests for missing, partial, and complete input evidence in `evaluation/tests/unit/ci-gate-summary-model.test.mjs`
- [x] T008 Add required-evidence config loading and validation in `evaluation/lib/quality-gate-model.mjs`
- [x] T009 Add latest-run and report-path selection helpers in `evaluation/lib/ci-gate-summary-model.mjs`
- [x] T010 Add CI summary unit tests to the unit layer command in `evaluation/config/evaluation.config.json`

**Checkpoint**: Required evidence and CI summary inputs are ready for story work.

---

## Phase 3: User Story 1 - Read Gate Results Directly From CI (Priority: P1) MVP

**Goal**: Produce a concise CI-visible summary from the latest gate result and generated reports.

**Independent Test**: Run `node evaluation/bin/generate-ci-gate-summary.mjs` after standard report generation and verify `evaluation/reports/ci-gate-summary.md` shows status, mode, target, primary issue, recommended action, and report paths.

### Tests for User Story 1

- [x] T011 [P] [US1] Add CI summary model tests for pass, warn, fail, and unknown statuses in `evaluation/tests/unit/ci-gate-summary-model.test.mjs`
- [x] T012 [P] [US1] Add CI summary report rendering tests for result, primary issue, and evidence sections in `evaluation/tests/unit/ci-gate-summary-report.test.mjs`

### Implementation for User Story 1

- [x] T013 [US1] Implement CI summary model aggregation in `evaluation/lib/ci-gate-summary-model.mjs`
- [x] T014 [US1] Implement CI summary Markdown rendering in `evaluation/lib/ci-gate-summary-report.mjs`
- [x] T015 [US1] Implement CI summary generation command in `evaluation/bin/generate-ci-gate-summary.mjs`
- [x] T016 [US1] Generate committed review template output in `evaluation/reports/ci-gate-summary.md`
- [x] T017 [US1] Update `.github/workflows/evaluation.yml` to generate CI summary and append it to the GitHub Actions step summary

**Checkpoint**: User Story 1 makes the latest gate result readable from CI without downloading artifacts.

---

## Phase 4: User Story 2 - Enforce Safe Hard Failures (Priority: P2)

**Goal**: Fail the quality gate for missing required evidence, environment preflight failure, and required smoke-e2e failure while leaving advisory signals warning-only.

**Independent Test**: Run seeded quality-gate model tests and verify only fail-enforced conditions set final status to `fail`; timing, flaky, and meaningfulness cases remain `warn`.

### Tests for User Story 2

- [x] T018 [P] [US2] Add fail-enforced missing evidence tests in `evaluation/tests/unit/quality-gate-model.test.mjs`
- [x] T019 [P] [US2] Add environment and smoke-e2e required-layer failure tests in `evaluation/tests/unit/quality-gate-model.test.mjs`
- [x] T020 [P] [US2] Add warning-only threshold regression tests in `evaluation/tests/unit/quality-gate-model.test.mjs`
- [x] T021 [P] [US2] Add quality gate report tests showing fail-enforced policy reasons in `evaluation/tests/unit/quality-gate-report.test.mjs`

### Implementation for User Story 2

- [x] T022 [US2] Add required evidence and required layer policy entries in `evaluation/config/quality-gate.config.json`
- [x] T023 [US2] Implement required evidence findings in `evaluation/lib/quality-gate-model.mjs`
- [x] T024 [US2] Implement required environment and smoke-e2e layer findings in `evaluation/lib/quality-gate-model.mjs`
- [x] T025 [US2] Render fail-enforced policy reasons in `evaluation/lib/quality-gate-report.mjs`
- [x] T026 [US2] Regenerate `evaluation/reports/quality-gate.md` and `evaluation/reports/ci-gate-summary.md`

**Checkpoint**: User Story 2 blocks only evidence-integrity and required-smoke failures.

---

## Phase 5: User Story 3 - Preserve Fork-Local Boundaries (Priority: P3)

**Goal**: Keep the change isolated to evaluation-owned files and the smallest fork-local workflow update.

**Independent Test**: Review `git diff --name-only` and verify no product source, root package scripts, root Playwright config, root E2E files, or upstream push behavior changed.

### Tests for User Story 3

- [x] T027 [P] [US3] Add workflow summary path expectations to CI summary report tests in `evaluation/tests/unit/ci-gate-summary-report.test.mjs`
- [x] T028 [P] [US3] Add fork-boundary validation notes to quickstart verification in `evaluation/specs/012-ci-gate-summary-and-enforcement/quickstart.md`

### Implementation for User Story 3

- [x] T029 [US3] Update `.github/workflows/evaluation.yml` artifact paths to include `evaluation/reports/ci-gate-summary.md`
- [x] T030 [US3] Update `evaluation/README.md` with CI summary and hard-fail policy guidance
- [x] T031 [US3] Verify `.github/workflows/evaluation.yml` retains the existing fork-only `github.repository == 'vs-yeHoaqko/hotel-example-site'` guard
- [x] T032 [US3] Review `git diff --name-only` to confirm only `evaluation/`, `.github/workflows/evaluation.yml`, `.specify/feature.json`, and `AGENTS.md` changed
- [x] T033 [US3] Confirm `git remote -v` still shows `upstream` push disabled and no upstream push behavior changed

**Checkpoint**: User Story 3 preserves fork-local boundaries and documents review flow.

---

## Phase 6: Validation & Polish

**Purpose**: Validate the completed feature and update task status.

- [x] T034 Run Prettier check for `.github/workflows/evaluation.yml`, `AGENTS.md`, `.specify/feature.json`, and `evaluation/`
- [x] T035 Run focused unit tests for quality gate and CI summary files
- [x] T036 Run `node evaluation/bin/generate-run-health.mjs`
- [x] T037 Run `node evaluation/bin/generate-test-meaningfulness.mjs`
- [x] T038 Run `node evaluation/bin/generate-quality-gate.mjs`
- [x] T039 Run `node evaluation/bin/generate-ci-gate-summary.mjs`
- [x] T040 Run `node evaluation/bin/run-evaluation.mjs --mode gate`
- [x] T041 Run `node evaluation/bin/run-evaluation.mjs --mode collect-all`
- [x] T042 Update `evaluation/config/playwright.shared.mjs` webServer readiness timeout if gate reports slow first-time bundling
- [x] T043 Update `evaluation/README.md` with webServer readiness timeout guidance
- [x] T044 Review `git diff --name-only` for fork-drift boundaries
- [x] T045 Update task checkboxes in `evaluation/specs/012-ci-gate-summary-and-enforcement/tasks.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 Setup**: No dependencies.
- **Phase 2 Foundational**: Depends on Setup and blocks user stories.
- **US1 (P1)**: Depends on Foundational and is the MVP.
- **US2 (P2)**: Depends on Foundational and can be validated through quality gate model tests; final CI summary should include US1 output.
- **US3 (P3)**: Depends on US1 because workflow publication uses the CI summary output.
- **Phase 6 Validation**: Depends on selected user stories.

### User Story Dependencies

- **US1**: Can be completed independently after Foundational.
- **US2**: Can be developed after Foundational; it integrates with US1 through the generated CI summary.
- **US3**: Depends on US1 workflow summary publication and can be completed after the MVP.

### Parallel Opportunities

- T002-T004 can run in parallel.
- T006-T007 can run in parallel.
- T011-T012 can run in parallel.
- T018-T021 can run in parallel if editing the shared quality gate test file is coordinated by section.
- T027-T028 can run in parallel.

## Parallel Example: User Story 1

```text
Task: "Add CI summary model tests for pass, warn, fail, and unknown statuses in evaluation/tests/unit/ci-gate-summary-model.test.mjs"
Task: "Add CI summary report rendering tests for result, primary issue, and evidence sections in evaluation/tests/unit/ci-gate-summary-report.test.mjs"
```

## Implementation Strategy

### MVP First

1. Complete Phase 1 Setup.
2. Complete Phase 2 Foundational.
3. Complete US1 CI summary generation and workflow publication.
4. Validate `node evaluation/bin/generate-ci-gate-summary.mjs`.

### Incremental Delivery

1. Add CI summary from existing reports.
2. Add fail-enforced evidence integrity and required-layer policies.
3. Add workflow artifact and README guidance.
4. Validate the full gate and focused unit tests.

### Safety Rules

- Do not modify product source, product fixtures, root package scripts, root Playwright config, root E2E files, or upstream push behavior.
- Keep `.github/workflows/evaluation.yml` edits additive and inside the existing fork-guarded evaluation job.
- Keep `evaluation/runs/` ignored and uncommitted.
- Keep timing, flaky, slow-layer, and meaningfulness signals warning-only unless reviewed policy explicitly promotes them.
