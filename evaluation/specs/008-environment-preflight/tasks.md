# Tasks: Environment Preflight And CI Run Health Artifacts

**Input**: Design documents from
`evaluation/specs/008-environment-preflight/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`,
`contracts/environment-preflight-contract.md`, `quickstart.md`

**Tests**: Tests are required because the feature adds a new gate layer,
machine-readable evidence, run-health rendering, and CI artifact behavior.

**Fork drift**: Product source, product fixtures, root E2E tests, root
Playwright config, and root package scripts are out of scope. Outside
`evaluation/` edits are limited to `.specify/feature.json`, `AGENTS.md`, and
the existing fork-scoped `.github/workflows/evaluation.yml`.

**Organization**: Tasks are grouped by user story so each story can be
implemented and validated independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel because it touches different files and does not
  depend on an incomplete task
- **[Story]**: Maps to the user story from `spec.md`
- Every task names exact repository paths

## Phase 1: Setup

**Purpose**: Confirm the implementation boundary and add the new layer shape.

- [x] T001 Confirm planned outside-`evaluation/` edits are limited to `.specify/feature.json`, `AGENTS.md`, and `.github/workflows/evaluation.yml` by reviewing `evaluation/specs/008-environment-preflight/plan.md`
- [x] T002 Add the `environment` layer before existing layers in `evaluation/config/evaluation.config.json`
- [x] T003 [P] Document preflight and CI run-health artifact behavior in `evaluation/README.md`
- [x] T004 [P] Document bounded local full E2E worker policy in `evaluation/README.md`

---

## Phase 2: Foundational

**Purpose**: Build reusable preflight logic and evidence rendering before wiring
it into the gate.

**CRITICAL**: No CI workflow change should be finalized until the preflight and
run-health model tests exist.

- [x] T005 [P] Add preflight unit tests for passing checks, simulated spawn failure, and artifact shape in `evaluation/tests/unit/environment-preflight.test.mjs`
- [x] T006 [P] Add run-health unit tests for preflight artifact parsing, environment evidence extraction, and no-environment wording in `evaluation/tests/unit/run-health-model.test.mjs`
- [x] T007 [P] Add run-health renderer tests for the preflight evidence section and environment evidence empty state in `evaluation/tests/unit/run-health-report.test.mjs`
- [x] T008 Implement reusable preflight checks in `evaluation/lib/environment-preflight.mjs`
- [x] T009 Add CLI entrypoint and artifact writing in `evaluation/bin/check-environment.mjs`
- [x] T010 Run focused foundational tests with `node --test evaluation/tests/unit/environment-preflight.test.mjs evaluation/tests/unit/run-health-model.test.mjs evaluation/tests/unit/run-health-report.test.mjs`

**Checkpoint**: Preflight checks and run-health rendering can be verified with
fixtures before the gate layer is exercised.

---

## Phase 3: User Story 1 - Detect Environment Problems Before Main Evaluation (Priority: P1) MVP

**Goal**: Run a lightweight environment preflight before product/test behavior
layers and classify failures as environment evidence.

**Independent Test**: Run `node evaluation/bin/check-environment.mjs` and
`node evaluation/bin/run-evaluation.mjs --mode gate`; verify the `environment`
layer appears before `static` and passes on a healthy local environment.

### Tests for User Story 1

- [x] T011 [P] [US1] Add command-executor artifact collection assertions for `environment` layer artifacts in `evaluation/tests/unit/environment-preflight.test.mjs`
- [x] T012 [P] [US1] Add config validation coverage for the `environment` layer in `evaluation/tests/unit/environment-preflight.test.mjs`

### Implementation for User Story 1

- [x] T013 [US1] Include `artifacts/environment-preflight.json` for the `environment` layer in `evaluation/lib/command-executor.mjs`
- [x] T014 [US1] Ensure diagnostics treat the `environment` layer as gate-owned environment evidence in `evaluation/lib/diagnostics.mjs`
- [x] T015 [US1] Run `node evaluation/bin/check-environment.mjs` and confirm it completes under 10 seconds without starting the product app
- [x] T016 [US1] Run `node evaluation/bin/run-evaluation.mjs --mode gate` and confirm the preflight layer appears first in the generated summary

**Checkpoint**: User Story 1 is complete when a healthy environment passes
preflight and a failed preflight would stop later required layers as
environment evidence.

---

## Phase 4: User Story 2 - Preserve Environment Evidence In Run Health Reports (Priority: P2)

**Goal**: Make preflight pass/fail evidence visible in run-health reports and
separate it from product/test instability.

**Independent Test**: Generate run-health from fixture preflight artifacts and
verify preflight evidence, environment evidence, and no-environment wording.

### Tests for User Story 2

- [x] T017 [P] [US2] Add fixture coverage for failed preflight checks in `evaluation/tests/unit/run-health-model.test.mjs`
- [x] T018 [P] [US2] Add renderer assertions for preflight artifacts and no-environment evidence wording in `evaluation/tests/unit/run-health-report.test.mjs`

### Implementation for User Story 2

