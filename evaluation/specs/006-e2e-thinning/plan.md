# Implementation Plan: E2E Assertion Thinning

**Branch**: `006-e2e-thinning` | **Date**: 2026-05-04 |
**Spec**: `evaluation/specs/006-e2e-thinning/spec.md`
**Input**: Feature specification from
`evaluation/specs/006-e2e-thinning/spec.md`
**Constitution**: `.specify/memory/constitution.md` v1.4.0 and
`evaluation/.specify/memory/constitution.md` v1.4.0

## Summary

Thin detailed assertions from the existing root reservation E2E tests after
confirming that lower-layer evaluation evidence owns the same responsibilities.
The implementation will keep the four `keep_e2e` completion journeys, preserve
root E2E test case structure and titles, record every thinning outcome in
machine-readable data under `evaluation/`, and render the human-readable
migration report from that data.

The only planned files outside `evaluation/` are the two root reservation E2E
files whose assertions are being thinned. Edits there must be assertion-level
only: no test splitting, renaming, broad formatting, reordering, or unrelated
cleanup.

## Technical Context

**Language/Version**: Node.js 24 from `package.json`, TypeScript Playwright
test files for root E2E
**Primary Dependencies**: Existing Playwright, Node test runner, Prettier, and
evaluation runner
**Storage**: Committed machine-readable decision data under `evaluation/config/`;
generated run artifacts remain under ignored `evaluation/runs/`
**Testing**: Prettier check, migration-candidate generation, focused unit tests
for decision parsing/reporting, `gate`, and `full`
**Target Platform**: Local Windows PowerShell and GitHub-hosted Linux through
the existing fork-scoped evaluation workflow
**Project Type**: Evaluation harness maintenance for a static web application
**Performance Goals**: Keep automatic `gate` runtime bounded; `full` is
required for implementation validation but remains manual/on-demand in normal
CI operations
**Constraints**: Minimize fork drift; root E2E edits are limited to reviewed
assertion scopes; no product source, package script, fixture, CI trigger, or
repair-mode changes
**Scale/Scope**: 28 reviewed `ready_to_thin` candidates, 4 `keep_e2e` journeys,
2 root E2E files, and evaluation-local decision/reporting artifacts

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- **I. Evaluation Assets Are Isolated**: Pass with documented exception. The
  canonical decision data, report changes, tests, and specs stay under
  `evaluation/`. The only planned outside-`evaluation/` edits are
  assertion-level changes in root E2E files required by the approved thinning
  feature.
- **II. Close the Evaluation Loop First**: Pass. The existing gate remains the
  primary loop and must pass after thinning.
- **III. Evidence Is a Required Output**: Pass. Each reviewed candidate will
  have a machine-readable thinning outcome and the generated report will expose
  the evidence for review.
- **IV. Tests Move Down the Pyramid When Their Responsibility Allows It**:
  Pass. The feature implements the reviewed migration-candidate recommendations
  only where lower-layer evidence exists.
- **V. Repair Loops Must Preserve Trust**: Pass. No repair mode or file-mutating
  automation is introduced.
- **VI. Harness Growth Is Reviewable**: Pass. The work records every candidate
  as thinned, retained, or deferred before relying on the root E2E diff alone.
- **VII. Failure Diagnostics Must Be Actionable Before Repair**: Pass. Existing
  diagnostics remain unchanged and are validated through `gate`/`full` runs.
- **VIII. E2E Thinning Is Evidence-Preserving**: Pass. `keep_e2e` journeys
  remain, lower-layer evidence is preserved, and unsafe candidates are deferred.
- **IX. Fork Drift Must Be Minimized**: Pass. Root E2E edits preserve test case
  structure/titles and remove only target assertions tied to candidate IDs.

### Outside-`evaluation/` Edit Rationale

**Files**:

- `e2e/en-US/reserve.spec.ts`
- `e2e/ja/reserve.spec.ts`

**Reason**: These files contain the reviewed root E2E assertions that are being
thinned. The feature cannot complete without editing the assertion statements
the migration report identifies.

**Conflict risk**: Medium. These files are base-branch-owned root E2E tests and
may change when the fork is synced. Mitigation: fetch/check latest fork `main`
before implementation, use path + ordinal + candidate ID for identity, re-review
affected candidates if the target files changed, preserve test titles/structure,
and avoid broad formatting.

**Rollback path**: Revert the root E2E assertion edits and restore the previous
decision data/report. Evaluation-local lower-layer tests remain valid and do
not need rollback unless the decision data schema changes.

## Project Structure

### Documentation (this feature)

```text
evaluation/specs/006-e2e-thinning/
  spec.md
  plan.md
  research.md
  data-model.md
  quickstart.md
  contracts/
    thinning-decision-contract.md
  checklists/
    requirements.md
  tasks.md
```

### Planned Source Changes

```text
evaluation/
  config/
    thinning-decisions.config.json
  lib/
    migration-candidate-model.mjs
    migration-candidate-report.mjs
    thinning-decision-model.mjs
  reports/
    migration-candidates.md
  tests/
    unit/
      thinning-decision-model.test.mjs
      migration-candidate-report.test.mjs

e2e/
  en-US/
    reserve.spec.ts
  ja/
    reserve.spec.ts
```

**Structure Decision**: Keep canonical thinning data in a separate
evaluation-local JSON config so the existing migration candidate inventory does
not need broad churn. Merge the decision data into the migration candidate
model at report-generation time.

## Phase 0 Research

See `research.md`.

Resolved decisions:

- Use a separate `evaluation/config/thinning-decisions.config.json` as the
  canonical decision data.
- Extend the migration candidate model/report rather than create a second
  report command.
- Preserve root E2E test structure and titles.
- Defer candidates when lower-layer evidence is insufficient.
- Require `gate` and `full` validation; reserve `collect-all` for failure
  investigation.

## Phase 1 Design

See `data-model.md` and
`contracts/thinning-decision-contract.md`.

The design adds one canonical data shape, one model loader/validator, report
rendering for outcomes, and minimal root E2E assertion edits. The report remains
the human-readable review surface, while JSON decision data is the stable source
for future automation.

## Validation Plan

1. Check latest fork base before root E2E editing:
   `git fetch origin`
2. Confirm the branch is based on latest `origin/main` or merge/rebase before
   editing root E2E files. If either target root E2E file changed in latest fork
   `main`, re-review affected candidates and mark unsafe candidates `deferred`
   before editing.
3. Validate formatting for changed evaluation docs/config/code:
   `node node_modules/prettier/bin/prettier.cjs --check evaluation/specs/006-e2e-thinning evaluation/config evaluation/lib evaluation/tests evaluation/reports`
4. Validate decision data and report generation:
   `node evaluation/bin/generate-migration-candidates.mjs`
5. Run focused unit tests for thinning decision parsing/reporting after they
   are added:
   `node --test evaluation/tests/unit/thinning-decision-model.test.mjs evaluation/tests/unit/migration-candidate-report.test.mjs`
6. Run the default gate:
   `node evaluation/bin/run-evaluation.mjs --mode gate`
7. Run full validation:
   `node evaluation/bin/run-evaluation.mjs --mode full`
8. If `full` cannot complete due to environment limitations, record the exact
   reason and run `collect-all` only when additional evidence is needed for
   diagnosis.

## Complexity Tracking

No constitution violations are planned. The outside-`evaluation/` root E2E edits
are permitted by constitution v1.4.0 because they are assertion-level thinning
changes tied to reviewed migration candidates and include explicit conflict
risk/rollback documentation.
