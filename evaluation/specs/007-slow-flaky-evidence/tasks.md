# Tasks: Slow and Flaky Evidence Report

**Input**: Design documents from
`evaluation/specs/007-slow-flaky-evidence/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`,
`contracts/run-health-report-contract.md`, `quickstart.md`

**Tests**: Tests are required because the feature adds a new evidence model,
report contract, malformed-input handling, and deterministic ranking.

**Fork drift**: Implementation tasks must stay under `evaluation/`. The only
outside-`evaluation/` files in scope are `.specify/feature.json` and
`AGENTS.md` as Speckit workflow metadata. Do not edit product source, root E2E
tests, root Playwright config, root package scripts, or CI triggers.

**Organization**: Tasks are grouped by user story so each story can be
implemented and validated independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel because it touches different files and does not
  depend on an incomplete task
- **[Story]**: Maps to the user story from `spec.md`
- Every task names exact repository paths

## Phase 1: Setup

**Purpose**: Add the explicit report policy and confirm the implementation
boundary before model work starts.

- [x] T001 Create slow/flaky report policy config in `evaluation/config/run-health.config.json`
- [x] T002 Confirm no root product, root E2E, root Playwright, root package script, or CI file is in the planned implementation set by reviewing `evaluation/specs/007-slow-flaky-evidence/plan.md`
- [x] T003 [P] Add initial documentation section for report generation and interpretation in `evaluation/README.md`

---

## Phase 2: Foundational

**Purpose**: Build the evidence reader and renderer interfaces that all user
stories depend on.

**CRITICAL**: No report CLI or generated report should be finalized until this
phase is complete.

- [x] T004 [P] Add run-health model unit tests for config validation, run selection, malformed summaries, and missing artifacts in `evaluation/tests/unit/run-health-model.test.mjs`
- [x] T005 [P] Add run-health report rendering unit tests for required sections, warnings, source paths, and no-flaky wording in `evaluation/tests/unit/run-health-report.test.mjs`
- [x] T006 Implement config loading, path validation, readable run discovery, and warning collection in `evaluation/lib/run-health-model.mjs`
- [x] T007 Implement deterministic Markdown rendering helpers and required report sections in `evaluation/lib/run-health-report.mjs`
- [x] T008 Run focused foundational tests with `node --test evaluation/tests/unit/run-health-model.test.mjs evaluation/tests/unit/run-health-report.test.mjs`

**Checkpoint**: The model can read fixture evidence, tolerate malformed input,
and render a deterministic report body without relying on product test runs.

---

## Phase 3: User Story 1 - Review Recent Run Health (Priority: P1) MVP

**Goal**: Generate a concise report that summarizes recent evaluation runs and
layer health without rerunning product tests.

**Independent Test**: Given fixture run summaries, generate the model and
verify selected runs, layer durations, classifications, dirty state, and source
paths appear in deterministic order.

### Tests for User Story 1

- [x] T009 [P] [US1] Add fixture coverage for latest-run selection and layer summaries in `evaluation/tests/unit/run-health-model.test.mjs`
- [x] T010 [P] [US1] Add renderer assertions for selected run and layer-health tables in `evaluation/tests/unit/run-health-report.test.mjs`

### Implementation for User Story 1

- [x] T011 [US1] Implement selected run summary extraction in `evaluation/lib/run-health-model.mjs`
- [x] T012 [US1] Implement layer health extraction, threshold comparison, and slow-layer ranking in `evaluation/lib/run-health-model.mjs`
- [x] T013 [US1] Render selected runs and slow layers in `evaluation/lib/run-health-report.mjs`
- [x] T014 [US1] Add report CLI with config and output options in `evaluation/bin/generate-run-health.mjs`
- [x] T015 [US1] Generate `evaluation/reports/run-health.md` with `node evaluation/bin/generate-run-health.mjs`

**Checkpoint**: User Story 1 is complete when the report can be generated from
existing run summaries and shows recent run/layer health without starting the
site or Playwright.

---

## Phase 4: User Story 2 - Identify Slow and Flaky Candidates (Priority: P2)

**Goal**: Rank slow Playwright test observations and separate instability
signals from environment evidence.

**Independent Test**: Use fixture Playwright JSON with slow, failed, retried,
timed-out, and environment-like evidence and verify deterministic ranking and
classification.

### Tests for User Story 2

- [x] T016 [P] [US2] Add fixture coverage for slow Playwright test ranking in `evaluation/tests/unit/run-health-model.test.mjs`
- [x] T017 [P] [US2] Add fixture coverage for retry, failed, timed-out, interrupted, and environment evidence in `evaluation/tests/unit/run-health-model.test.mjs`
- [x] T018 [P] [US2] Add renderer assertions for slow tests, instability evidence, and environment evidence in `evaluation/tests/unit/run-health-report.test.mjs`

### Implementation for User Story 2

- [x] T019 [US2] Implement Playwright JSON artifact traversal and per-test observation extraction in `evaluation/lib/run-health-model.mjs`
- [x] T020 [US2] Implement slow-test ranking and top-N truncation in `evaluation/lib/run-health-model.mjs`
- [x] T021 [US2] Implement instability and environment evidence extraction in `evaluation/lib/run-health-model.mjs`
- [x] T022 [US2] Render slow tests, instability evidence, environment evidence, and no-flaky wording in `evaluation/lib/run-health-report.mjs`
- [x] T023 [US2] Regenerate `evaluation/reports/run-health.md` from current local run evidence

