export function renderCiGateSummaryReport(model) {
  const lines = [
    "# Evaluation Gate Summary",
    "",
    "## Result",
    "",
    `- Status: \`${model.status}\``,
    `- Mode: \`${model.mode}\``,
    `- Target: \`${model.target}\``,
    `- Run ID: ${model.runId ? `\`${model.runId}\`` : "unknown"}`,
    `- Generated at: ${model.metadata.generatedAt}`,
    "",
    "## Primary Issue",
    "",
    `- ID: \`${model.primaryIssue.id}\``,
    `- Kind: \`${model.primaryIssue.kind}\``,
    `- Status: \`${model.primaryIssue.status}\``,
    `- Message: ${model.primaryIssue.message}`,
    `- Recommended action: ${model.recommendedAction}`,
  ];

  if (model.primaryIssue.evidencePath) {
    lines.push(`- Evidence: \`${model.primaryIssue.evidencePath}\``);
  }

  renderEvidence(lines, model.evidence);
  renderWarnings(lines, model.warnings);

  return `${lines.join("\n")}\n`;
}

function renderEvidence(lines, evidence) {
  lines.push("", "## Evidence", "");
  if (evidence.length === 0) {
    lines.push("- No report paths available.");
    return;
  }
  for (const item of evidence) {
    lines.push(`- \`${item.path}\``);
  }
}

function renderWarnings(lines, warnings) {
  lines.push("", "## Warnings", "");
  if (warnings.length === 0) {
    lines.push("- None");
    return;
  }
  for (const warning of warnings) {
    lines.push(`- ${warning}`);
  }
}
