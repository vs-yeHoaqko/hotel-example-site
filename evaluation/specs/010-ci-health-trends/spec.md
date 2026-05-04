# Feature Specification: CI Health Trends and Test Meaningfulness

**Feature Branch**: `010-ci-health-trends`
**Created**: 2026-05-04
**Status**: Draft
**Input**: User description: "Improve the evaluation harness with CI health trends and investigate how much meaningful testing exists."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Review Run Health Trends (Priority: P1)

As a maintainer, I want the run health report to show whether recent evaluation runs are improving, degrading, or repeating the same slow/unstable signals, so I can decide the next harness improvement from evidence rather than a single run snapshot.

**Why this priority**: Slow and flaky work is only useful if repeated evidence can be recognized. The current report is readable but mostly per-run; trend context makes the report more actionable.

**Independent Test**: Generate a run health report from multiple run summaries and verify that it includes selected-run status counts and per-layer latest/previous duration comparisons.

**Acceptance Scenarios**:

1. **Given** at least two readable evaluation runs, **When** the run health report is generated, **Then** it shows latest and previous duration per layer with a delta.
2. **Given** repeated failed, timed-out, or slow layers, **When** the report is generated, **Then** it summarizes recurrence counts without changing test outcomes.
3. **Given** only one readable run, **When** the report is generated, **Then** it states that trend comparison is limited rather than inventing a trend.

---

### User Story 2 - Understand Meaningful Test Coverage (Priority: P2)

As a maintainer, I want a generated inventory of meaningful tests by layer, target, and assertion volume, so I can distinguish product behavior coverage from harness self-tests and find weak or redundant areas.

**Why this priority**: The repository has root-suite E2E tests, evaluation smoke/integration tests, and harness unit tests. A count alone is misleading; the report must explain what the tests prove.

**Independent Test**: Generate the test meaningfulness report and verify it classifies root-suite E2E, evaluation smoke, integration, product unit, and harness unit tests separately with test and assertion counts.

**Acceptance Scenarios**:

1. **Given** the current repository tests, **When** the test meaningfulness report is generated, **Then** it reports total test definitions, assertion counts, and counts by layer.
2. **Given** tests that contain no assertions, **When** the report is generated, **Then** it flags them as weak signals for human review.
3. **Given** evaluation-created tests and root-suite E2E tests, **When** the report is generated, **Then** it keeps those sources distinct.

---

### User Story 3 - Preserve CI Evidence (Priority: P3)

As a maintainer, I want CI artifacts to include both health trend and test meaningfulness reports, so PR or main failures preserve enough evidence for review without rerunning locally.

**Why this priority**: CI already runs the evaluation gate and uploads run evidence. Adding the new reports to the same artifact improves diagnosis while preserving the existing fork-scoped workflow.

**Independent Test**: Inspect the evaluation workflow and verify both reports are generated with always-run semantics and uploaded with the evaluation evidence artifact.

**Acceptance Scenarios**:

1. **Given** any evaluation CI run, **When** report generation executes, **Then** both run health and test meaningfulness reports are attempted even if the harness failed.
2. **Given** the workflow is running in the fork, **When** artifacts are uploaded, **Then** the artifact includes generated reports under `evaluation/reports/`.
3. **Given** the workflow is not in the fork repository, **When** the job is evaluated, **Then** the existing fork-scope guard remains in effect.

---

### Edge Cases

- Only one readable run exists, so trend comparison must report limited evidence.
- A malformed or missing run artifact should remain a warning, not a crash.
- A test file exists but has no `test(...)` definitions.
- A test definition has no assertions and should be treated as weak evidence.
- Generated reports must not require committing `evaluation/runs/` artifacts.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The run health report MUST include a trend summary derived from the selected readable runs.
- **FR-002**: The trend summary MUST show selected-run status counts and per-layer latest/previous duration comparison when at least two observations exist.
- **FR-003**: The trend summary MUST explicitly state when trend evidence is limited because fewer than two runs are available.
- **FR-004**: The system MUST generate a test meaningfulness report under `evaluation/reports/`.
- **FR-005**: The test meaningfulness report MUST count test definitions and assertion-like checks by test layer.
- **FR-006**: The test meaningfulness report MUST distinguish root-suite E2E tests from fork-created evaluation tests.
- **FR-007**: The test meaningfulness report MUST classify tests into product behavior, product domain rule, smoke journey, page-local behavior, and harness contract categories, and MUST mark unmatched tests as `unknown` rather than dropping them.
- **FR-008**: The test meaningfulness report MUST flag tests with no assertions as weak signals.
- **FR-009**: CI MUST attempt to generate and upload the new report alongside the existing evaluation evidence.
- **FR-010**: The feature MUST avoid changing product source, product fixtures, root package scripts, root Playwright configuration, or upstream push behavior.

### Key Entities

- **Run Trend**: A summary of selected run statuses and layer duration deltas across recent readable evaluation runs.
- **Layer Trend**: A per-layer comparison of latest and previous duration, latest status, slow count, and failed count.
- **Test Inventory Item**: A discovered test definition with file path, layer, source ownership, title, assertion count, and value category.
- **Meaningfulness Summary**: Aggregated counts by layer, source ownership, and value category, plus weak-signal findings.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Maintainers can identify whether each evaluation layer is slower, faster, or unchanged compared with the previous selected run in one report.
- **SC-002**: Maintainers can see the total number of discovered tests and assertion-like checks without manually grepping the repository.
- **SC-003**: The report separates product behavior tests from harness self-tests with no manual classification step.
- **SC-004**: CI artifacts include the generated meaningfulness report on evaluation runs without changing the existing fork-only guard.
- **SC-005**: Existing evaluation gate behavior continues to pass after the change.

## Assumptions

- The existing `workflow_dispatch` mode selector for `gate`, `full`, and `collect-all` remains the mechanism for manual CI runs.
- Cross-CI historical artifact download is out of scope; trend comparison uses readable runs available in the current workspace.
- Heuristic test inventory is acceptable if it is transparent, deterministic, and flags weak evidence rather than claiming full semantic coverage.
- `evaluation/runs/` remains ignored and uncommitted.
