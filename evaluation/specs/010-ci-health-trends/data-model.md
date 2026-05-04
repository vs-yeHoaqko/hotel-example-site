# Data Model: CI Health Trends and Test Meaningfulness

## RunTrendSummary

- `selectedRunCount`: Number of readable runs used.
- `statusCounts`: Counts by selected run status.
- `layerTrends`: Array of `LayerTrend`.
- `limitedEvidence`: Boolean indicating fewer than two selected runs.

## LayerTrend

- `layer`: Evaluation layer name.
- `latestRunId`: Run id for the newest observation.
- `latestStatus`: Latest layer status.
- `latestDurationMs`: Latest duration when available.
- `previousRunId`: Previous comparable run id when available.
- `previousDurationMs`: Previous duration when available.
- `deltaMs`: Latest minus previous duration when both are available.
- `observationCount`: Number of selected runs containing this layer.
- `slowCount`: Number of selected observations marked slow.
- `failedCount`: Number of failed, timed-out, or interrupted observations.

## TestInventoryItem

- `file`: Repository-relative test file path.
- `title`: Test title.
- `layer`: `root-e2e`, `evaluation-smoke`, `evaluation-integration`, `product-unit`, or `harness-unit`.
- `source`: `root-suite` or `evaluation`.
- `category`: Product or harness value category.
- `assertionCount`: Assertion-like checks in the test body.
- `meaningful`: True when the test has at least one assertion-like check.

## TestMeaningfulnessSummary

- `totalTests`: Discovered test definitions.
- `meaningfulTests`: Tests with assertion-like checks.
- `weakSignalTests`: Tests without assertion-like checks.
- `assertionCount`: Total assertion-like checks.
- `byLayer`: Aggregated counts by layer.
- `byCategory`: Aggregated counts by value category.
- `bySource`: Aggregated counts by source ownership.
- `weakSignals`: Test inventory items needing human review.
