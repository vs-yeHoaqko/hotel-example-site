# Feature Specification: Evaluation Harness

**Planned Feature Branch**: `001-evaluation-harness`
**Created**: 2026-05-01
**Status**: Draft
**Input**: Create a Spec Kit style spec and implementation plan for evaluation.
**Planning Note**: These documents are authored before switching the Git
worktree from `main`; branch creation is deferred until implementation starts.

## Overview

Create an isolated evaluation harness for `hotel-example-site` that can run a
repeatable quality gate against the existing hotel sample site, collect
machine-readable evidence, classify failures, and preserve enough evidence for
a later bounded repair loop without changing the product implementation by
default.

The harness is an evaluation asset, not a product feature. All new files,
generated reports, logs, traces, summaries, and repair artifacts must remain
under `evaluation/` unless a later approved implementation task explicitly
documents why it must touch files outside that boundary.

## User Scenarios & Testing

### User Story 1 - Run a Complete Evaluation Gate (Priority: P1)

As a maintainer, I want one command to run the configured evaluation layers in a
defined order so that I can determine whether the current working tree is safe
to treat as a valid baseline.

**Why this priority**: The constitution requires closing the evaluation loop
first. Without a repeatable gate, later test migration and repair work has no
trustworthy feedback surface.

**Independent Test**: From the repository root, execute the evaluation runner
with dependencies installed. Verify that it runs the configured layers in order,
returns a non-zero exit code when a required layer fails, and writes a canonical
summary under `evaluation/runs/<run-id>/summary.json`.

**Acceptance Scenarios**:

1. Given dependencies are installed, when the maintainer runs the default gate,
   then the harness records start time, finish time, command results, exit
   codes, and artifact paths for every attempted layer.
2. Given an earlier required layer fails, when the default gate is running, then
   later layers are skipped unless the run mode requests full evidence
   collection.
3. Given the existing Playwright suite can run locally, when the E2E layer is
   reached, then the harness invokes it without modifying root package scripts.

### User Story 2 - Inspect Evidence After a Failure (Priority: P1)

As a test owner, I want every run to preserve structured and human-readable
evidence so that I can diagnose failures without rerunning the same scenario.

**Why this priority**: Evaluation results must be auditable and comparable
between runs.

**Independent Test**: Force or select a failing command in one layer. Verify
that the run directory contains a machine-readable summary, per-layer logs,
captured stdout/stderr, and any available Playwright artifacts.

**Acceptance Scenarios**:

1. Given a layer command fails, when the run finishes, then the summary includes
   pass, fail, skipped, and timeout counts for the layer.
2. Given Playwright produces traces, screenshots, videos, or JSON output, when
   the harness records the E2E result, then the artifact paths in the summary
   point to files under the same run directory.
3. Given a command times out, when the harness classifies the result, then the
   summary records `timeout` distinctly from assertion or product failures.

### User Story 3 - Classify Test Responsibilities (Priority: P2)

As a quality engineer, I want the harness to identify whether behavior belongs
at unit, integration, or E2E level so that broad E2E coverage can be reduced
only after lower-layer coverage exists.

**Why this priority**: The existing repository contains many cross-browser E2E
checks and one browser-based billing test. The harness should make migration
decisions explicit instead of silently duplicating checks.

**Independent Test**: Run the harness in classification/report mode. Verify
that the report maps each evaluated scenario or assertion group to an owning
test layer and explains any recommended migration.

**Acceptance Scenarios**:

1. Given pure calculation behavior such as total billing, when the harness
   records ownership, then it marks the behavior as unit-owned.
2. Given page-local DOM behavior such as reservation form validation, when the
   harness records ownership, then it marks the behavior as integration-owned
   unless cross-page browser state is required.
3. Given login, cookies, redirects, popups, storage, or localized route flows,
   when the harness records ownership, then it marks the behavior as E2E-owned.

### Deferred User Story 4 - Attempt Bounded Repair Safely (Priority: P3)

As a maintainer, I want an optional repair mode to preserve failing evidence,
attempt a bounded change, rerun the relevant gates, and record the diff so that
automation can help without hiding what changed.

**Why this priority**: Repair is useful only after the gate and evidence model
are reliable.

**Deferred Scope**: This story defines the future repair-mode contract. It is
not part of the first implementation checklist.

**Future Independent Test**: Run repair mode against a controlled failing test.
Verify that the original failure evidence is preserved, changed files are
recorded in a diff artifact, retries are bounded, and the run stops when the
same failure persists.

**Acceptance Scenarios**:

1. Given repair mode is enabled, when a failure is classified, then the harness
   records whether the likely cause is product code, test code, environment,
   flakiness, or unknown before any attempted change.
2. Given a repair attempt changes files, when the attempt finishes, then the
   harness writes the changed-file list and diff artifact under `evaluation/`.
3. Given the same failure persists after the retry limit, when repair mode
   finishes, then the harness reports the unresolved state instead of continuing
   to mutate files.

## Requirements

### Functional Requirements

- **FR-001**: The harness MUST keep all new evaluation assets and generated
  artifacts under `evaluation/`.
- **FR-002**: The default implementation MUST NOT modify application source
  files, static HTML pages, existing E2E tests, root build configuration, or
  root package scripts.
