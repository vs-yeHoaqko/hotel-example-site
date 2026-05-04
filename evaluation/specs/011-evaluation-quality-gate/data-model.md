# Data Model: Evaluation Quality Gate and Harness Hardening

## QualityThreshold

- `id`: Stable threshold identifier.
- `metric`: Evidence metric being evaluated.
- `source`: Report or evidence source used for the metric.
- `operator`: Comparison type, such as maximum, minimum, delta, or equality.
- `warnAt`: Optional warning threshold.
- `failAt`: Optional failure threshold.
- `enforcement`: `warn` or `fail`.
- `rationale`: Human-readable reason the threshold exists.

## QualityGateResult

- `status`: `pass`, `warn`, or `fail`.
- `checkedAt`: Generation timestamp.
- `evidenceSources`: Report and summary paths used for evaluation.
- `findings`: Ordered list of threshold results.
- `recommendedActions`: Actions derived from failed or warning findings.

## RunHealthBaseline

- `schemaVersion`: Baseline schema version.
- `layers`: Layer-level baseline entries.
- `updatedFrom`: Optional run or review reference used to set the baseline.
- `notes`: Review notes explaining why the baseline is valid.

## LayerBaseline

- `name`: Evaluation layer name.
- `expectedStatus`: Expected healthy status.
- `durationMs`: Reference duration.
- `durationToleranceMs`: Allowed absolute duration increase.
- `slowAllowed`: Whether slow evidence is currently tolerated.
- `timeoutAllowed`: Whether timeout evidence is currently tolerated.

## BaselineComparison

- `layer`: Layer name.
- `status`: `improved`, `unchanged`, `regressed`, `missing`, or `new`.
- `observed`: Current selected evidence.
- `baseline`: Matching baseline evidence.
- `message`: Human-readable comparison summary.

## FailureClassification

- `classification`: `product_regression`, `flaky`, `environment`, `harness_bug`, or `unknown`.
- `confidence`: `high`, `medium`, or `low`.
- `evidence`: Cited evidence items.
- `recommendedAction`: Next action for a maintainer.
- `reason`: Explanation of why the classification was selected.

## ThinningExecutionDecision

- `candidateId`: Stable migration candidate identifier.
- `rootSuiteReference`: Root-suite file, scenario, and assertion scope.
- `decision`: `approved_to_thin`, `blocked`, `deferred`, or `keep_e2e`.
- `lowerLayerEvidence`: Unit or integration coverage supporting the decision.
- `remainingE2ECoverage`: Browser-level journey or smoke coverage that remains.
- `reviewNotes`: Human review rationale.
- `allowedRootSuiteEdit`: Whether a later task explicitly authorizes a root-suite source edit.

## State Transitions

- Quality gate finding: `unchecked` -> `pass` | `warn` | `fail`
- Baseline comparison: `not_compared` -> `improved` | `unchanged` | `regressed` | `missing` | `new`
- Thinning decision: `candidate` -> `approved_to_thin` | `blocked` | `deferred` | `keep_e2e`
- Approved thinning with no explicit root-suite edit remains a proposal, not an applied source change.
