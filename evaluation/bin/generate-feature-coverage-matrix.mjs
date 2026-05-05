#!/usr/bin/env node
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { createFeatureCoverageModel } from "../lib/feature-coverage-model.mjs";
import { renderFeatureCoverageReport } from "../lib/feature-coverage-report.mjs";

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const repoRoot = process.cwd();
  const model = await createFeatureCoverageModel({ repoRoot, ...options });
  const report = await formatMarkdown(renderFeatureCoverageReport(model));
  const absoluteReportPath = path.resolve(repoRoot, model.metadata.reportPath);

  await mkdir(path.dirname(absoluteReportPath), { recursive: true });
  await writeFile(absoluteReportPath, report, "utf8");

  console.log(`Feature coverage matrix: ${model.metadata.reportPath}`);
  console.log(`Status: ${model.status}`);
  console.log(`Rows: ${model.summary.totalRows}`);
  console.log(`Unmapped evidence: ${model.unmappedEvidence.length}`);
}

function parseArgs(args) {
  const options = {};
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    const value = args[index + 1];
    switch (arg) {
      case "--config":
        options.configPath = requireValue(arg, value);
        index += 1;
        break;
      case "--output":
        options.reportPath = requireValue(arg, value);
        index += 1;
        break;
      default:
        throw new Error(`Unknown option: ${arg}`);
    }
  }
  return options;
}

function requireValue(arg, value) {
  if (!value || value.startsWith("--")) {
    throw new Error(`${arg} requires a value`);
  }
  return value;
}

async function formatMarkdown(markdown) {
  const prettier = await import("prettier");
  return prettier.format(markdown, { parser: "markdown" });
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
