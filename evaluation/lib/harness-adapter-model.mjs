import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { assertValid } from "./schema-validator.mjs";

export const DEFAULT_ADAPTER_CONFIG_PATH =
  "evaluation/config/harness-adapter.json";
export const DEFAULT_READINESS_REPORT_PATH =
  "evaluation/reports/harness-adapter-readiness.md";

const SCHEMA_URL = new URL(
  "../schemas/harness-adapter.schema.json",
  import.meta.url,
);
const VALID_SOURCES = new Set([
  "discovered",
  "inferred",
  "confirmed",
  "overridden",
  "deferred",
]);
const VALID_DECISION_STATUSES = new Set([
  "confirmed",
  "overridden",
  "deferred",
  "conflict",
]);
const VALID_LAYER_KINDS = new Set([
  "environment",
  "static",
  "unit",
  "integration",
  "smoke-e2e",
  "full-e2e",
  "custom",
]);
const VALID_LAYER_STATUSES = new Set([
  "confirmed",
  "inferred",
  "deferred",
  "unknown",
]);

export async function loadAdapterState(
  configPath = DEFAULT_ADAPTER_CONFIG_PATH,
  { repoRoot = process.cwd() } = {},
) {
  const absolutePath = path.resolve(repoRoot, configPath);
  const state = JSON.parse(await readFile(absolutePath, "utf8"));
  await assertAdapterState(state, configPath);
  return normalizeAdapterState(state);
}

export async function readAdapterStateIfExists(
  configPath = DEFAULT_ADAPTER_CONFIG_PATH,
  { repoRoot = process.cwd() } = {},
) {
  try {
    return await loadAdapterState(configPath, { repoRoot });
  } catch (error) {
    if (error.code === "ENOENT") {
      return null;
    }
    throw error;
  }
}

export async function writeAdapterState(
  state,
  configPath = DEFAULT_ADAPTER_CONFIG_PATH,
  { repoRoot = process.cwd() } = {},
) {
  await assertAdapterState(state, configPath);
  const absolutePath = path.resolve(repoRoot, configPath);
  await mkdir(path.dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, `${JSON.stringify(state, null, 2)}\n`, "utf8");
}

export async function assertAdapterState(state, label = "harness adapter") {
  const schema = JSON.parse(await readFile(SCHEMA_URL, "utf8"));
  assertValid(state, schema, label);
  validateAdapterState(state, label);
}

export function validateAdapterState(state, label = "harness adapter") {
  if (state.schemaVersion !== 1) {
    throw new Error(`${label}: schemaVersion must be 1.`);
  }
  validateRepository(state.repository, label);
  validateLayers(state.layers, label);
  validateArtifacts(state.artifacts, label);
  validatePolicyRecord(state.behaviorMapping, `${label}.behaviorMapping`);
  validatePolicyRecord(state.ownership, `${label}.ownership`);
  validateQualityPolicy(state.qualityPolicy, `${label}.qualityPolicy`);
  validateCiPolicy(state.ciPolicy, `${label}.ciPolicy`);
  validateGovernance(state.governance, `${label}.governance`);
  validateDecisions(state.decisions, label);
}

export function normalizeAdapterState(state) {
  return {
    schemaVersion: 1,
    repository: state.repository,
    layers: state.layers ?? [],
    targets: state.targets ?? [],
    artifacts: state.artifacts ?? {
      runDirectory: {
        path: "evaluation/runs",
        source: "inferred",
        ignored: false,
      },
      reports: [],
    },
    behaviorMapping: state.behaviorMapping ?? {
      status: "unknown",
      source: "deferred",
      nextAction: "Review behavior mapping before claiming coverage.",
    },
    ownership: state.ownership ?? {
      status: "unknown",
      source: "deferred",
      nextAction: "Add owner-layer policy before E2E thinning.",
    },
    qualityPolicy: state.qualityPolicy ?? {
      status: "unknown",
      source: "deferred",
      enforcement: "warning-first",
    },
    ciPolicy: state.ciPolicy ?? {
      mode: "deferred",
      status: "deferred",
      source: "deferred",
      provider: "unknown",
    },
    governance: state.governance ?? {
      allowedEditBoundary: ["evaluation/"],
      rollback: "Remove generated adapter state and readiness report.",
      source: "inferred",
    },
    decisions: state.decisions ?? [],
    questions: state.questions ?? [],
  };
}

