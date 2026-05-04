# Data Model: Evaluation CI Gate

## CI Evaluation Run

Represents one repository-hosted evaluation harness execution.

| Field      | Type   | Notes                                      |
| ---------- | ------ | ------------------------------------------ |
| repository | string | Must be the user's fork for this workflow  |
| event      | string | Pull request, push, or manual dispatch     |
| mode       | enum   | `gate`, `full`, or `collect-all`           |
| target     | enum   | `local` or `deployed` metadata             |
| status     | enum   | Passed, failed, cancelled, or setup failed |
| evidence   | array  | Uploaded evaluation artifact paths         |

## Evaluation Evidence Artifact

Downloadable CI artifact containing generated evaluation output.

| Field         | Type   | Notes                                                |
| ------------- | ------ | ---------------------------------------------------- |
| name          | string | Includes workflow run identity                       |
| sourcePath    | string | `evaluation/runs/**`                                 |
| retentionDays | number | Bounded retention for operational evidence           |
| missingPolicy | enum   | Warn when no files exist rather than hiding failures |
| includedFiles | array  | Summaries, logs, ownership, Playwright artifacts     |

## Fork Boundary

Safety rule that prevents CI impact outside the user's fork.

| Field              | Type   | Notes                                  |
| ------------------ | ------ | -------------------------------------- |
| expectedRepository | string | `vs-yeHoaqko/hotel-example-site`       |
| actualRepository   | string | Repository where the workflow is run   |
| behavior           | enum   | Run when matched, skip when mismatched |
