<!--
Sync Impact Report
Version change: template -> 1.4.0
Modified principles:
- Initial root constitution created from the historical evaluation harness constitution
- IV. Tests Move Down the Pyramid When Their Responsibility Allows It
- VI. Harness Growth Is Reviewable
Added principles:
- VIII. E2E Thinning Is Evidence-Preserving
- IX. Fork Drift Must Be Minimized
Added sections:
- Evaluation Scope
- Test Layer Ownership
Removed sections:
- Template placeholder sections
Templates requiring updates:
- updated: .specify/templates/plan-template.md
- updated: .specify/templates/tasks-template.md
Follow-up items: none.
-->

# Evaluation Harness Constitution

## Evaluation Scope

This constitution governs the evaluation harness for `hotel-example-site`.
The harness evaluates the quality of the existing hotel sample site as a system
under test. It does not govern product behavior changes to the site itself.

The harness MUST live under `evaluation/` unless an amendment explicitly
changes that boundary. The original application source, fixtures, static pages,
and existing Playwright tests are treated as the system under test until an
approved specification states otherwise.

## Core Principles

### I. Evaluation Assets Are Isolated

All new evaluation plans, specifications, scripts, generated reports, traces,
summaries, and repair artifacts MUST be placed under `evaluation/`.

The harness MUST NOT modify application source files, static pages, existing
test files, build configuration, or package scripts as part of constitution
work. Any later task that changes files outside `evaluation/` MUST state the
reason, expected blast radius, and rollback path before implementation.

Rationale: the harness must evaluate the repository without silently becoming
part of the product implementation it is measuring.

### II. Close the Evaluation Loop First

The first implementation priority MUST be a minimal, repeatable loop:

1. prepare a deterministic environment
2. run unit, integration, and E2E gates in a defined order
3. classify failures
4. preserve artifacts
5. preserve enough evidence for a later repair attempt
6. rerun the relevant gates
7. produce a machine-readable summary

The initial loop MAY contain thin unit and integration coverage. It MUST still
exercise all configured layers so the harness proves its control flow before
the test pyramid is refined.

Rationale: a closed evidence loop creates the feedback surface needed to safely
add, move, remove, and eventually repair tests.

### III. Evidence Is a Required Output

Every harness run MUST produce structured evidence under `evaluation/`.
At minimum, a run MUST record:

- commit or working tree identifier
- start and finish timestamps
- command results per test layer
- pass, fail, skipped, and timeout counts
- failure category when classification is possible
- failed test identity when a layer exposes test-case results
- reproduction command for each failed test or failed layer when it can be
  generated safely
- concise diagnostic message and artifact references for each actionable
  failure
- artifact paths for screenshots, traces, reports, logs, diffs, and summaries

Human-readable reports are useful but insufficient. The canonical run outcome
MUST be machine-readable so later automation can compare runs, detect
regressions, produce repair guidance, and decide whether repair or migration
work is safe.

Rationale: evaluation that cannot be replayed, inspected, or compared is not a
dependable quality signal.

### IV. Tests Move Down the Pyramid When Their Responsibility Allows It

E2E tests MAY initially capture broad behavior. The harness MUST classify each
E2E assertion or scenario by the lowest appropriate test layer.

The default ownership is:

- Unit tests own pure logic, calculations, formatting, parsing, and boundary
  conditions.
- Integration tests own DOM behavior, form state, event handling, local page
  composition, and fixture-backed rendering.
- E2E tests own cross-page flows, browser storage, cookies, redirects,
  localization routes, and representative user journeys.

When a lower-layer test covers the same responsibility with clearer failure
localization, the E2E test SHOULD be reduced to a representative smoke or flow
check instead of retaining detailed combinatorial coverage.

Before any existing E2E test is thinned, removed, or replaced, the harness MUST
produce a reviewable migration-candidate report. The report MUST name the
current E2E test, the behavior it covers, the proposed owner layer, the
lower-layer evidence that already exists or must be added, and the E2E smoke
coverage that will remain.

Rationale: E2E tests are valuable for confidence but expensive for diagnosis.
The harness must keep them focused on behavior that only E2E can validate.

### V. Repair Loops Must Preserve Trust

The harness MAY support repair mode, but repair mode MUST be auditable.

Repair mode MUST:

- preserve the failing evidence before applying changes
- classify whether the likely issue is product code, test code, environment,
  flakiness, or unknown
- record every changed file in a diff artifact
- rerun the relevant test first, then the owning layer, then the full gate
- avoid changing test expectations merely to make a failure pass unless the
  failure is explicitly classified as a test bug

Repair attempts MUST have bounded retries. If the same failure persists after
the configured retry limit, the harness MUST stop and report the unresolved
state rather than continuing to mutate files.

Repair mode MUST NOT be introduced before the harness can emit structured
diagnostics and non-mutating repair guidance for the same failure classes that
repair mode would attempt to change.

Rationale: an automatic repair loop is only useful when its changes are
reviewable and its success criteria are stricter than "the current failure
disappeared".

### VI. Harness Growth Is Reviewable

The harness MUST grow through explicit, reviewable artifacts before behavior is
changed. A new capability that changes evaluation behavior MUST first define
what decision it helps a human make and which existing evidence it consumes.

The default growth order is:

