export function renderHarnessAdapterReadinessReport(model) {
  const lines = [
    "# Harness Adapter Readiness",
    "",
    "## Metadata",
    "",
    `- Checked at: ${model.metadata.checkedAt}`,
    `- Config: \`${model.metadata.configPath}\``,
    `- Report path: \`${model.metadata.reportPath}\``,
    "",
    "## Overall Readiness",
    "",
    `- Status: \`${model.status}\``,
    `- Current stage: \`${model.stage}\``,
    `- Next action: ${model.nextAction}`,
    "",
    "## CI Policy",
    "",
    `- Mode: \`${model.ciPolicy.mode}\``,
    `- Status: \`${model.ciPolicy.status}\``,
    `- Source: \`${model.ciPolicy.source}\``,
  ];

  renderFindingSection(lines, "Blocked Findings", model.findings, "blocked");
  renderFindingSection(lines, "Warning Findings", model.findings, "warning");
  renderFindingSection(lines, "Unknown Findings", model.findings, "unknown");
  renderFindingSection(lines, "Passing Findings", model.findings, "pass");

  lines.push("", "## Non-Goals", "");
  for (const nonGoal of model.nonGoals) {
    lines.push(`- ${nonGoal}`);
  }

  return `${lines.join("\n")}\n`;
}

function renderFindingSection(lines, title, findings, status) {
  const items = findings.filter((finding) => finding.status === status);
  lines.push(
    "",
    `## ${title}`,
    "",
    "| ID | Stage | Message | Evidence | Next Action | Semantics |",
    "| --- | --- | --- | --- | --- | --- |",
  );
  if (items.length === 0) {
    lines.push("| None | - | - | - | - | - |");
    return;
  }
  for (const finding of items) {
    lines.push(
      formatRow([
        finding.id,
        finding.stage,
        finding.message,
        finding.evidence.map((item) => `\`${item}\``).join("<br>"),
        finding.nextAction ?? "-",
        finding.semantics ?? "-",
      ]),
    );
  }
}

function formatRow(cells) {
  return `| ${cells.map(escapeTable).join(" | ")} |`;
}

function escapeTable(value) {
  return String(value).replaceAll("|", "\\|").replaceAll("\n", " ");
}
