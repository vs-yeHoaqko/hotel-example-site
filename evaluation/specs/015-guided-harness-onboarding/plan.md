# Implementation Plan: Guided Harness Onboarding

**Branch**: `015-guided-harness-onboarding` | **Date**: 2026-05-18 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `evaluation/specs/015-guided-harness-onboarding/spec.md`

## Summary

Implement a Speckit-like guided onboarding layer for the evaluation harness. The
feature will discover repository facts, generate or update durable adapter
state, ask targeted questions only for decisions that cannot be inferred safely,
validate adapter readiness, and emit a human-readable readiness summary. The
work stays evaluation-local and does not generate GitHub Actions workflows,
modify product files, run the evidence harness, or thin E2E tests.

## Technical Context

**Language/Version**: Node.js 24 with ECMAScript modules, matching the existing
evaluation harness
**Primary Dependencies**: Existing Node standard library utilities and
evaluation-local schema validation helpers; no new package dependency planned
**Storage**: JSON adapter state under `evaluation/config/`, JSON schema under
`evaluation/schemas/`, Markdown readiness report under `evaluation/reports/`
**Testing**: Focused `node --test` unit coverage for discovery, model
validation, readiness findings, report rendering, and CLI behavior; Prettier
check for touched evaluation assets
**Target Platform**: Local Windows development and GitHub review; CI policy is
modeled as adapter state but workflow generation is out of scope
**Project Type**: Evaluation-harness CLI/process feature
**Performance Goals**: Discovery and readiness validation complete in under 5
seconds for the current repository; initial adapter drafting requires no more
than 10 targeted unanswered prompts for a typical repository
**Constraints**: Keep all implementation under `evaluation/` except active
Spec Kit pointers; do not modify product source, product fixtures, root package
scripts, root browser-test configuration, root E2E source files, or GitHub
Actions workflows; do not run repair or thinning steps
**Scale/Scope**: One repository root, one adapter state file, current harness
layer concepts, optional local-only or non-GitHub CI policy, and partial
onboarding support with visible unknowns/deferred decisions

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- Evaluation assets and generated evidence stay under `evaluation/` unless the
  feature explicitly documents outside-file edits. **Pass with documented
  exceptions**: implementation and generated artifacts stay under `evaluation/`;
  `.specify/feature.json` and `AGENTS.md` are active Spec Kit pointers only.
- Any outside-file edit states rationale, expected blast radius, and rollback
  path before implementation. **Pass**: pointer edits keep agents on 015 and can
  be rolled back by restoring the previous feature references.
- Changes identify affected test layers and the evidence that proves
  completion. **Pass**: no evaluation layer behavior changes; evidence is unit
  tests, CLI dry-run/validation outputs, schema checks, report rendering, and
  boundary review.
- E2E thinning work names the migration candidates, lower-layer evidence,
  remaining E2E smoke coverage, and validation runs. **Pass**: this feature does
  not thin E2E tests and keeps thinning behind readiness findings.
- Fork drift is minimized: outside-`evaluation/` edits are limited to the
  smallest necessary change, avoid unrelated formatting, and document conflict
  risk. **Pass**: outside edits are Spec Kit pointer-only.
- Repair behavior remains non-mutating unless a later approved specification
  introduces auditable repair mode. **Pass**: repair remains out of scope.

## Project Structure

### Documentation (this feature)

```text
evaluation/specs/015-guided-harness-onboarding/
|-- spec.md
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- checklists/
|   `-- requirements.md
|-- contracts/
|   |-- adapter-state-contract.md
|   |-- onboarding-flow-contract.md
|   `-- readiness-validation-contract.md
`-- tasks.md                        # Created by /speckit-tasks
```

### Source Code

```text
.specify/
`-- feature.json                    # Active feature pointer only

AGENTS.md                           # Active plan pointer only

evaluation/
|-- bin/
|   |-- init-harness-adapter.mjs
|   `-- validate-harness-adapter.mjs
|-- config/
|   `-- harness-adapter.example.json
|-- lib/
|   |-- harness-adapter-discovery.mjs
|   |-- harness-adapter-model.mjs
|   |-- harness-adapter-prompts.mjs
|   |-- harness-adapter-readiness.mjs
|   `-- harness-adapter-report.mjs
|-- reports/
|   `-- harness-adapter-readiness.md
|-- schemas/
|   `-- harness-adapter.schema.json
`-- tests/
    `-- unit/
        |-- harness-adapter-discovery.test.mjs
        |-- harness-adapter-model.test.mjs
        |-- harness-adapter-readiness.test.mjs
        `-- harness-adapter-report.test.mjs
```

**Structure Decision**: Add a small evaluation-local CLI/process layer that
uses the existing harness style: `bin/` entry points delegate to `lib/` modules,
configuration and schemas stay under `evaluation/config` and
`evaluation/schemas`, generated human-readable review output stays under
`evaluation/reports`, and focused unit tests live under `evaluation/tests/unit`.

## Complexity Tracking

| Violation                                  | Why Needed                                    | Simpler Alternative Rejected Because                                    |
| ------------------------------------------ | --------------------------------------------- | ----------------------------------------------------------------------- |
| Active pointer edits outside `evaluation/` | Spec Kit and agents must resolve the 015 plan | Leaving pointers on 014 would make later commands operate on stale work |

## Phase 0: Research

See [research.md](research.md).

## Phase 1: Design & Contracts

See [data-model.md](data-model.md) and contracts:

- [Adapter state contract](contracts/adapter-state-contract.md)
- [Onboarding flow contract](contracts/onboarding-flow-contract.md)
- [Readiness validation contract](contracts/readiness-validation-contract.md)

## Post-Design Constitution Check

- Implementation and generated review artifacts remain under `evaluation/`.
  **Pass**.
- Outside-file edits are limited to `.specify/feature.json` and `AGENTS.md`
  active-feature pointers. **Pass**.
- The design does not change existing runner behavior, product source, root
  tests, root scripts, root browser configuration, or CI workflows. **Pass**.
- Adapter validation preserves blocked, warning, unknown, weak-signal, and
  unmapped states. **Pass**.
- CI is represented as adapter policy, not generated workflow behavior. **Pass**.
- E2E thinning and repair remain blocked/deferred until later approved
  specifications. **Pass**.