- **FR-003**: The harness MUST provide a single default gate command runnable
  from the repository root with existing Node and pnpm tooling.
- **FR-004**: The local default gate MUST evaluate layers in this order when
  each layer is configured: static/format checks, unit tests, integration tests,
  and E2E smoke tests.
- **FR-005**: A failure in an earlier required layer MUST stop later required
  layers unless an explicit full-evidence mode is selected.
- **FR-006**: Every run MUST create a unique run directory under
  `evaluation/runs/`.
- **FR-007**: Every run MUST write `summary.json` as the canonical
  machine-readable outcome.
- **FR-008**: `summary.json` MUST include the commit or working tree identifier,
  dirty-worktree state, start and finish timestamps, selected mode, layer
  results, counts, failure categories when available, and artifact paths.
- **FR-008c**: Artifact paths recorded in `summary.json` MUST be relative to the
  run directory and MUST NOT be absolute paths.
- **FR-008b**: `summary.json` MUST include aggregate run counts as well as
  per-layer counts.
- **FR-008p**: Layers that do not expose test-case counts MUST still emit
  `counts`; a successful command MUST count as `passed: 1`, and a failed
  command MUST count as `failed: 1`.
- **FR-008a**: The runner MUST allow dirty worktree execution and MUST record
  dirty state plus changed file paths in `summary.json`.
- **FR-008j**: Changed file paths recorded in `summary.json` MUST be repository
  root relative paths with `/` separators, not absolute paths or raw OS-specific
  status output.
- **FR-008k**: `summary.json.repository.changedFiles` MUST always be present;
  clean worktrees MUST use an empty array.
- **FR-008l**: `summary.json.repository.changedFiles` MUST include both tracked
  and untracked changed files because either can affect evaluation
  reproducibility.
- **FR-008m**: Each `summary.json.repository.changedFiles` entry MUST be an
  object with `path` and `status`, where `path` follows the repository-relative
  path rule and `status` records the Git change category.
- **FR-008n**: The first implementation MUST normalize
  `summary.json.repository.changedFiles[].status` to one of `modified`,
  `added`, `deleted`, `renamed`, `untracked`, or `unknown`.
- **FR-008o**: Git change statuses that cannot be deterministically mapped to
  the known changed-file status enum MUST be recorded as `unknown`, not rounded
  to `modified`.
- **FR-008d**: `summary.json` MUST include `recommendedNextAction` for every
  run outcome; passed runs MUST use `none`.
- **FR-008e**: `recommendedNextAction` MUST include a machine-readable `code`
  from a fixed enum and a human-readable `message`; the first enum values MUST
  include `none`, `inspect_product`, `inspect_test`, `fix_environment`, and
  `investigate_unknown`.
- **FR-008q**: The first implementation MUST use these built-in
  `recommendedNextAction.message` values: `none` -> `No action required.`,
  `fix_environment` -> `Fix the evaluation environment or timeout condition
before inspecting product or test failures.`, `inspect_product` -> `Inspect
the product behavior covered by the failing layer.`, `inspect_test` ->
  `Inspect the evaluation test, helper, fixture, or command configuration.`,
  and `investigate_unknown` -> `Investigate the recorded failure evidence
before assigning ownership.`
- **FR-008f**: `recommendedNextAction.code` MUST be computed from all recorded
  failures in the run using a documented priority order, regardless of selected
  runner mode.
- **FR-008g**: When multiple failure classifications are recorded, the
  `recommendedNextAction.code` priority order MUST be `fix_environment`,
  `inspect_product`, `inspect_test`, then `investigate_unknown`.
- **FR-008h**: Timeout classifications MUST map to
  `recommendedNextAction.code: "fix_environment"` in the first implementation.
- **FR-008i**: `recommendedNextAction.message` MUST be generated by the runner
  from built-in standard messages for each action code in the first
  implementation.
- **FR-009**: Per-layer command stdout, stderr, exit code, duration, timeout
  state, and skipped reason MUST be preserved.
- **FR-009a**: Each layer result in `summary.json` MUST record the executed
  command as both an argv array for reproduction and a display string for human
  review.
- **FR-009c**: Each layer command record MUST include both `configuredArgv`
  from evaluation config and `executedArgv` after runner-managed output
  arguments or environment-safe adjustments are applied.
- **FR-009d**: Each layer command record MUST include only runner-managed
  environment variables explicitly injected for that command; the runner MUST
  NOT record the full process environment.
- **FR-009e**: `summary.json.layers[].command.env` MUST record key/value pairs
  for runner-managed injected environment variables, with sensitive values
  replaced by `[REDACTED]`.
- **FR-009f**: `summary.json.layers[].command.env` keys MUST be emitted in
  ascending key order to keep evidence diffs stable.
- **FR-009g**: Runner-managed injected environment variables MUST NOT be omitted
  from `summary.json.layers[].command.env`; sensitive values MUST be redacted
  rather than dropping the key.
- **FR-009b**: `summary.json.layers[].command.display` MUST be generated by the
  runner from `executedArgv` using deterministic display quoting; it MUST
  NOT be a separate configurable command value.
- **FR-009j**: Command display quoting MUST be OS-independent and intended for
  human review, not as a shell-specific string that promises direct reexecution.
