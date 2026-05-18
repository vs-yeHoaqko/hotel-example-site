# Feature Specification: Guided Harness Onboarding

**Feature Branch**: `015-guided-harness-onboarding`
**Created**: 2026-05-18
**Status**: Draft
**Input**: User description: "Build a Speckit-like process optimization for the evaluation harness commonization effort: guide users interactively through what needs to be created, infer what can be inferred, preserve decisions as machine-readable adapter state, validate readiness, and avoid requiring users to know the correct harness process in advance."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Guide Adapter Authoring From Discovery To Draft (Priority: P1)

As a repository maintainer adopting the evaluation harness, I want the system to
inspect my repository, suggest an initial harness adapter, and ask only the
questions it cannot answer safely, so I can create a usable draft without
knowing the current harness process by memory.

**Why this priority**: The commonization blueprint depends on adapter contracts.
Without guided authoring, non-expert adopters still have to infer the correct
sequence and may skip test-layer discovery, artifact policy, ownership, or
unknown-evidence handling.

**Independent Test**: Start from a repository with no adapter state and verify
that the onboarding flow produces a draft adapter record with discovered facts,
explicit assumptions, unanswered items, and recommended next actions.

**Acceptance Scenarios**:

1. **Given** a repository with existing scripts, tests, ignore files, and CI
   files, **When** a maintainer starts onboarding, **Then** discovered facts are
   proposed before the maintainer is asked to answer unresolved questions.
2. **Given** a test layer cannot be confidently classified, **When** the
   onboarding flow reaches layer classification, **Then** the maintainer is
   offered safe choices including deferring the layer instead of being forced to
   claim unsupported coverage.
3. **Given** required adapter fields are still missing after discovery and
   answers, **When** the draft is saved, **Then** those gaps remain visible as
   blocked, warning, or unknown items with a next action.

---

### User Story 2 - Validate Process Readiness Without Running The Full Harness (Priority: P2)

As a harness maintainer, I want a readiness check that reviews the adapter
state before evidence runs, so I can find missing commands, artifact policies,
CI assumptions, and unsafe claims early.

**Why this priority**: A guided flow must not merely collect answers. It must
make the correct process enforceable by showing whether the adopter is ready to
run evidence, review reports, configure CI, or plan later thinning work.

**Independent Test**: Run readiness validation against complete, partial, and
invalid adapter states and verify that each result explains the status, evidence
source, and required next action.

**Acceptance Scenarios**:

1. **Given** a complete adapter draft, **When** readiness is checked, **Then**
   the maintainer sees which onboarding stage can proceed next and which stages
   remain warning-first.
2. **Given** required commands or artifact paths are missing, **When** readiness
   is checked, **Then** the result blocks the next run stage and names the
   missing information.
3. **Given** CI is absent or deliberately local-only, **When** readiness is
   checked, **Then** the result records that choice as a visible warning or
   accepted policy rather than silently assuming GitHub Actions exists.

---

### User Story 3 - Preserve Decisions For Later Agents And Reviewers (Priority: P3)

As a reviewer or later implementation agent, I want the onboarding answers,
inferences, assumptions, and unresolved decisions to be stored durably, so work
can continue without rediscovering the process or relying on chat history.

**Why this priority**: The process optimization only works if each step leaves
reviewable state. Otherwise future agents cannot distinguish confirmed facts
from guesses, and future common-harness extraction may embed accidental local
policy.

**Independent Test**: Complete an onboarding session with both confirmed and
deferred answers, then inspect the saved state and readiness report to verify
that the decision trail is understandable without the original conversation.

**Acceptance Scenarios**:

1. **Given** the onboarding flow inferred a value automatically, **When** the
   state is reviewed later, **Then** the value indicates that it was inferred
   and cites the source used for the inference.
2. **Given** the maintainer overrode a suggested value, **When** the state is
   reviewed later, **Then** the override and rationale remain visible.
3. **Given** a decision was deferred, **When** a later reviewer opens the
   readiness output, **Then** the deferred decision is tied to the next
   recommended action and is not treated as passing.

---

### Edge Cases

- A repository has no existing test scripts or only one runnable test layer.
- Multiple test roots or applications are discovered and cannot be merged into a
  single safe adapter automatically.
- A repository has browser tests but no stable local target or deployed target.
- Existing CI files are present but are not intended for evaluation evidence.
- Generated artifacts are not ignored and could be accidentally committed.
- Feature or ownership mappings cannot be inferred from names or paths.
- A maintainer wants to skip questions and save a partial draft.
- A previous adapter state exists and may conflict with newly discovered facts.
- Local security policy prevents reading or storing some environment details.
- A non-GitHub CI provider or local-only recurring process is used.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The feature MUST provide a guided onboarding flow that starts from
  repository inspection and leads the maintainer through adapter drafting,
  validation, and next actions in a fixed, reviewable order.
