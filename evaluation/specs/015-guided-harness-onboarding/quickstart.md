# Quickstart: Guided Harness Onboarding

## Goal

Create and validate an adapter draft before running evaluation evidence. The
flow should help a maintainer who does not know the harness process identify
what needs to be configured next.

## Planned Commands

```powershell
node evaluation/bin/init-harness-adapter.mjs --dry-run
node evaluation/bin/init-harness-adapter.mjs --write
node evaluation/bin/validate-harness-adapter.mjs
```

## Expected Flow

1. Start with discovery in dry-run mode.
2. Review detected package/test/CI/ignore facts and pending questions.
3. Write or update adapter state only after reviewing the proposed draft.
4. Run readiness validation.
5. Read `evaluation/reports/harness-adapter-readiness.md`.
6. Resolve `blocked` findings before first evidence.
7. Treat `warning`, `unknown`, weak-signal, and unmapped findings as visible
   review items, not as hidden success.

## First-Run Expectations

- The command may create or update adapter state under `evaluation/config/`.
- The validation command may create or update a readiness report under
  `evaluation/reports/`.
- No product source, root scripts, root browser config, root E2E files, or
  GitHub Actions workflows are changed.
- CI is recorded as policy only. Workflow generation is a later opt-in feature.

## Validation Checklist

```powershell
node --test evaluation/tests/unit/harness-adapter-*.test.mjs
node node_modules/prettier/bin/prettier.cjs --check evaluation/bin evaluation/lib evaluation/config evaluation/schemas evaluation/tests evaluation/reports evaluation/specs
git diff --name-only
git status --short
```

Confirm that changed files are limited to:

- `.specify/feature.json`
- `AGENTS.md`
- `evaluation/specs/015-guided-harness-onboarding/`
- planned `evaluation/bin/`, `evaluation/lib/`, `evaluation/config/`,
  `evaluation/schemas/`, `evaluation/reports/`, and `evaluation/tests/unit/`
  files for this feature
