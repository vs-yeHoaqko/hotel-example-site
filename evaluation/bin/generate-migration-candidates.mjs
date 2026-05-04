#!/usr/bin/env node
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { createMigrationCandidateModel } from "../lib/migration-candidate-model.mjs";
import {
  renderMigrationCandidateReport,
  renderThinningExecutionReport,
} from "../lib/migration-candidate-report.mjs";

const repoRoot = process.cwd();
const reportPath = "evaluation/reports/migration-candidates.md";
const thinningExecutionReportPath = "evaluation/reports/thinning-execution.md";

async function main() {
  const model = await createMigrationCandidateModel({ repoRoot });
  const report = await formatMarkdown(renderMigrationCandidateReport(model));
  const thinningExecutionReport = await formatMarkdown(
    renderThinningExecutionReport(model),
  );
  const absoluteReportPath = path.resolve(repoRoot, reportPath);
  const absoluteThinningExecutionReportPath = path.resolve(
    repoRoot,
    thinningExecutionReportPath,
  );

  await mkdir(path.dirname(absoluteReportPath), { recursive: true });
  await writeFile(absoluteReportPath, report, "utf8");
  await mkdir(path.dirname(absoluteThinningExecutionReportPath), {
    recursive: true,
  });
  await writeFile(
    absoluteThinningExecutionReportPath,
    thinningExecutionReport,
    "utf8",
  );

  console.log(`Migration candidate report: ${reportPath}`);
  console.log(`Thinning execution report: ${thinningExecutionReportPath}`);
  console.log(
    `Counts: ready_to_thin=${model.counts.ready_to_thin}, blocked_missing_lower_layer=${model.counts.blocked_missing_lower_layer}, keep_e2e=${model.counts.keep_e2e}`,
  );
  if (model.inventoryWarnings.length > 0) {
    console.log(`Inventory warnings: ${model.inventoryWarnings.length}`);
  }
}

async function formatMarkdown(markdown) {
  const prettier = await import("prettier");
  return prettier.format(markdown, { parser: "markdown" });
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
