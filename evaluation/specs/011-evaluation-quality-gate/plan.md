# Implementation Plan: Evaluation Quality Gate and Harness Hardening

**Branch**: `011-evaluation-quality-gate` | **Date**: 2026-05-05 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `evaluation/specs/011-evaluation-quality-gate/spec.md`

## Summary

Add a reviewable quality-gate layer on top of the existing evaluation reports. The feature will introduce warning-first thresholds, committed run-health baselines, stronger failure classification, and an evaluation-owned E2E thinning execution report. Product source, root package scripts, root Playwright config, and automatic root-suite rewrites remain out of scope; CI only gains additive evidence generation and artifact upload.

## Technical Context

**Language/Version**: Node.js 24, ECMAScript modules
**Primary Dependencies**: Node standard library, Prettier, Playwright test runner for existing browser layers
**Storage**: JSON summaries under `evaluation/runs/`; committed configuration and baselines under `evaluation/config/` and `evaluation/baselines/`; committed Markdown reports under `evaluation/reports/`
**Testing**: Node test runner for model/report logic; evaluation gate for orchestration validation
**Target Platform**: Local Windows development and GitHub Actions Ubuntu container
**Project Type**: Evaluation harness for a forked web application
**Performance Goals**: Quality-gate, baseline, diagnostic, and thinning report generation completes quickly enough to run on every evaluation CI attempt
**Constraints**: No product source, product fixtures, root package scripts, root Playwright config, upstream push behavior, or automatic root-suite E2E rewrites
**Scale/Scope**: Current repository evaluation runs, test inventory, diagnostic evidence, migration candidates, and reviewed thinning decisions

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- Evaluation assets and generated evidence stay under `evaluation/` unless the feature explicitly documents outside-file edits. **Pass**: new models, configs, baselines, reports, tests, and contracts stay under `evaluation/`.
- Any outside-file edit states rationale, expected blast radius, and rollback path before implementation. **Pass with documented exceptions**: `.specify/feature.json` and `AGENTS.md` are Speckit operational pointers; `.github/workflows/evaluation.yml` may be updated only to generate/upload new evaluation reports. Rollback removes the added workflow steps/paths and restores the prior pointer files.
- Changes identify affected test layers and the evidence that proves completion. **Pass**: unit tests cover gate/baseline/diagnostic/thinning models; gate validates orchestration and report generation.
- E2E thinning work names migration candidates, lower-layer evidence, remaining E2E smoke coverage, and validation runs. **Pass**: thinning execution remains evaluation-owned and proposal-based unless a later task explicitly approves root-suite edits.
- Fork drift is minimized: outside-`evaluation/` edits are limited to the smallest necessary change, avoid unrelated formatting, and document conflict risk. **Pass**: no product/root E2E edits in this feature; workflow change is additive and fork-scoped.
- Repair behavior remains non-mutating unless a later approved specification introduces auditable repair mode. **Pass**: this feature improves diagnostics and recommendations only; no repair mode.

## Project Structure

### Documentation (this feature)

```text
evaluation/specs/011-evaluation-quality-gate/
|-- spec.md
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
|   |-- quality-gate-contract.md
|   |-- run-health-baseline-contract.md
|   |-- failure-classification-contract.md
|   `-- thinning-execution-contract.md
`-- tasks.md
```

### Source Code

```text
evaluation/bin/
|-- generate-quality-gate.mjs
|-- generate-run-health.mjs
`-- generate-migration-candidates.mjs

evaluation/baselines/
`-- run-health-baseline.json

evaluation/config/
|-- quality-gate.config.json
|-- run-health.config.json
|-- test-meaningfulness.config.json
|-- migration-candidates.config.json
`-- thinning-decisions.config.json

evaluation/lib/
|-- quality-gate-model.mjs
|-- quality-gate-report.mjs
|-- run-health-model.mjs
|-- run-health-report.mjs
|-- failure-classifier.mjs
|-- diagnostic-guidance.mjs
|-- thinning-decision-model.mjs
`-- migration-candidate-report.mjs

evaluation/reports/
|-- quality-gate.md
|-- run-health.md
|-- test-meaningfulness.md
|-- migration-candidates.md
`-- thinning-execution.md

evaluation/tests/unit/
|-- quality-gate-model.test.mjs
|-- quality-gate-report.test.mjs
|-- run-health-model.test.mjs
|-- run-health-report.test.mjs
|-- failure-classifier.test.mjs
|-- diagnostic-guidance.test.mjs
|-- thinning-decision-model.test.mjs
`-- migration-candidate-report.test.mjs
```

**Structure Decision**: Keep decision logic, baselines, reports, tests, and thinning execution records under `evaluation/`. Touch `.github/workflows/evaluation.yml` only to preserve the new report artifacts in fork-scoped CI. Do not modify root-suite E2E files in this feature.

## Complexity Tracking

| Violation                                       | Why Needed                                                        | Simpler Alternative Rejected Because                                            |
| ----------------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Additive CI workflow edit outside `evaluation/` | CI must upload the quality gate and thinning execution evidence   | Local-only reports would not preserve PR/main failure evidence                  |
| Speckit pointer updates outside `evaluation/`   | Active feature and agent context must point at the 011 plan/specs | Leaving pointers on 010 would make future Speckit commands operate on old specs |
