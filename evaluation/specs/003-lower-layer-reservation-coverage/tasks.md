# Tasks: Lower-Layer Reservation Coverage

**Spec**: `evaluation/specs/003-lower-layer-reservation-coverage/spec.md`
**Plan**: `evaluation/specs/003-lower-layer-reservation-coverage/plan.md`
**Planned Feature Branch**: `003-lower-layer-reservation-coverage`

## Tasks

- [x] 1. T001 Document the 003 scope and deferred screen-operation coverage.
  - Files:
    `evaluation/specs/003-lower-layer-reservation-coverage/spec.md`,
    `evaluation/specs/003-lower-layer-reservation-coverage/plan.md`
  - Success: spec states that current work adds lower-layer evidence only and
    defers unrelated uncovered UI operations.
  - Evidence: spec and plan define lower-layer evidence as the current scope
    and list unrelated screen-operation coverage as deferred.

- [x] 2. T002 Add localized reservation validation integration coverage.
  - Files: `evaluation/tests/integration/reservation-form.spec.mjs`
  - Success: integration tests cover the 18 previously blocked reservation
    validation assertion scopes.
  - Evidence:
    `node node_modules/@playwright/test/cli.js test --config evaluation/config/playwright.integration.config.mjs`
    passed 15 integration tests.

- [x] 3. T003 Update migration-candidate mapping for new evidence.
  - Files: `evaluation/config/migration-candidates.config.json`,
    `evaluation/lib/migration-candidate-model.mjs`
  - Success: all newly covered candidates name
    `evaluation/tests/integration/reservation-form.spec.mjs` as evidence.
  - Evidence:
    `node evaluation/bin/generate-migration-candidates.mjs` accepts the updated
    mapping and locale-specific integration evidence.

- [x] 4. T004 Regenerate stable migration-candidate report.
  - Files: `evaluation/reports/migration-candidates.md`
  - Success: report reflects the updated lower-layer evidence and has no
    remaining blocked candidates for the 18 covered assertion scopes.
  - Evidence: generated report counts are `ready_to_thin=28`,
    `blocked_missing_lower_layer=0`, and `keep_e2e=4`.

- [x] 5. T005 Validate formatting, integration coverage, and gate.
  - Files: `evaluation/.gitattributes`, generated run artifacts only under
    ignored `evaluation/runs/`
  - Success: Prettier, integration layer, and gate pass.
  - Evidence: integration layer passed 15 tests, and
    `node evaluation/bin/run-evaluation.mjs --mode gate` passed in
    `evaluation/runs/20260504T004127Z-003-lower-layer-reservation-coverage-ab6c18a`.
    `evaluation/.gitattributes` fixes evaluation checkout line endings to LF so
    the static layer remains reproducible on Windows.
