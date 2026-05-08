#!/usr/bin/env node
import { spawn } from "node:child_process";
import path from "node:path";
import {
  DEFAULT_HOST,
  DEFAULT_PORT,
  buildSite,
  isServerAvailable,
  startStaticServer,
  stopStaticServer,
} from "../lib/static-server.mjs";

const repoRoot = process.cwd();
const useDeployedSite = process.env.USE_DEPLOYED_SITE === "true";
const host = process.env.EVALUATION_SERVER_HOST ?? DEFAULT_HOST;
const port = Number.parseInt(
  process.env.EVALUATION_SERVER_PORT ?? String(DEFAULT_PORT),
  10,
);

let server = null;

try {
  if (!useDeployedSite) {
    const canReuseServer =
      !process.env.CI && (await isServerAvailable({ host, port }));
    if (!canReuseServer) {
      buildSite({ repoRoot });
      server = await startStaticServer({ repoRoot, host, port });
    }
  }

  const playwrightCli = path.join(
    repoRoot,
    "node_modules",
    "@playwright",
    "test",
    "cli.js",
  );
  process.exitCode = await runCommand(process.execPath, [
    playwrightCli,
    "test",
    ...process.argv.slice(2),
  ]);
} catch (error) {
  console.error(error.stack || error.message);
  process.exitCode = 1;
} finally {
  await stopStaticServer(server);
}

function runCommand(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: repoRoot,
      env: {
        ...process.env,
        EVALUATION_SKIP_WEB_SERVER: "true",
      },
      stdio: "inherit",
      windowsHide: true,
    });
    child.on("error", reject);
    child.on("close", (exitCode) => resolve(exitCode ?? 1));
  });
}
