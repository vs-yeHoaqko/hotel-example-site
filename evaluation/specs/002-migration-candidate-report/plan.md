# Implementation Plan: Migration Candidate Report

**Planned Feature Branch**: `002-migration-candidate-report`
**Date**: 2026-05-01
**Spec**: `evaluation/specs/002-migration-candidate-report/spec.md`
**Constitution**: `evaluation/.specify/memory/constitution.md` v1.1.0

## Summary

Add an evaluation-local report generator that turns committed ownership
evidence and the current root E2E inventory into a stable Markdown migration
candidate report.

The report answers one human review question: which existing reservation and
billing E2E checks can be thinned because lower-layer coverage exists, and
which E2E journey coverage must remain.

This feature does not edit root E2E tests. It creates reviewable guidance only.

## Technical Context

**Runtime**: Node.js 22, no new dependencies
**Existing ownership source**: `evaluation/lib/ownership.mjs`
**Input test inventory**: root `e2e/**/*.spec.ts`
**Initial scope**: reservation and billing-related root E2E tests only
**Report output**: `evaluation/reports/migration-candidates.md`
**Target command style**:
`node evaluation/bin/generate-migration-candidates.mjs`

## Constitution Check

- **I. Evaluation Assets Are Isolated**: Pass. New scripts, mapping, and report
  output are under `evaluation/`.
- **II. Close the Evaluation Loop First**: Pass. This builds on the already
  closed evaluation loop and does not weaken gate execution.
- **III. Evidence Is a Required Output**: Pass. The report is stable human
  evidence derived from committed ownership and current E2E inventory.
- **IV. Tests Move Down the Pyramid When Their Responsibility Allows It**:
  Pass. The feature produces the required migration-candidate report before any
  E2E thinning is attempted.
- **V. Repair Loops Must Preserve Trust**: Pass. Repair mode remains out of
  scope.
- **VI. Harness Growth Is Reviewable**: Pass. This feature is the first growth
  step and creates a human-review artifact before changing test behavior.

No constitution violations are planned.

## Project Structure

```text
evaluation/
  bin/
    generate-migration-candidates.mjs
  config/
    migration-candidates.config.json
  lib/
    e2e-inventory.mjs
    migration-candidate-model.mjs
    migration-candidate-report.mjs
  reports/
    migration-candidates.md
  specs/
    002-migration-candidate-report/
      spec.md
      plan.md
      tasks.md
```

The initial implementation keeps mapping data in committed JSON so candidate
rules are easy to review without reading generator code.

## Design Decisions

### Candidate Unit

A candidate is a review item about a root E2E test and the behavior inside that
test. It does not necessarily mean deleting the whole test.

For example, a reservation completion E2E test may remain as E2E journey
coverage while detailed `#total-bill` assertions inside that test are marked
`ready_to_thin` because unit billing coverage already exists.

Multiple candidates may intentionally point at the same root E2E `path` and
`ordinal` when one test contains several assertions with different ownership
readiness. Such candidates must be distinguished by a stable `candidateId` and
human-readable `assertionScope`.

Candidate statuses are:

- `ready_to_thin`: lower-layer evidence exists and the E2E detail can be
  reduced.
- `blocked_missing_lower_layer`: the proposed owner layer is lower than E2E,
  but required evidence is missing or incomplete.
- `keep_e2e`: the behavior belongs in E2E because it depends on route, popup,
  storage, modal, locale journey, or another browser-flow concern.

### Ownership Source

The generator imports or otherwise reuses `evaluation/lib/ownership.mjs` as the
primary ownership source. It does not depend on the latest
`evaluation/runs/<run-id>/ownership.json`, because generated run artifacts are
not stable committed inputs.

Generated `ownership.json` can be mentioned as supporting evidence in docs or
manual review, but report generation itself should be reproducible from the
committed repository state.

### E2E Inventory

`evaluation/lib/e2e-inventory.mjs` scans root `e2e/**/*.spec.ts` files and
extracts test entries with:

- path
- source line
- title string as read from the source file
- zero-based ordinal within file

The first extractor can be intentionally small and support the current
Playwright style used in this repository: `test('title', async (...) => { ...`
and nested `describe` blocks for context when available.

The extractor should not execute Playwright, start a browser, or require a TypeScript
AST dependency in the first implementation.

### Explicit Mapping

`evaluation/config/migration-candidates.config.json` stores explicit mapping
rules for the current reservation and billing cases.

Each mapping rule should include:

- `candidateId`: stable evaluation-local ID unique within the mapping file
- `path`: root E2E spec path
- `ordinal`: test ordinal within that file
- `assertionScope`: concise description of the assertion or behavior slice
- `behavior`: behavior name matching ownership records where possible
- `behaviorSummary`: English reviewer summary
- `currentLayer`: `e2e`
- `proposedOwnerLayer`: `unit`, `integration`, or `e2e`
- `status`: `ready_to_thin`, `blocked_missing_lower_layer`, or `keep_e2e`
- `lowerLayerEvidence`: evaluation-local test paths or an empty array
- `remainingE2ECoverage`: what E2E coverage should remain
- `recommendation`: concise human action

The report generator validates mappings against the current inventory. If a
mapped test is missing, or a reservation test appears in inventory but is not
mapped, the report surfaces it under an "Inventory Warnings" section instead
of silently ignoring the drift.

