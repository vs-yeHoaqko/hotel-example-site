# Implementation Plan: Evaluation Harness

**Planned Feature Branch**: `001-evaluation-harness`
**Date**: 2026-05-01
**Spec**: `evaluation/specs/001-evaluation-harness/spec.md`
**Constitution**: `evaluation/.specify/memory/constitution.md` v1.0.0
**Planning Note**: These documents are authored before switching the Git
worktree from `main`; branch creation is deferred until implementation starts.

## Summary

Build an evaluation-local harness that orchestrates a deterministic quality
gate for `hotel-example-site`, captures canonical run evidence, classifies
failures, and provides an auditable foundation for later repair automation.

The initial implementation should prove the whole loop with thin coverage at
each layer before expanding the test pyramid:

1. static/format check using existing root tooling
2. unit checks for directly importable pure logic
3. integration checks for page-local DOM behavior
4. smoke E2E checks for representative browser flows
5. full existing Playwright suite in CI or when explicitly requested

## Technical Context

**Runtime**: Node.js 22, pnpm 10
**Application stack**: Static HTML, Webpack 5, jQuery, Bootstrap 4, browser
storage and cookies
**Existing test stack**: Playwright 1.59, root `e2e/` suite, one QUnit HTML
billing test
**Target command style**: `node evaluation/bin/run-evaluation.mjs`
**Artifact root**: `evaluation/runs/<run-id>/`
**Default target**: local Webpack dev server through existing Playwright
`webServer`
**Alternate target**: deployed site when `USE_DEPLOYED_SITE=true`
**Dependency policy**: use existing dependencies first; do not modify root
package scripts or add package dependencies for the initial harness. If schema
validation becomes complex later, add evaluation-only dependencies through an
isolated `evaluation/` package.

## Constitution Check

- **I. Evaluation Assets Are Isolated**: Pass. Planned files are under
  `evaluation/`; root source, static pages, tests, and package scripts are not
  changed by default.
- **II. Close the Evaluation Loop First**: Pass. The first implementation runs
  all configured layers, classifies results, preserves artifacts, and emits a
  machine-readable summary before adding broader coverage.
- **III. Evidence Is a Required Output**: Pass. `summary.json` is the canonical
  output and references per-layer logs, Playwright artifacts, reports, and diffs.
- **IV. Tests Move Down the Pyramid When Their Responsibility Allows It**:
  Pass. The plan introduces explicit ownership records for unit, integration,
  and E2E behaviors.
- **V. Repair Loops Must Preserve Trust**: Pass. Repair mode is intentionally
  deferred until the gate, evidence model, and deterministic failure
  classification are stable.

No constitution violations are planned.

## Project Structure

```text
evaluation/
  .specify/
    memory/
      constitution.md
  specs/
    001-evaluation-harness/
      spec.md
      plan.md
      tasks.md
  bin/
    run-evaluation.mjs
  lib/
    cli.mjs
    command-executor.mjs
    command-format.mjs
    config.mjs
    failure-classifier.mjs
    git-state.mjs
    layer-planner.mjs
    ownership.mjs
    recommended-action.mjs
    redaction.mjs
    run-id.mjs
    schema-validator.mjs
    summary-model.mjs
    summary-markdown.mjs
  config/
    evaluation.config.json
    failing-fixture.config.json
    playwright.full.config.mjs
    playwright.integration.config.mjs
    playwright.smoke.config.mjs
  schemas/
    summary.schema.json
    ownership.schema.json
  tests/
    fixtures/
      failing-layer.mjs
    unit/
      billing.test.mjs
    integration/
      reservation-form.spec.mjs
    e2e/
      smoke.spec.mjs
  reports/
    templates/
      summary.md.mjs
  examples/
    summary.example.json
  baselines/
    README.md
  .gitignore
  runs/
    <run-id>/
      summary.json
      summary.md
      ownership.json
      logs/
      artifacts/
```

