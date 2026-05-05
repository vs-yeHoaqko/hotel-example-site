# Research: CI Gate Summary and Enforcement

## Decision: Generate a Dedicated CI Summary Report

Create a deterministic `evaluation/reports/ci-gate-summary.md` from the latest
evaluation run, quality gate model, and generated report paths. The CI workflow
will append this Markdown to the GitHub Actions step summary and upload it with
the existing evidence artifact.

**Rationale**: Reviewers need a first-screen summary in CI, while artifacts
remain the full diagnostic record. A dedicated report keeps rendering logic
testable locally and avoids embedding complex Markdown construction directly in
workflow YAML.

**Alternatives considered**:

- Append `quality-gate.md` directly to the CI summary. Rejected because it is
  too verbose and does not prioritize mode, target, primary failure, and next
  action.
- Build the summary entirely in workflow shell. Rejected because parsing and
  fallback behavior would be hard to unit test and easy to break on shell
  differences.

## Decision: Fail Only Evidence Integrity and Required Gate Coverage

Add fail-enforced policy for missing or malformed required evidence,
environment preflight failure, and required smoke-e2e failure. Keep timing,
slow-layer, flaky, and meaningfulness trend thresholds warning-only unless a
future reviewed policy explicitly promotes them.

**Rationale**: Missing evidence, failed environment preflight, and failed smoke
coverage make the gate result untrustworthy or violate the minimum browser
confidence requirement. Timing and trend signals still need more stable CI
history before default hard enforcement.

**Alternatives considered**:

- Promote all current warning thresholds to failures. Rejected because slow and
  meaningfulness signals are advisory and may generate false blocking failures
  while history is still shallow.
- Keep everything warning-only. Rejected because broken evidence integrity can
  mask real evaluation failure.

## Decision: Treat Required Evidence as an Explicit Policy

Represent required evidence in committed configuration or model constants with
reviewable names: latest run summary, run health model, test meaningfulness
model, thinning execution evidence, environment layer result, and smoke-e2e
layer result for gate/full/collect-all modes where those layers are selected.

**Rationale**: The spec requires fail-enforced missing evidence, but reviewers
need to see what "required" means. Explicit policy gives tests stable fixtures
and future maintainers a clear place to change enforcement.

**Alternatives considered**:

- Infer required evidence only from report existence. Rejected because a
  report can exist while key run or layer evidence is missing.
- Require every generated report in every mode. Rejected because early runner
  failures should still produce a useful partial CI summary rather than hiding
  the primary failure behind report-generation noise.

## Decision: Preserve Fork-Scoped Workflow Guard

Keep the existing `github.repository == 'vs-yeHoaqko/hotel-example-site'` job
guard and make the workflow change additive inside that guarded job.

**Rationale**: The repository is a fork and should not accidentally impose this
evaluation workflow on upstream or another repository. Additive workflow steps
minimize merge conflict risk.

**Alternatives considered**:

- Move CI behavior into root package scripts. Rejected because root scripts are
  base-owned and more likely to conflict with upstream.
- Remove the fork guard for portability. Rejected because the user explicitly
  wants fork-only impact.
