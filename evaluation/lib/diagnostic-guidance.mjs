const CONFIDENCE = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
};

export function createGuidance(diagnostic) {
  const text = [
    diagnostic.layer,
    diagnostic.title,
    diagnostic.message,
    diagnostic.source?.path,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (
    diagnostic.classification === "environment" ||
    diagnostic.classification === "timeout" ||
    /\btimeout\b|test timeout/i.test(text)
  ) {
    return {
      action: "fix_environment",
      confidence: CONFIDENCE.HIGH,
      rationale:
        "The failure classification points to environment setup or timeout before product behavior.",
      likelyTargets: [
        {
          kind: "environment",
          path: null,
          label: "Evaluation environment and Playwright runtime",
          rationale:
            "Browser installation, dependency availability, dev-server readiness, or timeout settings should be checked first.",
        },
      ],
    };
  }

  if (diagnostic.classification === "flaky") {
    return {
      action: "investigate_flaky",
      confidence: CONFIDENCE.MEDIUM,
      rationale:
        "Retry or intermittent evidence suggests a flaky test or environment-sensitive behavior.",
      likelyTargets: [
        {
          kind: "evaluation_file",
          path: diagnostic.source?.path ?? null,
          label: "Flaky evidence source",
          rationale:
            "Review retry artifacts and timing-sensitive assertions before changing product behavior.",
        },
      ],
    };
  }

  if (diagnostic.classification === "harness_bug") {
    return {
      action: "inspect_test",
      confidence: CONFIDENCE.MEDIUM,
      rationale:
        "The failure classification points to harness code, fixtures, report generation, or command setup.",
      likelyTargets: [
        {
          kind: "evaluation_file",
          path: diagnostic.source?.path ?? null,
          label: "Evaluation harness artifact",
          rationale:
            "Harness-classified diagnostics should be inspected in evaluation code or generated evidence.",
        },
      ],
    };
  }

  if (diagnostic.classification === "product_regression") {
    return {
      action: "inspect_product",
      confidence: CONFIDENCE.MEDIUM,
      rationale:
        "The failure classification points to product-visible behavior.",
      likelyTargets: [
        {
          kind: "behavior_area",
          path: null,
          label: "Product behavior evidence",
          rationale:
            "Inspect the product behavior area identified by the failing test and artifacts.",
        },
      ],
    };
  }

  if (isBilling(text)) {
    return {
      action: "inspect_product",
      confidence: CONFIDENCE.HIGH,
      rationale:
        "Billing-related evidence maps directly to the product billing helper and its evaluation unit coverage.",
      likelyTargets: [
        {
          kind: "product_file",
          path: "src/lib/billing.js",
          label: "Billing calculation helper",
          rationale:
            "Unit billing failures are expected to originate from total-bill calculation behavior.",
        },
        {
          kind: "evaluation_file",
          path:
            diagnostic.source?.path ?? "evaluation/tests/unit/billing.test.mjs",
          label: "Failing billing evaluation test",
          rationale:
            "The evaluation assertion defines the expected billing behavior.",
        },
      ],
    };
  }

  if (isJourney(text)) {
    return {
      action: "inspect_product",
      confidence: CONFIDENCE.MEDIUM,
      rationale:
        "The failure looks like a browser journey, routing, popup, or storage behavior that belongs to E2E or smoke evidence.",
      likelyTargets: [
        {
          kind: "behavior_area",
          path: null,
          label: "Browser journey and routing flow",
          rationale:
            "Route, popup, storage, and representative journey failures require inspecting the cross-page flow evidence.",
        },
        {
          kind: "evaluation_file",
          path: diagnostic.source?.path ?? null,
          label: "Failing browser-flow test",
          rationale:
            "The failing smoke or E2E test identifies the journey that should remain browser-level evidence.",
        },
      ],
    };
  }

  if (isReservationValidation(text)) {
    return {
      action: "inspect_product",
      confidence: CONFIDENCE.HIGH,
      rationale:
        "Reservation validation evidence maps to reservation UI behavior, validation helpers, and locale message data.",
      likelyTargets: [
        {
          kind: "product_file",
          path: "src/reserve.js",
          label: "Reservation UI behavior",
          rationale:
            "Reservation form state and validation feedback are coordinated in the reservation page script.",
        },
        {
          kind: "product_file",
          path: "src/lib/validation.js",
          label: "Validation helper",
          rationale:
            "Boundary and required-field checks should be inspected in the shared validation helper.",
        },
        {
          kind: "product_file",
          path: "data/ja/message.json",
          label: "Japanese locale messages",
          rationale:
            "Validation text failures may come from locale message data.",
        },
        {
          kind: "product_file",
          path: "data/en-US/message.json",
          label: "English locale messages",
          rationale:
            "Validation text failures may come from locale message data.",
        },
      ],
    };
  }

  if (diagnostic.classification === "test") {
    return {
      action: "inspect_test",
      confidence: CONFIDENCE.MEDIUM,
      rationale:
        "The failure classification points to evaluation code, fixture, or command configuration.",
      likelyTargets: [
        {
          kind: "evaluation_file",
          path: diagnostic.source?.path ?? null,
          label: "Evaluation test or fixture",
          rationale:
            "Test-classified diagnostics should be inspected in the evaluation artifact that produced the failure.",
        },
      ],
    };
  }

  return {
    action: "investigate_unknown",
    confidence: CONFIDENCE.LOW,
    rationale:
      "The harness could not infer ownership confidently; inspect the linked artifacts before assigning responsibility.",
    likelyTargets: [
      {
        kind: "behavior_area",
        path: null,
        label: "Recorded failure evidence",
        rationale:
          "Artifact references and excerpts are the safest starting point when ownership is ambiguous.",
      },
    ],
  };
}

function isBilling(text) {
  return /billing|bill|total-bill|calcTotalBill|total bill/.test(text);
}

function isReservationValidation(text) {
  return /validation|required|guest|guests|stay|term|date|email|tel|phone|name|message/.test(
    text,
  );
}

function isJourney(text) {
  return /route|routing|redirect|popup|modal|storage|cookie|journey|smoke|e2e|login|mypage|signup/.test(
    text,
  );
}
