# Environment Preflight Contract

## Command

```sh
node evaluation/bin/check-environment.mjs
```

The command reads `EVALUATION_RUN_DIR` when present and writes:

```text
<EVALUATION_RUN_DIR>/artifacts/environment-preflight.json
```

When `EVALUATION_RUN_DIR` is not set, it writes under:

```text
evaluation/runs/manual/artifacts/environment-preflight.json
```

The command exits `0` when all checks pass and non-zero when any check fails.

## Artifact Shape

```json
{
  "schemaVersion": 1,
  "status": "passed",
  "startedAt": "2026-05-04T00:00:00.000Z",
  "finishedAt": "2026-05-04T00:00:01.000Z",
  "durationMs": 1000,
  "checks": [
    {
      "id": "node-spawn",
      "label": "Subprocess spawn",
      "status": "passed",
      "classification": null,
      "message": "Subprocess spawn is available.",
      "guidance": "No action required.",
      "details": {}
    }
  ]
}
```

Failed checks must use:

```json
{
  "status": "failed",
  "classification": "environment"
}
```

## Evaluation Config Contract

The first layer in `evaluation/config/evaluation.config.json` must be:

```json
{
  "name": "environment",
  "required": true,
  "modes": ["gate", "full", "collect-all"],
  "timeoutMs": 30000,
  "failureClassification": "environment"
}
```

## CI Contract

The fork-scoped workflow must:

- keep `if: ${{ github.repository == 'vs-yeHoaqko/hotel-example-site' }}`;
- run `node evaluation/bin/generate-run-health.mjs` after evaluation with
  `if: ${{ always() }}`;
- include `evaluation/reports/run-health.md` in the uploaded artifact paths.
