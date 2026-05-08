import { spawnSync } from "node:child_process";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import http from "node:http";
import path from "node:path";

export const DEFAULT_HOST = "127.0.0.1";
export const DEFAULT_PORT = 8080;

export function buildSite({ repoRoot }) {
  const webpackCli = path.join(
    repoRoot,
    "node_modules",
    "webpack-cli",
    "bin",
    "cli.js",
  );
  const build = spawnSync(process.execPath, [webpackCli], {
    cwd: repoRoot,
    stdio: "inherit",
    windowsHide: true,
  });

  if (build.status !== 0) {
    throw new Error(`webpack build failed with status ${build.status ?? 1}`);
  }
}

export async function startStaticServer({
  repoRoot,
  host = DEFAULT_HOST,
  port = DEFAULT_PORT,
}) {
  const server = http.createServer(async (request, response) => {
    const filePath = resolveRequestPath(request.url, { repoRoot, host, port });
    if (!filePath) {
      response.writeHead(403);
      response.end("Forbidden");
      return;
    }

    try {
      const stats = await stat(filePath);
      const resolvedPath = stats.isDirectory()
        ? path.join(filePath, "index.html")
        : filePath;
      await stat(resolvedPath);
      response.writeHead(200, { "Content-Type": contentType(resolvedPath) });
      createReadStream(resolvedPath).pipe(response);
    } catch {
      response.writeHead(404);
      response.end("Not Found");
    }
  });

  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, host, () => {
      server.off("error", reject);
      resolve();
    });
  });

  console.log(`Evaluation static server listening on http://${host}:${port}/`);
  return server;
}

export async function stopStaticServer(server) {
  if (!server) {
    return;
  }
  await new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

export async function isServerAvailable({
  host = DEFAULT_HOST,
  port = DEFAULT_PORT,
  timeoutMs = 1000,
} = {}) {
  return new Promise((resolve) => {
    const request = http.get(
      {
        host,
        port,
        path: "/",
        timeout: timeoutMs,
      },
      (response) => {
        response.resume();
        response.on("end", () => resolve(true));
      },
    );
    request.on("timeout", () => {
      request.destroy();
      resolve(false);
    });
    request.on("error", () => resolve(false));
  });
}

function resolveRequestPath(url, { repoRoot, host, port }) {
  let pathname;
  try {
    pathname = new URL(url ?? "/", `http://${host}:${port}`).pathname;
  } catch {
    return null;
  }

  const decoded = decodeURIComponent(pathname);
  const relativePath = decoded === "/" ? "index.html" : decoded.slice(1);
  const resolved = path.resolve(repoRoot, relativePath);
  const relative = path.relative(repoRoot, resolved);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    return null;
  }
  return resolved;
}

function contentType(filePath) {
  switch (path.extname(filePath).toLowerCase()) {
    case ".html":
      return "text/html; charset=utf-8";
    case ".js":
      return "text/javascript; charset=utf-8";
    case ".css":
      return "text/css; charset=utf-8";
    case ".json":
      return "application/json; charset=utf-8";
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".svg":
      return "image/svg+xml";
    case ".ico":
      return "image/x-icon";
    default:
      return "application/octet-stream";
  }
}