- [x] T019 [US2] Parse `environment-preflight.json` separately from Playwright JSON in `evaluation/lib/run-health-model.mjs`
- [x] T020 [US2] Add preflight evidence and no-environment-evidence state to `evaluation/lib/run-health-model.mjs`
- [x] T021 [US2] Render preflight evidence and explicit no-environment wording in `evaluation/lib/run-health-report.mjs`
- [x] T022 [US2] Regenerate `evaluation/reports/run-health.md` from current local run evidence

**Checkpoint**: User Story 2 is complete when run-health reports preflight
artifacts and does not confuse environment evidence with flaky/product
evidence.

---

## Phase 5: User Story 3 - Publish CI Health Artifacts (Priority: P3)

**Goal**: Make CI upload run-health output together with evaluation run
evidence, even after failures.

**Independent Test**: Inspect `.github/workflows/evaluation.yml` and verify
run-health generation uses `if: always()` and artifact upload includes the
report path.

### Tests for User Story 3

- [x] T023 [P] [US3] Add documentation checks by reviewing `evaluation/README.md` for CI artifact interpretation guidance

### Implementation for User Story 3

- [x] T024 [US3] Add an always-run run-health generation step after evaluation in `.github/workflows/evaluation.yml`
- [x] T025 [US3] Add `evaluation/reports/run-health.md` to the workflow upload artifact paths in `.github/workflows/evaluation.yml`
- [x] T026 [US3] Confirm the workflow remains fork-scoped with `github.repository == 'vs-yeHoaqko/hotel-example-site'`
- [x] T027 [US3] Align local full E2E worker policy with CI in `evaluation/config/playwright.full.config.mjs`
- [x] T028 [US3] Remove non-essential popup-close wait from the evaluation-local smoke reservation completion test in `evaluation/tests/e2e/smoke.spec.mjs`

**Checkpoint**: User Story 3 is complete when CI preserves run-health output as
part of uploaded evaluation evidence without changing upstream push behavior.

---

## Phase 6: Polish & Cross-Cutting Validation

**Purpose**: Validate the complete feature and confirm fork-drift boundaries.

- [x] T029 Update `evaluation/config/evaluation.config.json` so the unit layer runs `evaluation/tests/unit/environment-preflight.test.mjs`
- [x] T030 Run Prettier check with `node node_modules/prettier/bin/prettier.cjs --check .github/workflows/evaluation.yml evaluation/specs/008-environment-preflight evaluation/bin evaluation/config evaluation/lib evaluation/tests evaluation/reports evaluation/README.md`
- [x] T031 Run focused unit tests with `node --test evaluation/tests/unit/environment-preflight.test.mjs evaluation/tests/unit/run-health-model.test.mjs evaluation/tests/unit/run-health-report.test.mjs`
- [x] T032 Run report generation with `node evaluation/bin/generate-run-health.mjs`
- [x] T033 Run the default evaluation gate with `node evaluation/bin/run-evaluation.mjs --mode gate`
- [x] T034 Run full validation with `node evaluation/bin/run-evaluation.mjs --mode full`
- [x] T035 Confirm generated `evaluation/runs/` artifacts remain ignored and uncommitted with `git status --short --ignored evaluation/runs`
- [x] T036 Review `git diff --name-only` to confirm no product source, product fixtures, root E2E tests, root Playwright config, root package scripts, or upstream push-path changes
- [x] T037 Review `evaluation/specs/008-environment-preflight/spec.md`, `evaluation/specs/008-environment-preflight/plan.md`, and `evaluation/specs/008-environment-preflight/tasks.md` for consistency after implementation
- [x] T038 Confirm `evaluation/config/playwright.full.config.mjs` changes only evaluation-local worker policy and does not change root E2E assertions, retries, or timeouts

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: Depends on Setup and blocks all user stories
- **US1 (Phase 3)**: Depends on Foundational and is the MVP
- **US2 (Phase 4)**: Depends on Foundational and consumes preflight artifacts
- **US3 (Phase 5)**: Depends on US2 report generation command existing
- **Polish (Phase 6)**: Depends on all user stories

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational
- **User Story 2 (P2)**: Can start after Foundational but final report depends
  on US1 artifact paths
- **User Story 3 (P3)**: Depends on the run-health command and report path

### Parallel Opportunities

- T003 can run in parallel with T002 after boundary review.
- T004, T005, and T006 can be written in parallel.
- T010 and T011 can be written in parallel.
- T016 and T017 can be written in parallel.

---

## Implementation Strategy

### MVP First

1. Add the preflight library/CLI and unit tests.
2. Add the `environment` layer and artifact path.
3. Run `gate` and inspect the generated summary.

### Incremental Delivery

1. Make preflight evidence reliable locally.
2. Teach run-health to render preflight/environment evidence.
3. Publish run-health from CI.
4. Run `gate` and `full`.

### Safety Rules

- Do not edit product source, product fixtures, root E2E tests, root Playwright
  config, or root package scripts.
- Do not change timeout values for existing layers.
- Do not add product-test retries, flaky marking, skipping, E2E thinning, or
  repair behavior.
- Keep CI changes inside the existing fork-scoped workflow.
- Do not commit generated `evaluation/runs/` artifacts.
