import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { readBaseline } from './cms-baseline.mjs';

test('exports the current terminal as an importable bilingual site', async () => {
  const baseline = await readBaseline();
  const sidebar = await readFile(new URL('../src/components/Sidebar.jsx', import.meta.url), 'utf8');
  const tabIds = Array.from(sidebar.matchAll(/data-tab="([^"]+)"/g), (match) => match[1]);

  assert.equal(baseline.schemaVersion, 1);
  assert.deepEqual(baseline.navigation.map((entry) => entry.id), tabIds);
  assert.deepEqual(baseline.pages.map((entry) => entry.id), tabIds);
  assert.equal(baseline.navigation[0].label.ru, 'Биометрия');
  assert.equal(baseline.navigation[0].label.en, 'Biometrics');
  assert.equal(baseline.theme['--bg'], '#070203');
  assert.equal(baseline.locales.ru.SQUAD_DATA.length, baseline.locales.en.SQUAD_DATA.length);
  assert.match(baseline.locales.ru.DOSSIER_BENTO_HTML, /Архив Досье/);
  assert.ok(!('SYS_IMG' in baseline.locales.en));
  assert.deepEqual(JSON.parse(JSON.stringify(baseline)), baseline);
});