- **FR-009k**: Deterministic display quoting MUST join redacted `executedArgv`
  entries with a single space; leave arguments containing only alphanumerics,
  `.`, `_`, `/`, `-`, `:`, and `=` unquoted; render empty strings as `""`;
  wrap all other arguments in double quotes; and escape `\`, `"`, newline,
  carriage return, and tab inside quoted arguments.
- **FR-009h**: `summary.json.layers[].command.display` MUST be treated as
  runner-managed text output and have the same sensitive-value redaction applied
  before it is written.
- **FR-009i**: `summary.json.layers[].command.configuredArgv` and
  `summary.json.layers[].command.executedArgv` MUST have sensitive values
  redacted before they are written.
- **FR-010**: Playwright artifacts produced by evaluation-controlled runs MUST
  be written under the current run directory.
- **FR-010a**: The first implementation MUST NOT generate Playwright HTML
  reports; it MUST prefer machine-readable Playwright output and standard
  artifacts such as traces, screenshots, and output files.
- **FR-011**: The first implementation MUST classify failures into at least:
  `product`, `test`, `environment`, `timeout`, and `unknown` using deterministic
  rules.
- **FR-011a**: When deterministic rules cannot distinguish product failure from
  test failure, the runner MUST classify the failure as `unknown`.
- **FR-011b**: For evaluation-local Playwright failures, assertion or
  expectation failures against product behavior MUST classify as `product`,
  while spec code errors, helper errors, and fixture setup failures MUST
  classify as `test`.
- **FR-011c**: Static or format command failures MUST classify as `test` in the
  first implementation because they indicate repository hygiene or evaluation
  tooling contract failure rather than product runtime behavior.
- **FR-011d**: Evaluation-local unit test assertion failures against
  `calcTotalBill` MUST classify as `product`; unit test syntax errors, import
  errors, helper errors, or test harness errors MUST classify as `test`;
  command startup failures and missing dependencies MUST classify as
  `environment`; otherwise classify as `unknown`.
- **FR-012**: The harness MUST support at least a minimal unit layer, a minimal
  integration layer, and a representative E2E layer before adding richer
  coverage.
- **FR-012a**: The first unit layer MUST cover `calcTotalBill` only and MUST NOT
  require product module changes to make additional utilities importable.
- **FR-012b**: The first integration layer MUST focus on reservation form
  page-local behavior: contact field visibility, required/range validation, and
  total bill recalculation.
- **FR-013**: The harness MUST record test layer ownership for evaluated
  behaviors and recommendations for moving coverage down the pyramid.
- **FR-014**: Repair mode MUST be deferred until the evaluation gate, evidence
  model, and failure classification have produced stable results across normal
  runs.
- **FR-015**: Repair mode MUST preserve the original failing run evidence before
  applying any change.
- **FR-016**: Repair mode MUST record every changed file and a diff artifact
  under `evaluation/`.
- **FR-017**: Repair mode MUST rerun the relevant failing test first, then the
  owning layer, then the full gate when the earlier reruns pass.
- **FR-018**: Repair mode MUST stop after a configured retry limit and report an
  unresolved state if the same failure persists.
- **FR-019**: The harness MUST respect the repository's existing
  `USE_DEPLOYED_SITE` behavior and record the resolved target as `local` or
  `deployed` in `summary.json`.
- **FR-020**: The harness MUST produce a concise human-readable `summary.md` for
  every run in addition to `summary.json`, but the JSON summary remains
  authoritative.
- **FR-020a**: `summary.md` MUST include run metadata, a layer result table,
  artifact links, an ownership summary, and a recommended next action.
- **FR-020b**: `summary.md` MUST include a recommended next action for passed,
  failed, and errored runs; passed runs MUST explicitly state that no action is
  required.
- **FR-021**: The full E2E layer MUST be required in CI or when explicitly
  requested, but it MUST NOT be required for the local default gate.
- **FR-022**: Generated run directories under `evaluation/runs/` MUST be ignored
  by default and not treated as committed project state.
- **FR-023**: The repository SHOULD commit stable summary schemas, example
  summaries, or explicitly selected baselines outside `evaluation/runs/` when
  reviewability or historical comparison requires versioned evidence.
- **FR-023a**: The first implementation MUST create baseline documentation such
  as `evaluation/baselines/README.md` but MUST NOT commit generated baseline
  result JSON by default.
- **FR-023b**: `evaluation/baselines/README.md` MUST document the controlled
  failing fixture command and expected outcome without committing generated
  result JSON.
- **FR-024**: The first smoke/E2E coverage MUST include thin representative
  checks for both `en-US` and `ja` routes.
- **FR-024a**: The first smoke E2E coverage MUST include at least one successful
  reservation completion happy path.
- **FR-025**: The first runner implementation MUST support three modes:
  `gate`, `full`, and `collect-all`.
- **FR-026**: `gate` mode MUST run the local default layers and stop after the
  first required layer failure.
- **FR-027**: `full` mode MUST include the full E2E layer and stop after the
  first required layer failure.
- **FR-027a**: `full` mode MUST run every `gate` layer first, then run the full
  E2E layer if the earlier required layers pass.
