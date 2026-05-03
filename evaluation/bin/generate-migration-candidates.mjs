#!/usr/bin/env node
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { createMigrationCandidateModel } from "../lib/migration-candidate-model.mjs";
import { renderMigrationCandidateReport } from "../lib/migration-candidate-report.mjs";

const repoRoot = process.cwd();
const reportPath = "evaluation/reports/migration-candidates.md";

async function main() {
  const model = await createMigrationCandidateModel({ repoRoot });
  const report = renderMigrationCandidateReport(model);
  const absoluteReportPath = path.resolve(repoRoot, reportPath);

  await mkdir(path.dirname(absoluteReportPath), { recursive: true });
  await writeFile(absoluteReportPath, report, "utf8");

  console.log(`Migration candidate report: ${reportPath}`);
  console.log(
    `Counts: ready_to_thin=${model.counts.ready_to_thin}, blocked_missing_lower_layer=${model.counts.blocked_missing_lower_layer}, keep_e2e=${model.counts.keep_e2e}`,
  );
  if (model.inventoryWarnings.length > 0) {
    console.log(`Inventory warnings: ${model.inventoryWarnings.length}`);
  }
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