export function createAdapterDraft({
  discovery,
  existingState = null,
  questions = [],
  now = new Date().toISOString(),
} = {}) {
  const discovered = discovery ?? { facts: [] };
  const proposed = normalizeAdapterState({
    schemaVersion: 1,
    repository: {
      root: ".",
      discoveredAt: now,
      packageManager: packageManagerValue(discovered),
    },
    layers: inferLayers(discovered),
    targets: inferTargets(discovered),
    artifacts: inferArtifacts(discovered),
    behaviorMapping: {
      status: "unknown",
      source: "deferred",
      nextAction: "Review behavior mapping before claiming coverage.",
      unmapped: [],
    },
    ownership: {
      status: "unknown",
      source: "deferred",
      nextAction: "Add owner-layer policy before E2E thinning.",
    },
    qualityPolicy: {
      status: "confirmed",
      source: "inferred",
      enforcement: "warning-first",
      rationale:
        "Initial onboarding keeps thresholds warning-first until reviewed.",
    },
    ciPolicy: inferCiPolicy(discovered),
    governance: {
      allowedEditBoundary: ["evaluation/"],
      rollback: "Remove generated adapter state and readiness report.",
      source: "inferred",
    },
    decisions: [
      {
        id: "initial-onboarding-generated",
        topic: "Onboarding",
        source: "inferred",
        status: "confirmed",
        value: "adapter-draft",
        rationale: "Generated from repository discovery.",
      },
    ],
    questions,
  });

  if (!existingState) {
    return {
      state: proposed,
      conflicts: [],
    };
  }

  return mergeAdapterState({
    existingState: normalizeAdapterState(existingState),
    proposedState: proposed,
  });
}

export function mergeAdapterState({ existingState, proposedState }) {
  const conflicts = [];
  const state = {
    ...proposedState,
    repository: {
      ...proposedState.repository,
      discoveredAt: proposedState.repository.discoveredAt,
    },
    layers: mergeLayers(existingState.layers, proposedState.layers, conflicts),
    targets: mergeRecordsById(
      existingState.targets,
      proposedState.targets,
      "target",
      conflicts,
    ),
    artifacts: mergeArtifacts(
      existingState.artifacts,
      proposedState.artifacts,
      conflicts,
    ),
    behaviorMapping: preservePolicy(
      existingState.behaviorMapping,
      proposedState.behaviorMapping,
    ),
    ownership: preservePolicy(existingState.ownership, proposedState.ownership),
    qualityPolicy: preservePolicy(
      existingState.qualityPolicy,
      proposedState.qualityPolicy,
    ),
    ciPolicy: preservePolicy(existingState.ciPolicy, proposedState.ciPolicy),
    governance: preservePolicy(
      existingState.governance,
      proposedState.governance,
    ),
    decisions: mergeDecisions(existingState.decisions, [
      ...proposedState.decisions,
      ...conflicts.map(conflictToDecision),
    ]),
    questions: proposedState.questions,
  };

  return {
    state,
    conflicts,
  };
}

export function hasBrowserLayer(state) {
  return state.layers.some((layer) =>
    ["integration", "smoke-e2e", "full-e2e"].includes(layer.kind),
  );
}

function validateRepository(repository, label) {
  if (!repository || typeof repository !== "object") {
    throw new Error(`${label}.repository must be an object.`);
  }
  if (!repository.root || typeof repository.root !== "string") {
    throw new Error(`${label}.repository.root must be a string.`);
  }
  validateProvenance(
    repository.packageManager,
    `${label}.repository.packageManager`,
  );
}

