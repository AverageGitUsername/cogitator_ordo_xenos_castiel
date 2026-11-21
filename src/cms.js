import { BUILTINS, THEME_COLORS, isRecord, localized, safeDeclaration, safeUrl, sectionId } from './cmsValues.js';
import { renderCmsMarkdown } from './cmsMarkdown.js';

const fontTargets = ['body', 'heading'];
const backgroundTargets = ['--cms-background-asset', '--cms-sidebar-background-asset'];
const defaultBase = 'https://castiel-admin.vercel.app';
const replacedIconTargets = new WeakMap();
const inspectableElements = 'h1, h2, h3, h4, h5, h6, button, a, label, input, textarea, select, img, svg, video, audio, model-viewer';

function cmsBaseUrl() {
  try {
    const url = new URL(import.meta.env.VITE_CMS_URL || defaultBase);
    if (['http:', 'https:'].includes(url.protocol) && !url.username && !url.password) return url;
  } catch {
    // Use the default when a deployment variable contains an invalid URL.
  }
  return new URL(defaultBase);
}

function addElement(parent, tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text) element.textContent = text;
  parent.append(element);
  return element;
}

function renderBlock(parent, block, language, base) {
  const title = localized(block.title, language);
  const copy = localized(block.text, language);
  const asset = safeUrl(block.asset, base);
  const href = safeUrl(block.href, base, true);
  if (!['text', 'image', 'video', 'audio', 'model', 'link'].includes(block.type)) return;
  if (block.type === 'link' ? !href : block.type !== 'text' && !asset) return;
  const panel = addElement(parent, 'article', 'cms-block');
  panel.dataset.cmsBlock = String(block.id || '');
  if (title && block.type !== 'link') addElement(panel, 'h2', 'cms-block-title', title);
  if (copy && block.type !== 'link') {
    if (block.type === 'text' && block.format === 'markdown') {
      addElement(panel, 'div', 'cms-block-copy cms-markdown').append(renderCmsMarkdown(copy, base));
    } else {
      addElement(panel, 'p', 'cms-block-copy', copy);
    }
  }

  if (block.type === 'image') {
    const image = addElement(panel, 'img', 'cms-media');
    image.alt = title || copy;
    image.loading = 'lazy';
    image.src = asset;
  } else if (block.type === 'video' || block.type === 'audio') {
    const media = addElement(panel, block.type, 'cms-media');
    media.controls = true;
    media.preload = 'metadata';
    if (title) media.setAttribute('aria-label', title);
    media.src = asset;
  } else if (block.type === 'model') {
    const model = addElement(panel, 'model-viewer', 'cms-model');
    model.setAttribute('src', asset);
    model.setAttribute('alt', title || (language === 'ru' ? 'Трёхмерная модель' : '3D model'));
    model.setAttribute('camera-controls', '');
    model.setAttribute('touch-action', 'pan-y');
    model.setAttribute('loading', 'lazy');
    const link = addElement(panel, 'a', 'cms-link', language === 'ru' ? 'Открыть файл модели' : 'Open model file');
    link.href = asset;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    model.addEventListener('error', () => { model.hidden = true; }, { once: true });
    import('@google/model-viewer').catch(() => { model.hidden = true; });
  } else if (block.type === 'link') {
    const link = addElement(panel, 'a', 'cms-link', title || copy || href);
    link.href = href;
  }
  return panel;
}

function setTextOverride(element, text) {
  // Leave icons, badges, and other nested controls mounted.
  const nodes = Array.from(element.childNodes).filter(node => node.nodeType === Node.TEXT_NODE && node.data.trim());
  const originals = nodes.map(node => node.data);
  let inserted;
  if (nodes.length) {
    nodes[0].data = text;
    nodes.slice(1).forEach(node => { node.data = ''; });
  } else {
    inserted = document.createTextNode(text);
    element.prepend(inserted);
  }
  return () => {
    inserted?.remove();
    nodes.forEach((node, index) => {
      if (node.parentNode === element && node.data === (index === 0 ? text : '')) node.data = originals[index];
    });
  };
}

