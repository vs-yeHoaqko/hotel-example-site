import path from "node:path";
import { isEnvironmentMessage } from "./environment-signals.mjs";
import {
  numberOrDefault,
  safeReadJson,
  stringOrDefault,
  toPosix,
  trimMessage,
} from "./run-health-common.mjs";

const UNSTABLE_RESULT_STATUSES = new Set(["failed", "timedOut", "interrupted"]);
const UNSTABLE_TEST_STATUSES = new Set(["unexpected", "flaky", "timedOut"]);

export async function readRunHealthEvidence({
  repoRoot,
  config,
  selectedRuns,
  warnings,
}) {
  const slowTests = [];
  const instabilityEvidence = [];
  const environmentEvidence = [];
  const preflightEvidence = [];

  for (const run of selectedRuns) {
    for (const layer of run.layers) {
      for (const artifactPath of layer.artifacts) {
        if (!artifactPath.endsWith(".json")) {
          continue;
        }

        const absoluteArtifactPath = path.resolve(
          repoRoot,
          config.runsDirectory,
          run.runDirectory,
          artifactPath,
        );
        const relativeArtifactPath = toPosix(
          path.relative(repoRoot, absoluteArtifactPath),
        );
        const result = await safeReadJson(
          absoluteArtifactPath,
          warnings,
          relativeArtifactPath,
        );
        if (artifactPath === "artifacts/environment-preflight.json") {
          if (result) {
            extractPreflightEvidence({
              result,
              run,
              layer,
              artifactPath: relativeArtifactPath,
              preflightEvidence,
              environmentEvidence,
              warnings,
            });
          }
          continue;
        }

        if (!result || !Array.isArray(result.suites)) {
          if (result) {
            warnings.push(
              `${relativeArtifactPath}: missing or invalid Playwright suites array`,
            );
          }
          continue;
        }

        const observations = extractPlaywrightObservations({
          result,
          run,
          layer,
          artifactPath: relativeArtifactPath,
        });

        for (const observation of observations) {
          if (observation.durationMs >= config.testSlowThresholdMs) {
            slowTests.push(observation);
          }

          if (isUnstableObservation(observation)) {
            const target =
              observation.classification === "environment"
                ? environmentEvidence
                : instabilityEvidence;
            target.push({
              kind: "test",
              runId: observation.runId,
              layer: observation.layer,
              title: observation.title,
              file: observation.file,
              status: observation.status,
              retry: observation.retry,
              durationMs: observation.durationMs,
              classification: observation.classification,
              artifactPath: observation.artifactPath,
              messages: observation.messages,
            });
          }
        }
      }
    }

    collectDiagnosticEvidence({ run, environmentEvidence });
  }

  return {
    slowTests,
    instabilityEvidence,
    environmentEvidence,
    preflightEvidence,
  };
}

export function addLayerInstabilityEvidence({
  selectedRuns,
  instabilityEvidence,
  environmentEvidence,
}) {
  for (const run of selectedRuns) {
    for (const layer of run.layers) {
      if (!isUnstableLayer(layer)) {
        continue;
      }
      const classification = classifyLayer(layer);
      const target =
        classification === "environment"
          ? environmentEvidence
          : instabilityEvidence;
      target.push({
        kind: "layer",
        runId: run.runId,
        layer: layer.name,
        title: `${layer.name} layer`,
        file: "",
        status: layer.timedOut ? "timedOut" : layer.status,
        retry: 0,
        durationMs: layer.durationMs,
        classification,
        artifactPath: run.summaryPath,
        messages: [layer.skippedReason].filter(Boolean),
      });
    }
  }
}

function collectDiagnosticEvidence({ run, environmentEvidence }) {
  for (const diagnostic of run.diagnostics) {
    const message = stringOrDefault(diagnostic.message, "");
    const classification = stringOrDefault(
      diagnostic.classification,
      isEnvironmentMessage(message) ? "environment" : "unknown",
    );
    if (classification === "environment") {
      environmentEvidence.push({
        kind: "diagnostic",
        runId: run.runId,
        layer: stringOrDefault(diagnostic.layer, "unknown"),
        title: "Run diagnostic",
        file: "",
        status: stringOrDefault(diagnostic.status, run.status),
        retry: 0,
        durationMs: null,
        classification,
        artifactPath: run.summaryPath,
        messages: [message].filter(Boolean),
      });
    }
  }
}

