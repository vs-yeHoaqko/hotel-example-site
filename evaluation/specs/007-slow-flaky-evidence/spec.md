# Feature Specification: Slow and Flaky Evidence Report

**Feature Branch**: `007-slow-flaky-evidence`
**Created**: 2026-05-04
**Status**: Draft
**Input**: User description: "Before strengthening the evaluation harness, identify tests that are likely to fail, timeout, or contain redundant coverage. Implement the safer next step as an evaluation-local slow/flaky evidence report without touching base-repository files."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Review Recent Run Health (Priority: P1)

As a maintainer, I want a concise report that summarizes recent evaluation runs so that I can see which layers and tests are slow, failed, timed out, retried, or environment-sensitive before deciding what to improve next.

**Why this priority**: The next harness improvements should be based on evidence already produced by the harness rather than manual inspection of multiple run directories.

**Independent Test**: Given existing evaluation run evidence, generate the report and verify it includes run totals, layer durations, slowest tests, failures, timeouts, and recommended review focus without running the product tests again.

**Acceptance Scenarios**:

1. **Given** multiple completed evaluation runs exist, **When** a maintainer generates the health report, **Then** the report lists the latest runs and summarizes pass/fail status by mode.
2. **Given** a run includes layer duration data, **When** the report is generated, **Then** the report identifies the slowest layers and whether they are inside the expected threshold.
3. **Given** a run failed due to environment or timeout evidence, **When** the report is generated, **Then** the report surfaces that failure separately from product behavior.

---

### User Story 2 - Identify Slow and Flaky Candidates (Priority: P2)

As a maintainer, I want the report to rank slow tests and unstable-looking evidence so that I can prioritize targeted harness improvements without changing root E2E files.

**Why this priority**: Slow or unstable tests create evaluation cost and false-alarm risk. Ranking them makes the next work item reviewable.

**Independent Test**: Use fixture run data with slow, failed, retried, and timed-out tests and verify the report ranks the highest-risk items deterministically.

**Acceptance Scenarios**:

1. **Given** Playwright result evidence includes per-test durations, **When** the report is generated, **Then** the slowest tests are ranked with their layer, title, duration, and source file when available.
2. **Given** Playwright result evidence includes retry or failure records, **When** the report is generated, **Then** retry and failure evidence is highlighted as instability evidence.
3. **Given** no retry or failure evidence exists, **When** the report is generated, **Then** the report explicitly states that no flaky evidence was observed in the selected runs.

---

### User Story 3 - Preserve Reviewable Guidance (Priority: P3)

As a maintainer, I want the report format and reading guidance documented so future contributors can regenerate and interpret it consistently.

**Why this priority**: The report is only useful if future runs can be interpreted the same way and generated artifacts remain outside Git by default.

**Independent Test**: Read the documentation and generated report, then verify that a maintainer can identify the input run evidence, output report, interpretation rules, and Git tracking boundaries.

**Acceptance Scenarios**:

1. **Given** the report has been generated, **When** a maintainer reads it, **Then** they can identify which run IDs and artifact files were used.
2. **Given** generated run directories exist, **When** a maintainer checks Git status, **Then** those run directories remain ignored and uncommitted.
3. **Given** the report is regenerated from the same evidence, **When** the output is compared, **Then** ordering and summary content remain deterministic.

### Edge Cases

- No evaluation runs exist yet.
- Some run directories have `summary.md` but missing or malformed `summary.json`.
- Some Playwright JSON artifacts are missing, malformed, or contain no per-test duration data.
- Failed runs may stop before later layers produce artifacts.
- Local sandbox restrictions may produce `spawn EPERM` environment evidence that should not be classified as product flakiness.
- Multiple runs may have identical durations or timestamps; ordering must remain deterministic.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The feature MUST generate a human-readable slow/flaky evidence report from existing evaluation run evidence.
- **FR-002**: The feature MUST NOT rerun product tests as part of report generation.
- **FR-003**: The feature MUST summarize selected runs by run ID, mode, target, status, start time, finish time, and dirty/clean repository state.
- **FR-004**: The feature MUST summarize layer status, classification, duration, timeout, and skipped status for each selected run.
- **FR-005**: The feature MUST identify slow layers using explicit thresholds per layer.
- **FR-006**: The feature MUST identify slow Playwright tests when per-test duration evidence exists.
- **FR-007**: The feature MUST identify instability evidence from failed, timed-out, interrupted, or retried test results when available.
- **FR-008**: The feature MUST distinguish environment evidence from product/test behavior evidence.
- **FR-009**: The feature MUST report when no flaky evidence is observed in the selected runs.
- **FR-010**: The feature MUST include the input run IDs and artifact paths used to generate the report.
- **FR-011**: The feature MUST produce deterministic ordering for runs, layers, and ranked findings.
- **FR-012**: The feature MUST tolerate missing or malformed run artifacts by recording warnings instead of failing the entire report.
- **FR-013**: The feature MUST keep all implementation, generated reports, fixtures, and tests under `evaluation/`.
- **FR-014**: The feature MUST NOT change product source, product fixtures, root E2E files, root Playwright config, root package scripts, CI triggers, or base-repository-owned tests.
- **FR-015**: The feature MUST document how to regenerate and interpret the report.
- **FR-016**: The feature MUST keep `evaluation/runs/` generated evidence ignored and uncommitted.
- **FR-017**: The feature MUST provide automated tests for report model behavior, malformed input handling, and deterministic ranking.
- **FR-018**: The feature MUST remain advisory; it MUST NOT automatically thin tests, mark tests flaky, change timeouts, or repair failures.

### Key Entities

- **Evaluation Run**: A completed or partially completed run directory with summary evidence, layer results, and optional Playwright artifacts.
- **Layer Health**: Per-layer status, classification, duration, timeout, skipped state, and artifact references.
- **Test Health Finding**: A ranked slow or unstable test observation with layer, title, duration, status, retry/failure signal, and artifact source.
- **Health Report**: Human-readable output that summarizes run health, slow layers, slow tests, instability evidence, warnings, and recommended review focus.
- **Report Warning**: Non-fatal evidence that a run or artifact could not be fully read.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: A maintainer can generate the report from existing run evidence in under 10 seconds without executing product tests.
- **SC-002**: The report lists at least the latest 5 readable runs when 5 or more runs exist.
- **SC-003**: The report ranks at least the top 10 slowest test observations when at least 10 test-duration observations exist.
- **SC-004**: The report records a clear "no flaky evidence observed" statement when selected runs have no failed, timed-out, interrupted, or retried tests.
- **SC-005**: Malformed or missing artifacts appear as report warnings while readable runs still contribute evidence.
- **SC-006**: All validation checks pass after implementation: formatting, focused unit tests, report generation, `gate`, and `full`.
- **SC-007**: The final implementation changes no files outside `evaluation/` except the active Speckit feature pointer and agent-context plan pointer if required by the workflow.

## Assumptions

- Existing `evaluation/runs/` evidence is the source of truth for recent run health.
- The initial report should be generated from local run evidence and committed only as stable guidance under `evaluation/reports/`.
- Flaky evidence means observed retry, timeout, interrupted, failed, or inconsistent result signals; this feature does not attempt statistical flake classification.
- Layer thresholds should start from existing configured layer timeouts and recent observed durations, then remain explicit and reviewable.
- Repair mode, automatic test thinning, and timeout changes are out of scope.
