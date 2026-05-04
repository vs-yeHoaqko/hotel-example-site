# Research: Evaluation CI Gate

## Decision: Add a New Evaluation Workflow

**Rationale**: The repository already has Pages deployment and root Playwright
workflows. The evaluation harness has a distinct purpose and artifact model, so
a separate workflow keeps its gate, evidence, and future policy isolated.

**Alternatives considered**:

- Modify the existing Playwright workflow. Rejected because it runs root tests
  and deployed-site schedules with different semantics.
- Add evaluation commands to the Pages workflow. Rejected because deployment and
  evaluation evidence have different permissions and failure handling needs.

## Decision: Guard by Fork Repository Full Name

**Rationale**: The user explicitly required that this work affect only the
fork. A job-level repository condition is simple, reviewable, and independent
of branch names.

**Alternatives considered**:

- Rely only on pushing to `origin`. Rejected because workflow files can later be
  copied or proposed upstream.
- Use secrets as a guard. Rejected because the workflow should need no secrets.

## Decision: Upload Artifacts on Every Run Completion

**Rationale**: Feature 004 made failure diagnostics useful. CI must preserve
`summary.json`, `summary.md`, logs, and Playwright attachments for both passing
and failing runs.

**Alternatives considered**:

- Upload only on failure. Rejected because passing run evidence is useful when
  validating workflow setup.
- Commit summaries. Rejected because per-run artifacts are operational output
  and should remain uncommitted.

## Decision: Keep Full and Collect-All Manual

**Rationale**: Pull-request CI should provide quick feedback. `full` and
`collect-all` are valuable for deeper review and failure investigation but can
be slower.

**Alternatives considered**:

- Run full on every PR. Rejected because it duplicates the existing root
  Playwright workflow and increases latency.
- Add a schedule now. Rejected until the fork owner confirms desired cadence.
