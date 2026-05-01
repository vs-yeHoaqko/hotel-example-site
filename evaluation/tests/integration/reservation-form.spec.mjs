import { expect, test } from "@playwright/test";

async function openReservation(page) {
  await page.goto("/en-US/");
  await expect(page).toHaveTitle(/HOTEL PLANISPHERE/);
  await page.locator('a[href="./plans.html"]').first().click();
  await expect(page).toHaveURL(/\/en-US\/plans.html$/);

  const [reservePage] = await Promise.all([
    page.waitForEvent("popup"),
    page
      .locator(".card", { has: page.getByRole("heading", { level: 5 }) })
      .first()
      .locator('a[href="./reserve.html?plan-id=0"]')
      .click(),
  ]);
  await expect(reservePage).toHaveTitle(/Reservation|HOTEL PLANISPHERE/);
  await expect(reservePage.locator("#submit-button")).toBeEnabled();
  return reservePage;
}

test.describe("reservation form page-local behavior", () => {
  test("toggles contact fields without leaving the page", async ({ page }) => {
    const reservePage = await openReservation(page);

    await reservePage.locator("#contact").selectOption("email");
    await expect(reservePage.locator("#email")).toBeVisible();
    await expect(reservePage.locator("#email")).toHaveAttribute("required", "");
    await expect(reservePage.locator("#tel")).toBeHidden();

    await reservePage.locator("#contact").selectOption("tel");
    await expect(reservePage.locator("#email")).toBeHidden();
    await expect(reservePage.locator("#tel")).toBeVisible();
    await expect(reservePage.locator("#tel")).toHaveAttribute("required", "");

    await reservePage.locator("#contact").selectOption("no");
    await expect(reservePage.locator("#email")).toBeHidden();
    await expect(reservePage.locator("#tel")).toBeHidden();
    await reservePage.close();
  });

  test("shows required and range validation while keeping invalid totals blank", async ({
    page,
  }) => {
    const reservePage = await openReservation(page);

    await reservePage.locator("#term").fill("0");
    await reservePage.locator("#term").dispatchEvent("change");
    await expect(
      reservePage.locator("#term ~ .invalid-feedback"),
    ).toContainText("Value must be greater than or equal to");
    await expect(reservePage.locator("#total-bill")).toHaveText("-");

    await reservePage.locator("#head-count").fill("10");
    await reservePage.locator("#head-count").dispatchEvent("change");
    await expect(
      reservePage.locator("#head-count ~ .invalid-feedback"),
    ).toContainText("Value must be less than or equal to");
    await expect(reservePage.locator("#total-bill")).toHaveText("-");
    await reservePage.close();
  });

  test("recalculates the total when page-local inputs change", async ({
    page,
  }) => {
    const reservePage = await openReservation(page);

    const initialTotal = await reservePage.locator("#total-bill").innerText();
    await reservePage.locator("#head-count").fill("2");
    await reservePage.locator("#head-count").dispatchEvent("change");

    await expect(reservePage.locator("#total-bill")).not.toHaveText(
      initialTotal,
    );
    await reservePage.close();
  });
});
