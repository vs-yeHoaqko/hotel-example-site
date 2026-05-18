# Research: Harness Onboarding Skill

## Decision: Store the Skill under `evaluation/skills/`

**Rationale**: The user explicitly asked to avoid paths likely to conflict with
future upstream folders and to stay under `evaluation/` where possible. A
path-based Skill under `evaluation/skills/harness-onboarding/` preserves the
evaluation boundary while remaining easy to reference.

**Alternatives considered**:

- `.agents/skills/harness-onboarding/`: rejected because upstream or local
  agent infrastructure may later use `.agents/skills`.
- `$CODEX_HOME/skills`: rejected because the Skill should travel with this
  repository's evaluation harness work.
- Root-level `skills/`: rejected because it is outside the evaluation boundary.

## Decision: Keep the Skill as orchestration, not implementation

**Rationale**: The 015 CLI is the source of truth for discovery, adapter state,
and readiness validation. The Skill should tell an agent how to use those
commands safely rather than duplicating their logic.

**Alternatives considered**:

- Add scripts inside the Skill: rejected because reusable logic already exists
  in `evaluation/bin/` and `evaluation/lib/`.
- Copy 015 schema details into the Skill: rejected because it increases context
  and drift risk.

## Decision: Use a concise workflow-based Skill

**Rationale**: Harness onboarding has a strict order: dry-run, summarize,
resolve decisions, write, validate, report. A workflow-based Skill makes the
correct order explicit and keeps the body small.

**Alternatives considered**:

- Long reference-style Skill: rejected because the Skill only needs to
  orchestrate existing commands.
- Task catalog Skill: rejected because the main risk is process order, not
  choosing from many unrelated operations.