- **FR-028**: `collect-all` mode MUST attempt every configured layer, including
  full E2E, unless a failed dependency declared in
  `evaluation/config/evaluation.config.json` makes the layer ineligible.
- **FR-028a**: Layers skipped in `collect-all` mode because of failed declared
  dependencies MUST be recorded as `skipped` with the dependency reason in
  `summary.json`.
- **FR-028b**: In `collect-all` mode, a failed layer MUST NOT stop later layers
  that do not depend on the failed layer, regardless of failure classification.
- **FR-029**: The repository MUST commit a JSON Schema for `summary.json`.
- **FR-030**: The runner MUST validate each generated `summary.json` against the
  committed schema before reporting the run as complete.
- **FR-030a**: The first no-dependency schema validator MUST enforce required
  properties, primitive types, enum values, array item shapes, and object
  property shapes.
- **FR-030b**: The first schema validator MUST reject additional properties by
  default, except for schema objects explicitly marked as extension points.
- **FR-031**: The first implementation MUST define the CI evaluation command but
  MUST NOT add or modify `.github/workflows/`.
- **FR-032**: The first implementation MUST NOT add new package dependencies for
  summary schema validation.
- **FR-033**: If schema validation grows beyond a small internal validator, a
  later task SHOULD move evaluation-only dependencies into an isolated
  `evaluation/` package instead of changing the root package by default.
- **FR-034**: The first implementation MUST store layer enablement, commands,
  and timeout values in `evaluation/config/evaluation.config.json`.
- **FR-034f**: The initial layer timeout values MUST be static 60 seconds, unit
  60 seconds, integration 120 seconds, smoke E2E 180 seconds, full E2E 600
  seconds, and controlled failing fixture 60 seconds.
- **FR-034b**: `evaluation.config.json` MUST define `layers` as an ordered array;
  the array order is the default execution order.
- **FR-034c**: Each layer command in `evaluation.config.json` MUST be represented
  as an argv array, not as a shell command string.
- **FR-034a**: Each configured layer MAY declare layer dependencies with
  `dependsOn` and environment/tool requirements with `requires`; skipped reasons
  MUST distinguish failed layer dependencies from missing requirements.
- **FR-034d**: The first implementation MUST recognize these `requires` values:
  `node`, `pnpm`, `playwright`, and `dev-server`.
- **FR-034e**: The first implementation MUST leave `dev-server` startup and
  readiness handling to Playwright `webServer`; the runner records the
  requirement but does not start or probe the server directly.
- **FR-035**: The first implementation CLI MUST allow selecting the runner mode
  but MUST NOT allow ad hoc layer or timeout overrides.
- **FR-035b**: The first implementation CLI MAY allow `--config <path>` to
  select an evaluation config file, while still forbidding ad hoc layer or
  timeout overrides.
- **FR-035c**: `--config <path>` MUST be restricted to files under
  `evaluation/config/`.
- **FR-035a**: Runner mode selection MUST use `--mode gate|full|collect-all`;
  positional mode arguments are not required in the first implementation.
- **FR-036**: The first implementation MUST NOT automatically delete generated
  `evaluation/runs/` directories; run retention and cleanup are manual.
- **FR-037**: The first implementation MUST redact known sensitive keys from
  runner-managed text outputs and summary fields before writing them to disk.
- **FR-038**: The initial redaction key set MUST include at least `password`,
  `cookie`, `authorization`, and `token`, matched case-insensitively.
- **FR-038a**: Redacted values MUST be replaced with `[REDACTED]` without
  reversible data or hashes in the first implementation.
- **FR-038b**: The first implementation redaction detector MUST support known
  sensitive key names plus explicit `KEY=value` and `KEY: value` text patterns;
  it MUST NOT attempt URL query parsing, JSON string parsing, or generic
  `--key value` option parsing.
- **FR-039**: A layer timeout MUST be treated as a layer failure with
  `classification: "timeout"` and MUST make the run fail unless the timed-out
  layer is non-required.
- **FR-040**: The runner MUST exit `0` only when the selected mode succeeds and
  MUST exit `1` for any failed run; detailed failure categories MUST be recorded
  in `summary.json` rather than encoded as distinct process exit codes.
- **FR-041**: If the runner encounters an internal error, it MUST write
  `summary.json` with `status: "error"` when possible; if summary writing is not
  possible, it MUST report the error to stderr and exit `1`.
- **FR-041b**: Run status values MUST be `passed`, `failed`, or `error`; layer
  status values MUST be `passed`, `failed`, or `skipped`. Timeout MUST be
  represented through classification and counts, not as a layer status.
- **FR-041a**: Schema validation failure for generated evaluation outputs MUST
  be treated as a runner internal error with `status: "error"` and exit `1`.
- **FR-042**: The repository MUST commit a JSON Schema for `ownership.json`.
- **FR-043**: The runner MUST validate each generated `ownership.json` against
  the committed ownership schema before reporting the run as complete.
- **FR-044**: Run IDs MUST use UTC timestamp, sanitized branch name, and short
  commit SHA in the form `YYYYMMDDTHHMMSSZ-branch-abcdef0`.
- **FR-045**: `evaluation/examples/summary.example.json` MUST be a hand-managed
  representative example that includes passing, failing, skipped, and error
  result shapes.
