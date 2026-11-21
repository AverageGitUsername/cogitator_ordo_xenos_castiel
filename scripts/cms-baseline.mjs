import { readFile, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

const tabs = [
  'tab-bio', 'tab-dossier', 'tab-armory', 'tab-logs',
  'tab-astro', 'tab-squad', 'tab-sublim', 'tab-comm',
];

function readProjectFile(path) {
  return readFile(new URL(path, import.meta.url), 'utf8');
}

async function readLocale(language) {
  const source = await readProjectFile('../locales/' + language + '.js');
  const body = source.slice(source.indexOf('export default ') + 'export default '.length);
  const locale = JSON.parse(body.replace(/^\s*"SYS_IMG": systemImage,\s*$/m, '').trim().replace(/;$/, ''));
  return locale;
}

function themeTokens(stylesheets) {
  const roots = stylesheets.map((stylesheet) => stylesheet.match(/:root\s*\{([^}]+)\}/)?.[1] ?? '');
  const declarations = roots.flatMap((root) => [...root.matchAll(/^\s*(--[\w-]+):\s*([^;\r\n]+);/gm)]);
  return Object.fromEntries(declarations.map(([, key, value]) => [key, value.trim()]));
}

function tabLabel(locale, tab, index) {
  const sidebar = locale.UI.sidebar;
  if (tab === 'tab-sublim') return sidebar.hiddenReal.replace(/^>\s*/, '');
  return sidebar.navLabels[index - Number(index > tabs.indexOf('tab-sublim'))];
}

export async function readBaseline() {
  const [ru, en, styles, refinements] = await Promise.all([
    readLocale('ru'),
    readLocale('en'),
    readProjectFile('../css/style.css'),
    readProjectFile('../css/refinements.css'),
  ]);
  const navigation = tabs.map((id, index) => ({
    id,
    label: { ru: tabLabel(ru, id, index), en: tabLabel(en, id, index) },
  }));
  return {
    schemaVersion: 1,
    theme: themeTokens([styles, refinements]),
    navigation,
    overrides: [],
    pages: navigation.map(({ id, label }) => ({
      id,
      title: label,
      blocks: [{ id: id + '-content', type: 'builtin', widget: id }],
    })),
    locales: { ru, en },
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const json = JSON.stringify(await readBaseline(), null, 2) + '\n';
  if (process.argv[2]) await writeFile(process.argv[2], json, 'utf8');
  else process.stdout.write(json);
}
