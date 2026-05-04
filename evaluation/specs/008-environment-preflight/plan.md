# Implementation Plan: Environment Preflight And CI Run Health Artifacts

**Branch**: `008-environment-preflight` | **Date**: 2026-05-04 |
**Spec**: `evaluation/specs/008-environment-preflight/spec.md`
**Input**: Feature specification from
`evaluation/specs/008-environment-preflight/spec.md`
**Constitution**: `.specify/memory/constitution.md` v1.4.0 and
`evaluation/.specify/memory/constitution.md` v1.4.0

## Summary

Add a required environment preflight layer before the existing evaluation
layers, record machine-readable preflight evidence, teach run-health reports to
display that evidence distinctly, and update the fork-scoped GitHub Actions
workflow to generate/upload run-health output even when evaluation fails.

## Technical Context

**Language/Version**: Node.js 24 from `package.json`
**Primary Dependencies**: Existing Node standard library, Node test runner,
Playwright package metadata, Prettier, GitHub Actions upload artifact action,
and the existing evaluation runner
**Storage**: Preflight evidence under ignored `evaluation/runs/<run-id>/`;
stable report output under `evaluation/reports/`; committed specs/tests under
`evaluation/specs/008-environment-preflight/`
**Testing**: Prettier check, focused Node unit tests for preflight and
run-health rendering, report generation, `gate`, and `full`
**Target Platform**: Local Windows PowerShell and GitHub-hosted Linux through
the fork-scoped evaluation workflow
**Project Type**: Evaluation harness reliability and CI evidence feature
**Performance Goals**: Passing preflight completes in under 10 seconds without
starting the product app
**Constraints**: No product source, product fixtures, root E2E, root Playwright
config, root package script, timeout, retry, flaky-skip, E2E thinning, or repair
mode changes. Local full E2E worker count may be bounded in evaluation-local
config to match CI and reduce environment pressure.
**Scale/Scope**: One new required preflight layer across `gate`, `full`, and
`collect-all`; one preflight artifact per run; run-health report support; one
fork-scoped CI workflow update

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- **I. Evaluation Assets Are Isolated**: Pass with documented exceptions. New
  implementation, report handling, tests, and spec artifacts stay under
  `evaluation/`. Outside edits are limited to `.specify/feature.json`,
  `AGENTS.md`, and `.github/workflows/evaluation.yml`.
- **II. Close the Evaluation Loop First**: Pass. The existing loop remains and
  gains an environment preflight before behavior layers.
- **III. Evidence Is a Required Output**: Pass. Preflight writes structured
  JSON evidence and run-health includes it.
- **IV. Tests Move Down the Pyramid When Their Responsibility Allows It**:
  Pass. This feature does not move product assertions between layers.
- **V. Repair Loops Must Preserve Trust**: Pass. No repair mode is introduced.
- **VI. Harness Growth Is Reviewable**: Pass. The feature makes environment
  failures clearer before automating repair or retry behavior.
- **VII. Failure Diagnostics Must Be Actionable Before Repair**: Pass.
  Preflight evidence and run-health guidance identify environment failures
  before product/test inspection.
- **VIII. E2E Thinning Is Evidence-Preserving**: Pass. No E2E thinning changes.
- **IX. Fork Drift Must Be Minimized**: Pass with CI exception. The workflow
  edit is required to publish CI artifacts and remains in the existing
  fork-scoped workflow.

### Outside-`evaluation/` Edit Rationale

**Files**:

- `.specify/feature.json`
- `AGENTS.md`
- `.github/workflows/evaluation.yml`

**Reason**: `.specify/feature.json` and `AGENTS.md` are Speckit workflow
metadata. `.github/workflows/evaluation.yml` must change because CI artifact
generation/upload cannot be implemented from `evaluation/` alone.

**Conflict risk**: Low to medium. Speckit metadata is project-local. The GitHub
Actions workflow is fork-owned from the earlier CI feature and already guarded
with `github.repository == 'vs-yeHoaqko/hotel-example-site'`.

**Rollback path**: Restore the previous active feature pointers and workflow
steps. The preflight layer can be removed by deleting the `environment` layer
from `evaluation/config/evaluation.config.json`.

## Project Structure

### Documentation (this feature)

```text
evaluation/specs/008-environment-preflight/
  spec.md
  plan.md
  research.md
  data-model.md
  quickstart.md
  contracts/
    environment-preflight-contract.md
  checklists/
    requirements.md
  tasks.md
```

### Planned Source Changes

```text
evaluation/
  bin/
    check-environment.mjs
  config/
    evaluation.config.json
  lib/
    environment-preflight.mjs
    command-executor.mjs
    diagnostics.mjs
    run-health-model.mjs
    run-health-report.mjs
  reports/
    run-health.md
  tests/
    unit/
      environment-preflight.test.mjs
      run-health-model.test.mjs
      run-health-report.test.mjs

.github/
  workflows/
    evaluation.yml
```

**Structure Decision**: Keep preflight logic in an evaluation-local library so
both the CLI and unit tests can use the same checks. Keep CI changes limited to
post-evaluation report generation and artifact upload paths.

## Phase 0 Research

See `research.md`.

Resolved decisions:

- Add preflight as the first required evaluation layer.
- Use a JSON artifact named `artifacts/environment-preflight.json`.
- Check spawn capability, local command files, and browser executable
  availability without launching the product app.
- Update run-health to read preflight artifacts separately from Playwright JSON.
- Update CI to generate run-health with `if: always()` before artifact upload.

## Phase 1 Design

See `data-model.md` and `contracts/environment-preflight-contract.md`.

The design adds one evidence artifact, one preflight layer, report rendering for
preflight/environment evidence, and a fork-scoped workflow step. It does not
change product tests, retry policy, timeout policy, or repair behavior.

## Validation Plan

1. Validate formatting:
   `node node_modules/prettier/bin/prettier.cjs --check .github/workflows/evaluation.yml evaluation/specs/008-environment-preflight evaluation/bin evaluation/config evaluation/lib evaluation/tests evaluation/reports evaluation/README.md`
2. Run focused unit tests:
   `node --test evaluation/tests/unit/environment-preflight.test.mjs evaluation/tests/unit/run-health-model.test.mjs evaluation/tests/unit/run-health-report.test.mjs`
3. Generate run-health:
   `node evaluation/bin/generate-run-health.mjs`
4. Run the default gate:
   `node evaluation/bin/run-evaluation.mjs --mode gate`
5. Run full validation:
   `node evaluation/bin/run-evaluation.mjs --mode full`
6. Confirm generated `evaluation/runs/` stays ignored and `git diff --name-only`
   has no product source, root E2E, root Playwright, root package script, or
   upstream push-path changes.
7. Confirm local full E2E uses the same bounded worker policy as CI.

## Complexity Tracking

No constitution violations are planned. The CI workflow update is a documented
outside-`evaluation/` exception required to publish run-health artifacts.
