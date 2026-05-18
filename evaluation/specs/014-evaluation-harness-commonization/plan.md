# Implementation Plan: Evaluation Harness Commonization

**Branch**: `014-evaluation-harness-commonization` | **Date**: 2026-05-18 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `evaluation/specs/014-evaluation-harness-commonization/spec.md`

## Summary

Produce a reviewable commonization blueprint for the current evaluation harness.
The blueprint will inventory the existing harness surfaces, classify each as
common core, adopter adapter, project policy, generated evidence, or
intentionally local, and define a guided onboarding process that helps future
adopters create the expected harness without knowing this repository's history.
This feature is documentation and planning work only; runtime extraction,
package creation, CLI implementation, product changes, root test changes, and
repair automation remain out of scope.

## Technical Context

**Language/Version**: N/A for runtime implementation; source material is the
existing Node.js 24 ECMAScript-module evaluation harness
**Primary Dependencies**: Existing evaluation harness documentation,
configuration, generated reports, Spec Kit templates, and Markdown formatting
**Storage**: Markdown design artifacts under `evaluation/specs/014-evaluation-harness-commonization/`
**Testing**: Document contract review, requirements checklist, Prettier
Markdown/JSON check, and boundary review with `git diff --name-only`
**Target Platform**: Local Windows development and GitHub review
**Project Type**: Evaluation-harness planning/documentation feature
**Performance Goals**: A reviewer can identify common core, adapters, local
policy, and readiness gates from the blueprint in under 5 minutes
**Constraints**: Do not change product source, product fixtures, root package
scripts, root browser-test configuration, root E2E source files, runtime
evaluation code, or upstream push behavior; generated run evidence remains
uncommitted
**Scale/Scope**: Current evaluation harness surfaces documented in
`evaluation/README.md`, active reports under `evaluation/reports/`, existing
configuration under `evaluation/config/`, and adopter workflow for future
repositories with partial or layered test coverage

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- Evaluation assets and generated evidence stay under `evaluation/` unless the
  feature explicitly documents outside-file edits. **Pass with documented
  exceptions**: feature artifacts stay under `evaluation/specs/014-evaluation-harness-commonization/`;
  `.specify/feature.json` and `AGENTS.md` are updated only as active Spec Kit
  pointers.
- Any outside-file edit states rationale, expected blast radius, and rollback
  path before implementation. **Pass**: pointer edits keep agents on the 014
  feature; blast radius is workflow context only; rollback restores the
  previous active feature references.
- Changes identify affected test layers and the evidence that proves
  completion. **Pass**: no test layer behavior changes; completion evidence is
  document contract review, checklist pass, Prettier check, and boundary diff.
- E2E thinning work names the migration candidates, lower-layer evidence,
  remaining E2E smoke coverage, and validation runs. **Pass**: this feature does
  not thin E2E tests; it defines readiness rules that block thinning without
  evidence.
- Fork drift is minimized: outside-`evaluation/` edits are limited to the
  smallest necessary change, avoid unrelated formatting, and document conflict
  risk. **Pass**: only Spec Kit/agent pointers outside `evaluation/` are
  expected.
- Repair behavior remains non-mutating unless a later approved specification
  introduces auditable repair mode. **Pass**: repair remains out of scope.

## Project Structure

### Documentation (this feature)

```text
evaluation/specs/014-evaluation-harness-commonization/
|-- spec.md
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- commonization-blueprint.md      # Created during implementation tasks
|-- checklists/
|   `-- requirements.md
|-- contracts/
|   |-- commonization-blueprint-contract.md
|   |-- onboarding-workflow-contract.md
|   `-- readiness-gate-contract.md
`-- tasks.md                        # Created by /speckit-tasks
```

### Source Code

```text
.specify/
`-- feature.json                    # Active feature pointer only

AGENTS.md                           # Active plan pointer only

evaluation/
|-- README.md                       # Source material for inventory
|-- config/                         # Source material for local policy/adapters
|-- lib/                            # Source material for common core inventory
|-- reports/                        # Source material for user-facing contracts
`-- specs/014-evaluation-harness-commonization/
    |-- research.md
    |-- data-model.md
    |-- quickstart.md
    |-- commonization-blueprint.md
    `-- contracts/
```

**Structure Decision**: Keep the feature as evaluation-local planning and
review artifacts. Do not move or edit runtime harness modules in this feature.
Use `.specify/feature.json` and `AGENTS.md` only to keep Spec Kit and agents on
the 014 plan.

## Complexity Tracking

| Violation                                  | Why Needed                                    | Simpler Alternative Rejected Because                                    |
| ------------------------------------------ | --------------------------------------------- | ----------------------------------------------------------------------- |
| Active pointer edits outside `evaluation/` | Spec Kit and agents must resolve the 014 plan | Leaving pointers on 013 would make later commands operate on stale work |

## Phase 0: Research

See [research.md](research.md).

## Phase 1: Design & Contracts

See [data-model.md](data-model.md) and contracts:

- [Commonization blueprint contract](contracts/commonization-blueprint-contract.md)
- [Onboarding workflow contract](contracts/onboarding-workflow-contract.md)
- [Readiness gate contract](contracts/readiness-gate-contract.md)

## Post-Design Constitution Check

- Evaluation-owned design artifacts remain under `evaluation/specs/014-evaluation-harness-commonization/`. **Pass**.
- Outside-file edits are limited to `.specify/feature.json` and `AGENTS.md`
  active-feature pointers. **Pass**.
- No runtime harness, product source, root test, root script, root browser
  configuration, or CI behavior changes are introduced by planning. **Pass**.
- The design preserves unknown, warning, weak-signal, and unmapped evidence as
  visible states. **Pass**.
- E2E thinning remains blocked until future implementation has lower-layer
  evidence and decision records. **Pass**.
- Repair remains non-mutating and out of scope. **Pass**.
