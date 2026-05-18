# Feature Specification: Evaluation Harness Commonization

**Feature Branch**: `014-evaluation-harness-commonization`
**Created**: 2026-05-18
**Status**: Draft
**Input**: User description: "Confirm 013 is merged, create 014, and advance the investigation of what should be included when extracting the current evaluation harness as a reusable common harness, especially how users who do not know the process can still create the expected harness through the correct process."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Separate Common Core From Local Policy (Priority: P1)

As a harness maintainer, I want a reviewable commonization blueprint that
separates reusable harness capabilities from project-specific policy, so I can
decide what can be extracted without accidentally copying hotel-site-specific
assumptions into a shared harness.

**Why this priority**: Reuse is only safe when the boundary is explicit. The
current harness mixes general orchestration, evidence, reporting, and CI
behavior with local feature mappings, ownership records, thresholds, and
repository guardrails.

**Independent Test**: Review the blueprint against the current harness and
verify that every major capability is classified as reusable core, adapter
contract, project policy, or intentionally local, with a rationale and migration
risk.

**Acceptance Scenarios**:

1. **Given** the current evaluation harness assets, **When** a maintainer reads
   the commonization blueprint, **Then** the runner, evidence model, reporting,
   failure guidance, environment checks, CI summary, feature mapping, ownership,
   thresholds, and local repository constraints are each assigned to a clear
   extraction category.
2. **Given** a capability depends on this repository's hotel domain, browser
   routes, or fork policy, **When** it is listed in the blueprint, **Then** it is
   marked as project-specific and paired with the input or adapter a future
   adopter would provide instead.
3. **Given** a proposed common capability could change existing evaluation
   behavior, **When** it appears in the blueprint, **Then** the blueprint states
   the expected user value, compatibility risk, and rollback path before any
   extraction work is planned.

---

### User Story 2 - Guide Non-Expert Adopters Through The Right Process (Priority: P2)

As a future adopter who does not know the evaluation-harness process, I want a
guided onboarding workflow that tells me what to inspect, configure, validate,
and review, so I can produce a trustworthy harness without memorizing the
current repository's history.

**Why this priority**: A shared harness is valuable only if correct use is the
default path. Users should not have to know when to run preflight checks, how to
seed feature mappings, when unknown evidence is acceptable, or why E2E thinning
requires lower-layer evidence.

**Independent Test**: Walk through the proposed workflow from the perspective
of a maintainer entering a new repository and verify that each step has a clear
input, output, stopping condition, and next action.

**Acceptance Scenarios**:

1. **Given** a repository with existing tests but no harness configuration,
   **When** an adopter follows the workflow, **Then** they are led through
   discovery, configuration, evidence generation, report review, CI integration,
   and governance decisions in the intended order.
2. **Given** required environment checks, evidence mappings, or thresholds are
   missing, **When** the workflow reaches validation, **Then** it reports the
   missing items as blocked, warning, or unknown instead of treating the harness
   as passing.
3. **Given** an adopter wants to reduce broad browser tests, **When** the
   workflow reaches thinning decisions, **Then** it requires lower-layer
   evidence and a reviewable decision record before any existing test is
   changed.

---

### User Story 3 - Define Readiness Gates For Future Extraction (Priority: P3)

As a reviewer, I want explicit readiness gates for turning the blueprint into a
shared harness implementation, so future tasks do not begin extraction before
the required evidence, examples, and compatibility decisions are agreed.

**Why this priority**: Premature extraction can create a shared package that is
hard to adopt, hard to validate, or too tightly coupled to this fork. Readiness
gates make the next implementation phase reviewable.

**Independent Test**: Inspect the readiness gates and verify that they cover
minimum examples, configuration contracts, migration checks, non-goals, and
human approval points before implementation tasks can be generated.

**Acceptance Scenarios**:

1. **Given** the blueprint is complete, **When** a reviewer checks extraction
   readiness, **Then** they can see which contracts, sample configurations,
   fixture repositories, and documentation must exist before common code is
   created.
2. **Given** a proposed shared behavior could hide weak or unmapped evidence,
   **When** readiness is assessed, **Then** the behavior is blocked until the
   unknown, warning, and unmapped states remain visible to adopters.
3. **Given** a future extraction task would touch files outside the evaluation
   harness boundary, **When** readiness is assessed, **Then** it must name the
   rationale, expected blast radius, and rollback path before the task is
   allowed to proceed.

---

### Edge Cases

- A target repository has no browser tests, no unit tests, or only one test
  layer.
