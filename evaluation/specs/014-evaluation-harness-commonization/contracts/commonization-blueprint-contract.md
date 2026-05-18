# Contract: Commonization Blueprint

## Purpose

The commonization blueprint is the primary review artifact for 014. It must let
a reviewer understand what can become shared harness behavior, what must remain
project-local, and what decisions are still open before implementation.

## Required Sections

1. `Scope And Non-Goals`
2. `Source Inventory`
3. `Capability Classification`
4. `Adapter Contracts`
5. `Stable User-Facing Contracts`
6. `Project-Local Policies`
7. `Guided Onboarding Workflow`
8. `Readiness Gates`
9. `Open Decisions`
10. `Boundary And Rollback Review`

## Capability Classification Table

Each capability row must include:

- Capability
- Current location
- Classification
- Decision
- Rationale
- Future adopter input
- Wrong-classification risk
- Rollback path

Allowed classifications:

- `reusable-core`
- `adapter-contract`
- `project-policy`
- `generated-evidence`
- `intentionally-local`

Allowed decisions:

- `keep-shared`
- `parameterize`
- `generate-locally`
- `keep-local`
- `defer`
- `exclude`

## Stable Contract Requirements

The blueprint must identify which current outputs should stay stable for future
adopters. At minimum it must review:

- run summary
- layer logs
- Playwright result artifacts
- run-health report
- test-meaningfulness report
- feature coverage matrix
- quality gate report
- CI gate summary
- migration/thinning decision records

## Validation Rules

- Every major harness surface named in `evaluation/README.md` appears in the
  capability table.
- Every project-specific value has an adopter input, local policy owner, or
  exclusion rationale.
- Missing, weak, warning, unknown, and unmapped evidence states remain visible.
- No runtime extraction task is marked ready unless its readiness gates are
  satisfied.
- Product source, product fixtures, root package scripts, root browser-test
  configuration, root E2E source files, and upstream push behavior are listed
  as out of scope.
