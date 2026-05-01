# Tasks: Evaluation Harness

**Spec**: `evaluation/specs/001-evaluation-harness/spec.md`
**Plan**: `evaluation/specs/001-evaluation-harness/plan.md`
**Planned Feature Branch**: `001-evaluation-harness`
**Generated**: 2026-05-01
**Planning Note**: These tasks are authored before switching the Git worktree
from `main`; branch creation is deferred until implementation starts.

## Task Rules

- Keep all implementation files under `evaluation/`.
- Do not edit product source, root package scripts, root build config, existing
  root E2E tests, or application pages.
- Generated run output under `evaluation/runs/` must stay ignored and
  uncommitted.
- Before starting an implementation task, change its checkbox from `[ ]` to
  `[-]`; after implementation and verification, record completion evidence and
  change it to `[x]`.
- Use `rg` to search existing files and implementation logs before coding.

## Dependencies

- T001 must complete before tasks that create files under `evaluation/`.
- T002 and T003 define config consumed by runner and tests.
- T004 and T009 define schema validation before summary/ownership outputs can
  be accepted.
- T006 through T015 build runner modules; T016 wires them into the CLI.
- T017 through T020 add evaluation-local checks and fixtures consumed by T021
  through T024.

## Parallel Work

- After T001, T002, T003, T004, T005, T017, T018, T019, and T020 can proceed in
  parallel if each worker owns only the listed files.
- T007, T008, T009, T011, and T012 can proceed in parallel after their listed
  prerequisites.
- T021, T022, T023, and T024 are validation tasks and must run after T016
  through T020.

## Phase 1 - Scaffold Contracts

- [x] 1. T001 [US1] Scaffold evaluation implementation directories and ignore generated runs.
  - Files: `evaluation/.gitignore`, `evaluation/bin/`, `evaluation/lib/`, `evaluation/config/`, `evaluation/schemas/`, `evaluation/tests/`, `evaluation/reports/templates/`, `evaluation/examples/`, `evaluation/baselines/`
  - _Requirements: FR-001, FR-002, FR-006, FR-022_
  - Success: committed evaluation directories exist where needed; `evaluation/runs/` is ignored; no product or root config files are changed.
  - _Prompt: Implement the task for Spec Kit feature 001-evaluation-harness: Role=repository scaffolding engineer. Task=create only evaluation-local directories and ignore rules for generated runs. Restrictions=do not edit root scripts, app source, existing E2E tests, or generated run outputs. Leverage=spec.md FR-001/FR-022 and plan Project Structure. Requirements=FR-001, FR-002, FR-006, FR-022. Success=directories and ignore rules match the plan. Workflow=set this task to [-], search existing implementation logs if present, implement, verify with git status, record completion evidence, then mark [x]._

- [x] 2. T002 [US1] Add evaluation layer configuration files.
  - Files: `evaluation/config/evaluation.config.json`, `evaluation/config/failing-fixture.config.json`
  - _Requirements: FR-004, FR-005, FR-021, FR-025, FR-026, FR-027, FR-027a, FR-028, FR-028a, FR-028b, FR-034, FR-034a, FR-034b, FR-034c, FR-034d, FR-034e, FR-034f, FR-035b, FR-035c, FR-046, FR-047, NFR-001_
  - Success: normal config defines ordered static, unit, integration, smoke, and full layers with required modes, dependencies, `requires`, argv commands, and initial timeouts; failing fixture config enables only the controlled failure path.
  - _Prompt: Implement the task for Spec Kit feature 001-evaluation-harness: Role=evaluation configuration engineer. Task=create config files matching the Configuration Contract and timeout values. Restrictions=no shell command strings, no ad hoc CLI overrides, no fixture enabled in normal config. Leverage=plan Configuration Contract and FR-034\*. Requirements=FR-004, FR-025 through FR-028b, FR-034 through FR-035c, FR-046, FR-047. Success=config validates by inspection and uses only allowed `requires`. Workflow=set [-], search logs, implement, verify JSON parses, record completion evidence, then mark [x]._

