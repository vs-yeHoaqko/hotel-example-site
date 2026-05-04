# Research: Failure Diagnostics and Repair Guidance

## Decision: Use Existing Node Runtime and No New Dependencies

**Rationale**: The harness already runs on Node 22 and has internal helpers for
schema validation, command formatting, redaction, and summary generation. The
first diagnostic implementation can parse JSON artifacts with standard library
APIs and deterministic rules.

**Alternatives considered**:

- Add a JSON schema or Playwright parsing dependency. Rejected because the
  current schema validator and JSON output shape are sufficient for the first
  implementation.
- Shell-based parsing. Rejected because the harness already centralizes
  portable behavior in Node modules.

## Decision: Always Emit `diagnostics`

**Rationale**: A stable `diagnostics` array makes passed and failed runs
schema-compatible. Passed runs use `diagnostics: []`, which simplifies future
CI reporting and repair-mode consumers.

**Alternatives considered**:

- Omit diagnostics on passed runs. Rejected because consumers would need
  optional field handling.
- Use an object with count and items. Rejected because the existing summary
  shape already has aggregate counts elsewhere.

## Decision: Prefer Test-Level Reproduction When Safe

**Rationale**: Test-level commands are more useful for Playwright failures when
the JSON artifact exposes source path and title. Layer-level commands are safer
when identity is missing, malformed, or quoting-sensitive.

**Alternatives considered**:

- Always layer-level. Rejected because it loses useful focus for structured
  test failures.
- Always test-level for Playwright. Rejected because some JSON failures and
  command failures do not expose safe test identity.

## Decision: Reuse Existing Classification Enum

**Rationale**: The current classifier already feeds `recommendedNextAction`.
Reusing `product`, `test`, `environment`, `timeout`, and `unknown` prevents a
second competing classification system.

**Alternatives considered**:

- Add detailed diagnostic subtypes. Rejected for this feature because type,
  owner layer, likely targets, and rationale already provide enough detail.

## Decision: Use Bounded Guidance Confidence

**Rationale**: Guidance comes from deterministic heuristics, not statistical
probabilities. `low`, `medium`, and `high` avoid false precision while staying
easy to validate.

**Alternatives considered**:

- Numeric confidence. Rejected because it would imply precision the harness
  does not have.
- Both numeric and enum. Rejected as unnecessary schema complexity.

## Decision: Keep Raw Evidence in Artifacts

**Rationale**: Summaries need to stay reviewable. Diagnostic entries should
include concise summaries and bounded excerpts, while full stdout, stderr,
stacks, and Playwright JSON remain linked artifacts.

**Alternatives considered**:

- Embed full raw output in `summary.json`. Rejected because it would bloat
  committed examples, complicate review, and duplicate artifacts.
