# Quickstart: CI Health Trends and Test Meaningfulness

Generate the run health report:

```powershell
node evaluation/bin/generate-run-health.mjs
```

Generate the test meaningfulness report:

```powershell
node evaluation/bin/generate-test-meaningfulness.mjs
```

Run focused unit tests:

```powershell
node --test evaluation/tests/unit/run-health-model.test.mjs evaluation/tests/unit/run-health-report.test.mjs evaluation/tests/unit/test-meaningfulness-model.test.mjs
```

Run the evaluation gate:

```powershell
node evaluation/bin/run-evaluation.mjs --mode gate
```

Expected report outputs:

- `evaluation/reports/run-health.md`
- `evaluation/reports/test-meaningfulness.md`

Generated run artifacts under `evaluation/runs/` remain uncommitted.
