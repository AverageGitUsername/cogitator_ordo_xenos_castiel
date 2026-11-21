import DOMPurify from 'dompurify';
import { Marked } from 'marked';
import { escapeMarkup, safeUrl } from './cmsValues.js';

const markdown = new Marked({
  renderer: {
    html({ text }) {
      return escapeMarkup(text);
    },
  },
});

export function renderCmsMarkdown(text, cmsBase) {
  const content = DOMPurify.sanitize(markdown.parse(text), {
    RETURN_DOM_FRAGMENT: true,
    ALLOWED_TAGS: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br', 'hr', 'strong', 'em', 'del',
      'blockquote', 'ul', 'ol', 'li', 'pre', 'code', 'a', 'img', 'table',
      'thead', 'tbody', 'tr', 'th', 'td',
    ],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'start'],
    ALLOW_DATA_ATTR: false,
  });

  for (const link of content.querySelectorAll('a[href]')) {
    const href = safeUrl(link.getAttribute('href'), cmsBase, true);
    if (href) link.href = href;
    else link.removeAttribute('href');
  }
  for (const image of content.querySelectorAll('img')) {
    const source = safeUrl(image.getAttribute('src'), cmsBase);
    if (source) {
      image.src = source;
      image.loading = 'lazy';
      image.decoding = 'async';
    } else {
      image.replaceWith(image.alt);
    }
  }
  return content;
}
