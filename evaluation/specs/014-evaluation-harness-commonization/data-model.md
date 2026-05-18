# Data Model: Evaluation Harness Commonization

## Commonization Blueprint

Review artifact describing how the current evaluation harness should be split
between shared behavior and adopter-provided local policy.

**Fields**:

- `purpose`: decision the blueprint helps reviewers make
- `sourceScope`: current files, reports, and configuration reviewed
- `capabilityInventory`: ordered list of capability inventory entries
- `adapterContracts`: adopter-provided inputs required by shared behavior
- `onboardingWorkflow`: ordered workflow steps for non-expert adopters
- `readinessGates`: gates that must pass before future extraction
- `stableContracts`: reports, summaries, and states that should remain
  user-facing contracts
- `localPolicies`: choices that should remain repository-local
- `openDecisions`: decision records requiring human review

**Validation rules**:

- Every major harness surface named in `evaluation/README.md` must appear in
  the inventory.
- Every inventory entry must have one classification and a rationale.
- Every adapter contract must be referenced by at least one reusable core
  capability or workflow step.
- Unknown, warning, weak-signal, and unmapped evidence states must remain
  visible.

## Capability Inventory Entry

One current harness capability or policy under commonization review.

**Fields**:

- `name`: reviewer-facing capability name
- `currentLocation`: current file, directory, report, or configuration path
- `classification`: `reusable-core`, `adapter-contract`,
  `project-policy`, `generated-evidence`, or `intentionally-local`
- `decision`: keep, parameterize, generate, defer, or exclude
- `rationale`: why this classification is appropriate
- `wrongClassificationRisk`: what could go wrong if shared or localized
  incorrectly
- `futureAdopterInput`: input a future adopter must provide when applicable
- `rollbackPath`: how to undo or localize the decision if it proves wrong

**Validation rules**:

- `classification` must be exactly one allowed value.
- Entries classified as `adapter-contract` or `project-policy` must identify
  adopter input or local ownership.
- Entries with outside-`evaluation/` impact must include rollback guidance.

## Adapter Contract

Information supplied by an adopter or project-local configuration so shared
harness behavior can run without embedding local assumptions.

**Fields**:

- `id`: stable contract identifier
- `purpose`: what shared capability needs this input
- `requiredInputs`: values the adopter must provide
- `optionalInputs`: values with safe defaults
- `validationSignals`: checks that prove the input is usable
- `failureMode`: blocked, warning, or unknown when validation fails
- `example`: representative project-local value

**Validation rules**:

- Required inputs must have validation signals.
- Failure modes must not silently pass.
- Examples must not imply hotel-site-specific values are shared defaults.

## Onboarding Workflow

Ordered process that guides a non-expert adopter from repository inspection to
operational harness use.

**Fields**:

- `steps`: ordered onboarding workflow steps
- `terminalStates`: success, blocked, warning-only, or deferred
- `reviewPoints`: human decisions required before continuing

**Validation rules**:

- Steps must be ordered and independently reviewable.
- No step may depend on hidden knowledge from this repository's history.
- Mutating actions must be separated from reporting and review actions.

## Onboarding Workflow Step

One step in the adopter process.

**Fields**:

- `id`: stable step identifier
- `name`: reviewer-facing step name
- `goal`: why the adopter performs the step
- `input`: required information or existing evidence
- `output`: artifact, report, or decision produced
- `validationSignal`: what proves the step worked
- `stoppingCondition`: when the adopter must stop or review before continuing
- `nextAction`: recommended follow-up when the step passes, warns, or blocks

**Validation rules**:

- Every step must have input, output, validation signal, stopping condition,
  and next action.
- Steps that discover missing evidence must produce `unknown`, `warning`, or
  `blocked`, never `pass`.

## Readiness Gate

Review condition that must be satisfied before future shared-code extraction,
automation, or thinning work proceeds.

**Fields**:

- `id`: stable gate identifier
- `decisionArea`: extraction, adapter, evidence, CI, thinning, repair, or
  governance
- `requiredEvidence`: documents or reports that prove readiness
- `passCriteria`: conditions required for pass
- `failCriteria`: conditions that block the next phase
- `owner`: reviewer or maintainer role responsible for deciding
- `rollbackRequirement`: rollback information required before proceeding

**Validation rules**:

- Every gate must have pass and fail criteria.
- E2E thinning gates must require lower-layer evidence and decision records.
- Repair gates must remain failed/deferred in this feature.

## Decision Record

Durable note for an unresolved or reviewed commonization choice.

**Fields**:

- `id`: stable decision identifier
- `topic`: commonization question
- `status`: proposed, accepted, rejected, or deferred
- `context`: why the decision is needed
- `decision`: current answer or proposed answer
- `consequences`: expected benefits, risks, and follow-up work
- `reviewNeededBy`: point in the workflow where the decision must be resolved

**Validation rules**:

- Deferred decisions must state what evidence is missing.
- Accepted decisions that affect future extraction must identify rollback.

## State Transitions

- `unreviewed` -> `classified`: capability receives a classification and
  rationale.
- `classified` -> `ready-for-extraction`: required adapter contract and
  readiness gates are satisfied.
- `classified` -> `local-only`: capability is kept as project policy or
  intentionally local.
- `classified` -> `deferred`: required evidence or human decision is missing.
- `partial-evidence` -> `warning` or `unknown`: evidence is visible but
  insufficient for pass.
- `thin-requested` -> `blocked`: lower-layer evidence or decision record is
  missing.
