import { expect, test } from '@playwright/test';

test('maintenance mode locks and unlocks the terminal instantly in Warhammer style', async ({ page }) => {
  let maintenance = true;
  let announcement = 'Калибровка вокс-ретранслятора сектора.';

  await page.addInitScript(() => {
    window.__TEST_MAINTENANCE__ = true;
    window.__TEST_MAINTENANCE_NO_WS__ = true;
  });

  await page.route('**/rest/v1/site_config*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        {
          value: {
            maintenance,
            announcement,
            telemetryEnabled: true,
          },
        },
      ]),
    });
  });

  await page.goto('/');

  const overlay = page.locator('#maintenance-overlay');
  await expect(overlay).toBeVisible();
  await expect(overlay).toContainText('ТЕХНИЧЕСКОЕ ОБСЛУЖИВАНИЕ КОГИТАТОРА');
  await expect(overlay).toContainText(announcement);

  maintenance = false;
  await page.evaluate(() => {
    window.dispatchEvent(new Event('focus'));
  });

  await expect(overlay).toBeHidden();
});
