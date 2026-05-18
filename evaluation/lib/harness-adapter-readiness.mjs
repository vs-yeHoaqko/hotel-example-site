import { hasBrowserLayer } from "./harness-adapter-model.mjs";

export const READINESS_STATUS_ORDER = {
  blocked: 0,
  warning: 1,
  unknown: 2,
  pass: 3,
};

export function createReadinessFinding({
  id,
  status,
  stage,
  message,
  evidence = [],
  nextAction = null,
  semantics = null,
}) {
  if (!Object.hasOwn(READINESS_STATUS_ORDER, status)) {
    throw new Error(`Unsupported readiness status: ${status}`);
  }
  if (status !== "pass" && !nextAction) {
    throw new Error(`Finding ${id} must define nextAction for ${status}.`);
  }
  return {
    id,
    status,
    stage,
    message,
    evidence: Array.isArray(evidence) ? evidence : [evidence],
    ...(nextAction ? { nextAction } : {}),
    ...(semantics ? { semantics } : {}),
  };
}

export function aggregateReadinessStatus(findings) {
  if (findings.some((finding) => finding.status === "blocked")) {
    return "blocked";
  }
  if (findings.some((finding) => finding.status === "warning")) {
    return "warning";
  }
  if (findings.some((finding) => finding.status === "unknown")) {
    return "unknown";
  }
  return "pass";
}

export function sortReadinessFindings(findings) {
  return [...findings].sort((a, b) => {
    const statusDelta =
      READINESS_STATUS_ORDER[a.status] - READINESS_STATUS_ORDER[b.status];
    if (statusDelta !== 0) {
      return statusDelta;
    }
    return a.id.localeCompare(b.id);
  });
}

export function validateAdapterReadiness(
  state,
  {
    configPath = "evaluation/config/harness-adapter.json",
    reportPath = "evaluation/reports/harness-adapter-readiness.md",
    checkedAt = new Date().toISOString(),
  } = {},
) {
  const findings = [];
  checkRunnableLayers(state, findings);
  checkLayerCommands(state, findings);
  checkBrowserTargets(state, findings);
  checkArtifactPolicy(state, findings);
  checkBehaviorMapping(state, findings);
  checkOwnership(state, findings);
  checkQualityPolicy(state, findings);
  checkCiPolicy(state, findings);
  checkGovernance(state, findings);

  const sortedFindings = sortReadinessFindings(findings);
  const status = aggregateReadinessStatus(sortedFindings);
  return {
    metadata: {
      checkedAt,
      configPath,
      reportPath,
    },
    status,
    stage: status === "blocked" ? "validate" : "ready-for-first-evidence",
    findings: sortedFindings,
    counts: countFindings(sortedFindings),
    nextAction: nextActionFor(status, sortedFindings),
    ciPolicy: state.ciPolicy,
    nonGoals: [
      "Does not generate or edit GitHub Actions workflows.",
      "Does not run evidence layers.",
      "Does not thin E2E tests.",
      "Does not run repair mode.",
    ],
  };
}

function checkRunnableLayers(state, findings) {
  const runnable = state.layers.filter((layer) => layer.status !== "deferred");
  if (runnable.length === 0) {
    findings.push(
      createReadinessFinding({
        id: "layers-none-runnable",
        status: "blocked",
        stage: "classify",
        message: "No non-deferred evidence layer is configured.",
        evidence: ["layers"],
        nextAction: "Confirm or add at least one runnable evidence layer.",
      }),
    );
    return;
  }
  findings.push(
    createReadinessFinding({
      id: "layers-runnable",
      status: "pass",
      stage: "classify",
      message: `${runnable.length} non-deferred evidence layer(s) are configured.`,
      evidence: ["layers"],
    }),
  );
}

function checkLayerCommands(state, findings) {
  for (const layer of state.layers) {
    if (layer.status === "deferred") {
      continue;
    }
    if (!Array.isArray(layer.command) || layer.command.length === 0) {
      findings.push(
        createReadinessFinding({
          id: `layer-${layer.name}-command-missing`,
          status: layer.required ? "blocked" : "warning",
          stage: "configure",
          message: `Layer "${layer.name}" does not define a command.`,
          evidence: [`layers.${layer.name}.command`],
          nextAction: `Add or defer the "${layer.name}" layer command.`,
        }),
      );
    } else if (layer.source === "inferred") {
      findings.push(
        createReadinessFinding({
          id: `layer-${layer.name}-command-inferred`,
          status: "warning",
          stage: "configure",
          message: `Layer "${layer.name}" command is inferred but not confirmed.`,
          evidence: [`layers.${layer.name}.command`],
          nextAction: `Confirm or override the "${layer.name}" command.`,
        }),
      );
    }
  }
}

function checkBrowserTargets(state, findings) {
  if (!hasBrowserLayer(state)) {
    findings.push(
      createReadinessFinding({
        id: "browser-target-not-required",
        status: "pass",
        stage: "configure",
        message: "No browser layer requires a target policy.",
        evidence: ["layers"],
      }),
    );
    return;
  }
  if (state.targets.length === 0) {
    findings.push(
      createReadinessFinding({
        id: "browser-target-missing",
        status: "blocked",
        stage: "configure",
        message: "A browser evidence layer exists without a target policy.",
        evidence: ["targets"],
        nextAction: "Confirm a local or deployed browser target.",
      }),
    );
    return;
  }
  if (state.targets.some((target) => target.source === "inferred")) {
    findings.push(
      createReadinessFinding({
        id: "browser-target-inferred",
        status: "warning",
        stage: "configure",
        message: "Browser target policy is inferred and needs review.",
        evidence: ["targets"],
        nextAction: "Confirm or override the browser target policy.",
      }),
    );
    return;
  }
  findings.push(
    createReadinessFinding({
      id: "browser-target-present",
      status: "pass",
      stage: "configure",
      message: "Browser target policy is configured.",
      evidence: ["targets"],
    }),
  );
}

