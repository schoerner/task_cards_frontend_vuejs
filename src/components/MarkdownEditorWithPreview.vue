<template>
  <div class="markdown-editor-with-preview">
    <div class="d-flex justify-content-between align-items-center mb-2">
      <label v-if="label" class="form-label mb-0">{{ label }}</label>

      <button
          type="button"
          class="btn btn-sm btn-outline-secondary"
          @click="showHelp"
          title="Markdown-Hilfe anzeigen"
      >
        <i class="bi bi-question-circle"></i>
      </button>
    </div>

    <div class="row g-3">
      <div class="col-lg-6">
        <textarea
            :value="modelValue"
            class="form-control"
            :rows="rows"
            :disabled="disabled"
            :maxlength="maxlength"
            :placeholder="placeholder"
            @input="$emit('update:modelValue', $event.target.value)"
        ></textarea>
      </div>

      <div class="col-lg-6">
        <div class="border rounded p-3 h-100 bg-light-subtle">
          <div class="small text-muted mb-2">Vorschau</div>
          <MarkdownRenderedContent
              :content="modelValue"
              :empty-text="emptyPreviewText"
          />
        </div>
      </div>
    </div>

    <MarkdownHelpModal ref="helpModal" />
  </div>
</template>

<script>
import MarkdownRenderedContent from '@/components/MarkdownRenderedContent.vue';
import MarkdownHelpModal from '@/components/MarkdownHelpModal.vue';

export default {
  name: 'MarkdownEditorWithPreview',
  components: {
    MarkdownRenderedContent,
    MarkdownHelpModal
  },
  props: {
    modelValue: {
      type: String,
      default: ''
    },
    label: {
      type: String,
      default: ''
    },
    rows: {
      type: Number,
      default: 8
    },
    emptyPreviewText: {
      type: String,
      default: 'Noch keine Inhalte.'
    },
    disabled: {
      type: Boolean,
      default: false
    },
    maxlength: {
      type: Number,
      default: null
    },
    placeholder: {
      type: String,
      default: ''
    }
  },
  emits: ['update:modelValue'],
  methods: {
    showHelp() {
      this.$refs.helpModal?.show();
    }
  }
};
</script>