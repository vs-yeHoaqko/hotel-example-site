# Implementation Plan: Slow and Flaky Evidence Report

**Branch**: `007-slow-flaky-evidence` | **Date**: 2026-05-04 |
**Spec**: `evaluation/specs/007-slow-flaky-evidence/spec.md`
**Input**: Feature specification from
`evaluation/specs/007-slow-flaky-evidence/spec.md`
**Constitution**: `.specify/memory/constitution.md` v1.4.0 and
`evaluation/.specify/memory/constitution.md` v1.4.0

## Summary

Add an evaluation-local report generator that reads existing run evidence and
summarizes slow layers, slow Playwright tests, instability evidence, malformed
artifacts, and recommended review focus. The feature does not execute product
tests, change root E2E files, change CI triggers, adjust timeouts, or introduce
repair behavior.

## Technical Context

**Language/Version**: Node.js 24 from `package.json`
**Primary Dependencies**: Existing Node standard library, Node test runner,
Playwright JSON result format, Prettier, and the evaluation runner evidence
format
**Storage**: Existing ignored `evaluation/runs/` evidence as input; committed
configuration under `evaluation/config/`; stable generated guidance under
`evaluation/reports/`
**Testing**: Prettier check, focused Node unit tests for run-health model and
report rendering, report generation, `gate`, and `full`
**Target Platform**: Local Windows PowerShell and GitHub-hosted Linux through
the existing fork-scoped evaluation workflow
**Project Type**: Evaluation harness reporting feature for a static web
application
**Performance Goals**: Generate the report from existing evidence in under 10
seconds without starting the app or executing product tests
**Constraints**: Evaluation-local implementation; no product source, root E2E,
root Playwright, root package script, CI trigger, timeout, automatic thinning,
or repair-mode changes
**Scale/Scope**: Latest 5 readable evaluation runs by default, top 10 slow test
observations by default, all configured evaluation layers when present in the
selected runs

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- **I. Evaluation Assets Are Isolated**: Pass. Implementation, generated
  report, tests, fixtures, and config stay under `evaluation/`. The only
  outside-`evaluation/` edits are workflow bookkeeping files:
  `.specify/feature.json` and `AGENTS.md`.
- **II. Close the Evaluation Loop First**: Pass. The existing gate/full loop is
  unchanged and remains the validation target.
- **III. Evidence Is a Required Output**: Pass. The feature consumes existing
  machine-readable evidence and emits a stable human-readable report.
- **IV. Tests Move Down the Pyramid When Their Responsibility Allows It**:
  Pass. This feature provides advisory evidence only; it does not thin or move
  tests.
- **V. Repair Loops Must Preserve Trust**: Pass. No repair mode or mutating
  repair action is introduced.
- **VI. Harness Growth Is Reviewable**: Pass. The report exists to make the
  next human decision about slow/flaky work reviewable before behavior changes.
- **VII. Failure Diagnostics Must Be Actionable Before Repair**: Pass. The
  report separates environment evidence from product/test behavior evidence and
  records warnings for unreadable artifacts.
- **VIII. E2E Thinning Is Evidence-Preserving**: Pass. The feature reads E2E
  evidence but does not modify E2E tests.
- **IX. Fork Drift Must Be Minimized**: Pass. No base-repository-owned source,
  root E2E, root config, root scripts, or CI files are planned.

### Outside-`evaluation/` Edit Rationale

**Files**:

- `.specify/feature.json`
- `AGENTS.md`

**Reason**: `.specify/feature.json` selects the active Speckit feature.
`AGENTS.md` stores the active plan pointer required by the local Speckit plan
workflow.

**Conflict risk**: Low. Both edits are project-local workflow metadata and do
not affect the upstream product source, upstream tests, or runtime behavior.

**Rollback path**: Restore the previous active feature pointer and previous
plan reference. The evaluation-local report implementation can be reverted
independently.

## Project Structure

### Documentation (this feature)

```text
evaluation/specs/007-slow-flaky-evidence/
  spec.md
  plan.md
  research.md
  data-model.md
  quickstart.md
  contracts/
    run-health-report-contract.md
  checklists/
    requirements.md
  tasks.md
```

### Planned Source Changes

```text
evaluation/
  bin/
    generate-run-health.mjs
  config/
    run-health.config.json
    evaluation.config.json
  lib/
    run-health-model.mjs
    run-health-report.mjs
  reports/
    run-health.md
  tests/
    unit/
      run-health-model.test.mjs
      run-health-report.test.mjs
```

**Structure Decision**: Keep the reader/model split used by existing
evaluation reports. The config file defines thresholds and report limits, the
model file reads run evidence into deterministic data, the report file renders
Markdown, and the CLI writes the stable report.

## Phase 0 Research

See `research.md`.

Resolved decisions:

- Read existing `summary.json` files as the primary source of run and layer
  health.
- Read Playwright JSON artifacts only when referenced by layer artifacts.
- Treat missing/malformed run and Playwright artifacts as warnings.
- Start with explicit review thresholds in
  `evaluation/config/run-health.config.json`.
- Keep the report advisory and commit only the stable
  `evaluation/reports/run-health.md`.

## Phase 1 Design

See `data-model.md` and `contracts/run-health-report-contract.md`.

The design adds an input config, a run-health model, a Markdown renderer, a CLI
entrypoint, and unit tests. It does not alter runner behavior, Playwright
configuration, timeout policy, root E2E tests, or CI triggers.

## Validation Plan

1. Validate formatting for changed evaluation files and the 007 spec:
   `node node_modules/prettier/bin/prettier.cjs --check evaluation/specs/007-slow-flaky-evidence evaluation/config evaluation/lib evaluation/tests evaluation/reports evaluation/README.md`
2. Run focused unit tests:
   `node --test evaluation/tests/unit/run-health-model.test.mjs evaluation/tests/unit/run-health-report.test.mjs`
3. Generate the report without running product tests:
   `node evaluation/bin/generate-run-health.mjs`
4. Run the default gate:
   `node evaluation/bin/run-evaluation.mjs --mode gate`
5. Run full validation:
   `node evaluation/bin/run-evaluation.mjs --mode full`
6. If full cannot complete due to environment limitations, record the exact
   reason and do not classify environment failures as product flakiness.

## Complexity Tracking

No constitution violations are planned. Workflow metadata outside
`evaluation/` is limited to the active Speckit pointers documented above.
