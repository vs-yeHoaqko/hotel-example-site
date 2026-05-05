# Tasks: Feature Coverage Matrix

**Input**: Design documents from `evaluation/specs/013-feature-coverage-matrix/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Include focused Node test runner coverage for model/report behavior and
generator integration because this feature changes evaluation harness output.

**Fork drift**: Product source, product fixtures, root package scripts, root
Playwright configuration, root E2E source files, and upstream push behavior are
out of scope. The only planned outside-`evaluation/` code change is the
additive `.github/workflows/evaluation.yml` artifact/report wiring. Non-runtime
Speckit pointer documentation may touch `AGENTS.md` and `.specify/feature.json`.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel because it touches different files or depends
  only on completed earlier phases
- **[Story]**: Maps a task to a user story from `spec.md`
- Every task names the exact target file or command

## Compliance Map

| Tasks     | Constitution support    | Test layer or evidence surface                    | Completion evidence                                      |
| --------- | ----------------------- | ------------------------------------------------- | -------------------------------------------------------- |
| T001-T004 | I, III, VI              | evaluation report generation                      | config and generator files exist with valid boundaries   |
| T005-T010 | III, VI, VII            | unit tests for model/report shell                 | focused unit tests exercise config and required sections |
| T011-T018 | III, VI, VII            | latest run evidence, full E2E, smoke, integration | focused unit tests and generated matrix MVP              |
| T019-T025 | IV, VI, VIII            | unit, integration, smoke, full E2E ownership      | matrix rows list owner layers and lower-layer evidence   |
| T026-T035 | III, VI, VII, IX        | warnings, unmapped evidence, CI evidence links    | focused unit tests, generated warnings, CI artifact refs |
| T036-T042 | III, VI, IX, Governance | documentation, gate, validation evidence          | README, local reports, gate result, boundary review      |

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add the stable configuration and executable entry points used by
all matrix stories.

- [x] T001 Create `evaluation/config/feature-coverage.config.json` with
      schemaVersion, reportPath, source config paths, and initial feature rows
      for login, signup, plans, mypage, redirection, reservation, smoke
      reservation completion, reservation form behavior, and billing
      calculation.
- [x] T002 Create CLI skeleton
      `evaluation/bin/generate-feature-coverage-matrix.mjs` that reads the
      config, builds the model, renders the report, and writes
      `evaluation/reports/feature-coverage-matrix.md`.
- [x] T003 [P] Create model module skeleton
      `evaluation/lib/feature-coverage-model.mjs` exporting the public builder
      used by the CLI.
- [x] T004 [P] Create report module skeleton
      `evaluation/lib/feature-coverage-report.mjs` exporting the Markdown
      renderer used by the CLI.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish reusable parsing and validation behavior before user
story implementation.

**CRITICAL**: No user story work should begin until config loading, evidence
normalization, and report writing contracts are in place.

- [x] T005 [P] Add config validation tests for schema version, path boundary,
      duplicate feature ids, and missing evidence matchers in
      `evaluation/tests/unit/feature-coverage-model.test.mjs`.
- [x] T006 Implement config loading and validation in
      `evaluation/lib/feature-coverage-model.mjs` for
      `evaluation/config/feature-coverage.config.json`.
- [x] T007 Implement repository-relative path normalization helpers in
      `evaluation/lib/feature-coverage-model.mjs` for report paths and evidence
      paths.
- [x] T008 Add feature coverage unit test files to
      `evaluation/config/evaluation.config.json` so focused evaluation runs can
      include the new harness coverage.
- [x] T009 [P] Add a renderer smoke test for required Markdown sections in
      `evaluation/tests/unit/feature-coverage-report.test.mjs`.
- [x] T010 Implement required section rendering in
      `evaluation/lib/feature-coverage-report.mjs` for Metadata, Summary,
      Matrix, Unmapped Evidence, and Warnings.

**Checkpoint**: Configuration and report shells can be validated without latest
run evidence.

---

## Phase 3: User Story 1 - Review Function Status at a Glance (Priority: P1) - MVP

**Goal**: Generate one human-readable matrix showing each evaluated function or
journey and its latest status.

**Independent Test**: Generate the matrix from fixture or latest evidence and
verify rows for login, signup, plans, mypage, redirection, reservation, smoke
reservation completion, reservation form behavior, and billing calculation all
show status, layer, evidence, and notes.

### Tests for User Story 1

- [x] T011 [P] [US1] Add latest-passing evidence test cases in
      `evaluation/tests/unit/feature-coverage-model.test.mjs` covering all
      configured feature rows.
- [x] T012 [P] [US1] Add latest-failing evidence test cases in
      `evaluation/tests/unit/feature-coverage-model.test.mjs` verifying failed,
      timed out, or interrupted evidence produces `fail` rows.
- [x] T013 [P] [US1] Add row status and summary rendering assertions in
      `evaluation/tests/unit/feature-coverage-report.test.mjs`.

### Implementation for User Story 1

- [x] T014 [US1] Implement latest run discovery in
      `evaluation/lib/feature-coverage-model.mjs` using existing evaluation run
      summaries and per-run artifact paths.
- [x] T015 [US1] Implement Playwright JSON result extraction for full E2E,
      smoke, and integration evidence in
      `evaluation/lib/feature-coverage-model.mjs`, reusing existing helpers
      where practical.
- [x] T016 [US1] Implement feature row status aggregation in
      `evaluation/lib/feature-coverage-model.mjs` with `pass`, `fail`, `warn`,
      and `unknown` semantics from the report contract.
- [x] T017 [US1] Implement matrix table rendering in
      `evaluation/lib/feature-coverage-report.mjs` with function or journey,
      category, layer, status, evidence, and notes columns.
- [x] T018 [US1] Complete
      `evaluation/bin/generate-feature-coverage-matrix.mjs` so it writes
      `evaluation/reports/feature-coverage-matrix.md` and exits non-zero only
      for unrecoverable config or write errors.

**Checkpoint**: User Story 1 is independently usable as the first matrix MVP.

---

## Phase 4: User Story 2 - Trace Functions to Test Layers (Priority: P2)

**Goal**: Show which test layer and evidence path prove each function or
journey, including ownership and lower-layer evidence.

**Independent Test**: Inspect the matrix and verify each row lists at least one
evidence source, layer, and test count or an explicit missing-evidence note,
while existing ownership records remain visible.

### Tests for User Story 2

- [x] T019 [P] [US2] Add ownership evidence tests in
      `evaluation/tests/unit/feature-coverage-model.test.mjs` for billing,
      reservation form behavior, and localized reservation completion.
- [x] T020 [P] [US2] Add multiple-layer evidence tests in
      `evaluation/tests/unit/feature-coverage-model.test.mjs` verifying direct
      lower-layer evidence stays visible beside broad E2E evidence.
- [x] T021 [P] [US2] Add report assertions in
      `evaluation/tests/unit/feature-coverage-report.test.mjs` for owner layer,
      evidence count, and additional evidence notes.

### Implementation for User Story 2

- [x] T022 [US2] Load latest `ownership.json` evidence in
      `evaluation/lib/feature-coverage-model.mjs` and attach owner-layer
      evidence to matching configured rows.
- [x] T023 [US2] Integrate test meaningfulness inventory from
      `evaluation/lib/test-meaningfulness-model.mjs` into
      `evaluation/lib/feature-coverage-model.mjs` to add discovered test counts
      and meaningful assertion counts.
- [x] T024 [US2] Implement layer precedence and direct-evidence selection in
      `evaluation/lib/feature-coverage-model.mjs` while preserving additional
      evidence references.
- [x] T025 [US2] Render owner layer, direct evidence, and additional evidence
      details in `evaluation/lib/feature-coverage-report.mjs`.

**Checkpoint**: User Story 2 makes coverage layer ownership reviewable without
reading raw run artifacts.

---

## Phase 5: User Story 3 - Make Coverage Gaps and Ambiguity Visible (Priority: P3)

**Goal**: Show weak, unknown, and unmapped coverage so maintainers can plan the
next harness improvement.

**Independent Test**: Generate the matrix from fixture evidence with missing
ownership, missing latest results, weak-signal tests, and historical health
warnings; verify unknown and warning rows are visible.

### Tests for User Story 3

- [x] T026 [P] [US3] Add missing-evidence and malformed-evidence tests in
      `evaluation/tests/unit/feature-coverage-model.test.mjs` verifying rows
      become `unknown` with clear notes.
- [x] T027 [P] [US3] Add unmapped evidence tests in
      `evaluation/tests/unit/feature-coverage-model.test.mjs` verifying
      discovered but unmapped test files are reported.
- [x] T028 [P] [US3] Add weak-signal and run-health warning tests in
      `evaluation/tests/unit/feature-coverage-model.test.mjs` verifying warnings
      do not override latest failures.
- [x] T029 [P] [US3] Add CI summary matrix-reference tests in
      `evaluation/tests/unit/ci-gate-summary-model.test.mjs`.

### Implementation for User Story 3

- [x] T030 [US3] Implement unmapped evidence collection in
      `evaluation/lib/feature-coverage-model.mjs` for discovered latest result
      files and meaningfulness records that do not match configured rows.
- [x] T031 [US3] Implement weak-signal warning integration in
      `evaluation/lib/feature-coverage-model.mjs` using the test
      meaningfulness model.
- [x] T032 [US3] Implement historical run-health warning notes in
      `evaluation/lib/feature-coverage-model.mjs` using run-health evidence as
      warning context only.
- [x] T033 [US3] Render `## Unmapped Evidence` and `## Warnings` details in
      `evaluation/lib/feature-coverage-report.mjs`.