- **FR-046**: The first implementation MUST include a controlled failing layer
  fixture that is disabled in normal gate configuration.
- **FR-047**: The controlled failing fixture MUST be runnable through a separate
  config file such as `evaluation/config/failing-fixture.config.json`, not by
  editing the normal config.
- **FR-048**: First implementation acceptance validation MUST include successful
  `gate`, `full`, and `collect-all` runner executions plus a controlled failing
  fixture execution that exits non-zero with recorded evidence.

### Non-Functional Requirements

- **NFR-001**: The default local gate should complete quickly enough for
  iterative development by running thin unit, integration, and smoke coverage
  before full E2E.
- **NFR-002**: Generated evidence paths must be stable and relative to the run
  directory so results can be archived or compared later.
- **NFR-003**: Commands must be deterministic except for explicitly recorded
  environmental inputs such as current commit, working tree state, current date,
  selected locale, and target site.
- **NFR-004**: The harness must be CI-compatible and must not require interactive
  browser UI for default execution.

## Key Entities

- **EvaluationRun**: A single execution of the harness with run id, mode,
  repository identifier, timestamps, status, and layer results.
- **LayerResult**: Outcome for one layer, including command, status, exit code,
  duration, counts, classification, skipped reason, and artifacts.
- **Artifact**: A file produced or preserved by a run, such as stdout, stderr,
  JSON reporter output, Playwright traces, screenshots, HTML reports, diffs, or
  human-readable summaries.
- **FailureClassification**: The best available category for a failure:
  `product`, `test`, `environment`, `timeout`, or `unknown` in the first
  implementation.
- **LayerOwnershipRecord**: Mapping from behavior or scenario to the lowest
  appropriate owning test layer and migration recommendation.
- **RepairAttempt**: An opt-in attempt to change files after a classified
  failure, including pre-repair evidence, changed files, diff artifact, rerun
  results, and final disposition.

## Scope Boundaries

### In Scope

- Evaluation runner and configuration under `evaluation/`
- Evaluation-local unit, integration, and smoke E2E tests
- Orchestration of existing root Playwright tests without editing them
- Structured evidence and human-readable summaries under `evaluation/runs/`
- Failure classification and repair-ready evidence model
- Coverage ownership reporting for existing hotel site behaviors

### Out of Scope

- Changing application behavior
- Rewriting existing E2E tests in this initial spec
- Modifying root `package.json`, Webpack configuration, or Playwright
  configuration by default
- Implementing or running repair mode in the first implementation
- Adding external services or persistent databases
- Running load, stress, or security testing against the sample site

## Success Criteria

- **SC-001**: A default evaluation command creates
  `evaluation/runs/<run-id>/summary.json` on every invocation.
- **SC-002**: A passing run records successful static, unit, integration, smoke,
  and full E2E layer outcomes when those layers are selected for the current
  run mode.
- **SC-003**: A controlled failing layer produces a non-zero gate result,
  preserves logs and artifacts, and records a failure category.
- **SC-004**: The harness can invoke the existing Playwright suite while keeping
  Playwright output for the evaluation-controlled invocation under
  `evaluation/runs/<run-id>/`.
- **SC-005**: The first implementation demonstrates at least one unit-owned
  behavior, one integration-owned behavior, and one E2E-owned behavior in the
  ownership report.
- **SC-007**: The first implementation can be accepted without repair mode when
  the default gate, evidence model, and failure classification are implemented
  and documented.
- **SC-008**: The first smoke/E2E evidence includes at least one representative
  successful check for each supported route family: `en-US` and `ja`.

### Deferred Success Criteria

- **SC-006**: Repair mode cannot change files without preserving original
  failure evidence and recording the resulting diff under `evaluation/`.

## Clarifications

### Session 2026-05-01

- Q: Should the local default evaluation gate require full E2E on every run, or
  should it stop at static/unit/integration/smoke E2E and reserve full E2E for
  CI or explicit invocation?
  A: Use the latter. The local default gate should stop at smoke E2E; full E2E
  should be required in CI or when explicitly requested.
- Q: Should generated evaluation run artifacts be committed?
  A: No. Generated `evaluation/runs/` artifacts should be ignored by default.
  Commit stable schemas/examples such as `evaluation/examples/summary.example.json`
  and allow deliberately selected baselines outside `evaluation/runs/` when
  long-term comparison is needed.
- Q: Should repair mode be included in the first implementation?
  A: No. First stabilize the evaluation gate, evidence model, and failure
  classification. Repair mode remains a later phase after those outputs are
  trustworthy.
- Q: How detailed should failure classification be in the first implementation?
  A: Use only deterministic categories first: `product`, `test`, `environment`,
  `timeout`, and `unknown`. Defer automatic `flaky` classification until the
  harness has retry history or repeated-run evidence.
- Q: Which language routes should the first smoke/E2E coverage include?
  A: Include both `en-US` and `ja` with thin representative checks from the
  first implementation, because multilingual routing is part of the system
  behavior being evaluated.
- Q: Which runner modes should the first implementation provide?
  A: Provide `gate`, `full`, and `collect-all`. `gate` runs the local default
  layers and stops on first required failure; `full` includes full E2E and stops
  on first required failure; `collect-all` attempts every configured layer,
  including full E2E, to maximize evidence collection after failures.
