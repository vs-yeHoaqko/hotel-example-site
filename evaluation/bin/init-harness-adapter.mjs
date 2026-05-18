#!/usr/bin/env node
import { writeFile } from "node:fs/promises";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import {
  DEFAULT_ADAPTER_CONFIG_PATH,
  createAdapterDraft,
  readAdapterStateIfExists,
  writeAdapterState,
} from "../lib/harness-adapter-model.mjs";
import {
  discoverRepository,
  summarizeDiscovery,
} from "../lib/harness-adapter-discovery.mjs";
import { planOnboardingQuestions } from "../lib/harness-adapter-prompts.mjs";

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const repoRoot = process.cwd();
  const discovery = await discoverRepository({ repoRoot });
  const existingState = await readAdapterStateIfExists(options.config, {
    repoRoot,
  });
  const initialDraft = createAdapterDraft({ discovery, existingState });
  const questions = planOnboardingQuestions(initialDraft.state);
  const draft = createAdapterDraft({ discovery, existingState, questions });

  if (!options.nonInteractive && !options.dryRun) {
    await collectAnswers(draft.state);
  }

  printSummary({ discovery, draft, configPath: options.config });

  if (options.dryRun) {
    console.log("Dry run: no files written.");
    return;
  }

  if (options.write) {
    await writeAdapterState(draft.state, options.config, { repoRoot });
    console.log(`Wrote harness adapter: ${options.config}`);
    return;
  }

  console.log("No write requested. Re-run with --write to save adapter state.");
}

function parseArgs(args) {
  const options = {
    config: DEFAULT_ADAPTER_CONFIG_PATH,
    dryRun: true,
    write: false,
    nonInteractive: false,
  };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    const value = args[index + 1];
    switch (arg) {
      case "--config":
        options.config = requireValue(arg, value);
        index += 1;
        break;
      case "--dry-run":
        options.dryRun = true;
        break;
      case "--write":
        options.write = true;
        options.dryRun = false;
        break;
      case "--non-interactive":
        options.nonInteractive = true;
        break;
      default:
        throw new Error(`Unknown option: ${arg}`);
    }
  }
  return options;
}

async function collectAnswers(state) {
  if (state.questions.length === 0) {
    return;
  }
  const readline = createInterface({ input, output });
  try {
    for (const question of state.questions) {
      console.log("");
      console.log(`${question.topic}: ${question.prompt}`);
      question.options.forEach((option, index) => {
        console.log(`${index + 1}. ${option.label}`);
      });
      const answer = await readline.question(
        "Choose an option number, or press Enter to defer: ",
      );
      const selected = question.options[Number(answer) - 1];
      if (!selected) {
        question.status = "deferred";
        state.decisions.push({
          id: `${question.id}-deferred`,
          topic: question.topic,
          source: "deferred",
          status: "deferred",
          rationale: "Maintainer deferred this onboarding question.",
        });
        continue;
      }
      question.status = "answered";
      state.decisions.push({
        id: `${question.id}-answer`,
        topic: question.topic,
        source: "confirmed",
        status: "confirmed",
        value: selected.label,
        rationale: "Maintainer answered during onboarding.",
      });
    }
  } finally {
    readline.close();
  }
}

function printSummary({ discovery, draft, configPath }) {
  const summary = summarizeDiscovery(discovery);
  console.log("Harness adapter onboarding");
  console.log(`Config: ${configPath}`);
  console.log(`Discovered facts: ${summary.totalFacts}`);
  console.log(`Scripts: ${summary.scripts}`);
  console.log(`Test roots: ${summary.testRoots}`);
  console.log(`CI files: ${summary.ciFiles}`);
  console.log(`Ignore rules: ${summary.ignoreRules}`);
  console.log(`Proposed layers: ${draft.state.layers.length}`);
  console.log(`Pending questions: ${draft.state.questions.length}`);
  console.log(`Conflicts: ${draft.conflicts.length}`);
  for (const conflict of draft.conflicts) {
    console.log(`- Conflict ${conflict.id}: ${conflict.rationale}`);
  }
  for (const question of draft.state.questions) {
    console.log(`- Question ${question.id}: ${question.prompt}`);
  }
}

function requireValue(arg, value) {
  if (!value || value.startsWith("--")) {
    throw new Error(`${arg} requires a value`);
  }
  return value;
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
