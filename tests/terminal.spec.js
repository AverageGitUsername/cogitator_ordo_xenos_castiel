import { expect, test } from '@playwright/test';

async function expectWithinViewport(control, width) {
  await expect(control).toBeVisible();
  const bounds = await control.boundingBox();
  const name = await control.getAttribute('id') || 'sidebar toggle';
  expect(bounds.x, `${name} left edge`).toBeGreaterThanOrEqual(0);
  expect(bounds.x + bounds.width, `${name} right edge`).toBeLessThanOrEqual(width);
}

test('operate the terminal and complete the visor simulation', async ({ page, viewport }) => {
  test.setTimeout(65_000);
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
    await expect(armory.locator('#vtarg-2')).toHaveCount(0);
    await expect(armory.getByText('Свечение импульса', { exact: true })).toHaveCount(0);
    const expand = armory.getByRole('button', { name: 'На весь экран' });
    await expand.click();
    await expect(expand).toHaveAttribute('aria-pressed', 'true');
    const panel = armory.locator('#visor-panel');
    const canvas = armory.locator('#visor-3d-canvas');
    await expect(canvas).toHaveAttribute('data-renderer', 'webgl');
    await expect(canvas).toHaveAttribute('data-cast-status', 'ready', { timeout: 10_000 });
    expect((await panel.boundingBox()).width).toBe(viewport.width);
    const sceneBounds = await canvas.boundingBox();
    const settingsBounds = await panel.locator('.visor-settings').boundingBox();
    if (mobile) {
      const sequenceBounds = await panel.locator('.visor-sequence').boundingBox();
      expect(sequenceBounds.y).toBeGreaterThanOrEqual(sceneBounds.y + sceneBounds.height);
      expect(settingsBounds.y).toBeGreaterThanOrEqual(sequenceBounds.y + sequenceBounds.height);
    } else {
      expect(settingsBounds.x).toBeGreaterThan(sceneBounds.x + sceneBounds.width);
    }

    const initialScene = await canvas.screenshot();
    const castView = panel.getByRole('button', { name: 'Крупный план' });
    await castView.click();
    await expect(castView).toHaveAttribute('aria-pressed', 'true');
    await expect.poll(async () => (await canvas.screenshot()).equals(initialScene)).toBe(false);
    await castView.click();
    await expect(castView).toHaveAttribute('aria-pressed', 'false');
    const receiverView = panel.getByRole('button', { name: 'Мишень', exact: true });
    await receiverView.click();
    await expect(receiverView).toHaveAttribute('aria-pressed', 'true');
    await receiverView.click();
    await expect(receiverView).toHaveAttribute('aria-pressed', 'false');
    const initialTime = await armory.locator('#visor-hud-tof').textContent();
    await distance.fill('500');
    await expect(armory.locator('#visor-hud-tof')).not.toHaveText(initialTime);
    await expect.poll(async () => (await canvas.screenshot()).equals(initialScene)).toBe(false);

    const beforeOrbit = await canvas.screenshot();
    const { x, y, width, height } = await canvas.boundingBox();
    await page.mouse.move(x + width * .3, y + height * .54);
    await page.mouse.down();
    await page.mouse.move(x + width * .65, y + height * .65, { steps: 12 });
    await page.mouse.up();
    await expect.poll(async () => (await canvas.screenshot()).equals(beforeOrbit)).toBe(false);

    if (!mobile) {
      const beforeFlight = await canvas.screenshot();
      await panel.locator('#visor-viewport').focus();
      await page.keyboard.down('w');
      try {
        await page.evaluate(() => new Promise(resolve => {
          requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
        }));
      } finally {
        await page.keyboard.up('w');
      }
      await expect.poll(async () => (await canvas.screenshot()).equals(beforeFlight)).toBe(false);
    }

    const burst = panel.getByRole('button', { name: 'Короткая очередь' });
    await burst.click();
    await expect(burst).toHaveAttribute('aria-pressed', 'true');
    await fire.click();
    await expect(status).toHaveAttribute('data-phase', 'complete', { timeout: 10_000 });
    await expand.click();
    await expect(expand).toHaveAttribute('aria-pressed', 'false');
    await expect(distance).toHaveValue('500');
    await expect(burst).toHaveAttribute('aria-pressed', 'true');

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
  const planet = page.locator('#hololith-stage .holo-map-img');
  await expect.poll(() => planet.evaluate(image => image.naturalWidth)).toBe(1100);
  expect(await planet.evaluate(image => new URL(image.currentSrc).origin)).toBe(new URL(page.url()).origin);
  await page.locator('#astro-back-hub-btn').click();
  await expect(map).toBeVisible();

  await openSection('logs');
  const firstMission = page.locator('#mission-1');
  const firstMissionBtn = firstMission.locator('.mission-hd');
  await expect(firstMission).not.toHaveClass(/\bopen\b/);
  await expect(firstMissionBtn).toHaveAttribute('aria-expanded', 'false');
  await firstMissionBtn.click();
  await expect(firstMission).toHaveClass(/\bopen\b/);
  await expect(firstMissionBtn).toHaveAttribute('aria-expanded', 'true');

  await openSection('squad');
  await page.locator('.squad-card').first().click();
  const modal = page.locator('#squad-modal.active .modal-box');
  await expect(modal).toBeVisible();
  const bounds = await modal.boundingBox();
  const sidebar = await page.locator('.sidebar').boundingBox();
  expect(bounds.x).toBeCloseTo(mobile ? 0 : sidebar.x + sidebar.width, 0);
  expect(bounds.x + bounds.width).toBeCloseTo(viewport.width, 0);
});
