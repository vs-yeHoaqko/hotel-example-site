# Contract: Readiness Gates

## Purpose

Readiness gates define what must be true before future tasks extract shared
code, promote defaults, enforce thresholds, thin E2E tests, or introduce repair
automation.

## Required Gate Areas

The blueprint must define gates for:

- Common core extraction
- Adapter contract completeness
- Evidence contract stability
- Report contract stability
- Feature mapping and ownership
- Quality threshold enforcement
- CI integration
- E2E thinning
- Repair automation
- Outside-`evaluation/` file changes

## Gate Record Format

Each gate must include:

- ID
- Decision area
- Required evidence
- Pass criteria
- Fail or block criteria
- Warning criteria
- Owner or reviewer role
- Rollback requirement
- Next allowed action

## Required Blocking Rules

- Shared-code extraction is blocked if the capability has no classification,
  adapter contract, or rollback path.
- Quality threshold enforcement is blocked if the threshold is based on a
  single unreviewed run or hides known warnings.
- E2E thinning is blocked without lower-layer evidence, remaining smoke
  coverage, and a decision record.
- Repair automation is blocked in 014 and may only be reconsidered by a later
  approved specification.
- Outside-`evaluation/` changes are blocked unless the plan states rationale,
  blast radius, and rollback path.

## Validation Rules

- Every gate has pass, warning, and blocked outcomes.
- Every blocked outcome has a recommended next action.
- Gates preserve `unknown`, `warning`, weak-signal, and unmapped evidence.
- Gates do not require generated run artifacts to be committed by default.
