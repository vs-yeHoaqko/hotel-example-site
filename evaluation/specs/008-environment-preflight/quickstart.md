# Quickstart: Environment Preflight And CI Run Health Artifacts

## Run Preflight Directly

```sh
node evaluation/bin/check-environment.mjs
```

The command checks basic evaluation runtime capabilities without starting the
product app.

## Generate Run Health

```sh
node evaluation/bin/generate-run-health.mjs
```

The report should include preflight evidence for selected runs that have
`artifacts/environment-preflight.json`.

## Validate The Feature

```sh
node node_modules/prettier/bin/prettier.cjs --check .github/workflows/evaluation.yml evaluation/specs/008-environment-preflight evaluation/bin evaluation/config evaluation/lib evaluation/tests evaluation/reports evaluation/README.md
node --test evaluation/tests/unit/environment-preflight.test.mjs evaluation/tests/unit/run-health-model.test.mjs evaluation/tests/unit/run-health-report.test.mjs
node evaluation/bin/generate-run-health.mjs
node evaluation/bin/run-evaluation.mjs --mode gate
node evaluation/bin/run-evaluation.mjs --mode full
```

If local sandbox restrictions trigger `spawn EPERM` for Node's test runner,
rerun the same unit files with `--test-isolation=none` for local diagnosis, but
keep the canonical command unchanged.