- [x] 3. T003 [US1] Add evaluation-local Playwright config files.
  - Files: `evaluation/config/playwright.integration.config.mjs`, `evaluation/config/playwright.smoke.config.mjs`, `evaluation/config/playwright.full.config.mjs`
  - _Requirements: FR-010, FR-010a, FR-019, FR-024, FR-024a, FR-034d, FR-034e, NFR-004_
  - Success: configs use existing Playwright behavior, preserve `USE_DEPLOYED_SITE`, keep artifacts under the run directory through runner-provided output paths, and avoid HTML reports.
  - _Prompt: Implement the task for Spec Kit feature 001-evaluation-harness: Role=Playwright configuration engineer. Task=create integration and smoke Playwright configs under evaluation/config. Restrictions=do not modify root playwright.config.ts; do not request HTML reports; leave webServer handling to Playwright. Leverage=root `playwright.config.ts` and plan Layer Commands. Requirements=FR-010, FR-010a, FR-019, FR-024, FR-024a, FR-034d, FR-034e. Success=configs can be referenced by layer argv and route artifacts under evaluation/runs. Workflow=set [-], search logs, implement, verify import syntax, record completion evidence, then mark [x]._

- [x] 4. T004 [US2] Add summary and ownership JSON schemas.
  - Files: `evaluation/schemas/summary.schema.json`, `evaluation/schemas/ownership.schema.json`
  - _Requirements: FR-008, FR-008a, FR-008b, FR-008c, FR-008d, FR-008e, FR-008f, FR-008g, FR-008h, FR-008i, FR-008j, FR-008k, FR-008l, FR-008m, FR-008n, FR-008o, FR-008p, FR-008q, FR-009, FR-009a, FR-009b, FR-009c, FR-009d, FR-009e, FR-009f, FR-009g, FR-009h, FR-009i, FR-009j, FR-009k, FR-029, FR-030, FR-030a, FR-030b, FR-041b, FR-042, FR-043, NFR-002, NFR-003_
  - Success: schemas express required fields, types, enums, array/object shapes, command records, changed files, counts, statuses, classifications, recommended actions, and additional-property policy.
  - _Prompt: Implement the task for Spec Kit feature 001-evaluation-harness: Role=schema contract engineer. Task=create summary and ownership schemas from spec and plan. Restrictions=no new schema dependency, no generated run output, no vague open shapes except explicit extension points. Leverage=plan Evidence Contract and Ownership Contract. Requirements=FR-008*, FR-009*, FR-029, FR-030\*, FR-041b, FR-042, FR-043. Success=schemas are valid JSON and cover all documented evidence fields. Workflow=set [-], search logs, implement, verify JSON parses, record completion evidence, then mark [x]._

- [x] 5. T005 [US2] Add stable example and baseline documentation.
  - Files: `evaluation/examples/summary.example.json`, `evaluation/baselines/README.md`
  - _Requirements: FR-023, FR-023a, FR-023b, FR-045, FR-047_
  - Success: example is hand-managed and includes passing, failing, skipped, and error shapes; baseline README documents the controlled failing fixture command and expected non-zero result without committing generated result JSON.
  - _Prompt: Implement the task for Spec Kit feature 001-evaluation-harness: Role=evidence documentation engineer. Task=create stable example summary and baseline README. Restrictions=do not copy a generated run; do not commit generated baseline JSON; keep paths relative. Leverage=plan Evidence Contract and validation plan. Requirements=FR-023, FR-023a, FR-023b, FR-045, FR-047. Success=docs explain fixture acceptance and example covers all result shapes. Workflow=set [-], search logs, implement, verify JSON parses, record completion evidence, then mark [x]._

## Phase 2 - Runner Core

- [x] 6. T006 [US1] Implement CLI argument parsing and config loading.
  - Files: `evaluation/bin/run-evaluation.mjs`, `evaluation/lib/cli.mjs`, `evaluation/lib/config.mjs`
  - _Requirements: FR-003, FR-025, FR-031, FR-032, FR-035, FR-035a, FR-035b, FR-035c_
  - Success: CLI accepts `--mode gate|full|collect-all`, optionally accepts `--config <path>` restricted to `evaluation/config/`, rejects ad hoc layer/timeout overrides, and loads JSON config.
  - _Prompt: Implement the task for Spec Kit feature 001-evaluation-harness: Role=Node CLI engineer. Task=implement CLI parsing and safe config loading. Restrictions=no new dependencies; no root package script changes; no config paths outside evaluation/config. Leverage=T002 config contract and package Node 22 runtime. Requirements=FR-003, FR-025, FR-031, FR-035\*. Success=invalid modes/config paths fail with exit 1 and clear error; valid config loads. Workflow=set [-], search logs, implement, run targeted node checks, record completion evidence, then mark [x]._

