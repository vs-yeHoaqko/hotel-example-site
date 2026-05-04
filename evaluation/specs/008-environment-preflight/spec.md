# Feature Specification: Environment Preflight And CI Run Health Artifacts

**Feature Branch**: `008-environment-preflight`
**Created**: 2026-05-04
**Status**: Draft
**Input**: User description: "Improve the evaluation harness so environment-looking failures are easier to distinguish from product or test failures, publish run-health evidence from CI, and avoid mutating base repository files except where required for fork-scoped CI."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Detect Environment Problems Before Main Evaluation (Priority: P1)

As a maintainer, I want the evaluation gate to run a lightweight environment
preflight first so that missing tools, process-spawn restrictions, and browser
runtime problems are classified before product or test behavior is inspected.

**Why this priority**: Recent failures included `spawn EPERM`, which is not a
product behavior issue. Preflight evidence should prevent wasted debugging.

**Independent Test**: Run a fixture preflight with a simulated failed spawn
check and verify the evaluation summary classifies it as environment evidence
with a clear reproduction/guidance path.

**Acceptance Scenarios**:

1. **Given** the environment can run required tools, **When** the gate starts,
   **Then** the preflight layer passes and later layers continue normally.
2. **Given** the environment cannot spawn subprocesses, **When** the gate
   starts, **Then** the preflight layer fails as environment evidence before
   product or test layers run.
3. **Given** required browser/runtime files are missing, **When** the preflight
   runs, **Then** the report names the missing capability and recommends
   fixing the environment first.

---

### User Story 2 - Preserve Environment Evidence In Run Health Reports (Priority: P2)

As a maintainer, I want run-health output to include preflight checks and
environment evidence so that CI and local failures are readable without opening
all raw logs.

**Why this priority**: The slow/flaky report already summarizes existing runs.
It should also make environment evidence visible as a first-class input.

**Independent Test**: Generate a run-health report from fixture runs containing
preflight pass/fail artifacts and verify environment findings are separated
from instability evidence.

**Acceptance Scenarios**:

1. **Given** a run has preflight evidence, **When** run-health is generated,
   **Then** the report lists the preflight status and artifact path.
2. **Given** a run has environment evidence only, **When** run-health is
   generated, **Then** the report recommends fixing tooling rather than
   changing product or tests.
3. **Given** a run has no environment evidence, **When** run-health is
   generated, **Then** the report states that no environment evidence was
   observed in selected runs.

---

### User Story 3 - Publish CI Health Artifacts (Priority: P3)

As a maintainer, I want CI runs to generate and upload run-health evidence so
that failed pull-request evaluations leave the same review surface as local
runs.

**Why this priority**: CI is where contributors most need quick failure
triage. A generated run-health report should be available even when evaluation
fails.

**Independent Test**: Inspect the fork-scoped CI workflow and verify it runs
the health report generation after evaluation and uploads the report together
with run artifacts.

**Acceptance Scenarios**:

1. **Given** a fork CI evaluation runs, **When** the evaluation command
   finishes or fails, **Then** run-health generation still runs.
2. **Given** run-health generation produces a report, **When** artifacts are
   uploaded, **Then** the report is included in the uploaded evaluation
   evidence.
3. **Given** this repository is a fork, **When** CI changes are applied, **Then**
   they remain scoped to the fork-owned evaluation workflow and do not enable
   pushes to upstream.

### Edge Cases

- Subprocess spawning itself is restricted by the local sandbox.
- Browser packages are installed but browser executable files are missing.
- Preflight fails before later layers create Playwright artifacts.
- Run-health generation runs after a failed gate and must still render partial
  evidence.
- CI artifact upload runs even if the evaluation command fails.
- The workflow file is outside `evaluation/` and must be treated as a
  documented fork-scoped exception.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The harness MUST run a required environment preflight before
  static, unit, integration, smoke, or full layers.
- **FR-002**: The preflight MUST check subprocess spawn capability, required
  local command files, and browser runtime availability without starting the
  product app.
- **FR-003**: The preflight MUST write machine-readable evidence into the
  current evaluation run directory.
- **FR-004**: A failed preflight MUST be classified as environment evidence and
  recommend fixing the environment before product or test inspection.
- **FR-005**: Existing product/test layers MUST remain unchanged except for
  being ordered after preflight.
- **FR-006**: Run-health output MUST surface preflight evidence and keep it
  separate from product/test instability evidence.
- **FR-007**: Run-health output MUST state when no environment evidence is
  observed in selected runs.
- **FR-008**: CI MUST attempt to generate run-health output after evaluation,
  even if evaluation fails.
- **FR-009**: CI MUST upload run-health output with evaluation artifacts when
  available.
- **FR-010**: CI changes MUST remain fork-scoped and MUST NOT enable any push
  path to the upstream repository.
- **FR-011**: The feature MUST provide automated tests for preflight result
  modeling, failed-environment classification, and run-health rendering.
- **FR-012**: The feature MUST NOT mark tests flaky, skip tests, increase
  timeouts, retry product tests, thin E2E assertions, or introduce repair mode.
- **FR-013**: The feature MUST reduce local environment pressure for full E2E
  evaluation without changing root E2E assertions, retries, or timeouts.
- **FR-014**: The feature MUST reduce gate smoke timeout risk without removing
  the representative reservation completion confirmation.

### Key Entities

- **Environment Preflight**: A lightweight evaluation layer that checks whether
  the local execution environment can run the harness.
- **Preflight Check Result**: Machine-readable evidence for one checked
  capability, including status, classification, message, and guidance.
- **Environment Evidence**: A run-health finding that points to tooling,
  sandbox, browser runtime, server startup, or process restrictions.
- **CI Health Artifact**: Uploaded evidence from CI that includes generated
  run-health output and evaluation run artifacts.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: A passing local environment completes preflight in under 10
  seconds without starting the product app.
- **SC-002**: A simulated subprocess-spawn failure is classified as environment
  evidence in automated tests.
- **SC-003**: Run-health reports include preflight artifact paths for selected
  runs that have preflight evidence.
- **SC-004**: Run-health reports include a clear "no environment evidence
  observed" statement when selected runs have none.
- **SC-005**: CI workflow artifacts include run-health output after both
  successful and failed evaluation commands.
- **SC-006**: All validation checks pass after implementation: formatting,
  focused unit tests, report generation, `gate`, and `full`.
- **SC-007**: Final implementation changes no product source, product fixtures,
  root E2E tests, root Playwright config, or root package scripts.
- **SC-008**: Local `full` evaluation uses the same bounded browser-worker
  policy as CI.
- **SC-009**: The gate smoke reservation journey still reaches the success
  confirmation while avoiding non-essential popup-close waits.

## Assumptions

- 008 builds on the 007 run-health report feature.
- CI workflow changes are acceptable because the requested output must be
  published by GitHub Actions and the existing workflow is fork-scoped.
- Environment preflight is advisory for diagnosis but required as a gate layer;
  if it fails, later layers should not run because their results would be
  misleading.
- Environment preflight should not launch browsers or the product dev server;
  browser launch behavior remains covered by existing Playwright layers.
