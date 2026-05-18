# Contract: Onboarding Workflow

## Purpose

The onboarding workflow guides maintainers who do not know the current harness
process. It must be concrete enough that a future CLI, checklist, or template
can implement the same order without relying on unstated project history.

## Required Workflow Steps

The workflow must include steps for:

1. Repository inspection
2. Test layer discovery
3. Environment preflight
4. Local adapter configuration
5. First evidence run
6. Report generation
7. Feature or behavior mapping
8. Quality gate interpretation
9. CI or recurring execution setup
10. E2E thinning readiness review
11. Ongoing baseline and threshold review

## Step Record Format

Each step must include:

- ID
- Name
- Goal
- Required input
- Expected output
- Validation signal
- Stopping condition
- Next action on pass
- Next action on warning
- Next action on blocked

## Status Semantics

- `pass`: step produced enough evidence to continue.
- `warning`: step can continue, but review is required.
- `unknown`: evidence is missing or partial and must remain visible.
- `blocked`: process must stop until a required condition is resolved.
- `deferred`: step is intentionally postponed with a recorded reason.

## Validation Rules

- No step may treat absent evidence as `pass`.
- Mutating actions must follow review or readiness steps.
- E2E thinning must be `blocked` until lower-layer evidence and a decision
  record exist.
- Repair automation must remain `deferred` for this feature.
- CI setup may be optional, but the workflow must still define what evidence is
  lost when CI is absent.
