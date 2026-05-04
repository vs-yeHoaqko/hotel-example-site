# Feature Specification: Evaluation Quality Gate and Harness Hardening

**Feature Branch**: `011-evaluation-quality-gate`
**Created**: 2026-05-05
**Status**: Draft
**Input**: User description: "Improve the evaluation harness by adding quality gate behavior, run-health baselines, stronger flaky/environment classification, and an E2E thinning execution stage."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Turn Reports Into a Quality Gate (Priority: P1)

As a maintainer, I want the existing health and meaningfulness reports to produce a clear quality gate outcome, so CI can warn or fail on evaluation regressions instead of only preserving reports for manual reading.

**Why this priority**: The harness now produces useful evidence, but the evidence is still mostly informational. A gate outcome makes regressions visible at review time and gives maintainers a repeatable decision point.

**Independent Test**: Run the evaluation gate against representative report data and verify that it produces a deterministic pass, warning, or fail result with cited reasons and artifact paths.

**Acceptance Scenarios**:

1. **Given** current reports stay within configured thresholds, **When** the quality gate is evaluated, **Then** the gate result is pass and cites the reports used.
2. **Given** weak-signal tests increase or meaningful test totals drop beyond the configured tolerance, **When** the quality gate is evaluated, **Then** the gate result records a warning or failure with the exact threshold that was breached.
3. **Given** the feature is in its initial rollout, **When** new thresholds are introduced, **Then** they default to warning-only unless the policy explicitly marks the threshold as fail-enforced.

---

### User Story 2 - Compare Run Health Against a Baseline (Priority: P2)

As a maintainer, I want run health to be compared with a stable baseline, so recurring slowdowns, timeouts, and layer regressions can be detected without depending only on the previous local run.

**Why this priority**: Recent-run trend data is useful but volatile. A committed baseline gives reviewers a stable reference while still allowing baseline updates to be explicit and reviewable.

**Independent Test**: Generate run health evidence with seeded layer duration and status data, then verify that baseline comparisons identify slower, faster, unchanged, missing, and newly failing layers.

**Acceptance Scenarios**:

1. **Given** a layer exceeds its baseline duration tolerance, **When** run health is evaluated, **Then** the result identifies the layer, observed duration, baseline duration, and tolerance.
2. **Given** a baseline has no matching observation in the selected run, **When** the report is generated, **Then** the result records limited evidence rather than passing silently.
3. **Given** a baseline update is needed, **When** maintainers review the change, **Then** the committed baseline file shows the intended new reference values without committing per-run artifacts.

---

### User Story 3 - Separate Product, Flaky, Environment, and Harness Failures (Priority: P3)

As a maintainer, I want failures and timeouts to be classified into actionable categories, so I can tell whether to inspect product behavior, retry flaky coverage, fix the environment, or repair the harness.

**Why this priority**: The harness already preserves failure evidence, but ambiguous failures still cost review time. Stronger classification makes the next action more obvious and reduces unnecessary investigation.

**Independent Test**: Evaluate representative failure evidence and verify that each known pattern maps to a deterministic classification and recommended next action.

**Acceptance Scenarios**:

1. **Given** a failed assertion tied to product-visible behavior, **When** diagnostics are generated, **Then** the result classifies it as a product regression candidate.
2. **Given** a timeout or browser startup issue with environment signals, **When** diagnostics are generated, **Then** the result classifies it as environment evidence and recommends environment-first investigation.
3. **Given** repeated intermittent failures with later passing retries, **When** diagnostics are generated, **Then** the result classifies them as flaky evidence and keeps the underlying test outcome visible.
4. **Given** evidence is insufficient for a confident category, **When** diagnostics are generated, **Then** the result uses `unknown` and cites the missing evidence.

---

### User Story 4 - Execute E2E Thinning Safely (Priority: P4)

As a maintainer, I want reviewed E2E thinning candidates to move through an explicit execution decision, so redundant root-suite assertions can eventually be reduced without losing the representative journeys that prove the product still works.

**Why this priority**: The harness has identified thinning opportunities, but changing root-suite E2E coverage is riskier than adding evaluation reports. The next stage must preserve lower-layer evidence, keep required smoke journeys, and avoid base-repository drift unless a human explicitly approves a root-suite edit.

**Independent Test**: Review thinning candidates with lower-layer evidence and verify that the execution output distinguishes approved-to-thin, blocked, deferred, and keep-e2e decisions without changing root-suite files automatically.

**Acceptance Scenarios**:

