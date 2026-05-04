# Implementation Plan: CI Health Trends and Test Meaningfulness

**Branch**: `010-ci-health-trends` | **Date**: 2026-05-04 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `evaluation/specs/010-ci-health-trends/spec.md`

## Summary

Add two evidence improvements to the evaluation harness without changing the product app: trend context in the existing run health report, and a generated test meaningfulness report that explains how much executable evidence exists by layer, source ownership, and behavior category. CI will continue to use the existing fork-scoped workflow and will upload both reports with evaluation evidence.

## Technical Context

**Language/Version**: Node.js 24, ECMAScript modules
**Primary Dependencies**: Node standard library, Prettier, Playwright test runner for existing browser layers
**Storage**: JSON summaries under `evaluation/runs/`; committed Markdown reports under `evaluation/reports/`
**Testing**: Node test runner for model/report logic; evaluation gate for end-to-end harness validation
**Target Platform**: Local Windows development and GitHub Actions Ubuntu container
**Project Type**: Evaluation harness for a forked web application
**Performance Goals**: Report generation completes quickly enough to run on every evaluation CI attempt
**Constraints**: No product source, product fixtures, root package scripts, root Playwright config, or upstream push behavior changes
**Scale/Scope**: Current repository test inventory and recent readable evaluation runs available in the workspace

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- Evaluation assets and generated evidence stay under `evaluation/` unless the feature explicitly documents outside-file edits. **Pass**: source/report/test changes stay under `evaluation/`; workflow upload paths may be updated only if required to preserve evidence.
- Any outside-file edit states rationale, expected blast radius, and rollback path before implementation. **Pass with documented exception**: `.github/workflows/evaluation.yml` may be updated to generate/upload the new report. Blast radius is fork-scoped CI evidence only; rollback removes the added report step/path.
- Changes identify affected test layers and the evidence that proves completion. **Pass**: unit tests cover report models; gate validates orchestration.
- E2E thinning work names migration candidates, lower-layer evidence, remaining E2E smoke coverage, and validation runs. **N/A**: no E2E thinning in this feature.
- Fork drift is minimized: outside-`evaluation/` edits are limited to smallest necessary change. **Pass**: no product/root E2E edits; workflow change is additive and fork-scoped.
- Repair behavior remains non-mutating unless later approved. **Pass**: no repair mode.

## Project Structure

### Documentation (this feature)

```text
evaluation/specs/010-ci-health-trends/
|-- spec.md
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
|   |-- run-health-trends-contract.md
|   `-- test-meaningfulness-contract.md
`-- tasks.md
```

### Source Code

```text
evaluation/bin/
|-- generate-run-health.mjs
`-- generate-test-meaningfulness.mjs

evaluation/config/
`-- test-meaningfulness.config.json

evaluation/lib/
|-- run-health-model.mjs
|-- run-health-report.mjs
|-- test-meaningfulness-model.mjs
`-- test-meaningfulness-report.mjs

evaluation/reports/
|-- run-health.md
`-- test-meaningfulness.md

evaluation/tests/unit/
|-- run-health-model.test.mjs
|-- run-health-report.test.mjs
|-- test-meaningfulness-model.test.mjs
`-- test-meaningfulness-report.test.mjs
```

**Structure Decision**: Keep all new harness logic and committed reports under `evaluation/`. Touch `.github/workflows/evaluation.yml` only to preserve the new report as a CI artifact.

## Complexity Tracking

| Violation                                       | Why Needed                                           | Simpler Alternative Rejected Because                                        |
| ----------------------------------------------- | ---------------------------------------------------- | --------------------------------------------------------------------------- |
| Additive CI workflow edit outside `evaluation/` | CI must upload the new report with existing evidence | A local-only report would not help diagnose PR/main failures from artifacts |
