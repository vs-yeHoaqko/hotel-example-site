# Contract: Adapter State

## Purpose

Adapter state records how a repository maps onto the common evaluation harness
process. It must be durable enough for later humans or agents to continue
without relying on chat history.

## State File

Planned default path:

```text
evaluation/config/harness-adapter.json
```

An example file is planned at:

```text
evaluation/config/harness-adapter.example.json
```

## Required Top-Level Fields

| Field             | Required | Notes                                                                           |
| ----------------- | -------- | ------------------------------------------------------------------------------- |
| `schemaVersion`   | Yes      | Must be `1`                                                                     |
| `repository`      | Yes      | Repository label, root, package manager, and discovery timestamp                |
| `layers`          | Yes      | Evidence layer adapter records                                                  |
| `targets`         | Yes      | Local/deployed/browser target policy; may be empty when no browser layer exists |
| `artifacts`       | Yes      | Run/report paths and ignore status                                              |
| `behaviorMapping` | Yes      | Mapping status, including unknown/unmapped states                               |
| `ownership`       | Yes      | Owner-layer policy or explicit unknown/deferred status                          |
| `qualityPolicy`   | Yes      | Warning-first/fail-enforced posture and thresholds                              |
| `ciPolicy`        | Yes      | GitHub Actions, other provider, local-only, or deferred                         |
| `governance`      | Yes      | Allowed edit boundary and rollback policy                                       |
| `decisions`       | Yes      | Confirmed, inferred, overridden, and deferred decisions                         |

## Provenance

Every meaningful value must include provenance:

- `discovered`: read from repository files with a cited source path
- `inferred`: derived from discovered facts but not yet confirmed
- `confirmed`: accepted by the maintainer
- `overridden`: maintainer replaced a suggestion; rationale required
- `deferred`: intentionally unresolved; next action required

## Acceptance Rules

- At least one non-deferred layer is required before first evidence readiness.
- Browser layers require a target policy.
- Artifact paths must identify whether generated paths are ignored.
- CI absence is valid only when `ciPolicy.mode` is `local-only` or `deferred`.
- Unknown behavior mapping must remain visible and cannot be counted as covered.
- Ownership gaps block thinning readiness but do not block first evidence.
- Existing confirmed or overridden decisions must not be silently overwritten by
  later discovery.