- [x] 7. T007 [US2] Implement run id and repository state capture.
  - Files: `evaluation/lib/run-id.mjs`, `evaluation/lib/git-state.mjs`
  - _Requirements: FR-008a, FR-008j, FR-008k, FR-008l, FR-008m, FR-008n, FR-008o, FR-044_
  - Success: run ids use `YYYYMMDDTHHMMSSZ-branch-abcdef0`; repository state includes branch, commit, dirty, and `changedFiles` objects for tracked and untracked files with normalized statuses and `/` paths.
  - _Prompt: Implement the task for Spec Kit feature 001-evaluation-harness: Role=git metadata engineer. Task=implement run-id and changed-file collection. Restrictions=do not use absolute paths in summary data; do not drop untracked files; map unknown statuses to `unknown`. Leverage=git porcelain output and spec FR-008j through FR-008o. Requirements=FR-008a, FR-008j through FR-008o, FR-044. Success=clean worktree emits `changedFiles: []`; dirty worktree paths are repo-relative. Workflow=set [-], search logs, implement, run local node/git checks, record completion evidence, then mark [x]._

- [x] 8. T008 [US2] Implement redaction and command display formatting utilities.
  - Files: `evaluation/lib/redaction.mjs`, `evaluation/lib/command-format.mjs`
  - _Requirements: FR-009b, FR-009h, FR-009i, FR-009j, FR-009k, FR-037, FR-038, FR-038a, FR-038b_
  - Success: redaction covers known keys plus `KEY=value` and `KEY: value`, replaces values with `[REDACTED]`, avoids URL/JSON/generic option parsing, and deterministic display quoting matches FR-009k.
  - _Prompt: Implement the task for Spec Kit feature 001-evaluation-harness: Role=security-minded utility engineer. Task=implement redaction and display formatting. Restrictions=no reversible hashes; no overbroad parsing of URL queries, JSON internals, or `--key value`; display is not a shell reexecution contract. Leverage=FR-009k and FR-038b. Requirements=FR-009b, FR-009h, FR-009i, FR-009j, FR-009k, FR-037, FR-038\*. Success=utility examples cover empty args, quoted args, and sensitive text. Workflow=set [-], search logs, implement, run targeted node checks, record completion evidence, then mark [x]._

- [x] 9. T009 [US2] Implement the no-dependency schema validator.
  - Files: `evaluation/lib/schema-validator.mjs`
  - _Requirements: FR-030, FR-030a, FR-030b, FR-032, FR-033, FR-041a, FR-043_
  - Success: validator enforces required properties, primitive types, enums, array item shapes, object property shapes, rejects additional properties by default, and reports validation paths clearly.
  - _Prompt: Implement the task for Spec Kit feature 001-evaluation-harness: Role=validation engineer. Task=implement internal schema validator used by summary and ownership output. Restrictions=no third-party dependencies; keep scope to documented validator features; schema validation failure is an internal runner error. Leverage=T004 schemas and plan Schema Validation. Requirements=FR-030, FR-030a, FR-030b, FR-041a, FR-043. Success=valid examples pass and deliberate missing/extra/type/enum failures report useful paths. Workflow=set [-], search logs, implement, run targeted node checks, record completion evidence, then mark [x]._

- [x] 10. T010 [US1] Implement layer planning for modes, dependencies, and requirements.
  - Files: `evaluation/lib/layer-planner.mjs`
  - _Requirements: FR-004, FR-005, FR-025, FR-026, FR-027, FR-027a, FR-028, FR-028a, FR-028b, FR-034a, FR-034d_
  - Success: planner selects layers for `gate`, `full`, and `collect-all`; records dependency-blocked skips separately from missing requirements; keeps independent collect-all layers runnable after failures.
  - _Prompt: Implement the task for Spec Kit feature 001-evaluation-harness: Role=execution planning engineer. Task=implement layer selection and skip planning. Restrictions=do not conflate `dependsOn` with `requires`; do not stop independent collect-all layers after unrelated failures. Leverage=T002 config. Requirements=FR-004, FR-005, FR-025 through FR-028b, FR-034a, FR-034d. Success=planner output explains attempted and skipped layers for each mode. Workflow=set [-], search logs, implement, run targeted node checks, record completion evidence, then mark [x]._

