# Research: E2E Assertion Thinning

## Decision: Store canonical thinning outcomes in a separate JSON config

Use `evaluation/config/thinning-decisions.config.json` as the canonical
machine-readable decision record. Each entry references a migration
`candidateId` and records an outcome, reason, outside-file impact, evidence
references, and validation notes.

**Rationale**: The existing `migration-candidates.config.json` is already a
large inventory file. Keeping outcomes in a separate file reduces churn,
preserves the original candidate mapping, and makes implementation decisions
easy to review. It also keeps the canonical data under `evaluation/`, matching
the clarification decision.

**Alternatives considered**:

- Add outcome fields directly to each candidate in
  `migration-candidates.config.json`: rejected because it would create a broad
  diff across the mapping file and mix inventory with implementation outcome.
- Treat `migration-candidates.md` as canonical: rejected because Markdown is
  harder to validate and consume in later automation.

## Decision: Extend the existing migration report pipeline

Load the thinning decision data in the existing migration-candidate model and
render decision outcomes in `evaluation/reports/migration-candidates.md`.

**Rationale**: The current report is already the human review surface for E2E
ownership. Extending it keeps one report path and lets future maintainers see
readiness and implementation outcome together.

**Alternatives considered**:

- Add a separate `thinning-decisions.md`: rejected because it splits one review
  question across two reports.
- Use only git diff as outcome evidence: rejected because it is not stable,
  machine-readable, or connected to candidate IDs.

## Decision: Preserve root E2E structure and titles

Do not split, rename, reorder, or broadly format root E2E tests. Remove or
reduce only target assertion statements tied to reviewed candidate IDs.

**Rationale**: This repository is a fork. Preserving file shape reduces merge
conflicts with upstream and keeps diffs focused on the intended thinning.

**Alternatives considered**:

- Split test cases into smoke and detail tests: rejected for this feature
  because it increases fork drift and changes test identity.
- Skip tests or comment out blocks: rejected because it hides behavior instead
  of recording an explicit thinning decision.

## Decision: Defer unsafe candidates rather than adding new coverage

If implementation review finds that a candidate's lower-layer evidence is not
sufficient, record that candidate as `deferred` and leave the root E2E
assertion in place.

**Rationale**: The feature is scoped to thinning already-reviewed candidates.
Adding lower-layer coverage for newly discovered gaps would expand scope and
make root E2E edits harder to review.

**Alternatives considered**:

- Add missing lower-layer tests immediately: rejected for this feature because
  it expands scope and increases implementation risk.
- Thin anyway and add evidence later: rejected because it breaks
  evidence-preserving thinning.

## Decision: Require `gate` and `full` validation

Run both `node evaluation/bin/run-evaluation.mjs --mode gate` and
`node evaluation/bin/run-evaluation.mjs --mode full` after thinning.
`collect-all` remains optional for failure investigation.

**Rationale**: `gate` proves lower-layer evidence and smoke coverage. `full`
proves the root E2E suite still passes after assertion thinning. `collect-all`
is useful when failures occur but adds unnecessary routine cost.

**Alternatives considered**:

- Require only `gate`: rejected because root E2E files are being edited.
- Require `collect-all` every time: rejected because it is operationally heavier
  and duplicates successful validation when `gate` and `full` pass.

## Decision: Treat `e2e/en-US/reserve.spec.ts` and `e2e/ja/reserve.spec.ts` as the only planned outside files

Only the two root reservation E2E files may be edited outside `evaluation/`.
All other implementation files and decision artifacts stay under `evaluation/`.

**Rationale**: The migration-candidate scope is reservation/billing overlap.
Limiting outside edits to the two target files minimizes fork drift and makes
review boundaries explicit.

**Alternatives considered**:

- Edit additional root E2E suites opportunistically: rejected because they are
  outside the reviewed candidate inventory.
- Move root E2E helpers or shared setup: rejected because it would restructure
  upstream-owned tests.
