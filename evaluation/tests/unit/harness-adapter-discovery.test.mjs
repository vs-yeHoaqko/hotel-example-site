import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import test from "node:test";
import {
  discoverRepository,
  findFacts,
  summarizeDiscovery,
} from "../../lib/harness-adapter-discovery.mjs";
import {
  createAdapterDraft,
  mergeAdapterState,
} from "../../lib/harness-adapter-model.mjs";
import {
  createTempRepo,
  writeJson,
  writeRawFile,
} from "../fixtures/run-health-fixtures.mjs";

test("discovers package scripts, test roots, CI files, ignore rules, and Playwright hints", async () => {
  const repoRoot = await createTempRepo();
  await writeJson(repoRoot, "package.json", {
    scripts: {
      "fmt:check": "prettier --check .",
      test: "node --test",
    },
    devEngines: {
      packageManager: [{ name: "pnpm" }],
    },
  });
  await mkdir(`${repoRoot}/evaluation/tests/unit`, { recursive: true });
  await writeRawFile(
    repoRoot,
    ".github/workflows/evaluation.yml",
    "name: test\n",
  );
  await writeRawFile(repoRoot, ".gitignore", "evaluation/runs/\n");
  await writeRawFile(
    repoRoot,
    "evaluation/config/playwright.integration.config.mjs",
    "export default {};\n",
  );

  const discovery = await discoverRepository({ repoRoot });
  const summary = summarizeDiscovery(discovery);

  assert.equal(findFacts(discovery, "package-manager")[0].value, "pnpm");
  assert.equal(findFacts(discovery, "script").length, 2);
  assert.equal(
    findFacts(discovery, "test-root")[0].value,
    "evaluation/tests/unit",
  );
  assert.equal(findFacts(discovery, "ci-file")[0].value, "github-actions");
  assert.equal(findFacts(discovery, "ignore-rule")[0].value, "evaluation/runs");
  assert.equal(
    findFacts(discovery, "config-file").some(
      (fact) =>
        fact.value === "evaluation/config/playwright.integration.config.mjs",
    ),
    true,
  );
  assert.equal(summary.testRoots, 1);
});

test("falls back to unknown package manager when package.json is absent", async () => {
  const repoRoot = await createTempRepo();
  const discovery = await discoverRepository({ repoRoot });

  assert.equal(findFacts(discovery, "package-manager")[0].value, "unknown");
});

test("adapter merge reports conflicts for saved scripts and artifact paths", () => {
  const existing = createAdapterDraft({
    discovery: {
      facts: [
        fact("package-manager", "pnpm", "package.json"),
        fact("test-root", "evaluation/tests/unit", "evaluation/tests/unit"),
        fact("ignore-rule", "custom/runs", ".gitignore"),
      ],
    },
  }).state;
  existing.layers[0].source = "confirmed";
  existing.layers[0].command = ["node", "--test", "saved/unit"];
  existing.artifacts.runDirectory = {
    path: "custom/runs",
    source: "confirmed",
    ignored: true,
  };

  const proposed = createAdapterDraft({
    discovery: {
      facts: [
        fact("package-manager", "pnpm", "package.json"),
        fact("test-root", "evaluation/tests/unit", "evaluation/tests/unit"),
        fact("ignore-rule", "evaluation/runs", ".gitignore"),
      ],
    },
  }).state;

  const result = mergeAdapterState({
    existingState: existing,
    proposedState: proposed,
  });

  assert.equal(result.state.layers[0].command[2], "saved/unit");
  assert.equal(result.state.artifacts.runDirectory.path, "custom/runs");
  assert.equal(result.conflicts.length >= 1, true);
});

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
