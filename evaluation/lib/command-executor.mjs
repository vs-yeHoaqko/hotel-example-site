import { spawn, spawnSync } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { formatCommandDisplay } from "./command-format.mjs";
import { redactArgv, redactEnv, redactText } from "./redaction.mjs";

export async function executeLayer(layer, { repoRoot, runDirRel }) {
  const runDirAbs = path.resolve(repoRoot, runDirRel);
  await mkdir(path.join(runDirAbs, "logs"), { recursive: true });
  await mkdir(path.join(runDirAbs, "artifacts"), { recursive: true });

  const configuredArgv = [...layer.command];
  const executedArgv = resolveExecutableArgv(
    configuredArgv.map((arg) => arg.replaceAll("{runDir}", runDirRel)),
  );
  const runnerEnv = {
    EVALUATION_LAYER_NAME: layer.name,
    EVALUATION_RUN_DIR: runDirRel,
  };
  const startedAt = Date.now();
  const stdoutChunks = [];
  const stderrChunks = [];

  const result = await new Promise((resolve) => {
    let child;
    try {
      child = spawn(executedArgv[0], executedArgv.slice(1), {
        cwd: repoRoot,
        env: {
          ...process.env,
          ...runnerEnv,
        },
        shell: false,
        windowsHide: true,
      });
    } catch (error) {
      resolve({
        startError: error.message,
        exitCode: null,
        timedOut: false,
      });
      return;
    }

    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      child.kill("SIGTERM");
    }, layer.timeoutMs);

    child.stdout?.on("data", (chunk) => stdoutChunks.push(chunk));
    child.stderr?.on("data", (chunk) => stderrChunks.push(chunk));
    child.on("error", (error) => {
      clearTimeout(timer);
      resolve({
        startError: error.message,
        exitCode: null,
        timedOut,
      });
    });
    child.on("close", (exitCode) => {
      clearTimeout(timer);
      resolve({
        startError: null,
        exitCode,
        timedOut,
      });
    });
  });

  const durationMs = Date.now() - startedAt;
  const stdout = redactText(Buffer.concat(stdoutChunks).toString("utf8"));
  const stderr = redactText(
    [
      Buffer.concat(stderrChunks).toString("utf8"),
      result.startError ? `\n${result.startError}` : "",
    ].join(""),
  );
  const stdoutArtifact = `logs/${layer.name}.stdout.log`;
  const stderrArtifact = `logs/${layer.name}.stderr.log`;
  await writeFile(path.join(runDirAbs, stdoutArtifact), stdout, "utf8");
  await writeFile(path.join(runDirAbs, stderrArtifact), stderr, "utf8");

  const status =
    result.exitCode === 0 && !result.timedOut ? "passed" : "failed";
  const counts =
    status === "passed"
      ? { passed: 1, failed: 0, skipped: 0, timeout: 0 }
      : { passed: 0, failed: 1, skipped: 0, timeout: result.timedOut ? 1 : 0 };

  return {
    name: layer.name,
    required: layer.required,
    status,
    command: {
      configuredArgv: redactArgv(configuredArgv),
      executedArgv: redactArgv(executedArgv),
      env: redactEnv(runnerEnv),
      display: formatCommandDisplay(executedArgv),
    },
    exitCode: result.exitCode,
    durationMs,
    timedOut: result.timedOut,
    skippedReason: null,
    counts,
    classification: null,
    artifacts: collectArtifacts(layer.name, [stdoutArtifact, stderrArtifact]),
    stdout,
    stderr,
    startError: result.startError,
  };
}

export function skippedLayerResult(layer, reason, classification = null) {
  return {
    name: layer.name,
    required: layer.required,
    status: "skipped",
    command: {
      configuredArgv: redactArgv(layer.command),
      executedArgv: [],
      env: {},
      display: "",
    },
    exitCode: null,
    durationMs: 0,
    timedOut: false,
    skippedReason: reason,
    counts: { passed: 0, failed: 0, skipped: 1, timeout: 0 },
    classification,
    artifacts: [],
  };
}

function collectArtifacts(layerName, baseArtifacts) {
  const artifacts = [...baseArtifacts];
  if (layerName === "integration") {
    artifacts.push("artifacts/integration-results.json");
  } else if (layerName === "smoke-e2e") {
    artifacts.push("artifacts/smoke-results.json");
  } else if (layerName === "full-e2e") {
    artifacts.push("artifacts/full-e2e-results.json");
  }
  return artifacts;
}

function resolveExecutableArgv(argv) {
  if (argv[0] !== "pnpm" || commandAvailable("pnpm", ["--version"])) {
    return argv;
  }
  if (commandAvailable("corepack", ["pnpm", "--version"])) {
    return ["corepack", "pnpm", ...argv.slice(1)];
  }
  return argv;
}

function commandAvailable(command, args) {
  const result = spawnSync(command, args, {
    encoding: "utf8",
    stdio: ["ignore", "ignore", "ignore"],
    shell: false,
  });
  return result.status === 0;
}
