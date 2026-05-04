# Tasks: Evaluation CI Gate

**Input**: Design documents from `evaluation/specs/005-evaluation-ci/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`,
`contracts/workflow-contract.md`, `quickstart.md`

**Tests**: Tests are included because CI wiring must be locally validated before
push-based GitHub validation.

**Organization**: Tasks are grouped by user story so each story can be
implemented and validated independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel because it touches different files and does not
  depend on an incomplete task
- **[Story]**: Maps to the user story from `spec.md`
- Every task names exact repository paths

## Phase 1: Setup

**Purpose**: Prepare the branch and fork-safety guardrails.

- [x] T001 Confirm worktree is clean before CI changes
- [x] T002 Disable local `upstream` push URL so pushes can only target `origin`
- [x] T003 Create branch `005-evaluation-ci`

---

## Phase 2: Foundational

**Purpose**: Establish the CI contract and workflow skeleton.

- [x] T004 [P] Create CI workflow contract in `evaluation/specs/005-evaluation-ci/contracts/workflow-contract.md`
- [x] T005 [P] Document workflow data model in `evaluation/specs/005-evaluation-ci/data-model.md`
- [x] T006 [P] Document implementation decisions in `evaluation/specs/005-evaluation-ci/research.md`
- [x] T007 Create quickstart validation steps in `evaluation/specs/005-evaluation-ci/quickstart.md`

---

## Phase 3: User Story 1 - See the Evaluation Gate on Fork Pull Requests (Priority: P1)

**Goal**: Fork pull requests run the evaluation gate automatically while other
repositories skip the job.

**Independent Test**: Validate the workflow file locally, push to `origin`, and
confirm the fork shows an evaluation gate run.

- [x] T008 [US1] Add `.github/workflows/evaluation.yml` with pull request and main push triggers
- [x] T009 [US1] Add job-level fork boundary guard in `.github/workflows/evaluation.yml`
- [x] T010 [US1] Configure read-only repository permissions in `.github/workflows/evaluation.yml`
- [x] T011 [US1] Configure dependency setup using the repository lockfile in `.github/workflows/evaluation.yml`
- [x] T012 [US1] Run `node node_modules/prettier/bin/prettier.cjs --check .github/workflows/evaluation.yml`

---

## Phase 4: User Story 2 - Preserve Evaluation Evidence from CI (Priority: P1)

**Goal**: Generated evaluation evidence is uploaded even when the gate fails.

**Independent Test**: Inspect the workflow and validate local gate output; push
to fork for artifact upload verification.

- [x] T013 [US2] Run `node evaluation/bin/run-evaluation.mjs --mode gate` in `.github/workflows/evaluation.yml`
- [x] T014 [US2] Upload `evaluation/runs/**` with always-run behavior in `.github/workflows/evaluation.yml`
- [x] T015 [US2] Document CI artifact usage in `evaluation/README.md`

---

## Phase 5: User Story 3 - Manually Run Heavier Modes (Priority: P2)

**Goal**: Maintainers can manually run `gate`, `full`, or `collect-all` in the
fork.

**Independent Test**: Push to fork and trigger `workflow_dispatch` with each
mode.

- [x] T016 [US3] Add `workflow_dispatch` inputs for `mode` and `target` in `.github/workflows/evaluation.yml`
- [x] T017 [US3] Pass manual mode and target choices to the evaluation command in `.github/workflows/evaluation.yml`
- [x] T018 [US3] Document manual CI run choices in `evaluation/README.md`

---

## Phase 6: Polish & Cross-Cutting Validation

**Purpose**: Verify the workflow and keep operational artifacts out of git.

- [x] T019 Run Prettier check for `.github/workflows/evaluation.yml`, `evaluation/specs/005-evaluation-ci`, and `evaluation/README.md`
- [x] T020 Run diagnostic unit tests with `node --test evaluation/tests/unit/diagnostics.test.mjs evaluation/tests/unit/playwright-diagnostics.test.mjs evaluation/tests/unit/diagnostic-guidance.test.mjs evaluation/tests/unit/failure-classifier.test.mjs evaluation/tests/unit/summary-schema.test.mjs`
- [x] T021 Run local evaluation gate with `node evaluation/bin/run-evaluation.mjs --mode gate`
- [x] T022 Confirm `evaluation/runs/` remains uncommitted with `git status --short --ignored evaluation/runs`
- [x] T023 Confirm `git remote -v` shows `upstream` push URL as `DISABLED`

---

## Dependencies & Execution Order

- Setup tasks must complete before workflow implementation.
- US1 and US2 are both P1 and share `.github/workflows/evaluation.yml`, so edit
  them sequentially.
- US3 depends on the workflow command shape from US1 and US2.
- Polish validation runs after all workflow and documentation changes.

## Implementation Strategy

1. Implement the smallest fork-only `gate` workflow.
2. Add artifact upload.
3. Add manual `full` and `collect-all` mode selection.
4. Validate locally.
5. Push only to `origin` for GitHub-side validation.
