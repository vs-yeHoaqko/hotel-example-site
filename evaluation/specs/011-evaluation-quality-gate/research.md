# Research: Evaluation Quality Gate and Harness Hardening

## Decision: Use Warning-First Quality Thresholds

Quality thresholds will record an enforcement level per metric: `warn` or `fail`. Initial thresholds default to `warn` unless existing evidence is stable enough to make a failure safe.

**Rationale**: The harness is still learning local and CI timing behavior. Warning-first rollout makes regressions visible without making the fork's CI brittle.

**Alternatives considered**:

- Fail all regressions immediately: rejected because timing and browser layers are still environment-sensitive.
- Keep reports informational only: rejected because it does not advance the harness from visibility to reviewable decisions.

## Decision: Store Run Health Baselines as Committed Evaluation Artifacts

Layer reference values will live under `evaluation/baselines/` and compare current selected run evidence against stable, reviewable values.

**Rationale**: Previous-run trends are useful but volatile. A committed baseline makes review intent explicit and avoids committing `evaluation/runs/` artifacts.

**Alternatives considered**:

- Derive baseline from the latest run: rejected because it changes silently.
- Download historical CI artifacts: rejected as broader operational scope than needed for this feature.

## Decision: Keep Failure Classification Advisory and Evidence-Cited

Diagnostics will map evidence to product-regression candidate, flaky evidence, environment evidence, harness-bug candidate, or `unknown`, then cite the evidence and recommended next action.

**Rationale**: Classification should reduce investigation time without hiding uncertainty. `unknown` remains a valid result when evidence is incomplete.

**Alternatives considered**:

- Single failure category per layer from static config only: rejected because it misses mixed signals within Playwright and preflight evidence.
- Automatic repair: rejected because the constitution requires non-mutating diagnostics before repair behavior.

## Decision: Treat E2E Thinning Execution as Evaluation-Owned Decisions

This feature will produce and validate thinning execution decisions under `evaluation/`, but it will not automatically rewrite root-suite E2E tests.

**Rationale**: Root-suite files are base-branch volatile. The safer next stage is to make approved-to-thin, blocked, deferred, and keep-e2e decisions explicit and evidence-linked.

**Alternatives considered**:

- Directly edit root E2E assertions now: rejected because it increases fork drift and should require explicit human-reviewed root-suite changes.
- Defer all thinning work: rejected because the harness already has reviewed candidates and can safely improve the decision artifact.

## Decision: Keep CI Changes Additive and Fork-Scoped

The existing fork guard remains unchanged. The workflow may add always-run report generation and upload paths for quality-gate evidence.

**Rationale**: CI artifacts are the main review surface for PR/main failures, but upstream must remain unaffected.

**Alternatives considered**:

- Require local-only verification: rejected because reviewers would lose CI evidence.
- Remove the fork guard: rejected because the repository is a fork and upstream behavior must not be affected.