- [x] 11. T011 [US1] Implement command execution with timeouts and log capture.
  - Files: `evaluation/lib/command-executor.mjs`
  - _Requirements: FR-006, FR-009, FR-009a, FR-009c, FR-009d, FR-009e, FR-009f, FR-009g, FR-010, FR-039, NFR-002, NFR-003_
  - Success: executor creates run directories, writes per-layer stdout/stderr logs, enforces layer timeouts, records exit code/duration/timeout/skipped reason, captures configured/executed argv/display/env, and keeps artifacts under the run directory.
  - _Prompt: Implement the task for Spec Kit feature 001-evaluation-harness: Role=process execution engineer. Task=implement child-process execution and evidence capture. Restrictions=no shell command strings; no full process env recording; no artifact paths outside evaluation/runs. Leverage=T008 formatting/redaction and T002 timeout values. Requirements=FR-006, FR-009\*, FR-010, FR-039. Success=executor handles pass, fail, timeout, and command-start failure. Workflow=set [-], search logs, implement, run targeted node checks, record completion evidence, then mark [x]._

- [x] 12. T012 [US2] Implement failure classification and recommended action selection.
  - Files: `evaluation/lib/failure-classifier.mjs`, `evaluation/lib/recommended-action.mjs`
  - _Requirements: FR-008e, FR-008f, FR-008g, FR-008h, FR-008i, FR-008q, FR-011, FR-011a, FR-011b, FR-011c, FR-011d_
  - Success: classifier returns `product`, `test`, `environment`, `timeout`, or `unknown`; recommended action uses all recorded failures, priority order, timeout mapping, and exact built-in messages.
  - _Prompt: Implement the task for Spec Kit feature 001-evaluation-harness: Role=failure analysis engineer. Task=implement deterministic classification and recommended action mapping. Restrictions=no flaky classification; ambiguous product/test stays unknown; use exact messages from spec. Leverage=FR-008q and Failure Classification plan. Requirements=FR-008e through FR-008q, FR-011\*. Success=examples cover environment, timeout, product, test, unknown, and mixed failures. Workflow=set [-], search logs, implement, run targeted node checks, record completion evidence, then mark [x]._

- [x] 13. T013 [US2] Implement summary model creation and validation.
  - Files: `evaluation/lib/summary-model.mjs`
  - _Requirements: FR-007, FR-008, FR-008b, FR-008p, FR-020, FR-030, FR-041, FR-041a, FR-041b_
  - Success: summary model includes metadata, repository state, mode, status, counts, layer results, artifacts, classification, recommended action, and validates against schema before completion.
  - _Prompt: Implement the task for Spec Kit feature 001-evaluation-harness: Role=evidence model engineer. Task=build canonical summary JSON object and validation integration. Restrictions=JSON summary remains authoritative; schema validation failure produces `status: "error"` when possible. Leverage=T004 schema, T007 metadata, T009 validator, T012 recommended action. Requirements=FR-007, FR-008*, FR-020, FR-030, FR-041*. Success=summary examples validate and counts handle command-only layers. Workflow=set [-], search logs, implement, run targeted node checks, record completion evidence, then mark [x]._

- [x] 14. T014 [US2] Implement human-readable summary rendering.
  - Files: `evaluation/lib/summary-markdown.mjs`, `evaluation/reports/templates/summary.md.mjs`
  - _Requirements: FR-020, FR-020a, FR-020b_
  - Success: renderer writes `summary.md` with run metadata, layer result table, artifact links, ownership summary, and recommended next action for passed, failed, and errored runs.
  - _Prompt: Implement the task for Spec Kit feature 001-evaluation-harness: Role=reporting engineer. Task=implement summary.md renderer from summary and ownership data. Restrictions=do not make Markdown canonical over summary.json; keep artifact links relative to run directory. Leverage=T013 summary model and FR-020\*. Requirements=FR-020, FR-020a, FR-020b. Success=rendered summary is concise and stable for pass/fail/error examples. Workflow=set [-], search logs, implement, run renderer checks, record completion evidence, then mark [x]._

- [x] 15. T015 [US3] Implement ownership record generation and validation.
  - Files: `evaluation/lib/ownership.mjs`
  - _Requirements: FR-013, FR-042, FR-043_
  - Success: runner can emit `ownership.json` with behavior, owner layer, evidence, coveredBy, and migration recommendation for initial unit, integration, and E2E behaviors.
  - _Prompt: Implement the task for Spec Kit feature 001-evaluation-harness: Role=test ownership engineer. Task=generate and validate ownership records. Restrictions=do not overclaim migration readiness; keep records tied to evaluated behaviors only. Leverage=T004 ownership schema and plan Ownership Contract. Requirements=FR-013, FR-042, FR-043. Success=ownership output validates and summary renderer can consume it. Workflow=set [-], search logs, implement, run targeted checks, record completion evidence, then mark [x]._

