# Feature Specification: Failure Diagnostics and Repair Guidance

**Feature Branch**: `004-failure-diagnostics-repair-guidance`
**Created**: 2026-05-04
**Status**: Draft
**Input**: Grow the evaluation harness so failed runs explain what failed, how
to reproduce it, and where to inspect before any automatic repair mode exists.
**Constitution**: `evaluation/.specify/memory/constitution.md` v1.2.0

## Overview

Add evaluation-local failure diagnostics and non-mutating repair guidance to
the existing harness. The feature should turn raw layer logs and Playwright JSON
artifacts into actionable `summary.json` and `summary.md` content.

The goal is not to fix code automatically. The goal is that a maintainer or
agent can open the generated summary after a failed run and quickly answer:

- which test or command failed
- what assertion or setup step failed
- which artifact should be opened first
- which command reproduces the failure
- which product or evaluation files are likely relevant
- whether the failure looks like product behavior, test code, environment,
  timeout, flakiness suspicion, or unknown ownership

All implementation and generated guidance remain under `evaluation/`. Product
source, root E2E tests, package scripts, and CI workflows are out of scope.

## User Scenarios & Testing

### User Story 1 - Inspect a Failed Test Without Reading Raw Logs First (Priority: P1)

As a maintainer, I want failed evaluation runs to list the failed test cases and
their key evidence so that I can start diagnosis from the summary instead of
digging through every artifact.

**Why this priority**: The current harness records logs and artifacts but only
summarizes failures at the layer level. Actionable failure diagnosis requires a
test-case-level view when the layer exposes one.

**Independent Test**: Run the harness with a controlled failing Playwright
fixture. Verify that `summary.json` includes diagnostic entries and `summary.md`
lists the failed test title, file, artifact links, concise error summary, and
reproduction command.

**Acceptance Scenarios**:

1. Given a Playwright integration test fails with JSON reporter output, when the
   run completes, then the summary includes a diagnostic entry naming the test
   title, source path, failure message, and Playwright JSON artifact.
2. Given a Playwright failure has screenshot, trace, video, or output
   attachments, when diagnostics are rendered, then the summary references those
   artifacts relative to the run directory.
3. Given a command fails without structured test-case output, when diagnostics
   are rendered, then the summary still includes layer-level stdout/stderr
   references and a layer reproduction command.

### User Story 2 - Receive Non-Mutating Repair Guidance (Priority: P1)

As a test owner, I want each failure diagnostic to suggest likely files or
behavior areas to inspect so that repair work starts with concrete evidence
instead of broad guessing.

**Why this priority**: Repair mode should not be introduced until the harness
can explain likely ownership and next inspection targets without mutating files.

**Independent Test**: Trigger representative failures for unit billing,
reservation-form integration, smoke E2E routing, and environment setup. Verify
that the generated guidance maps each failure to sensible likely files or a
clear environment action with confidence.

**Acceptance Scenarios**:

1. Given a billing unit assertion fails, when diagnostics are generated, then
   guidance points to `src/lib/billing.js` and the unit test file.
2. Given a reservation-form validation assertion fails, when diagnostics are
   generated, then guidance points to the reservation UI behavior area and
   likely files such as `src/reserve.js`, `src/lib/validation.js`, and
   locale message data when message text is involved.
3. Given a Playwright browser, dependency, or server startup problem occurs,
   when diagnostics are generated, then guidance prioritizes environment
   remediation rather than product or test inspection.
4. Given confidence is low, when diagnostics are generated, then the summary
   states that ownership is uncertain and directs the reviewer to the recorded
   evidence.

### User Story 3 - Preserve a Stable Machine-Readable Diagnostic Contract (Priority: P2)

As an automation maintainer, I want diagnostics to be represented in a stable
schema so that later CI reporting, trend analysis, and repair mode can consume
them safely.

**Why this priority**: Human-readable guidance is useful, but future automation
requires a canonical JSON shape with bounded enums and relative artifact paths.

**Independent Test**: Validate generated summaries against the updated schema
for passed runs, Playwright failures, command failures, skipped layers, and
runner errors.

**Acceptance Scenarios**:

1. Given a run passes, when `summary.json` is generated, then diagnostics are
   present as `diagnostics: []`.
2. Given a run fails, when `summary.json` is generated, then every diagnostic
   uses bounded enum fields for type (`test_case`, `layer_command`,
   `runner_error`), owner layer, confidence, and the existing layer
   classification values.
3. Given artifact paths appear in diagnostics, when schema validation runs,
   then those paths are relative to the run directory and never absolute.

### Deferred User Story 4 - Attempt Repair (Priority: P3)