function extractPreflightEvidence({
  result,
  run,
  layer,
  artifactPath,
  preflightEvidence,
  environmentEvidence,
  warnings,
}) {
  if (!Array.isArray(result.checks)) {
    warnings.push(`${artifactPath}: missing or invalid preflight checks array`);
    return;
  }

  for (const check of result.checks) {
    const item = {
      kind: "preflight",
      runId: run.runId,
      layer: layer.name,
      title: stringOrDefault(check.label, stringOrDefault(check.id, "check")),
      file: "",
      status: stringOrDefault(check.status, "unknown"),
      retry: 0,
      durationMs: null,
      classification: check.classification ?? null,
      artifactPath,
      messages: [
        stringOrDefault(check.message, ""),
        stringOrDefault(check.guidance, ""),
      ].filter(Boolean),
    };
    preflightEvidence.push(item);
    if (item.status === "failed" || item.classification === "environment") {
      environmentEvidence.push({
        ...item,
        classification: "environment",
      });
    }
  }
}

export function extractPlaywrightObservations({
  result,
  run,
  layer,
  artifactPath,
}) {
  const observations = [];
  walkSuites(result.suites, [], (suiteTitles, spec) => {
    const title = [...suiteTitles, spec.title].filter(Boolean).join(" > ");
    const file = spec.file ?? "";
    const line = Number.isInteger(spec.line) ? spec.line : null;

    for (const test of Array.isArray(spec.tests) ? spec.tests : []) {
      const testStatus = stringOrDefault(test.status, "unknown");
      const expectedStatus = stringOrDefault(test.expectedStatus, "unknown");
      const project = stringOrDefault(test.projectName, "");
      const results = Array.isArray(test.results) ? test.results : [];

      if (results.length === 0) {
        observations.push(
          createObservation({
            run,
            layer,
            title,
            file,
            line,
            project,
            status: testStatus,
            expectedStatus,
            retry: 0,
            durationMs: 0,
            artifactPath,
            messages: [],
          }),
        );
        continue;
      }

      for (const resultEntry of results) {
        const messages = extractResultMessages(resultEntry);
        observations.push(
          createObservation({
            run,
            layer,
            title,
            file,
            line,
            project,
            status: stringOrDefault(resultEntry.status, testStatus),
            testStatus,
            expectedStatus,
            retry: Number.isInteger(resultEntry.retry) ? resultEntry.retry : 0,
            durationMs: numberOrDefault(resultEntry.duration, 0),
            artifactPath,
            messages,
          }),
        );
      }
    }
  });
  return observations;
}

function walkSuites(suites, parentTitles, visitSpec) {
  for (const suite of suites) {
    const suiteTitle = typeof suite.title === "string" ? suite.title : "";
    const nextTitles = suiteTitle
      ? [...parentTitles, suiteTitle]
      : parentTitles;

    for (const spec of Array.isArray(suite.specs) ? suite.specs : []) {
      visitSpec(nextTitles, spec);
    }

    if (Array.isArray(suite.suites)) {
      walkSuites(suite.suites, nextTitles, visitSpec);
    }
  }
}

function createObservation({
  run,
  layer,
  title,
  file,
  line,
  project,
  status,
  testStatus,
  expectedStatus,
  retry,
  durationMs,
  artifactPath,
  messages,
}) {
  const classification = classifyObservation({
    layer,
    status,
    testStatus,
    messages,
  });

  return {
    runId: run.runId,
    layer: layer.name,
    title,
    file,
    line,
    project,
    durationMs,
    status,
    testStatus: testStatus ?? status,
    expectedStatus,
    retry,
    artifactPath,
    classification,
    messages,
  };
}

function extractResultMessages(resultEntry) {
  const messages = [];
  for (const error of Array.isArray(resultEntry.errors)
    ? resultEntry.errors
    : []) {
    const message = error?.message ?? error?.value ?? "";
    if (message) {
      messages.push(trimMessage(message));
    }
  }
  for (const stream of ["stderr", "stdout"]) {
    for (const item of Array.isArray(resultEntry[stream])
      ? resultEntry[stream]
      : []) {
      const text = typeof item === "string" ? item : item?.text;
      if (text) {
        messages.push(trimMessage(text));
      }
    }
  }
  return messages;
}

function isUnstableLayer(layer) {
  return (
    layer.timedOut ||
    ["failed", "timedOut", "interrupted"].includes(layer.status)
  );
}

function isUnstableObservation(observation) {
  return (
    UNSTABLE_RESULT_STATUSES.has(observation.status) ||
    UNSTABLE_TEST_STATUSES.has(observation.testStatus) ||
    observation.retry > 0
  );
}

function classifyObservation({ layer, status, testStatus, messages }) {
  if (
    layer.classification === "environment" ||
    messages.some(isEnvironmentMessage)
  ) {
    return "environment";
  }
  if (layer.classification) {
    return layer.classification;
  }
  if (status === "timedOut" || testStatus === "timedOut") {
    return "timeout";
  }
  return "test";
}

function classifyLayer(layer) {
  if (layer.classification) {
    return layer.classification;
  }
  if (layer.timedOut) {
    return "timeout";
  }
  return "unknown";
}
