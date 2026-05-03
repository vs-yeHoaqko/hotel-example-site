# Tasks: Migration Candidate Report

**Spec**: `evaluation/specs/002-migration-candidate-report/spec.md`
**Plan**: `evaluation/specs/002-migration-candidate-report/plan.md`
**Planned Feature Branch**: `002-migration-candidate-report`
**Generated**: 2026-05-01

## Task Rules

- Keep all implementation files under `evaluation/`.
- Do not edit product source, root package scripts, root build config, existing
  root E2E tests, application pages, or GitHub Actions workflows.
- Generated run output under `evaluation/runs/` must stay ignored and
  uncommitted.
- `evaluation/reports/migration-candidates.md` is a stable review artifact and
  should be committed when generated.
- Before starting an implementation task, change its checkbox from `[ ]` to
  `[-]`; after implementation and verification, record completion evidence and
  change it to `[x]`.
- Use `rg` to search existing files and implementation logs before coding.

## Dependencies

- T001 must complete before tasks that rely on constitution v1.1.0.
- T002 defines mapping data consumed by T004 and T005.
- T003 defines E2E inventory extraction consumed by T004.
- T004 combines ownership, mapping, and inventory into candidate data consumed
  by T005 and T006.
- T005 renders the report consumed by T006.
- T006 wires the generator and must complete before validation tasks T007
  through T010.

## Parallel Work

- T002 and T003 can proceed in parallel after T001 because they own different
  files.
- T005 can begin after the report data contract in T004 is stable, but final
  validation requires T004 output.
- T007 through T010 are validation tasks and must run after T006.

## Phase 1 - Governance and Contracts

- [x] 1. T001 [US3] Finalize constitution v1.1.0 for reviewable harness growth.
  - Files: `evaluation/.specify/memory/constitution.md`
  - _Requirements: FR-001, FR-002, FR-015, FR-016, FR-019_
  - Success: constitution includes the migration-candidate report prerequisite,
    reviewable harness growth principle, and version metadata `1.1.0`.
  - Evidence: `evaluation/.specify/memory/constitution.md` contains v1.1.0,
    the migration-candidate report prerequisite, and the reviewable harness
    growth principle.
  - _Prompt: Implement the task for Spec Kit feature 002-migration-candidate-report: Role=governance maintainer. Task=finalize the constitution amendment that requires reviewable migration-candidate evidence before E2E thinning or later harness growth. Restrictions=do not edit product, root E2E, CI, or package files. Leverage=spec clarifications and constitution v1.1.0 requirements. Requirements=FR-001, FR-002, FR-015, FR-016, FR-019. Success=constitution sync impact report and version metadata are internally consistent. Workflow=set this task to [-], search existing constitution text, implement, verify with diff/prettier, record completion evidence, then mark [x]._

- [x] 2. T002 [US1] Add explicit migration-candidate mapping config.
  - Files: `evaluation/config/migration-candidates.config.json`
  - _Requirements: FR-004, FR-004a, FR-005, FR-006, FR-007, FR-008,
    FR-008a, FR-008b, FR-008c, FR-008d, FR-009, FR-010, FR-011, FR-013a,
    FR-014, FR-020, FR-020a, SC-002, SC-003, SC-004_
  - Success: config contains reviewable mapping entries for reservation and
    billing-related root E2E tests, including unique candidate IDs, assertion
    scopes, English behavior summaries, status values, lower-layer evidence,
    remaining E2E coverage, and recommendations.
  - Evidence: `evaluation/config/migration-candidates.config.json` parses as
    JSON and contains 32 explicit candidates across reservation and billing
    behavior.
  - _Prompt: Implement the task for Spec Kit feature 002-migration-candidate-report: Role=test migration mapping engineer. Task=create JSON mapping rules for known reservation and billing E2E cases. Restrictions=no automatic inference-only rules; no root E2E edits; keep Japanese titles out of config unless needed, inventory reads source titles. Leverage=ownership records, e2e/en-US/reserve.spec.ts, e2e/ja/reserve.spec.ts, spec FR-008 statuses, FR-004a candidate identity, and FR-020a locale-specific message rule. Requirements=FR-004, FR-004a, FR-005 through FR-014a, FR-020, FR-020a, SC-002 through SC-004. Success=mapping is valid JSON, deterministic, reviewable, includes candidateId/assertionScope for same-test candidates, and blocks locale-specific message text without direct lower-layer evidence. Workflow=set [-], search root E2E tests, implement, verify JSON parses, record evidence, then mark [x]._

## Phase 2 - Generator Core

