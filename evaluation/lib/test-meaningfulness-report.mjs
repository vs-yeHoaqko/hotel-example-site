export function renderTestMeaningfulnessReport(model) {
  const lines = [
    "# Test Meaningfulness Report",
    "",
    "## Metadata",
    "",
    `- Generated command: \`${model.metadata.command}\``,
    `- Config: \`${model.metadata.configPath}\``,
    `- Report path: \`${model.metadata.reportPath}\``,
    `- Test roots: ${formatInlineList(model.metadata.testRoots.map((root) => root.path))}`,
    "",
    "## Summary",
    "",
    `- Total discovered tests: ${model.summary.totalTests}`,
    `- Meaningful tests: ${model.summary.meaningfulTests}`,
    `- Weak-signal tests: ${model.summary.weakSignalTests}`,
    `- Assertion-like checks: ${model.summary.assertionCount}`,
  ];

  renderAggregate(lines, "By Layer", model.summary.byLayer);
  renderAggregate(lines, "By Source", model.summary.bySource);
  renderAggregate(lines, "By Category", model.summary.byCategory);
  renderWeakSignals(lines, model.weakSignals);
  renderFiles(lines, model.files);
  renderWarnings(lines, model.warnings);
  renderInterpretation(lines, model);

  return `${lines.join("\n")}\n`;
}

function renderAggregate(lines, title, rows) {
  lines.push(
    "",
    `## ${title}`,
    "",
    "| Name | Tests | Meaningful | Assertions |",
    "| --- | --- | --- | --- |",
  );
  if (rows.length === 0) {
    lines.push("| None | 0 | 0 | 0 |");
    return;
  }
  for (const row of rows) {
    lines.push(
      formatRow([
        escapeTable(row.name),
        String(row.tests),
        String(row.meaningfulTests),
        String(row.assertions),
      ]),
    );
  }
}

function renderWeakSignals(lines, weakSignals) {
  lines.push(
    "",
    "## Weak Signals",
    "",
    "| File | Line | Layer | Title |",
    "| --- | --- | --- | --- |",
  );
  if (weakSignals.length === 0) {
    lines.push("| None | - | - | - |");
    return;
  }
  for (const test of weakSignals) {
    lines.push(
      formatRow([
        code(`${test.file}:${test.line}`),
        String(test.line),
        escapeTable(test.layer),
        escapeTable(test.title),
      ]),
    );
  }
}

function renderFiles(lines, files) {
  lines.push(
    "",
    "## Files",
    "",
    "| File | Layer | Source | Tests | Meaningful | Assertions |",
    "| --- | --- | --- | --- | --- | --- |",
  );
  for (const file of files) {
    lines.push(
      formatRow([
        code(file.file),
        escapeTable(file.layer),
        escapeTable(file.source),
        String(file.testCount),
        String(file.meaningfulTests),
        String(file.assertionCount),
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

function renderInterpretation(lines, model) {
  const productTests = countByNames(model.summary.byCategory, [
    "product-domain-rule",
    "product-journey",
    "product-navigation",
    "page-local-behavior",
    "smoke-journey",
  ]);
  const harnessTests = countByNames(model.summary.byCategory, [
    "harness-contract",
  ]);
  lines.push(
    "",
    "## Interpretation",
    "",
    `- Product behavior evidence: ${productTests} tests.`,
    `- Harness contract evidence: ${harnessTests} tests.`,
    "- Root E2E tests are broad behavior evidence; evaluation integration and product unit tests are lower-layer evidence.",
    "- Weak-signal tests should be reviewed before treating their count as meaningful coverage.",
  );
}

function countByNames(rows, names) {
  const selected = new Set(names);
  return rows
    .filter((row) => selected.has(row.name))
    .reduce((sum, row) => sum + row.tests, 0);
}

function formatInlineList(items) {
  if (items.length === 0) {
    return "None";
  }
  return items.map((item) => `\`${item}\``).join(", ");
}

function code(value) {
  return `\`${escapeTable(value)}\``;
}

function escapeTable(value) {
  return String(value).replaceAll("|", "\\|").replaceAll("\n", " ");
}

function formatRow(cells) {
  return `| ${cells.join(" | ")} |`;
}
