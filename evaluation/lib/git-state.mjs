import { execFileSync } from "node:child_process";

export function getRepositoryState({ repoRoot = process.cwd() } = {}) {
  const branch = runGit(["branch", "--show-current"], repoRoot) || "unknown";
  const commit =
    runGit(["rev-parse", "--short=7", "HEAD"], repoRoot) || "unknown";
  const status = runGit(["status", "--porcelain=v1", "-uall"], repoRoot);
  const changedFiles = parsePorcelainStatus(status);
  return {
    branch,
    commit,
    dirty: changedFiles.length > 0,
    changedFiles,
  };
}

function runGit(args, cwd) {
  try {
    return execFileSync("git", args, {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return "";
  }
}

export function parsePorcelainStatus(status) {
  if (!status.trim()) {
    return [];
  }
  return status
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => {
      const code = line.slice(0, 2);
      const rawPath = line.slice(3);
      const path = normalizeStatusPath(rawPath);
      return {
        path,
        status: mapStatus(code),
      };
    });
}

function normalizeStatusPath(rawPath) {
  const renameParts = rawPath.split(" -> ");
  const path = renameParts[renameParts.length - 1];
  return path.replace(/^"|"$/g, "").replaceAll("\\", "/");
}

function mapStatus(code) {
  if (code === "??") {
    return "untracked";
  }
  if (code.includes("R")) {
    return "renamed";
  }
  if (code.includes("A")) {
    return "added";
  }
  if (code.includes("D")) {
    return "deleted";
  }
  if (code.includes("M")) {
    return "modified";
  }
  return "unknown";
}
