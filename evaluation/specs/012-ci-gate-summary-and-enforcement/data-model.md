# Data Model: CI Gate Summary and Enforcement

## CI Gate Summary

Review-facing Markdown summary for a single evaluation attempt.

**Fields**:

- `status`: `pass`, `warn`, `fail`, or `unknown`
- `mode`: evaluation mode such as `gate`, `full`, or `collect-all`
- `target`: evaluation target metadata such as `local` or `deployed`
- `runId`: latest evaluation run identifier when available
- `primaryFailure`: most actionable failure, threshold breach, or missing
  evidence item
- `recommendedAction`: first human action to take
- `reportPaths`: generated report paths for full evidence
- `warnings`: missing or partial evidence that did not prevent summary
  generation

**Validation rules**:

- Summary generation must succeed with partial evidence and use `unknown` where
  a field is not available.
- A fail status must cite at least one policy reason or evidence source.
- Report paths must be repository-relative.

## Enforcement Policy

Reviewable policy that determines whether a quality signal is fail-enforced or
warning-only.

**Fields**:

- `id`: stable policy identifier
- `source`: evidence source such as `summary`, `run-health`,
  `test-meaningfulness`, `diagnostics`, or `thinning`
- `metric` or `condition`: measured value or named condition
- `operator`: comparison or condition type
- `enforcement`: `warn` or `fail`
- `rationale`: reviewer-facing reason

**Validation rules**:

- Fail-enforced policies must include a rationale.
- Warning-only policies must remain non-blocking unless explicitly configured
  as `fail`.
- Missing metric values for fail-enforced policies fail the gate; missing
  warning-only metrics warn.

## Required Evidence

Minimum evidence needed to trust a gate decision.

**Fields**:

- `id`: stable evidence identifier
- `source`: run summary, generated model, report, or layer result
- `requiredInModes`: modes where the evidence must be present
- `failureStatus`: status produced when evidence is missing or malformed
- `message`: reviewer-facing explanation

**Validation rules**:

- The latest run summary must be readable for gate enforcement.
- The environment layer must pass in required gate runs.
- The smoke-e2e layer must pass when selected and required.
- Missing generated reports should be surfaced in the CI summary even when the
  primary evaluation failure happened earlier.

## Primary Failure

The first issue shown to reviewers in CI.

**Fields**:

- `id`: stable finding or layer identifier
- `kind`: `missing_evidence`, `layer_failure`, `threshold`, or `diagnostic`
- `status`: `fail` or `warn`
- `message`: concise reason
- `recommendedAction`: first human action
- `artifactPath`: optional evidence path

**Selection rules**:

1. Fail-enforced missing or malformed required evidence
2. Environment failure
3. Required smoke-e2e failure
4. Other fail-enforced findings
5. Warning findings
6. No issue
