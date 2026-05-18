# Evaluation Harness

This directory contains an evaluation-local quality gate for
`hotel-example-site`. It is separate from the product source and the existing
root Playwright examples.

## What It Does Today

The harness closes the basic evaluation loop:

1. run configured evaluation layers
2. write machine-readable and human-readable evidence
3. classify failures
4. recommend the next human action

The default gate currently runs these layers in order:

| Layer         | Purpose                                                                                |
| ------------- | -------------------------------------------------------------------------------------- |
| `environment` | Checks local harness runtime, subprocess spawn, required tools, and browser files.     |
| `static`      | Checks evaluation files with Prettier.                                                 |
| `unit`        | Runs focused Node tests for billing logic and evaluation model/report contracts.       |
| `integration` | Runs page-local Playwright checks for reservation form behavior.                       |
| `smoke-e2e`   | Runs thin localized browser journeys, including one reservation completion happy path. |

`full-e2e` is available in explicit modes and runs the existing root `e2e/`
suite after the gate layers.

The full E2E evaluation intentionally uses one worker locally and in CI. The
root suite contains popup-heavy reservation completion journeys; limiting
workers reduces local dev-server and browser contention without changing root
E2E assertions, retries, or timeouts.

## E2E Thinning Records

The reservation root E2E suite has been thinned where lower-layer evidence owns
the detailed behavior. The browser journeys remain in root E2E; detailed
contact-field, validation-feedback, and total-bill assertions are recorded as
owned by integration or unit tests.

The canonical thinning record is:

```text
evaluation/config/thinning-decisions.config.json
```

The human-readable view is generated into:

```text
evaluation/reports/migration-candidates.md
```

The execution-state view is generated into:

```text
evaluation/reports/thinning-execution.md
```

Read the report by candidate ID. Each reviewed candidate shows its readiness
status, thinning outcome, decision reason, lower-layer evidence, remaining E2E
coverage, outside files, and conflict risk. `thinned` means the detailed root
E2E assertion was removed or reduced; `keep_e2e` means the browser journey
stays as representative end-to-end coverage; `retained` and `deferred` are
available for reviewed candidates that must stay unchanged.

`thinning-execution.md` translates those decisions into execution states:
`approved_to_thin`, `blocked`, `deferred`, and `keep_e2e`. Report generation
does not rewrite root E2E files. Root-suite edits remain explicit,
human-reviewed changes tied to candidate IDs.

## Slow And Flaky Evidence Report

The harness can summarize recent run health without executing product tests:

```sh
node evaluation/bin/generate-run-health.mjs
```

The command reads existing machine-readable evidence under `evaluation/runs/`
and writes stable review guidance to:

```text
evaluation/reports/run-health.md
```

The report includes:

| Section                | Meaning                                                                   |
| ---------------------- | ------------------------------------------------------------------------- |
| `Selected Runs`        | Latest readable runs, mode, target, status, dirty state, and summaries.   |
| `Trend Summary`        | Selected-run status counts and per-layer latest/previous duration deltas. |
| `Baseline Comparison`  | Latest layer health compared with committed baseline tolerances.          |
| `Preflight Evidence`   | Runtime checks from `artifacts/environment-preflight.json`.               |
| `Slow Layers`          | Layers whose duration exceeds `run-health.config.json` thresholds.        |
| `Slow Tests`           | Top Playwright test observations above the configured slow threshold.     |
| `Instability Evidence` | Failed, timed-out, interrupted, unexpected, or retried test evidence.     |
| `Environment Evidence` | Tooling, sandbox, browser install, process, or server-start evidence.     |
| `Warnings`             | Missing, malformed, or incomplete evidence that did not stop reporting.   |

The review policy lives in:

```text
evaluation/config/run-health.config.json
```

The committed run-health baseline lives in:

```text
evaluation/baselines/run-health-baseline.json
```

Baseline updates should be explicit code-review changes. They do not require
committing `evaluation/runs/` artifacts.

Slow/flaky evidence is advisory. It does not mark tests flaky, skip tests,
change timeouts, thin E2E assertions, change CI triggers, or run repair mode.
Use it to decide where the next harness improvement should focus.

## Test Meaningfulness Report

The harness can also inventory executable test evidence without running product
tests:

```sh
node evaluation/bin/generate-test-meaningfulness.mjs
```

The command scans configured test roots and writes:

```text
evaluation/reports/test-meaningfulness.md
```

The report separates:

| Dimension  | Meaning                                                                             |
| ---------- | ----------------------------------------------------------------------------------- |
| Layer      | Root E2E, evaluation smoke, integration, product unit, or harness unit.             |
| Source     | Upstream/root suite versus fork-created evaluation tests.                           |
| Category   | Product journey, navigation, page-local behavior, domain rule, or harness contract. |
| Assertions | Assertion-like checks observed in each test body.                                   |

