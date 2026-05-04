# Quickstart: Evaluation CI Gate

## Local Validation

Run formatting checks:

```powershell
node node_modules/prettier/bin/prettier.cjs --check .github/workflows/evaluation.yml evaluation/specs/005-evaluation-ci evaluation/README.md
```

Run diagnostic unit tests:

```powershell
node --test evaluation/tests/unit/diagnostics.test.mjs evaluation/tests/unit/playwright-diagnostics.test.mjs evaluation/tests/unit/diagnostic-guidance.test.mjs evaluation/tests/unit/failure-classifier.test.mjs evaluation/tests/unit/summary-schema.test.mjs
```

Run the local gate:

```powershell
node evaluation/bin/run-evaluation.mjs --mode gate
```

## Fork-Only Remote Safety

Confirm remotes before pushing:

```powershell
git remote -v
```

Expected:

```text
origin   https://github.com/vs-yeHoaqko/hotel-example-site.git (push)
upstream DISABLED (push)
```

Push only to `origin`:

```powershell
git push -u origin 005-evaluation-ci
```

## GitHub Validation

After pushing to the fork:

1. Open the Actions tab in `vs-yeHoaqko/hotel-example-site`.
2. Confirm the `Evaluation Gate` workflow appears.
3. Run it manually with `mode=gate`, `target=local`.
4. Confirm the job uploads an evaluation artifact.
5. Open or update a pull request targeting the fork's `main` branch.
6. Confirm the pull request shows the evaluation gate result.

Do not open a pull request against `takeyaqa/hotel-example-site` unless the
explicit goal is to contribute upstream.
