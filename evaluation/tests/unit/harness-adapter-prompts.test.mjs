import assert from "node:assert/strict";
import test from "node:test";
import {
  MAX_ONBOARDING_QUESTIONS,
  planOnboardingQuestions,
} from "../../lib/harness-adapter-prompts.mjs";

test("plans targeted questions with safe defer options", () => {
  const questions = planOnboardingQuestions(baseState());

  assert.equal(
    questions.some((question) => question.id === "browser-target"),
    true,
  );
  assert.equal(
    questions.every((question) =>
      question.options.some((option) => option.label === "defer"),
    ),
    true,
  );
});

test("does not exceed the onboarding question cap", () => {
  const questions = planOnboardingQuestions(baseState(), { limit: 99 });

  assert.equal(MAX_ONBOARDING_QUESTIONS, 10);
  assert.equal(questions.length <= MAX_ONBOARDING_QUESTIONS, true);
});

test("skips prompts for confirmed complete adapter decisions", () => {
  const state = baseState({
    targets: [
      {
        id: "local",
        kind: "browser",
        status: "confirmed",
        source: "confirmed",
      },
    ],
    artifacts: {
      runDirectory: {
        path: "evaluation/runs",
        source: "confirmed",
        ignored: true,
      },
      reports: [],
    },
    behaviorMapping: { status: "confirmed", source: "confirmed" },
    ownership: { status: "confirmed", source: "confirmed" },
    qualityPolicy: {
      status: "confirmed",
      source: "confirmed",
      enforcement: "warning-first",
    },
    ciPolicy: {
      mode: "local-only",
      status: "confirmed",
      source: "confirmed",
    },
  });

  assert.deepEqual(planOnboardingQuestions(state), []);
});

function baseState(overrides = {}) {
  return {
    layers: [
      {
        name: "integration",
        kind: "integration",
        command: ["node", "test"],
        status: "inferred",
      },
    ],
    targets: [],
    artifacts: {
      runDirectory: {
        path: "evaluation/runs",
        source: "inferred",
        ignored: false,
      },
      reports: [],
    },
    behaviorMapping: { status: "unknown", source: "deferred" },
    ownership: { status: "unknown", source: "deferred" },
    qualityPolicy: {
      status: "unknown",
      source: "deferred",
      enforcement: "warning-first",
    },
    ciPolicy: {
      mode: "deferred",
      status: "deferred",
      source: "deferred",
    },
    governance: {
      allowedEditBoundary: ["evaluation/"],
      rollback: "Remove generated adapter.",
      source: "confirmed",
    },
    ...overrides,
  };
}
