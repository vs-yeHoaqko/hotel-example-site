# Contract: Onboarding Flow

## Purpose

The onboarding flow guides a maintainer through adapter authoring without
requiring prior knowledge of the evaluation-harness process.

## Stages

| Stage                      | Goal                          | Output                                                          | Stop Condition                      |
| -------------------------- | ----------------------------- | --------------------------------------------------------------- | ----------------------------------- |
| `discover`                 | Inspect repository facts      | Discovery facts with sources and confidence                     | Repository root cannot be inspected |
| `classify`                 | Map facts to harness concepts | Candidate layer, target, artifact, CI, and governance decisions | No runnable layer can be proposed   |
| `configure`                | Build adapter state           | Draft state with confirmed/inferred/deferred values             | Required fields are contradictory   |
| `validate`                 | Check readiness               | Findings and readiness summary                                  | Blocked findings remain unresolved  |
| `ready-for-first-evidence` | Allow first evidence planning | Adapter state accepted for runner use                           | N/A                                 |
| `deferred`                 | Preserve partial progress     | State with visible gaps and next actions                        | N/A                                 |

## Prompt Behavior

- Ask only for decisions that cannot be inferred safely.
- Present discovered/inferred values before asking for confirmation.
- Always allow a safe defer choice for uncertain mapping, ownership, CI, or
  thinning-related decisions.
- Require rationale for overrides and deferrals.
- Never present CI workflow creation, evidence execution, repair, or E2E
  thinning as ready until validation allows it.

## Dry-Run Behavior

Dry-run must show:

- discovered facts
- proposed adapter changes
- pending questions
- conflicts with existing state
- whether writing state would be safe

Dry-run must not write adapter state or reports.

## Write Behavior

Write mode may create or update adapter state under `evaluation/config/`.
When existing confirmed or overridden decisions conflict with discovery, write
mode must preserve the saved value and record a conflict finding rather than
silently replacing it.

## Non-Goals

- Do not run the evaluation harness.
- Do not generate or edit CI workflows.
- Do not edit product files, root package scripts, root browser-test config, or
  root E2E tests.
- Do not thin E2E tests.
- Do not run repair mode.
