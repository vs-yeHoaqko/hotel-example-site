# Quickstart: Slow and Flaky Evidence Report

## Generate The Report

```sh
node evaluation/bin/generate-run-health.mjs
```

The command reads existing evidence under `evaluation/runs/` and writes:

```text
evaluation/reports/run-health.md
```

It does not run `gate`, `full`, Playwright, webpack, or the product server.

## Validate The Feature

```sh
node node_modules/prettier/bin/prettier.cjs --check evaluation/specs/007-slow-flaky-evidence evaluation/config evaluation/lib evaluation/tests evaluation/reports evaluation/README.md
node --test evaluation/tests/unit/run-health-model.test.mjs evaluation/tests/unit/run-health-report.test.mjs
node evaluation/bin/generate-run-health.mjs
node evaluation/bin/run-evaluation.mjs --mode gate
node evaluation/bin/run-evaluation.mjs --mode full
```

## Interpret The Report

- `Slow Layers` identifies evaluation layers whose duration exceeds the
  configured review threshold.
- `Slow Tests` identifies the slowest Playwright test observations when JSON
  result artifacts contain per-test durations.
- `Instability Evidence` identifies failed, timed-out, interrupted,
  unexpected, or retried test evidence.
- `Environment Evidence` keeps tooling, sandbox, browser install, and process
  failures separate from product/test behavior evidence.
- `Warnings` lists unreadable summaries, missing artifacts, malformed JSON, or
  incomplete evidence.

`evaluation/runs/` remains generated operational evidence and should stay
ignored. Commit only stable report guidance under `evaluation/reports/` when it
is useful for review.