function checkArtifactPolicy(state, findings) {
  if (state.artifacts.runDirectory.ignored !== true) {
    findings.push(
      createReadinessFinding({
        id: "artifact-run-directory-not-ignored",
        status: "blocked",
        stage: "configure",
        message: "Generated run artifacts are not confirmed as ignored.",
        evidence: ["artifacts.runDirectory"],
        nextAction: "Ignore generated run artifacts before first evidence.",
      }),
    );
    return;
  }
  findings.push(
    createReadinessFinding({
      id: "artifact-run-directory-ignored",
      status: "pass",
      stage: "configure",
      message: "Generated run artifact path is confirmed as ignored.",
      evidence: ["artifacts.runDirectory"],
    }),
  );
}

function checkBehaviorMapping(state, findings) {
  if (state.behaviorMapping.status === "confirmed") {
    findings.push(
      createReadinessFinding({
        id: "behavior-mapping-confirmed",
        status: "pass",
        stage: "classify",
        message: "Behavior mapping policy is confirmed.",
        evidence: ["behaviorMapping"],
      }),
    );
    return;
  }
  findings.push(
    createReadinessFinding({
      id: "behavior-mapping-unknown",
      status: "unknown",
      stage: "classify",
      message:
        "Behavior mapping is not confirmed; coverage claims must remain visible as unknown.",
      evidence: ["behaviorMapping"],
      nextAction: "Review behavior mapping before claiming coverage.",
      semantics: "unmapped",
    }),
  );
}

function checkOwnership(state, findings) {
  if (state.ownership.status === "confirmed") {
    findings.push(
      createReadinessFinding({
        id: "ownership-confirmed",
        status: "pass",
        stage: "classify",
        message: "Ownership policy is confirmed.",
        evidence: ["ownership"],
      }),
    );
    return;
  }
  findings.push(
    createReadinessFinding({
      id: "ownership-missing",
      status: "warning",
      stage: "classify",
      message:
        "Ownership policy is not confirmed; E2E thinning remains blocked.",
      evidence: ["ownership"],
      nextAction: "Add owner-layer policy before E2E thinning readiness.",
      semantics: "weak-signal",
    }),
  );
}

function checkQualityPolicy(state, findings) {
  if (
    state.qualityPolicy.enforcement === "fail-enforced" &&
    state.qualityPolicy.source !== "confirmed"
  ) {
    findings.push(
      createReadinessFinding({
        id: "quality-policy-unreviewed-fail-enforced",
        status: "warning",
        stage: "validate",
        message:
          "Fail-enforced quality policy is not confirmed by reviewed evidence.",
        evidence: ["qualityPolicy"],
        nextAction: "Keep thresholds warning-first until evidence is reviewed.",
      }),
    );
    return;
  }
  findings.push(
    createReadinessFinding({
      id: "quality-policy-ready",
      status: "pass",
      stage: "validate",
      message: `Quality policy is ${state.qualityPolicy.enforcement}.`,
      evidence: ["qualityPolicy"],
    }),
  );
}

function checkCiPolicy(state, findings) {
  if (state.ciPolicy.mode === "deferred") {
    findings.push(
      createReadinessFinding({
        id: "ci-policy-deferred",
        status: "warning",
        stage: "validate",
        message: "CI or recurring execution policy is deferred.",
        evidence: ["ciPolicy"],
        nextAction:
          "Choose GitHub Actions, another provider, or local-only policy.",
      }),
    );
    return;
  }
  if (
    state.ciPolicy.mode === "github-actions" &&
    state.ciPolicy.status !== "confirmed"
  ) {
    findings.push(
      createReadinessFinding({
        id: "ci-policy-inferred-github-actions",
        status: "warning",
        stage: "validate",
        message: "GitHub Actions policy is inferred but not confirmed.",
        evidence: ["ciPolicy"],
        nextAction:
          "Confirm repository guard, install command, and artifact policy before enabling CI.",
      }),
    );
    return;
  }
  findings.push(
    createReadinessFinding({
      id: "ci-policy-recorded",
      status: "pass",
      stage: "validate",
      message: `CI policy is recorded as ${state.ciPolicy.mode}.`,
      evidence: ["ciPolicy"],
    }),
  );
}

function checkGovernance(state, findings) {
  const outsideBoundary = state.governance.allowedEditBoundary.some(
    (boundary) => !boundary.startsWith("evaluation/"),
  );
  if (outsideBoundary && !state.governance.rollback) {
    findings.push(
      createReadinessFinding({
        id: "governance-rollback-missing",
        status: "blocked",
        stage: "configure",
        message:
          "Governance allows outside-evaluation changes without rollback.",
        evidence: ["governance"],
        nextAction:
          "Add rollback guidance or keep edit boundary evaluation-local.",
      }),
    );
    return;
  }
  findings.push(
    createReadinessFinding({
      id: "governance-boundary-recorded",
      status: "pass",
      stage: "configure",
      message: "Governance boundary and rollback policy are recorded.",
      evidence: ["governance"],
    }),
  );
}

function countFindings(findings) {
  return findings.reduce(
    (counts, finding) => {
      counts[finding.status] += 1;
      return counts;
    },
    { blocked: 0, warning: 0, unknown: 0, pass: 0 },
  );
}

function nextActionFor(status, findings) {
  const firstNonPass = findings.find((finding) => finding.status !== "pass");
  if (firstNonPass?.nextAction) {
    return firstNonPass.nextAction;
  }
  if (status === "pass") {
    return "Proceed to first evidence planning.";
  }
  return "Review readiness findings.";
}