- [x] 3. T003 [US1] Implement root E2E inventory extraction.
  - Files: `evaluation/lib/e2e-inventory.mjs`
  - _Requirements: FR-004, FR-011, FR-013, FR-014a, FR-020, NFR-001,
    NFR-003_
  - Success: extractor scans root `e2e/**/*.spec.ts`, returns path, source
    line, ordinal, title, and describe context where available, preserving
    Japanese source titles.
  - Evidence: `node -e "import('./evaluation/lib/e2e-inventory.mjs')..."`
    found 20 root reservation E2E tests and resolved the expected en-US
    completion title.
  - _Prompt: Implement the task for Spec Kit feature 002-migration-candidate-report: Role=inventory extraction engineer. Task=scan current root Playwright E2E specs and extract stable test inventory without executing tests. Restrictions=no browser execution; no TypeScript parser dependency; do not edit root E2E files. Leverage=current `test('title', async ...)` style and plan Inventory Entry. Requirements=FR-004, FR-011, FR-013, FR-014a, FR-020, NFR-001, NFR-003. Success=inventory includes reservation test titles with correct paths, lines, and ordinals. Workflow=set [-], search E2E files, implement, run targeted node check, record evidence, then mark [x]._

- [x] 4. T004 [US1] Implement candidate model creation and validation.
  - Files: `evaluation/lib/migration-candidate-model.mjs`
  - _Requirements: FR-004, FR-004a, FR-005, FR-006, FR-007, FR-008,
    FR-008a, FR-008b, FR-008c, FR-008d, FR-009, FR-010, FR-011, FR-012,
    FR-013, FR-014a, FR-017, FR-020, FR-020a_
  - Success: model loads committed ownership source, mapping config, and E2E
    inventory; validates candidate ID uniqueness, assertion scopes, status
    values, and evidence paths; groups candidates by behavior; computes counts;
    and surfaces missing mapped tests or unmapped relevant reservation tests as
    warnings.
  - Evidence: `node evaluation/bin/generate-migration-candidates.mjs` validates
    the model and reports counts `ready_to_thin=10`,
    `blocked_missing_lower_layer=18`, `keep_e2e=4`.
  - _Prompt: Implement the task for Spec Kit feature 002-migration-candidate-report: Role=candidate model engineer. Task=combine ownership, mapping, and E2E inventory into deterministic migration candidate data. Restrictions=do not read latest evaluation/runs ownership as primary input; do not mutate root tests; do not silently ignore mapping drift. Leverage=evaluation/lib/ownership.mjs, T002 mapping, T003 inventory, plan Data Contract. Requirements=FR-004, FR-004a, FR-005 through FR-014a, FR-017, FR-020, FR-020a. Success=model produces sorted candidates, validates candidateId uniqueness and assertionScope for same-test candidates, fixed status counts, locale-specific message blocking, and inventory warnings. Workflow=set [-], search existing ownership code, implement, run targeted node checks, record evidence, then mark [x]._

- [x] 5. T005 [US2] Implement Markdown report renderer.
  - Files: `evaluation/lib/migration-candidate-report.mjs`
  - _Requirements: FR-003, FR-004, FR-004a, FR-005, FR-006, FR-007, FR-008,
    FR-009, FR-010, FR-011, FR-017, FR-018, FR-019, FR-020, FR-020a,
    NFR-002_
  - Success: renderer creates plain Markdown with metadata, fixed-order status
    counts, grouped candidate sections, candidate IDs, assertion scopes,
    inventory warnings, Japanese source titles plus English behavior summaries,
    and human-approval next steps.
  - Evidence: generated `evaluation/reports/migration-candidates.md` includes
    metadata, status counts, behavior groups, candidate IDs, assertion scopes,
    inventory warnings, and next steps.
  - _Prompt: Implement the task for Spec Kit feature 002-migration-candidate-report: Role=reporting engineer. Task=render migration candidate data to stable Markdown. Restrictions=no custom renderer assumptions; no run artifact paths as canonical input; keep generated report deterministic. Leverage=T004 model and plan Report Format. Requirements=FR-003 through FR-020 including subrequirements FR-004a, FR-008a through FR-008d, FR-013a, FR-014a, and FR-020a; NFR-002. Success=Markdown is readable, grouped by behavior, includes candidate IDs, assertion scopes, status counts, locale-specific blocked candidates, and next steps. Workflow=set [-], implement, render sample output, verify with prettier, record evidence, then mark [x]._

- [x] 6. T006 [US1] Wire the report generator CLI.
  - Files: `evaluation/bin/generate-migration-candidates.mjs`
  - _Requirements: FR-001, FR-002, FR-003, FR-011, FR-012, FR-013,
    FR-015, FR-016, FR-019, NFR-001, NFR-003, SC-001_
  - Success: CLI runs from repository root, writes
    `evaluation/reports/migration-candidates.md`, exits non-zero on mapping or
    inventory validation errors that prevent a trustworthy report, and does not
    modify files outside `evaluation/`.
  - Evidence: `node evaluation/bin/generate-migration-candidates.mjs` exits 0
    and writes `evaluation/reports/migration-candidates.md`.
  - _Prompt: Implement the task for Spec Kit feature 002-migration-candidate-report: Role=Node CLI integration engineer. Task=wire inventory, mapping, ownership, candidate model, and renderer into the executable generator. Restrictions=no root package script changes; no browser execution; no product/root E2E/CI mutation. Leverage=T003 through T005. Requirements=FR-001, FR-002, FR-003, FR-011 through FR-016, FR-019, NFR-001, NFR-003, SC-001. Success=one command generates the report and fails clearly on invalid inputs. Workflow=set [-], implement, run CLI, inspect git status, record evidence, then mark [x]._

