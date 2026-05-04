#!/usr/bin/env node
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { createRunHealthModel } from "../lib/run-health-model.mjs";
import { renderRunHealthReport } from "../lib/run-health-report.mjs";

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const repoRoot = process.cwd();
  const model = await createRunHealthModel({ repoRoot, ...options });
  const report = await formatMarkdown(renderRunHealthReport(model));
  const absoluteReportPath = path.resolve(repoRoot, model.metadata.reportPath);

  await mkdir(path.dirname(absoluteReportPath), { recursive: true });
  await writeFile(absoluteReportPath, report, "utf8");

  console.log(`Run health report: ${model.metadata.reportPath}`);
  console.log(`Selected runs: ${model.metadata.selectedRunIds.length}`);
  console.log(`Slow layers: ${model.slowLayers.length}`);
  console.log(`Slow tests: ${model.slowTestObservationCount}`);
  console.log(`Instability evidence: ${model.instabilityEvidence.length}`);
  console.log(`Environment evidence: ${model.environmentEvidence.length}`);
  if (model.warnings.length > 0) {
    console.log(`Warnings: ${model.warnings.length}`);
  }
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
      case "--runs-dir":
        options.runsDirectory = requireValue(arg, value);
        index += 1;
        break;
      case "--output":
        options.reportPath = requireValue(arg, value);
        index += 1;
        break;
      case "--max-runs":
        options.maxRuns = Number.parseInt(requireValue(arg, value), 10);
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