At this stage, `spec.md`, `plan.md`, and `tasks.md` are planning documents. The
remaining paths describe the intended implementation shape.

Committed implementation files should include runner code, config, schemas,
evaluation-local tests, the stable example summary, baseline documentation, and
ignore rules. Generated run directories and generated baseline result JSON stay
uncommitted by default.

## Design Decisions

### Runner

Implement `evaluation/bin/run-evaluation.mjs` as a small Node CLI that:

- creates a run id from timestamp plus short git identifier
- records git commit, branch, dirty state, and selected mode
- records dirty worktree changed file paths
- loads `evaluation/config/evaluation.config.json`
- executes configured layers in order with per-command timeout and declared
  layer dependencies
- writes stdout and stderr for every command to `logs/<layer>.stdout.log` and
  `logs/<layer>.stderr.log`
- stores raw machine outputs such as Playwright JSON in `artifacts/`; the first
  implementation does not generate Playwright HTML reports
- writes `summary.json` and `summary.md`
- validates `summary.json` against `evaluation/schemas/summary.schema.json`
  with a small internal validator
- validates `ownership.json` against `evaluation/schemas/ownership.schema.json`
  with the same internal validator
- treats schema validation failures as internal runner errors
- applies lightweight redaction to runner-managed text outputs and summary
  fields for known sensitive keys
- exits `0` only when all required attempted layers pass and exits `1` for any
  failed run
- writes `summary.json` with `status: "error"` when an internal runner error
  occurs and summary writing is still possible

Rationale: a Node runner fits the existing runtime, avoids shell-specific
orchestration, avoids new dependencies for the first implementation, and can
run on local machines or CI.

### Layer Commands

Use existing commands where possible, but override output paths from the runner:

- Static: `node node_modules/prettier/bin/prettier.cjs --check` against the
  committed `evaluation/` implementation paths, excluding generated run
  directories
- Unit: `node --test evaluation/tests/unit/billing.test.mjs`
- Integration: `node node_modules/@playwright/test/cli.js test --config evaluation/config/playwright.integration.config.mjs`
- E2E smoke: `node node_modules/@playwright/test/cli.js test --config evaluation/config/playwright.smoke.config.mjs`
- Full E2E explicit/CI: `node node_modules/@playwright/test/cli.js test --config evaluation/config/playwright.full.config.mjs`

The first implementation should not request Playwright HTML reports. It should
prefer Playwright JSON output plus standard trace, screenshot, and output
artifacts under the run directory.
Evaluation-local Playwright configs run the existing webpack build before
starting the local dev server because the checked-in HTML references generated
`dist/` assets. `dist/` is already ignored by the root repository and remains
an uncommitted tool transient.

The local default gate should stop after the smoke E2E layer. Full E2E must be
required in CI and available through an explicit mode or flag for local runs.
`full` mode should run every `gate` layer first and then run the full E2E layer
when earlier required layers pass.
Layer enablement, commands, timeouts, and dependencies should come from
`evaluation/config/evaluation.config.json`; the first CLI should select the
runner mode and may select a config file under `evaluation/config/` with
`--config <path>`. It should not allow ad hoc layer or timeout overrides. The
config should define an ordered `layers` array. Layer commands should be argv
arrays, and layer requirements should use recognized values `node`, `pnpm`,
`playwright`, and `dev-server`. The runner records `dev-server` as a
requirement but leaves startup and readiness to Playwright `webServer`.
Initial timeout values should be static 60s, unit 60s, integration 120s, smoke
E2E 180s, full E2E 600s, and controlled failing fixture 60s.

### Configuration Contract

`evaluation/config/evaluation.config.json` should define an ordered `layers`
array. The order is the default execution order. Each layer should use this
shape:

```json
{
  "name": "unit",
  "required": true,
  "modes": ["gate", "full", "collect-all"],
  "timeoutMs": 60000,
  "command": ["node", "--test", "evaluation/tests/unit/billing.test.mjs"],
  "dependsOn": [],
  "requires": ["node"]
}
```

