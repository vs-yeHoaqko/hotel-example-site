import { readFile } from "node:fs/promises";
import { assertValid } from "./schema-validator.mjs";

export async function createOwnership({ repoRoot = process.cwd() } = {}) {
  const ownership = {
    schemaVersion: 1,
    records: [
      {
        behavior: "Total bill calculation",
        ownerLayer: "unit",
        evidence:
          "calcTotalBill is pure calculation logic with no browser dependency.",
        coveredBy: ["evaluation/tests/unit/billing.test.mjs"],
        migrationRecommendation:
          "Keep detailed arithmetic cases at unit level and retain only representative billing checks in browser flows.",
      },
      {
        behavior: "Reservation form page-local state and validation",
        ownerLayer: "integration",
        evidence:
          "Contact field visibility, required/range validation, and total recalculation are page-local DOM behavior.",
        coveredBy: ["evaluation/tests/integration/reservation-form.spec.mjs"],
        migrationRecommendation:
          "Keep page-local field and validation combinations at integration level.",
      },
      {
        behavior: "Localized reservation route and completion journey",
        ownerLayer: "e2e",
        evidence:
          "Opening localized route families and completing a reservation requires browser navigation, popup, session storage, and modal behavior.",
        coveredBy: ["evaluation/tests/e2e/smoke.spec.mjs"],
        migrationRecommendation:
          "Keep this as thin smoke coverage while lower layers cover detailed form and billing behavior.",
      },
    ],
  };
  const schema = JSON.parse(
    await readFile(
      `${repoRoot}/evaluation/schemas/ownership.schema.json`,
      "utf8",
    ),
  );
  assertValid(ownership, schema, "ownership.json");
  return ownership;
}
