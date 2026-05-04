import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";

const messagesByLocale = {
  "en-US": JSON.parse(
    readFileSync(new URL("../../../data/en-US/message.json", import.meta.url)),
  ),
  ja: JSON.parse(
    readFileSync(new URL("../../../data/ja/message.json", import.meta.url)),
  ),
};

async function openReservation(page, locale = "en-US") {
  await page.goto(`/${locale}/plans.html`);
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

function validationMessage(locale, key, ...params) {
  let message = messagesByLocale[locale].validation[key];
  for (const param of params) {
    message = message.replace("{}", param);
  }
  return message;
}

function formatDateShort(date, locale) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return locale === "ja"
    ? `${year}/${month}/${day}`
    : `${month}/${day}/${year}`;
}

function daysFromToday(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

async function changeField(reservePage, selector, value) {
  const field = reservePage.locator(selector);
  await field.fill(value);
  await field.dispatchEvent("change");
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

for (const locale of ["en-US", "ja"]) {
  test.describe(`${locale} reservation validation feedback`, () => {
    test("shows blank required feedback for date, stay, and guests", async ({
      page,
    }) => {
      const reservePage = await openReservation(page, locale);
      const valueMissing = validationMessage(locale, "valueMissing");

      await changeField(reservePage, "#date", "");
      await changeField(reservePage, "#term", "");
      await changeField(reservePage, "#head-count", "");
      await reservePage.locator("#username").focus();

      await expect(reservePage.locator("#date ~ .invalid-feedback")).toHaveText(
        valueMissing,
      );
      await expect(reservePage.locator("#term ~ .invalid-feedback")).toHaveText(
        valueMissing,
      );
      await expect(
        reservePage.locator("#head-count ~ .invalid-feedback"),
      ).toHaveText(valueMissing);
      await reservePage.close();
    });

    test("shows lower-bound feedback for date, stay, and guests", async ({
      page,
    }) => {
      const reservePage = await openReservation(page, locale);

      await changeField(
        reservePage,
        "#date",
        formatDateShort(daysFromToday(0), locale),
      );
      await changeField(reservePage, "#term", "0");
      await changeField(reservePage, "#head-count", "0");

      await expect(reservePage.locator("#date ~ .invalid-feedback")).toHaveText(
        validationMessage(locale, "shoudBeNextDay"),
      );
      await expect(reservePage.locator("#term ~ .invalid-feedback")).toHaveText(
        validationMessage(locale, "rangeUnderflow", "1"),
      );
      await expect(
        reservePage.locator("#head-count ~ .invalid-feedback"),
      ).toHaveText(validationMessage(locale, "rangeUnderflow", "1"));
      await reservePage.close();
    });

    test("shows upper-bound feedback for date, stay, and guests", async ({
      page,
    }) => {
      const reservePage = await openReservation(page, locale);

      await changeField(
        reservePage,
        "#date",
        formatDateShort(daysFromToday(91), locale),
      );
      await changeField(reservePage, "#term", "10");
      await changeField(reservePage, "#head-count", "10");

      await expect(reservePage.locator("#date ~ .invalid-feedback")).toHaveText(
        validationMessage(locale, "shouldBeThreeMonth"),
      );
      await expect(reservePage.locator("#term ~ .invalid-feedback")).toHaveText(
        validationMessage(locale, "rangeOverflow", "9"),
      );
      await expect(
        reservePage.locator("#head-count ~ .invalid-feedback"),
      ).toHaveText(validationMessage(locale, "rangeOverflow", "9"));
      await reservePage.close();
    });

    test("shows invalid date string feedback", async ({ page }) => {
      const reservePage = await openReservation(page, locale);

      await changeField(
        reservePage,
        "#date",
        locale === "ja" ? "2026//05/04" : "12/3//345",
      );

      await expect(reservePage.locator("#date ~ .invalid-feedback")).toHaveText(
        validationMessage(locale, "badInput"),
      );
      await reservePage.close();
    });

    test("shows submit-time feedback for mail contact", async ({ page }) => {
      const reservePage = await openReservation(page, locale);
      const valueMissing = validationMessage(locale, "valueMissing");

      await reservePage.locator("#username").fill("");
      await reservePage.locator("#contact").selectOption("email");
      await reservePage.locator("#email").fill("");
      await reservePage.locator("#submit-button").click();

      await expect(
        reservePage.locator("#username ~ .invalid-feedback"),
      ).toHaveText(valueMissing);
      await expect(
        reservePage.locator("#email ~ .invalid-feedback"),
      ).toHaveText(valueMissing);
      await reservePage.close();
    });

    test("shows submit-time feedback for tel contact", async ({ page }) => {
      const reservePage = await openReservation(page, locale);
      const valueMissing = validationMessage(locale, "valueMissing");

      await reservePage.locator("#username").fill("");
      await reservePage.locator("#contact").selectOption("tel");
      await reservePage.locator("#tel").fill("");
      await reservePage.locator("#submit-button").click();

      await expect(
        reservePage.locator("#username ~ .invalid-feedback"),
      ).toHaveText(valueMissing);
      await expect(reservePage.locator("#tel ~ .invalid-feedback")).toHaveText(
        valueMissing,
      );
      await reservePage.close();
    });
  });
}
