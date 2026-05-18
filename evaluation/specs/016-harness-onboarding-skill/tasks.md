# Tasks: Harness Onboarding Skill

**Input**: Design documents from
`evaluation/specs/016-harness-onboarding-skill/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/,
quickstart.md

**Tests**: Include Skill validation, TODO scans, formatting, command smoke
checks, and boundary review.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to
- Include exact file paths in descriptions

## Phase 1: Setup

- [x] T001 Create `evaluation/skills/harness-onboarding/` using the skill creator initializer.
- [x] T002 Update `.specify/feature.json` to point to `evaluation/specs/016-harness-onboarding-skill`.
- [x] T003 Update `AGENTS.md` active plan pointer to `evaluation/specs/016-harness-onboarding-skill/plan.md`.

## Phase 2: Foundational

- [x] T004 Replace placeholder Skill template content in `evaluation/skills/harness-onboarding/SKILL.md`.
- [x] T005 Verify `evaluation/skills/harness-onboarding/agents/openai.yaml` matches the Skill purpose.

## Phase 3: User Story 1 - Use A Path-Based Skill For Harness Onboarding (Priority: P1)

**Goal**: Agents can use the Skill by path to run the 015 CLI workflow in the
correct order.

**Independent Test**: Read `evaluation/skills/harness-onboarding/SKILL.md` and
verify it names dry-run, decision review, write, validate, and report steps.

- [x] T006 [US1] Add the ordered dry-run, summarize, write, validate, and report workflow to `evaluation/skills/harness-onboarding/SKILL.md`.
- [x] T007 [US1] Add expected commands and output paths to `evaluation/skills/harness-onboarding/SKILL.md`.

## Phase 4: User Story 2 - Keep Skill Storage Evaluation-Local (Priority: P2)

**Goal**: The Skill is stored under `evaluation/skills/` and discoverable by
path.

**Independent Test**: `git status --short` shows no `.agents/skills/` changes,
and docs show the evaluation-local path.

- [x] T008 [US2] Document the path-based Skill location in `evaluation/README.md`.
- [x] T009 [US2] Add boundary validation instructions to `evaluation/skills/harness-onboarding/SKILL.md`.

## Phase 5: User Story 3 - Prevent Unsafe Automation Through Skill Rules (Priority: P3)

**Goal**: The Skill preserves the 015 safety boundary.

**Independent Test**: The Skill explicitly forbids CI workflow generation,
product/root edits, E2E thinning, repair, and hidden success for warning or
unknown states.

- [x] T010 [US3] Add status interpretation rules for `blocked`, `warning`, `unknown`, and `pass` to `evaluation/skills/harness-onboarding/SKILL.md`.
- [x] T011 [US3] Add forbidden actions and stop conditions to `evaluation/skills/harness-onboarding/SKILL.md`.

## Phase 6: Polish & Validation

- [x] T012 Run the Skill validator against `evaluation/skills/harness-onboarding`.
- [x] T013 Run placeholder scan `rg -n "\[TODO|TODO:" evaluation/skills/harness-onboarding`.
- [x] T014 Run Prettier check for `evaluation/skills`, `evaluation/specs/016-harness-onboarding-skill`, `evaluation/README.md`, `AGENTS.md`, and `.specify/feature.json`.
- [x] T015 Run `node evaluation/bin/init-harness-adapter.mjs --dry-run --non-interactive` as a smoke check.
- [x] T016 Run `git status --short` and verify no files under `.agents/skills/` changed.

## Dependencies & Execution Order

- Setup precedes all Skill edits.
- Foundational Skill replacement precedes story validation.
- US1 is the MVP.
- US2 and US3 may be completed after US1 and are independently reviewable.

## Implementation Strategy

Complete US1 first so the Skill is useful by path, then add storage/boundary
documentation and safety rules.
