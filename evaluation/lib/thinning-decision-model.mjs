import { readFile } from "node:fs/promises";
import path from "node:path";

export const THINNING_OUTCOME_ORDER = [
  "thinned",
  "retained",
  "deferred",
  "keep_e2e",
];

const VALID_OUTCOMES = new Set(THINNING_OUTCOME_ORDER);
const VALID_OWNER_LAYERS = new Set(["unit", "integration", "e2e"]);
const VALID_CONFLICT_RISKS = new Set(["none", "low", "medium", "high"]);
const ALLOWED_OUTSIDE_FILES = new Set([
  "e2e/en-US/reserve.spec.ts",
  "e2e/ja/reserve.spec.ts",
]);

export async function loadThinningDecisionSet(
  configPath = "evaluation/config/thinning-decisions.config.json",
  { repoRoot = process.cwd(), candidates = [] } = {},
) {
  const absolutePath = path.resolve(repoRoot, configPath);
  const config = JSON.parse(await readFile(absolutePath, "utf8"));
  return validateThinningDecisionSet(config, {
    candidates,
    label: configPath,
  });
}

export function validateThinningDecisionSet(
  config,
  { candidates = [], label = "thinning decisions" } = {},
) {
  const errors = [];

  if (!config || typeof config !== "object" || Array.isArray(config)) {
    throw new Error(`${label}: config must be an object.`);
  }
  if (config.schemaVersion !== 1) {
    errors.push(`${label}: schemaVersion must be 1.`);
  }
  if (!config.scope || typeof config.scope !== "string") {
    errors.push(`${label}: scope must be a string.`);
  }
  if (!config.sourceCandidates || typeof config.sourceCandidates !== "string") {
    errors.push(`${label}: sourceCandidates must be a string.`);
  }
  if (!Array.isArray(config.decisions)) {
    errors.push(`${label}: decisions must be an array.`);
  }

  const candidateById = new Map(
    candidates.map((candidate) => [candidate.candidateId, candidate]),
  );
  const seen = new Set();
  const decisions = [];

  for (const [index, decision] of (config.decisions ?? []).entries()) {
    const decisionLabel = `${label}.decisions[${index}]`;
    validateDecisionShape(decision, decisionLabel, errors);

    if (!decision || typeof decision !== "object" || Array.isArray(decision)) {
      continue;
    }

    if (seen.has(decision.candidateId)) {
      errors.push(`${decisionLabel}: duplicate candidateId.`);
    }
    seen.add(decision.candidateId);

    const candidate = candidateById.get(decision.candidateId);
    if (candidateById.size > 0 && !candidate) {
      errors.push(
        `${decisionLabel}: candidateId "${decision.candidateId}" does not exist in migration candidates.`,
      );
    }

    if (candidate && decision.rootE2EPath !== candidate.path) {
      errors.push(
        `${decisionLabel}: rootE2EPath must match source candidate path "${candidate.path}".`,
      );
    }

    if (decision.outcome === "thinned") {
      if (candidate && candidate.status !== "ready_to_thin") {
        errors.push(
          `${decisionLabel}: outcome "thinned" requires source status ready_to_thin.`,
        );
      }
      if (decision.lowerLayerEvidence?.length === 0) {
        errors.push(
          `${decisionLabel}: outcome "thinned" requires lowerLayerEvidence.`,
        );
      }
    }

    if (decision.outcome === "keep_e2e") {
      if (candidate && candidate.status !== "keep_e2e") {
        errors.push(
          `${decisionLabel}: outcome "keep_e2e" requires source status keep_e2e.`,
        );
      }
    }

    for (const evidencePath of decision.lowerLayerEvidence ?? []) {
      if (evidencePath.startsWith("evaluation/runs/")) {
        errors.push(
          `${decisionLabel}: lowerLayerEvidence must not reference per-run artifacts.`,
        );
      }
    }

    for (const outsideFile of decision.outsideFiles ?? []) {
      if (!ALLOWED_OUTSIDE_FILES.has(outsideFile)) {
        errors.push(
          `${decisionLabel}: outsideFiles may only contain reviewed root reservation E2E files.`,
        );
      }
    }

    decisions.push(normalizeDecision(decision));
  }

  if (candidateById.size > 0) {
    for (const candidate of candidates) {
      if (
        (candidate.status === "ready_to_thin" ||
          candidate.status === "keep_e2e") &&
        !seen.has(candidate.candidateId)
      ) {
        errors.push(
          `${label}: missing thinning decision for candidateId "${candidate.candidateId}".`,
        );
      }
    }
  }

  if (errors.length > 0) {
    throw new Error(
      `Thinning decision validation failed:\n${errors.join("\n")}`,
    );
  }

  return {
    schemaVersion: config.schemaVersion,
    scope: config.scope,
    sourceCandidates: config.sourceCandidates,
    decisions: decisions.toSorted((left, right) =>
      left.candidateId.localeCompare(right.candidateId),
    ),
  };
}

