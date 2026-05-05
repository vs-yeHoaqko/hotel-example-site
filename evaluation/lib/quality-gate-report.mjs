export function renderQualityGateReport(model) {
  const lines = [
    "# Evaluation Quality Gate Report",
    "",
    "## Metadata",
    "",
    `- Generated command: \`${model.metadata.command}\``,
    `- Config: \`${model.metadata.configPath}\``,
    `- Report path: \`${model.metadata.reportPath}\``,
    `- Checked at: ${model.metadata.checkedAt}`,
    "",
    "## Final Status",
    "",
    `- Status: \`${model.status}\``,
  ];

  renderEvidenceSources(lines, model.evidenceSources);
  renderMetrics(lines, model.metrics);
  renderFindings(
    lines,
    "Required Evidence Findings",
    model.requiredEvidenceFindings,
  );
  renderFindings(lines, "Threshold Findings", model.thresholdFindings);
  renderFindings(lines, "Baseline Findings", model.baselineFindings);
  renderDiagnostics(lines, model.diagnosticFindings);
  renderFindings(lines, "Thinning Findings", model.thinningFindings);
  renderRecommendedActions(lines, model.recommendedActions);
  renderWarnings(lines, model.warnings);

  return `${lines.join("\n")}\n`;
}

function renderEvidenceSources(lines, evidenceSources) {
  lines.push("", "## Evidence Sources", "");
  for (const source of evidenceSources) {
    lines.push(`- \`${source}\``);
  }
}

function renderMetrics(lines, metrics) {
  lines.push("", "## Metrics", "", "| Metric | Value |", "| --- | --- |");
  for (const [metric, value] of Object.entries(metrics).sort(([a], [b]) =>
    a.localeCompare(b),
  )) {
    lines.push(formatRow([escapeTable(metric), String(value)]));
  }
}

function renderFindings(lines, title, findings) {
  const items = findings ?? [];
  lines.push(
    "",
    `## ${title}`,
    "",
    "| ID | Source | Status | Message |",
    "| --- | --- | --- | --- |",
  );
  if (items.length === 0) {
    lines.push("| None | - | - | - |");
    return;
  }
  for (const finding of items) {
    lines.push(
      formatRow([
        escapeTable(finding.id),
        escapeTable(finding.source),
        escapeTable(finding.status),
        escapeTable(finding.message),
      ]),
    );
  }
}

function renderDiagnostics(lines, findings) {
  lines.push(
    "",
    "## Diagnostic Findings",
    "",
    "| ID | Category | Confidence | Message | Recommended Action | Artifact |",
    "| --- | --- | --- | --- | --- | --- |",
  );
  if (findings.length === 0) {
    lines.push("| None | - | - | - | - | - |");
    return;
  }
  for (const finding of findings) {
    lines.push(
      formatRow([
        escapeTable(finding.id),
        escapeTable(finding.category),
        escapeTable(finding.confidence),
        escapeTable(finding.message),
        escapeTable(finding.recommendedAction),
        code(finding.artifactPath),
      ]),
    );
  }
}

function renderRecommendedActions(lines, actions) {
  lines.push("", "## Recommended Actions", "");
  for (const action of actions) {
    lines.push(`- ${action}`);
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

function code(value) {
  if (!value) {
    return "-";
  }
  return `\`${escapeTable(value)}\``;
}

function escapeTable(value) {
  return String(value).replaceAll("|", "\\|").replaceAll("\n", " ");
}

function formatRow(cells) {
  return `| ${cells.join(" | ")} |`;
}