- Q: What should `full` mode run before the full E2E layer?
  A: Run all `gate` layers first, then run the full E2E layer when the earlier
  required layers pass. `full` is a superset of `gate`, not a replacement for
  the smoke layer.
- Q: How strictly should `summary.json` be managed in the first implementation?
  A: Commit a JSON Schema for `summary.json` and have the runner validate each
  generated summary against that schema before reporting the run as complete.
- Q: How should ambiguous assertion failures be classified when product versus
  test responsibility cannot be determined?
  A: Classify them as `unknown`. The first implementation should avoid
  guessing product or test responsibility without deterministic evidence.
- Q: How should evaluation-local Playwright failures be split between `product`
  and `test`?
  A: Treat assertion or expectation failures against product behavior as
  `product`. Treat spec code errors, helper errors, and fixture setup failures
  as `test`.
- Q: How should static, format, and unit layer failures be classified?
  A: Classify static or format command failures as `test`. For evaluation-local
  unit tests, classify assertion failures against `calcTotalBill` as `product`,
  syntax, import, helper, or harness errors as `test`, startup or missing
  dependency failures as `environment`, and otherwise `unknown`.
- Q: How much CI integration should the first implementation include?
  A: Define the CI command for running the evaluation harness, but do not add or
  modify GitHub Actions workflows in the first implementation.
- Q: How should evaluation-harness dependencies be handled for summary schema
  validation?
  A: Start with no new dependencies and implement only the minimal validation
  needed for the initial schema. If validation becomes more complex later, move
  evaluation-only dependencies such as a schema validator into an isolated
  package under `evaluation/` rather than changing the root package by default.
- Q: How strict should the first no-dependency schema validator be?
  A: Enforce required properties, primitive types, enum values, array item
  shapes, and object property shapes. Reject additional properties by default,
  except for schema objects explicitly marked as extension points.
- Q: Where should layer enablement and timeout values be configured?
  A: Store layer enablement, commands, and timeout values in
  `evaluation/config/evaluation.config.json`. The first CLI should only select
  runner mode and should not support ad hoc layer or timeout overrides.
- Q: What initial timeout values should layer config use?
  A: Use static 60s, unit 60s, integration 120s, smoke E2E 180s, full E2E 600s,
  and controlled failing fixture 60s.
- Q: How should `USE_DEPLOYED_SITE=true` be handled?
  A: Respect the existing repository behavior. The harness should not introduce
  a separate target switch in the first implementation; it should record the
  resolved target as `local` or `deployed` in `summary.json`.
- Q: Should the human-readable `summary.md` be required in the first
  implementation?
  A: Yes. Every run should produce `summary.md` alongside `summary.json`.
  `summary.json` remains the canonical machine-readable result.
- Q: Should `summary.md` include a recommended next action for successful runs?
  A: Yes. Keep the summary shape stable across outcomes; successful runs should
  explicitly state that no action is required.
- Q: Should successful recommended next action also be represented in
  `summary.json`?
  A: Yes. Include `recommendedNextAction` for every run outcome. Use `none` for
  passed runs so automated consumers do not need special-case missing fields.
- Q: How should `summary.json.recommendedNextAction` be structured?
  A: Use an object with fixed-enum `code` and free-text `message`. This keeps
  automated consumers stable while still allowing human-readable guidance.
- Q: How should `recommendedNextAction.code` be selected when failures are
  present?
  A: Use all recorded failures and a documented priority order, regardless of
  runner mode. `gate` runs may simply have fewer recorded failures than
  `collect-all` runs.
- Q: What priority order should choose `recommendedNextAction.code` when
  multiple failure classifications are present?
  A: Use `fix_environment`, then `inspect_product`, then `inspect_test`, then
  `investigate_unknown`.
- Q: Which `recommendedNextAction.code` should timeout failures use?
  A: Map timeout to `fix_environment` in the first implementation rather than
  guessing whether the root cause is product or test code.
- Q: Who generates `recommendedNextAction.message`?
  A: The runner generates it from built-in standard messages for each action
  code. Do not add message templates to config in the first implementation.
- Q: What built-in `recommendedNextAction.message` values should the first
  implementation use?
  A: Use these exact messages: `none`: `No action required.`,
  `fix_environment`: `Fix the evaluation environment or timeout condition
before inspecting product or test failures.`, `inspect_product`: `Inspect the
product behavior covered by the failing layer.`, `inspect_test`: `Inspect the
evaluation test, helper, fixture, or command configuration.`, and
  `investigate_unknown`: `Investigate the recorded failure evidence before
assigning ownership.`
- Q: How should dirty-worktree changed file paths be represented in
  `summary.json`?
  A: Record repository-root-relative paths with `/` separators. Do not write
  absolute paths or raw OS-specific `git status` output.
- Q: What should `summary.json.repository.changedFiles` contain for a clean
  worktree?
  A: Always include the field. Use an empty array for clean worktrees.
- Q: Which change types should `summary.json.repository.changedFiles` include?
  A: Include both tracked and untracked changed files so untracked inputs cannot
  silently affect evaluation results.