`dependsOn` is only for layer-to-layer dependencies. `requires` is only for
tool or environment requirements and is limited to `node`, `pnpm`,
`playwright`, and `dev-server` in the first implementation. The runner records
missing requirements distinctly from failed layer dependencies.

`evaluation/config/failing-fixture.config.json` should reuse the same config
shape and enable only the controlled failing fixture needed for acceptance
checks. Normal `evaluation.config.json` must keep that fixture disabled.

### Unit Layer

Start with directly importable pure logic in `src/lib/billing.js`, specifically
`calcTotalBill`.
Do not force Node-native unit tests onto modules that depend on Webpack JSON
imports, jQuery globals, `document`, or `localStorage`.

Rationale: the first unit layer should be reliable and low-maintenance. Browser
or bundler-dependent modules can move into integration coverage until a test
bundler is intentionally introduced.

### Integration Layer

Use Playwright with evaluation-local specs to exercise page-local behavior on
the existing built site:

- reservation form field validation
- contact method field visibility
- total bill recalculation on input changes
- localized display where page-local behavior matters

These tests should avoid multi-page journeys except where the page cannot be
reached without a realistic setup step.

### E2E Layer

Keep E2E focused on behavior only a browser journey can validate:

- login and logout cookie behavior
- redirects for unauthorized routes
- reservation popup and confirm flow
- session storage transaction handoff
- representative `ja` and `en-US` route coverage

The smoke layer should include a small subset. The full layer should invoke the
existing `e2e/` suite in CI or when explicitly requested. The first smoke layer
must include thin representative checks for both `en-US` and `ja`.

### Failure Classification

Classify each failed layer with deterministic rules first:

- timeout exceeded: `timeout`
- command cannot start, missing dependency, port unavailable: `environment`
- static or format command failure: `test`
- evaluation-local unit assertion failure against `calcTotalBill`: `product`
- evaluation-local unit syntax, import, helper, or harness error: `test`
- assertion or expectation failure in evaluation-local test: `product` or
  `test` based on ownership metadata and stack path
- evaluation-local Playwright assertion or expectation failure against product
  behavior: `product`
- evaluation-local Playwright spec code error, helper error, or fixture setup
  failure: `test`
- unrecognized failure: `unknown`

Later iterations may improve classification using more detailed reporter output
or repair diagnostics. Automatic `flaky` classification is deferred until the
harness has retry history or repeated-run evidence.

Timeouts in required layers fail the selected run and are recorded with
`classification: "timeout"`. Process exit codes stay simple: `0` for a
successful selected mode and `1` for any failed or errored run; detailed
classification belongs in `summary.json`.
Run status values are `passed`, `failed`, and `error`; layer status values are
`passed`, `failed`, and `skipped`.

Artifact paths in `summary.json` should be relative to the run directory only.
Dirty-worktree changed file paths should be repository-root-relative and use
`/` separators. `repository.changedFiles` should always be present, using an
empty array for clean worktrees, and include both tracked and untracked changed
files as objects with `path` and `status`. Status values should be normalized
to `modified`, `added`, `deleted`, `renamed`, `untracked`, or `unknown`.
Unmapped Git statuses should use `unknown` rather than being rounded to
`modified`.
The summary should include aggregate run counts as well as per-layer counts.
Layers that do not expose test-case counts should still emit the same counts
shape, with a successful command counted as `passed: 1` and a failed command
counted as `failed: 1`.
`recommendedNextAction.message` should use exact runner built-in text:
`none` -> `No action required.`, `fix_environment` -> `Fix the evaluation
environment or timeout condition before inspecting product or test failures.`,
`inspect_product` -> `Inspect the product behavior covered by the failing
layer.`, `inspect_test` -> `Inspect the evaluation test, helper, fixture, or
command configuration.`, and `investigate_unknown` -> `Investigate the
recorded failure evidence before assigning ownership.`
Redacted values should be replaced with `[REDACTED]` without hashes or reversible
data. Apply redaction to command display strings and command argv arrays before
writing structured evidence. The first redaction detector should cover known
sensitive key names plus explicit `KEY=value` and `KEY: value` text patterns;
it should not parse URL queries, JSON string internals, or generic `--key value`
option pairs.
Layer commands in `summary.json` should include both execution argv and a
human-readable display string generated from `executedArgv` with OS-independent
deterministic display quoting. The display string is for review, not a
shell-specific reexecution contract. The display algorithm should join redacted
`executedArgv` entries with a single space, leave arguments containing only
alphanumerics, `.`, `_`, `/`, `-`, `:`, and `=` unquoted, render empty strings
as `""`, wrap all other arguments in double quotes, and escape `\`, `"`,
newline, carriage return, and tab inside quoted arguments. Command records
should keep both configured argv and executed argv so runner-injected output
arguments remain visible. Command
records should include only runner-managed environment variables explicitly
injected for that command, not the full process environment. Injected env
values should be recorded as key/value pairs after applying the same redaction
rules used for logs and summaries, with keys emitted in ascending order for
stable diffs. Do not omit runner-injected env keys; redact sensitive values
instead.

