const MESSAGES = {
  none: "No action required.",
  fix_environment:
    "Fix the evaluation environment or timeout condition before inspecting product or test failures.",
  inspect_product: "Inspect the product behavior covered by the failing layer.",
  inspect_test:
    "Inspect the evaluation test, helper, fixture, or command configuration.",
  investigate_unknown:
    "Investigate the recorded failure evidence before assigning ownership.",
};

export function selectRecommendedAction(classifications) {
  if (!classifications.length) {
    return action("none");
  }
  const codes = classifications.map(toActionCode);
  for (const code of [
    "fix_environment",
    "inspect_product",
    "inspect_test",
    "investigate_unknown",
  ]) {
    if (codes.includes(code)) {
      return action(code);
    }
  }
  return action("investigate_unknown");
}

function toActionCode(classification) {
  if (classification === "timeout" || classification === "environment") {
    return "fix_environment";
  }
  if (classification === "product") {
    return "inspect_product";
  }
  if (classification === "test") {
    return "inspect_test";
  }
  return "investigate_unknown";
}

function action(code) {
  return {
    code,
    message: MESSAGES[code],
  };
}
