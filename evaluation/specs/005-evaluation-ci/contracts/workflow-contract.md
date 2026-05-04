# Workflow Contract: Evaluation CI Gate

## Workflow Identity

- Name: `Evaluation Gate`
- File: `.github/workflows/evaluation.yml`
- Repository boundary: must run only when
  `github.repository == 'vs-yeHoaqko/hotel-example-site'`

## Automatic Triggers

- `pull_request` targeting `main`
- `push` to `main`

Automatic runs use:

- mode: `gate`
- target: `local`

## Manual Trigger

Manual runs expose:

| Input    | Values                        | Default |
| -------- | ----------------------------- | ------- |
| `mode`   | `gate`, `full`, `collect-all` | `gate`  |
| `target` | `local`, `deployed`           | `local` |

## Permissions

The workflow token must use read-only repository contents permission.

## Required Evidence

The workflow must attempt to upload:

```text
evaluation/runs/**
```

Artifact upload behavior:

- runs even when evaluation fails
- warns if no files exist
- uses bounded retention

## Non-Goals

- No deployment
- No repair mode
- No write permission
- No upstream repository mutation
- No changes to product source or root package scripts
