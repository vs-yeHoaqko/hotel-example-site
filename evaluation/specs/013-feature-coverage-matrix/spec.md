# Feature Specification: Feature Coverage Matrix

**Feature Branch**: `013-feature-coverage-matrix`
**Created**: 2026-05-05
**Status**: Draft
**Input**: User description: "Show which user-facing functions and journeys are covered, which tests prove them, and whether each function passed or failed in the latest evaluation run."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Review Function Status at a Glance (Priority: P1)

As a maintainer, I want one human-readable matrix showing each evaluated function or journey and its latest status, so I can answer what passed, what failed, and what is only warning-level without reading raw test output.

**Why this priority**: The harness already knows layer status, ownership, and test file results, but the information is spread across reports. A matrix makes the result understandable as product behavior rather than only as test files.

**Independent Test**: Generate the matrix from the latest complete evaluation evidence and verify that login, signup, plans, mypage, redirection, reservation, smoke journey, reservation form behavior, and billing calculation rows show status, layer, evidence, and report references.

**Acceptance Scenarios**:

1. **Given** the latest evaluation run passes all selected layers, **When** a maintainer opens the matrix, **Then** every detected function row shows a passing latest status with its owning or proving test evidence.
2. **Given** one function has a failed test in the latest run, **When** the matrix is generated, **Then** that function row shows a failed status, the failing evidence, and the recommended next action.
3. **Given** the latest run passes but historical run-health warnings exist, **When** the matrix is generated, **Then** affected rows show warning-level health notes without being marked as failed.

---

### User Story 2 - Trace Functions to Test Layers (Priority: P2)

As a maintainer, I want each function row to show the test layer and evidence path that prove it, so I can decide whether coverage belongs in unit, integration, smoke E2E, or full E2E.

**Why this priority**: Coverage is only actionable when reviewers can see the layer responsible for each behavior. This also supports future E2E thinning decisions.

**Independent Test**: Inspect the generated matrix and verify that each row lists at least one evidence source, layer, and test count, and that existing ownership records remain visible for behaviors already mapped to lower layers.

**Acceptance Scenarios**:

1. **Given** ownership records exist for billing, reservation form behavior, and localized reservation completion, **When** the matrix is generated, **Then** those rows include the owner layer and mapped evidence.
2. **Given** root E2E files prove broader journeys, **When** the matrix is generated, **Then** those rows are grouped by journey and locale where the evidence allows it.
3. **Given** a function has tests in multiple layers, **When** the matrix is generated, **Then** the row keeps the strongest or most direct evidence visible while preserving the additional evidence reference.

---

### User Story 3 - Make Coverage Gaps and Ambiguity Visible (Priority: P3)

As a maintainer, I want the matrix to identify weak, unknown, or unmapped coverage, so I can plan the next improvement without guessing which behavior needs better evidence.

**Why this priority**: A coverage matrix is useful only if it distinguishes "passed", "failed", "warning", and "unknown" rather than hiding missing mapping behind a generic pass.

**Independent Test**: Generate the matrix from fixture evidence with missing ownership, missing latest results, and weak-signal tests; verify that the matrix marks those rows as unknown or warning with clear notes.

**Acceptance Scenarios**:

1. **Given** a test file is discovered but cannot be mapped to a function, **When** the matrix is generated, **Then** it appears as unmapped evidence rather than being silently ignored.
2. **Given** a function has no latest run result, **When** the matrix is generated, **Then** the function status is unknown with the missing evidence noted.
3. **Given** weak-signal tests exist, **When** the matrix is generated, **Then** the affected coverage is marked warning rather than pass.

---

### Edge Cases

- Latest run evidence is missing, malformed, or incomplete.
- A test title or file path cannot be confidently mapped to a product function.
- Multiple locales cover the same journey with different results.
- A function is covered by both lower-layer tests and broad E2E journeys.
- Historical run-health warnings exist for a function whose latest test result passed.
- Generated per-run artifacts exist locally but should remain uncommitted.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The harness MUST produce a human-readable feature coverage matrix report.
- **FR-002**: Each matrix row MUST identify a function or journey, latest status, test layer, evidence path, and reviewer-facing note.
- **FR-003**: The matrix MUST include rows derived from latest evaluation run evidence and existing ownership records.
- **FR-004**: The matrix MUST include full E2E journey evidence for login, signup, plans, mypage, redirection, and reservation where latest full E2E evidence is available.
- **FR-005**: The matrix MUST include evaluation smoke, integration, and unit evidence where latest evidence is available.
- **FR-006**: The matrix MUST distinguish pass, fail, warn, and unknown status.
- **FR-007**: The matrix MUST mark historical health concerns as warning-level notes without converting a latest passing function into a failure.
- **FR-008**: The matrix MUST surface unmapped or weak coverage evidence rather than silently discarding it.
- **FR-009**: The matrix MUST provide enough report paths for a reviewer to find raw evidence when deeper diagnosis is needed.
- **FR-010**: The feature MUST NOT require committing generated `evaluation/runs/` artifacts.
- **FR-011**: The feature MUST NOT change product source, product fixtures, root package scripts, root Playwright configuration, root E2E source files, or upstream push behavior.
- **FR-012**: The CI-visible evaluation summary SHOULD reference the coverage matrix once the matrix report exists.

### Key Entities

- **Coverage Matrix**: The human-readable report listing functions, statuses, layers, evidence, and notes.
- **Function Coverage Row**: A single function or journey status record with test evidence and reviewer guidance.
- **Evidence Source**: A latest run result, ownership record, meaningfulness record, or health warning that supports a coverage row.
- **Coverage Status**: One of pass, fail, warn, or unknown.
- **Unmapped Evidence**: Test evidence that exists but cannot yet be confidently tied to a function or journey.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Maintainers can identify which evaluated functions passed, failed, warned, or are unknown from one report in under one minute.
- **SC-002**: The matrix includes at least one row for each currently visible journey family: login, signup, plans, mypage, redirection, reservation, reservation form behavior, smoke reservation completion, and billing calculation.
- **SC-003**: Every matrix row includes at least one evidence path or an explicit missing-evidence note.
- **SC-004**: A latest failed function fixture produces a failed row, and a historical-only warning fixture produces a warning row without failing latest status.
- **SC-005**: Unmapped discovered tests appear in a dedicated section or row group.
- **SC-006**: The implementation changes no product source, product fixtures, root package scripts, root Playwright configuration, root E2E source files, or upstream push behavior.

## Assumptions

- The first version can infer function names from existing ownership records and stable test file naming.
- The matrix is review guidance, not semantic code coverage instrumentation.
- Latest run evidence is the primary status source; run-health history can add warnings.
- Per-run evidence stays under ignored `evaluation/runs/` and remains uncommitted by default.
- Future refinements may add explicit feature IDs if inferred mapping becomes too coarse.
