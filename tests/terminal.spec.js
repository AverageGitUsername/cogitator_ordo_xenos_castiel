import { expect, test } from '@playwright/test';

async function expectWithinViewport(control, width) {
  await expect(control).toBeVisible();
  const bounds = await control.boundingBox();
  const name = await control.getAttribute('id') || 'sidebar toggle';
  expect(bounds.x, `${name} left edge`).toBeGreaterThanOrEqual(0);
  expect(bounds.x + bounds.width, `${name} right edge`).toBeLessThanOrEqual(width);
}

test('operate the terminal and complete the visor simulation', async ({ page, viewport }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  const bootScreen = page.locator('#boot-terminal');
  await test.step('Skip boot and enter the terminal', async () => {
    await expect(bootScreen).toBeVisible();
    await page.keyboard.press('Space');
    await expect(page.locator('#bt-auth-wrap')).toHaveClass(/\bvisible\b/, { timeout: 2_000 });
    await page.locator('#bt-auth-btn').click();
    await expect(bootScreen).toBeHidden();
  });

  const sidebar = page.locator('.sidebar');
  const sidebarToggle = page.locator('.sidebar-toggle');
  const armoryNav = sidebar.locator('button[data-tab="tab-armory"]');
  const mobile = viewport.width <= 980;
  await test.step('Collapse and expand the navigation', async () => {
    const content = page.locator('main.content');
    const readScroll = () => content.evaluate(element => element.scrollTop);
    if (mobile) await content.evaluate(element => { element.scrollTop = 180; });
    const initialScroll = await readScroll();
    await expectWithinViewport(sidebarToggle, viewport.width);
    await expect(sidebar).toHaveAttribute('data-collapsed', String(mobile));
    if (!mobile) {
      const control = await sidebarToggle.boundingBox();
      const label = await sidebar.locator('.sb-chapter').boundingBox();
      expect(control.x + control.width).toBeLessThan(label.x);
      expect(Math.abs(control.y + control.height / 2 - label.y - label.height / 2)).toBeLessThan(4);
    }
    if (mobile) await sidebarToggle.click();
    await sidebarToggle.click();
    await expect(sidebar).toHaveAttribute('data-collapsed', 'true');
    await expect(sidebarToggle).toHaveAttribute('aria-expanded', 'false');
    if (mobile) await expect(armoryNav).toBeHidden();
    else await expect(armoryNav.locator('svg')).toBeVisible();

    await sidebarToggle.click();
    await expect(sidebar).toHaveAttribute('data-collapsed', 'false');
    await expect(sidebarToggle).toHaveAttribute('aria-expanded', 'true');
    await expect(armoryNav).toBeVisible();
    if (mobile) {
      await sidebarToggle.click();
      expect(await readScroll()).toBe(initialScroll);
      await content.evaluate(element => { element.scrollTop = 0; });
    }
  });

  await test.step('Select an anatomy hotspot', async () => {
    const hotspot = page.locator('#bnode-2');
    await expectWithinViewport(hotspot, viewport.width);
    await expect(hotspot).toHaveAttribute('aria-pressed', 'false');
    await hotspot.click();
    await expect(hotspot).toHaveAttribute('aria-pressed', 'true');
  });

  await test.step('Open the Armory and complete a visor simulation', async () => {
    if (mobile) await sidebarToggle.click();
    await armoryNav.click();
    await expect(armoryNav).toHaveAttribute('aria-current', 'page');
    if (mobile) await expect(sidebarToggle).toHaveAttribute('aria-expanded', 'false');
    const armory = page.locator('#tab-armory');
    await expect(armory.locator('#armory-loader')).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
    await expect(armory.locator('#armory-content')).toHaveClass(/\bvisible\b/, { timeout: 8_000 });
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

    const weapon = armory.locator('.weapon-card').first();
    const trigger = weapon.getByRole('button').first();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expectWithinViewport(trigger, viewport.width);
    await expectWithinViewport(trigger.locator('.w-chevron'), viewport.width);
    await trigger.press('Enter');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await trigger.click();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });
});

test('navigate the system map and fit the dossier against the sidebar', async ({ page, viewport }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.keyboard.press('Space');
  await page.locator('#bt-auth-btn').click();
  await expect(page.locator('#boot-terminal')).toBeHidden();

  const mobile = viewport.width <= 980;
  async function openSection(name) {
    if (mobile) await page.locator('.sidebar-toggle').click();
    await page.locator(`[data-tab="tab-${name}"]`).click();
    await expect(page.locator(`#${name}-content`)).toHaveClass(/\bvisible\b/, { timeout: 8000 });
  }

  await openSection('astro');
  const map = page.locator('.sys-hub-stage');
  const picture = map.locator('img');
  await expect.poll(() => picture.evaluate(image => image.naturalWidth)).toBe(1480);
  expect(await picture.evaluate(image => new URL(image.currentSrc).origin)).toBe(new URL(page.url()).origin);
  await page.locator('.system-index [data-system-body="3"]').click();
  await expect(map.locator('[data-system-body="3"]')).toHaveAttribute('aria-pressed', 'true');
  await page.locator('#system-caelis-marker').press('Enter');
  await expect(page.locator('#astro-caelis-view')).toBeVisible();
  await page.locator('#astro-back-hub-btn').click();
  await expect(map).toBeVisible();

  await openSection('squad');
  await page.locator('.squad-card').first().click();
  const modal = page.locator('#squad-modal.active .modal-box');
  await expect(modal).toBeVisible();
  const bounds = await modal.boundingBox();
  const sidebar = await page.locator('.sidebar').boundingBox();
  expect(bounds.x).toBeCloseTo(mobile ? 0 : sidebar.x + sidebar.width, 0);
  expect(bounds.x + bounds.width).toBeCloseTo(viewport.width, 0);
});