1. produce a migration-candidate report from ownership and current tests
2. review and approve which existing E2E cases may be thinned
3. produce actionable failure diagnostics and non-mutating repair guidance
4. wire the stable gate into CI
5. define the cadence for full and collect-all runs
6. add repair mode only after the previous artifacts are stable

New growth features MUST NOT silently mutate product code, root E2E tests, root
CI configuration, or package scripts. If a growth task needs to change outside
`evaluation/`, its spec and plan MUST state the exact files, rationale, blast
radius, and rollback path.

Generated growth reports MUST be committed only when they are stable guidance
or templates. Per-run reports, traces, logs, and screenshots remain operational
artifacts under `evaluation/runs/` and MUST stay uncommitted by default.

Rationale: growth work must make the next human decision easier before it
automates that decision.

### VII. Failure Diagnostics Must Be Actionable Before Repair

When an evaluation layer fails, the harness MUST make the failure actionable
before asking a human or agent to inspect raw artifacts.

For each failed test case or failed command where the runner can extract
structured evidence, diagnostics SHOULD include:

- layer name and owner layer
- failed test title, source path, and line when available
- concise failure summary
- expected and actual values when the test framework reports them
- primary error message and trimmed stack or location
- screenshot, trace, video, JSON result, stdout, and stderr artifact references
- safe reproduction command scoped to the failed test or owning layer
- likely files or behavior areas to inspect, with confidence and rationale
- whether the guidance points to product code, evaluation test code,
  environment setup, flakiness investigation, or unknown ownership

Diagnostic guidance MUST be advisory. It MAY identify likely files and next
steps, but it MUST NOT change product code, test code, expectations, CI, or
package scripts. If confidence is low, the harness MUST say so rather than
presenting a guess as a fix.

Rationale: repair automation can only be trusted after the harness demonstrates
that it can explain failures well enough for a reviewer to act without reading
every raw log first.

### VIII. E2E Thinning Is Evidence-Preserving

Existing root E2E tests MAY be thinned only after a committed migration report
marks the covered behavior as ready and identifies lower-layer evidence for the
same responsibility.

E2E thinning MUST:

- preserve the lower-layer tests that justify the thinning
- preserve at least one representative smoke or flow check for each user
  journey family that still needs browser-level confidence
- keep explicitly marked `keep_e2e` journeys intact unless a later amendment
  replaces them with equivalent browser-flow coverage
- record which assertion scope was thinned, retained, or deferred
- validate both the gate and the relevant full E2E mode after changes
- avoid product source changes unless a separate product-behavior issue is
  specified

If a candidate cannot be safely thinned during implementation, it MUST be
recorded as retained or deferred with the reason. Thinning MUST NOT be used to
hide a failing or flaky assertion.

Rationale: moving detail out of E2E is only an improvement when the same
behavior remains covered at the right layer and the remaining E2E suite still
proves representative browser journeys.

### IX. Fork Drift Must Be Minimized

This repository is a fork of an upstream project. Evaluation harness work MUST
avoid edits to upstream-owned or base-branch-volatile files when an
evaluation-local artifact, report, or configuration can achieve the same
review outcome.

When an approved feature must touch files outside `evaluation/`, the change
MUST:

- be limited to the smallest behavior-preserving edit that satisfies the
  approved specification
- avoid broad formatting, reordering, renaming, or unrelated cleanup in
  upstream-owned files
- list every outside-`evaluation/` file touched, the reason it must be touched,
  and the expected conflict risk
- re-check the target files against the latest fork `main` before editing when
  the feature depends on root E2E or other base-branch files
- prefer stable identities such as path, ordinal, assertion scope, and report
  candidate id over fragile line-only references

For E2E thinning, this means root E2E edits MUST be assertion-level and tied to
committed migration candidates. The implementation MUST NOT rewrite whole test
files, normalize unrelated formatting, or restructure tests merely to make
thinning easier.

Rationale: the fork should remain easy to sync with upstream. Evaluation work
must reduce diagnostic cost without creating unnecessary merge conflicts.

## Test Layer Ownership

The harness recognizes the following test layers:

- `unit`: fastest tests for isolated logic with no browser dependency
- `integration`: browser-like or DOM-level tests for page-local behavior
- `e2e`: Playwright browser tests for representative user journeys
- `gate`: ordered orchestration of all required layers

The default gate order is:

1. format and static checks, if configured
2. unit tests
3. integration tests
4. E2E smoke tests
5. full E2E tests, if configured

A failure in an earlier required layer SHOULD stop later layers unless the run
mode explicitly requests full evidence collection.

## Governance

This constitution is versioned with semantic versioning.

- MAJOR: incompatible changes to the harness boundary, governance model, or
  required evaluation loop
- MINOR: new principles, required artifact types, test layers, or repair
  obligations
- PATCH: clarifications that do not change required behavior

Amendments MUST update the Sync Impact Report at the top of this file and the
version metadata below. Any future Spec Kit templates or task plans MUST be
checked against this constitution before use.

Compliance review is required before implementing each evaluation harness
task. A task is compliant only when it states:

- which principle it supports
- which files it may create or modify
- which test layer it affects
- what evidence proves completion

**Version**: 1.4.0 | **Ratified**: 2026-05-04 | **Last Amended**: 2026-05-04
