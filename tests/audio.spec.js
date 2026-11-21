import { expect, test } from '@playwright/test';

test('cogitator audio engine synthesizes Warhammer SFX across tabs without errors', async ({ page, viewport }) => {
  const pageErrors = [];
  page.on('pageerror', err => pageErrors.push(String(err)));

  // Spy on AudioContext creation and node usage without altering real Web Audio behavior.
  await page.addInitScript(() => {
    const NativeCtx = window.AudioContext || window.webkitAudioContext;
    if (!NativeCtx) return;
    window.__audioStats = { created: 0, convolvers: 0, shapers: 0, compressors: 0, oscs: 0, buffers: 0 };
    class TrackedAudioContext extends NativeCtx {
      constructor(...args) {
        super(...args);
        window.__audioStats.created += 1;
        window.__lastAudioCtx = this;
      }
      createConvolver() {
        window.__audioStats.convolvers += 1;
        return super.createConvolver();
      }
      createWaveShaper() {
        window.__audioStats.shapers += 1;
        return super.createWaveShaper();
      }
      createDynamicsCompressor() {
        window.__audioStats.compressors += 1;
        return super.createDynamicsCompressor();
      }
      createOscillator() {
        window.__audioStats.oscs += 1;
        return super.createOscillator();
      }
      createBufferSource() {
        window.__audioStats.buffers += 1;
        return super.createBufferSource();
      }
    }
    window.AudioContext = TrackedAudioContext;
    if (window.webkitAudioContext) window.webkitAudioContext = TrackedAudioContext;
  });

  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#boot-terminal')).toBeVisible();

  // AudioContext must not spin up before a user gesture.
  expect(await page.evaluate(() => window.__audioStats?.created || 0)).toBe(0);

  await page.keyboard.press('Space');
  await expect(page.locator('#bt-auth-wrap')).toHaveClass(/\bvisible\b/, { timeout: 2_000 });
  await page.locator('#bt-auth-btn').click();
  await expect(page.locator('#boot-terminal')).toBeHidden();

  const statsAfterBoot = await page.evaluate(() => window.__audioStats);
  expect(statsAfterBoot.created).toBe(1);
  expect(statsAfterBoot.convolvers).toBeGreaterThanOrEqual(1);
  expect(statsAfterBoot.shapers).toBeGreaterThanOrEqual(1);
  expect(statsAfterBoot.compressors).toBeGreaterThanOrEqual(1);
  expect(statsAfterBoot.oscs).toBeGreaterThan(4);
  expect(statsAfterBoot.buffers).toBeGreaterThan(2);

  // Trigger Biometrics stress test & DNA tab
  await page.locator('#ecg-stress-btn').click();
  await page.locator('.dna-tab').nth(1).click();

  const oscCountBeforeArmory = await page.evaluate(() => window.__audioStats.oscs);

  // Switch to Armory and fire a visor simulation
  const mobile = viewport.width <= 980;
  if (mobile) await page.locator('.sidebar-toggle').click();
  await page.locator('.nav-item[data-tab="tab-armory"]').click();
  await expect(page.locator('#armory-content')).toHaveClass(/\bvisible\b/, { timeout: 8_000 });

  await page.locator('#vmode-1').click();
  await page.locator('[data-visor-ammo="1"]').click();
  await page.locator('#visor-fire-btn').click();
  await expect(page.locator('#visor-shot-status')).toHaveAttribute('data-phase', 'complete', { timeout: 10_000 });

  const oscCountAfterArmory = await page.evaluate(() => window.__audioStats.oscs);
  expect(oscCountAfterArmory).toBeGreaterThan(oscCountBeforeArmory + 6);

  // Toggle mute off and back on
  if (mobile) await page.locator('.sidebar-toggle').click();
  const sfxBtn = page.locator('#sfx-toggle-btn');
  await sfxBtn.click();
  expect(await page.evaluate(() => localStorage.getItem('cogitator_muted'))).toBe('1');
  await expect(sfxBtn).toContainText(/ВЫКЛ|OFF/);

  await sfxBtn.click();
  expect(await page.evaluate(() => localStorage.getItem('cogitator_muted'))).toBe('0');
  await expect(sfxBtn).toContainText(/ВКЛ|ON/);

  expect(pageErrors).toEqual([]);
});