export function attachThinningDecisions(candidates, decisionSet) {
  const decisionById = new Map(
    (decisionSet?.decisions ?? []).map((decision) => [
      decision.candidateId,
      decision,
    ]),
  );

  return candidates.map((candidate) => ({
    ...candidate,
    thinningDecision: decisionById.get(candidate.candidateId) ?? null,
  }));
}

export function countThinningOutcomes(decisions) {
  const counts = Object.fromEntries(
    THINNING_OUTCOME_ORDER.map((outcome) => [outcome, 0]),
  );
  for (const decision of decisions) {
    counts[decision.outcome] += 1;
  }
  return counts;
}

function validateDecisionShape(decision, label, errors) {
  if (!decision || typeof decision !== "object" || Array.isArray(decision)) {
    errors.push(`${label}: decision must be an object.`);
    return;
  }

  const requiredStrings = [
    "candidateId",
    "outcome",
    "reason",
    "rootE2EPath",
    "assertionScope",
    "ownerLayer",
    "remainingE2ECoverage",
    "conflictRisk",
  ];

  for (const key of requiredStrings) {
    if (!decision[key] || typeof decision[key] !== "string") {
      errors.push(`${label}.${key}: required string property is missing.`);
    }
  }

  if (decision.outcome && !VALID_OUTCOMES.has(decision.outcome)) {
    errors.push(`${label}.outcome: invalid outcome "${decision.outcome}".`);
  }
  if (decision.ownerLayer && !VALID_OWNER_LAYERS.has(decision.ownerLayer)) {
    errors.push(
      `${label}.ownerLayer: invalid ownerLayer "${decision.ownerLayer}".`,
    );
  }
  if (
    decision.conflictRisk &&
    !VALID_CONFLICT_RISKS.has(decision.conflictRisk)
  ) {
    errors.push(
      `${label}.conflictRisk: invalid conflictRisk "${decision.conflictRisk}".`,
    );
  }

  for (const key of ["lowerLayerEvidence", "outsideFiles"]) {
    if (
      !Array.isArray(decision[key]) ||
      decision[key].some((item) => typeof item !== "string")
    ) {
      errors.push(`${label}.${key}: must be an array of strings.`);
    }
  }

  if (
    decision.notes !== undefined &&
    (!Array.isArray(decision.notes) ||
      decision.notes.some((item) => typeof item !== "string"))
  ) {
    errors.push(`${label}.notes: must be an array of strings when provided.`);
  }
}

function normalizeDecision(decision) {
  return {
    candidateId: decision.candidateId,
    outcome: decision.outcome,
    reason: decision.reason,
    rootE2EPath: decision.rootE2EPath,
    assertionScope: decision.assertionScope,
    ownerLayer: decision.ownerLayer,
    lowerLayerEvidence: decision.lowerLayerEvidence.toSorted(),
    remainingE2ECoverage: decision.remainingE2ECoverage,
    outsideFiles: decision.outsideFiles.toSorted(),
    conflictRisk: decision.conflictRisk,
    notes: (decision.notes ?? []).toSorted(),
  };
}
