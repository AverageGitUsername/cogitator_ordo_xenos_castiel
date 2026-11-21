import { expect, test } from '@playwright/test';
import { readBaseline } from '../scripts/cms-baseline.mjs';

test('published CMS content changes navigation, theme, and copy across languages', async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem('boot_terminal_shown', '1'));
  await page.route('**/api/cms/site', route => route.fulfill({
    json: { document: {
      schemaVersion: 1,
      theme: { '--gold': '#12aa33' },
      navigation: [
        { id: 'research', label: { ru: 'Исследования', en: 'Research' } },
        { id: 'tab-bio', label: { ru: 'Биометрия', en: 'Biometrics' } },
      ],
      overrides: [{ id: 'chapter', selector: '.sb-chapter', locale: 'en', text: 'Custom chapter' }],
      pages: [{
        id: 'research',
        title: { ru: 'Полевые записи', en: 'Field notes' },
        blocks: [
          { id: 'intro', type: 'text', text: { ru: 'Пример записи', en: 'Sample entry' } },
          { id: 'unsafe', type: 'link', href: 'javascript:alert(1)', title: { ru: 'Опасная ссылка', en: 'Unsafe link' } },
        ],
      }],
      locales: { en: { UI: { sidebar: { chapter: 'Edited chapter' } } } },
    } },
  }));

  await page.goto('/#research');
  await expect(page.locator('#tab-research')).toBeVisible();
  await expect(page.locator('#tab-research')).toHaveText(/Полевые записи.*Пример записи/s);
  await expect(page.locator('.sb-nav .nav-item').first()).toHaveText('Исследования');
  await expect(page.locator('html')).toHaveCSS('--gold', '#12aa33');
  await expect(page.locator('#tab-research a[href^="javascript:"]')).toHaveCount(0);

  await page.evaluate(() => window.toggleSiteLanguage());
  await expect(page.locator('#tab-research')).toHaveText(/Field notes.*Sample entry/s);
  await expect(page.locator('.sb-nav .nav-item').first()).toHaveText('Research');
  await expect(page.locator('.sb-chapter')).toHaveText('Custom chapter');
});

test('authored content can move a live widget and replace responsive images without enabling raw scripts', async ({ page }) => {
  const baseline = await readBaseline();
  const document = {
    ...baseline,
    overrides: [{ id: 'portrait', selector: '.char-img', asset: '/api/cms/assets/portrait' }],
    pages: [...baseline.pages, {
      id: 'profile',
      title: { ru: 'Профиль', en: 'Profile' },
      blocks: [
        { id: 'before', type: 'text', text: { ru: 'Начало', en: 'Before' } },
        { id: 'bio', type: 'builtin', widget: 'tab-bio' },
        { id: 'after', type: 'text', format: 'markdown', text: { ru: '**Конец**', en: '**After**' } },
      ],
    }],
    locales: {
      ...baseline.locales,
      ru: {
        ...baseline.locales.ru,
        UI: {
          ...baseline.locales.ru.UI,
          bio: {
            ...baseline.locales.ru.UI.bio,
            titleHtml: '<em>Биологический профиль</em><script>window.scriptRan = true</script>' +
              '<a href="javascript:alert(1)" onclick="window.scriptRan = true">Тест</a>',
          },
        },
      },
    },
  };
  await page.addInitScript(() => sessionStorage.setItem('boot_terminal_shown', '1'));
  await page.route('**/api/cms/site', route => route.fulfill({ json: { document } }));
  await page.route('**/api/cms/assets/portrait', route => route.fulfill({
    contentType: 'image/png',
    body: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aYQAAAABJRU5ErkJggg==', 'base64'),
  }));
  await page.goto('/#profile');
  const view = page.locator('#tab-profile');
  await expect(view.locator(':scope > article').first()).toHaveText('Начало');
  await expect(view.locator(':scope > #tab-bio .pg-title em')).toHaveText('Биологический профиль');
  await expect(view.locator(':scope > article .cms-markdown strong')).toHaveText('Конец');
  await expect(view.locator('.char-img')).not.toHaveAttribute('srcset');
  await expect.poll(() => view.locator('.char-img').evaluate(node => node.currentSrc)).toContain('/api/cms/assets/portrait');
  await expect(view.locator('.pg-title script, .pg-title [onclick], .pg-title a[href^="javascript:"]')).toHaveCount(0);
  await view.locator('#bnode-1').click();
  await expect(view.locator('#bnode-1')).toHaveClass(/\bactive\b/);
});