**Checkpoint**: User Story 2 is complete when slow and unstable-looking
evidence is ranked deterministically and environment evidence is separated from
product/test behavior evidence.

---

## Phase 5: User Story 3 - Preserve Reviewable Guidance (Priority: P3)

**Goal**: Document how to regenerate and interpret the report and keep
operational run evidence out of Git.

**Independent Test**: A maintainer can read `evaluation/README.md` and
`evaluation/reports/run-health.md` to identify inputs, outputs, interpretation
rules, and Git tracking boundaries.

### Tests for User Story 3

- [x] T024 [P] [US3] Add renderer assertions for metadata, input artifact paths, and deterministic output order in `evaluation/tests/unit/run-health-report.test.mjs`
- [x] T025 [P] [US3] Add model assertions that generated `evaluation/runs/` evidence is read as input but never required as committed output in `evaluation/tests/unit/run-health-model.test.mjs`

### Implementation for User Story 3

- [x] T026 [US3] Update `evaluation/README.md` with run-health command, report sections, thresholds, and interpretation boundaries
- [x] T027 [US3] Ensure `evaluation/reports/run-health.md` includes selected run IDs, source summaries, artifact paths, warnings, and recommended review focus
- [x] T028 [US3] Confirm `evaluation/runs/` remains ignored and uncommitted with `git status --short --ignored evaluation/runs`

**Checkpoint**: User Story 3 is complete when report generation and
interpretation are documented and generated operational runs stay outside Git.

---

## Phase 6: Polish & Cross-Cutting Validation

**Purpose**: Validate the complete feature and confirm fork-drift boundaries.

- [x] T029 Update `evaluation/config/evaluation.config.json` so the unit layer runs `evaluation/tests/unit/run-health-model.test.mjs` and `evaluation/tests/unit/run-health-report.test.mjs`
- [x] T030 Run Prettier check with `node node_modules/prettier/bin/prettier.cjs --check evaluation/specs/007-slow-flaky-evidence evaluation/config evaluation/lib evaluation/tests evaluation/reports evaluation/README.md`
- [x] T031 Run focused unit tests with `node --test evaluation/tests/unit/run-health-model.test.mjs evaluation/tests/unit/run-health-report.test.mjs`
- [x] T032 Run report generation with `node evaluation/bin/generate-run-health.mjs` and confirm it completes under 10 seconds without running product tests
- [x] T033 Run the default evaluation gate with `node evaluation/bin/run-evaluation.mjs --mode gate`
- [x] T034 Run full validation with `node evaluation/bin/run-evaluation.mjs --mode full`
- [x] T035 Review `git diff --name-only` to confirm implementation changes avoid product source, root E2E, root Playwright config, root package scripts, and CI triggers
- [x] T036 Review `evaluation/specs/007-slow-flaky-evidence/spec.md`, `evaluation/specs/007-slow-flaky-evidence/plan.md`, and `evaluation/specs/007-slow-flaky-evidence/tasks.md` for consistency after implementation

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: Depends on Setup and blocks all user stories
- **US1 (Phase 3)**: Depends on Foundational and is the MVP
- **US2 (Phase 4)**: Depends on Foundational and reuses US1 run/layer model
- **US3 (Phase 5)**: Depends on US1/US2 report output
- **Polish (Phase 6)**: Depends on all selected user stories

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational
- **User Story 2 (P2)**: Can start after Foundational but final report output
  depends on US1 sections existing
- **User Story 3 (P3)**: Depends on the generated report shape from US1/US2

### Parallel Opportunities

- T003 can run in parallel with T001/T002 after the plan boundary is clear.
- T004 and T005 can be written in parallel.
- T009 and T010 can be written in parallel.
- T016, T017, and T018 can be written in parallel.
- T024 and T025 can be written in parallel.

---

## Parallel Example: User Story 2

```text
Task: "T016 [US2] Add fixture coverage for slow Playwright test ranking in evaluation/tests/unit/run-health-model.test.mjs"
Task: "T017 [US2] Add fixture coverage for retry, failed, timed-out, interrupted, and environment evidence in evaluation/tests/unit/run-health-model.test.mjs"
Task: "T018 [US2] Add renderer assertions for slow tests, instability evidence, and environment evidence in evaluation/tests/unit/run-health-report.test.mjs"
```

## Implementation Strategy

### MVP First

1. Complete Setup and Foundational tasks.
2. Complete User Story 1.
3. Stop and validate the generated report from existing run summaries before
   adding Playwright test observation ranking.

### Incremental Delivery

1. Add config, model, renderer, and unit tests.
2. Add run/layer health reporting.
3. Add Playwright slow/instability evidence.
4. Add documentation and generated stable report.
5. Run `gate` and `full`.

### Safety Rules

- Do not edit product source, root E2E files, root package scripts, root
  Playwright config, or GitHub Actions.
- Do not run product tests from `generate-run-health.mjs`.
- Do not mark tests flaky, skip tests, change timeouts, thin E2E assertions, or
  add repair behavior.
- Do not commit generated `evaluation/runs/` artifacts.
