# Contract: Readiness Validation

## Purpose

Readiness validation checks whether adapter state is safe to use for the next
onboarding stage. It should be repeatable and non-interactive.

## Planned Command Behavior

```powershell
node evaluation/bin/validate-harness-adapter.mjs
node evaluation/bin/validate-harness-adapter.mjs --config evaluation/config/harness-adapter.json
node evaluation/bin/validate-harness-adapter.mjs --no-write-report
```

## Findings

Each finding must include:

- stable `id`
- `status`: `pass`, `warning`, `unknown`, or `blocked`
- affected onboarding `stage`
- message
- evidence reference
- next action for non-pass statuses
- optional semantic qualifier such as `weak-signal` or `unmapped`

## Required Checks

| Check              | Blocking Result                                   | Warning/Unknown Result                 |
| ------------------ | ------------------------------------------------- | -------------------------------------- |
| Adapter file shape | Missing or invalid schema                         | Optional sections partial              |
| Runnable layers    | No non-deferred layer                             | Some optional layers deferred          |
| Commands           | Required layer command missing                    | Command inferred but unconfirmed       |
| Browser targets    | Browser layer lacks target policy                 | Target inferred from config only       |
| Artifact policy    | Generated run/report paths could be committed     | Ignore coverage inferred only          |
| Behavior mapping   | Coverage is claimed without mapping               | Mapping unknown/unmapped               |
| Ownership          | Required for thinning but absent                  | Ownership inferred from weak signals   |
| Quality policy     | Fail-enforced threshold lacks evidence            | Warning-first threshold pending review |
| CI policy          | CI assumed without provider/guard/artifacts       | CI absent but local-only is explicit   |
| Governance         | Outside-file changes are allowed without rollback | Boundary stated but not yet reviewed   |

## Report Behavior

Validation writes a human-readable readiness report by default. The report must
show:

- overall readiness status
- current onboarding stage
- blocking findings first
- warnings and unknowns grouped by stage
- next recommended action
- visible CI policy status
- explicit non-goals for CI workflow generation, E2E thinning, and repair

## Exit Behavior

- Exit success when there are no `blocked` findings.
- Exit failure when one or more `blocked` findings exist.
- Warnings and unknowns do not fail the command, but must be visible in the
  report.
