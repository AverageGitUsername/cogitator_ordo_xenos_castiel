const GLITCH_WORD_RE = /(?<![\p{L}\p{N}_])(Кастиил\p{L}*|Ордо\s+Ксенос|Инквизици\p{L}*|Сублимаци\p{L}*|Когитатор\p{L}*|Император\p{L}*|Империум\p{L}*|Ксенос\p{L}*|Фобос\p{L}*|Астартес|Ауспекс\p{L}*|Варп\p{L}*|Еретик\p{L}*|Смерт\p{L}*|Кров\p{L}*|Секретн\p{L}*|Аномали\p{L}*|Протокол\p{L}*|Ошибк\p{L}*|Сбой|Castiel|Ordo\s+Xenos|Inquisition|Sublimation|Cogitator|Emperor|Imperium|Xenos|Phobos|Astartes|Auspex|Warp|Heretic\w*|Deathwatch|Classified|Anomaly|Protocol|Corrupted)(?![\p{L}\p{N}_])/giu;

const SKIP_TAGS = new Set([
  'SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT', 'SELECT', 'OPTION',
  'BUTTON', 'A', 'CODE', 'PRE', 'SVG', 'NOSCRIPT', 'IFRAME',
]);

const TARGET_SELECTOR = 'p, li, dd, blockquote, .lore-quote, .bxi-desc, .log-body, .sublim-text, .dossier-text, .weapon-desc, .squad-bio';

let wordCounter = 0;

function shouldSkipNode(node) {
  let parent = node.parentElement;
  while (parent) {
    if (SKIP_TAGS.has(parent.tagName)) return true;
    if (parent.classList.contains('term-glitch-word')) return true;
    if (parent.hasAttribute('contenteditable')) return true;
    parent = parent.parentElement;
  }
  return false;
}

function enhanceElement(el) {
  if (!el || el.dataset.termGlitched === '1') return;
  if (el.closest('button, a, input, textarea, select, [contenteditable]')) return;

  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const textNodes = [];
  let current;
  while ((current = walker.nextNode())) {
    if (current.nodeValue && current.nodeValue.trim().length > 2 && !shouldSkipNode(current)) {
      textNodes.push(current);
    }
  }

  let wrappedInBlock = 0;
  const maxPerBlock = 2;

  for (const node of textNodes) {
    if (wrappedInBlock >= maxPerBlock) break;
    const text = node.nodeValue;
    GLITCH_WORD_RE.lastIndex = 0;
    const matches = [];
    let m;
    while ((m = GLITCH_WORD_RE.exec(text)) !== null) {
      matches.push({ index: m.index, value: m[0] });
      if (wrappedInBlock + matches.length >= maxPerBlock) break;
    }
    if (!matches.length) continue;

    const frag = document.createDocumentFragment();
    let cursor = 0;
    for (const hit of matches) {
      if (hit.index > cursor) {
        frag.appendChild(document.createTextNode(text.slice(cursor, hit.index)));
      }
      const span = document.createElement('span');
      span.className = 'term-glitch-word';
      span.setAttribute('data-text', hit.value);
      const delay = ((wordCounter * 1.7) % 8.5).toFixed(2);
      const dur = (5.2 + ((wordCounter * 1.3) % 4.5)).toFixed(2);
      span.style.setProperty('--g-delay', `${delay}s`);
      span.style.setProperty('--g-dur', `${dur}s`);
      span.textContent = hit.value;
      frag.appendChild(span);
      wordCounter += 1;
      wrappedInBlock += 1;
      cursor = hit.index + hit.value.length;
    }
    if (cursor < text.length) {
      frag.appendChild(document.createTextNode(text.slice(cursor)));
    }
    node.parentNode?.replaceChild(frag, node);
  }

  el.dataset.termGlitched = '1';
}

export default function initTextGlitches() {
  const root = document.querySelector('main.content') || document.body;
  if (!root) return () => {};

  const scan = () => {
    if (document.documentElement.hasAttribute('data-cms-selecting')) return;
    const elements = root.querySelectorAll(TARGET_SELECTOR);
    for (const el of elements) {
      enhanceElement(el);
    }
  };

  let timer = null;
  const schedule = () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(scan, 160);
  };

  scan();

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        schedule();
        return;
      }
    }
  });

  observer.observe(root, { childList: true, subtree: true });

  return () => {
    if (timer) clearTimeout(timer);
    observer.disconnect();
  };
}
