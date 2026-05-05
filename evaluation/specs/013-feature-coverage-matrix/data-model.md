# Data Model: Feature Coverage Matrix

## Feature Coverage Matrix

Human-readable report describing product-facing feature coverage.

**Fields**:

- `status`: aggregate status across feature rows
- `latestRun`: run id, mode, target, status, and summary path
- `rows`: ordered feature coverage rows
- `unmappedEvidence`: evidence that was discovered but not matched to a row
- `warnings`: report-generation warnings and partial evidence notes

**Validation rules**:

- Aggregate status is `fail` if any row fails, `warn` if any row warns or is
  unknown, otherwise `pass`.
- Matrix generation must succeed with partial evidence and show missing data as
  `unknown`.
- Report paths are repository-relative.

## Feature Coverage Row

One function or journey in the matrix.

**Fields**:

- `id`: stable feature identifier
- `label`: reviewer-facing function or journey name
- `category`: product journey, navigation, page-local behavior, domain rule, or
  smoke journey
- `locale`: optional locale such as `en-US` or `ja`
- `ownerLayer`: best current owner layer when known
- `status`: `pass`, `fail`, `warn`, or `unknown`
- `evidence`: one or more evidence sources
- `notes`: reviewer-facing status and warning notes

**Validation rules**:

- Every row includes at least one evidence source or an explicit missing
  evidence note.
- Historical health warnings can add `warn` but cannot override a latest
  failing status.
- Rows are ordered by configured order, then label.

## Feature Mapping

Committed configuration that maps evidence to rows.

**Fields**:

- `id`: stable row identifier
- `label`: human-readable name
- `category`: product behavior category
- `ownerLayer`: expected owner layer
- `evidence`: file/layer matchers and optional locale

**Validation rules**:

- Each mapping id is unique.
- Each evidence matcher has a layer and file path.
- Mapping paths are repository-relative.

## Coverage Evidence

Evidence item proving or warning about a row.

**Fields**:

- `kind`: latest result, ownership, meaningfulness, run-health, or missing
- `layer`: test layer
- `file`: test file or artifact path
- `title`: optional test title
- `status`: result status
- `count`: test count when available
- `artifactPath`: raw evidence path when available

**Validation rules**:

- Latest result statuses drive row pass/fail.
- Ownership and meaningfulness evidence can prove mapping but does not override
  latest result status.
- Run-health evidence adds notes only.

## Unmapped Evidence

Discovered test or result evidence not matched to a feature row.

**Fields**:

- `layer`: source layer
- `file`: evidence file
- `status`: latest result or discovered-test status
- `note`: why it is unmapped

**Validation rules**:

- Harness-contract tests may be grouped as non-product unmapped evidence.
- Product-like unmapped evidence should be visible for mapping improvement.
