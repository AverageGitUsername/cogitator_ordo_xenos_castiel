import DOMPurify from 'dompurify';

export const BUILTINS = [
  'tab-bio', 'tab-dossier', 'tab-armory', 'tab-logs',
  'tab-astro', 'tab-squad', 'tab-sublim', 'tab-comm',
];

export const THEME_COLORS = new Set([
  '--crimson', '--crimson-bright', '--crimson-dark', '--crimson-deep',
  '--gold', '--gold-bright', '--gold-dark', '--bg', '--bg-mid', '--panel',
  '--border', '--border-bright', '--border-gold', '--text', '--text-muted',
  '--text-dim', '--green-ok', '--scan',
]);

export function safeGradient(value) {
  if (typeof value !== 'string' || !value.trim() || value.length > 512) return null;
  const trimmed = value.trim();
  if (/[;{}\\]|(?:url|image-set|expression|var)\s*\(/i.test(trimmed)) return null;
  if (/^(?:linear|radial|conic)-gradient\(.+\)$/i.test(trimmed) && CSS.supports('background-image', trimmed)) {
    return trimmed;
  }
  if (CSS.supports('color', trimmed)) {
    return `linear-gradient(180deg, ${trimmed}, ${trimmed})`;
  }
  return null;
}

const visualProperties = new Set([
  'background-color', 'color', 'border-color', 'border-width', 'border-style',
  'border-radius', 'border', 'outline', 'opacity', 'font-size', 'font-family', 'font-weight',
  'font-style', 'line-height', 'letter-spacing', 'text-align', 'text-shadow',
  'text-decoration', 'text-transform', 'object-fit', 'object-position',
  'width', 'max-width', 'min-width', 'height', 'max-height', 'min-height',
  'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
  'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
  'gap', 'box-shadow', 'white-space',
  'position', 'left', 'top', 'right', 'bottom', 'z-index', 'transform', 'filter',
  'display', 'grid-template-columns', 'grid-column', 'grid-row', 'order',
  'flex-wrap', 'flex-direction', 'align-items', 'justify-content', 'align-self',
]);

export function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function sectionId(value) {
  if (typeof value !== 'string' || !/^[a-z0-9][a-z0-9-]{0,63}$/.test(value)) return null;
  return value.startsWith('tab-') ? value : `tab-${value}`;
}

export function localized(value, language) {
  if (!isRecord(value)) return '';
  return [value[language], value.ru, value.en].find(text => typeof text === 'string' && text.trim()) || '';
}

export function safeUrl(value, cmsBase, link = false) {
  if (typeof value !== 'string') return null;
  const raw = value.trim();
  if (!raw || raw.startsWith('//') || /[\\\x00-\x1f\x7f]/.test(raw)) return null;
  if (link && raw.startsWith('#')) return raw;
  try {
    const base = raw.startsWith('/api/cms/assets/') ? cmsBase : location.href;
    const url = new URL(raw, base);
    if (url.username || url.password) return null;
    if (url.protocol === 'https:' || url.protocol === 'http:') return url.href;
    if (link && (url.protocol === 'mailto:' || url.protocol === 'tel:')) return url.href;
  } catch {
    return null;
  }
  return null;
}

export function safeDeclaration(key, value) {
  if (typeof value !== 'string' || value.length > 256 || /[;{}\\]|(?:url|image-set|attr)\s*\(/i.test(value)) return null;
  const property = key.replace(/[A-Z]/g, char => `-${char.toLowerCase()}`);
  if (property === 'position' && !/^(?:static|relative)$/i.test(value.trim())) return null;
  return visualProperties.has(property) && CSS.supports(property, value) ? property : null;
}

export function escapeMarkup(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[char]);
}

function safeLocaleMarkup(value, baseline, cmsBase) {
  const original = document.createElement('template');
  original.innerHTML = baseline;
  const originalIds = new Set(Array.from(original.content.querySelectorAll('[id]'), node => node.id));
  const originalStyles = new Set(Array.from(original.content.querySelectorAll('[style]')).flatMap(element =>
    Array.from(element.style || [], property =>
      `${property}\u0000${element.style.getPropertyValue(property)}\u0000${element.style.getPropertyPriority(property)}`)
  ));
  const originalControls = new Set(Array.from(original.content.querySelectorAll('button[onclick]'), node =>
    `${node.id}\u0000${node.className}\u0000${node.getAttribute('onclick')}`
  ));
  const candidate = document.createElement('template');
  candidate.innerHTML = value;
  const originalHandlers = new WeakMap();
  for (const button of candidate.content.querySelectorAll('button[onclick]')) {
    const handler = button.getAttribute('onclick');
    if (originalControls.has(`${button.id}\u0000${button.className}\u0000${handler}`)) {
      originalHandlers.set(button, handler);
    }
  }
  const root = candidate.content.ownerDocument.createElement('div');
  root.append(candidate.content);
  DOMPurify.sanitize(root, {
    IN_PLACE: true,
    USE_PROFILES: { html: true, svg: true },
    FORBID_TAGS: [
      'form', 'input', 'iframe', 'object', 'embed', 'style', 'template', 'link', 'meta', 'base',
      'foreignObject', 'use', 'animate', 'animateMotion', 'animateTransform', 'set',
    ],
    FORBID_ATTR: ['autofocus', 'srcset', 'name', 'form', 'formaction', 'ping'],
  });
  for (const element of root.querySelectorAll('*')) {
    if (element.id && !originalIds.delete(element.id)) element.removeAttribute('id');
    for (const attribute of ['src', 'href', 'poster', 'background']) {
      if (!element.hasAttribute(attribute)) continue;
      const url = safeUrl(element.getAttribute(attribute), cmsBase, attribute === 'href');
      if (url) element.setAttribute(attribute, url);
      else element.removeAttribute(attribute);
    }
    for (const property of Array.from(element.style || [])) {
      const value = element.style.getPropertyValue(property);
      const priority = element.style.getPropertyPriority(property);
      if (!originalStyles.has(`${property}\u0000${value}\u0000${priority}`) && !safeDeclaration(property, value)) {
        element.style.removeProperty(property);
      }
    }
    if (element.getAttribute('target') === '_blank') element.setAttribute('rel', 'noopener noreferrer');
    const handler = originalHandlers.get(element);
    if (handler) element.setAttribute('onclick', handler);
  }
  return root.innerHTML;
}

function htmlLocaleField(path, baseline) {
  const key = path.at(-1);
  return /html$/i.test(key) || /<[/a-z][^>]*>/i.test(baseline)
    || path[0] === 'BIO_DNA_NODES'
    || path[0] === 'CORTICAL_PHASES' && key === 'html'
    || path[0] === 'AMMO_TYPES' && key === 'desc'
    || path[0] === 'WEAPON_CARDS' && (key === 'cat' || key === 'note')
    || path[0] === 'MISSIONS' && (path.includes('paras') || path.includes('entries'))
    || path[0] === 'PRELOADER_CONFIGS' && (key === 'text' || key === 'tail')
    || path.join('.') === 'UI.boot.accessGranted';
}

export function mergeLocale(baseline, changes, cmsBase, path = []) {
  if (baseline === changes || changes === undefined || changes === null) return baseline;
  if (Array.isArray(baseline)) {
    if (!Array.isArray(changes)) return baseline;
    return baseline.map((value, index) => mergeLocale(value, changes[index], cmsBase, [...path, String(index)]));
  }
  if (isRecord(baseline)) {
    if (!isRecord(changes)) return baseline;
    return Object.fromEntries(Object.entries(baseline).map(([key, value]) =>
      [key, mergeLocale(value, Object.hasOwn(changes, key) ? changes[key] : undefined, cmsBase, [...path, key])]
    ));
  }
  if (typeof baseline !== typeof changes) return baseline;
  if (typeof changes !== 'string') return changes;
  const key = path.at(-1);
  if (/^(img|link|href|src|url|sys_img|caelis_img)$/i.test(key)) {
    return changes === '' && key.toLowerCase() !== 'sys_img' ? '' : safeUrl(changes, cmsBase, key === 'link' || key === 'href') || baseline;
  }
  if (htmlLocaleField(path, baseline)) return safeLocaleMarkup(changes, baseline, cmsBase);
  return changes;
}
