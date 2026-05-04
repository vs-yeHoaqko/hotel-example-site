# Contract: Thinning Decision Data

## File

`evaluation/config/thinning-decisions.config.json`

## Purpose

Provide the canonical machine-readable record of E2E thinning outcomes. The
human-readable migration report is generated from, or kept consistent with,
this data.

## Top-Level Shape

```json
{
  "schemaVersion": 1,
  "scope": "reservation-billing",
  "sourceCandidates": "evaluation/config/migration-candidates.config.json",
  "decisions": []
}
```

## Decision Entry Shape

```json
{
  "candidateId": "en-submit-mail-feedback",
  "outcome": "thinned",
  "reason": "Submit-time mail feedback is covered by integration evidence.",
  "rootE2EPath": "e2e/en-US/reserve.spec.ts",
  "assertionScope": "submit-time name and email feedback",
  "ownerLayer": "integration",
  "lowerLayerEvidence": [
    "evaluation/tests/integration/reservation-form.spec.mjs"
  ],
  "remainingE2ECoverage": "Keep representative reservation completion coverage.",
  "outsideFiles": ["e2e/en-US/reserve.spec.ts"],
  "conflictRisk": "medium",
  "notes": []
}
```

## Enums

### `outcome`

- `thinned`: Root E2E assertion detail was removed or reduced.
- `retained`: Candidate was reviewed and intentionally left unchanged.
- `deferred`: Candidate was reviewed but not safely thinned in this feature.
- `keep_e2e`: Candidate remains browser-flow E2E coverage by design.

### `ownerLayer`

- `unit`
- `integration`
- `e2e`

### `conflictRisk`

- `none`: No outside-`evaluation/` file touched.
- `low`: Outside file touched but unlikely to overlap upstream changes.
- `medium`: Root E2E assertion edit in an upstream-owned file.
- `high`: Edit requires special review before implementation; not expected for
  this feature.

## Required Consistency Rules

- Every `candidateId` must exist in
  `evaluation/config/migration-candidates.config.json`.
- `outcome: thinned` requires the source candidate status to be
  `ready_to_thin`.
- `outcome: thinned` requires at least one `lowerLayerEvidence` path.
- `outcome: deferred` requires a non-empty `reason`.
- `outcome: keep_e2e` requires the source candidate status to be `keep_e2e`.
- `outsideFiles` may contain only:
  - `e2e/en-US/reserve.spec.ts`
  - `e2e/ja/reserve.spec.ts`
- Per-run artifacts under `evaluation/runs/` must never be referenced as
  canonical lower-layer evidence.

## Expected Counts for This Feature

- 28 decisions for reviewed `ready_to_thin` candidates.
- 4 `keep_e2e` decisions for representative completion journeys.
- 0 decisions for unrelated root E2E suites.

If implementation review defers a candidate, the total decision count remains
the same; only the candidate outcome changes from `thinned` to `deferred`.
