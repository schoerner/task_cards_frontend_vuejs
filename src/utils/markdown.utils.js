import MarkdownIt from 'markdown-it';
import { tasklist } from '@mdit/plugin-tasklist';
import DOMPurify from 'dompurify';

const mdReadonly = new MarkdownIt({
  breaks: true,
  linkify: true
}).use(tasklist, {
  disabled: true,
  label: true,
  labelAfter: true
});

const mdClickable = new MarkdownIt({
  breaks: true,
  linkify: true
}).use(tasklist, {
  disabled: false,
  label: true,
  labelAfter: true
});

export function normalizeMarkdownContent(content = '') {
  if (!content || !content.trim()) {
    return '';
  }

  return content
    .replace(/^\[\s\]\s+/gm, '- [ ] ')
    .replace(/^\[[xX]\]\s+/gm, '- [x] ');
}

export function renderMarkdownToSanitizedHtml(content = '', { clickableTaskLists = false, emptyText = 'Keine Inhalte vorhanden.' } = {}) {
  const normalizedContent = normalizeMarkdownContent(content);

  if (!normalizedContent) {
    return `<p class="mb-0 text-muted">${emptyText}</p>`;
  }

  const renderer = clickableTaskLists ? mdClickable : mdReadonly;
  let html = renderer.render(normalizedContent);

  if (clickableTaskLists) {
    html = html.replace(
      /<input class="task-list-item-checkbox"([^>]*)\sdisabled(?:="[^"]*")?([^>]*)>/g,
      '<input class="task-list-item-checkbox task-list-item-checkbox-clickable"$1$2>'
    );
  }

  return DOMPurify.sanitize(html);
}

export function markdownToPlainText(content = '') {
  const html = renderMarkdownToSanitizedHtml(content, { emptyText: '' });
  const root = document.createElement('div');
  root.innerHTML = html;
  return (root.textContent || root.innerText || '').trim();
}
