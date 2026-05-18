# Research: Guided Harness Onboarding

## Decision: Keep onboarding state evaluation-local and machine-readable

**Rationale**: The 014 blueprint established adapter contracts as the boundary
between common harness behavior and repository-local policy. A durable JSON
adapter state file lets humans and later agents continue from the same source of
truth instead of relying on chat history.

**Alternatives considered**:

- Chat-only prompts: rejected because decisions disappear after the session.
- Markdown-only checklist: rejected because validation and later automation
  need structured state.
- Root-level config: rejected because the constitution keeps harness assets
  isolated under `evaluation/`.

## Decision: Use a two-command surface for drafting and validation

**Rationale**: Onboarding and validation are related but distinct. Maintainers
need one command that can discover facts and draft/update state, and another
that can be run repeatedly in local review or CI-like checks without prompting.

**Alternatives considered**:

- Single command with implicit modes: rejected because non-interactive
  validation should be obvious and scriptable.
- Validation only: rejected because it does not optimize the authoring process
  for non-expert adopters.
- Runner integration first: rejected because evidence execution should stay
  behind adapter readiness.

## Decision: Discovery should propose values, not silently finalize them

**Rationale**: Scripts, test roots, CI files, and ignore rules can often be
detected automatically, but classification and governance decisions may be
unsafe to infer. The state model must label values as discovered, inferred,
confirmed, overridden, or deferred.

**Alternatives considered**:

- Fully automatic adapter generation: rejected because it could claim coverage
  or CI readiness without maintainer review.
- Ask every question manually: rejected because it forces users to learn the
  process and ignores useful repository evidence.

## Decision: Treat CI as adapter policy, not generated workflow behavior

**Rationale**: The current fork uses GitHub Actions, but common harness adoption
must support local-only operation and other providers. The first guided
onboarding feature should detect CI hints and record policy, but not create or
edit workflow files.

**Alternatives considered**:

- Generate GitHub Actions during onboarding: rejected because it can run in the
  wrong repository and requires repository-specific guardrails.
- Require GitHub Actions: rejected because local-only and non-GitHub adopters
  are valid.

## Decision: Readiness findings should use existing evidence semantics

**Rationale**: The harness already distinguishes pass, warning, unknown,
blocked, weak-signal, and unmapped states. Onboarding readiness should preserve
the same semantics so partial adapter state is visible and does not look like a
successful evaluation run.

**Alternatives considered**:

- Boolean ready/not-ready status: rejected because it hides warning-first and
  deferred decisions.
- Throw on every gap: rejected because partial onboarding should be savable and
  reviewable.

## Decision: Use focused unit tests and dry-run style CLI checks

**Rationale**: The feature is process/configuration logic. Focused unit tests
can verify discovery, state validation, readiness findings, and report
rendering without running product tests or browser automation.

**Alternatives considered**:

- Full evaluation run as validation: rejected because adapter readiness should
  be checked before evidence runs.
- Manual-only review: rejected because schema and readiness behavior can be
  tested deterministically.