- [x] T034 [US3] Add optional matrix report reference handling to
      `evaluation/lib/ci-gate-summary-model.mjs` so
      `evaluation/reports/feature-coverage-matrix.md` appears as warning-level
      evidence when present or missing.
- [x] T035 [US3] Wire `.github/workflows/evaluation.yml` to run
      `node evaluation/bin/generate-feature-coverage-matrix.mjs` and upload
      `evaluation/reports/feature-coverage-matrix.md` with the evaluation
      reports artifact.

**Checkpoint**: User Story 3 exposes mapping gaps and warnings without making
historical warnings hard failures.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validate the full flow, update human-facing docs, and verify fork
boundaries.

- [x] T036 [P] Update `README.md` with the feature coverage matrix command,
      output path, and reviewer interpretation guidance.
- [x] T037 [P] Update `evaluation/specs/013-feature-coverage-matrix/quickstart.md`
      if final command ordering differs from the design draft.
- [x] T038 Run `node node_modules\prettier\bin\prettier.cjs --check AGENTS.md README.md .github\workflows\evaluation.yml evaluation\config\feature-coverage.config.json evaluation\specs\013-feature-coverage-matrix\*.md evaluation\specs\013-feature-coverage-matrix\contracts\*.md evaluation\bin\generate-feature-coverage-matrix.mjs evaluation\lib\feature-coverage-model.mjs evaluation\lib\feature-coverage-report.mjs evaluation\lib\ci-gate-summary-model.mjs evaluation\tests\unit\feature-coverage-model.test.mjs evaluation\tests\unit\feature-coverage-report.test.mjs evaluation\tests\unit\ci-gate-summary-model.test.mjs`.
- [x] T039 Run focused unit validation with
      `node --test evaluation/tests/unit/feature-coverage-model.test.mjs evaluation/tests/unit/feature-coverage-report.test.mjs evaluation/tests/unit/ci-gate-summary-model.test.mjs`.