function safeSelector(root, selector) {
  if (typeof selector !== 'string' || !selector.trim() || selector.length > 500) return [];
  try {
    return Array.from(root.querySelectorAll(selector)).slice(0, 250);
  } catch {
    return [];
  }
}

function selectionPath(root, element) {
  const parts = [];
  let current = element;
  while (current && current !== root) {
    if (current.id && root.querySelectorAll(`#${CSS.escape(current.id)}`).length === 1) {
      parts.unshift(`#${CSS.escape(current.id)}`);
      break;
    }
    const siblings = Array.from(current.parentElement.children).filter(node => node.localName === current.localName);
    parts.unshift(`${CSS.escape(current.localName)}:nth-of-type(${siblings.indexOf(current) + 1})`);
    current = current.parentElement;
  }
  return parts.join(' > ');
}

function setAttributeOverride(element, key, value) {
  const previous = element.getAttribute(key);
  if (value === null) element.removeAttribute(key);
  else element.setAttribute(key, value);
  return () => {
    if (element.getAttribute(key) !== value) return;
    if (previous === null) element.removeAttribute(key);
    else element.setAttribute(key, previous);
  };
}

function setAssetOverride(element, asset, undo) {
  if (['img', 'audio', 'video', 'source', 'model-viewer'].includes(element.localName)) {
    undo.push(setAttributeOverride(element, 'src', asset));
    if (element.hasAttribute('srcset')) undo.push(setAttributeOverride(element, 'srcset', null));
    if (element.localName === 'img' && element.parentElement?.localName === 'picture') {
      for (const source of element.parentElement.querySelectorAll('source[srcset]')) {
        undo.push(setAttributeOverride(source, 'srcset', null));
      }
    }
    return element;
  }
  if (element.localName === 'a') {
    undo.push(setAttributeOverride(element, 'href', asset));
    return element;
  }
  const isIcon = element.localName === 'svg' || element.classList.contains('ni');
  if (!isIcon && (!(element instanceof HTMLElement) || ['script', 'style', 'input', 'textarea', 'select', 'option'].includes(element.localName))) {
    return element;
  }
  const image = document.createElement('img');
  image.className = 'cms-inserted-icon';
  image.src = asset;
  image.alt = element.getAttribute('aria-label') || '';
  if (isIcon) {
    image.classList.add(...element.classList);
    element.before(image);
    replacedIconTargets.set(image, element);
    undo.push(setAttributeOverride(element, 'data-cms-hidden', ''));
  } else {
    element.prepend(image);
  }
  undo.push(() => image.remove());
  return isIcon ? image : element;
}

