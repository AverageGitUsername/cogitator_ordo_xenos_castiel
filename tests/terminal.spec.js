import { expect, test } from '@playwright/test';

async function expectWithinViewport(control, width) {
  await expect(control).toBeVisible();
  const bounds = await control.boundingBox();
  const name = await control.getAttribute('id') || 'sidebar toggle';
  expect(bounds.x, `${name} left edge`).toBeGreaterThanOrEqual(0);
  expect(bounds.x + bounds.width, `${name} right edge`).toBeLessThanOrEqual(width);
}

test('operate the terminal and complete the visor simulation', async ({ page, viewport }) => {
  await page.goto('/');

  const bootScreen = page.locator('#boot-terminal');
  await test.step('Skip boot and enter the terminal', async () => {
    await expect(bootScreen).toBeVisible();
    await page.keyboard.press('Space');
    await expect(page.locator('#bt-auth-wrap')).toHaveClass(/\bvisible\b/, { timeout: 2_000 });
    await page.locator('#bt-auth-btn').click();
    await expect(bootScreen).toBeHidden();
  });

  const sidebar = page.locator('.sidebar');
  const sidebarToggle = sidebar.locator('.sidebar-toggle');
  const armoryNav = sidebar.locator('button[data-tab="tab-armory"]');
  await test.step('Collapse and expand the navigation', async () => {
    await expectWithinViewport(sidebarToggle, viewport.width);
    await expect(sidebar).toHaveAttribute('data-collapsed', 'false');
    await sidebarToggle.click();
    await expect(sidebar).toHaveAttribute('data-collapsed', 'true');
    await expect(sidebarToggle).toHaveAttribute('aria-expanded', 'false');
    await expect(armoryNav).toBeHidden();

    await sidebarToggle.click();
    await expect(sidebar).toHaveAttribute('data-collapsed', 'false');
    await expect(sidebarToggle).toHaveAttribute('aria-expanded', 'true');
    await expect(armoryNav).toBeVisible();
  });

  await test.step('Select an anatomy hotspot', async () => {
    const hotspot = page.locator('#bnode-2');
    await expectWithinViewport(hotspot, viewport.width);
    await expect(hotspot).toHaveAttribute('aria-pressed', 'false');
    await hotspot.click();
    await expect(hotspot).toHaveAttribute('aria-pressed', 'true');
  });

  await test.step('Open the Armory and complete a visor simulation', async () => {
    await armoryNav.click();
    await expect(armoryNav).toHaveAttribute('aria-current', 'page');
    const armory = page.locator('#tab-armory');
    const fire = armory.locator('#visor-fire-btn');
    const distance = armory.locator('#visor-dist-slider');
    const status = armory.locator('#visor-shot-status');

    await expectWithinViewport(fire, viewport.width);
    await expectWithinViewport(distance, viewport.width);
    for (const control of await armory.locator('.visor-controls button').all()) {
      await expectWithinViewport(control, viewport.width);
    }

    await expect(status).toHaveAttribute('data-phase', 'ready');
    await fire.click();
    await expect(status).toHaveAttribute('data-phase', 'complete', { timeout: 10_000 });
  });
});
