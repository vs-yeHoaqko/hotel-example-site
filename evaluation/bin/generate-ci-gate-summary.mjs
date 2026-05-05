#!/usr/bin/env node
import { appendFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { createCiGateSummaryModel } from "../lib/ci-gate-summary-model.mjs";
import { renderCiGateSummaryReport } from "../lib/ci-gate-summary-report.mjs";

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const repoRoot = process.cwd();
  const model = await createCiGateSummaryModel({ repoRoot, ...options });
  const report = await formatMarkdown(renderCiGateSummaryReport(model));
  const absoluteReportPath = path.resolve(repoRoot, model.metadata.reportPath);

  await mkdir(path.dirname(absoluteReportPath), { recursive: true });
  await writeFile(absoluteReportPath, report, "utf8");

  if (process.env.GITHUB_STEP_SUMMARY) {
    await appendFile(process.env.GITHUB_STEP_SUMMARY, `\n${report}`, "utf8");
  }

  console.log(`CI gate summary: ${model.metadata.reportPath}`);
  console.log(`Status: ${model.status}`);
  console.log(`Primary issue: ${model.primaryIssue.id}`);
}

function parseArgs(args) {
  const options = {};
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    const value = args[index + 1];
    switch (arg) {
      case "--quality-gate-config":
        options.qualityGateConfigPath = requireValue(arg, value);
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
