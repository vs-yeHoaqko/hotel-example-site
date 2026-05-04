# Data Model: Slow and Flaky Evidence Report

## Run Health Config

Fields:

- `schemaVersion`: config schema version.
- `runsDirectory`: relative directory containing evaluation run artifacts.
- `reportPath`: relative Markdown report output path.
- `maxRuns`: maximum readable runs to include.
- `topSlowTests`: maximum slow test observations to show.
- `layerThresholdsMs`: map from layer name to slow-review threshold.
- `testSlowThresholdMs`: minimum per-test duration for slow-test findings.

Validation rules:

- `schemaVersion` must be `1`.
- Directory and report paths must remain under `evaluation/`.
- Numeric limits and thresholds must be positive integers.

## Evaluation Run

Fields:

- `runId`
- `mode`
- `target`
- `status`
- `startedAt`
- `finishedAt`
- `repository.branch`
- `repository.commit`
- `repository.dirty`
- `repository.changedFiles`
- `recommendedNextAction`
- `layers`
- `diagnostics`
- `summaryPath`

Validation rules:

- Missing required fields create warnings when a run can still be summarized.
- Unreadable or malformed `summary.json` creates a run warning and excludes the
  run from selected readable runs.
- Runs are selected by descending `startedAt`, then descending `runId` for
  deterministic ties.

## Layer Health

Fields:

- `runId`
- `name`
- `required`
- `status`
- `classification`
- `durationMs`
- `thresholdMs`
- `timedOut`
- `skippedReason`
- `artifacts`

Validation rules:

- A layer is slow when `durationMs > thresholdMs`.
- Layers without a configured threshold still appear in summaries but are not
  marked as slow.
- Timed-out, failed, interrupted, or skipped layers are included in
  instability evidence.

## Test Health Finding

Fields:

- `runId`
- `layer`
- `title`
- `file`
- `line`
- `project`
- `durationMs`
- `status`
- `retry`
- `expectedStatus`
- `artifactPath`
- `classification`
- `messages`

Validation rules:

- Slow findings require `durationMs >= testSlowThresholdMs`.
- Instability findings include failed, timed-out, interrupted, unexpected, or
  retried Playwright results.
- Findings sort by severity group, descending duration, then layer, title,
  file, and run ID.

## Health Report

Fields:

- `metadata`
- `selectedRuns`
- `slowLayers`
- `slowTests`
- `instabilityEvidence`
- `environmentEvidence`
- `warnings`
- `recommendedReviewFocus`

Validation rules:

- The report must include input run IDs and artifact paths.
- Empty instability evidence must render an explicit no-flaky-evidence
  statement.
- Warnings must not prevent readable evidence from rendering.