export default function createCmsRuntime(root) {
  const base = cmsBaseUrl();
  const previewRequested = window.parent !== window && new URLSearchParams(location.search).get('cmsPreview') === '1';
  let referrerOrigin;
  try {
    referrerOrigin = new URL(document.referrer).origin;
  } catch {
    // A standalone terminal can have no referrer.
  }
  const preview = previewRequested && (location.ancestorOrigins?.[0] || referrerOrigin) === base.origin;
  const themeStyle = document.documentElement.style;
  const sidebar = root.querySelector('.sb-nav');
  const content = root.querySelector('.content-inner');
  const builtinPanels = new Map(BUILTINS.map(id => [id, root.querySelector(`#${id}`)]));
  const builtinNav = new Map(Array.from(sidebar.querySelectorAll('.nav-item'), node => [node.dataset.tab, node]));
  const originalIcons = new Map(Array.from(builtinNav, ([id, node]) => [id, node.querySelector('.ni')]));
  const anchors = new Map();
  for (const [id, panel] of builtinPanels) {
    const anchor = document.createComment(id);
    panel.before(anchor);
    anchors.set(id, anchor);
  }

  let currentDocument = null;
  let waitingForPreview = false;
  let selectionMode = false;
  let selected;
  let routes = new Map(BUILTINS.map(id => [id, builtinPanels.get(id)]));
  let placement = new Map();
  let pageItems = new Map();
  let navItems = new Map();
  let overrideUndo = [];
  let generated = [];
  let publishedLanguage = 'ru';
  let selectedFonts = new Map();

  function applyTheme() {
    const theme = isRecord(currentDocument.theme) ? currentDocument.theme : {};
    for (const key of THEME_COLORS) {
      themeStyle.removeProperty(key);
      const value = theme[key];
      if (typeof value === 'string' && value.length < 128 && CSS.supports('color', value)) {
        themeStyle.setProperty(key, value);
      }
    }
    for (const key of backgroundTargets) {
      themeStyle.removeProperty(key);
      const url = safeUrl(theme[key], base);
      if (url) themeStyle.setProperty(key, `url(${JSON.stringify(url)})`);
    }
    for (const target of fontTargets) {
      const key = `--cms-font-${target}`;
      const family = theme[key];
      const asset = safeUrl(theme[`${key}-asset`], base);
      const previousFont = selectedFonts.get(target);
      const assetFamily = target === 'body' ? 'CMS Body' : 'CMS Heading';
      themeStyle.removeProperty(key);
      if (asset !== previousFont?.asset) {
        if (previousFont) document.fonts.delete(previousFont.face);
        selectedFonts.delete(target);
        if (asset) {
          const face = new FontFace(assetFamily, `url(${JSON.stringify(asset)})`);
          const entry = { face, asset };
          selectedFonts.set(target, entry);
          face.load().then(() => {
            if (selectedFonts.get(target) === entry) document.fonts.add(face);
          }).catch(() => {});
        }
      }
      const fallback = safeDeclaration('font-family', family) ? family : null;
      if (asset) {
        themeStyle.setProperty(key, `"${assetFamily}", ${fallback || (target === 'body' ? 'monospace' : 'sans-serif')}`);
      } else if (fallback) {
        themeStyle.setProperty(key, fallback);
      }
    }
  }

  function restoreOverrides() {
    for (const undo of overrideUndo.reverse()) undo();
    overrideUndo = [];
  }

  function applyOverrides(language) {
    if (!Array.isArray(currentDocument?.overrides)) return;
    const entries = currentDocument.overrides.filter(entry => isRecord(entry) && (!entry.locale || entry.locale === language));
    const targets = new Map(entries.map(entry => [entry, safeSelector(root, entry.selector)]));
    for (const entry of entries) {
      for (const element of targets.get(entry)) {
        if (typeof entry.text === 'string' && !['script', 'style', 'input', 'textarea', 'img'].includes(element.localName)) {
          overrideUndo.push(setTextOverride(element, entry.text));
        }
        if (entry.hidden === true) overrideUndo.push(setAttributeOverride(element, 'data-cms-hidden', ''));
        if (entry.hidden === false && element.hasAttribute('data-cms-hidden')) {
          element.removeAttribute('data-cms-hidden');
          overrideUndo.push(() => element.setAttribute('data-cms-hidden', ''));
        }
        const asset = safeUrl(entry.asset, base, element.localName === 'a');
        const styled = asset ? setAssetOverride(element, asset, overrideUndo) : element;
        if (entry.hidden === true && styled !== element) styled.setAttribute('data-cms-hidden', '');
        if (!isRecord(entry.styles) || !styled.style) continue;
        for (const [key, value] of Object.entries(entry.styles)) {
          const property = safeDeclaration(key, value);
          if (!property) continue;
          const previous = styled.style.getPropertyValue(property);
          const priority = styled.style.getPropertyPriority(property);
          styled.style.setProperty(property, value);
          const applied = styled.style.getPropertyValue(property);
          overrideUndo.push(() => {
            if (styled.style.getPropertyValue(property) !== applied) return;
            if (previous) styled.style.setProperty(property, previous, priority);
            else styled.style.removeProperty(property);
          });
        }
      }
    }
  }

  function renderPages(language) {
    for (const [id, anchor] of anchors) {
      const panel = builtinPanels.get(id);
      if (panel.previousSibling !== anchor) anchor.after(panel);
    }
    for (const element of generated) element.remove();
    generated = [];
    routes = new Map(builtinPanels);
    placement = new Map();
    const pages = Array.isArray(currentDocument.pages) ? currentDocument.pages.filter(isRecord) : [];
    pageItems = new Map();
    for (const page of pages) {
      const id = sectionId(page.id);
      if (id && !pageItems.has(id)) pageItems.set(id, page);
    }
    // Move the live widget once per document and reject loops in placement.
    for (const [id, page] of pageItems) {
      const builtin = builtinPanels.get(id);
      if (!builtin && document.getElementById(id)) continue;
      const parent = builtin || addElement(content, 'section', 'tab cms-page');
      if (!builtin) {
        parent.id = id;
        routes.set(id, parent);
        generated.push(parent);
        const title = localized(page.title, language);
        if (title) addElement(parent, 'h1', 'pg-title', title);
      }
      if (!Array.isArray(page.blocks)) continue;
      const before = document.createDocumentFragment();
      const after = document.createDocumentFragment();
      const panelContent = builtin?.querySelector(':scope > .preload-content') || parent;
      const firstChild = panelContent.firstChild;
      let sawOriginal = false;
      const explicitMarker = builtin && page.blocks.some(block => block?.type === 'builtin' && sectionId(block.widget) === id);
      for (const block of page.blocks.filter(isRecord)) {
        const destination = builtin ? (explicitMarker && !sawOriginal ? before : after) : parent;
        if (block.type === 'builtin') {
          const widget = sectionId(block.widget);
          if (widget === id) {
            sawOriginal = true;
          } else if (builtinPanels.has(widget) && !placement.has(widget) && resolveRoute(id) !== widget) {
            placement.set(widget, id);
            destination.append(builtinPanels.get(widget));
          }
        } else {
          const element = renderBlock(destination, block, language, base);
          if (element && builtin) generated.push(element);
        }
      }
      if (builtin) {
        panelContent.insertBefore(before, firstChild || null);
        panelContent.append(after);
      }
    }
  }

  function renderNavigation(language) {
    for (const node of sidebar.querySelectorAll('[data-cms-nav]')) node.remove();
    const entries = Array.isArray(currentDocument.navigation) ? currentDocument.navigation.filter(isRecord) : [];
    navItems = new Map();
    for (const entry of entries) {
      const id = sectionId(entry.id);
      if (routes.has(id) && !navItems.has(id)) navItems.set(id, entry);
    }
    for (const id of routes.keys()) {
      if (!navItems.has(id)) navItems.set(id, {});
    }
    for (const [id, entry] of navItems) {
      const existing = builtinNav.get(id);
      const button = existing || addElement(sidebar, 'button', 'nav-item');
      if (!existing) {
        button.type = 'button';
        button.dataset.tab = id;
        button.dataset.cmsNav = '';
        addElement(button, 'span', 'nav-label');
      } else {
        sidebar.append(button);
      }
      button.toggleAttribute('data-cms-hidden', entry.hidden === true);
      button.querySelector('.cms-nav-icon')?.remove();
      const original = originalIcons.get(id);
      if (original) original.removeAttribute('data-cms-hidden');
      if (typeof entry.icon === 'string' && entry.icon.trim()) {
        const url = /^https?:\/\/|^\//i.test(entry.icon) ? safeUrl(entry.icon, base) : null;
        const icon = document.createElement(url ? 'img' : 'span');
        icon.className = 'ni cms-nav-icon';
        icon.setAttribute('aria-hidden', 'true');
        if (url) {
          icon.alt = '';
          icon.src = url;
        } else {
          icon.textContent = entry.icon.slice(0, 12);
        }
        if (original) original.setAttribute('data-cms-hidden', '');
        button.prepend(icon);
      }
    }
    updateNavigationLabels(language);
  }

  function updateNavigationLabels(language) {
    for (const [id, entry] of navItems) {
      const button = navButton(id);
      const label = localized(entry.label, language) || (!builtinNav.has(id) && labelFor(id, language));
      if (button && label) {
        const target = button.querySelector(id === 'tab-sublim' ? '.hi-real' : '.nav-label');
        if (target) target.textContent = label;
        if (id !== 'tab-sublim') button.title = label;
      }
    }
  }

  function relocalizeBlocks(language) {
    if (!currentDocument || language === publishedLanguage) return;
    // Keep media and built-in control state on ordinary language switches.
    for (const [id, page] of pageItems) {
      const route = routes.get(id);
      if (!route) continue;
      const pageTitle = route.classList.contains('cms-page') ? route.querySelector(':scope > h1') : null;
      if (pageTitle) pageTitle.textContent = localized(page.title, language);
      const blocks = new Map((Array.isArray(page.blocks) ? page.blocks : []).filter(isRecord).map(block => [String(block.id || ''), block]));
      const panelContent = route.querySelector(':scope > .preload-content') || route;
      for (const node of panelContent.querySelectorAll(':scope > [data-cms-block]')) {
        const block = blocks.get(node.dataset.cmsBlock);
        if (!block) continue;
        const title = localized(block.title, language);
        const copy = localized(block.text, language);
        const heading = node.querySelector('.cms-block-title');
        const paragraph = node.querySelector('.cms-block-copy');
        const media = node.querySelector('.cms-media');
        const model = node.querySelector('.cms-model');
        const link = node.querySelector('.cms-link');
        if (heading) heading.textContent = title;
        if (paragraph?.classList.contains('cms-markdown')) paragraph.replaceChildren(renderCmsMarkdown(copy, base));
        else if (paragraph) paragraph.textContent = copy;
        if (media?.localName === 'img') media.alt = title || copy;
        else if (media && title) media.setAttribute('aria-label', title);
        if (model) model.setAttribute('alt', title || (language === 'ru' ? 'Трёхмерная модель' : '3D model'));
        if (link && block.type === 'link') link.textContent = title || copy || link.href;
        if (link && block.type === 'model') link.textContent = language === 'ru' ? 'Открыть файл модели' : 'Open model file';
      }
    }
    publishedLanguage = language;
  }

  function navButton(id) {
    return Array.from(sidebar.children).find(node => node.dataset.tab === id);
  }

  function resolveRoute(id) {
    let route = sectionId(id);
    while (placement.has(route)) route = placement.get(route);
    return routes.has(route) ? route : null;
  }

  function labelFor(id, language) {
    return localized(navItems.get(id)?.label, language) || localized(pageItems.get(id)?.title, language)
      || (routes.get(id)?.classList.contains('cms-page') ? id.slice(4) : '');
  }

  function homeId() {
    const home = Array.from(sidebar.children).find(node => !node.hasAttribute('data-cms-hidden'));
    const defaultId = builtinNav.get('tab-bio')?.hasAttribute('data-cms-hidden') ? home?.dataset.tab : 'tab-bio';
    return resolveRoute(defaultId) || 'tab-bio';
  }

  function showSelection(element) {
    selected?.removeAttribute('data-cms-selected');
    selected = element;
    selected?.setAttribute('data-cms-selected', '');
  }

  let draftAccepted = false;
  let inspectionTimer;
  let inspectedRoute;

  function describeElement(element) {
    const selector = selectionPath(root, replacedIconTargets.get(element) || element);
    if (!selector || selector.length > 500) return null;
    const text = element.matches(inspectableElements) ? element.textContent
      : Array.from(element.childNodes).filter(node => node.nodeType === Node.TEXT_NODE).map(node => node.data).join(' ');
    return {
      selector,
      tag: element.localName,
      text: (element.getAttribute('aria-label') || element.getAttribute('alt') || text)
        .trim().replace(/\s+/g, ' ').slice(0, 160),
      locale: document.documentElement.lang === 'en' ? 'en' : 'ru',
    };
  }

  function inspectable(element) {
    return Boolean(element.id) || element.matches(inspectableElements) || Array.from(element.childNodes)
      .some(node => node.nodeType === Node.TEXT_NODE && node.data.trim());
  }

  function inspectRoute(route, navigated = false) {
    if (!draftAccepted) return;
    if (navigated) window.parent.postMessage({ type: 'terminal:cms-page', pageId: route }, base.origin);
    if (route !== inspectedRoute) showSelection(null);
    inspectedRoute = route;
    window.clearTimeout(inspectionTimer);
    inspectionTimer = window.setTimeout(() => {
      const panel = routes.get(route);
      const elements = [];
      const selectors = new Set();
      for (const element of panel?.querySelectorAll('*') || []) {
        if (element.namespaceURI !== 'http://www.w3.org/1999/xhtml' && element.localName !== 'svg') continue;
        if (element.closest('script, style, noscript, template, [hidden]')) continue;
        if (element.localName === 'svg' && element.closest('button, a')) continue;
        if (!inspectable(element) || (!element.getClientRects().length && !element.hasAttribute('data-cms-hidden'))) continue;
        const entry = describeElement(element);
        if (!entry || selectors.has(entry.selector)) continue;
        selectors.add(entry.selector);
        elements.push(entry);
        if (elements.length === 600) break;
      }
      window.parent.postMessage({ type: 'terminal:cms-elements', pageId: route, elements }, base.origin);
    }, 80);
  }

  function start({ onDocument, onNavigate, onLanguage, onPreview }) {
    if (previewRequested) {
      const announce = () => window.parent.postMessage({ type: 'terminal:cms-ready' }, base.origin);
      window.addEventListener('message', event => {
        if (event.source !== window.parent || event.origin !== base.origin || !isRecord(event.data)) return;
        const { type, document: draft, enabled, id, locale, selector, scroll } = event.data;
        if (type === 'terminal:cms-hello') {
          announce();
        } else if (type === 'terminal:cms-preview' && isRecord(draft) && draft.schemaVersion === 1) {
          if (!draftAccepted) onPreview();
          draftAccepted = true;
          const previousRoute = inspectedRoute;
          const previousSelection = selected && root.contains(selected) && describeElement(selected)?.selector;
          onDocument(draft);
          if (previousSelection && inspectedRoute === previousRoute) {
            showSelection(safeSelector(root, previousSelection)[0]);
          }
        } else if (!draftAccepted) {
          return;
        } else if (type === 'terminal:cms-highlight') {
          const target = safeSelector(root, selector)[0];
          showSelection(target);
          if (scroll === true) target?.scrollIntoView({ block: 'center', inline: 'nearest' });
        } else if (type === 'terminal:cms-select-mode') {
          selectionMode = enabled === true;
          root.toggleAttribute('data-cms-selecting', selectionMode);
        } else if (type === 'terminal:cms-navigate') {
          const route = resolveRoute(id);
          if (route) onNavigate(route);
        } else if (type === 'terminal:cms-language' && ['ru', 'en'].includes(locale)) {
          onLanguage(locale);
        }
      });
      root.addEventListener('click', event => {
        if (!draftAccepted || !(event.target instanceof Element)) return;
        const target = event.target;
        if (!selectionMode || target.closest('.nav-item, .sidebar-toggle')) {
          if (inspectedRoute) inspectRoute(inspectedRoute);
          return;
        }
        const svg = target.closest('svg');
        let element = svg ? svg.closest('button, a') || svg : target;
        while (element !== root && !inspectable(element)) element = element.parentElement;
        if (element === root || !root.contains(element)) return;
        const entry = describeElement(element);
        if (!entry) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        selectionMode = false;
        root.removeAttribute('data-cms-selecting');
        showSelection(element);
        window.parent.postMessage({ type: 'terminal:cms-selection', ...entry }, base.origin);
      }, true);
      announce();
    }
    const endpoint = new URL('/api/cms/site', base);
    fetch(endpoint, { credentials: 'omit', signal: AbortSignal.timeout(4500) })
      .then(response => response.ok ? response.json() : null)
      .then(result => {
        if (!draftAccepted && isRecord(result?.document) && result.document.schemaVersion === 1) onDocument(result.document);
      }).catch(() => {});
  }

  return {
    base,
    preview,
    start,
    inspectRoute,
    hasDocument: () => Boolean(currentDocument),
    setDocument(next, language) {
      restoreOverrides();
      currentDocument = next;
      publishedLanguage = language;
      applyTheme();
      renderPages(language);
      renderNavigation(language);
    },
    restoreOverrides,
    applyLanguage(language) {
      updateNavigationLabels(language);
      relocalizeBlocks(language);
      applyOverrides(language);
    },
    resolveRoute,
    navButton,
    isHidden(id) { return navButton(id)?.hasAttribute('data-cms-hidden'); },
    labelFor,
    homeId,
    activeWidgets(route) {
      const nested = Array.from(routes.get(route)?.querySelectorAll('section.tab') || [], node => node.id)
        .filter(id => builtinPanels.has(id));
      return builtinPanels.has(route) ? [route, ...nested] : nested;
    },
  };
}
