import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { createE2EInventory } from "./e2e-inventory.mjs";
import { createOwnership } from "./ownership.mjs";

export const STATUS_ORDER = [
  "ready_to_thin",
  "blocked_missing_lower_layer",
  "keep_e2e",
];

const VALID_STATUSES = new Set(STATUS_ORDER);
const VALID_LAYERS = new Set(["unit", "integration", "e2e"]);

export async function createMigrationCandidateModel({
  repoRoot = process.cwd(),
  configPath = "evaluation/config/migration-candidates.config.json",
} = {}) {
  const config = await loadMigrationCandidateConfig(configPath, { repoRoot });
  const ownership = await createOwnership({ repoRoot });
  const inventory = await createE2EInventory({ repoRoot });

  const { candidates, warnings } = await validateAndBuildCandidates({
    config,
    ownership,
    inventory,
    repoRoot,
  });

  const sortedCandidates = candidates.toSorted(compareCandidates);
  const groups = groupCandidates(sortedCandidates);

  return {
    metadata: {
      command: "node evaluation/bin/generate-migration-candidates.mjs",
      scope: config.scope,
      ownershipSource: "evaluation/lib/ownership.mjs",
      inventorySource: "e2e/**/*.spec.ts",
      reportPath: "evaluation/reports/migration-candidates.md",
    },
    counts: countByStatus(sortedCandidates),
    groups,
    inventoryWarnings: warnings,
    candidates: sortedCandidates,
  };
}

export async function loadMigrationCandidateConfig(
  configPath,
  { repoRoot = process.cwd() } = {},
) {
  const absolutePath = path.resolve(repoRoot, configPath);
  const config = JSON.parse(await readFile(absolutePath, "utf8"));
  validateConfigShape(config, configPath);
  return config;
}

async function validateAndBuildCandidates({
  config,
  ownership,
  inventory,
  repoRoot,
}) {
  const errors = [];
  const warnings = [];
  const candidateIds = new Set();
  const identityScopes = new Set();
  const inventoryByKey = new Map(
    inventory.map((entry) => [inventoryKey(entry.path, entry.ordinal), entry]),
  );
  const ownershipByBehavior = new Map(
    ownership.records.map((record) => [record.behavior, record]),
  );

  const candidates = [];
  for (const [index, candidate] of config.candidates.entries()) {
    const label = `candidates[${index}] (${candidate.candidateId})`;

    if (candidateIds.has(candidate.candidateId)) {
      errors.push(`${label}: duplicate candidateId.`);
    }
    candidateIds.add(candidate.candidateId);

    const sameTestScopeKey = `${candidate.path}#${candidate.ordinal}#${candidate.assertionScope}`;
    if (identityScopes.has(sameTestScopeKey)) {
      errors.push(
        `${label}: duplicate assertionScope for the same path and ordinal.`,
      );
    }
    identityScopes.add(sameTestScopeKey);

    if (!VALID_STATUSES.has(candidate.status)) {
      errors.push(`${label}: invalid status "${candidate.status}".`);
    }
    if (!VALID_LAYERS.has(candidate.currentLayer)) {
      errors.push(
        `${label}: invalid currentLayer "${candidate.currentLayer}".`,
      );
    }
    if (!VALID_LAYERS.has(candidate.proposedOwnerLayer)) {
      errors.push(
        `${label}: invalid proposedOwnerLayer "${candidate.proposedOwnerLayer}".`,
      );
    }

    const ownershipRecord = ownershipByBehavior.get(candidate.behavior);
    if (!ownershipRecord) {
      errors.push(
        `${label}: behavior "${candidate.behavior}" is not in ownership records.`,
      );
    }

    if (
      candidate.status === "ready_to_thin" &&
      candidate.lowerLayerEvidence.length === 0
    ) {
      errors.push(`${label}: ready_to_thin requires lowerLayerEvidence.`);
    }

    if (
      isLocaleSpecificMessageCandidate(candidate) &&
      candidate.status === "ready_to_thin"
    ) {
      errors.push(
        `${label}: locale-specific validation message text must not be ready_to_thin without locale-specific evidence.`,
      );
    }

    for (const evidencePath of candidate.lowerLayerEvidence) {
      try {
        await access(path.resolve(repoRoot, evidencePath));
      } catch {
        errors.push(`${label}: evidence path does not exist: ${evidencePath}.`);
      }
    }

    const inventoryEntry = inventoryByKey.get(
      inventoryKey(candidate.path, candidate.ordinal),
    );
    if (!inventoryEntry) {
      warnings.push(
        `Mapped test not found in current inventory: ${candidate.path} ordinal ${candidate.ordinal} (${candidate.candidateId}).`,
      );
    }

    candidates.push({
      ...candidate,
      line: inventoryEntry?.line ?? null,
      sourceTitle: inventoryEntry?.title ?? "(missing inventory entry)",
      describe: inventoryEntry?.describe ?? [],
      ownership: ownershipRecord ?? null,
      lowerLayerEvidence: candidate.lowerLayerEvidence.toSorted(),
    });
  }

  for (const relevantPath of config.relevantTestPaths) {
    const mappedOrdinals = new Set(
      config.candidates
        .filter((candidate) => candidate.path === relevantPath)
        .map((candidate) => candidate.ordinal),
    );
    for (const entry of inventory.filter(
      (item) => item.path === relevantPath,
    )) {
      if (!mappedOrdinals.has(entry.ordinal)) {
        warnings.push(
          `Relevant reservation test is not mapped: ${entry.path} ordinal ${entry.ordinal} "${entry.title}".`,
        );
      }
    }
  }

  if (errors.length > 0) {
    throw new Error(
      `Migration candidate validation failed:\n${errors.join("\n")}`,
    );
  }

  return { candidates, warnings };
}