### Evidence Contract

`summary.json` should follow this shape:

```json
{
  "schemaVersion": 1,
  "runId": "20260501T132800-main-abcdef0",
  "mode": "gate",
  "repository": {
    "branch": "main",
    "commit": "abcdef0",
    "dirty": true,
    "changedFiles": [
      {
        "path": "src/reservation.js",
        "status": "modified"
      },
      {
        "path": "tests/e2e/reservation.spec.js",
        "status": "untracked"
      }
    ]
  },
  "startedAt": "2026-05-01T04:28:00.000Z",
  "finishedAt": "2026-05-01T04:31:00.000Z",
  "status": "passed",
  "recommendedNextAction": {
    "code": "none",
    "message": "No action required."
  },
  "layers": [
    {
      "name": "unit",
      "required": true,
      "status": "passed",
      "command": {
        "configuredArgv": [
          "node",
          "--test",
          "evaluation/tests/unit/billing.test.mjs"
        ],
        "executedArgv": [
          "node",
          "--test",
          "evaluation/tests/unit/billing.test.mjs"
        ],
        "env": {},
        "display": "node --test evaluation/tests/unit/billing.test.mjs"
      },
      "exitCode": 0,
      "durationMs": 1200,
      "counts": {
        "passed": 1,
        "failed": 0,
        "skipped": 0,
        "timeout": 0
      },
      "classification": null,
      "artifacts": ["logs/unit.stdout.log", "logs/unit.stderr.log"]
    }
  ]
}
```

### Schema Validation

The first validator should stay internal to the runner and avoid new
dependencies. It should enforce required properties, primitive types, enum
values, array item shapes, and object property shapes. It should reject
additional properties by default unless a schema object is explicitly marked as
an extension point. Validation failure for generated outputs is a runner
internal error: write `status: "error"` when possible and exit `1`.

### Ownership Contract

`ownership.json` should map evaluated behaviors to the lowest appropriate layer:

```json
{
  "schemaVersion": 1,
  "records": [
    {
      "behavior": "Total bill calculation",
      "ownerLayer": "unit",
      "evidence": "src/lib/billing.js is pure calculation logic",
      "coveredBy": ["evaluation/tests/unit/billing.test.mjs"],
      "migrationRecommendation": "Keep detailed arithmetic cases at unit level; retain only representative E2E billing checks."
    }
  ]
}
```

## Implementation Phases

### Phase 1 - Minimal Gate and Evidence

- Add evaluation runner CLI.
- Add evaluation config with static, unit, integration, smoke, and explicit/CI
  full E2E layer definitions, including layer dependencies and timeout values.
- Add `evaluation/config/failing-fixture.config.json` for controlled failure
  acceptance checks.
- Add unit test for total billing logic.
- Add thin integration and smoke E2E specs, including both `en-US` and `ja`
  representative route checks.
