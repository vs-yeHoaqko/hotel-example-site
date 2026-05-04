# Implementation Plan: Failure Diagnostics and Repair Guidance

**Feature Branch**: `004-failure-diagnostics-repair-guidance`
**Date**: 2026-05-04
**Spec**:
`evaluation/specs/004-failure-diagnostics-repair-guidance/spec.md`
**Constitution**: `evaluation/.specify/memory/constitution.md` v1.2.0

## Summary

Extend the evaluation harness so every run produces a stable `diagnostics`
array in `summary.json`, renders concise failure diagnostics in `summary.md`,
and provides non-mutating repair guidance for failed layers and failed test
cases.

The implementation will reuse the existing Node 22 evaluation runner, schema
validator, redaction helpers, failure classifier, and run artifact layout. New
diagnostic extraction stays under `evaluation/` and consumes already recorded
layer results plus Playwright JSON artifacts. Repair mode, CI wiring, product
code changes, root E2E changes, and package script changes remain out of scope.

## Technical Context

**Language/Version**: Node.js 22, ECMAScript modules
**Primary Dependencies**: Existing Node standard library and existing
Playwright JSON artifacts; no new package dependency planned
**Storage**: Per-run files under `evaluation/runs/<run-id>/`; committed schema,
example, docs, and tests under `evaluation/`
**Testing**: `node --test` for unit coverage, Playwright evaluation layers for
integration/smoke evidence, existing evaluation gate
**Target Platform**: Local Windows developer environment and future CI shell
environments that can run the current evaluation harness
**Project Type**: Evaluation-local CLI harness for a static web application
**Performance Goals**: Passed runs should not be significantly slower; failed
runs may spend bounded time parsing local JSON/log artifacts only
**Constraints**: No product source, root E2E, root package script, root
Playwright config, or GitHub Actions workflow changes
**Scale/Scope**: Current evaluation layers (`static`, `unit`, `integration`,
`smoke-e2e`, `full-e2e`) and current summary schema

## Constitution Check

- **I. Evaluation Assets Are Isolated**: Pass. Planned implementation, tests,
  schema, examples, docs, and generated artifacts stay under `evaluation/`.
- **II. Close the Evaluation Loop First**: Pass. The existing closed loop is
  preserved; diagnostics enrich its output without changing layer ordering.
- **III. Evidence Is a Required Output**: Pass. This feature adds failed test
  identity, reproduction commands, concise diagnostic messages, and artifact
  references to the canonical summary.
- **IV. Tests Move Down the Pyramid When Their Responsibility Allows It**:
  Pass. This feature does not thin or move tests; it improves failure
  localization for future ownership decisions.
- **V. Repair Loops Must Preserve Trust**: Pass. Repair mode remains deferred;
  guidance is advisory and non-mutating.
- **VI. Harness Growth Is Reviewable**: Pass. This is the next documented
  growth step after migration-candidate evidence and human review.
- **VII. Failure Diagnostics Must Be Actionable Before Repair**: Pass. The
  feature directly implements structured diagnostics and non-mutating repair
  guidance before any repair automation.

No constitution violations are planned.

## Project Structure

### Documentation

```text
evaluation/specs/004-failure-diagnostics-repair-guidance/
  spec.md
  plan.md
  research.md
  data-model.md
  quickstart.md
  contracts/
    summary-diagnostics.schema.json
```

### Planned Source Changes

```text
evaluation/
  bin/
    run-evaluation.mjs
  lib/
    diagnostic-guidance.mjs
    diagnostics.mjs
    playwright-diagnostics.mjs
    summary-markdown.mjs
    summary-model.mjs
  schemas/
    summary.schema.json
  examples/
    summary.example.json
  baselines/
    README.md
  tests/
    unit/
      diagnostics.test.mjs
      diagnostic-guidance.test.mjs
      playwright-diagnostics.test.mjs
      summary-schema.test.mjs
    fixtures/
      failing-layer.mjs
```

The exact module split may be adjusted during implementation if a smaller
single module is clearer, but all implementation remains evaluation-local.

## Design Decisions

### Diagnostic Generation Boundary

Diagnostic generation will run during summary creation after all selected layer
results are available. It will consume:

- public layer result fields
- redacted stdout/stderr retained in memory during the run
- artifact paths recorded on each layer
- Playwright JSON files under the run artifact directory when present
- internal runner errors captured in the existing `errors` array

