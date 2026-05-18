# Feature Specification: Harness Onboarding Skill

**Feature Branch**: `016-harness-onboarding-skill`
**Created**: 2026-05-18
**Status**: Draft
**Input**: User description: "Create a Skill that wraps the 015 guided harness onboarding CLI workflow. Keep the tree clean before starting, and place the Skill under evaluation rather than .agents/skills because upstream may add folders later."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Use A Path-Based Skill For Harness Onboarding (Priority: P1)

As a maintainer using Codex on this repository, I want a repo-local Skill that
explains how to run the 015 onboarding commands in the correct order, so I can
guide adapter creation without memorizing the process or relying on chat
history.

**Why this priority**: The 015 CLI gives the project a correct process, but an
agent still needs concise procedural instructions to decide when to dry-run,
when to ask the user, when to write state, and when to validate readiness.

**Independent Test**: Read the Skill from its path and verify that an agent can
identify the correct command sequence, expected outputs, stopping conditions,
and forbidden actions without loading the 015 design artifacts first.

**Acceptance Scenarios**:

1. **Given** a user asks to onboard or validate the evaluation harness adapter,
   **When** an agent uses the Skill, **Then** it runs dry-run discovery before
   writing adapter state.
2. **Given** dry-run output contains pending questions or conflicts, **When**
   the Skill is followed, **Then** the agent summarizes those items and asks for
   user decisions before writing state.
3. **Given** adapter state is written, **When** the Skill is followed, **Then**
   the agent validates readiness and reports blocked, warning, unknown, and pass
   states distinctly.

---

### User Story 2 - Keep Skill Storage Evaluation-Local (Priority: P2)

As a repository maintainer, I want the onboarding Skill stored under the
evaluation boundary instead of `.agents/skills`, so future upstream repository
changes are less likely to conflict with this local harness workflow.

**Why this priority**: The repository is a fork. Keeping the Skill under
`evaluation/` follows the harness isolation principle and avoids occupying
paths that upstream or shared agent infrastructure may later use.

**Independent Test**: Inspect the changed files and verify the Skill lives under
`evaluation/skills/` while `.agents/skills/` remains untouched.

**Acceptance Scenarios**:

1. **Given** the Skill is added, **When** file boundaries are reviewed, **Then**
   the Skill directory is under `evaluation/skills/harness-onboarding/`.
2. **Given** future agents need the Skill, **When** they read repository
   documentation, **Then** they can find the path-based Skill without relying on
   automatic discovery from `.agents/skills`.

---

### User Story 3 - Prevent Unsafe Automation Through Skill Rules (Priority: P3)

As a reviewer, I want the Skill to preserve the 015 safety boundaries, so agents
do not accidentally generate CI workflows, run repair mode, thin E2E tests, or
modify product/root files while onboarding an adapter.

**Why this priority**: A Skill is a process accelerator. It must not widen the
scope beyond what the CLI and constitution permit.

**Independent Test**: Review the Skill and verify it explicitly forbids CI
workflow generation, product/root edits, repair, E2E thinning, and hidden
success for warning/unknown evidence.

**Acceptance Scenarios**:

1. **Given** a user asks whether CI should be created, **When** the Skill is
   followed, **Then** the agent records CI policy only and does not create or
   edit workflow files.
2. **Given** validation reports warnings or unknowns, **When** the Skill is
   followed, **Then** those states remain visible and are not presented as pass.
3. **Given** generated files appear outside the approved boundary, **When** the
   Skill is followed, **Then** the agent stops for review instead of continuing.

### Edge Cases

- The user references the Skill by path rather than by an installed skill name.
- `evaluation/config/harness-adapter.json` already exists and dry-run reports
  conflicts.
- Dry-run reports no pending questions but validation still reports warnings or
  unknowns.
- The user asks to create GitHub Actions as part of onboarding.
- The user asks to proceed despite blocked readiness findings.
- The Skill is copied into another repository with a different evaluation path.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The feature MUST add a Skill under
  `evaluation/skills/harness-onboarding/` and MUST NOT add it under
  `.agents/skills/`.
- **FR-002**: The Skill MUST define trigger guidance for adapter onboarding,
  readiness validation, and commonization workflow assistance.
- **FR-003**: The Skill MUST instruct agents to run
  `init-harness-adapter --dry-run --non-interactive` before any write.
- **FR-004**: The Skill MUST instruct agents to summarize pending questions,
  conflicts, and proposed writes before writing adapter state.
- **FR-005**: The Skill MUST instruct agents to run
  `validate-harness-adapter` after adapter state is written or when the user
  requests readiness review.
- **FR-006**: The Skill MUST define how to interpret `blocked`, `warning`,
  `unknown`, and `pass` readiness results.
- **FR-007**: The Skill MUST forbid creating or editing GitHub Actions
  workflows, product source, product fixtures, root package scripts, root
  browser-test configuration, and root E2E files during onboarding.
- **FR-008**: The Skill MUST keep CI as adapter policy only unless a later
  explicit feature authorizes template generation.
- **FR-009**: Repository documentation MUST identify the path-based Skill and
  explain that it is evaluation-local.
- **FR-010**: The Skill MUST pass the Skill validator and contain no TODO
  placeholders.

### Key Entities

- **Harness Onboarding Skill**: A path-based Codex Skill that orchestrates the
  015 CLI workflow.
- **Onboarding Command Sequence**: The ordered dry-run, user decision, write,
  validate, and report workflow.
- **Safety Boundary**: The set of file and behavior restrictions preserved from
  the evaluation harness constitution.
- **Readiness Interpretation**: The mapping from validation statuses to next
  agent actions.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: A reviewer can identify the Skill path and command sequence in
  under 2 minutes.
- **SC-002**: The Skill contains zero TODO placeholders and passes the Skill
  validation script.
- **SC-003**: The implementation touches no files under `.agents/skills/`.
- **SC-004**: The Skill names at least four forbidden actions, including CI
  workflow generation and E2E thinning.
- **SC-005**: Repository documentation includes the path-based Skill location
  and explains why it is evaluation-local.

## Assumptions

- The 015 onboarding CLI is already implemented and is the source of truth for
  discovery, adapter writing, and readiness validation.
- The Skill is path-based and repository-local; automatic Codex discovery is not
  required for this feature.
- The Skill should stay concise and should not duplicate the full 015 spec,
  schema, or task plan.
