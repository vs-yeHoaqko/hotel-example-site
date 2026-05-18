---
name: harness-onboarding
description: Guide evaluation harness adapter onboarding using the repository-local 015 CLI workflow. Use when Codex needs to create, review, validate, or explain `evaluation/config/harness-adapter.json`, interpret `evaluation/reports/harness-adapter-readiness.md`, help a maintainer adopt the evaluation harness, or decide the next safe onboarding step without generating CI workflows, thinning E2E tests, running repair mode, or editing product/root files.
---

# Harness Onboarding

Use this Skill as a thin orchestration layer over the evaluation-local onboarding
commands. The CLI is the source of truth; this Skill defines the safe order,
review points, and status interpretation for agents.

## Workflow

1. Check the local worktree first.
   - Run `git status --short`.
   - If unrelated user changes exist, preserve them and avoid touching those
     files.
   - Continue only within the evaluation-harness boundary unless the user
     explicitly approves otherwise.

2. Run discovery in dry-run mode before writing anything.

   ```powershell
   node evaluation/bin/init-harness-adapter.mjs --dry-run --non-interactive
   ```

   Summarize:
   - discovered facts
   - proposed layer count
   - pending questions
   - conflicts
   - whether `evaluation/config/harness-adapter.json` already exists

3. Stop for user decisions when needed.
   - Ask before writing if dry-run reports pending questions that affect layer
     ownership, targets, artifact policy, behavior mapping, quality policy, CI
     policy, or governance.
   - Ask before writing if conflicts exist.
   - Keep `deferred` and `unknown` decisions visible; do not fill them with
     guesses to make readiness look cleaner.

4. Write adapter state only after review.

   ```powershell
   node evaluation/bin/init-harness-adapter.mjs --write --non-interactive
   ```

   Expected output:

   ```text
   evaluation/config/harness-adapter.json
   ```

5. Validate readiness.

   ```powershell
   node evaluation/bin/validate-harness-adapter.mjs
   ```

   Expected report:

   ```text
   evaluation/reports/harness-adapter-readiness.md
   ```

6. Report the result.
   - Lead with `blocked` findings.
   - Keep `warning` and `unknown` findings visible.
   - Name the next recommended action from the CLI/report.
   - Mention whether CI is `github-actions`, `other`, `local-only`, or
     `deferred`.

## Status Rules

- `blocked`: stop before the next stage and explain the required fix.
- `warning`: work may continue only as warning-first; keep it visible.
- `unknown`: do not present as pass; ask for review or record as deferred.
- `pass`: ready for that validation item only.

Warnings and unknowns are not hidden success. They are review signals.

## Safety Boundary

Allowed writes during onboarding:

- `evaluation/config/harness-adapter.json`
- `evaluation/reports/harness-adapter-readiness.md`
- evaluation-local documentation or specs when the user is explicitly working
  on the onboarding feature

Do not do these as part of this Skill:

- create or edit GitHub Actions workflows
- modify product source or product fixtures
- modify root package scripts
- modify root browser-test configuration
- modify root E2E source files
- run repair mode
- thin, rewrite, remove, or relax E2E tests
- treat `warning`, `unknown`, weak-signal, or unmapped evidence as pass

CI is adapter policy only in this workflow. A workflow template or generated CI
file requires a separate approved feature.

## Path Notes

This Skill is repository-local and path-based:

```text
evaluation/skills/harness-onboarding/SKILL.md
```

Do not move it to `.agents/skills/` unless a later approved change explicitly
chooses automatic project skill discovery. Keeping it under `evaluation/`
reduces fork drift and avoids occupying paths upstream may add later.
