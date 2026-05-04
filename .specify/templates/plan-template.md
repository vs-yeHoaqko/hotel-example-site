# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from the active Spec Kit feature directory recorded in `.specify/feature.json`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

[Extract from feature spec: primary requirement + technical approach from research]

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: [e.g., Python 3.11, Swift 5.9, Rust 1.75 or NEEDS CLARIFICATION]
**Primary Dependencies**: [e.g., FastAPI, UIKit, LLVM or NEEDS CLARIFICATION]
**Storage**: [if applicable, e.g., PostgreSQL, CoreData, files or N/A]
**Testing**: [e.g., pytest, XCTest, cargo test or NEEDS CLARIFICATION]
**Target Platform**: [e.g., Linux server, iOS 15+, WASM or NEEDS CLARIFICATION]
**Project Type**: [e.g., library/cli/web-service/mobile-app/compiler/desktop-app or NEEDS CLARIFICATION]
**Performance Goals**: [domain-specific, e.g., 1000 req/s, 10k lines/sec, 60 fps or NEEDS CLARIFICATION]
**Constraints**: [domain-specific, e.g., <200ms p95, <100MB memory, offline-capable or NEEDS CLARIFICATION]
**Scale/Scope**: [domain-specific, e.g., 10k users, 1M LOC, 50 screens or NEEDS CLARIFICATION]

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- Evaluation assets and generated evidence stay under `evaluation/` unless the
  feature explicitly documents outside-file edits.
- Any outside-file edit states rationale, expected blast radius, and rollback
  path before implementation.
- Changes identify affected test layers and the evidence that proves
  completion.
- E2E thinning work names the migration candidates, lower-layer evidence,
  remaining E2E smoke coverage, and validation runs.
- Fork drift is minimized: outside-`evaluation/` edits are limited to the
  smallest necessary change, avoid unrelated formatting, and document conflict
  risk.
- Repair behavior remains non-mutating unless a later approved specification
  introduces auditable repair mode.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
笏懌楳笏 plan.md              # This file (/speckit-plan command output)
笏懌楳笏 research.md          # Phase 0 output (/speckit-plan command)
笏懌楳笏 data-model.md        # Phase 1 output (/speckit-plan command)
笏懌楳笏 quickstart.md        # Phase 1 output (/speckit-plan command)
笏懌楳笏 contracts/           # Phase 1 output (/speckit-plan command)
笏披楳笏 tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
# [REMOVE IF UNUSED] Option 1: Single project (DEFAULT)
src/
笏懌楳笏 models/
笏懌楳笏 services/
笏懌楳笏 cli/
笏披楳笏 lib/

tests/
笏懌楳笏 contract/
笏懌楳笏 integration/
笏披楳笏 unit/

# [REMOVE IF UNUSED] Option 2: Web application (when "frontend" + "backend" detected)
backend/
笏懌楳笏 src/
笏・  笏懌楳笏 models/
笏・  笏懌楳笏 services/
笏・  笏披楳笏 api/
笏披楳笏 tests/

frontend/
笏懌楳笏 src/
笏・  笏懌楳笏 components/
笏・  笏懌楳笏 pages/
笏・  笏披楳笏 services/
笏披楳笏 tests/

# [REMOVE IF UNUSED] Option 3: Mobile + API (when "iOS/Android" detected)
api/
笏披楳笏 [same as backend above]

ios/ or android/
笏披楳笏 [platform-specific structure: feature modules, UI flows, platform tests]
```

**Structure Decision**: [Document the selected structure and reference the real
directories captured above]

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation                  | Why Needed         | Simpler Alternative Rejected Because |
| -------------------------- | ------------------ | ------------------------------------ |
| [e.g., 4th project]        | [current need]     | [why 3 projects insufficient]        |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient]  |
