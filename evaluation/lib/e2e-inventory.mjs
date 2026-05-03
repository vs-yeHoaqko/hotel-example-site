import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const TEST_RE =
  /^\s*test(?:\.(?:only|skip|fixme|fail|slow))?\(\s*(['"`])((?:\\.|(?!\1).)*)\1/;
const DESCRIBE_RE =
  /^\s*test\.describe(?:\.(?:only|skip|fixme))?\(\s*(['"`])((?:\\.|(?!\1).)*)\1/;

export async function createE2EInventory({ repoRoot = process.cwd() } = {}) {
  const e2eRoot = path.join(repoRoot, "e2e");
  const files = await listSpecFiles(e2eRoot, repoRoot);
  const entries = [];

  for (const file of files) {
    entries.push(...(await extractInventoryFromFile(file, { repoRoot })));
  }

  return entries.sort((left, right) =>
    `${left.path}:${left.ordinal}`.localeCompare(
      `${right.path}:${right.ordinal}`,
    ),
  );
}

export async function extractInventoryFromFile(
  filePath,
  { repoRoot = process.cwd() } = {},
) {
  const source = await readFile(filePath, "utf8");
  const relativePath = toRepoPath(path.relative(repoRoot, filePath));
  const lines = source.split(/\r?\n/);
  const entries = [];
  let describeTitle = null;

  for (const [index, line] of lines.entries()) {
    const describeMatch = line.match(DESCRIBE_RE);
    if (describeMatch) {
      describeTitle = unescapeTitle(describeMatch[2]);
      continue;
    }

    const testMatch = line.match(TEST_RE);
    if (!testMatch) {
      continue;
    }

    entries.push({
      path: relativePath,
      line: index + 1,
      ordinal: entries.length,
      title: unescapeTitle(testMatch[2]),
      describe: describeTitle ? [describeTitle] : [],
    });
  }

  return entries;
}

async function listSpecFiles(dir, repoRoot) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const absolutePath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listSpecFiles(absolutePath, repoRoot)));
    } else if (entry.isFile() && entry.name.endsWith(".spec.ts")) {
      files.push(absolutePath);
    }
  }

  return files.sort((left, right) =>
    toRepoPath(path.relative(repoRoot, left)).localeCompare(
      toRepoPath(path.relative(repoRoot, right)),
    ),
  );
}

function unescapeTitle(title) {
  return title
    .replaceAll("\\'", "'")
    .replaceAll('\\"', '"')
    .replaceAll("\\`", "`")
    .replaceAll("\\\\", "\\");
}

function toRepoPath(value) {
  return value.split(path.sep).join("/");
}
