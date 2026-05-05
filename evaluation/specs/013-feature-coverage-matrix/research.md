# Research: Feature Coverage Matrix

## Decision: Use an Explicit Evaluation-Local Mapping File

Create `evaluation/config/feature-coverage.config.json` to define stable
feature rows, expected evidence files, layers, and journey labels. The first
mapping can mirror current root E2E file names and existing ownership records.

**Rationale**: File-name inference is useful, but a report that humans use for
review should have stable function names and grouping. A committed mapping lets
reviewers edit feature labels without touching root E2E files.

**Alternatives considered**:

- Purely infer rows from test file paths. Rejected because labels would drift
  with file names and unmapped evidence would be harder to explain.
- Add feature IDs to root E2E source. Rejected because root E2E files are
  upstream-owned and should not be changed for this harness report.

## Decision: Latest Run Determines Pass/Fail, History Adds Warnings

Use the latest selected run summary and Playwright JSON artifacts as the
primary status source. Use run-health slow/environment evidence as warning
notes only unless the latest function evidence itself failed.

**Rationale**: Maintainers asked whether functions pass now. Historical
warnings are useful context but should not turn a latest passing function into
a failure.

**Alternatives considered**:

- Fail rows when any selected historical run failed. Rejected because this
  would obscure current status and duplicate run-health policy.
- Ignore history entirely. Rejected because recent slow/flaky/environment
  evidence is valuable context for where to improve next.

## Decision: Report Unmapped Evidence Separately

Any discovered test evidence that does not match a configured feature row will
be listed in an unmapped evidence section with file, layer, and status.

**Rationale**: Silent omission makes the matrix look more complete than it is.
Unmapped evidence gives maintainers a clear backlog for improving mappings.

**Alternatives considered**:

- Drop unmapped harness-only tests. Rejected because the report should make its
  own blind spots visible.
- Treat every unmapped test as a feature row. Rejected because harness-contract
  tests would clutter the product-facing matrix.

## Decision: Commit the Matrix Report as Stable Guidance

Write `evaluation/reports/feature-coverage-matrix.md` as a committed review
report, matching the existing evaluation report pattern. Per-run raw evidence
continues to live under ignored `evaluation/runs/`.

**Rationale**: The matrix is a stable human entry point. Raw evidence is still
operational and should not be committed by default.

**Alternatives considered**:

- Store the matrix only in CI artifacts. Rejected because local review and
  documentation would have no stable entry point.
- Commit raw run evidence. Rejected by project policy.
