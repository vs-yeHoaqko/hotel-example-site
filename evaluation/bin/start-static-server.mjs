#!/usr/bin/env node
import {
  DEFAULT_HOST,
  DEFAULT_PORT,
  buildSite,
  startStaticServer,
  stopStaticServer,
} from "../lib/static-server.mjs";

const repoRoot = process.cwd();
const host = process.env.EVALUATION_SERVER_HOST ?? DEFAULT_HOST;
const port = Number.parseInt(
  process.env.EVALUATION_SERVER_PORT ?? String(DEFAULT_PORT),
  10,
);

buildSite({ repoRoot });
const server = await startStaticServer({ repoRoot, host, port });

async function shutdown() {
  await stopStaticServer(server);
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
