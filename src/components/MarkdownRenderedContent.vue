<template>
  <div
      ref="rootEl"
      class="markdown-rendered-content"
      v-html="sanitizedHtml"
      @click="handleClick"
  ></div>
</template>

<script>
import { normalizeMarkdownContent, renderMarkdownToSanitizedHtml } from '@/utils/markdown.utils.js';

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
      return normalizeMarkdownContent(this.content);
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

      return renderMarkdownToSanitizedHtml(this.normalizedContent, {
        clickableTaskLists: this.clickableTaskLists,
        emptyText: this.emptyText
      });
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