The generator also validates that `candidateId` values are unique. Multiple
entries may share the same `path` and `ordinal` only when their `candidateId`
and `assertionScope` are distinct.

### Report Format

`evaluation/reports/migration-candidates.md` is committed guidance, not a run
artifact.

The report should contain:

1. metadata: generated command, scope, and ownership source
2. summary counts by status
3. grouped candidates by behavior
4. inventory warnings
5. next steps requiring human approval before root E2E changes

Each candidate row should include:

- candidate ID
- status
- root E2E path and line
- source title
- assertion scope
- English behavior summary
- current owner layer
- proposed owner layer
- lower-layer evidence
- remaining E2E coverage
- recommendation

Japanese root E2E titles should be preserved as read from the source file, and
the English behavior summary should make the review meaning clear even when a
terminal renders the original title poorly.

### Determinism

The generator should produce stable diffs for the same repository state.

Deterministic choices:

- sort behavior groups by behavior name
- sort candidates by path, then ordinal, then candidate ID
- sort evidence paths alphabetically
- keep status count order fixed:
  `ready_to_thin`, `blocked_missing_lower_layer`, `keep_e2e`
- use relative paths with `/` separators

The report should omit wall-clock generation timestamps by default so committed
diffs remain stable. If a timestamp later becomes useful for review, it should be
explicitly enabled and documented.

## Initial Candidate Scope

The first committed mapping should cover only reservation and billing overlap:

- detailed billing assertions in `e2e/en-US/reserve.spec.ts`
- detailed billing assertions in `e2e/ja/reserve.spec.ts`
- reservation form validation cases in both `e2e/en-US/reserve.spec.ts` and
  `e2e/ja/reserve.spec.ts`
- directly covered locale-independent contact-field visibility, term
  lower-bound validation, and head-count upper-bound validation marked
  `ready_to_thin`
- blank required-field validation, date string/boundary validation, name
  validation, term/head-count range details without direct evidence, and
  email/tel submit-feedback details marked
  `blocked_missing_lower_layer` until direct integration evidence exists
- locale-specific validation message text marked `blocked_missing_lower_layer`
  unless locale-specific lower-layer evidence exists
- representative reservation completion journeys that should remain E2E

Out of scope until later ownership exists:

- login tests
- mypage tests
- signup tests
- redirection tests
- plans-list visibility tests outside the reservation/billing ownership already
  established

## Data Contract

### Candidate Mapping Entry

```json
{
  "candidateId": "en-reserve-completion-initial-total-bill",
  "path": "e2e/en-US/reserve.spec.ts",
  "ordinal": 8,
  "assertionScope": "#total-bill assertion in initial not-logged-in completion journey",
  "behavior": "Total bill calculation",
  "behaviorSummary": "Reservation completion includes detailed total bill assertion.",
  "currentLayer": "e2e",
  "proposedOwnerLayer": "unit",
  "status": "ready_to_thin",
  "lowerLayerEvidence": ["evaluation/tests/unit/billing.test.mjs"],
  "remainingE2ECoverage": "Keep one reservation completion smoke journey.",
  "recommendation": "Thin detailed total bill assertions from this E2E path after review."
}
```

### Inventory Entry

```json
{
  "path": "e2e/en-US/reserve.spec.ts",
  "line": 391,
  "ordinal": 8,
  "title": "It should be successful the reservation [not logged in] [initial values]"
}
```

## Validation Plan

1. Run `node evaluation/bin/generate-migration-candidates.mjs`.
2. Confirm `evaluation/reports/migration-candidates.md` is created.
3. Confirm the report includes summary counts for `ready_to_thin`,
   `blocked_missing_lower_layer`, and `keep_e2e`.
4. Confirm detailed billing assertions are listed as `ready_to_thin` with
   `evaluation/tests/unit/billing.test.mjs` as evidence.
5. Confirm each candidate has a unique `candidateId` and any same-test
   candidates have distinct assertion scopes.
6. Confirm directly covered reservation form validation candidates are listed
   as `ready_to_thin` with
   `evaluation/tests/integration/reservation-form.spec.mjs` as evidence.
7. Confirm reservation validation candidates without direct lower-layer
   evidence are listed as `blocked_missing_lower_layer` and name the missing
   evidence needed before thinning.
8. Confirm locale-specific validation message text is
   `blocked_missing_lower_layer` unless locale-specific lower-layer evidence is
   named.
9. Confirm representative reservation completion journeys state remaining E2E
   coverage rather than recommending complete removal.
10. Confirm Japanese source titles are present with English behavior summaries.
11. Confirm no files outside `evaluation/` are modified by report generation.
12. Run `node node_modules/prettier/bin/prettier.cjs --check` against the
    changed evaluation files.
13. Run `node evaluation/bin/run-evaluation.mjs --mode gate` after
    implementation to ensure the existing evaluation loop remains closed.

## Risks and Mitigations

- **Mapping drift**: root E2E titles or ordering may change. Mitigate by
  validating mapping entries against the current inventory and surfacing
  warnings.
- **Over-thinning recommendations**: completion journeys mix detailed
  assertions and E2E-only behavior. Mitigate by treating candidates as behavior
  review items, not whole-test deletion instructions.
- **Encoding readability**: Japanese titles may render poorly in some
  terminals. Mitigate by preserving source titles and adding English behavior
  summaries.
- **Report churn**: generation timestamps can create noisy diffs. Mitigate by
  omitting wall-clock timestamps by default and keeping metadata stable.
