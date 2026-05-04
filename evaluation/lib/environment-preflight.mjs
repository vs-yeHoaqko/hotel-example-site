import { spawnSync } from "node:child_process";
import { access, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

export const PREFLIGHT_ARTIFACT = "artifacts/environment-preflight.json";

export async function createEnvironmentPreflight({
  repoRoot = process.cwd(),
  now = new Date(),
  spawnSyncImpl = spawnSync,
  accessImpl = access,
  importPlaywright = () => import("@playwright/test"),
} = {}) {
  const startedAt = now.toISOString();
  const startedTime = now.getTime();
  const checks = [];

  checks.push(checkNodeSpawn({ spawnSyncImpl }));
  checks.push(
    ...(await checkRequiredFiles({
      repoRoot,
      accessImpl,
    })),
  );
  checks.push(
    await checkPlaywrightBrowser({
      accessImpl,
      importPlaywright,
    }),
  );

  const finished = new Date();
  const failed = checks.some((check) => check.status === "failed");

  return {
    schemaVersion: 1,
    status: failed ? "failed" : "passed",
    startedAt,
    finishedAt: finished.toISOString(),
    durationMs: Math.max(0, finished.getTime() - startedTime),
    checks,
  };
}

export async function writeEnvironmentPreflightArtifact({
  repoRoot = process.cwd(),
  runDirRel = process.env.EVALUATION_RUN_DIR ?? "evaluation/runs/manual",
  preflight,
} = {}) {
  const artifactPath = path.resolve(repoRoot, runDirRel, PREFLIGHT_ARTIFACT);
  await mkdir(path.dirname(artifactPath), { recursive: true });
  await writeFile(
    artifactPath,
    `${JSON.stringify(preflight, null, 2)}\n`,
    "utf8",
  );
  return PREFLIGHT_ARTIFACT;
}

function checkNodeSpawn({ spawnSyncImpl }) {
  try {
    const result = spawnSyncImpl(process.execPath, ["--version"], {
      encoding: "utf8",
      shell: false,
      stdio: ["ignore", "pipe", "pipe"],
    });

    if (result.error) {
      return failedCheck({
        id: "node-spawn",
        label: "Subprocess spawn",
        message: result.error.message,
        guidance:
          "Fix local process execution permissions before inspecting product or test failures.",
      });
    }

    if (result.status !== 0) {
      return failedCheck({
        id: "node-spawn",
        label: "Subprocess spawn",
        message: `Node subprocess exited with status ${result.status}.`,
        guidance:
          "Fix local process execution permissions before inspecting product or test failures.",
      });
    }

    return passedCheck({
      id: "node-spawn",
      label: "Subprocess spawn",
      message: "Subprocess spawn is available.",
      details: {
        version: String(result.stdout ?? "").trim(),
      },
    });
  } catch (error) {
    return failedCheck({
      id: "node-spawn",
      label: "Subprocess spawn",
      message: error.message,
      guidance:
        "Fix local process execution permissions before inspecting product or test failures.",
    });
  }
}

async function checkRequiredFiles({ repoRoot, accessImpl }) {
  const requiredFiles = [
    {
      id: "prettier-cli",
      label: "Prettier CLI",
      relativePath: "node_modules/prettier/bin/prettier.cjs",
    },
    {
      id: "playwright-cli",
      label: "Playwright CLI",
      relativePath: "node_modules/@playwright/test/cli.js",
    },
    {
      id: "webpack-cli",
      label: "Webpack CLI",
      relativePath: "node_modules/webpack-cli/bin/cli.js",
    },
  ];

  return Promise.all(
    requiredFiles.map(async (item) => {
      const absolutePath = path.resolve(repoRoot, item.relativePath);
      try {
        await accessImpl(absolutePath);
        return passedCheck({
          id: item.id,
          label: item.label,
          message: `${item.label} is available.`,
          details: { path: item.relativePath },
        });
      } catch (error) {
        return failedCheck({
          id: item.id,
          label: item.label,
          message: `${item.label} is not available at ${item.relativePath}: ${error.message}`,
          guidance:
            "Install dependencies before running the evaluation harness.",
          details: { path: item.relativePath },
        });
      }
    }),
  );
}

async function checkPlaywrightBrowser({ accessImpl, importPlaywright }) {
  try {
    const playwright = await importPlaywright();
    const executablePath = playwright.chromium?.executablePath?.();
    if (!executablePath) {
      return failedCheck({
        id: "playwright-browser",
        label: "Playwright browser runtime",
        message: "Chromium executable path is unavailable.",
        guidance: "Install Playwright browsers before running browser layers.",
      });
    }
    await accessImpl(executablePath);
    return passedCheck({
      id: "playwright-browser",
      label: "Playwright browser runtime",
      message: "Chromium executable is available.",
      details: { executablePath },
    });
  } catch (error) {
    return failedCheck({
      id: "playwright-browser",
      label: "Playwright browser runtime",
      message: error.message,
      guidance: "Install Playwright browsers before running browser layers.",
    });
  }
}

function passedCheck({ id, label, message, details = {} }) {
  return {
    id,
    label,
    status: "passed",
    classification: null,
    message,
    guidance: "No action required.",
    details,
  };
}

function failedCheck({ id, label, message, guidance, details = {} }) {
  return {
    id,
    label,
    status: "failed",
    classification: "environment",
    message,
    guidance,
    details,
  };
}
