# Research: Evaluation Harness Commonization

## Decision: Treat 014 As A Blueprint Feature, Not A Runtime Extraction

**Rationale**: The current harness contains both reusable orchestration and
hotel-site-specific policy. Extracting code before documenting the boundary
would risk turning local feature mappings, thresholds, fork policy, and
repository guardrails into accidental shared defaults.

**Alternatives considered**:

- Extract a package immediately: rejected because the adopter contract and
  local-policy boundary are not yet reviewed.
- Only write a short architecture note: rejected because future tasks need
  contract-level detail for onboarding, readiness gates, and evidence states.

## Decision: Use A Capability Classification Taxonomy

**Rationale**: Every current harness surface should land in exactly one
reviewable bucket: reusable core, adapter contract, project policy, generated
evidence, or intentionally local. This keeps the discussion concrete and makes
wrong classifications easy to challenge.

**Alternatives considered**:

- Classify by directory only: rejected because one directory can contain both
  reusable code and local policy.
- Classify by implementation effort: rejected because effort does not answer
  whether behavior should be shared.

## Decision: Make The Adopter Workflow A First-Class Contract

**Rationale**: The common harness must guide maintainers who do not know the
current process. A workflow with inputs, outputs, validation signals, stopping
conditions, and next actions makes the intended process auditable and prevents
users from skipping preflight, evidence review, mapping, or readiness checks.

**Alternatives considered**:

- Rely on README prose only: rejected because prose does not define stopping
  conditions or machine-checkable validation signals.
- Assume adopters already understand Spec Kit and the evaluation process:
  rejected because the feature is explicitly about non-expert adoption.

## Decision: Preserve Unknown, Warning, Weak, And Unmapped States

**Rationale**: A reusable harness must not convert missing evidence into a pass.
Current reports already surface `unknown`, warnings, weak-signal tests, and
unmapped evidence. These concepts should remain shared user-facing semantics
even when the implementation is later generalized.

**Alternatives considered**:

- Require complete evidence before any report can render: rejected because early
  adoption often starts with partial coverage.
- Hide unmapped or weak evidence until configured: rejected because that makes
  the harness look more trustworthy than it is.

## Decision: Keep E2E Thinning Behind Readiness Gates

**Rationale**: The constitution requires lower-layer evidence and reviewable
decisions before thinning. A common harness should support that process, but it
must not make thinning a default onboarding action.

**Alternatives considered**:

- Include automatic thinning in the first shared workflow: rejected because it
  is mutating, riskier than reporting, and depends on project-specific evidence.
- Exclude thinning entirely from the blueprint: rejected because adopters need
  to understand when it becomes safe and what evidence is required.

## Decision: Use Markdown Contracts For This Planning Feature

**Rationale**: 014 produces review artifacts, not a runtime interface. Markdown
contracts are sufficient to define the required sections, fields, and review
rules for future implementation tasks without adding schema tooling now.

**Alternatives considered**:

- Add JSON schemas immediately: rejected because the exact future artifact
  shape should be reviewed before code-level validation is introduced.
- Skip contracts: rejected because tasks need precise acceptance surfaces for
  the blueprint, workflow, and readiness gates.

## Decision: Keep Pointer Edits Minimal And Reversible

**Rationale**: `.specify/feature.json` and `AGENTS.md` must point at the active
feature so future Spec Kit work reads 014. These are context pointers, not
runtime behavior changes.

**Alternatives considered**:

- Leave pointers on 013: rejected because later plan/tasks commands would use
  stale feature context.
- Update root package scripts or CI to expose 014: rejected because planning
  does not need runtime or CI behavior changes.
