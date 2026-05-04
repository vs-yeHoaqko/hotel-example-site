# Research: Slow and Flaky Evidence Report

## Decision: Use Existing Run Summaries As The Primary Source

The report will read `evaluation/runs/*/summary.json` and treat each readable
summary as the authoritative source for run metadata, layer status,
classification, duration, timeout state, skipped state, diagnostics, and
artifact paths.

**Rationale**: `summary.json` is already the machine-readable evidence contract
for evaluation runs. Reusing it avoids rerunning product tests and avoids
inventing a second source of truth.

**Alternatives considered**:

- Parse `summary.md`: rejected because it is human-readable and less stable.
- Re-run `gate` or `full` before reporting: rejected because the feature is an
  evidence reader and must not execute product tests.

## Decision: Read Playwright JSON Artifacts Opportunistically

The model will read Playwright JSON artifacts only when a layer references an
artifact path ending in `.json`. Missing or malformed artifacts will create
warnings but will not fail the whole report.

**Rationale**: Per-test durations, retry counts, and failure details live in
Playwright JSON, but failed runs may stop before every artifact exists. A
warning-preserving reader keeps the report useful with partial evidence.

**Alternatives considered**:

- Require all Playwright artifacts to exist: rejected because partial failed
  runs are valuable evidence.
- Glob every artifact file blindly: rejected because layer-owned artifact
  references are already recorded in `summary.json`.

## Decision: Store Thresholds In An Evaluation-Local Config File

Slow layer thresholds and report limits will live in
`evaluation/config/run-health.config.json`.

**Rationale**: Thresholds are review policy rather than code logic. Keeping
them explicit makes later tuning easy without editing the report model.

**Alternatives considered**:

- Hard-code thresholds in the model: rejected because it hides review policy.
- Reuse layer timeouts directly: rejected because timeout limits are failure
  boundaries, not slow-review thresholds.

## Decision: Separate Environment Evidence From Product/Test Evidence

Failures with `classification: "environment"`, timeout markers, or diagnostic
messages that indicate process spawn/tooling failures will be shown separately
from product/test behavior findings.

**Rationale**: Environment failures should lead to tooling fixes, not product
or test rewrites.

**Alternatives considered**:

- Put all failures into one instability list: rejected because it would make
  sandbox/tooling failures look like product flakiness.

## Decision: Keep The Report Advisory

The report will not modify timeout values, mark tests flaky, thin E2E
assertions, change CI, or invoke repair mode.

**Rationale**: The current goal is to make the next human decision reviewable.
Behavior-changing automation remains a later feature.

**Alternatives considered**:

- Automatically skip or mark slow tests: rejected because this could hide real
  coverage issues.
- Add repair mode now: rejected because the evidence surface should stabilize
  first.
