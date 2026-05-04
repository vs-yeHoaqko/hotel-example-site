# Research: CI Health Trends and Test Meaningfulness

## Decision: Use workspace-local run history for trends

**Rationale**: The current harness already records structured run summaries under `evaluation/runs/`. Comparing selected readable runs keeps the feature deterministic, local, and independent from GitHub artifact APIs.

**Alternatives considered**:

- Download prior CI artifacts: more complete cross-CI history but adds authentication, network, pagination, and retention complexity.
- Store trend state in committed files: creates churn from operational evidence and conflicts with the existing rule that per-run artifacts stay uncommitted.

## Decision: Treat test meaningfulness as transparent heuristic evidence

**Rationale**: The repository has mixed test styles. A deterministic scan of test definitions and assertion-like checks is enough to answer "how much meaningful testing exists" if the report states its criteria and flags weak signals.

**Alternatives considered**:

- Full AST parser: more precise but unnecessary for current ESM/TypeScript Playwright and Node test files.
- Manual spreadsheet/report: readable once but not reproducible after test changes.

## Decision: Separate product evidence from harness evidence

**Rationale**: Root E2E and evaluation product checks prove application behavior. Harness unit tests prove runner/report contracts. Combining them into one count would overstate product coverage.

**Alternatives considered**:

- Single total count: simple but misleading.
- Coverage instrumentation: would require product build/test changes and does not fit the current harness boundary.

## Decision: Keep CI manual mode as-is and add report preservation

**Rationale**: The workflow already supports `workflow_dispatch` with `gate`, `full`, and `collect-all`. This feature should not duplicate that mechanism; it should improve the evidence produced by each mode.

**Alternatives considered**:

- Add separate workflows for full/collect-all: more surface area and unnecessary drift.
- Require full on every PR: too expensive for the current harness and contrary to the existing gate/full split.
