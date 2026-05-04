import { STATUS_ORDER } from "./migration-candidate-model.mjs";
import { THINNING_OUTCOME_ORDER } from "./thinning-decision-model.mjs";

export function renderMigrationCandidateReport(model) {
  const lines = [
    "# Migration Candidate Report",
    "",
    "## Metadata",
    "",
    `- Generated command: \`${model.metadata.command}\``,
    `- Scope: ${model.metadata.scope}`,
    `- Source candidates: \`${model.metadata.sourceCandidates}\``,
    `- Thinning decision source: \`${model.metadata.thinningDecisionSource}\``,
    `- Ownership source: \`${model.metadata.ownershipSource}\``,
    `- Inventory source: \`${model.metadata.inventorySource}\``,
    `- Report path: \`${model.metadata.reportPath}\``,
    "",
    "## Status Counts",
    "",
  ];

  for (const status of STATUS_ORDER) {
    lines.push(`- \`${status}\`: ${model.counts[status]}`);
  }

  lines.push("", "## Thinning Outcome Counts", "");
  for (const outcome of THINNING_OUTCOME_ORDER) {
    lines.push(`- \`${outcome}\`: ${model.thinningDecisionCounts[outcome]}`);
  }

  lines.push("", "## Candidates By Behavior", "");

  for (const group of model.groups) {
    lines.push(`### ${group.behavior}`, "");
    if (group.ownerLayer || group.ownershipEvidence) {
      lines.push(`- Ownership layer: ${group.ownerLayer || "unknown"}`);
      if (group.ownershipEvidence) {
        lines.push(`- Ownership evidence: ${group.ownershipEvidence}`);
      }
      lines.push("");
    }

    for (const candidate of group.candidates) {
      lines.push(`#### \`${candidate.candidateId}\``, "");
      lines.push(`- Status: \`${candidate.status}\``);
      lines.push(`- Root E2E: \`${formatLocation(candidate)}\``);
      lines.push(`- Source title: \`${escapeCode(candidate.sourceTitle)}\``);
      lines.push(`- Assertion scope: ${candidate.assertionScope}`);
      lines.push(`- Behavior summary: ${candidate.behaviorSummary}`);
      lines.push(
        `- Layers: \`${candidate.currentLayer}\` -> \`${candidate.proposedOwnerLayer}\``,
      );
      lines.push(`- Lower-layer evidence: ${formatEvidence(candidate)}`);
      lines.push(`- Remaining E2E coverage: ${candidate.remainingE2ECoverage}`);
      lines.push(`- Recommendation: ${candidate.recommendation}`);
      renderThinningDecision(lines, candidate);
      lines.push("");
    }
  }

  lines.push("## Inventory Warnings", "");
  if (model.inventoryWarnings.length === 0) {
    lines.push("- None");
  } else {
    lines.push(...model.inventoryWarnings.map((warning) => `- ${warning}`));
  }

  lines.push("", "## Next Steps", "");
  lines.push(
    "- Review `ready_to_thin` candidates before changing root E2E tests.",
  );
  if (model.counts.blocked_missing_lower_layer > 0) {
    lines.push(
      "- Add lower-layer coverage for `blocked_missing_lower_layer` candidates before thinning those assertions.",
    );
  } else {
    lines.push(
      "- Treat the newly ready candidates as requiring human thinning approval before root E2E edits.",
    );
  }
  lines.push(
    "- Keep `keep_e2e` journeys as representative browser-flow smoke coverage.",
    "- Do not edit, skip, or delete root E2E tests until a human approves the specific thinning changes.",
  );

  return `${lines.join("\n")}\n`;
}

function formatLocation(candidate) {
  if (candidate.line === null) {
    return `${candidate.path}:missing (ordinal ${candidate.ordinal})`;
  }
  return `${candidate.path}:${candidate.line} (ordinal ${candidate.ordinal})`;
}

function formatEvidence(candidate) {
  if (candidate.lowerLayerEvidence.length === 0) {
    return "None yet; this candidate is blocked until direct lower-layer evidence exists.";
  }
  return candidate.lowerLayerEvidence.map((item) => `\`${item}\``).join(", ");
}

function renderThinningDecision(lines, candidate) {
  const decision = candidate.thinningDecision;
  if (!decision) {
    lines.push("- Thinning outcome: `not_recorded`");
    return;
  }

  lines.push(`- Thinning outcome: \`${decision.outcome}\``);
  lines.push(`- Decision reason: ${decision.reason}`);
  lines.push(`- Decision owner layer: \`${decision.ownerLayer}\``);
  lines.push(
    `- Decision lower-layer evidence: ${formatList(decision.lowerLayerEvidence)}`,
  );
  lines.push(
    `- Decision remaining E2E coverage: ${decision.remainingE2ECoverage}`,
  );
  lines.push(`- Outside files: ${formatList(decision.outsideFiles)}`);
  lines.push(`- Conflict risk: \`${decision.conflictRisk}\``);
  if (decision.notes.length > 0) {
    lines.push(`- Notes: ${decision.notes.join("; ")}`);
  }
}

function formatList(items) {
  if (items.length === 0) {
    return "None";
  }
  return items.map((item) => `\`${item}\``).join(", ");
}

function escapeCode(value) {
  return value.replaceAll("`", "\\`");
}
