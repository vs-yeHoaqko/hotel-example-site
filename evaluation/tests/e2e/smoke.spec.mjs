import { expect, test } from "@playwright/test";

async function openRecommendedReservation(page, locale) {
  await page.goto(`/${locale}/`);
  await expect(page).toHaveTitle(/HOTEL PLANISPHERE/);
  await page.locator('a[href="./plans.html"]').first().click();
  await expect(page).toHaveURL(new RegExp(`/${locale}/plans.html$`));
  await expect(page.getByRole("status")).toBeHidden();

  const [reservePage] = await Promise.all([
    page.waitForEvent("popup"),
    page.locator('a[href="./reserve.html?plan-id=0"]').first().click(),
  ]);
  await expect(reservePage).toHaveTitle(/Reservation|HOTEL PLANISPHERE/);
  await expect(reservePage.locator("#submit-button")).toBeEnabled();
  return reservePage;
}

test("smoke route opens the en-US reservation entry point", async ({
  page,
}) => {
  const reservePage = await openRecommendedReservation(page, "en-US");

  await expect(reservePage.locator("#plan-id-hidden")).toHaveValue("0");
  await reservePage.close();
});

test("smoke route opens the ja reservation entry point", async ({ page }) => {
  const reservePage = await openRecommendedReservation(page, "ja");

  await expect(reservePage.locator("#plan-id-hidden")).toHaveValue("0");
  await reservePage.close();
});

test("smoke completes one en-US reservation happy path", async ({ page }) => {
  const reservePage = await openRecommendedReservation(page, "en-US");

  await reservePage.locator("#username").fill("evaluation tester");
  await reservePage.locator("#contact").selectOption("no");
  await reservePage.locator("#submit-button").click();
  await expect(reservePage).toHaveTitle(/Confirm Reservation/);
  await expect(reservePage.locator("#username")).toHaveText(
    "evaluation tester",
  );

  await reservePage.getByRole("button", { name: "Submit Reservation" }).click();
  await expect(reservePage.locator("#success-modal .modal-body")).toContainText(
    "We look forward to visiting you.",
  );
  await expect(
    reservePage.locator("#success-modal .btn-success"),
  ).toBeVisible();
});