- **FR-002**: The onboarding flow MUST infer available facts from the repository
  before asking questions, and MUST distinguish inferred values from
  maintainer-confirmed values.
- **FR-003**: The onboarding flow MUST ask targeted questions only for decisions
  that cannot be inferred safely, including test-layer ownership, target
  environment, artifact policy, behavior mapping, quality policy, and CI or
  local-only execution policy.
- **FR-004**: The feature MUST let maintainers defer uncertain decisions without
  losing visibility; deferred items MUST appear as blocked, warning, or unknown
  readiness results as appropriate.
- **FR-005**: The feature MUST save adapter state in a durable, machine-readable
  form that records discovered facts, confirmed answers, inferred assumptions,
  overrides, deferred decisions, and next actions.
- **FR-006**: The feature MUST validate adapter state before evidence execution
  and identify missing, contradictory, unsafe, or unsupported settings.
- **FR-007**: Validation results MUST preserve the existing harness semantics
  for pass, warning, unknown, blocked, weak-signal, and unmapped evidence rather
  than collapsing partial readiness into success.
- **FR-008**: The feature MUST produce a human-readable readiness summary that
  explains the current onboarding stage, blocking gaps, warnings, unknowns, and
  next recommended action.
- **FR-009**: The feature MUST treat CI as an adapter policy, not as a required
  GitHub Actions workflow; CI absence, local-only operation, or non-GitHub CI
  MUST be representable.
- **FR-010**: The feature MUST prevent evaluation-run, report, CI-template, or
  E2E-thinning steps from being presented as ready until their prerequisite
  adapter decisions are complete or explicitly accepted as warning-first.
- **FR-011**: The feature MUST detect when generated artifact paths are not
  ignored and MUST block or warn before onboarding proceeds to evidence runs.
- **FR-012**: The feature MUST support re-running onboarding against existing
  adapter state and MUST surface conflicts between saved decisions and newly
  discovered repository facts.
- **FR-013**: The feature MUST NOT create or modify product source, product
  fixtures, root package scripts, root browser-test configuration, root E2E
  source files, or GitHub Actions workflows as part of the initial onboarding
  flow.

### Key Entities

- **Onboarding Session**: A guided process instance with a current stage,
  discovered facts, questions asked, answers recorded, and next actions.
- **Repository Discovery Fact**: A fact inferred from repository files, such as
  available test commands, test roots, CI files, ignore rules, or target hints.
- **Adapter State**: The durable record that binds common harness concepts to a
  specific repository through local layers, targets, artifacts, mappings,
  policies, and governance choices.
- **Onboarding Question**: A targeted prompt shown only when a required decision
  cannot be inferred safely.
- **Maintainer Answer**: A confirmed, overridden, or deferred response that
  becomes part of adapter state.
- **Readiness Finding**: A validation result with status, rationale, evidence
  source, affected stage, and next action.
- **Readiness Summary**: A human-readable review surface that explains whether
  the adapter is ready for first evidence, report review, CI setup, or later
  extraction work.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: A maintainer can create an initial adapter draft from a repository
  with existing tests in under 10 minutes while answering no more than 10
  targeted questions.
- **SC-002**: Every saved adapter value is labeled as discovered, inferred,
  confirmed, overridden, or deferred, and each non-confirmed value has a visible
  source or next action.
- **SC-003**: Readiness validation identifies missing required commands,
  artifact policy gaps, CI policy gaps, and unmapped behavior decisions before a
  first evidence run is marked ready.
- **SC-004**: CI can be represented as GitHub Actions, another provider,
  local-only, or deferred without changing workflow files during onboarding.
- **SC-005**: Re-running onboarding against existing state reports conflicts
  between saved decisions and current repository facts instead of overwriting
  them silently.
- **SC-006**: No product source, product fixtures, root package scripts, root
  browser-test configuration, root E2E source files, or GitHub Actions workflows
  are changed while completing the initial guided onboarding feature.

## Assumptions

- The feature builds on the 014 commonization blueprint and does not replace the
  existing evaluation runner or report generators.
- The first implementation should optimize the authoring and validation process
  for adapter state, not generate CI workflow files or thin E2E tests.
- Repository maintainers are technical enough to confirm test commands and
  governance choices, but should not need to know the evaluation-harness process
  order in advance.
- Partial onboarding is useful when it records gaps honestly and provides next
  actions.
- Chat history is not a durable source of truth; adapter state and readiness
  summaries are the durable handoff artifacts.
