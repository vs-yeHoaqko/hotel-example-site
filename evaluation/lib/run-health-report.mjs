export function renderRunHealthReport(model) {
  const lines = [
    "# Run Health Report",
    "",
    "## Metadata",
    "",
    `- Generated command: \`${model.metadata.command}\``,
    `- Config: \`${model.metadata.configPath}\``,
    `- Runs directory: \`${model.metadata.runsDirectory}\``,
    `- Report path: \`${model.metadata.reportPath}\``,
    `- Selected runs: ${formatInlineList(model.metadata.selectedRunIds)}`,
    `- Max runs: ${model.metadata.maxRuns}`,
    `- Top slow tests: ${model.metadata.topSlowTests}`,
    `- Slow test threshold: ${model.metadata.testSlowThresholdMs}ms`,
    "",
    "### Layer Thresholds",
    "",
  ];

  const thresholds = Object.entries(model.metadata.layerThresholdsMs).sort(
    ([a], [b]) => a.localeCompare(b),
  );
  if (thresholds.length === 0) {
    lines.push("- None");
  } else {
    for (const [layer, thresholdMs] of thresholds) {
      lines.push(`- \`${layer}\`: ${thresholdMs}ms`);
    }
  }

  renderSelectedRuns(lines, model.selectedRuns);
  renderSlowLayers(lines, model.slowLayers);
  renderSlowTests(lines, model);
  renderEvidence(lines, "Instability Evidence", model.instabilityEvidence, {
    empty: model.noFlakyEvidenceObserved
      ? "No flaky evidence observed in selected runs."
      : "None",
  });
  renderEvidence(lines, "Environment Evidence", model.environmentEvidence, {
    empty: "None",
  });
  renderWarnings(lines, model.warnings);
  renderRecommendedReviewFocus(lines, model.recommendedReviewFocus);

  return `${lines.join("\n")}\n`;
}

function renderSelectedRuns(lines, selectedRuns) {
  lines.push(
    "",
    "## Selected Runs",
    "",
    "| Run ID | Mode | Target | Status | Started | Finished | Dirty | Summary |",
    "| --- | --- | --- | --- | --- | --- | --- | --- |",
  );

  if (selectedRuns.length === 0) {
    lines.push("| None | - | - | - | - | - | - | - |");
    return;
  }

  for (const run of selectedRuns) {
    lines.push(
      formatRow([
        escapeTable(run.runId),
        escapeTable(run.mode),
        escapeTable(run.target),
        escapeTable(run.status),
        escapeTable(run.startedAt || "-"),
        escapeTable(run.finishedAt || "-"),
        run.repository.dirty ? "yes" : "no",
        code(run.summaryPath),
      ]),
    );
  }
}

function renderSlowLayers(lines, slowLayers) {
  lines.push(
    "",
    "## Slow Layers",
    "",
    "| Run ID | Layer | Status | Duration | Threshold | Classification | Artifacts |",
    "| --- | --- | --- | --- | --- | --- | --- |",
  );

  if (slowLayers.length === 0) {
    lines.push("| None | - | - | - | - | - | - |");
    return;
  }

  for (const layer of slowLayers) {
    lines.push(
      formatRow([
        escapeTable(layer.runId),
        escapeTable(layer.name),
        escapeTable(layer.status),
        formatDuration(layer.durationMs),
        formatDuration(layer.thresholdMs),
        escapeTable(layer.classification ?? "-"),
        formatArtifacts(layer.artifacts),
      ]),
    );
  }
}

function renderSlowTests(lines, model) {
  lines.push(
    "",
    "## Slow Tests",
    "",
    `Total slow observations: ${model.slowTestObservationCount}`,
    "",
    "| Run ID | Layer | Title | File | Project | Duration | Status | Retry | Artifact |",
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- |",
  );

  if (model.slowTests.length === 0) {
    lines.push("| None | - | - | - | - | - | - | - | - |");
    return;
  }

  for (const test of model.slowTests) {
    lines.push(
      formatRow([
        escapeTable(test.runId),
        escapeTable(test.layer),
        escapeTable(test.title),
        escapeTable(formatLocation(test.file, test.line)),
        escapeTable(test.project || "-"),
        formatDuration(test.durationMs),
        escapeTable(test.status),
        String(test.retry),
        code(test.artifactPath),
      ]),
    );
  }
}

function renderEvidence(lines, title, evidence, { empty }) {
  lines.push(
    "",
    `## ${title}`,
    "",
    "| Run ID | Layer | Kind | Title | Status | Classification | Duration | Artifact | Messages |",
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- |",
  );

  if (evidence.length === 0) {
    lines.push(`| ${escapeTable(empty)} | - | - | - | - | - | - | - | - |`);
    return;
  }

  for (const item of evidence) {
    lines.push(
      formatRow([
        escapeTable(item.runId),
        escapeTable(item.layer),
        escapeTable(item.kind),
        escapeTable(item.title),
        escapeTable(item.status),
        escapeTable(item.classification),
        formatDuration(item.durationMs),
        code(item.artifactPath),
        escapeTable(item.messages.join("; ") || "-"),
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

function renderRecommendedReviewFocus(lines, recommendedReviewFocus) {
  lines.push("", "## Recommended Review Focus", "");
  for (const item of recommendedReviewFocus) {
    lines.push(`- ${item}`);
  }
}

function formatInlineList(items) {
  if (items.length === 0) {
    return "None";
  }
  return items.map((item) => `\`${item}\``).join(", ");
}

function formatDuration(value) {
  return typeof value === "number" ? `${value}ms` : "-";
}

function formatLocation(file, line) {
  if (!file) {
    return "-";
  }
  return line ? `${file}:${line}` : file;
}

function formatArtifacts(artifacts) {
  if (artifacts.length === 0) {
    return "-";
  }
  return artifacts.map((artifact) => code(artifact)).join("<br>");
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
