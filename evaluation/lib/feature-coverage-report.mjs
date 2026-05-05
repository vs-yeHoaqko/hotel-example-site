export function renderFeatureCoverageReport(model) {
  const lines = [
    "# Feature Coverage Matrix",
    "",
    "## Metadata",
    "",
    `- Generated command: \`${model.metadata.command}\``,
    `- Config: \`${model.metadata.configPath}\``,
    `- Report path: \`${model.metadata.reportPath}\``,
    `- Generated at: ${model.metadata.generatedAt}`,
  ];

  if (model.latestRun) {
    lines.push(
      `- Latest run: \`${model.latestRun.runId}\``,
      `- Latest mode: \`${model.latestRun.mode}\``,
      `- Latest target: \`${model.latestRun.target}\``,
      `- Latest status: \`${model.latestRun.status}\``,
      `- Latest summary: \`${model.latestRun.summaryPath}\``,
    );
  } else {
    lines.push("- Latest run: unknown");
  }

  renderSummary(lines, model);
  renderMatrix(lines, model.rows);
  renderUnmappedEvidence(lines, model.unmappedEvidence);
  renderWarnings(lines, model.warnings);

  return `${lines.join("\n")}\n`;
}

function renderSummary(lines, model) {
  lines.push(
    "",
    "## Summary",
    "",
    `- Aggregate status: \`${model.status}\``,
    `- Feature rows: ${model.summary.totalRows}`,
    `- Pass: ${model.summary.byStatus.pass}`,
    `- Fail: ${model.summary.byStatus.fail}`,
    `- Warn: ${model.summary.byStatus.warn}`,
    `- Unknown: ${model.summary.byStatus.unknown}`,
  );
}

function renderMatrix(lines, rows) {
  lines.push(
    "",
    "## Matrix",
    "",
    "| Function or Journey | Category | Locale | Layer | Status | Evidence | Notes |",
    "| --- | --- | --- | --- | --- | --- | --- |",
  );
  if (rows.length === 0) {
    lines.push("| None | - | - | - | - | - | - |");
    return;
  }
  for (const row of rows) {
    lines.push(
      formatRow([
        escapeTable(row.label),
        escapeTable(row.category),
        escapeTable(row.locale ?? "-"),
        escapeTable(row.ownerLayer),
        code(row.status),
        escapeTable(formatEvidence(row.evidence)),
        escapeTable(row.notes.join(" ")),
      ]),
    );
  }
}

function renderUnmappedEvidence(lines, rows) {
  lines.push(
    "",
    "## Unmapped Evidence",
    "",
    "| File or Artifact | Layer | Status | Note |",
    "| --- | --- | --- | --- |",
  );
  if (rows.length === 0) {
    lines.push("| None | - | - | - |");
    return;
  }
  for (const row of rows) {
    lines.push(
      formatRow([
        code(row.file || row.artifactPath || "unknown"),
        escapeTable(row.layer),
        code(row.status),
        escapeTable(row.note),
      ]),
    );
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

function formatEvidence(evidence) {
  if (evidence.length === 0) {
    return "None";
  }
  return evidence
    .map((item) => {
      const count = typeof item.count === "number" ? ` x${item.count}` : "";
      const artifact = item.artifactPath ? ` -> ${item.artifactPath}` : "";
      return `${item.kind}:${item.layer}:${item.file || item.title}${count}${artifact}`;
    })
    .join("; ");
}

function code(value) {
  return `\`${escapeTable(value)}\``;
}

function escapeTable(value) {
  return String(value ?? "")
    .replaceAll("|", "\\|")
    .replaceAll("\n", " ");
}

function formatRow(cells) {
  return `| ${cells.join(" | ")} |`;
}
