# Feature Specification: CI Gate Summary and Enforcement

**Feature Branch**: `012-ci-gate-summary-and-enforcement`
**Created**: 2026-05-05
**Status**: Draft
**Input**: User description: "Improve the evaluation harness by making CI results easier to review and by enforcing only the safest quality gate failure conditions. Keep the design fork-local and avoid touching files likely to change in the base repository."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Read Gate Results Directly From CI (Priority: P1)

As a maintainer reviewing a change, I want the evaluation result summarized directly in the CI run, so I can identify the gate status, failing layer, and next diagnostic action without downloading artifacts first.

**Why this priority**: The harness already produces useful reports, but review still requires opening artifacts. The next improvement should reduce review friction and make the first failure signal visible where maintainers already look.

**Independent Test**: Run the evaluation workflow with representative passing and failing evidence and verify that the CI-visible summary includes the final gate status, evaluated mode, target, selected report paths, and recommended next action.

**Acceptance Scenarios**:

1. **Given** the evaluation gate passes, **When** a maintainer opens the CI run summary, **Then** the summary shows a pass status, the evaluated mode and target, and links or paths to the generated reports.
2. **Given** the evaluation gate fails, **When** a maintainer opens the CI run summary, **Then** the summary shows the failed status, the layer or threshold responsible, the failure classification, and the recommended next action.
3. **Given** report generation succeeds after a failing evaluation, **When** the CI run completes, **Then** the summary still includes the latest available quality gate and run-health evidence.

---

### User Story 2 - Enforce Safe Hard Failures (Priority: P2)

As a maintainer, I want non-negotiable evaluation integrity problems to fail the gate, so broken harness evidence cannot be mistaken for a healthy product or a harmless warning.

**Why this priority**: Current thresholds are intentionally conservative. The next step should harden only conditions that are clearly unsafe to ignore, while keeping timing and trend-based signals advisory until enough history exists.

**Independent Test**: Evaluate seeded evidence for environment failure, unreadable required summaries, malformed report input, smoke journey failure, and warning-only threshold breaches; verify that only the explicitly fail-enforced cases fail the gate.

**Acceptance Scenarios**:

1. **Given** required evidence is missing or unreadable, **When** the quality gate is evaluated, **Then** the result fails and explains which evidence is missing.
2. **Given** the environment preflight fails, **When** the gate result is evaluated, **Then** the result fails with an environment-first recommended action.
3. **Given** the reservation smoke journey fails, **When** the gate result is evaluated, **Then** the result fails and points reviewers to product or harness diagnostics.
4. **Given** only timing, slow-layer, or meaningfulness warning thresholds are breached, **When** the gate result is evaluated, **Then** the result remains warning-only unless policy explicitly marks the threshold as fail-enforced.

---

### User Story 3 - Preserve Fork-Local Boundaries (Priority: P3)

As a fork maintainer, I want the improvement to stay isolated to evaluation harness ownership, so the fork remains easy to sync with the base repository and cannot accidentally affect upstream.

**Why this priority**: The repository is a fork. The evaluation harness should continue to evolve without increasing conflicts in base-owned product files or changing upstream behavior.

**Independent Test**: Review the implementation diff and verify that changes are limited to evaluation harness files and fork-local CI configuration, with no product source, root package scripts, root test config, or upstream push behavior changed.

**Acceptance Scenarios**:

1. **Given** the feature is implemented, **When** maintainers inspect the diff, **Then** product source, product fixtures, root package scripts, and root Playwright configuration are unchanged.
2. **Given** the CI workflow runs outside the fork, **When** the evaluation job is considered, **Then** the existing fork guard still prevents unintended execution.
3. **Given** a future base repository sync changes product or root test files, **When** this feature is compared, **Then** the evaluation improvement minimizes conflict risk by staying in harness-owned files.

---

### Edge Cases

- The evaluation command fails before the quality gate report is generated.
- The quality gate report exists but is malformed, stale, or missing its final status.
- Multiple layers fail in the same run and the summary must choose a concise primary failure while preserving links to full evidence.
- A warning-only threshold is breached together with a fail-enforced threshold.
- CI artifact upload fails after reports are generated.
- The workflow is evaluated in a repository other than the fork.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The evaluation workflow MUST produce a CI-visible summary for every evaluation run that reaches the reporting stage.
- **FR-002**: The CI-visible summary MUST include final gate status, evaluation mode, evaluation target, primary failure reason when available, recommended next action, and report locations.
- **FR-003**: The summary MUST remain useful when evaluation fails before all reports are available by showing the latest available evidence and clearly identifying missing evidence.
- **FR-004**: The quality gate MUST fail when required evidence is missing, unreadable, or malformed.
- **FR-005**: The quality gate MUST fail when environment preflight fails for a required gate run.
- **FR-006**: The quality gate MUST fail when the required smoke reservation-completion journey fails.
- **FR-007**: The quality gate MUST keep timing, slow-layer, flaky, and meaningfulness trend thresholds warning-only unless a reviewed policy explicitly marks them fail-enforced.
- **FR-008**: Fail-enforced and warning-only policies MUST be visible in committed evaluation configuration or generated reports so reviewers can tell why a result passed, warned, or failed.
- **FR-009**: The feature MUST preserve generated run artifacts as operational evidence and MUST NOT require committing per-run output.
- **FR-010**: The feature MUST NOT change product source, product fixtures, root package scripts, root Playwright configuration, or upstream push behavior.
- **FR-011**: The existing fork-only CI guard MUST remain in force.
- **FR-012**: The implementation MUST leave manual full and collect-all evaluation modes available for deeper diagnosis.

### Key Entities

- **CI Gate Summary**: A concise review-facing result that presents gate status, mode, target, primary issue, recommended action, and report references.
- **Enforcement Policy**: A reviewable rule that states whether a quality signal is fail-enforced or warning-only.
- **Primary Failure**: The most actionable failure or threshold breach selected for first review while full evidence remains available.
- **Required Evidence**: The minimum reports, summaries, and preflight signals needed to trust a gate decision.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: For passing and failing gate runs, maintainers can identify the gate status and first recommended action from the CI summary in under one minute.
- **SC-002**: Seeded missing, malformed, environment-failed, and smoke-failed evidence produces a failing quality gate result every time.
- **SC-003**: Seeded timing, slow-layer, flaky, and meaningfulness warning cases do not fail the gate unless explicitly configured as fail-enforced.
- **SC-004**: Every fail-enforced gate result cites at least one evidence source and one policy reason.
- **SC-005**: The implementation changes no product source, product fixtures, root package scripts, root Playwright configuration, or upstream push behavior.
- **SC-006**: Manual full and collect-all runs continue to produce their existing evidence reports.

## Assumptions

- Reviewers use the CI run page as the first place to inspect evaluation results.
- The first enforcement step should prioritize evidence integrity and required smoke coverage over timing or trend-based quality thresholds.
- Current slow/flaky and meaningfulness signals are useful for review but need more history before becoming default hard failures.
- The fork remains the only repository where evaluation CI should execute automatically.
- Changes should prefer evaluation-owned files and fork-local CI configuration because the base repository may continue to change independently.
