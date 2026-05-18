# Contract: Harness Onboarding Skill

## Required Path

```text
evaluation/skills/harness-onboarding/SKILL.md
```

The feature must not create or update files under:

```text
.agents/skills/harness-onboarding/
```

## Required Skill Behavior

The Skill must instruct an agent to:

1. Confirm the repository is clean or identify unrelated changes.
2. Run:

   ```powershell
   node evaluation/bin/init-harness-adapter.mjs --dry-run --non-interactive
   ```

3. Summarize discovered facts, pending questions, conflicts, and proposed
   writes.
4. Ask the user before writing when pending questions or conflicts affect the
   decision.
5. Write only when appropriate:

   ```powershell
   node evaluation/bin/init-harness-adapter.mjs --write --non-interactive
   ```

6. Validate:

   ```powershell
   node evaluation/bin/validate-harness-adapter.mjs
   ```

7. Summarize `evaluation/reports/harness-adapter-readiness.md`.

## Status Interpretation

| Status    | Required agent interpretation                     |
| --------- | ------------------------------------------------- |
| `blocked` | Stop before next stage and explain required fixes |
| `warning` | Continue only as warning-first and keep visible   |
| `unknown` | Keep visible; do not present as pass              |
| `pass`    | Ready for that validation item                    |

## Forbidden Actions

- Do not create or edit GitHub Actions workflows.
- Do not modify product source or fixtures.
- Do not modify root package scripts.
- Do not modify root browser-test configuration.
- Do not modify root E2E source files.
- Do not run repair mode.
- Do not thin E2E tests.
- Do not treat warning or unknown readiness as hidden success.
