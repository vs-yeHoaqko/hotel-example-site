# Data Model: Environment Preflight And CI Run Health Artifacts

## Preflight Check Result

Fields:

- `id`: stable check identifier.
- `label`: human-readable check name.
- `status`: `passed` or `failed`.
- `classification`: `environment` for failed environment checks.
- `message`: concise result or failure message.
- `guidance`: recommended human action.
- `details`: optional structured values such as command path or executable
  path.

Validation rules:

- Failed checks must include `classification: "environment"`.
- Messages must not include secrets or local-only absolute paths unless they
  are required for diagnosis.

## Preflight Artifact

Fields:

- `schemaVersion`
- `status`
- `startedAt`
- `finishedAt`
- `durationMs`
- `checks`

Validation rules:

- `status` is `passed` only when every check passed.
- The artifact is written to the current run directory as
  `artifacts/environment-preflight.json`.

## Environment Layer

Fields:

- `name`: `environment`.
- `required`: true.
- `modes`: `gate`, `full`, and `collect-all`.
- `classification`: `environment` when failed.
- `artifacts`: stdout, stderr, and preflight JSON.

Validation rules:

- The layer must execute before all product/test behavior layers.
- A failed required environment layer stops later layers outside `collect-all`.

## Run Health Environment Evidence

Fields:

- `runId`
- `layer`
- `kind`
- `title`
- `status`
- `classification`
- `artifactPath`
- `messages`

Validation rules:

- Preflight failed checks appear in environment evidence.
- Passing preflight artifacts appear in preflight evidence but not in
  instability evidence.
- Empty environment evidence renders an explicit no-environment-evidence
  statement.

## CI Health Artifact

Fields:

- Uploaded run artifact paths.
- Uploaded report artifact paths.
- Workflow job status remains based on the evaluation command.

Validation rules:

- Report generation uses `if: always()`.
- Artifact upload includes `evaluation/runs/**` and `evaluation/reports/run-health.md`.