function validateLayers(layers, label) {
  if (!Array.isArray(layers)) {
    throw new Error(`${label}.layers must be an array.`);
  }
  const names = new Set();
  for (const [index, layer] of layers.entries()) {
    const layerLabel = `${label}.layers[${index}]`;
    if (!layer.name || typeof layer.name !== "string") {
      throw new Error(`${layerLabel}.name must be a string.`);
    }
    if (names.has(layer.name)) {
      throw new Error(`${label}: duplicate layer "${layer.name}".`);
    }
    names.add(layer.name);
    if (!VALID_LAYER_KINDS.has(layer.kind)) {
      throw new Error(`${layerLabel}.kind is unsupported.`);
    }
    if (typeof layer.required !== "boolean") {
      throw new Error(`${layerLabel}.required must be boolean.`);
    }
    if (!VALID_LAYER_STATUSES.has(layer.status)) {
      throw new Error(`${layerLabel}.status is unsupported.`);
    }
    validateSource(layer.source, `${layerLabel}.source`);
    if (
      layer.status !== "deferred" &&
      (!Array.isArray(layer.command) ||
        layer.command.length === 0 ||
        layer.command.some((arg) => typeof arg !== "string"))
    ) {
      throw new Error(`${layerLabel}.command must be a non-empty argv array.`);
    }
  }
}

function validateArtifacts(artifacts, label) {
  if (!artifacts || typeof artifacts !== "object") {
    throw new Error(`${label}.artifacts must be an object.`);
  }
  if (!artifacts.runDirectory?.path) {
    throw new Error(`${label}.artifacts.runDirectory.path is required.`);
  }
  validateSource(
    artifacts.runDirectory.source,
    `${label}.artifacts.runDirectory.source`,
  );
  if (typeof artifacts.runDirectory.ignored !== "boolean") {
    throw new Error(`${label}.artifacts.runDirectory.ignored must be boolean.`);
  }
  if (!Array.isArray(artifacts.reports)) {
    throw new Error(`${label}.artifacts.reports must be an array.`);
  }
}

function validatePolicyRecord(record, label) {
  if (!record || typeof record !== "object") {
    throw new Error(`${label} must be an object.`);
  }
  if (!record.status || typeof record.status !== "string") {
    throw new Error(`${label}.status must be a string.`);
  }
  validateSource(record.source, `${label}.source`);
}

function validateQualityPolicy(policy, label) {
  validatePolicyRecord(policy, label);
  if (
    !["warning-first", "fail-enforced", "deferred"].includes(policy.enforcement)
  ) {
    throw new Error(`${label}.enforcement is unsupported.`);
  }
}

function validateCiPolicy(policy, label) {
  validatePolicyRecord(policy, label);
  if (
    !["github-actions", "other", "local-only", "deferred"].includes(policy.mode)
  ) {
    throw new Error(`${label}.mode is unsupported.`);
  }
}

function validateGovernance(governance, label) {
  if (!Array.isArray(governance.allowedEditBoundary)) {
    throw new Error(`${label}.allowedEditBoundary must be an array.`);
  }
  if (!governance.rollback || typeof governance.rollback !== "string") {
    throw new Error(`${label}.rollback must be a string.`);
  }
  validateSource(governance.source, `${label}.source`);
}

function validateDecisions(decisions, label) {
  if (!Array.isArray(decisions)) {
    throw new Error(`${label}.decisions must be an array.`);
  }
  for (const [index, decision] of decisions.entries()) {
    const decisionLabel = `${label}.decisions[${index}]`;
    validateSource(decision.source, `${decisionLabel}.source`);
    if (!VALID_DECISION_STATUSES.has(decision.status)) {
      throw new Error(`${decisionLabel}.status is unsupported.`);
    }
    if (
      ["overridden", "deferred", "conflict"].includes(decision.status) &&
      (!decision.rationale || typeof decision.rationale !== "string")
    ) {
      throw new Error(`${decisionLabel}.rationale is required.`);
    }
  }
}

