# Quickstart: Harness Onboarding Skill

## Use The Skill By Path

Reference the Skill directly:

```text
[$harness-onboarding](evaluation/skills/harness-onboarding/SKILL.md)
```

Ask for adapter onboarding, adapter readiness review, or guided harness setup.

## Expected Agent Flow

1. Run dry-run onboarding.
2. Summarize pending questions and conflicts.
3. Ask the user before writing when decisions remain.
4. Write adapter state only when appropriate.
5. Run readiness validation.
6. Summarize blocked, warning, unknown, and pass statuses distinctly.

## Validation

```powershell
python C:\Users\ayako.ueno\.codex\skills\.system\skill-creator\scripts\quick_validate.py evaluation/skills/harness-onboarding
node node_modules/prettier/bin/prettier.cjs --check evaluation/skills evaluation/specs/016-harness-onboarding-skill evaluation/README.md AGENTS.md .specify/feature.json
rg -n "\\[TODO|TODO:" evaluation/skills/harness-onboarding
git status --short
```