test('the terminal preview accepts the configured admin parent and ignores other parents', async ({ page, baseURL }) => {
  const terminalOrigin = 'https://terminal-preview.example';
  // Serve the actual build through an HTTPS origin so that Chromium's
  // local-network checks do not block the harness iframe from mounting.
  await page.route(terminalOrigin + '/**', async route => {
    const url = new URL(route.request().url());
    const response = await route.fetch({ url: new URL(url.pathname + url.search, baseURL).href });
    await route.fulfill({ response });
  });
  await page.route('**/api/cms/site', route => route.fulfill({ json: { document: null } }));
  await page.route('**/__preview-harness', route => route.fulfill({
    contentType: 'text/html',
    body: `<script>window.previewMessages = []; addEventListener('message', event => window.previewMessages.push(event.data));</script>
      <iframe src="${terminalOrigin}/?cmsPreview=1#review" style="width:100%;height:80vh"></iframe>`,
  }));
  const draft = {
    schemaVersion: 1,
    theme: {},
    navigation: [],
    overrides: [],
    pages: [{ id: 'review', title: { ru: 'Черновик', en: 'Draft' }, blocks: [] }],
  };
  async function loadParent(parentURL) {
    await page.goto(parentURL + '/__preview-harness');
    await expect(page.frameLocator('iframe').locator('#tab-bio')).toBeAttached();
    await page.evaluate(({ document: draft, terminalOrigin }) => {
      document.querySelector('iframe').contentWindow.postMessage({ type: 'terminal:cms-preview', document: draft }, terminalOrigin);
    }, { document: draft, terminalOrigin });
  }
  await loadParent('https://castiel-admin.vercel.app');
  await expect(page.frameLocator('iframe').locator('#tab-review')).toHaveText('Черновик');
  await expect(page.frameLocator('iframe').locator('#boot-terminal')).toBeHidden();
  await expect.poll(() => page.evaluate(() => window.previewMessages.some(message => message.type === 'terminal:cms-ready'))).toBe(true);

  async function command(message) {
    await page.evaluate(({ message, terminalOrigin }) => {
      document.querySelector('iframe').contentWindow.postMessage(message, terminalOrigin);
    }, { message, terminalOrigin });
  }
  await command({ type: 'terminal:cms-navigate', id: 'tab-dossier' });
  const dossier = page.frameLocator('iframe').locator('#tab-dossier');
  await expect(dossier).toBeVisible();
  await expect.poll(() => page.evaluate(() =>
    window.previewMessages.findLast(message => message.type === 'terminal:cms-elements')?.pageId
  )).toBe('tab-dossier');
  const selector = await page.evaluate(() => window.previewMessages.findLast(message => message.type === 'terminal:cms-elements')
    .elements.find(element => element.selector === '#archive-btn')?.selector);
  expect(selector).toBe('#archive-btn');
  await command({ type: 'terminal:cms-highlight', selector });
  await expect(dossier.locator('[data-cms-selected]')).toHaveCount(1);
  await command({ type: 'terminal:cms-select-mode', enabled: true });
  await dossier.locator('[data-cms-selected]').click();
  await expect.poll(() => page.evaluate(() => window.previewMessages.findLast(message => message.type === 'terminal:cms-selection')?.selector)).toBe(selector);
  await command({ type: 'terminal:cms-preview', document: {
    ...draft, overrides: [{ id: 'archive', selector, text: 'Проверено редактором' }],
  } });
  await expect(dossier.locator(selector)).toHaveText('Проверено редактором');
  const embedded = page.frameLocator('iframe');
  if (await embedded.locator('#terminal-sidebar').getAttribute('inert') !== null) {
    await embedded.locator('.sidebar-toggle').click();
  }
  await embedded.locator('.nav-item[data-tab="tab-armory"]').click();
  await expect.poll(() => page.evaluate(() => window.previewMessages.findLast(message => message.type === 'terminal:cms-page')?.pageId)).toBe('tab-armory');

  await loadParent('https://untrusted.example');
  const frame = page.frameLocator('iframe');
  // Wait for the document's event loop to consume the parent's posted message.
  await frame.locator('html').evaluate(() => new Promise(resolve => setTimeout(resolve, 100)));
  await expect(frame.locator('#tab-review')).toHaveCount(0);
});

test('visual editor supports persistent selection, mouse drag resize/move, and background studio vars', async ({ page, baseURL }) => {
  const terminalOrigin = 'https://terminal-preview.example';
  await page.route(terminalOrigin + '/**', async route => {
    const url = new URL(route.request().url());
    const response = await route.fetch({ url: new URL(url.pathname + url.search, baseURL).href });
    await route.fulfill({ response });
  });
  await page.route('**/api/cms/site', route => route.fulfill({ json: { document: null } }));
  await page.route('**/__visual-harness', route => route.fulfill({
    contentType: 'text/html',
    body: `<script>window.previewMessages = []; addEventListener('message', event => window.previewMessages.push(event.data));</script>
      <iframe src="${terminalOrigin}/?cmsPreview=1#tab-dossier" style="width:100%;height:85vh;border:0"></iframe>`,
  }));

  await page.goto('https://castiel-admin.vercel.app/__visual-harness');
  const frame = page.frameLocator('iframe');
  await expect(frame.locator('#tab-dossier')).toBeAttached();

  const draft = {
    schemaVersion: 1,
    theme: {
      '--cms-bg-dim': '0.5',
      '--cms-bg-blur': '6',
      '--cms-bg-gradient': 'linear-gradient(155deg, #09090b 0%, #18181b 100%)',
    },
    navigation: [],
    overrides: [],
    pages: [],
  };

  await page.evaluate(({ draft, terminalOrigin }) => {
    document.querySelector('iframe').contentWindow.postMessage({ type: 'terminal:cms-preview', document: draft }, terminalOrigin);
  }, { draft, terminalOrigin });

  await expect(frame.locator('html')).toHaveCSS('--cms-bg-dim', '0.5');
  await expect(frame.locator('html')).toHaveCSS('--cms-bg-blur', '6px');

  await page.evaluate(({ terminalOrigin }) => {
    document.querySelector('iframe').contentWindow.postMessage({ type: 'terminal:cms-select-mode', enabled: true, keepOpen: true }, terminalOrigin);
  }, { terminalOrigin });

  // Click #archive-btn -> selects it AND mounts #cms-manipulator
  await frame.locator('#archive-btn').click();
  await expect(frame.locator('#cms-manipulator')).toBeVisible();

  // Drag the bottom-right resize handle
  const handle = frame.locator('.cms-man-handle[data-dir="se"]');
  await handle.scrollIntoViewIfNeeded();
  const box = await handle.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + 25, box.y + 15, { steps: 5 });
  await page.mouse.up();

  await expect.poll(() => page.evaluate(() =>
    window.previewMessages.findLast(m => m.type === 'terminal:cms-patch-styles')?.styles?.width
  )).toBeTruthy();
});