## Phase 3 - Stable Review Artifact

- [x] 7. T007 [US1] Generate the version-controlled migration-candidate report.
  - Files: `evaluation/reports/migration-candidates.md`
  - _Requirements: FR-003, FR-004, FR-004a, FR-005, FR-006, FR-007, FR-008,
    FR-009, FR-010, FR-017, FR-018, FR-019, FR-020, FR-020a, SC-002,
    SC-003, SC-004_
  - Success: generated report identifies billing detail candidates as
    `ready_to_thin`, directly covered reservation validation candidates as
    `ready_to_thin`, reservation validation candidates without direct
    lower-layer evidence as `blocked_missing_lower_layer`, locale-specific
    validation message text without direct evidence as
    `blocked_missing_lower_layer`, and representative reservation completion
    journeys as E2E coverage to retain.
  - Evidence: `evaluation/reports/migration-candidates.md` contains 10
    `ready_to_thin`, 18 `blocked_missing_lower_layer`, and 4 `keep_e2e`
    candidates.
  - _Prompt: Implement the task for Spec Kit feature 002-migration-candidate-report: Role=review artifact producer. Task=run generator and review the produced migration-candidates.md. Restrictions=do not hand-edit generated report except via source mapping/model fixes; do not copy per-run artifacts. Leverage=T006 generator and plan Validation Plan. Requirements=FR-003 through FR-020 including subrequirements FR-004a, FR-008a through FR-008d, FR-013a, FR-014a, and FR-020a; SC-002 through SC-004. Success=report is committed guidance with readable candidate groups, candidate IDs/assertion scopes, locale-specific blocked candidates, and next steps. Workflow=set [-], run generator, inspect report, fix source inputs if needed, verify, record evidence, then mark [x]._

## Phase 4 - Acceptance Validation

- [x] 8. T008 [US1] Validate deterministic report generation.
  - Files: generated comparison only; no committed generated temp files
  - _Requirements: FR-011, FR-017, FR-019, NFR-002, SC-001_
  - Success: running `node evaluation/bin/generate-migration-candidates.mjs`
    twice on the same repository state leaves no additional diff after the
    first generated report.
  - Evidence: repeated generation kept
    `evaluation/reports/migration-candidates.md` SHA256 at
    `516AEBE6565CD1EA4C109D29EF99634135DDD27EBA09E6C8B70F9C3EA82A6BCD`.
  - _Prompt: Implement the task for Spec Kit feature 002-migration-candidate-report: Role=determinism validation engineer. Task=validate repeat generation stability. Restrictions=do not commit temporary comparison files; do not ignore meaningful report churn. Leverage=T006 CLI and git diff. Requirements=FR-011, FR-017, FR-019, NFR-002, SC-001. Success=second generation produces no diff. Workflow=set [-], run generator twice, inspect git diff, record evidence, then mark [x]._

- [x] 9. T009 [US3] Validate isolation from root product, E2E, CI, and package files.
  - Files: no expected file changes outside `evaluation/`
  - _Requirements: FR-001, FR-002, FR-015, FR-016, SC-005_
  - Success: after report generation, `git status --short` shows only
    `evaluation/` paths changed.
  - Evidence: `git status --short` after generation reports only
    `evaluation/` paths.
  - _Prompt: Implement the task for Spec Kit feature 002-migration-candidate-report: Role=isolation validation engineer. Task=confirm generator does not modify root product, root E2E, CI, package, or config files. Restrictions=do not clean unrelated user changes; report any unexpected paths instead. Leverage=git status and spec boundaries. Requirements=FR-001, FR-002, FR-015, FR-016, SC-005. Success=all changes are under evaluation/. Workflow=set [-], run status checks after generation, record evidence, then mark [x]._

- [x] 10. T010 [US1] Validate formatting and existing evaluation gate.
  - Files: generated files under `evaluation/runs/<run-id>/` only, plus no
    additional committed changes
  - _Requirements: NFR-001, NFR-002, NFR-003, SC-001, SC-005_
  - Success: Prettier check passes for changed evaluation files, and
    `node evaluation/bin/run-evaluation.mjs --mode gate` still exits 0 after
    the report feature is added.
  - Evidence: Prettier check passed for the evaluation harness paths, and
    `node evaluation/bin/run-evaluation.mjs --mode gate` passed in
    `evaluation/runs/20260503T074310Z-002-migration-candidate-report-db2322c`.
  - _Prompt: Implement the task for Spec Kit feature 002-migration-candidate-report: Role=final validation engineer. Task=run formatting checks and the existing evaluation gate. Restrictions=do not commit evaluation/runs; do not weaken gate to pass. Leverage=001 evaluation harness and 002 generated report. Requirements=NFR-001, NFR-002, NFR-003, SC-001, SC-005. Success=prettier and gate pass; generated run artifacts remain ignored. Workflow=set [-], run checks, record evidence, then mark [x]._