function validateProvenance(record, label) {
  if (!record || typeof record !== "object") {
    throw new Error(`${label} must be an object.`);
  }
  if (!record.value || typeof record.value !== "string") {
    throw new Error(`${label}.value must be a string.`);
  }
  validateSource(record.source, `${label}.source`);
}

function validateSource(source, label) {
  if (!VALID_SOURCES.has(source)) {
    throw new Error(
      `${label} must be one of ${[...VALID_SOURCES].join(", ")}.`,
    );
  }
}

function packageManagerValue(discovery) {
  const fact = findFact(discovery, "package-manager");
  return {
    value: fact?.value ?? "unknown",
    source: fact?.status === "discovered" ? "discovered" : "inferred",
    sourcePath: fact?.sourcePath ?? "package.json",
  };
}

function inferLayers(discovery) {
  const layers = [];
  if (findFact(discovery, "tool", "node")) {
    layers.push(
      layer(
        "environment",
        "environment",
        ["node", "--version"],
        true,
        "discovered",
      ),
    );
  }
  if (findFact(discovery, "script", "fmt:check")) {
    layers.push(
      layer(
        "static",
        "static",
        [
          "node",
          "node_modules/prettier/bin/prettier.cjs",
          "--check",
          "evaluation",
        ],
        true,
        "inferred",
        "package.json",
      ),
    );
  }
  if (findFact(discovery, "test-root", "evaluation/tests/unit")) {
    layers.push(
      layer(
        "unit",
        "unit",
        ["node", "--test", "evaluation/tests/unit"],
        true,
        "discovered",
        "evaluation/tests/unit",
      ),
    );
  }
  if (
    findFact(
      discovery,
      "config-file",
      "evaluation/config/playwright.integration.config.mjs",
    )
  ) {
    layers.push(
      layer(
        "integration",
        "integration",
        [
          "node",
          "evaluation/bin/run-playwright-with-server.mjs",
          "--config",
          "evaluation/config/playwright.integration.config.mjs",
        ],
        true,
        "inferred",
        "evaluation/config/playwright.integration.config.mjs",
      ),
    );
  }
  if (
    findFact(
      discovery,
      "config-file",
      "evaluation/config/playwright.smoke.config.mjs",
    )
  ) {
    layers.push(
      layer(
        "smoke-e2e",
        "smoke-e2e",
        [
          "node",
          "evaluation/bin/run-playwright-with-server.mjs",
          "--config",
          "evaluation/config/playwright.smoke.config.mjs",
        ],
        true,
        "inferred",
        "evaluation/config/playwright.smoke.config.mjs",
      ),
    );
  }
  return layers;
}

function inferTargets(discovery) {
  if (
    !findFact(
      discovery,
      "config-file",
      "evaluation/config/playwright.shared.mjs",
    )
  ) {
    return [];
  }
  return [
    {
      id: "local-browser-target",
      kind: "browser",
      status: "inferred",
      source: "inferred",
      sourcePath: "evaluation/config/playwright.shared.mjs",
    },
  ];
}

function inferArtifacts(discovery) {
  return {
    runDirectory: {
      path: "evaluation/runs",
      source: "inferred",
      ignored: Boolean(findFact(discovery, "ignore-rule", "evaluation/runs")),
    },
    reports: [
      {
        path: DEFAULT_READINESS_REPORT_PATH,
        source: "inferred",
        ignored: false,
      },
    ],
  };
}

function inferCiPolicy(discovery) {
  const ciFact = findFact(discovery, "ci-file");
  if (!ciFact) {
    return {
      mode: "deferred",
      status: "deferred",
      source: "deferred",
      provider: "unknown",
      nextAction: "Choose local-only, GitHub Actions, or another CI policy.",
    };
  }
  return {
    mode: "github-actions",
    status: "inferred",
    source: "inferred",
    provider: "github-actions",
    sourcePath: ciFact.sourcePath,
  };
}

