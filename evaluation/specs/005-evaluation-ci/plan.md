# Implementation Plan: Evaluation CI Gate

**Feature Branch**: `005-evaluation-ci`
**Date**: 2026-05-04
**Spec**: `evaluation/specs/005-evaluation-ci/spec.md`
**Constitution**: `evaluation/.specify/memory/constitution.md` v1.2.0

## Summary

Connect the existing evaluation harness to GitHub Actions for the user's fork.
The new workflow will run the evaluation gate on fork pull requests and fork
main updates, preserve `evaluation/runs/` as an artifact even on failure, and
offer manual `gate`, `full`, and `collect-all` runs. A repository condition
keeps the job inert outside `vs-yeHoaqko/hotel-example-site`.

## Technical Context

**Language/Version**: GitHub Actions YAML, Node.js 24 from `package.json`
**Primary Dependencies**: Existing pnpm lockfile, existing Playwright container
image, existing evaluation runner
**Storage**: Generated CI artifacts from `evaluation/runs/`; no committed run
artifacts
**Testing**: Prettier YAML check, local evaluation unit tests, local evaluation
gate, push/PR workflow validation in fork
**Target Platform**: GitHub-hosted Linux runner for the fork repository
**Project Type**: Evaluation-local CI integration for a static web application
**Performance Goals**: Pull-request gate should stay bounded to the existing
evaluation gate; heavier modes remain manual
**Constraints**: Must affect only the fork; no upstream push; no product source,
root package script, root Playwright config, or deploy workflow behavior
changes
**Scale/Scope**: One new evaluation workflow plus documentation and spec
artifacts

## Constitution Check

- **I. Evaluation Assets Are Isolated**: Pass with documented exception. The
  implementation adds one root CI workflow because CI configuration must live
  under `.github/workflows/`. The workflow only invokes evaluation-local code
  and does not change product behavior.
- **II. Close the Evaluation Loop First**: Pass. The workflow runs the existing
  closed evaluation gate.
- **III. Evidence Is a Required Output**: Pass. The workflow uploads
  `evaluation/runs/` evidence even when evaluation fails.
- **IV. Tests Move Down the Pyramid When Their Responsibility Allows It**:
  Pass. This feature does not move or thin tests.
- **V. Repair Loops Must Preserve Trust**: Pass. No repair mode or mutation is
  introduced.
- **VI. Harness Growth Is Reviewable**: Pass. The spec and plan name the exact
  root CI file, rationale, blast radius, and rollback path.
- **VII. Failure Diagnostics Must Be Actionable Before Repair**: Pass. The
  workflow preserves diagnostics from feature 004 for CI failures.

### Root CI Change Rationale

**Files outside `evaluation/`**:

- `.github/workflows/evaluation.yml`: required because GitHub Actions workflows
  must live under `.github/workflows/`.

**Blast radius**:

- The job is guarded by `github.repository == 'vs-yeHoaqko/hotel-example-site'`.
- Repository permissions are read-only.
- Existing upstream workflows are not modified.

**Rollback path**:

- Delete `.github/workflows/evaluation.yml`.
- Remove the CI section from `evaluation/README.md`.
- Leave the evaluation runner unchanged.

## Project Structure

### Documentation

```text
evaluation/specs/005-evaluation-ci/
  spec.md
  plan.md
  research.md
  data-model.md
  quickstart.md
  contracts/
    workflow-contract.md
  tasks.md
```

### Planned Source Changes

```text
.github/workflows/
  evaluation.yml

evaluation/
  README.md
```

## Design Decisions

### Fork-Only Guard

The evaluation job will use a job-level condition:
`github.repository == 'vs-yeHoaqko/hotel-example-site'`. This keeps the workflow
from running in upstream or any unintended clone while still allowing the file
to exist in the fork.

### Trigger Strategy

Automatic triggers:

- `pull_request` targeting `main`
- `push` to `main`

Manual trigger:

- `workflow_dispatch` with `mode` choice: `gate`, `full`, `collect-all`
- `target` choice: `local`, `deployed`

Pull requests and pushes always run `gate` against local target. Manual runs
can request heavier modes.

### Artifact Strategy

Upload `evaluation/runs/**` with `if: always()` so failed evaluations still
produce evidence. Missing files should warn, not hide setup failures.

### Dependency Strategy

Reuse the existing upstream workflow pattern:

- Playwright container matching the repository Playwright version
- checkout
- pnpm setup
- Node setup from `package.json`
- `pnpm ci`
- evaluation command

No new package dependency is required.

## Data Contract

See `contracts/workflow-contract.md`.

## Validation Plan

1. Validate YAML formatting:
   `node node_modules/prettier/bin/prettier.cjs --check .github/workflows/evaluation.yml evaluation/specs/005-evaluation-ci evaluation/README.md`
2. Run diagnostic unit tests:
   `node --test evaluation/tests/unit/diagnostics.test.mjs evaluation/tests/unit/playwright-diagnostics.test.mjs evaluation/tests/unit/diagnostic-guidance.test.mjs evaluation/tests/unit/failure-classifier.test.mjs evaluation/tests/unit/summary-schema.test.mjs`
3. Run local gate:
   `node evaluation/bin/run-evaluation.mjs --mode gate`
4. Push only to `origin`.
5. Confirm GitHub Actions run appears in `vs-yeHoaqko/hotel-example-site` and
   not in `takeyaqa/hotel-example-site`.

## Risks and Mitigations

- **Accidental upstream effect**: Guard the job by repository full name and keep
  upstream push URL disabled locally.
- **Long pull-request runtime**: Run only `gate` automatically; keep `full` and
  `collect-all` manual.
- **Lost failure evidence**: Upload artifacts with `if: always()`.
- **Dependency drift**: Reuse repository lockfile and upstream setup pattern.
