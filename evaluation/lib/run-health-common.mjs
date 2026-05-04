import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

export async function fileExists(absolutePath) {
  try {
    await stat(absolutePath);
    return true;
  } catch (error) {
    if (error?.code === "ENOENT") {
      return false;
    }
    throw error;
  }
}

export async function safeReaddir(absoluteDirectory, warnings, label) {
  try {
    return await readdir(absoluteDirectory, { withFileTypes: true });
  } catch (error) {
    if (error?.code === "ENOENT") {
      warnings.push(`${label}: directory does not exist`);
      return [];
    }
    throw error;
  }
}

export async function safeReadJson(absolutePath, warnings, label) {
  try {
    const file = await stat(absolutePath);
    if (!file.isFile()) {
      warnings.push(`${label}: not a file`);
      return null;
    }
    return JSON.parse(await readFile(absolutePath, "utf8"));
  } catch (error) {
    if (error?.code === "ENOENT") {
      warnings.push(`${label}: missing`);
      return null;
    }
    if (error instanceof SyntaxError) {
      warnings.push(`${label}: malformed JSON (${error.message})`);
      return null;
    }
    throw error;
  }
}

export function normalizeEvaluationPath({ repoRoot, inputPath, fieldName }) {
  if (typeof inputPath !== "string" || inputPath.trim() === "") {
    throw new Error(`${fieldName} must be a non-empty string`);
  }
  if (path.isAbsolute(inputPath)) {
    throw new Error(`${fieldName} must be relative to the repository root`);
  }

  const resolved = path.resolve(repoRoot, inputPath);
  const evaluationRoot = path.resolve(repoRoot, "evaluation");
  if (
    resolved !== evaluationRoot &&
    !resolved.startsWith(`${evaluationRoot}${path.sep}`)
  ) {
    throw new Error(`${fieldName} must stay under evaluation/`);
  }
  return toPosix(path.relative(repoRoot, resolved));
}

export function assertPositiveInteger(value, fieldName) {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${fieldName} must be a positive integer`);
  }
  return value;
}

export function removeUndefined(value) {
  return Object.fromEntries(
    Object.entries(value).filter(([, item]) => item !== undefined),
  );
}

export function stringOrDefault(value, fallback) {
  return typeof value === "string" ? value : fallback;
}

export function numberOrNull(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export function numberOrDefault(value, fallback) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

export function trimMessage(message) {
  return message.replace(/\s+/g, " ").trim().slice(0, 300);
}

export function toPosix(value) {
  return value.replaceAll(path.sep, "/");
}