- [x] 16. T016 [US1] Wire the runner end-to-end.
  - Files: `evaluation/bin/run-evaluation.mjs`
  - _Requirements: FR-003, FR-006, FR-007, FR-019, FR-021, FR-025, FR-026, FR-027, FR-027a, FR-028, FR-028a, FR-028b, FR-036, FR-040, FR-041, FR-048, NFR-004_
  - Success: CLI creates a run, executes planned layers, writes logs/artifacts/summary/ownership/summary.md, validates outputs, records `USE_DEPLOYED_SITE` target, and exits 0 only on selected-mode success.
  - _Prompt: Implement the task for Spec Kit feature 001-evaluation-harness: Role=runner integration engineer. Task=wire CLI, planner, executor, evidence, validation, and reports into the executable runner. Restrictions=do not implement repair mode; do not mutate files outside evaluation except existing tool transients; exit codes stay 0/1. Leverage=T006 through T015. Requirements=FR-003, FR-006, FR-007, FR-019, FR-025 through FR-028b, FR-040, FR-041, FR-048. Success=runner can dry-run or execute simple configured layers and write complete evidence. Workflow=set [-], search logs, implement, run targeted runner checks, record completion evidence, then mark [x]._

## Phase 3 - Evaluation Layers and Fixtures

- [x] 17. T017 [US3] Add the evaluation-local billing unit test.
  - Files: `evaluation/tests/unit/billing.test.mjs`
  - _Requirements: FR-012, FR-012a_
  - Success: Node test imports `calcTotalBill` from `src/lib/billing.js` and covers representative weekday/weekend/additional-plan behavior without modifying product modules.
  - _Prompt: Implement the task for Spec Kit feature 001-evaluation-harness: Role=unit test engineer. Task=add focused Node test for `calcTotalBill`. Restrictions=do not change product modules for importability; do not add broad utility coverage. Leverage=src/lib/billing.js and FR-012a. Requirements=FR-012, FR-012a. Success=`node --test evaluation/tests/unit/billing.test.mjs` can run the billing checks. Workflow=set [-], search logs, implement, run unit command if available, record completion evidence, then mark [x]._

- [x] 18. T018 [US3] Add the reservation form integration spec.
  - Files: `evaluation/tests/integration/reservation-form.spec.mjs`
  - _Requirements: FR-012, FR-012b_
  - Success: Playwright spec covers reservation form contact visibility, required/range validation, and total bill recalculation as page-local behavior.
  - _Prompt: Implement the task for Spec Kit feature 001-evaluation-harness: Role=Playwright integration test engineer. Task=add page-local reservation form integration coverage. Restrictions=avoid multi-page journeys unless required for setup; do not edit app pages. Leverage=existing reserve pages and plan Integration Layer. Requirements=FR-012, FR-012b. Success=spec runs through evaluation integration config and records product/test failure semantics. Workflow=set [-], search logs, implement, run targeted Playwright command if available, record completion evidence, then mark [x]._

- [x] 19. T019 [US1] Add smoke E2E coverage for localized routes and reservation completion.
  - Files: `evaluation/tests/e2e/smoke.spec.mjs`
  - _Requirements: FR-024, FR-024a, NFR-001_
  - Success: smoke spec includes thin top-page and reservation-entry checks for `en-US` and `ja`, plus at least one successful reservation completion happy path.
  - _Prompt: Implement the task for Spec Kit feature 001-evaluation-harness: Role=E2E smoke test engineer. Task=add minimal localized smoke journeys and one reservation completion path. Restrictions=keep smoke small; do not duplicate the full root E2E suite. Leverage=existing e2e route patterns and plan E2E Layer. Requirements=FR-024, FR-024a. Success=smoke spec runs through evaluation smoke config and covers the required happy path. Workflow=set [-], search logs, implement, run targeted Playwright command if available, record completion evidence, then mark [x]._

- [x] 20. T020 [US2] Add the controlled failing fixture.
  - Files: `evaluation/tests/fixtures/failing-layer.mjs`
  - _Requirements: FR-023b, FR-046, FR-047, FR-048_
  - Success: fixture intentionally exits non-zero or fails predictably; normal config does not run it; failing fixture config can run it for acceptance validation.
  - _Prompt: Implement the task for Spec Kit feature 001-evaluation-harness: Role=acceptance fixture engineer. Task=add controlled failing layer fixture. Restrictions=do not enable fixture in normal gate; do not commit generated failing run JSON. Leverage=T002 failing fixture config and baseline README. Requirements=FR-023b, FR-046, FR-047, FR-048. Success=fixture provides deterministic non-zero evidence path. Workflow=set [-], search logs, implement, run fixture command if safe, record completion evidence, then mark [x]._

