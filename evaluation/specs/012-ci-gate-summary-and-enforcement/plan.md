# Implementation Plan: CI Gate Summary and Enforcement

**Branch**: `012-ci-gate-summary-and-enforcement` | **Date**: 2026-05-05 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `evaluation/specs/012-ci-gate-summary-and-enforcement/spec.md`

## Summary

Make evaluation CI results reviewable without first opening artifacts, and
enforce only the safest quality-gate failure conditions. The plan adds an
evaluation-owned CI summary model/report, extends quality-gate policy for
required evidence and required-layer failures, and updates the fork-scoped CI
workflow to publish the summary. Product source, root package scripts, root
Playwright configuration, root E2E files, and upstream push behavior remain out
of scope.

## Technical Context

**Language/Version**: Node.js 24, ECMAScript modules
**Primary Dependencies**: Node standard library, Prettier, existing Playwright
test runner outputs, GitHub Actions step summary environment
**Storage**: JSON summaries under `evaluation/runs/`; committed configuration
under `evaluation/config/`; committed Markdown reports under
`evaluation/reports/`
**Testing**: Node test runner for model/report logic; evaluation gate for
orchestration validation; manual CI workflow inspection after push
**Target Platform**: Local Windows development and GitHub Actions Ubuntu
container
**Project Type**: Evaluation harness for a forked web application
**Performance Goals**: CI summary and quality-gate policy evaluation complete
fast enough to run on every gate attempt without materially increasing CI time
**Constraints**: Avoid product source, product fixtures, root package scripts,
root Playwright config, root E2E files, and upstream push behavior; preserve the
fork-only CI guard
**Scale/Scope**: Current repository evaluation runs, quality-gate reports,
run-health reports, test meaningfulness reports, thinning reports, and the
latest CI evaluation attempt

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- Evaluation assets and generated evidence stay under `evaluation/` unless the
  feature explicitly documents outside-file edits. **Pass with documented
  exceptions**: CI workflow summary wiring requires an additive edit to
  `.github/workflows/evaluation.yml`; Speckit pointers require `.specify/feature.json`
  and `AGENTS.md` updates.
- Any outside-file edit states rationale, expected blast radius, and rollback
  path before implementation. **Pass**: workflow edit only appends summary
  generation/publication in the existing fork-guarded job; rollback removes the
  summary step and artifact path. Pointer rollback restores the previous active
  feature reference.
- Changes identify affected test layers and the evidence that proves
  completion. **Pass**: unit tests will cover summary rendering and enforcement
  decisions; gate and report generation validate orchestration.
- E2E thinning work names the migration candidates, lower-layer evidence,
  remaining E2E smoke coverage, and validation runs. **Pass**: this feature
  reads thinning evidence but does not thin root E2E assertions.
- Fork drift is minimized: outside-`evaluation/` edits are limited to the
  smallest necessary change, avoid unrelated formatting, and document conflict
  risk. **Pass**: no product or root test edits; only additive CI summary wiring
  outside `evaluation/`.
- Repair behavior remains non-mutating unless a later approved specification
  introduces auditable repair mode. **Pass**: no repair mode or file mutation
  behavior is introduced.

## Project Structure

### Documentation (this feature)

```text
evaluation/specs/012-ci-gate-summary-and-enforcement/
|-- spec.md
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
|   |-- ci-gate-summary-contract.md
|   |-- enforcement-policy-contract.md
|   `-- required-evidence-contract.md
`-- tasks.md
```

### Source Code

```text
.github/workflows/
`-- evaluation.yml

evaluation/bin/
|-- generate-quality-gate.mjs
`-- generate-ci-gate-summary.mjs

evaluation/config/
`-- quality-gate.config.json

evaluation/lib/
|-- quality-gate-model.mjs
|-- quality-gate-report.mjs
|-- ci-gate-summary-model.mjs
`-- ci-gate-summary-report.mjs

evaluation/reports/
|-- quality-gate.md
`-- ci-gate-summary.md

evaluation/tests/unit/
|-- quality-gate-model.test.mjs
|-- quality-gate-report.test.mjs
|-- ci-gate-summary-model.test.mjs
`-- ci-gate-summary-report.test.mjs
```

**Structure Decision**: Keep policy, summary generation, reports, and tests
inside `evaluation/`. Touch `.github/workflows/evaluation.yml` only to call the
summary generator, append its Markdown to the CI step summary, and upload the
generated summary with the existing evidence artifact. Do not modify product
source, root package scripts, root Playwright config, or root E2E files.

## Complexity Tracking

| Violation                                       | Why Needed                                                                 | Simpler Alternative Rejected Because                                                       |
| ----------------------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Additive CI workflow edit outside `evaluation/` | CI-visible summaries require writing to the GitHub Actions summary surface | Artifact-only evidence already exists and does not meet the reviewability goal             |
| Speckit pointer updates outside `evaluation/`   | Active feature and agent context must point at the 012 plan/specs          | Leaving pointers on 011 would cause later Speckit commands to operate on the wrong feature |

## Phase 0: Research

See [research.md](research.md).

## Phase 1: Design & Contracts

See [data-model.md](data-model.md) and contracts:

- [CI gate summary contract](contracts/ci-gate-summary-contract.md)
- [enforcement policy contract](contracts/enforcement-policy-contract.md)
- [required evidence contract](contracts/required-evidence-contract.md)

## Post-Design Constitution Check

- Evaluation-owned implementation remains under `evaluation/`. **Pass**.
- Outside-file edits are limited to `.github/workflows/evaluation.yml`,
  `.specify/feature.json`, and `AGENTS.md`. **Pass**.
- Affected layers are `gate`, `environment`, and `smoke-e2e`; validation will
  include focused unit tests, report generators, and `gate`. **Pass**.
- E2E thinning is read-only for this feature. **Pass**.
- Fork drift risk is limited to the additive workflow edit. **Pass**.
- Repair behavior remains non-mutating. **Pass**.