As a maintainer, I eventually want an opt-in repair mode that uses diagnostics
to attempt bounded changes and rerun relevant gates.

**Deferred Scope**: This feature does not implement repair mode, change files
based on diagnostics, or weaken tests. It only creates the diagnostic and
guidance contract that future repair mode must consume.

## Scope

In scope:

- Parse Playwright JSON result artifacts produced by evaluation integration,
  smoke, and full E2E layers.
- Extract failed test identity, source location when available, error messages,
  expected/actual snippets when available, and attachment references.
- Produce layer-level diagnostics for command failures without structured
  test-case output.
- Add non-mutating repair guidance with likely files, rationale, and confidence.
- Add reproduction commands for failed layers and, where supported, failed
  Playwright tests.
- Update `summary.json`, `summary.md`, schemas, examples, and baseline docs so
  diagnostics are stable and reviewable.
- Keep generated per-run diagnostics under `evaluation/runs/`.

Out of scope:

- Automatically modifying product code, evaluation tests, root E2E tests,
  package scripts, or CI workflows.
- Adding repair mode or retry loops that mutate files.
- Replacing the existing failure classifier wholesale.
- Building a historical dashboard or CI upload workflow.
- Expanding product test coverage unrelated to diagnostic extraction.

## Functional Requirements

- **FR-001**: The feature MUST keep all new implementation files and committed
  artifacts under `evaluation/`.
- **FR-002**: The feature MUST NOT modify product source, root E2E tests, root
  package scripts, root Playwright config, or GitHub Actions workflows.
- **FR-003**: `summary.json` MUST include a machine-readable `diagnostics`
  array for every run.
- **FR-004**: Passed runs MUST produce `diagnostics: []`.
- **FR-005**: For failed Playwright layers with JSON reporter output,
  diagnostics MUST include each failed test title.
- **FR-006**: For failed Playwright tests, diagnostics SHOULD include source
  file and line when the JSON output exposes them.
- **FR-007**: For failed Playwright tests, diagnostics MUST include a concise
  failure summary derived from structured errors or captured output.
- **FR-008**: Diagnostics SHOULD include expected and actual values when the
  test framework exposes them in a bounded, concise form.
- **FR-009**: Diagnostics MUST include artifact references for relevant logs and
  structured result files.
- **FR-010**: Diagnostics SHOULD include Playwright attachments such as
  screenshots, traces, videos, and output files when they are present.
- **FR-011**: All diagnostic artifact paths MUST be relative to the run
  directory and MUST NOT be absolute paths.
- **FR-012**: Diagnostics MUST include a safe reproduction command. When a
  failed test identity can be extracted safely, diagnostics SHOULD provide a
  test-level reproduction command; otherwise they MUST fall back to the failed
  layer-level reproduction command.
- **FR-013**: Reproduction commands MUST be advisory display strings and MUST
  NOT require shell-specific quoting as the canonical execution contract.
- **FR-014**: Diagnostics MUST include `type` as one of `test_case`,
  `layer_command`, or `runner_error`; `classification` using the existing layer
  classification enum (`product`, `test`, `environment`, `timeout`, `unknown`);
  and a guidance object that identifies the recommended human action for that
  failure.
- **FR-015**: Guidance MUST include likely files or behavior areas to inspect
  when the harness can infer them from layer ownership, test path, title,
  message, or classification.
- **FR-016**: Guidance MUST include rationale for each likely file or behavior
  area.
- **FR-017**: Guidance MUST include `confidence` as one of `low`, `medium`, or
  `high`, and MUST use `low` when ownership is ambiguous.
- **FR-018**: Environment failures MUST prioritize tooling, dependency,
  Playwright browser, dev-server, or timeout remediation over product-code
  inspection.
- **FR-019**: Unit billing failures MUST point to `src/lib/billing.js` and the
  failing evaluation unit test.
- **FR-020**: Reservation-form validation failures SHOULD point to
  `src/reserve.js`, `src/lib/validation.js`, and relevant locale message data
  when message text is part of the failure.
- **FR-021**: Route, popup, storage, and representative journey failures SHOULD
  point to the relevant HTML/JS flow and smoke or full E2E evidence rather than
  to unit-only files.
- **FR-022**: Diagnostics MUST preserve the existing run-level
  `recommendedNextAction` behavior and MAY add more specific per-diagnostic
  guidance.
- **FR-023**: `summary.md` MUST render a Failure Diagnostics section when
  diagnostics are present.
- **FR-024**: Diagnostic entries in `summary.json` and `summary.md` MUST remain
  concise, MAY include bounded excerpts, and MUST point to raw artifacts instead
  of embedding full stdout, stderr, stack traces, logs, or large JSON payloads.
