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

  // Clicking skeleton hotspot with mouse/tap must NOT draw an outline square
  await page.locator('#bnode-1').click();
  await expect(page.locator('#bnode-1')).toHaveCSS('outline-style', 'none');

  const mobile = viewport.width <= 980;
  if (mobile) {
    // Collapsed mobile toggle has transparent background (no dark box)
    const toggle = page.locator('.sidebar-toggle');
    await expect(toggle).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');

    // When mobile drawer is open, toggle button sits inside .sb-head on the same row as the chapter label
    await toggle.click();
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

test('full keyboard navigation and hotkeys reference modal work without mouse', async ({ page, viewport }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.keyboard.press('Space');
  await page.locator('#bt-auth-btn').click();
  await expect(page.locator('#boot-terminal')).toBeHidden();

  // Open and close hotkeys modal via ? and Escape
  await page.keyboard.press('?');
  const hkModal = page.locator('#hotkeys-modal');
  await expect(hkModal).toHaveClass(/\bactive\b/);
  await page.keyboard.press('Escape');
  await expect(hkModal).not.toHaveClass(/\bactive\b/);

  // Jump to Squad with '6', open first brother dossier via keyboard Enter, scroll story with ArrowDown / S
  await page.keyboard.press('6');
  await expect(page.locator('#squad-content')).toHaveClass(/\bvisible\b/, { timeout: 8_000 });
  const firstCard = page.locator('.squad-card').first();
  await firstCard.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#squad-modal')).toHaveClass(/\bactive\b/);
  await expect(page.locator('#squad-breadcrumbs')).toBeVisible();
  if (viewport.width <= 980) {
    await expect(page.locator('.sidebar-toggle')).toBeVisible();
  }
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('KeyS');
  await expect.poll(() => page.locator('#squad-modal').evaluate(el => el.scrollTop)).toBeGreaterThan(0);
  await page.keyboard.press('Escape');
  await expect(page.locator('#squad-modal')).not.toHaveClass(/\bactive\b/);

  // Jump to Mission Logs with '4', expand a lower mission (#mission-5) via Enter and scroll its story with ArrowDown
  await page.keyboard.press('4');
  await expect(page.locator('#logs-content')).toHaveClass(/\bvisible\b/, { timeout: 8_000 });
  const m5Head = page.locator('#mission-5 .mission-hd');
  await m5Head.scrollIntoViewIfNeeded();
  await m5Head.focus();
  await page.keyboard.press('Enter');
  await expect(m5Head).toHaveAttribute('aria-expanded', 'true');
  await page.waitForTimeout(250);
  const beforeMissionScroll = await page.locator('main.content').evaluate(el => el.scrollTop);
  await page.keyboard.press('ArrowDown');
  await expect.poll(() => page.locator('main.content').evaluate(el => el.scrollTop)).toBeGreaterThan(beforeMissionScroll);

  // Jump to Armory with '3', verify mouse click on armor node has no focus box, then activate #anode-2 via keyboard
  await page.keyboard.press('3');
  await expect(page.locator('#armory-content')).toHaveClass(/\bvisible\b/, { timeout: 8_000 });
  await page.locator('#anode-1').click();
  await expect(page.locator('#anode-1')).toHaveCSS('outline-style', 'none');
  await page.locator('#anode-2').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#anode-2')).toHaveClass(/\bactive\b/);

  // Jump to Sublimation with '7', navigate scrolls using WASD and Arrow keys without mouse or Tab
  await page.keyboard.press('7');
  await expect(page.locator('#sublim-content')).toHaveClass(/\bvisible\b/, { timeout: 8_000 });
  await page.locator('#sub-1').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#sub-1')).toHaveClass(/\bactive-slot\b/);

  // Down via S moves focus from #sub-1 to #sub-2, Enter opens scroll 2
  await page.keyboard.press('KeyS');
  await expect(page.locator('#sub-2')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#sub-2')).toHaveClass(/\bactive-slot\b/);

  // Up via ArrowUp returns focus to #sub-1
  await page.keyboard.press('ArrowUp');
  await expect(page.locator('#sub-1')).toBeFocused();
});
