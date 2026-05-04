# Contract: Thinning Execution

## Inputs

- `evaluation/config/migration-candidates.config.json`
- `evaluation/config/thinning-decisions.config.json`
- Lower-layer evidence referenced by reviewed candidates.
- Existing keep-e2e anchors.

## Outputs

- `evaluation/reports/thinning-execution.md`
- Quality gate findings for blocked, deferred, approved-to-thin, and keep-e2e decisions.

## Decision States

- `approved_to_thin`: Candidate has lower-layer evidence and review approval.
- `blocked`: Candidate lacks required lower-layer evidence or has unresolved risk.
- `deferred`: Candidate is valid but intentionally postponed.
- `keep_e2e`: Candidate must remain browser-level coverage.

## Safety Rules

- `approved_to_thin` requires lower-layer evidence.
- `keep_e2e` anchors cannot be changed by report generation.
- Root-suite source edits require an explicit implementation task that names the file and candidate.
- Report generation must never rewrite root-suite E2E files.