The summary contract always includes `diagnostics`. Passed runs produce
`diagnostics: []`.

### Diagnostic Types

Diagnostic `type` uses the clarified enum:

- `test_case`: a failed test case extracted from structured Playwright JSON
- `layer_command`: a failed layer or command without usable test-case evidence
- `runner_error`: an internal runner error or schema/modeling failure

`classification` reuses the existing failure classifier enum:
`product`, `test`, `environment`, `timeout`, `unknown`.

### Playwright JSON Parsing

Add tolerant Playwright result extraction that reads known JSON reporter shapes
without treating missing optional fields as internal runner errors.

Extraction should collect:

- title path or title
- source file and line when available
- error message and bounded stack/location excerpt
- expected and actual snippets when available
- attachment paths when present

If parsing fails or the JSON shape is missing the expected fields, diagnostics
fall back to `layer_command` entries that reference the layer logs and the JSON
artifact path.

### Reproduction Commands

Diagnostics include an advisory display string only. They do not become a
canonical execution contract.

- For `test_case` diagnostics, prefer a test-level Playwright command when
  both source path and title can be safely represented.
- For missing or unsafe test identity, fall back to the layer command display
  already recorded on the layer.
- For `runner_error`, point to the original evaluation command or the relevant
  layer command when available.

### Guidance Rules

Guidance is deterministic and repository-specific in the first implementation.
Rules should map obvious evidence to likely inspection targets:

- billing unit failures: `src/lib/billing.js` and the failing unit test
- reservation validation failures: `src/reserve.js`,
  `src/lib/validation.js`, locale message data, and the failing integration
  test
- route/popup/storage/journey failures: relevant HTML/JS flow plus smoke or
  full E2E evidence
- environment/timeouts: dependency, Playwright browser, dev-server, or timeout
  remediation before product inspection
- unknown ownership: low confidence and direct artifact-first guidance

Each likely target includes a rationale. Confidence uses `low`, `medium`, or
`high`.

### Summary Rendering

`summary.md` adds a `Failure Diagnostics` section only when diagnostics are
present. The section stays concise: one row or bullet per diagnostic, with
artifact references rather than embedded raw logs.

`summary.json` may include bounded excerpts but must not embed full stdout,
stderr, stack traces, logs, or large JSON payloads.

### Redaction

Existing redaction helpers apply before diagnostic messages, excerpts,
commands, and guidance are written. Artifact paths remain relative to the run
directory and must never be absolute.

## Data Contract

The diagnostic contract is captured in:

- `evaluation/specs/004-failure-diagnostics-repair-guidance/contracts/summary-diagnostics.schema.json`
- `evaluation/specs/004-failure-diagnostics-repair-guidance/data-model.md`

The implementation updates `evaluation/schemas/summary.schema.json` so
`summary.json` validation enforces the new `diagnostics` array.

## Validation Plan

1. Run unit tests for diagnostic extraction and guidance rules:
   `node --test evaluation/tests/unit/diagnostics.test.mjs evaluation/tests/unit/diagnostic-guidance.test.mjs`
2. Run a controlled failing fixture/config path and confirm it produces a
   `layer_command` diagnostic with logs and a layer reproduction command.
3. Run or fixture a Playwright JSON failure and confirm it produces a
   `test_case` diagnostic with relative artifact paths.
4. Confirm passed runs produce `diagnostics: []`.
5. Confirm malformed or missing Playwright JSON falls back to layer-level
   diagnostics and does not cause an internal runner error.
6. Validate `evaluation/examples/summary.example.json` against
   `evaluation/schemas/summary.schema.json`.
7. Run Prettier check for changed evaluation paths.
8. Run `node evaluation/bin/run-evaluation.mjs --mode gate`.
9. Confirm `evaluation/runs/` remains ignored and uncommitted.

## Risks and Mitigations

- **Playwright JSON drift**: Treat unknown shapes as fallback layer diagnostics
  instead of runner errors.
- **Overconfident guidance**: Use `low` confidence for ambiguous ownership and
  require rationale for every likely target.
- **Summary bloat**: Keep excerpts bounded and link raw artifacts.
- **Quoting-sensitive reproduction commands**: Store display strings only and
  fall back to layer-level commands when test-level command generation is
  unsafe.
- **Accidental repair behavior**: Keep all guidance non-mutating and leave
  repair mode out of scope.
