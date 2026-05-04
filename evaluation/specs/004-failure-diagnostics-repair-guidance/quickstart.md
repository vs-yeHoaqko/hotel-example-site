# Quickstart: Failure Diagnostics and Repair Guidance

## After Implementation

1. Run diagnostic unit tests:

   ```powershell
   node --test evaluation/tests/unit/diagnostics.test.mjs evaluation/tests/unit/playwright-diagnostics.test.mjs evaluation/tests/unit/diagnostic-guidance.test.mjs evaluation/tests/unit/failure-classifier.test.mjs evaluation/tests/unit/summary-schema.test.mjs
   ```

2. Run the evaluation gate:

   ```powershell
   node evaluation/bin/run-evaluation.mjs --mode gate
   ```

3. Open the generated run directory printed by the command.

4. Confirm a passing run writes:

   ```json
   "diagnostics": []
   ```

5. Run the controlled failing fixture:

   ```powershell
   node evaluation/bin/run-evaluation.mjs --mode gate --config evaluation/config/failing-fixture.config.json
   ```

6. Confirm `summary.json` includes diagnostic entries with:
   - `type` as `test_case`, `layer_command`, or `runner_error`
   - existing `classification` enum values
   - `confidence` as `low`, `medium`, or `high`
   - relative artifact paths
   - advisory reproduction display strings
   - non-mutating guidance with rationale

7. Confirm `summary.md` renders a concise `Failure Diagnostics` section and
   links raw artifacts instead of embedding long logs.

8. Run formatting checks for evaluation paths:

   ```powershell
   node node_modules/prettier/bin/prettier.cjs --check evaluation
   ```

9. Confirm `evaluation/runs/` remains uncommitted.