function validateConfigShape(config, label) {
  if (!config || typeof config !== "object" || Array.isArray(config)) {
    throw new Error(`${label}: config must be an object.`);
  }
  if (config.schemaVersion !== 1) {
    throw new Error(`${label}: schemaVersion must be 1.`);
  }
  if (!config.scope || typeof config.scope !== "string") {
    throw new Error(`${label}: scope must be a string.`);
  }
  if (
    !Array.isArray(config.relevantTestPaths) ||
    config.relevantTestPaths.some((item) => typeof item !== "string")
  ) {
    throw new Error(`${label}: relevantTestPaths must be an array of strings.`);
  }
  if (!Array.isArray(config.candidates) || config.candidates.length === 0) {
    throw new Error(`${label}: candidates must be a non-empty array.`);
  }

  for (const [index, candidate] of config.candidates.entries()) {
    validateCandidateShape(candidate, `${label}.candidates[${index}]`);
  }
}

function validateCandidateShape(candidate, label) {
  const requiredStrings = [
    "candidateId",
    "path",
    "assertionScope",
    "behavior",
    "behaviorSummary",
    "currentLayer",
    "proposedOwnerLayer",
    "status",
    "remainingE2ECoverage",
    "recommendation",
  ];

  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
    throw new Error(`${label}: candidate must be an object.`);
  }
  for (const key of requiredStrings) {
    if (!candidate[key] || typeof candidate[key] !== "string") {
      throw new Error(`${label}.${key}: required string property is missing.`);
    }
  }
  if (!Number.isInteger(candidate.ordinal) || candidate.ordinal < 0) {
    throw new Error(`${label}.ordinal: must be a non-negative integer.`);
  }
  if (
    !Array.isArray(candidate.lowerLayerEvidence) ||
    candidate.lowerLayerEvidence.some((item) => typeof item !== "string")
  ) {
    throw new Error(
      `${label}.lowerLayerEvidence: must be an array of strings.`,
    );
  }
}

function groupCandidates(candidates) {
  const groupsByBehavior = new Map();
  for (const candidate of candidates) {
    if (!groupsByBehavior.has(candidate.behavior)) {
      groupsByBehavior.set(candidate.behavior, {
        behavior: candidate.behavior,
        ownerLayer: candidate.ownership?.ownerLayer ?? "",
        ownershipEvidence: candidate.ownership?.evidence ?? "",
        candidates: [],
      });
    }
    groupsByBehavior.get(candidate.behavior).candidates.push(candidate);
  }

  return [...groupsByBehavior.values()].sort((left, right) =>
    left.behavior.localeCompare(right.behavior),
  );
}

function countByStatus(candidates) {
  const counts = Object.fromEntries(STATUS_ORDER.map((status) => [status, 0]));
  for (const candidate of candidates) {
    counts[candidate.status] += 1;
  }
  return counts;
}

function compareCandidates(left, right) {
  return (
    left.path.localeCompare(right.path) ||
    left.ordinal - right.ordinal ||
    left.candidateId.localeCompare(right.candidateId)
  );
}

function inventoryKey(pathValue, ordinal) {
  return `${pathValue}#${ordinal}`;
}

function isLocaleSpecificMessageCandidate(candidate) {
  const scope = candidate.assertionScope.toLowerCase();
  return (
    candidate.path.includes("/ja/") &&
    (scope.includes("message") || scope.includes("feedback"))
  );
}