## Phase 4 - Acceptance Validation

- [x] 21. T021 [US1] Validate gate mode.
  - Files: generated files under `evaluation/runs/<run-id>/` only
  - _Requirements: SC-001, SC-002, SC-008, FR-026, FR-036, NFR-001, NFR-002, NFR-003, NFR-004_
  - Success: `node evaluation/bin/run-evaluation.mjs --mode gate` exits 0 on a passing tree, writes valid `summary.json`, `summary.md`, `ownership.json`, logs, and expected artifacts under the run directory.
  - _Prompt: Implement the task for Spec Kit feature 001-evaluation-harness: Role=acceptance validation engineer. Task=run and inspect gate-mode acceptance. Restrictions=do not commit generated runs; if root tooling creates transients, document or move them under evaluation before release. Leverage=T016 runner and validation plan. Requirements=SC-001, SC-002, SC-008, FR-026. Success=gate evidence validates and no unexpected files outside evaluation remain. Workflow=set [-], search logs, run validation, record completion evidence with command results, then mark [x]._

- [x] 22. T022 [US1] Validate full and collect-all modes.
  - Files: generated files under `evaluation/runs/<run-id>/` only
  - _Requirements: FR-027, FR-027a, FR-028, FR-028a, FR-028b, FR-048_
  - Success: `--mode full` runs gate layers before full E2E, and `--mode collect-all` attempts independent eligible layers after earlier failures while recording dependency skips.
  - _Prompt: Implement the task for Spec Kit feature 001-evaluation-harness: Role=mode validation engineer. Task=validate full and collect-all behavior. Restrictions=do not commit generated runs; do not weaken mode semantics to pass validation. Leverage=T010 planner and T016 runner. Requirements=FR-027, FR-027a, FR-028, FR-028a, FR-028b, FR-048. Success=mode evidence matches plan and summary schema. Workflow=set [-], search logs, run validations, record completion evidence, then mark [x]._

- [x] 23. T023 [US2] Validate controlled failing fixture evidence.
  - Files: generated files under `evaluation/runs/<run-id>/` only
  - _Requirements: SC-003, FR-023b, FR-046, FR-047, FR-048_
  - Success: runner with failing fixture config exits 1, records failure logs/classification/recommended action, and matches expected outcome documented in `evaluation/baselines/README.md`.
  - _Prompt: Implement the task for Spec Kit feature 001-evaluation-harness: Role=failure acceptance engineer. Task=run controlled failing fixture validation. Restrictions=do not commit generated result JSON; do not leave fixture enabled in normal config. Leverage=T020 fixture and baseline docs. Requirements=SC-003, FR-023b, FR-046, FR-047, FR-048. Success=non-zero result is controlled, documented, and schema-valid. Workflow=set [-], search logs, run validation, record completion evidence, then mark [x]._

- [x] 24. T024 [US2] Validate deployed-target recording and final evidence consistency.
  - Files: generated files under `evaluation/runs/<run-id>/` only
  - _Requirements: FR-019, FR-040, FR-041, SC-004, SC-005, SC-007_
  - Success: `USE_DEPLOYED_SITE=true` run records target as `deployed`; final acceptance confirms no required file outside `evaluation/` was modified by default gate except documented existing tool transients.
  - _Prompt: Implement the task for Spec Kit feature 001-evaluation-harness: Role=final validation engineer. Task=validate deployed target recording and final evidence consistency. Restrictions=do not commit generated run output; do not add GitHub workflows; do not implement repair mode. Leverage=validation plan and all prior tasks. Requirements=FR-019, FR-040, FR-041, SC-004, SC-005, SC-007. Success=target metadata, exit codes, ownership evidence, and isolation checks pass. Workflow=set [-], search logs, run validation, record completion evidence, then mark [x]._

## Deferred Work

D001 [US4] Implement opt-in repair mode after gate, evidence, and classification are stable.

- Files: to be planned in a later implementation phase
- _Requirements: FR-014, FR-015, FR-016, FR-017, FR-018, SC-006_
- Status: deferred and intentionally excluded from the first implementation checklist.
