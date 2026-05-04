# Feature Specification: Evaluation CI Gate

**Feature Branch**: `005-evaluation-ci`
**Created**: 2026-05-04
**Status**: Draft
**Input**: Connect the evaluation harness to CI while ensuring the work affects
only the user's forked repository and never the original upstream repository.
**Constitution**: `evaluation/.specify/memory/constitution.md` v1.2.0

## Overview

Add a fork-scoped CI gate for the evaluation harness. The gate should run the
existing evaluation workflow automatically for pull requests and main-branch
updates in the fork, preserve generated evaluation evidence as downloadable
artifacts, and allow manual runs for heavier modes.

This feature must not contribute changes to the original upstream repository,
must not require upstream repository secrets, and must not change product
behavior. The CI connection is a harness-growth step: it makes the existing
local gate visible and repeatable in the fork before any repair mode or broader
automation is introduced.

## User Scenarios & Testing

### User Story 1 - See the Evaluation Gate on Fork Pull Requests (Priority: P1)

As a maintainer of the fork, I want pull requests in my fork to run the
evaluation gate automatically so that regressions are visible before merge.

**Why this priority**: The evaluation loop is currently local. CI gives the
same evidence to reviewers without requiring them to reproduce every run
manually.

**Independent Test**: Push the feature branch to the fork and open or update a
pull request targeting the fork's default branch. Verify that the evaluation
gate job runs only in the fork and reports pass or fail.

**Acceptance Scenarios**:

1. Given a pull request targets the fork repository, when the CI workflow runs,
   then it executes the evaluation gate and reports the outcome.
2. Given the same workflow file exists outside the fork repository, when an
   event occurs there, then the evaluation job is skipped by repository
   boundary checks.
3. Given the gate fails, when the workflow completes, then the generated
   evaluation evidence remains available for review.

### User Story 2 - Preserve Evaluation Evidence from CI (Priority: P1)

As a maintainer diagnosing a CI failure, I want the generated evaluation
summary, logs, and Playwright artifacts to be downloadable so that I can inspect
the failure without rerunning locally.

**Why this priority**: The previous diagnostic work is only useful in CI if the
generated run directory is retained after failures.

**Independent Test**: Run the workflow with a failing gate or controlled
failing branch and verify that evaluation run artifacts are uploaded even when
the gate exits non-zero.

**Acceptance Scenarios**:

1. Given the evaluation gate passes, when the workflow completes, then the run
   evidence is uploaded.
2. Given the evaluation gate fails, when the workflow completes, then the run
   evidence is still uploaded.
3. Given no run directory is produced because setup failed early, when artifact
   upload runs, then the workflow reports the missing evidence without masking
   the real setup failure.

### User Story 3 - Manually Run Heavier Modes (Priority: P2)

As a maintainer, I want to manually run `full` or `collect-all` modes in the
fork so that deeper evidence is available on demand without making every pull
request slower.

**Why this priority**: Pull requests should stay focused on the gate. Heavier
evidence is valuable but should be opt-in until runtime and stability are
understood.

**Independent Test**: Trigger the workflow manually in the fork and choose a
non-default evaluation mode. Verify that the selected mode is passed through to
the evaluation harness and artifacts are preserved.

**Acceptance Scenarios**:

1. Given a maintainer manually triggers the workflow, when `gate` is selected,
   then the workflow runs the default gate.
2. Given a maintainer manually selects `full`, when the workflow runs, then it
   requests the full evaluation mode.
3. Given a maintainer manually selects `collect-all`, when the workflow runs,
   then it requests evidence collection across eligible layers.

### Edge Cases

- The workflow is present in a repository whose full name is not the user's
  fork.
- Dependency installation fails before `evaluation/runs/` exists.
- The evaluation command exits non-zero after writing diagnostic artifacts.
- Manual runs request deployed-site targeting without required environment
  configuration.
- A pull request originates from a branch in the same fork versus a fork of the
  fork.

## Requirements

### Functional Requirements

- **FR-001**: The CI gate MUST be scoped so it runs only for
  `vs-yeHoaqko/hotel-example-site`.
- **FR-002**: The feature MUST NOT push to, configure, or require permissions
  on `takeyaqa/hotel-example-site`.
- **FR-003**: Pull requests targeting the fork MUST run the evaluation gate.
- **FR-004**: Updates to the fork's default branch MUST run the evaluation
  gate.
- **FR-005**: Manual runs MUST support selecting `gate`, `full`, or
  `collect-all`.
- **FR-006**: Manual runs MUST support choosing local or deployed target
  metadata.
- **FR-007**: The workflow MUST preserve `evaluation/runs/` evidence as a CI
  artifact whenever such evidence exists.
- **FR-008**: Evidence upload MUST run even when the evaluation command fails.
- **FR-009**: The workflow MUST use read-only repository permissions unless a
  later feature explicitly requires more.
- **FR-010**: The feature MUST NOT modify product source, root package scripts,
  root Playwright config, or application behavior.
- **FR-011**: Documentation MUST explain which workflow runs are automatic,
  which are manual, and how artifacts are used for diagnosis.
- **FR-012**: Generated CI artifacts MUST remain operational evidence and MUST
  NOT be committed to git.

### Key Entities

- **CI Evaluation Run**: A repository-hosted execution of the evaluation
  harness with a selected mode, target, status, and retained evidence.
- **Evaluation Evidence Artifact**: Downloadable output containing
  `summary.json`, `summary.md`, ownership data, logs, and Playwright artifacts
  from a CI run.
- **Fork Boundary**: The repository identity check that prevents this workflow
  from running outside the user's fork.

## Success Criteria

### Measurable Outcomes

- **SC-001**: A pull request in the fork shows an evaluation gate result without
  requiring local commands.
- **SC-002**: A failing evaluation run preserves downloadable evidence in 100%
  of cases where `evaluation/runs/` is created.
- **SC-003**: Manual runs can request all three supported modes without editing
  workflow files.
- **SC-004**: The workflow has no write permissions to repository contents.
- **SC-005**: The original upstream repository remains unaffected by all local
  and pushed changes unless the user explicitly opens a contribution pull
  request.

## Assumptions

- The user's fork repository full name is `vs-yeHoaqko/hotel-example-site`.
- CI will run on GitHub-hosted Linux runners using the existing dependency
  lockfile.
- Existing upstream workflows for Pages and root Playwright tests remain
  unchanged.
- Pull-request CI should run `gate`; `full` and `collect-all` remain manual for
  now.
- Generated run evidence is safe to upload as workflow artifacts for the fork.
