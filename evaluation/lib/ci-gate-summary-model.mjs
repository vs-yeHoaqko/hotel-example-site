import { createQualityGateModel } from "./quality-gate-model.mjs";
import { normalizeEvaluationPath } from "./run-health-common.mjs";

export const DEFAULT_CI_GATE_SUMMARY_REPORT_PATH =
  "evaluation/reports/ci-gate-summary.md";

export async function createCiGateSummaryModel({
  repoRoot = process.cwd(),
  qualityGateConfigPath,
  reportPath,
} = {}) {
  const qualityGate = await createQualityGateModel({
    repoRoot,
    configPath: qualityGateConfigPath,
  });
  return createCiGateSummaryFromQualityGate({
    repoRoot,
    qualityGate,
    reportPath:
      reportPath ??
      qualityGate.metadata.ciSummaryReportPath ??
      DEFAULT_CI_GATE_SUMMARY_REPORT_PATH,
  });
}

export function createCiGateSummaryFromQualityGate({
  repoRoot = process.cwd(),
  qualityGate,
  reportPath = DEFAULT_CI_GATE_SUMMARY_REPORT_PATH,
} = {}) {
  const primaryIssue = selectPrimaryIssue(qualityGate);
  const normalizedReportPath = normalizeEvaluationPath({
    repoRoot,
    inputPath: reportPath,
    fieldName: "reportPath",
  });

  return {
    metadata: {
      command: "node evaluation/bin/generate-ci-gate-summary.mjs",
      reportPath: normalizedReportPath,
      generatedAt: new Date().toISOString(),
    },
    status: qualityGate?.status ?? "unknown",
    mode: qualityGate?.latestRun?.mode ?? "unknown",
    target: qualityGate?.latestRun?.target ?? "unknown",
    runId: qualityGate?.latestRun?.runId ?? null,
    primaryIssue,
    recommendedAction:
      primaryIssue?.recommendedAction ??
      qualityGate?.latestRun?.recommendedNextAction?.message ??
      qualityGate?.recommendedActions?.[0] ??
      "No action required.",
    evidence: createEvidenceList({
      qualityGate,
      reportPath: normalizedReportPath,
    }),
    warnings: qualityGate?.warnings ?? [],
  };
}

export function selectPrimaryIssue(qualityGate) {
  if (!qualityGate) {
    return issue({
      id: "quality-gate-unavailable",
      kind: "missing_evidence",
      status: "fail",
      message: "Quality gate model is unavailable.",
      recommendedAction: "Regenerate quality gate evidence.",
    });
  }

  const findings = [
    ...(qualityGate.requiredEvidenceFindings ?? []).map((finding) =>
      issueFromFinding(finding, "missing_evidence"),
    ),
    ...(qualityGate.diagnosticFindings ?? []).map(issueFromDiagnostic),
    ...(qualityGate.thresholdFindings ?? []).map((finding) =>
      issueFromFinding(finding, "threshold"),
    ),
    ...(qualityGate.baselineFindings ?? []).map((finding) =>
      issueFromFinding(finding, "threshold"),
    ),
    ...(qualityGate.thinningFindings ?? []).map((finding) =>
      issueFromFinding(finding, "threshold"),
    ),
  ].filter((finding) => finding.status !== "pass");

  findings.sort(compareIssues);
  return (
    findings[0] ??
    issue({
      id: "none",
      kind: "none",
      status: "pass",
      message: "No quality-gate issue is currently blocking review.",
      recommendedAction: "No action required.",
    })
  );
}

function createEvidenceList({ qualityGate, reportPath }) {
  const paths = [
    reportPath,
    qualityGate?.metadata?.reportPath,
    ...(qualityGate?.evidenceSources ?? []),
  ].filter(Boolean);
  return [...new Set(paths)].map((path) => ({ path }));
}

function issueFromFinding(finding, kind) {
  return issue({
    id: finding.id,
    kind,
    status: finding.status,
    message: finding.message,
    recommendedAction:
      finding.status === "fail"
        ? "Resolve the fail-enforced quality-gate finding."
        : "Review the warning before merging.",
    evidencePath: finding.artifactPath,
  });
}

function issueFromDiagnostic(finding) {
  return issue({
    id: finding.id,
    kind: "diagnostic",
    status: "warn",
    message: finding.message,
    recommendedAction: finding.recommendedAction,
    evidencePath: finding.artifactPath,
  });
}

function issue(overrides) {
  return {
    id: "unknown",
    kind: "unknown",
    status: "unknown",
    message: "",
    recommendedAction: "",
    evidencePath: null,
    ...overrides,
  };
}

function compareIssues(left, right) {
  return (
    compareStatus(left.status, right.status) ||
    compareKind(left.kind, right.kind) ||
    left.id.localeCompare(right.id)
  );
}

function compareStatus(left, right) {
  return statusRank(left) - statusRank(right);
}

function statusRank(status) {
  if (status === "fail") {
    return 0;
  }
  if (status === "warn") {
    return 1;
  }
  return 2;
}

function compareKind(left, right) {
  return kindRank(left) - kindRank(right);
}

function kindRank(kind) {
  if (kind === "missing_evidence") {
    return 0;
  }
  if (kind === "diagnostic") {
    return 1;
  }
  if (kind === "threshold") {
    return 2;
  }
  return 3;
}
