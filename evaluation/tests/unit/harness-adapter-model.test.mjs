import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  assertAdapterState,
  createAdapterDraft,
  loadAdapterState,
  mergeAdapterState,
} from "../../lib/harness-adapter-model.mjs";
import { createTempRepo, writeJson } from "../fixtures/run-health-fixtures.mjs";

test("validates the committed adapter example", async () => {
  const example = JSON.parse(
    await readFile("evaluation/config/harness-adapter.example.json", "utf8"),
  );

  await assert.doesNotReject(() => assertAdapterState(example, "example"));
});

test("rejects missing required fields and invalid provenance", async () => {
  await assert.rejects(
    () => assertAdapterState({ schemaVersion: 1 }, "bad-adapter"),
    /required property is missing/,
  );

  const repoRoot = await createTempRepo();
  await writeJson(repoRoot, "evaluation/config/harness-adapter.json", {
    ...validState(),
    repository: {
      ...validState().repository,
      packageManager: {
        value: "pnpm",
        source: "guessed",
      },
    },
  });

  await assert.rejects(
    () =>
      loadAdapterState("evaluation/config/harness-adapter.json", { repoRoot }),
    /packageManager.source must be one of/,
  );
});

test("requires rationale for deferred decisions", async () => {
  await assert.rejects(
    () =>
      assertAdapterState(
        {
          ...validState(),
          decisions: [
            {
              id: "defer-without-rationale",
              topic: "CI",
              source: "deferred",
              status: "deferred",
              rationale: "",
            },
          ],
        },
        "adapter",
      ),
    /rationale is required/,
  );
});

test("creates adapter draft with discovered layers and visible unknowns", () => {
  const draft = createAdapterDraft({
    discovery: {
      facts: [
        fact("package-manager", "pnpm", "package.json"),
        fact("tool", "node", "process.version"),
        fact("script", "fmt:check", "package.json"),
        fact("test-root", "evaluation/tests/unit", "evaluation/tests/unit"),
        fact("ignore-rule", "evaluation/runs", ".gitignore"),
      ],
    },
    now: "2026-05-18T00:00:00.000Z",
  });

  assert.equal(draft.state.repository.packageManager.value, "pnpm");
  assert.deepEqual(
    draft.state.layers.map((layer) => layer.name),
    ["environment", "static", "unit"],
  );
  assert.equal(draft.state.artifacts.runDirectory.ignored, true);
  assert.equal(draft.state.behaviorMapping.status, "unknown");
});

test("merges existing state without overwriting confirmed layer commands", () => {
  const existingState = {
    ...validState(),
    layers: [
      {
        name: "unit",
        kind: "unit",
        command: ["node", "--test", "custom/unit"],
        required: true,
        status: "confirmed",
        source: "confirmed",
      },
    ],
  };
  const proposedState = {
    ...validState(),
    layers: [
      {
        name: "unit",
        kind: "unit",
        command: ["node", "--test", "evaluation/tests/unit"],
        required: true,
        status: "inferred",
        source: "inferred",
      },
    ],
  };

  const result = mergeAdapterState({ existingState, proposedState });

  assert.deepEqual(result.state.layers[0].command, [
    "node",
    "--test",
    "custom/unit",
  ]);
  assert.equal(result.conflicts[0].id, "layer-unit-command-conflict");
  assert.equal(
    result.state.decisions.some(
      (decision) => decision.id === "layer-unit-command-conflict",
    ),
    true,
  );
});

test("preserves overridden and deferred policy decisions", () => {
  const existingState = {
    ...validState(),
    ciPolicy: {
      mode: "local-only",
      status: "confirmed",
      source: "overridden",
      provider: "none",
      rationale: "CI intentionally disabled.",
    },
    behaviorMapping: {
      status: "unknown",
      source: "deferred",
      nextAction: "Review later.",
    },
  };
  const proposedState = {
    ...validState(),
    ciPolicy: {
      mode: "github-actions",
      status: "inferred",
      source: "inferred",
      provider: "github-actions",
    },
    behaviorMapping: {
      status: "confirmed",
      source: "inferred",
    },
  };

  const result = mergeAdapterState({ existingState, proposedState });

  assert.equal(result.state.ciPolicy.mode, "local-only");
  assert.equal(result.state.behaviorMapping.source, "deferred");
});

function validState(overrides = {}) {
  return {
    schemaVersion: 1,
    repository: {
      root: ".",
      discoveredAt: "2026-05-18T00:00:00.000Z",
      packageManager: {
        value: "pnpm",
        source: "confirmed",
        sourcePath: "package.json",
      },
    },
    layers: [
      {
        name: "unit",
        kind: "unit",
        command: ["node", "--test", "evaluation/tests/unit"],
        required: true,
        status: "confirmed",
        source: "confirmed",
      },
    ],
    targets: [],
    artifacts: {
      runDirectory: {
        path: "evaluation/runs",
        source: "confirmed",
        ignored: true,
      },
      reports: [],
    },
    behaviorMapping: {
      status: "unknown",
      source: "deferred",
      nextAction: "Review mapping.",
    },
    ownership: {
      status: "unknown",
      source: "deferred",
      nextAction: "Review ownership.",
    },
    qualityPolicy: {
      status: "confirmed",
      source: "confirmed",
      enforcement: "warning-first",
    },
    ciPolicy: {
      mode: "local-only",
      status: "confirmed",
      source: "confirmed",
      provider: "none",
    },
    governance: {
      allowedEditBoundary: ["evaluation/"],
      rollback: "Remove adapter.",
      source: "confirmed",
    },
    decisions: [],
    ...overrides,
  };
}

function fact(type, value, sourcePath) {
  return {
    id: `${type}-${value}`,
    type,
    value,
    sourcePath,
    confidence: "high",
    status: "discovered",
  };
}
