import { expect, test } from '@playwright/test';

test.use({ reducedMotion: 'reduce' });

async function openTerminal(page) {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#boot-terminal')).toBeVisible();
  if (!await page.locator('#bt-auth-wrap').isVisible()) await page.keyboard.press('Space');
  await page.locator('#bt-auth-btn').click();
  await expect(page.locator('#boot-terminal')).toBeHidden();
}

async function switchTab(page, tabId) {
  await page.evaluate(id => {
    window.switchTab(id, document.querySelector(`.nav-item[data-tab="${id}"]`));
  }, tabId);
}

test('returning to Sublimation continues the same scan', async ({ page }) => {
  await openTerminal(page);
  await switchTab(page, 'tab-sublim');
  const lines = page.locator('#sublim-loader .pl-line');
  await expect(lines.first()).toBeVisible();
  const firstLine = await lines.first().elementHandle();

  await switchTab(page, 'tab-bio');
  await switchTab(page, 'tab-sublim');
  expect(await firstLine.evaluate(element => element.isConnected)).toBe(true);
  await expect(page.locator('#sublim-content')).toHaveClass(/\bvisible\b/, { timeout: 8000 });
  const transcript = await lines.allTextContents();
  expect(new Set(transcript).size).toBe(transcript.length);
});

test('Sublimation keeps the reader controls in place while changing scrolls', async ({ page }) => {
  await openTerminal(page);
  await page.evaluate(() => sessionStorage.setItem('preloader_done_sublim', '1'));
  await switchTab(page, 'tab-sublim');
  await page.evaluate(() => document.fonts.ready);

  const tab = page.locator('#tab-sublim');
  const layout = () => tab.evaluate(element => {
    const top = element.getBoundingClientRect().top;
    return ['.sublim-list', '.sr-body', '.sr-nav-btns'].map(selector => {
      const bounds = element.querySelector(selector).getBoundingClientRect();
      return [Math.round(bounds.top - top), Math.round(bounds.height)];
    });
  });

  const standbyLayout = await layout();
  await tab.locator('#sub-1 .log-hd').click();
  await expect(tab.locator('#sublim-banner')).toBeVisible();
  expect(await layout()).toEqual(standbyLayout);

  const poem = tab.locator('.sr-body');
  await poem.evaluate(element => { element.scrollTop = 160; });
  expect(await poem.evaluate(element => element.scrollTop)).toBeGreaterThan(0);
  await tab.locator('#sr-next-btn').click();
  await expect(tab.locator('#sub-2')).toHaveClass(/\bactive-slot\b/);
  expect(await poem.evaluate(element => element.scrollTop)).toBe(0);
  expect(await layout()).toEqual(standbyLayout);

  await tab.locator('#sr-encrypt-btn').click();
  await expect(tab.locator('#sub-1')).toHaveClass(/\bactive-slot\b/);
  await tab.locator('#sr-encrypt-btn').click();
  await expect(tab.locator('#sublim-banner')).toBeHidden();
  expect(await layout()).toEqual(standbyLayout);
});
