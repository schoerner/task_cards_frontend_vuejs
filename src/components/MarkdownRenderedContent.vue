<template>
  <div
      ref="rootEl"
      class="markdown-rendered-content"
      v-html="sanitizedHtml"
      @click="handleClick"
  ></div>
</template>

<script>
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

export default {
  name: 'MarkdownRenderedContent',
  props: {
    content: {
      type: String,
      default: ''
    },
    emptyText: {
      type: String,
      default: 'Keine Inhalte vorhanden.'
    },
    clickableTaskLists: {
      type: Boolean,
      default: false
    }
  },
  emits: ['toggle-task-item'],
  computed: {
    normalizedContent() {
      if (!this.content || !this.content.trim()) {
        return '';
      }

      return this.content
          .replace(/^\[\s\]\s+/gm, '- [ ] ')
          .replace(/^\[[xX]\]\s+/gm, '- [x] ');
    },
    taskLineIndexes() {
      const indexes = [];
      const lines = (this.content || '').split('\n');

      lines.forEach((line, index) => {
        if (/^\s*(?:[-*]\s+)?\[(?: |x|X)\]\s+/.test(line)) {
          indexes.push(index);
        }
      });

      return indexes;
    },
    sanitizedHtml() {
      if (!this.normalizedContent) {
        return `<p class="mb-0 text-muted">${this.emptyText}</p>`;
      }

      const renderer = this.clickableTaskLists ? mdClickable : mdReadonly;
      let html = renderer.render(this.normalizedContent);

      if (this.clickableTaskLists) {
        html = html.replace(
            /<input class="task-list-item-checkbox"([^>]*)\sdisabled(?:="[^"]*")?([^>]*)>/g,
            '<input class="task-list-item-checkbox task-list-item-checkbox-clickable"$1$2>'
        );
      }

      return DOMPurify.sanitize(html);
    }
  },
  methods: {
    handleClick(event) {
      if (!this.clickableTaskLists) {
        return;
      }

      const target = event.target;

      let checkbox = null;

      if (target instanceof HTMLInputElement && target.classList.contains('task-list-item-checkbox')) {
        checkbox = target;
      } else if (target instanceof HTMLElement) {
        checkbox = target.closest('label')?.querySelector('.task-list-item-checkbox')
            || target.closest('li')?.querySelector('.task-list-item-checkbox');
      }

      if (!(checkbox instanceof HTMLInputElement)) {
        return;
      }

      event.preventDefault();

      const checkboxes = Array.from(
          this.$refs.rootEl.querySelectorAll('.task-list-item-checkbox')
      );
      const checkboxIndex = checkboxes.indexOf(checkbox);

      if (checkboxIndex < 0) {
        return;
      }

      const lineIndex = this.taskLineIndexes[checkboxIndex];
      if (typeof lineIndex === 'number') {
        this.$emit('toggle-task-item', lineIndex);
      }
    }
  }
};
</script>

<style scoped>
.markdown-rendered-content :deep(p:last-child) {
  margin-bottom: 0;
}

.markdown-rendered-content :deep(label) {
  cursor: pointer;
}

.markdown-rendered-content :deep(pre) {
  background: #f8f9fa;
  padding: 0.75rem;
  border-radius: 0.5rem;
  overflow-x: auto;
}

.markdown-rendered-content :deep(code) {
  background: #f8f9fa;
  padding: 0.1rem 0.3rem;
  border-radius: 0.25rem;
}

.markdown-rendered-content :deep(ul.task-list-container) {
  padding-left: 1.25rem;
}

.markdown-rendered-content :deep(.task-list-item-checkbox-clickable) {
  cursor: pointer;
}

.markdown-rendered-content :deep(a) {
  word-break: break-word;
}
</style>