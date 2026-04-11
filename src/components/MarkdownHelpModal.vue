<template>
  <div class="modal fade" ref="modalEl" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Markdown-Hilfe</h5>
          <button type="button" class="btn-close" @click="hide" aria-label="Schließen"></button>
        </div>

        <div class="modal-body">
          <p class="text-muted">
            In diesem Feld kannst du einfache Markdown-Syntax verwenden.
          </p>

          <h6>Überschriften</h6>
          <pre class="bg-light p-2 rounded"><code># Große Überschrift
## Kleinere Überschrift</code></pre>

          <h6>Textformatierung</h6>
          <pre class="bg-light p-2 rounded"><code>**fett**
*kursiv*
`Code`</code></pre>

          <h6>Listen</h6>
          <pre class="bg-light p-2 rounded"><code>- Punkt 1
- Punkt 2</code></pre>

          <h6>Checklisten</h6>
          <pre class="bg-light p-2 rounded"><code>- [ ] offen
- [x] erledigt</code></pre>

          <h6>Links</h6>
          <pre class="bg-light p-2 rounded"><code>[OpenAI](https://openai.com)</code></pre>

          <hr>

          <p class="mb-2">
            <a href="https://markdown-it.github.io/" target="_blank" rel="noopener noreferrer">
              Live-Demo mit Sofortvorschau
            </a>
          </p>
          <p class="mb-2">
            <a href="https://commonmark.org/help/" target="_blank" rel="noopener noreferrer">
              Markdown-Kurzhilfe
            </a>
          </p>
          <p class="mb-0">
            <a href="https://www.markdownguide.org/extended-syntax/" target="_blank" rel="noopener noreferrer">
              Erweiterte Syntax, inkl. Task-Listen
            </a>
          </p>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="hide">Schließen</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Modal } from 'bootstrap';

export default {
  name: 'MarkdownHelpModal',
  data() {
    return {
      modalInstance: null
    };
  },
  mounted() {
    this.modalInstance = new Modal(this.$refs.modalEl);
  },
  beforeUnmount() {
    this.modalInstance?.hide();
    this.modalInstance = null;
  },
  methods: {
    show() {
      this.modalInstance?.show();
    },
    hide() {
      this.modalInstance?.hide();
    }
  }
};
</script>