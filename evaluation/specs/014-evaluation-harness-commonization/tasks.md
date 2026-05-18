# Tasks: Evaluation Harness Commonization

**Input**: Design documents from `evaluation/specs/014-evaluation-harness-commonization/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: This feature has no runtime behavior change. Validation tasks are
document contract review, requirements checklist review, Markdown/JSON
formatting, and boundary verification.

**Fork drift**: Product source, product fixtures, root package scripts, root
browser-test configuration, root E2E source files, runtime evaluation code, and
upstream push behavior are out of scope. Outside-`evaluation/` changes are
limited to `.specify/feature.json` and `AGENTS.md` active feature pointers.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel because it touches different files or depends
  only on completed earlier phases
- **[Story]**: Maps a task to a user story from `spec.md`
- Every task names the exact target file or command

## Compliance Map

| Tasks     | Constitution support | Evidence surface                             | Completion evidence                                      |
| --------- | -------------------- | -------------------------------------------- | -------------------------------------------------------- |
| T001-T005 | I, VI, IX            | planning documents and source inventory      | blueprint shell and source scope are reviewable          |
| T006-T010 | III, VI, IX          | shared classification and validation rules   | blueprint vocabulary and validation frame exist          |
| T011-T018 | III, VI, IX          | capability classification and stable outputs | every major harness surface is classified with rationale |
| T019-T024 | II, III, VI, VII     | onboarding workflow and evidence states      | each workflow step has inputs, outputs, checks, actions  |
| T025-T030 | IV, V, VI, VIII, IX  | readiness gates and decision records         | extraction/thinning/repair gates block unsafe work       |
| T031-T036 | I, III, VI, IX       | formatting, contracts, checklist, git status | validation commands and boundary review pass             |

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish the blueprint artifact and source scope used by all user
stories.

- [x] T001 Create `evaluation/specs/014-evaluation-harness-commonization/commonization-blueprint.md` with the required sections from `evaluation/specs/014-evaluation-harness-commonization/contracts/commonization-blueprint-contract.md`.
- [x] T002 Add `Scope And Non-Goals` to `evaluation/specs/014-evaluation-harness-commonization/commonization-blueprint.md`, explicitly excluding runtime extraction, package creation, product source changes, root E2E edits, root script edits, root browser-test configuration edits, upstream push changes, and repair automation.
- [x] T003 Add `Source Inventory` to `evaluation/specs/014-evaluation-harness-commonization/commonization-blueprint.md` covering `evaluation/README.md`, `evaluation/bin/`, `evaluation/lib/`, `evaluation/config/`, `evaluation/schemas/`, `evaluation/reports/`, `.github/workflows/evaluation.yml`, `.specify/feature.json`, and `AGENTS.md`.
- [x] T004 Review `evaluation/specs/014-evaluation-harness-commonization/research.md` and record the accepted research decisions in `evaluation/specs/014-evaluation-harness-commonization/commonization-blueprint.md`.
- [x] T005 Review `evaluation/specs/014-evaluation-harness-commonization/data-model.md` and align the blueprint headings in `evaluation/specs/014-evaluation-harness-commonization/commonization-blueprint.md` with the defined entities.

**Checkpoint**: The blueprint exists, has the required top-level shape, and
states the source scope and non-goals before story-specific content begins.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Define the classification vocabulary and review rules that all
stories depend on.

**CRITICAL**: No user story work should begin until the classification and
validation rules are present in the blueprint.

- [x] T006 Add the allowed capability classifications and decisions from `evaluation/specs/014-evaluation-harness-commonization/contracts/commonization-blueprint-contract.md` to `evaluation/specs/014-evaluation-harness-commonization/commonization-blueprint.md`.
- [x] T007 Add a `Validation Rules` subsection to `evaluation/specs/014-evaluation-harness-commonization/commonization-blueprint.md` requiring every major `evaluation/README.md` surface to appear in the capability table.
- [x] T008 Add a `Boundary And Rollback Review` template to `evaluation/specs/014-evaluation-harness-commonization/commonization-blueprint.md` covering outside-`evaluation/` edits, blast radius, and rollback path.
- [x] T009 Add a `Status Semantics` subsection to `evaluation/specs/014-evaluation-harness-commonization/commonization-blueprint.md` preserving `pass`, `warning`, `unknown`, `blocked`, `deferred`, weak-signal, and unmapped evidence semantics.
- [x] T010 Verify `evaluation/specs/014-evaluation-harness-commonization/commonization-blueprint.md` still satisfies the required sections listed in `evaluation/specs/014-evaluation-harness-commonization/contracts/commonization-blueprint-contract.md`.

**Checkpoint**: The blueprint has the vocabulary and validation frame needed to
classify capabilities, workflow steps, and readiness gates consistently.

---

## Phase 3: User Story 1 - Separate Common Core From Local Policy (Priority: P1) - MVP

**Goal**: Produce the capability inventory and classification table that
separates reusable core from adapter contracts, project policy, generated
evidence, and intentionally local behavior.

**Independent Test**: Review the capability table in
`commonization-blueprint.md` and verify the runner, evidence model, reports,
failure guidance, environment checks, CI summary, feature mapping, ownership,
thresholds, and local repository constraints each have a classification,
rationale, risk, adopter input, and rollback path.

### Implementation for User Story 1

- [x] T011 [US1] Add `Capability Classification` rows for runner orchestration from `evaluation/bin/run-evaluation.mjs`, `evaluation/lib/command-executor.mjs`, `evaluation/lib/layer-planner.mjs`, and `evaluation/config/evaluation.config.json` to `evaluation/specs/014-evaluation-harness-commonization/commonization-blueprint.md`.
- [x] T012 [US1] Add `Capability Classification` rows for evidence contracts from `evaluation/schemas/summary.schema.json`, `evaluation/schemas/ownership.schema.json`, `evaluation/lib/summary-model.mjs`, `evaluation/lib/summary-markdown.mjs`, and `evaluation/lib/diagnostics.mjs` to `evaluation/specs/014-evaluation-harness-commonization/commonization-blueprint.md`.
- [x] T013 [US1] Add `Capability Classification` rows for environment and browser integration from `evaluation/lib/environment-preflight.mjs`, `evaluation/lib/static-server.mjs`, `evaluation/bin/run-playwright-with-server.mjs`, and `evaluation/config/playwright.shared.mjs` to `evaluation/specs/014-evaluation-harness-commonization/commonization-blueprint.md`.
- [x] T014 [US1] Add `Capability Classification` rows for report generators from `evaluation/bin/generate-run-health.mjs`, `evaluation/bin/generate-test-meaningfulness.mjs`, `evaluation/bin/generate-feature-coverage-matrix.mjs`, `evaluation/bin/generate-quality-gate.mjs`, `evaluation/bin/generate-ci-gate-summary.mjs`, `evaluation/bin/generate-migration-candidates.mjs`, their `evaluation/lib/*-model.mjs` and `evaluation/lib/*-report.mjs` modules, and `evaluation/lib/thinning-decision-model.mjs` to `evaluation/specs/014-evaluation-harness-commonization/commonization-blueprint.md`.
- [x] T015 [US1] Add `Capability Classification` rows for project-local policy from `evaluation/config/feature-coverage.config.json`, `evaluation/config/migration-candidates.config.json`, `evaluation/config/thinning-decisions.config.json`, `evaluation/config/quality-gate.config.json`, `evaluation/config/run-health.config.json`, and `evaluation/lib/ownership.mjs` to `evaluation/specs/014-evaluation-harness-commonization/commonization-blueprint.md`.
- [x] T016 [US1] Add `Stable User-Facing Contracts` to `evaluation/specs/014-evaluation-harness-commonization/commonization-blueprint.md` covering `summary.json`, `summary.md`, layer logs, Playwright result artifacts, run-health, test-meaningfulness, feature coverage matrix, quality gate, CI gate summary, and migration/thinning reports.
- [x] T017 [US1] Add `Project-Local Policies` to `evaluation/specs/014-evaluation-harness-commonization/commonization-blueprint.md` covering hotel feature mappings, deployed target URL, fork repository guard, quality thresholds, baselines, ownership rules, and E2E thinning decisions.
- [x] T018 [US1] Verify FR-001 through FR-004 and FR-010 through FR-012 from `evaluation/specs/014-evaluation-harness-commonization/spec.md` against `evaluation/specs/014-evaluation-harness-commonization/commonization-blueprint.md`.

**Checkpoint**: User Story 1 is independently reviewable as an MVP: a reviewer
can see what should be shared, parameterized, generated locally, kept local,
deferred, or excluded.

---

## Phase 4: User Story 2 - Guide Non-Expert Adopters Through The Right Process (Priority: P2)

**Goal**: Define the adopter workflow so users who do not know the process can
inspect, configure, run, review, and operate a harness in the correct order.

**Independent Test**: Walk the `Guided Onboarding Workflow` table in
`commonization-blueprint.md` and verify every step has required input, expected
output, validation signal, stopping condition, and next action on pass,
warning, and blocked.

### Implementation for User Story 2

- [x] T019 [US2] Add `Adapter Contracts` to `evaluation/specs/014-evaluation-harness-commonization/commonization-blueprint.md` for test roots, layer definitions, commands, required tools, local/deployed targets, artifact paths, behavior mappings, ownership rules, thresholds, baselines, CI policy, and repository governance.
- [x] T020 [US2] Add `Guided Onboarding Workflow` steps for repository inspection, test layer discovery, environment preflight, local adapter configuration, and first evidence run to `evaluation/specs/014-evaluation-harness-commonization/commonization-blueprint.md`.
- [x] T021 [US2] Add `Guided Onboarding Workflow` steps for report generation, feature or behavior mapping, quality gate interpretation, CI or recurring execution setup, E2E thinning readiness review, and ongoing baseline or threshold review to `evaluation/specs/014-evaluation-harness-commonization/commonization-blueprint.md`.
- [x] T022 [US2] Add edge-case handling notes to `evaluation/specs/014-evaluation-harness-commonization/commonization-blueprint.md` for repositories with no browser tests, no unit tests, one test layer, multiple applications, missing structured results, missing artifact ignores, uncertain mappings, passing latest runs with historical warnings, absent CI, and local security constraints.
- [x] T023 [US2] Verify `Guided Onboarding Workflow` in `evaluation/specs/014-evaluation-harness-commonization/commonization-blueprint.md` satisfies `evaluation/specs/014-evaluation-harness-commonization/contracts/onboarding-workflow-contract.md`.
- [x] T024 [US2] Verify FR-005 through FR-008 from `evaluation/specs/014-evaluation-harness-commonization/spec.md` against `evaluation/specs/014-evaluation-harness-commonization/commonization-blueprint.md`.

**Checkpoint**: User Story 2 is independently reviewable: a future adopter can
follow the documented process without relying on unstated repository history.

---

## Phase 5: User Story 3 - Define Readiness Gates For Future Extraction (Priority: P3)

**Goal**: Define review gates that block unsafe extraction, threshold
enforcement, E2E thinning, repair automation, and outside-boundary edits until
the required evidence exists.

**Independent Test**: Inspect the `Readiness Gates` and `Open Decisions`
sections in `commonization-blueprint.md` and verify each gate has required
evidence, pass criteria, warning criteria, blocked criteria, owner, rollback
requirement, and next allowed action.

### Implementation for User Story 3

- [x] T025 [US3] Add `Readiness Gates` for common core extraction, adapter contract completeness, evidence contract stability, report contract stability, and feature mapping or ownership to `evaluation/specs/014-evaluation-harness-commonization/commonization-blueprint.md`.
- [x] T026 [US3] Add `Readiness Gates` for quality threshold enforcement, CI integration, E2E thinning, repair automation, and outside-`evaluation/` file changes to `evaluation/specs/014-evaluation-harness-commonization/commonization-blueprint.md`.
- [x] T027 [US3] Add `Open Decisions` to `evaluation/specs/014-evaluation-harness-commonization/commonization-blueprint.md` for package shape, future CLI surface, adapter schema format, fixture repository strategy, shared default thresholds, CI template ownership, and repair-mode reconsideration.
- [x] T028 [US3] Add `Boundary And Rollback Review` entries to `evaluation/specs/014-evaluation-harness-commonization/commonization-blueprint.md` for `.specify/feature.json`, `AGENTS.md`, future shared-code extraction, future CI templates, future root-script integration, and future E2E thinning.
- [x] T029 [US3] Verify `Readiness Gates` in `evaluation/specs/014-evaluation-harness-commonization/commonization-blueprint.md` satisfies `evaluation/specs/014-evaluation-harness-commonization/contracts/readiness-gate-contract.md`.
- [x] T030 [US3] Verify FR-009, FR-011, and FR-013 from `evaluation/specs/014-evaluation-harness-commonization/spec.md` against `evaluation/specs/014-evaluation-harness-commonization/commonization-blueprint.md`.

**Checkpoint**: User Story 3 is independently reviewable: future extraction
work has explicit gates and unsafe work remains blocked or deferred.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validate the completed blueprint and confirm it is ready for
review and later planning.

- [x] T031 Update `evaluation/specs/014-evaluation-harness-commonization/quickstart.md` if the final validation order or blueprint path differs from the planned flow.
- [x] T032 Verify every required section from `evaluation/specs/014-evaluation-harness-commonization/contracts/commonization-blueprint-contract.md` exists in `evaluation/specs/014-evaluation-harness-commonization/commonization-blueprint.md`.
- [x] T033 Verify all success criteria SC-001 through SC-006 from `evaluation/specs/014-evaluation-harness-commonization/spec.md` against `evaluation/specs/014-evaluation-harness-commonization/commonization-blueprint.md`.
- [x] T034 Run `node node_modules/prettier/bin/prettier.cjs --check AGENTS.md .specify/feature.json evaluation/specs/014-evaluation-harness-commonization/*.md evaluation/specs/014-evaluation-harness-commonization/contracts/*.md evaluation/specs/014-evaluation-harness-commonization/checklists/*.md`.
- [x] T035 Run `git diff --name-only`, `git status --short`, and `git ls-files --others --exclude-standard evaluation/specs/014-evaluation-harness-commonization` and verify changes are limited to `.specify/feature.json`, `AGENTS.md`, and `evaluation/specs/014-evaluation-harness-commonization/`.
- [x] T036 Run `git remote -v` and verify `upstream` push remains disabled.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup and blocks all user stories.
- **User Story 1 (Phase 3)**: Depends on Foundational and is the MVP.
- **User Story 2 (Phase 4)**: Depends on Foundational; can be reviewed after
  US1 because it relies on capability boundaries.
- **User Story 3 (Phase 5)**: Depends on Foundational; can be reviewed after
  US1/US2 because gates reference classifications and adopter workflow states.
- **Polish (Phase 6)**: Depends on the selected user stories being complete.

### User Story Dependencies

- **US1 (P1)**: Can start after Foundational; no dependency on US2 or US3 for
  MVP review.
- **US2 (P2)**: Can start after Foundational; benefits from US1 classifications
  but remains independently testable through the onboarding contract.
- **US3 (P3)**: Can start after Foundational; benefits from US1/US2 but remains
  independently testable through the readiness-gate contract.

### Parallel Opportunities

- T011-T015 can be drafted in parallel only if contributors coordinate
  non-overlapping capability table ranges in `commonization-blueprint.md`.
- T020 and T021 can be drafted in parallel only if contributors coordinate
  non-overlapping workflow step ranges in `commonization-blueprint.md`.
- T025 and T026 can be drafted in parallel only if contributors coordinate
  non-overlapping gate ranges in `commonization-blueprint.md`.
- T031-T033 can run in parallel after T030 because they validate different
  review surfaces.

---

## Parallel Example: User Story 1

```text
Task: "T011 [US1] Add runner orchestration capability rows to evaluation/specs/014-evaluation-harness-commonization/commonization-blueprint.md"
Task: "T012 [US1] Add evidence contract capability rows to evaluation/specs/014-evaluation-harness-commonization/commonization-blueprint.md"
Task: "T013 [US1] Add environment and browser integration capability rows to evaluation/specs/014-evaluation-harness-commonization/commonization-blueprint.md"
```

Coordinate table row ownership before editing because these tasks write to the
same blueprint file.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 setup.
2. Complete Phase 2 foundational classification rules.
3. Complete Phase 3 to produce the capability inventory and classification
   table.
4. Stop and validate US1 independently against the commonization blueprint
   contract and FR-001 through FR-004.

### Incremental Delivery

1. Deliver US1 for a reviewable commonization boundary.
2. Add US2 for a non-expert adopter workflow.
3. Add US3 for extraction, thinning, enforcement, repair, and boundary
   readiness gates.
4. Run formatting and boundary checks.

### Boundary Strategy

1. Keep implementation output in
   `evaluation/specs/014-evaluation-harness-commonization/commonization-blueprint.md`.
2. Do not edit runtime harness modules, product files, root E2E files, root
   package scripts, root browser-test configuration, or CI behavior.
3. Treat `.specify/feature.json` and `AGENTS.md` as active-context pointers
   only.
4. Use `git diff --name-only` and `git remote -v` as final boundary evidence.
