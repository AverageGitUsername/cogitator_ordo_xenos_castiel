import { expect, test } from '@playwright/test';

test('breadcrumbs, in-page archive, top-visible preloaders, and haptics work on mobile and desktop', async ({ page, viewport }) => {
  await page.addInitScript(() => {
    window.__vibrateCalls = [];
    navigator.vibrate = pattern => {
      window.__vibrateCalls.push(pattern);
      return true;
    };
  });

  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.keyboard.press('Space');
  await page.locator('#bt-auth-btn').click();
  await expect(page.locator('#boot-terminal')).toBeHidden();

  const breadcrumbs = page.locator('#terminal-breadcrumbs');
  await expect(breadcrumbs).toBeHidden();

  // Verify no slop banners remain
  await expect(page.locator('.imprimatur')).toHaveCount(0);
  await expect(page.locator('#sublim-banner')).toHaveCount(0);

  const mobile = viewport.width <= 980;
  if (mobile) {
    // When mobile drawer is open, toggle button sits inside .sb-head on the same row as the chapter label
    await page.locator('.sidebar-toggle').click();
    const headToggle = page.locator('.sidebar .sb-head .sidebar-toggle');
    await expect(headToggle).toBeVisible();
    const toggleBox = await headToggle.boundingBox();
    const chapterBox = await page.locator('.sidebar .sb-chapter').boundingBox();
    expect(Math.abs(toggleBox.y - chapterBox.y)).toBeLessThan(32);
    await page.locator('.nav-item[data-tab="tab-dossier"]').click();
  } else {
    await page.locator('.nav-item[data-tab="tab-dossier"]').click();
  }

  // Dossier auth screen must be visible immediately at the top of the viewport without scrolling
  const authLine = page.locator('#al1');
  await expect(authLine).toBeVisible();
  const authBox = await authLine.boundingBox();
  expect(authBox.y).toBeGreaterThanOrEqual(0);
  expect(authBox.y + authBox.height).toBeLessThan(viewport.height);

  await expect(page.locator('#dossier-content')).toHaveClass(/\bvisible\b/, { timeout: 6_000 });
  await expect(breadcrumbs).toContainText(/Главная.*Досье|Home.*Dossier/);

  // Open Psycho-Memorial Archive and verify it opens as an in-terminal subpage inside #tab-dossier
  await page.locator('#archive-btn').click();
  const archive = page.locator('#psycho-archive');
  await expect(archive).toHaveClass(/\bactive\b/, { timeout: 10_000 });
  await expect(page.locator('#tab-dossier')).toHaveClass(/\bhas-subpage\b/);
  await expect(page.locator('#psycho-archive .modal-seal')).toHaveCount(0);
  await expect(breadcrumbs).toContainText(/Психо-мемориальный архив|Psycho-Memorial Archive/);

  // Click the Dossier breadcrumb to return cleanly to Dossier
  await breadcrumbs.locator('.bc-link').nth(1).click();
  await expect(archive).not.toHaveClass(/\bactive\b/);
  await expect(page.locator('#tab-dossier')).not.toHaveClass(/\bhas-subpage\b/);

  // Switch to Armory and check preloader appears in viewport without scrolling
  if (mobile) await page.locator('.sidebar-toggle').click();
  await page.locator('.nav-item[data-tab="tab-armory"]').click();
  const armoryLine = page.locator('#armory-loader .pl-line').first();
  await expect(armoryLine).toBeVisible({ timeout: 3_000 });
  const armoryLineBox = await armoryLine.boundingBox();
  expect(armoryLineBox.y).toBeGreaterThanOrEqual(0);
  expect(armoryLineBox.y + armoryLineBox.height).toBeLessThan(viewport.height);

  // Click Home breadcrumb to return to Biometrics
  await breadcrumbs.locator('.bc-link').first().click();
  await expect(page.locator('#tab-bio')).toHaveClass(/\bactive\b/);

  // Verify tactile haptics fired
  expect(await page.evaluate(() => window.__vibrateCalls.length)).toBeGreaterThan(2);
});
