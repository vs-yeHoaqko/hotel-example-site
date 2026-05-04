import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { validateAgainstSchema } from "../../lib/schema-validator.mjs";
import { createSummary } from "../../lib/summary-model.mjs";

const repoRoot = process.cwd();

test("summary example validates against the committed schema", async () => {
  const schema = JSON.parse(
    await readFile("evaluation/schemas/summary.schema.json", "utf8"),
  );
  const example = JSON.parse(
    await readFile("evaluation/examples/summary.example.json", "utf8"),
  );

  const result = validateAgainstSchema(example, schema);

  assert.deepEqual(result.errors, []);
  assert.equal(result.valid, true);
});

test("generated passed summaries validate with diagnostics as an empty array", async () => {
  const summary = await createSummary({
    mode: "gate",
    target: "local",
    runId: "schema-passed",
    repository: {
      branch: "schema",
      commit: "abcdef0",
      dirty: false,
      changedFiles: [],
    },
    startedAt: "2026-05-04T00:00:00.000Z",
    finishedAt: "2026-05-04T00:00:01.000Z",
    layers: [
      {
        name: "static",
        required: true,
        status: "passed",
        command: {
          configuredArgv: ["node", "node_modules/prettier/bin/prettier.cjs"],
          executedArgv: ["node", "node_modules/prettier/bin/prettier.cjs"],
          env: {},
          display:
            "node node_modules/prettier/bin/prettier.cjs --check evaluation",
        },
        exitCode: 0,
        durationMs: 10,
        timedOut: false,
        skippedReason: null,
        counts: { passed: 1, failed: 0, skipped: 0, timeout: 0 },
        classification: null,
        artifacts: ["logs/static.stdout.log", "logs/static.stderr.log"],
      },
    ],
    repoRoot,
    runDirRel: "evaluation/runs/schema-passed",
  });

  assert.deepEqual(summary.diagnostics, []);
});