function layer(name, kind, command, required, source, sourcePath = null) {
  return {
    name,
    kind,
    command,
    required,
    status: source === "confirmed" ? "confirmed" : "inferred",
    source,
    ...(sourcePath ? { sourcePath } : {}),
  };
}

function findFact(discovery, type, value = undefined) {
  return (discovery.facts ?? []).find((fact) => {
    if (fact.type !== type) {
      return false;
    }
    if (value === undefined) {
      return true;
    }
    return fact.value === value;
  });
}

function mergeLayers(existingLayers, proposedLayers, conflicts) {
  const proposedByName = new Map(
    proposedLayers.map((layer) => [layer.name, layer]),
  );
  const merged = [];
  for (const existing of existingLayers) {
    const proposed = proposedByName.get(existing.name);
    if (
      proposed &&
      shouldPreserve(existing) &&
      JSON.stringify(existing.command ?? null) !==
        JSON.stringify(proposed.command ?? null)
    ) {
      conflicts.push({
        id: `layer-${existing.name}-command-conflict`,
        topic: "Layer command",
        field: `layers.${existing.name}.command`,
        existing: existing.command,
        discovered: proposed.command,
        rationale: `Existing ${existing.source} layer command differs from discovery.`,
      });
    }
    merged.push(shouldPreserve(existing) ? existing : (proposed ?? existing));
    proposedByName.delete(existing.name);
  }
  return [...merged, ...proposedByName.values()];
}

function mergeRecordsById(existingRecords, proposedRecords, topic, conflicts) {
  const proposedById = new Map(
    proposedRecords.map((record) => [record.id, record]),
  );
  const merged = [];
  for (const existing of existingRecords) {
    const proposed = proposedById.get(existing.id);
    if (
      proposed &&
      shouldPreserve(existing) &&
      JSON.stringify(existing) !== JSON.stringify(proposed)
    ) {
      conflicts.push({
        id: `${topic}-${existing.id}-conflict`,
        topic,
        field: `${topic}.${existing.id}`,
        existing,
        discovered: proposed,
        rationale: `Existing ${existing.source} ${topic} differs from discovery.`,
      });
    }
    merged.push(shouldPreserve(existing) ? existing : (proposed ?? existing));
    proposedById.delete(existing.id);
  }
  return [...merged, ...proposedById.values()];
}

function mergeArtifacts(existingArtifacts, proposedArtifacts, conflicts) {
  if (
    shouldPreserve(existingArtifacts.runDirectory) &&
    existingArtifacts.runDirectory.path !== proposedArtifacts.runDirectory.path
  ) {
    conflicts.push({
      id: "artifact-run-directory-conflict",
      topic: "Artifact policy",
      field: "artifacts.runDirectory.path",
      existing: existingArtifacts.runDirectory.path,
      discovered: proposedArtifacts.runDirectory.path,
      rationale: "Existing artifact policy differs from discovery.",
    });
  }
  return {
    runDirectory: shouldPreserve(existingArtifacts.runDirectory)
      ? existingArtifacts.runDirectory
      : proposedArtifacts.runDirectory,
    reports:
      existingArtifacts.reports?.length > 0
        ? existingArtifacts.reports
        : proposedArtifacts.reports,
  };
}

function preservePolicy(existing, proposed) {
  return shouldPreserve(existing) ? existing : proposed;
}

function shouldPreserve(record) {
  return ["confirmed", "overridden", "deferred"].includes(record?.source);
}

function mergeDecisions(existing, proposed) {
  const decisions = new Map();
  for (const decision of [...existing, ...proposed]) {
    decisions.set(decision.id, decision);
  }
  return [...decisions.values()];
}

function conflictToDecision(conflict) {
  return {
    id: conflict.id,
    topic: conflict.topic,
    source: "overridden",
    status: "conflict",
    value: conflict.existing,
    discoveredValue: conflict.discovered,
    field: conflict.field,
    rationale: conflict.rationale,
  };
}
