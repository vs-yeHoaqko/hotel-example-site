const MAX_QUESTIONS = 10;

export function planOnboardingQuestions(state, { limit = MAX_QUESTIONS } = {}) {
  const questions = [];

  if (!state.layers.some((layer) => layer.status !== "deferred")) {
    questions.push(
      question({
        id: "layer-classification",
        stage: "classify",
        topic: "Layer classification",
        prompt:
          "Which discovered test command or root should become the first runnable evidence layer?",
        options: ["confirm discovered layer", "add custom layer", "defer"],
        requiredFor: ["ready-for-first-evidence"],
      }),
    );
  }

  if (hasBrowserLayer(state) && state.targets.length === 0) {
    questions.push(
      question({
        id: "browser-target",
        stage: "configure",
        topic: "Browser target",
        prompt: "Which local or deployed target should browser evidence use?",
        options: ["local target", "deployed target", "defer"],
        requiredFor: ["ready-for-first-evidence"],
      }),
    );
  }

  if (state.artifacts.runDirectory.ignored !== true) {
    questions.push(
      question({
        id: "artifact-policy",
        stage: "configure",
        topic: "Artifact policy",
        prompt:
          "Should generated run artifacts be ignored before first evidence?",
        options: ["confirm ignored", "update ignore rules later", "defer"],
        requiredFor: ["ready-for-first-evidence"],
      }),
    );
  }

  if (state.behaviorMapping.status !== "confirmed") {
    questions.push(
      question({
        id: "behavior-mapping",
        stage: "classify",
        topic: "Behavior mapping",
        prompt:
          "How should tests map to user-facing behavior for coverage claims?",
        options: ["confirm existing mapping", "create mapping later", "defer"],
        requiredFor: ["report-review"],
      }),
    );
  }

  if (state.ownership.status !== "confirmed") {
    questions.push(
      question({
        id: "ownership-policy",
        stage: "classify",
        topic: "Ownership policy",
        prompt:
          "Which layer owns each behavior before E2E thinning is considered?",
        options: ["confirm ownership", "review later", "defer"],
        requiredFor: ["e2e-thinning-readiness"],
      }),
    );
  }

  if (state.qualityPolicy.status !== "confirmed") {
    questions.push(
      question({
        id: "quality-policy",
        stage: "validate",
        topic: "Quality policy",
        prompt: "Should initial thresholds be warning-first or fail-enforced?",
        options: ["warning-first", "fail-enforced after evidence", "defer"],
        requiredFor: ["quality-gate"],
      }),
    );
  }

  if (state.ciPolicy.status !== "confirmed") {
    questions.push(
      question({
        id: "ci-policy",
        stage: "validate",
        topic: "CI policy",
        prompt: "How should this adapter represent CI or recurring execution?",
        options: ["github-actions", "other provider", "local-only", "defer"],
        requiredFor: ["ci-or-recurring-use"],
      }),
    );
  }

  if (!state.governance.rollback) {
    questions.push(
      question({
        id: "governance-rollback",
        stage: "configure",
        topic: "Governance",
        prompt:
          "What rollback path should be recorded for generated adapter artifacts?",
        options: ["remove generated adapter files", "custom rollback", "defer"],
        requiredFor: ["governance-review"],
      }),
    );
  }

  return questions.slice(0, limit);
}

export const MAX_ONBOARDING_QUESTIONS = MAX_QUESTIONS;

function question({ id, stage, topic, prompt, options, requiredFor }) {
  return {
    id,
    stage,
    topic,
    prompt,
    options: options.map((label) => ({ label })),
    requiredFor,
    status: "pending",
  };
}

function hasBrowserLayer(state) {
  return state.layers.some((layer) =>
    ["integration", "smoke-e2e", "full-e2e"].includes(layer.kind),
  );
}
