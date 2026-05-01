export function renderSummaryMarkdown(summary, ownership) {
  const lines = [
    `# Evaluation Run ${summary.runId}`,
    "",
    "## Metadata",
    "",
    `- Mode: ${summary.mode}`,
    `- Target: ${summary.target}`,
    `- Status: ${summary.status}`,
    `- Branch: ${summary.repository.branch}`,
    `- Commit: ${summary.repository.commit}`,
    `- Dirty: ${summary.repository.dirty}`,
    `- Started: ${summary.startedAt}`,
    `- Finished: ${summary.finishedAt}`,
    "",
    "## Layer Results",
    "",
    "| Layer | Required | Status | Classification | Duration | Artifacts |",
    "| --- | --- | --- | --- | ---: | --- |",
  ];

  for (const layer of summary.layers) {
    lines.push(
      `| ${layer.name} | ${layer.required} | ${layer.status} | ${layer.classification ?? ""} | ${layer.durationMs}ms | ${layer.artifacts.join("<br>")} |`,
    );
  }

  lines.push(
    "",
    "## Counts",
    "",
    `- Passed: ${summary.counts.passed}`,
    `- Failed: ${summary.counts.failed}`,
    `- Skipped: ${summary.counts.skipped}`,
    `- Timeout: ${summary.counts.timeout}`,
    "",
    "## Ownership",
    "",
  );

  for (const record of ownership.records) {
    lines.push(
      `- ${record.behavior}: ${record.ownerLayer} (${record.coveredBy.join(", ")})`,
    );
  }

  lines.push(
    "",
    "## Recommended Next Action",
    "",
    `- Code: ${summary.recommendedNextAction.code}`,
    `- Message: ${summary.recommendedNextAction.message}`,
  );

  if (summary.errors.length) {
    lines.push(
      "",
      "## Errors",
      "",
      ...summary.errors.map((error) => `- ${error}`),
    );
  }

  return `${lines.join("\n")}\n`;
}