This is a deterministic inventory, not semantic coverage instrumentation. It
flags tests with no assertion-like checks as weak signals for human review.

## Quality Gate Report

The harness can consolidate run health, test meaningfulness, diagnostics, and
thinning execution evidence into one gate result:

```sh
node evaluation/bin/generate-quality-gate.mjs
```

The command writes:

```text
evaluation/reports/quality-gate.md
```

The gate status is:

| Status | Meaning                                                                  |
| ------ | ------------------------------------------------------------------------ |
| `pass` | No configured warning or failure threshold was breached.                 |
| `warn` | At least one warning-first threshold was breached.                       |
| `fail` | At least one fail-enforced threshold was breached and the command fails. |

Initial thresholds are warning-first. They are defined in:

```text
evaluation/config/quality-gate.config.json
```

The gate also contains a small set of fail-enforced integrity checks:

- the latest evaluation summary must be readable
- the required `environment` layer must pass
- the required `smoke-e2e` layer must pass

Timing, slow-layer, flaky, and test-meaningfulness trend signals remain
warning-only unless a reviewed policy explicitly promotes them to fail.

The current minimum meaningfulness thresholds are intentionally conservative.
They detect sudden coverage drops without failing the current fork on normal
growth. Timing and baseline thresholds should be tightened only after stable CI
evidence exists.

## CI Gate Summary

For CI review, the harness can write a concise first-screen summary:

```sh
node evaluation/bin/generate-ci-gate-summary.mjs
```

The command writes:

```text
evaluation/reports/ci-gate-summary.md
```

In GitHub Actions, the same Markdown is appended to the workflow run summary
when `GITHUB_STEP_SUMMARY` is available. Use this summary to identify the gate
status, mode, target, primary issue, recommended action, and report paths before
opening the full artifact bundle.

## Guided Harness Onboarding

The harness can draft and validate an adapter record before evidence runs. This
is intended for commonization work where a maintainer needs to map local
repository facts to harness concepts without memorizing the process.

Preview discovered facts, proposed layers, pending questions, and conflicts
without writing files:

```sh
node evaluation/bin/init-harness-adapter.mjs --dry-run --non-interactive
```

Write the draft adapter state to `evaluation/config/harness-adapter.json`:

```sh
node evaluation/bin/init-harness-adapter.mjs --write --non-interactive
```

Validate adapter readiness without running product tests:

```sh
node evaluation/bin/validate-harness-adapter.mjs
```

The validation command writes:

```text
evaluation/reports/harness-adapter-readiness.md
```

CI is recorded as adapter policy only. Guided onboarding does not create or
edit GitHub Actions workflows, product files, package scripts, root browser
test configuration, root E2E files, E2E thinning decisions, or repair changes.

## Environment Preflight

The first gate layer is `environment`:

```sh
node evaluation/bin/check-environment.mjs
```

It checks whether the harness can spawn subprocesses, find required local CLI
files, and find the Playwright Chromium executable. It does not start the
product app, launch a browser, or run product tests.

The preflight artifact is written to:

```text
evaluation/runs/<run-id>/artifacts/environment-preflight.json
```

If preflight fails, later required layers are skipped outside `collect-all` and
the recommended action is `fix_environment`.

## Commands

Run the default gate:

```sh
node evaluation/bin/run-evaluation.mjs --mode gate
```

## CI Usage

The fork has a dedicated `Evaluation Gate` workflow in
`.github/workflows/evaluation.yml`.

Automatic runs:

- pull requests targeting the fork's `main` branch run `gate` against the local
  site
- pushes to the fork's `main` branch run `gate` against the local site

Manual runs:

- `gate`: default CI-equivalent evaluation
- `full`: includes the full E2E layer
- `collect-all`: collects as much evidence as possible after failures
- `target=local`: records local target metadata and uses the local dev server
- `target=deployed`: records deployed target metadata and evaluates the deployed
  site

The workflow is intentionally fork-scoped. The evaluation job runs only when
`github.repository` is `vs-yeHoaqko/hotel-example-site`; it is skipped in other
repositories. The local `upstream` remote should keep its push URL disabled so
sync operations cannot accidentally push to the original repository.

Each CI run attempts to upload `evaluation/runs/**` as an artifact, even when
the evaluation command fails. CI also attempts to generate and upload
`evaluation/reports/migration-candidates.md`,
`evaluation/reports/thinning-execution.md`,
`evaluation/reports/run-health.md`,
`evaluation/reports/test-meaningfulness.md`, and
`evaluation/reports/quality-gate.md` with the same artifact. Use the uploaded
`summary.md`, `summary.json`, `quality-gate.md`, `run-health.md`,
`test-meaningfulness.md`, `thinning-execution.md`, logs, screenshots, videos,
and traces as the starting point for diagnosis.

