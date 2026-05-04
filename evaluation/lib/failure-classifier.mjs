import { isEnvironmentMessage } from "./environment-signals.mjs";

export function classifyFailure(layer, result) {
  if (result.timedOut) {
    return "timeout";
  }
  const output = `${result.stdout ?? ""}\n${result.stderr ?? ""}`;
  if (result.startError || isEnvironmentMessage(output)) {
    return "environment";
  }
  if (/Timeout|Test timeout/i.test(output)) {
    return "timeout";
  }
  if (layer.failureClassification) {
    return layer.failureClassification;
  }
  if (layer.name === "static") {
    return "test";
  }
  if (layer.name === "unit") {
    if (/SyntaxError|ERR_MODULE|ReferenceError|TypeError/i.test(output)) {
      return "test";
    }
    return "product";
  }
  if (/Error: expect|expect\(.*\)|locator/i.test(output)) {
    return "product";
  }
  return "unknown";
}

export function classifyFailureEvidence(layer, result) {
  const classification = classifyFailure(layer, result);
  const output = `${result.stdout ?? ""}\n${result.stderr ?? ""}`;
  if (classification === "environment" || classification === "timeout") {
    return {
      classification: "environment",
      confidence: "high",
      reason:
        "Environment or timeout evidence should be investigated before changing product behavior.",
      evidence: collectEvidence(result, output),
      recommendedAction: "fix_environment",
    };
  }
  if (/retry|flaky|intermittent/i.test(output) || result.retry > 0) {
    return {
      classification: "flaky",
      confidence: "medium",
      reason: "Retry or intermittent evidence suggests flaky behavior.",
      evidence: collectEvidence(result, output),
      recommendedAction: "investigate_flaky",
    };
  }
  if (classification === "product") {
    return {
      classification: "product_regression",
      confidence: "medium",
      reason: "The failure maps to product-visible behavior.",
      evidence: collectEvidence(result, output),
      recommendedAction: "inspect_product",
    };
  }
  if (classification === "test") {
    return {
      classification: "harness_bug",
      confidence: "medium",
      reason:
        "The failure maps to evaluation code, fixtures, or command setup.",
      evidence: collectEvidence(result, output),
      recommendedAction: "inspect_test",
    };
  }
  return {
    classification: "unknown",
    confidence: "low",
    reason: "The available evidence is insufficient for confident ownership.",
    evidence: collectEvidence(result, output),
    recommendedAction: "investigate_unknown",
  };
}

function collectEvidence(result, output) {
  return [result.startError?.message, output]
    .filter(Boolean)
    .map((item) => item.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .slice(0, 3);
}