- [x] T040 Generate local reports with
      `node evaluation/bin/generate-run-health.mjs`,
      `node evaluation/bin/generate-test-meaningfulness.mjs`,
      `node evaluation/bin/generate-feature-coverage-matrix.mjs`,
      `node evaluation/bin/generate-quality-gate.mjs`, and
      `node evaluation/bin/generate-ci-gate-summary.mjs`.
- [x] T041 Run gate validation with
      `node evaluation/bin/run-evaluation.mjs --mode gate`.
- [x] T042 Review `git diff --name-only` and `git remote -v` to confirm no
      product/root E2E/root script/root Playwright/upstream push changes were
      introduced.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup and blocks all user stories.
- **User Story 1 (Phase 3)**: Depends on Foundational and is the MVP.
- **User Story 2 (Phase 4)**: Depends on Foundational; can follow US1 because
  it enriches the same matrix rows.
- **User Story 3 (Phase 5)**: Depends on Foundational; can be implemented after
  US1/US2 so warnings can attach to existing rows.
- **Polish (Phase 6)**: Depends on implemented target stories.

### User Story Dependencies

- **US1 (P1)**: No dependencies on US2 or US3.
- **US2 (P2)**: Adds ownership and layer traceability to US1 rows.
- **US3 (P3)**: Adds missing, weak, and unmapped evidence handling to the full
  matrix.

### Parallel Opportunities

- T003 and T004 can run in parallel after T001/T002 decisions are clear.
- T005 and T009 can be written in parallel before model/report implementation.
- US1 tests T011, T012, and T013 can be written in parallel.
- US2 tests T019, T020, and T021 can be written in parallel.
- US3 tests T026, T027, T028, and T029 can be written in parallel.
- Documentation T036 and quickstart T037 can run in parallel with final
  validation once behavior is stable.

---

## Parallel Example: User Story 1

```text
Task: "T011 [P] [US1] Add latest-passing evidence test cases in evaluation/tests/unit/feature-coverage-model.test.mjs"
Task: "T012 [P] [US1] Add latest-failing evidence test cases in evaluation/tests/unit/feature-coverage-model.test.mjs"
Task: "T013 [P] [US1] Add row status and summary rendering assertions in evaluation/tests/unit/feature-coverage-report.test.mjs"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 setup.
2. Complete Phase 2 foundational validation and rendering shell.
3. Complete Phase 3 so the report can answer pass/fail/warn/unknown by
   function or journey from latest evidence.
4. Stop and validate with focused unit tests plus
   `node evaluation/bin/generate-feature-coverage-matrix.mjs`.

### Incremental Delivery

1. Deliver US1 for a readable latest-status matrix.
2. Add US2 so each row shows proving layer and ownership evidence.
3. Add US3 so missing, weak, and unmapped evidence is visible.
4. Run full local validation and review fork boundaries.

### Boundary Strategy

1. Keep all implementation and generated stable reports under `evaluation/`
   except the additive `.github/workflows/evaluation.yml` CI wiring.
2. Do not edit product source, product fixtures, root package scripts, root
   Playwright configuration, or root E2E source files.
3. Verify `upstream` push remains disabled before push or PR work.
