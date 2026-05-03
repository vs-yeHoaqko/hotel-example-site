<!--
Sync Impact Report
Version change: 1.0.0 -> 1.1.0
Modified principles:
- IV. Tests Move Down the Pyramid When Their Responsibility Allows It
Added principles:
- VI. Harness Growth Is Reviewable
Added sections: none
Removed sections: N/A
Templates requiring updates: future specs and plans must include migration-candidate evidence before E2E thinning, CI wiring, cadence changes, or repair mode work.
Follow-up items: none.
-->

# Evaluation Harness Constitution

## Evaluation Scope

This constitution governs the evaluation harness for `hotel-example-site`.
The harness evaluates the quality of the existing hotel sample site as a
system under test. It does not govern product behavior changes to the site
itself.

The harness MUST live under `evaluation/` unless an amendment explicitly
changes that boundary. The original application source, fixtures, static
pages, and existing Playwright tests are treated as the system under test
until a later approved implementation task states otherwise.

## Core Principles

### I. Evaluation Assets Are Isolated

All new evaluation plans, specifications, scripts, generated reports, traces,
summaries, and repair artifacts MUST be placed under `evaluation/`.

The harness MUST NOT modify application source files, static pages, existing
test files, build configuration, or package scripts as part of constitution
work. Any later task that changes files outside `evaluation/` MUST state the
reason, expected blast radius, and rollback path before implementation.

Rationale: the harness must be able to evaluate the repository without
silently becoming part of the product implementation it is measuring.

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
add, move, remove, and eventually repair tests without requiring repair mode in
the first implementation.

### III. Evidence Is a Required Output

Every harness run MUST produce structured evidence under `evaluation/`.
At minimum, a run MUST record:

- commit or working tree identifier
- start and finish timestamps
- command results per test layer
- pass, fail, skipped, and timeout counts
- failure category when classification is possible
- artifact paths for screenshots, traces, reports, logs, diffs, and summaries

Human-readable reports are useful but insufficient. The canonical run outcome
MUST be machine-readable so later automation can compare runs, detect
regressions, and decide whether repair or migration work is safe.

Rationale: evaluation that cannot be replayed, inspected, or compared is not
a dependable quality signal.

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
3. wire the stable gate into CI
4. define the cadence for full and collect-all runs
5. add repair mode only after the previous artifacts are stable

New growth features MUST NOT silently mutate product code, root E2E tests,
root CI configuration, or package scripts. If a growth task needs to change
outside `evaluation/`, its spec and plan MUST state the exact files, rationale,
blast radius, and rollback path.

Generated growth reports MUST be committed only when they are stable guidance
or templates. Per-run reports, traces, logs, and screenshots remain operational
artifacts under `evaluation/runs/` and MUST stay uncommitted by default.

Rationale: a harness that changes tests, CI, or repair behavior without a
reviewable decision record becomes another source of hidden risk. Growth work
must make the next human decision easier before it automates that decision.

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

A failure in an earlier required layer SHOULD stop later layers unless the
run mode explicitly requests full evidence collection.

## Governance

This constitution is versioned with semantic versioning.

- MAJOR: incompatible changes to the harness boundary, governance model, or
  required evaluation loop
- MINOR: new principles, required artifact types, test layers, or repair
  obligations
- PATCH: clarifications that do not change required behavior

Amendments MUST update the Sync Impact Report at the top of this file and the
version metadata below. Any future Spec Kit templates or task plans under
`evaluation/.specify/` MUST be checked against this constitution before use.

Compliance review is required before implementing each evaluation harness
task. A task is compliant only when it states:

- which principle it supports
- which files it may create or modify
- which test layer it affects
- what evidence proves completion

**Version**: 1.1.0
**Ratified**: 2026-05-01
**Last Amended**: 2026-05-01
