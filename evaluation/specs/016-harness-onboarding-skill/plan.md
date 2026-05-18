# Implementation Plan: Harness Onboarding Skill

**Branch**: `016-harness-onboarding-skill` | **Date**: 2026-05-18 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `evaluation/specs/016-harness-onboarding-skill/spec.md`

## Summary

Create a concise path-based Codex Skill that orchestrates the 015 guided
harness onboarding CLI. The Skill lives under `evaluation/skills/` to preserve
the evaluation boundary and avoid future `.agents/skills` path conflicts. It
does not add new harness runtime behavior; it documents the correct agent
workflow, status interpretation, and safety boundaries.

## Technical Context

**Language/Version**: Markdown Skill instructions plus generated Skill metadata
**Primary Dependencies**: Existing 015 onboarding commands and the Skill
validation script from the local skill-creator system skill
**Storage**: `evaluation/skills/harness-onboarding/` and 016 Spec Kit artifacts
under `evaluation/specs/016-harness-onboarding-skill/`
**Testing**: Skill validator, TODO scan, path-boundary review, Prettier check,
and dry-run command smoke check
**Target Platform**: Local Codex usage through an explicit path reference
**Project Type**: Evaluation-local Skill/process documentation
**Performance Goals**: Reviewer can find path and workflow in under 2 minutes
**Constraints**: Do not add files under `.agents/skills/`; do not modify product
source, root package scripts, root browser-test config, root E2E files, or CI
workflows
**Scale/Scope**: One Skill folder, no bundled scripts/references/assets beyond
the required Skill metadata

## Constitution Check

_GATE: Must pass before implementation. Re-check after design._

- Evaluation assets stay under `evaluation/` unless pointer edits are needed.
  **Pass with documented exceptions**: `.specify/feature.json` and `AGENTS.md`
  are active Spec Kit pointers only.
- Outside-file edits state rationale, blast radius, and rollback path. **Pass**:
  pointer edits affect planning context only and can be restored.
- Changes identify affected test layers and evidence. **Pass**: no test layer
  behavior changes; evidence is Skill validation, formatting, command smoke
  checks, and boundary review.
- E2E thinning is not performed. **Pass**.
- Fork drift is minimized. **Pass**: Skill lives under `evaluation/skills/`, not
  `.agents/skills/`.
- Repair remains non-mutating and out of scope. **Pass**.

## Project Structure

### Documentation (this feature)

```text
evaluation/specs/016-harness-onboarding-skill/
|-- spec.md
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- checklists/
|   `-- requirements.md
|-- contracts/
|   `-- skill-contract.md
`-- tasks.md
```

### Source Code

```text
evaluation/
|-- README.md
|-- skills/
|   `-- harness-onboarding/
|       |-- SKILL.md
|       `-- agents/
|           `-- openai.yaml
`-- specs/016-harness-onboarding-skill/
```

**Structure Decision**: Keep the Skill under `evaluation/skills/` and make it
path-based. Do not add it to `.agents/skills/` because that path may be used by
upstream or project-level agent infrastructure later.

## Complexity Tracking

| Violation                                  | Why Needed                                    | Simpler Alternative Rejected Because                                    |
| ------------------------------------------ | --------------------------------------------- | ----------------------------------------------------------------------- |
| Active pointer edits outside `evaluation/` | Spec Kit and agents must resolve the 016 plan | Leaving pointers on 015 would make later commands operate on stale work |

## Phase 0: Research

See [research.md](research.md).

## Phase 1: Design & Contracts

See [data-model.md](data-model.md) and [skill contract](contracts/skill-contract.md).

## Post-Design Constitution Check

- Skill files remain under `evaluation/skills/harness-onboarding/`. **Pass**.
- `.agents/skills/` remains untouched. **Pass**.
- The Skill preserves 015 non-goals for CI workflow generation, E2E thinning,
  product/root edits, and repair. **Pass**.
- The Skill is validated using the Skill validator and does not add runtime
  behavior. **Pass**.
