import { test, expect } from '@playwright/test';

const formatShort = (date: Date) =>
  `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}/${date.getFullYear()}`;
const formatLong = (date: Date) =>
  date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

test.describe('Reservation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/en-US/');
    await expect(page).toHaveTitle(
      'HOTEL PLANISPHERE - Website for Practice Test Automation',
    );
  });

  test('It should be display initial values [not logged in]', async ({
    page,
  }) => {
    await page.getByRole('link', { name: 'Reserve' }).click();
    await expect(page).toHaveTitle(/Plans/);
    await expect(page.getByRole('status')).toBeHidden();
    const [reservePage] = await Promise.all([
      page.waitForEvent('popup'),
      page
        .locator('.card')
        .filter({
          has: page.getByRole('heading', {
            level: 5,
            name: 'Plan with special offers',
          }),
        })
        .first()
        .getByRole('link', { name: 'Reserve room' })
        .click(),
    ]);

    const tomorrow = formatShort(new Date(Date.now() + 24 * 60 * 60 * 1000));

    await expect(reservePage).toHaveTitle(/Reservation/);
    await expect(reservePage.getByRole('heading', { level: 4 })).toHaveText(
      'Plan with special offers',
    );
    await expect(reservePage.getByLabel('Check-in required')).toHaveValue(
      tomorrow,
    );
    await expect(reservePage.getByLabel('Stay Required')).toHaveValue('1');
    await expect(reservePage.getByLabel('Guests Required')).toHaveValue('1');

    await expect(
      reservePage
        .frameLocator('iframe[name="room"]')
        .getByRole('heading', { level: 5 }),
    ).toHaveText('Standard Twin');
  });

  test('It should be display initial values [logged in]', async ({ page }) => {
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveTitle(/Login/);

    await page.getByLabel('Email').fill('clark@example.com');
    await page.getByLabel('Password').fill('password');
    await page.getByRole('button', { name: 'Login' }).last().click();
    await expect(page).toHaveTitle(/MyPage/);

    await page.getByRole('link', { name: 'Reserve' }).click();
    await expect(page).toHaveTitle(/Plans/);

    await expect(page.getByRole('status')).toBeHidden();
    const [reservePage] = await Promise.all([
      page.waitForEvent('popup'),
      page
        .locator('.card')
        .filter({
          has: page.getByRole('heading', {
            level: 5,
            name: 'Premium plan',
          }),
        })
        .first()
        .getByRole('link', { name: 'Reserve room' })
        .click(),
    ]);

    const tomorrow = formatShort(new Date(Date.now() + 24 * 60 * 60 * 1000));

    await expect(reservePage).toHaveTitle(/Reservation/);
    await expect(reservePage.getByRole('heading', { level: 4 })).toHaveText(
      'Premium plan',
    );
    await expect(reservePage.getByLabel('Check-in required')).toHaveValue(
      tomorrow,
    );
    await expect(reservePage.getByLabel('Stay Required')).toHaveValue('1');
    await expect(reservePage.getByLabel('Guests Required')).toHaveValue('2');
    await expect(reservePage.getByLabel('Name Required')).toHaveValue(
      'Clark Evans',
    );

    await expect(
      reservePage
        .frameLocator('iframe[name="room"]')
        .getByRole('heading', { level: 5 }),
    ).toHaveText('Premium Twin');
  });

  test('It should be an error when blank values', async ({ page }) => {
    await page.getByRole('link', { name: 'Reserve' }).click();
    await expect(page).toHaveTitle(/Plans/);

    await expect(page.getByRole('status')).toBeHidden();
    const [reservePage] = await Promise.all([
      page.waitForEvent('popup'),
      page
        .locator('.card')
        .filter({
          has: page.getByRole('heading', {
            level: 5,
            name: 'Plan with special offers',
          }),
        })
        .first()
        .getByRole('link', { name: 'Reserve room' })
        .click(),
    ]);

    await expect(reservePage).toHaveTitle(/Reservation/);
    await expect(reservePage.getByRole('heading', { level: 4 })).toHaveText(
      'Plan with special offers',
    );

    await reservePage.getByLabel('Check-in required').fill('');
    await reservePage.getByLabel('Stay Required').fill('');
    await reservePage.getByLabel('Guests Required').fill('');
    await reservePage.getByLabel('Name Required').focus();
  });

  test('It should be an error when invalid values [under]', async ({
    page,
  }) => {
    await page.getByRole('link', { name: 'Reserve' }).click();
    await expect(page).toHaveTitle(/Plans/);

    await expect(page.getByRole('status')).toBeHidden();
    const [reservePage] = await Promise.all([
      page.waitForEvent('popup'),
      page
        .locator('.card')
        .filter({
          has: page.getByRole('heading', {
            level: 5,
            name: 'Plan with special offers',
          }),
        })
        .first()
        .getByRole('link', { name: 'Reserve room' })
        .click(),
    ]);

    await expect(reservePage).toHaveTitle(/Reservation/);
    await expect(reservePage.getByRole('heading', { level: 4 })).toHaveText(
      'Plan with special offers',
    );

    const today = formatShort(new Date());

    await reservePage.getByLabel('Check-in required').fill(today);
    await reservePage.getByLabel('Stay Required').fill('0');
    await reservePage.getByLabel('Guests Required').fill('0');
    await reservePage.getByLabel('Name Required').fill('the tester');
  });

  test('It should be an error when invalid values [over]', async ({ page }) => {
    await page.getByRole('link', { name: 'Reserve' }).click();
    await expect(page).toHaveTitle(/Plans/);

    await expect(page.getByRole('status')).toBeHidden();
    const [reservePage] = await Promise.all([
      page.waitForEvent('popup'),
      page
        .locator('.card')
        .filter({
          has: page.getByRole('heading', {
            level: 5,
            name: 'Plan with special offers',
          }),
        })
        .first()
        .getByRole('link', { name: 'Reserve room' })
        .click(),
    ]);

    await expect(reservePage).toHaveTitle(/Reservation/);
    await expect(reservePage.getByRole('heading', { level: 4 })).toHaveText(
      'Plan with special offers',
    );

    const after90 = new Date();
    after90.setDate(after90.getDate() + 91);

    await reservePage
      .getByLabel('Check-in required')
      .fill(formatShort(after90));
    await reservePage.getByLabel('Stay Required').fill('10');
    await reservePage.getByLabel('Guests Required').fill('10');
    await reservePage.getByLabel('Name Required').fill('the tester');
  });

  test('It should be an error when invalid values [string]', async ({
    page,
  }) => {
    await page.getByRole('link', { name: 'Reserve' }).click();
    await expect(page).toHaveTitle(/Plans/);
    await expect(page.getByRole('status')).toBeHidden();
    const [reservePage] = await Promise.all([
      page.waitForEvent('popup'),
      page
        .locator('.card')
        .filter({
          has: page.getByRole('heading', {
            level: 5,
            name: 'Plan with special offers',
          }),
        })
        .first()
        .getByRole('link', { name: 'Reserve room' })
        .click(),
    ]);

    await expect(reservePage).toHaveTitle(/Reservation/);
    await expect(reservePage.getByRole('heading', { level: 4 })).toHaveText(
      'Plan with special offers',
    );

    const after90 = new Date();
    after90.setDate(after90.getDate() + 91);

    await reservePage.getByLabel('Check-in required').fill('12/3//345');
    await reservePage.getByLabel('Name Required').fill('the tester');
  });

  test('It should be an error when submitting [mail]', async ({ page }) => {
    await page.getByRole('link', { name: 'Reserve' }).click();
    await expect(page).toHaveTitle(/Plans/);

    await expect(page.getByRole('status')).toBeHidden();
    const [reservePage] = await Promise.all([
      page.waitForEvent('popup'),
      page
        .locator('.card')
        .filter({
          has: page.getByRole('heading', {
            level: 5,
            name: 'Plan with special offers',
          }),
        })
        .first()
        .getByRole('link', { name: 'Reserve room' })
        .click(),
    ]);

    await expect(reservePage).toHaveTitle(/Reservation/);
    await expect(reservePage.getByRole('heading', { level: 4 })).toHaveText(
      'Plan with special offers',
    );

    await reservePage.getByLabel('Name Required').fill('');
    await reservePage
      .getByLabel('Confirmation Required')
      .selectOption({ label: 'By email' });
    await reservePage.getByLabel('Email Required').fill('');
    await reservePage
      .getByRole('button', { name: 'Confirm Reservation' })
      .click();
  });

  test('It should be an error when submitting [tel]', async ({ page }) => {
    await page.getByRole('link', { name: 'Reserve' }).click();
    await expect(page).toHaveTitle(/Plans/);

    await expect(page.getByRole('status')).toBeHidden();
    const [reservePage] = await Promise.all([
      page.waitForEvent('popup'),
      page
        .locator('.card')
        .filter({
          has: page.getByRole('heading', {
            level: 5,
            name: 'Plan with special offers',
          }),
        })
        .first()
        .getByRole('link', { name: 'Reserve room' })
        .click(),
    ]);

    await expect(reservePage).toHaveTitle(/Reservation/);
    await expect(reservePage.getByRole('heading', { level: 4 })).toHaveText(
      'Plan with special offers',
    );

    await reservePage.getByLabel('Name Required').fill('');
    await reservePage
      .getByLabel('Confirmation Required')
      .selectOption({ label: 'By telephone' });
    await reservePage.getByLabel('Tel Required').fill('');
    await reservePage
      .getByRole('button', { name: 'Confirm Reservation' })
      .click();
  });

  test('It should be successful the reservation [not logged in] [initial values]', async ({
    page,
  }) => {
    await page.getByRole('link', { name: 'Reserve' }).click();
    await expect(page).toHaveTitle(/Plans/);
    await expect(page.getByRole('status')).toBeHidden();
    const [reservePage] = await Promise.all([
      page.waitForEvent('popup'),
      page
        .locator('.card')
        .filter({
          has: page.getByRole('heading', {
            level: 5,
            name: 'Plan with special offers',
          }),
        })
        .first()
        .getByRole('link', { name: 'Reserve room' })
        .click(),
    ]);

    await expect(reservePage).toHaveTitle(/Reservation/);
    await expect(reservePage.getByRole('heading', { level: 4 })).toHaveText(
      'Plan with special offers',
    );

    const expectedStart = new Date();
    expectedStart.setDate(expectedStart.getDate() + 1);
    const expectedEnd = new Date(expectedStart);
    expectedEnd.setDate(expectedEnd.getDate() + 1);
    const expectedTerm = `${formatLong(expectedStart)} - ${formatLong(expectedEnd)}. 1 night(s)`;

    await reservePage.getByLabel('Name Required').fill('the tester');
    await reservePage
      .getByLabel('Confirmation Required')
      .selectOption({ label: 'None' });
    await reservePage
      .getByRole('button', { name: 'Confirm Reservation' })
      .click();
    await expect(reservePage).toHaveTitle(/Confirm Reservation/);
    await expect(reservePage.locator('#plan-name')).toHaveText(
      'Plan with special offers',
    );
    await expect(reservePage.locator('#term')).toHaveText(expectedTerm);
    await expect(reservePage.locator('#head-count')).toHaveText('1 person(s)');
    await expect(reservePage.locator('#plans')).toHaveText('none');
    await expect(reservePage.locator('#username')).toHaveText('the tester');
    await expect(reservePage.locator('#contact')).toHaveText('not required');
    await expect(reservePage.locator('#comment')).toHaveText('none');

    await reservePage
      .getByRole('button', { name: 'Submit Reservation' })
      .click();
    await expect(
      reservePage.locator('#success-modal > div > div > .modal-body'),
    ).toHaveText('We look forward to visiting you.');
    await Promise.all([
      reservePage.waitForEvent('close'),
      reservePage
        .locator('#success-modal > div > div > div > button.btn-success')
        .click(),
    ]);
    expect(reservePage.isClosed()).toBeTruthy();
  });

  test('It should be successful the reservation [logged in]', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveTitle(/Login/);

    await page.getByLabel('Email').fill('clark@example.com');
    await page.getByLabel('Password').fill('password');
    await page.getByRole('button', { name: 'Login' }).last().click();
    await expect(page).toHaveTitle(/MyPage/);

    await page.getByRole('link', { name: 'Reserve' }).click();
    await expect(page).toHaveTitle(/Plans/);

    await expect(page.getByRole('status')).toBeHidden();
    const [reservePage] = await Promise.all([
      page.waitForEvent('popup'),
      page
        .locator('.card')
        .filter({
          has: page.getByRole('heading', {
            level: 5,
            name: 'Premium plan',
          }),
        })
        .first()
        .getByRole('link', { name: 'Reserve room' })
        .click(),
    ]);

    await expect(reservePage).toHaveTitle(/Reservation/);
    await expect(reservePage.getByRole('heading', { level: 4 })).toHaveText(
      'Premium plan',
    );
    const expectedStart = new Date();
    expectedStart.setDate(expectedStart.getDate() + 90);
    const expectedEnd = new Date(expectedStart);
    expectedEnd.setDate(expectedEnd.getDate() + 2);
    const expectedTerm = `${formatLong(expectedStart)} - ${formatLong(expectedEnd)}. 2 night(s)`;

    await reservePage.getByLabel('Stay Required').fill('2');
    await reservePage.getByLabel('Guests Required').fill('4');
    await reservePage.getByLabel('Breakfast').setChecked(true);
    await reservePage.getByLabel('Early check-in').setChecked(true);
    await reservePage.getByLabel('Sightseeing').setChecked(false);
    await reservePage
      .getByLabel('Confirmation Required')
      .selectOption({ label: 'By email' });
    await reservePage.getByLabel('Special request').fill('aaa\n\nbbbbbbb\ncc');
    await reservePage
      .getByLabel('Check-in Required')
      .fill(formatShort(expectedStart));
    await reservePage
      .getByRole('button', { name: 'Confirm Reservation' })
      .click();
    await expect(reservePage).toHaveTitle(/Confirm Reservation/);
    await expect(reservePage.locator('#plan-name')).toHaveText('Premium plan');
    await expect(reservePage.locator('#term')).toHaveText(expectedTerm);
    await expect(reservePage.locator('#head-count')).toHaveText('4 person(s)');
    await expect(reservePage.locator('#plans')).toHaveText(/Breakfast/);
    await expect(reservePage.locator('#plans')).toHaveText(/Early check-in/);
    await expect(reservePage.locator('#plans')).not.toHaveText(/Sightseeing/);
    await expect(reservePage.locator('#username')).toHaveText('Clark Evans');
    await expect(reservePage.locator('#contact')).toHaveText(
      'Email: clark@example.com',
    );
    await expect(reservePage.locator('#comment')).toHaveText(
      'aaa\n\nbbbbbbb\ncc',
    );

    await reservePage
      .getByRole('button', { name: 'Submit Reservation' })
      .click();
    await expect(
      reservePage.locator('#success-modal > div > div > .modal-body'),
    ).toHaveText('We look forward to visiting you.');
    await Promise.all([
      reservePage.waitForEvent('close'),
      reservePage
        .locator('#success-modal > div > div > div > button.btn-success')
        .click(),
    ]);
    expect(reservePage.isClosed()).toBeTruthy();
  });
});
