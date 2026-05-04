# Data Model: E2E Assertion Thinning

## MigrationCandidate

Existing entity produced by `evaluation/lib/migration-candidate-model.mjs`.

Fields relevant to this feature:

- `candidateId`: stable unique ID.
- `path`: root E2E file path.
- `ordinal`: zero-based test ordinal within the root E2E file.
- `line`: current source line from inventory, nullable when inventory drift is
  detected.
- `assertionScope`: human-readable assertion slice.
- `behavior`: ownership behavior name.
- `currentLayer`: expected to be `e2e`.
- `proposedOwnerLayer`: `unit`, `integration`, or `e2e`.
- `status`: readiness status, one of `ready_to_thin`,
  `blocked_missing_lower_layer`, or `keep_e2e`.
- `lowerLayerEvidence`: committed evaluation paths that justify ownership.
- `remainingE2ECoverage`: browser-level coverage that must remain.
- `thinningDecision`: optional joined `ThinningDecision`.

Validation rules:

- `candidateId` must be unique.
- `ready_to_thin` candidates must have lower-layer evidence.
- `keep_e2e` candidates must not be converted into deletion work.
- Inventory drift must be surfaced as a warning rather than ignored.

## ThinningDecision

Canonical machine-readable decision for a reviewed candidate.

Fields:

- `candidateId`: references `MigrationCandidate.candidateId`.
- `outcome`: one of `thinned`, `retained`, `deferred`, or `keep_e2e`.
- `reason`: concise human-readable reason for the outcome.
- `rootE2EPath`: root E2E path when outside-`evaluation/` edits are involved.
- `assertionScope`: copied stable scope for reviewer readability.
- `ownerLayer`: final owner layer for the detailed behavior.
- `lowerLayerEvidence`: evidence paths retained after thinning.
- `remainingE2ECoverage`: expected remaining browser-flow coverage.
- `outsideFiles`: array of outside-`evaluation/` files touched or intentionally
  retained.
- `conflictRisk`: one of `none`, `low`, `medium`, or `high`.
- `notes`: optional bounded reviewer notes.

Validation rules:

- Every decision `candidateId` must exist in the migration candidate model.
- `outcome: thinned` is allowed only for candidates whose readiness status is
  `ready_to_thin`.
- `outcome: thinned` requires non-empty `lowerLayerEvidence`.
- `outcome: deferred` requires a reason and must leave the root E2E assertion
  in place.
- `outcome: keep_e2e` must reference a candidate whose readiness status is
  `keep_e2e`.
- `outsideFiles` may include only `e2e/en-US/reserve.spec.ts` or
  `e2e/ja/reserve.spec.ts` for this feature.
- `conflictRisk` must be `medium` for root E2E edits unless the implementation
  records a more specific reason.

## ThinningDecisionSet

Top-level committed data document.

Fields:

- `schemaVersion`: `1`.
- `scope`: `reservation-billing`.
- `sourceCandidates`: `evaluation/config/migration-candidates.config.json`.
- `decisions`: array of `ThinningDecision`.

Validation rules:

- Must include one decision for each of the 28 reviewed `ready_to_thin`
  candidates.
- Must include `keep_e2e` decisions for the four representative completion
  journeys.
- Must not include duplicate `candidateId` entries.
- Must be deterministic when sorted by candidate ID.

## ReportOutcome

Human-readable view rendered into
`evaluation/reports/migration-candidates.md`.

Fields rendered per candidate:

- readiness status
- thinning outcome
- decision reason
- outside files and conflict risk
- lower-layer evidence
- remaining E2E coverage

Validation rules:

- Report output must stay deterministic.
- Markdown must be derived from or consistent with `ThinningDecisionSet`.
- Inventory warnings must remain visible.