- A target repository has multiple applications or packages that need separate
  harness instances.
- Existing tests run but produce no structured result evidence.
- Generated run artifacts are not ignored by default and could be committed by
  accident.
- Feature mappings cannot be inferred confidently from file names or test
  titles.
- Historical health warnings exist while the latest run passes.
- A maintainer wants immediate E2E thinning before lower-layer evidence exists.
- CI integration is unavailable, optional, or governed by repository-specific
  policy.
- A shared default conflicts with local security, privacy, or fork-drift
  constraints.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The feature MUST produce a reviewer-readable commonization
  blueprint for the current evaluation harness.
- **FR-002**: The blueprint MUST classify each current major harness capability
  as reusable core, adapter contract, project policy, generated evidence, or
  intentionally local.
- **FR-003**: The blueprint MUST explain why each capability belongs in its
  classification and what risk would result from classifying it incorrectly.
- **FR-004**: The blueprint MUST identify the project-specific inputs a future
  adopter must provide, including test roots, evaluated behaviors, ownership
  rules, target environments, quality thresholds, and repository governance
  constraints.
- **FR-005**: The blueprint MUST define a guided onboarding workflow that leads
  adopters from repository inspection through configuration, first run, report
  review, quality gate interpretation, and CI or recurring usage.
- **FR-006**: Each onboarding step MUST state its required input, expected
  output, validation signal, stopping condition, and next recommended action.
- **FR-007**: The workflow MUST make missing evidence, weak signals, unknown
  mappings, and unmapped tests visible instead of treating them as passing
  coverage.
- **FR-008**: The workflow MUST prevent or clearly block E2E thinning decisions
  until lower-layer evidence and a reviewable decision record exist.
- **FR-009**: The blueprint MUST define readiness gates for future extraction,
  including minimum examples, configuration contracts, evidence contracts,
  documentation expectations, and rollback requirements.
- **FR-010**: The blueprint MUST identify which existing harness reports and
  summaries should remain stable user-facing contracts during commonization.
- **FR-011**: The blueprint MUST identify which existing local policies should
  remain repository-local unless a later approved specification promotes them
  to shared behavior.
- **FR-012**: The feature MUST NOT change product source, product fixtures,
  root package scripts, root browser-test configuration, root E2E source files,
  or upstream push behavior.
- **FR-013**: The feature MUST record open decisions that require human review
  before implementation tasks for shared-code extraction are generated.

### Key Entities

- **Commonization Blueprint**: The review artifact that explains what to
  extract, what to parameterize, what to keep local, and why.
- **Capability Inventory**: The categorized list of current harness functions,
  reports, settings, policies, and evidence contracts.
- **Adapter Contract**: The adopter-provided information that lets a common
  harness run against a specific repository without embedding local behavior.
- **Onboarding Workflow**: The ordered process a non-expert adopter follows to
  create, validate, and operate a harness.
- **Readiness Gate**: A review condition that must be satisfied before future
  extraction or automation work proceeds.
- **Project Policy**: A local rule, threshold, mapping, or governance choice
  that should not become a shared default without explicit review.
- **Decision Record**: A durable explanation of an inclusion, exclusion,
  migration, thinning, or enforcement decision.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: A reviewer can identify the proposed common core, adapter
  contracts, and local-only policies from one blueprint in under 5 minutes.
- **SC-002**: Every current major harness surface named in the evaluation
  README is represented in the capability inventory with a classification and
  rationale.
- **SC-003**: The onboarding workflow contains no hidden jumps: every step has
  an input, output, validation signal, stopping condition, and next action.
- **SC-004**: At least one edge case is documented for missing layers, unmapped
  evidence, generated artifact handling, CI absence, and premature E2E
  thinning.
- **SC-005**: Future extraction work can be planned from the readiness gates
  without needing to rediscover the commonization boundary from raw repository
  files.
- **SC-006**: No product source, product fixtures, root package scripts, root
  browser-test configuration, root E2E source files, or upstream push behavior
  are changed while producing the blueprint.

## Assumptions

- This feature is a commonization investigation and blueprint, not the first
  shared-code extraction task.
- The current evaluation harness is the source material for the inventory, but
  hotel-site-specific behavior should not become shared behavior by default.
- The initial target adopters are maintainers of repositories that need a
  layered evaluation gate and reviewable evidence, not end users of the hotel
  sample site.
- Generated run evidence remains operational data and should stay uncommitted
  unless a later feature explicitly defines stable example fixtures.
- Automatic repair remains out of scope; guidance and decision records remain
  non-mutating.
