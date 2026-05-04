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
| `static`      | Checks evaluation files with Prettier.                                                 |
| `unit`        | Runs focused Node tests for directly importable billing logic.                         |
| `integration` | Runs page-local Playwright checks for reservation form behavior.                       |
| `smoke-e2e`   | Runs thin localized browser journeys, including one reservation completion happy path. |

`full-e2e` is available in explicit modes and runs the existing root `e2e/`
suite after the gate layers.

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
the evaluation command fails. Use the uploaded `summary.md`, `summary.json`,
logs, screenshots, videos, and traces as the starting point for diagnosis.

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
- The smoke reservation completion journey is the timeout-prone gate test
  because it covers page navigation, popup handling, confirmation, modal
  success, and window close. The smoke Playwright config uses a 60 second
  per-test timeout to reduce false failures while keeping the layer timeout
  bounded.

## Boundaries

The harness is intentionally evaluation-local:

- Product source, root package scripts, root Playwright config, and existing
  E2E tests are not changed by the default gate.
- `evaluation/runs/` is ignored and should remain uncommitted.
- The root `dist/` directory may be generated by the existing webpack build
  during local Playwright runs. It is already ignored by the root repository.
- Automatic repair mode is not implemented yet. It is deferred until the gate,
  evidence model, and failure classification stay stable across normal use.