- Q: What shape should `summary.json.repository.changedFiles` entries use?
  A: Use object entries with `path` and `status`, not plain path strings, so
  consumers can distinguish tracked and untracked changes.
- Q: Which values should `summary.json.repository.changedFiles[].status` allow
  in the first implementation?
  A: Normalize to readable fixed values: `modified`, `added`, `deleted`,
  `renamed`, `untracked`, or `unknown`.
- Q: How should unmapped Git changed-file statuses be handled?
  A: Record them as `unknown` rather than rounding them to `modified`, so
  conflict, typechange, submodule, or other unusual states remain visible.
- Q: How should `collect-all` handle failures that make later layers
  meaningless or impossible?
  A: Declare layer dependencies in `evaluation/config/evaluation.config.json`.
  `collect-all` should attempt every configured layer whose declared
  dependencies are still satisfied, and mark dependency-blocked layers as
  `skipped` with the reason in `summary.json`.
- Q: In `collect-all`, what happens to independent later layers after a layer
  fails?
  A: Keep running later layers that do not depend on the failed layer,
  regardless of whether the failure is classified as product, test,
  environment, timeout, or unknown.
- Q: Should the first implementation create committed baseline artifacts?
  A: Create only baseline documentation such as `evaluation/baselines/README.md`.
  Do not commit generated baseline result JSON by default.
- Q: How should generated run retention and cleanup be handled?
  A: The first implementation should not automatically delete generated
  `evaluation/runs/` directories. Keep them ignored by Git and leave retention
  or cleanup to manual operation.
- Q: How should potentially sensitive values in logs and summaries be handled?
  A: Apply lightweight redaction for known sensitive keys in runner-managed
  text outputs and summary fields before writing them to disk. The initial key
  set should include at least `password`, `cookie`, `authorization`, and
  `token`, matched case-insensitively.
- Q: What redaction patterns should the first implementation detect?
  A: Detect known sensitive key names plus explicit `KEY=value` and
  `KEY: value` text patterns. Do not parse URL queries, JSON string internals,
  or generic `--key value` option pairs in the first implementation.
- Q: How should layer timeouts affect classification and run status?
  A: Treat a timeout as a layer failure with `classification: "timeout"`.
  A timeout in a required layer should fail the run.
- Q: How should runner process exit codes be defined?
  A: Exit `0` only when the selected mode succeeds. Exit `1` for any failed run
  and keep detailed categories in `summary.json` rather than distinct process
  exit codes.
- Q: How should runner-internal errors be reported when `summary.json` cannot be
  completed normally?
  A: Write `summary.json` with `status: "error"` when possible. If summary
  writing itself is not possible, report the error to stderr and exit `1`.
- Q: Should `ownership.json` be schema-validated in the first implementation?
  A: Yes. Commit `ownership.schema.json` and have the runner validate generated
  `ownership.json` before reporting the run as complete.
- Q: What run id format should the first implementation use?
  A: Use UTC timestamp plus sanitized branch name plus short commit SHA:
  `YYYYMMDDTHHMMSSZ-branch-abcdef0`. Record dirty state separately in
  `summary.json`.
- Q: What behavior should the first smoke E2E checks cover?
  A: Include thin top-page and reservation-entry checks for both `en-US` and
  `ja`, and include at least one successful reservation completion happy path in
  smoke coverage.
- Q: What should the first unit layer cover?
  A: Cover `calcTotalBill` only. Do not change product modules just to make more
  utilities importable in the first implementation.
- Q: What should the first integration layer cover?
  A: Focus on reservation form page-local behavior only: contact field
  visibility, required/range validation, and total bill recalculation.
- Q: What should `summary.example.json` contain?
  A: Make it a hand-managed representative example that includes passing,
  failing, skipped, and error result shapes rather than a generated run output.
- Q: How should CLI mode selection be specified?
  A: Use `--mode gate|full|collect-all`. Positional mode arguments are not
  required in the first implementation.
- Q: How should layer dependencies be represented in `evaluation.config.json`?
  A: Use both `dependsOn` for layer-to-layer dependencies and `requires` for
  environment or tool requirements. Skipped reasons should distinguish failed
  dependencies from missing requirements.
- Q: Should Playwright HTML reports be generated in the first implementation?
  A: No. Prefer machine-readable Playwright output and standard artifacts such
  as traces, screenshots, and output files. HTML reports can be added later if
  needed.
- Q: What information should `summary.md` include in the first implementation?
  A: Include run metadata, a layer result table, artifact links, an ownership
  summary, and a recommended next action.
- Q: How should dirty worktrees be handled?
  A: Allow execution on dirty worktrees, and record both dirty state and changed
  file paths in `summary.json`.
- Q: Should `summary.json` include aggregate counts for the whole run?
  A: Yes. Include aggregate run counts in addition to per-layer counts.
- Q: How should `counts` be represented for layers without test-case counts?
  A: Keep the same counts shape. Count a successful command as `passed: 1` and
  a failed command as `failed: 1`.
- Q: How should schema validation failures be handled?
  A: Treat generated output schema validation failures as runner internal
  errors, write `status: "error"` when possible, and exit `1`.
- Q: Should redacted values preserve hashes or any reversible information?
  A: No. Replace redacted values with `[REDACTED]` only.