1. **Given** a candidate has lower-layer evidence and human review approval, **When** thinning execution is evaluated, **Then** it is marked approved-to-thin with the exact root-suite assertion and replacement evidence.
2. **Given** a candidate lacks lower-layer evidence, **When** thinning execution is evaluated, **Then** it remains blocked and lists the missing integration or unit coverage.
3. **Given** a candidate belongs to the reservation-completion representative browser journey, **When** thinning execution is evaluated, **Then** the journey remains keep-e2e.
4. **Given** a root-suite source edit would be required, **When** the thinning output is produced, **Then** it remains a reviewable proposal unless the task explicitly authorizes that edit.

---

### Edge Cases

- Baseline files are missing, malformed, or older than the report schema.
- Only one readable run exists, making baseline and trend evidence partial.
- Test meaningfulness totals change because tests were renamed or moved rather than added or removed.
- A failure contains signals for more than one category, such as timeout plus assertion failure.
- Thinning candidates reference root-suite assertions that no longer exist after upstream changes.
- CI runs in a repository other than the fork and must keep the existing fork guard.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The harness MUST produce a quality gate result that summarizes pass, warning, and fail conditions from available evaluation evidence.
- **FR-002**: Quality gate thresholds MUST be committed as reviewable evaluation configuration and MUST identify whether each threshold is warning-only or fail-enforced.
- **FR-003**: The quality gate MUST evaluate test meaningfulness regressions, including weak-signal tests, total discovered tests, assertion-like checks, and source/category breakdown changes.
- **FR-004**: Run health MUST support comparison against a committed baseline for layer status, duration, timeout, and slow-run evidence.
- **FR-005**: Baseline comparison MUST report missing, newly observed, improved, unchanged, and regressed layers without silently discarding partial evidence.
- **FR-006**: Baseline updates MUST be explicit committed changes and MUST NOT require committing `evaluation/runs/` artifacts.
- **FR-007**: Failure diagnostics MUST classify known evidence into product-regression candidate, flaky evidence, environment evidence, harness-bug candidate, or `unknown`.
- **FR-008**: Failure diagnostics MUST include a recommended next action and the evidence used for the classification.
- **FR-009**: E2E thinning execution MUST record approved-to-thin, blocked, deferred, and keep-e2e outcomes for reviewed candidates.
- **FR-010**: E2E thinning execution MUST require lower-layer evidence before any candidate can be approved-to-thin.
- **FR-011**: E2E thinning execution MUST preserve the reservation-completion representative browser journey and any other keep-e2e anchors.
- **FR-012**: The feature MUST avoid changing product source, product fixtures, root package scripts, root Playwright configuration, or upstream push behavior.
- **FR-013**: Root-suite E2E source edits MUST remain explicit human-reviewed changes and MUST NOT happen automatically as a side effect of report or gate generation.
- **FR-014**: CI MUST attempt to generate and upload the quality gate, run health, test meaningfulness, diagnostics, and thinning execution evidence with the existing fork-only guard preserved.

### Key Entities

- **Quality Gate Result**: A consolidated outcome with status, threshold breaches, evidence sources, and recommended follow-up.
- **Quality Threshold**: A reviewable policy item that defines a metric, tolerance, and enforcement level.
- **Run Health Baseline**: Stable reference values for layer status, duration, and known slow or timeout evidence.
- **Failure Classification**: A categorized diagnostic record with confidence, evidence, and recommended next action.
- **Thinning Execution Decision**: A reviewed E2E thinning outcome that links a root-suite assertion to lower-layer evidence and a final decision state.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Every local quality-gate command and CI evaluation artifact sequence produces a quality gate result with a final status and at least one cited evidence source.
- **SC-002**: Maintainers can identify baseline regressions for each evaluated layer from one report without manually comparing run artifacts.
- **SC-003**: Seeded diagnostic cases for product, flaky, environment, harness, and unknown evidence classify deterministically.
- **SC-004**: No candidate can be marked approved-to-thin unless it has lower-layer evidence and does not violate keep-e2e anchors.
- **SC-005**: Existing gate behavior continues to pass when current evidence remains within the initial warning-first thresholds.
- **SC-006**: The implementation changes no product source, product fixtures, root package scripts, root Playwright configuration, or upstream push behavior.

## Assumptions

- Initial quality thresholds are warning-first unless there is already stable evidence that a fail-enforced threshold is safe.
- The fork remains the only repository where CI changes run; upstream contribution remains out of scope.
- Root-suite E2E edits are treated as separately reviewable changes because those files are likely to drift with the base repository.
- The first thinning execution stage can produce reviewable decisions and validation evidence without automatically rewriting root-suite tests.
- Per-run evidence under `evaluation/runs/` remains ignored and uncommitted.
