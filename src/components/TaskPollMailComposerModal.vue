<template>
  <teleport to="body">
    <div class="modal fade" ref="modalElement" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ title }}</h5>
            <button type="button" class="btn-close" aria-label="Schließen" @click="cancel"></button>
          </div>

          <div class="modal-body">
            <div v-if="lead" class="alert alert-light border mb-3">{{ lead }}</div>

            <div class="mb-3">
              <label class="form-label">Betreff</label>
              <input v-model.trim="subject" type="text" class="form-control" />
            </div>

            <MarkdownEditorWithPreview
              v-model="messageMarkdown"
              label="Nachricht"
              :rows="10"
              :placeholder="placeholder"
              empty-preview-text="Noch keine Nachricht verfasst."
            />
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="cancel">Abbrechen</button>
            <button type="button" class="btn btn-primary" @click="submit">{{ submitLabel }}</button>
          </div>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script>
import { Modal } from 'bootstrap';
import MarkdownEditorWithPreview from '@/components/MarkdownEditorWithPreview.vue';
import { markdownToPlainText, renderMarkdownToSanitizedHtml } from '@/utils/markdown.utils.js';

export default {
  name: 'TaskPollMailComposerModal',
  components: {
    MarkdownEditorWithPreview
  },
  data() {
    return {
      modalInstance: null,
      title: 'Nachricht verfassen',
      lead: '',
      subject: '',
      messageMarkdown: '',
      placeholder: '',
      submitLabel: 'Senden',
      resolver: null
    };
  },
  mounted() {
    this.modalInstance = new Modal(this.$refs.modalElement);
    this.$refs.modalElement.addEventListener('hidden.bs.modal', this.onHidden);
  },
  beforeUnmount() {
    this.$refs.modalElement?.removeEventListener('hidden.bs.modal', this.onHidden);
    this.modalInstance?.dispose();
  },
  methods: {
    show(options = {}) {
      this.title = options.title || 'Nachricht verfassen';
      this.lead = options.lead || '';
      this.subject = options.subject || '';
      this.messageMarkdown = options.messageMarkdown || '';
      this.placeholder = options.placeholder || '';
      this.submitLabel = options.submitLabel || 'Senden';

      return new Promise((resolve) => {
        this.resolver = resolve;
        this.modalInstance.show();
      });
    },
    submit() {
      const payload = {
        subject: this.subject,
        messageMarkdown: this.messageMarkdown,
        messageHtml: renderMarkdownToSanitizedHtml(this.messageMarkdown, { emptyText: '' }),
        messageText: markdownToPlainText(this.messageMarkdown)
      };

      if (this.resolver) {
        this.resolver(payload);
        this.resolver = null;
      }

      this.modalInstance.hide();
    },
    cancel() {
      if (this.resolver) {
        this.resolver(null);
        this.resolver = null;
      }
      this.modalInstance.hide();
    },
    onHidden() {
      if (this.resolver) {
        this.resolver(null);
        this.resolver = null;
      }
    }
  }
};
</script>