Run all configured layers, including the existing full E2E suite:

```sh
node evaluation/bin/run-evaluation.mjs --mode full
```

Run every eligible independent layer and collect as much evidence as possible:

```sh
node evaluation/bin/run-evaluation.mjs --mode collect-all
```

Run the controlled failing fixture:

```sh
node evaluation/bin/run-evaluation.mjs --mode gate --config evaluation/config/failing-fixture.config.json
```

To record that a run targets the deployed site:

```sh
USE_DEPLOYED_SITE=true node evaluation/bin/run-evaluation.mjs --mode gate
```

On Windows PowerShell:

```powershell
$env:USE_DEPLOYED_SITE = "true"
node evaluation/bin/run-evaluation.mjs --mode gate
```

## Outputs

Each run writes a directory under:

```text
evaluation/runs/<run-id>/
```

The important files are:

| File                | Meaning                                                               |
| ------------------- | --------------------------------------------------------------------- |
| `summary.json`      | Canonical run result for tools and later automation.                  |
| `summary.md`        | Human-readable run summary.                                           |
| `ownership.json`    | Mapping from evaluated behavior to the lowest appropriate test layer. |
| `logs/*.stdout.log` | Per-layer standard output.                                            |
| `logs/*.stderr.log` | Per-layer standard error.                                             |
| `artifacts/*`       | Playwright JSON, screenshots, traces, videos, and related evidence.   |

Generated run directories are operational artifacts and are ignored by Git.
They should not be committed by default.

## How To Read Results

The run-level `status` is one of:

| Status   | Meaning                                                                      |
| -------- | ---------------------------------------------------------------------------- |
| `passed` | All required layers selected for the mode passed.                            |
| `failed` | At least one required selected layer failed.                                 |
| `error`  | The runner itself hit an internal error, such as invalid generated evidence. |

Layer failures are classified as:

| Classification | Meaning                                                                                             |
| -------------- | --------------------------------------------------------------------------------------------------- |
| `product`      | The evidence points to application behavior.                                                        |
| `test`         | The evidence points to evaluation test, fixture, helper, or command setup.                          |
| `environment`  | The command could not run because of missing tools, browser install, or similar environment issues. |
| `timeout`      | The layer exceeded its configured timeout.                                                          |
| `unknown`      | The evidence is not specific enough to assign ownership.                                            |

`recommendedNextAction` provides the first action to take:

| Code                  | Human action                                                                     |
| --------------------- | -------------------------------------------------------------------------------- |
| `none`                | No action required.                                                              |
| `fix_environment`     | Fix local tooling, browser install, server startup, or timeout conditions first. |
| `inspect_product`     | Inspect the product behavior covered by the failing layer.                       |
| `inspect_test`        | Inspect the evaluation test, helper, fixture, or command configuration.          |
| `investigate_unknown` | Read the recorded evidence before assigning ownership.                           |

## Current Verified State

The implementation has been verified with:

- `gate`: passed
- `collect-all`: passed, including `full-e2e`
- controlled failing fixture: failed as expected with `classification: "test"`
- deployed target metadata: `target: "deployed"` recorded when
  `USE_DEPLOYED_SITE=true`

## Operational Notes

- The `static` layer uses Prettier as a formatting gate, not as a semantic
  static analyzer. It checks committed evaluation harness files only. `AGENTS.md`
  and constitution files are not part of the default gate unless the config is
  intentionally expanded.
- `evaluation/runs/` contains generated evidence. It is ignored by Git and
  excluded from Prettier so local runs do not make formatting checks fail.
- On constrained sandboxes, Node's default test-runner isolation can fail with
  `spawn EPERM`. The canonical local/CI command remains `node --test ...`; for
  sandbox-only diagnosis, run the same files with `--test-isolation=none`.
- Local Playwright layers allow up to 120 seconds for the webpack dev server to
  become ready. This avoids treating slow first-time bundling as a product
  failure while still keeping layer timeouts bounded.
- The smoke reservation completion journey is the timeout-prone gate test
  because it covers page navigation, popup handling, confirmation, modal
  success. It intentionally stops at the success modal instead of waiting for
  the popup window to close, because window-close events are not the behavior
  the gate needs to own. The smoke Playwright config uses a 60 second per-test
  timeout to reduce false failures while keeping the layer timeout bounded.

## Boundaries

The harness is intentionally evaluation-local:

- Product source, root package scripts, root Playwright config, and existing
  E2E tests are not changed by the default gate.
- `evaluation/runs/` is ignored and should remain uncommitted.
- The root `dist/` directory may be generated by the existing webpack build
  during local Playwright runs. It is already ignored by the root repository.
- Automatic repair mode is not implemented yet. It is deferred until the gate,
  evidence model, and failure classification stay stable across normal use.
