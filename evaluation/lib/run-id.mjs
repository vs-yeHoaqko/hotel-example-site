export function createRunId({ now = new Date(), branch, commit }) {
  const stamp = now
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "Z");
  const branchPart = sanitizeBranch(branch || "unknown");
  const commitPart = (commit || "unknown").slice(0, 7);
  return `${stamp}-${branchPart}-${commitPart}`;
}

function sanitizeBranch(branch) {
  return (
    branch
      .replace(/[^A-Za-z0-9._-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "unknown"
  );
}
