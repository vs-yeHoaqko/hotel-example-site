# Implementation Plan: Feature Coverage Matrix

**Branch**: `013-feature-coverage-matrix` | **Date**: 2026-05-05 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `evaluation/specs/013-feature-coverage-matrix/spec.md`

## Summary

Add an evaluation-owned feature coverage matrix that translates latest
evaluation evidence into product-facing function and journey rows. The matrix
will combine latest run summaries, Playwright JSON results, ownership records,
test meaningfulness inventory, and run-health warnings into a single
human-readable report. CI summary output will reference the matrix once it
exists. Product source, root E2E source, root package scripts, root Playwright
configuration, and upstream push behavior remain out of scope.

## Technical Context

**Language/Version**: Node.js 24, ECMAScript modules
**Primary Dependencies**: Node standard library, existing evaluation model
helpers, Prettier for Markdown formatting
**Storage**: Latest run evidence under ignored `evaluation/runs/`; committed
configuration under `evaluation/config/`; committed review report under
`evaluation/reports/`
**Testing**: Node test runner for matrix model/report logic; existing
evaluation generators and gate for integration validation
**Target Platform**: Local Windows development and GitHub Actions Ubuntu
container
**Project Type**: Evaluation harness for a forked web application
**Performance Goals**: Matrix generation completes quickly enough to run after
each CI evaluation attempt without materially increasing CI time
**Constraints**: No product source, product fixtures, root package scripts,
root Playwright config, root E2E source files, or upstream push behavior
changes; additive CI artifact path change only
**Scale/Scope**: Current root E2E journey families, evaluation smoke,
reservation integration, billing unit coverage, latest evaluation run, and
selected run-health warnings

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- Evaluation assets and generated evidence stay under `evaluation/` unless the
  feature explicitly documents outside-file edits. **Pass with documented
  exceptions**: generated code and reports stay under `evaluation/`; `.github/workflows/evaluation.yml`
  may receive an additive artifact/report-generation step; Speckit pointers use
  `.specify/feature.json` and `AGENTS.md`.
- Any outside-file edit states rationale, expected blast radius, and rollback
  path before implementation. **Pass**: workflow edit only runs/uploads the new
  evaluation report; rollback removes that step/path. Pointer rollback restores
  the previous active feature reference.
- Changes identify affected test layers and the evidence that proves
  completion. **Pass**: feature reads unit, integration, smoke, and full E2E
  evidence; validation includes focused unit tests and report generation.
- E2E thinning work names the migration candidates, lower-layer evidence,
  remaining E2E smoke coverage, and validation runs. **Pass**: this feature
  reports coverage only and does not thin E2E assertions.
- Fork drift is minimized: outside-`evaluation/` edits are limited to the
  smallest necessary change, avoid unrelated formatting, and document conflict
  risk. **Pass**: no product/root E2E edits; workflow change is additive.
- Repair behavior remains non-mutating unless a later approved specification
  introduces auditable repair mode. **Pass**: no repair behavior is introduced.

## Project Structure

### Documentation (this feature)

```text
evaluation/specs/013-feature-coverage-matrix/
|-- spec.md
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
|   |-- feature-coverage-report-contract.md
|   |-- feature-mapping-contract.md
|   `-- ci-summary-integration-contract.md
`-- tasks.md
```

### Source Code

```text
.github/workflows/
`-- evaluation.yml

evaluation/bin/
`-- generate-feature-coverage-matrix.mjs

evaluation/config/
`-- feature-coverage.config.json

evaluation/lib/
|-- feature-coverage-model.mjs
|-- feature-coverage-report.mjs
|-- ci-gate-summary-model.mjs
`-- run-health-evidence.mjs

evaluation/reports/
|-- feature-coverage-matrix.md
`-- ci-gate-summary.md

evaluation/tests/unit/
|-- feature-coverage-model.test.mjs
|-- feature-coverage-report.test.mjs
`-- ci-gate-summary-model.test.mjs
```

**Structure Decision**: Keep mapping config, matrix generation, report
rendering, and tests under `evaluation/`. Touch `.github/workflows/evaluation.yml`
only to generate/upload the new report. Touch `ci-gate-summary-model.mjs` only
to add the matrix report to CI-visible evidence references.

## Complexity Tracking

| Violation                                       | Why Needed                                                                  | Simpler Alternative Rejected Because                                           |
| ----------------------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Additive CI workflow edit outside `evaluation/` | CI artifacts should include the matrix without requiring local regeneration | Local-only matrix would not help PR/main review                                |
| Speckit pointer updates outside `evaluation/`   | Active feature and agent context must point at the 013 plan/specs           | Leaving pointers on 012 would make later commands operate on the wrong feature |

## Phase 0: Research

See [research.md](research.md).

## Phase 1: Design & Contracts

See [data-model.md](data-model.md) and contracts:

- [Feature coverage report contract](contracts/feature-coverage-report-contract.md)
- [Feature mapping contract](contracts/feature-mapping-contract.md)
- [CI summary integration contract](contracts/ci-summary-integration-contract.md)

## Post-Design Constitution Check

- Evaluation-owned implementation remains under `evaluation/`. **Pass**.
- Outside-file edits are limited to `.github/workflows/evaluation.yml`,
  `.specify/feature.json`, and `AGENTS.md`. **Pass**.
- Affected layers are read-only evidence from unit, integration, smoke, and full
  E2E. **Pass**.
- E2E thinning is not performed. **Pass**.
- Fork drift risk is limited to additive workflow wiring. **Pass**.
- Repair behavior remains non-mutating. **Pass**.