- Write `summary.json` and `summary.md`.
- Ensure `summary.json` includes `recommendedNextAction` for every run outcome,
  with fixed-enum `code` and free-text `message`, including `code: "none"` for
  successful runs.
- Compute `recommendedNextAction.code` from all recorded failures using the
  same documented priority order in every runner mode.
- Use this priority order for recorded failures: `fix_environment`,
  `inspect_product`, `inspect_test`, then `investigate_unknown`.
- Map `timeout` classifications to `fix_environment` in the first
  implementation.
- Generate `recommendedNextAction.message` from runner built-in standard
  messages for each action code.
- Ensure `summary.md` includes run metadata, a layer result table, artifact
  links, an ownership summary, and a recommended next action for every run
  outcome, including `No action required` for successful runs.
- Add `evaluation/schemas/summary.schema.json` and minimal no-dependency schema
  validation in the runner.
- Enforce required properties, primitive types, enum values, array item shapes,
  object property shapes, and reject additional properties by default unless an
  object is explicitly marked as an extension point.
- Add `evaluation/schemas/ownership.schema.json` and validate generated
  `ownership.json`.
- Add lightweight redaction for known keys such as `password`, `cookie`,
  `authorization`, and `token`.
- Ensure Playwright output paths stay under `evaluation/runs/<run-id>/`.
- Add ignore rules for generated `evaluation/runs/` artifacts.
- Add stable example summary output outside `evaluation/runs/`.
- Add `evaluation/baselines/README.md` without committing generated baseline
  result JSON, and document the controlled failing fixture expected outcome.

### Phase 2 - Ownership Reporting

- Add ownership metadata for initial evaluated behaviors.
- Emit `ownership.json` per run.
- Add summary section that lists behaviors suitable for migration down the test
  pyramid.

### Phase 3 - Failure Classification

- Parse command failures and Playwright JSON output.
- Add deterministic categories: `product`, `test`, `environment`, `timeout`,
  `unknown`.
- Include skipped-layer reasons when the gate stops early.

### Deferred Phase - Future Repair Mode Foundation

- Add opt-in `--mode repair` after the earlier phases have produced stable
  evidence across normal runs.
- Preserve failing run evidence before any changes.
- Record retry limit, changed files, and diff artifact.
- Rerun relevant test, owning layer, then full gate.
- Stop with unresolved status when retry limit is reached.

## Validation Plan

1. Run `node evaluation/bin/run-evaluation.mjs --mode gate`.
2. Confirm `evaluation/runs/<run-id>/summary.json` exists and validates against
   the documented evidence contract.
3. Confirm a successful run exits `0`.
4. Run `node evaluation/bin/run-evaluation.mjs --mode full` and confirm the
   `gate` layers run before full E2E output is captured under the run
   directory.
5. Run `node evaluation/bin/run-evaluation.mjs --mode collect-all`
   and confirm all eligible configured layers are attempted, including
   independent layers after an earlier layer failure.
6. Run the controlled failing fixture config and confirm exit code is non-zero
   with logs, classification, and expected outcome documented in
   `evaluation/baselines/README.md`.
7. Confirm no files outside `evaluation/` are created or modified by the
   default gate, except transient tool behavior already owned by existing root
   commands. Any such behavior must be moved under `evaluation/` or documented
   before release.
8. Run with `USE_DEPLOYED_SITE=true` and confirm the target is recorded in
   `summary.json`.

## Risks and Mitigations

- **Playwright output outside evaluation**: invoke Playwright with explicit
  `--output` and reporter environment variables from the runner.
- **Node import incompatibility for browser modules**: keep Node unit tests to
  directly importable pure modules; use Playwright integration tests for browser
  modules.
- **Slow full E2E feedback**: keep smoke E2E separate and require full E2E only
  in CI or explicit local runs.
- **Repair mode reducing trust**: defer repair mode until the gate, evidence
  model, and failure classification have stable behavior.
