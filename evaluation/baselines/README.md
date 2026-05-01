# Evaluation Baselines

Generated run directories under `evaluation/runs/` are operational artifacts and
are not committed by default.

The controlled failing fixture is documented here as a stable acceptance note
rather than as generated result JSON.

Run:

```sh
node evaluation/bin/run-evaluation.mjs --mode gate --config evaluation/config/failing-fixture.config.json
```

Expected result:

- process exit code `1`
- one required layer named `controlled-failing-fixture`
- layer status `failed`
- classification `test`
- recommended next action `inspect_test`
- logs and summaries written under the generated run directory
