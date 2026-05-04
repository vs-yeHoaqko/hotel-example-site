# Research: Environment Preflight And CI Run Health Artifacts

## Decision: Add Preflight As The First Required Layer

The evaluation config will add an `environment` layer before `static`, `unit`,
`integration`, `smoke-e2e`, and `full-e2e`.

**Rationale**: Existing runner behavior already stops after a required failed
layer in `gate` and `full`. A first required environment layer prevents
misleading product/test failures when the local runtime cannot execute the
harness.

**Alternatives considered**:

- Fold preflight into each layer: rejected because it would duplicate checks
  and obscure which failure happened first.
- Run preflight outside the harness: rejected because it would not produce
  normal run evidence or diagnostics.

## Decision: Write `environment-preflight.json`

The preflight command will write machine-readable evidence to
`artifacts/environment-preflight.json` in the current evaluation run directory.

**Rationale**: Run-health can then read preflight status just like Playwright
artifacts, while generated evidence remains under ignored `evaluation/runs/`.

**Alternatives considered**:

- Only write stdout: rejected because it is less stable for later reporting.
- Add new top-level summary schema fields: rejected because layer artifacts
  already support evidence references.

## Decision: Avoid Product App Startup In Preflight

Preflight will check subprocess spawn capability, local command file
availability, package presence, and browser executable availability without
starting webpack, the dev server, or browser sessions.

**Rationale**: Preflight must be quick and should identify basic environment
problems before expensive behavior layers run.

**Alternatives considered**:

- Launch a browser during preflight: rejected because Playwright layers already
  own browser execution and traces.
- Start the dev server during preflight: rejected because integration/smoke
  layers already manage server startup.

## Decision: Treat CI Health Report Generation As Always-Run Cleanup

The CI workflow will run health report generation with `if: always()` after the
evaluation command and before artifact upload.

**Rationale**: Failed evaluations need the report most. The workflow should
attempt to produce it whenever any evidence exists.

**Alternatives considered**:

- Generate only after success: rejected because failures would lack the triage
  report.
- Make report generation the gate status: rejected because the evaluation
  command should remain the source of pass/fail.

## Decision: Keep Changes Advisory

The feature will not change timeouts, retries, flaky markings, skips, E2E
assertions, or repair behavior.

**Rationale**: The current problem is misclassification and poor visibility,
not confirmed product flakiness.

**Alternatives considered**:

- Increase timeouts immediately: rejected because current evidence does not
  show a product timeout failure.
- Retry environment failures: rejected because retry policy needs separate
  design and can hide deterministic setup problems.
