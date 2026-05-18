#!/usr/bin/env node
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  DEFAULT_ADAPTER_CONFIG_PATH,
  DEFAULT_READINESS_REPORT_PATH,
  loadAdapterState,
} from "../lib/harness-adapter-model.mjs";
import { validateAdapterReadiness } from "../lib/harness-adapter-readiness.mjs";
import { renderHarnessAdapterReadinessReport } from "../lib/harness-adapter-report.mjs";

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const repoRoot = process.cwd();
  const state = await loadAdapterState(options.config, { repoRoot });
  const model = validateAdapterReadiness(state, {
    configPath: options.config,
    reportPath: options.report,
  });
  const report = await formatMarkdown(
    renderHarnessAdapterReadinessReport(model),
  );

  if (options.writeReport) {
    const absoluteReportPath = path.resolve(repoRoot, options.report);
    await mkdir(path.dirname(absoluteReportPath), { recursive: true });
    await writeFile(absoluteReportPath, report, "utf8");
    console.log(`Harness adapter readiness report: ${options.report}`);
  }

  console.log(`Status: ${model.status}`);
  console.log(`Blocked: ${model.counts.blocked}`);
  console.log(`Warnings: ${model.counts.warning}`);
  console.log(`Unknown: ${model.counts.unknown}`);
  console.log(`Next action: ${model.nextAction}`);

  if (model.status === "blocked") {
    process.exitCode = 1;
  }
}

function parseArgs(args) {
  const options = {
    config: DEFAULT_ADAPTER_CONFIG_PATH,
    report: DEFAULT_READINESS_REPORT_PATH,
    writeReport: true,
  };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    const value = args[index + 1];
    switch (arg) {
      case "--config":
        options.config = requireValue(arg, value);
        index += 1;
        break;
      case "--report":
        options.report = requireValue(arg, value);
        index += 1;
        break;
      case "--no-write-report":
        options.writeReport = false;
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
