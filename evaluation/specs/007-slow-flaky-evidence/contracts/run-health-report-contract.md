# Run Health Report Contract

## Command

```sh
node evaluation/bin/generate-run-health.mjs
```

Optional flags:

- `--config <path>`: use an alternate config JSON file.
- `--runs-dir <path>`: override the input runs directory.
- `--output <path>`: override the report output path.
- `--max-runs <number>`: override the number of selected readable runs.

The command must not run product tests or start the application server.

## Input Contract

Primary input:

```text
evaluation/runs/<run-id>/summary.json
```

Optional layer artifacts referenced by summary layers:

```text
evaluation/runs/<run-id>/<artifact-json-path>
```

Expected summary fields:

```json
{
  "schemaVersion": 1,
  "runId": "20260504T051530Z-006-e2e-thinning-a45d9f5",
  "mode": "full",
  "target": "local",
  "repository": {
    "branch": "006-e2e-thinning",
    "commit": "a45d9f5",
    "dirty": true
  },
  "startedAt": "2026-05-04T05:15:30.640Z",
  "finishedAt": "2026-05-04T05:17:35.083Z",
  "status": "passed",
  "layers": []
}
```

## Output Contract

Default output:

```text
evaluation/reports/run-health.md
```

Required sections:

- `Metadata`
- `Selected Runs`
- `Slow Layers`
- `Slow Tests`
- `Instability Evidence`
- `Environment Evidence`
- `Warnings`
- `Recommended Review Focus`

Required report properties:

- Include selected run IDs.
- Include source summary paths.
- Include Playwright artifact paths used for per-test evidence.
- State when no flaky evidence was observed.
- Sort output deterministically.
- Render malformed or missing artifact information as warnings.

## Failure Contract

The command exits successfully when at least one report can be rendered, even
if some run artifacts are missing or malformed. It exits non-zero only when the
configuration is invalid or the report cannot be written.