- Q: How should artifact paths be recorded in `summary.json`?
  A: Record artifact paths relative to the run directory only. Do not include
  absolute paths.
- Q: Should `evaluation.config.json` define layers as an array or object?
  A: Use an ordered `layers` array. The array order is the default execution
  order.
- Q: Should layer commands be strings or argv arrays?
  A: Use argv arrays, not shell command strings, to avoid shell quoting and OS
  parsing differences.
- Q: How should executed layer commands be recorded in `summary.json`?
  A: Record both the argv array used for execution and a human-readable display
  string, so the same evidence supports reproduction and review.
- Q: How should `summary.json.layers[].command.display` be generated?
  A: Generate it from `executedArgv` with deterministic display quoting.
  Do not add a separate configurable display command in the first
  implementation.
- Q: Which quoting style should `summary.json.layers[].command.display` use?
  A: Use OS-independent deterministic display quoting for human review. Do not
  make `display` a PowerShell or POSIX shell reexecution contract; `executedArgv`
  remains the reproduction source.
- Q: What exact deterministic display quoting algorithm should command display
  use?
  A: Join redacted `executedArgv` entries with a single space. Leave arguments
  containing only alphanumerics, `.`, `_`, `/`, `-`, `:`, and `=` unquoted.
  Render empty strings as `""`. Wrap all other arguments in double quotes and
  escape `\`, `"`, newline, carriage return, and tab inside quoted arguments.
- Q: Which argv should `summary.json.layers[].command.display` be generated
  from?
  A: Generate display from `executedArgv`, because display should match the
  command that actually produced the layer logs and exit code.
- Q: Should `summary.json.layers[].command` record configured argv, executed
  argv, or both?
  A: Record both `configuredArgv` from config and `executedArgv` after the
  runner injects output paths or other runner-managed adjustments.
- Q: Should command records include environment variables?
  A: Record only environment variables explicitly injected by the runner for the
  command. Do not record the full process environment.
- Q: How should `summary.json.layers[].command.env` values be recorded?
  A: Record key/value pairs for runner-managed injected env values, replacing
  sensitive values with `[REDACTED]`.
- Q: How should `summary.json.layers[].command.env` key ordering be handled?
  A: Emit keys in ascending key order so summary diffs stay stable across runs.
- Q: Should any runner-injected env values be omitted from command evidence?
  A: No. Record every runner-injected env key, redacting sensitive values
  instead of omitting keys.
- Q: Should redaction apply to `summary.json.layers[].command.display`?
  A: Yes. Treat command display as runner-managed text output and apply the
  same sensitive-value redaction before writing evidence.
- Q: Should redaction apply to `configuredArgv` and `executedArgv` array
  elements?
  A: Yes. Redact sensitive values in both argv arrays before writing
  `summary.json`, not only in the display string.
- Q: Which `requires` values should the first implementation recognize?
  A: Recognize `node`, `pnpm`, `playwright`, and `dev-server`.
- Q: How should the `dev-server` requirement be verified?
  A: Leave startup and readiness handling to Playwright `webServer`. The runner
  should record the requirement but should not start or probe the server
  directly in the first implementation.
- Q: What status values should the first schemas allow?
  A: Run status values are `passed`, `failed`, and `error`; layer status values
  are `passed`, `failed`, and `skipped`. Timeout is represented by
  classification and counts, not by a separate layer status.
- Q: Should a controlled failing fixture be included for acceptance testing?
  A: Yes. Include a controlled failing layer fixture that is disabled in normal
  gate configuration.
- Q: How should the controlled failing fixture be executed?
  A: Provide a separate config file such as
  `evaluation/config/failing-fixture.config.json` so the normal config does not
  need to be edited.
- Q: If the first CLI normally only selects mode, how should alternate configs
  be selected for acceptance fixtures?
  A: Allow `--config <path>` as the only config-selection override. Continue to
  forbid ad hoc layer and timeout overrides.
- Q: Where may `--config` point?
  A: Restrict `--config` to files under `evaluation/config/`.
- Q: Where should the expected result for the controlled failing fixture be
  documented?
  A: Document it in `evaluation/baselines/README.md` as an operational note.
  Do not commit generated result JSON for the fixture.
- Q: Which runner executions are required for first implementation acceptance?
  A: Require `gate`, `full`, `collect-all`, and the controlled failing fixture
  so each supported mode and the expected failure path are checked before the
  first implementation is accepted.

## Assumptions

- Dependencies are installed with `pnpm install` before running the harness.
- The existing project remains a static Webpack site backed by browser storage,
  cookies, JSON fixtures, jQuery, Bootstrap, and Playwright E2E tests.
- New dependencies are avoided for the initial implementation unless a later
  plan update documents a clear benefit and keeps the change isolated.
- The Japanese E2E files may contain non-ASCII text and must be handled with
  UTF-8-safe tooling.

## Risks

- Existing Playwright reporter defaults may write outside `evaluation/` unless
  the harness overrides reporter and output paths per invocation.
- Node's native test runner can import only modules that are compatible with
  direct ESM execution; some app modules rely on Webpack JSON imports or browser
  globals and may require browser-level integration tests instead.
- Full E2E execution may be slower than the desired local feedback loop, so the
  smoke layer must provide fast signal before full E2E is run.