- **FR-025**: The committed `summary.schema.json` MUST validate the diagnostic
  shape.
- **FR-026**: `evaluation/examples/summary.example.json` MUST be updated to show
  representative diagnostic entries.
- **FR-027**: Controlled failing fixtures or baseline documentation MUST cover
  at least one deterministic diagnostic path.
- **FR-028**: Diagnostic extraction MUST tolerate missing or malformed
  Playwright JSON by falling back to layer-level diagnostics instead of causing
  an internal runner error.
- **FR-029**: Diagnostic extraction MUST apply the existing redaction rules to
  messages, commands, and guidance before writing summaries.
- **FR-030**: The feature MUST leave automatic repair mode deferred and
  documented as out of scope.

## Non-Functional Requirements

- **NFR-001**: Diagnostic generation SHOULD not require new package
  dependencies.
- **NFR-002**: Diagnostic generation SHOULD be deterministic for the same run
  artifacts.
- **NFR-003**: Diagnostic summaries SHOULD stay small enough for routine code
  review; raw logs remain linked artifacts.
- **NFR-004**: Diagnostic extraction MUST not make passed evaluation runs
  significantly slower.
- **NFR-005**: Generated run artifacts under `evaluation/runs/` MUST remain
  ignored and uncommitted.

## Success Criteria

- **SC-001**: A controlled failing Playwright evaluation run produces
  diagnostic entries in `summary.json` and `summary.md`.
- **SC-002**: A controlled command or fixture failure without structured
  Playwright JSON still produces layer-level diagnostics.
- **SC-003**: Diagnostics include reproduction commands and artifact references
  that are sufficient for a maintainer to rerun or inspect the failure.
- **SC-004**: Guidance for billing, reservation validation, smoke journey, and
  environment failures points to distinct likely inspection targets.
- **SC-005**: Existing `gate`, `full`, and `collect-all` behavior remains
  compatible with the updated summary schema.
- **SC-006**: No implementation or validation step modifies files outside
  `evaluation/`, except ignored tool transients already owned by the existing
  build/test process.

## Clarifications

### Session 2026-05-04

- Q: Should this feature automatically fix code after a failed run?
  A: No. It should emit actionable diagnostics and repair guidance only. Repair
  mode remains a later opt-in feature.
- Q: Should diagnostics replace raw logs and Playwright artifacts?
  A: No. Diagnostics summarize and link evidence; raw artifacts remain the
  audit trail.
- Q: Should this work be wired into GitHub Actions now?
  A: No. CI wiring is a later harness-growth step after diagnostics are stable.
- Q: Should likely files be treated as authoritative?
  A: No. They are advisory and must include confidence and rationale. Low
  confidence should be explicit.
- Q: What stable empty diagnostics shape should passed runs use?
  A: `summary.json` must always include a `diagnostics` array; passed runs use
  `diagnostics: []`.
- Q: What reproduction command granularity should diagnostics provide?
  A: Prefer test-level commands when the failed test identity can be extracted
  safely; otherwise fall back to layer-level commands.
- Q: How should guidance confidence be represented?
  A: Use a bounded `confidence` enum with `low`, `medium`, and `high`.
- Q: How much raw failure detail should diagnostic entries embed?
  A: Include only short summaries and bounded excerpts in diagnostic entries;
  link full logs, stacks, and JSON payloads as artifacts.
- Q: Which classification enum should diagnostics use?
  A: Reuse the existing layer classification enum: `product`, `test`,
  `environment`, `timeout`, and `unknown`.
- Q: Which diagnostic type enum should the schema expose?
  A: Use `test_case`, `layer_command`, and `runner_error`.

## Assumptions

- The current evaluation harness from features 001 through 003 is present.
- Playwright JSON reporter output remains available for integration, smoke,
  and full E2E layers.
- Node 22 and the existing dependency set are sufficient for JSON parsing,
  schema validation, and Markdown rendering.
- The first guidance rules can be deterministic and repository-specific rather
  than machine-learning based.

## Risks

- Playwright JSON shape changes could break diagnostic extraction. Mitigate by
  treating missing fields as unknown and falling back to layer-level evidence.
- Overconfident guidance could send maintainers to the wrong files. Mitigate by
  recording confidence and rationale, and by using low confidence for ambiguous
  failures.
- Summary files could become too verbose. Mitigate by storing concise
  diagnostics in summaries and keeping raw details in artifacts.
- Repair guidance could be mistaken for repair automation. Mitigate by keeping
  all guidance non-mutating and documenting repair mode as out of scope.
