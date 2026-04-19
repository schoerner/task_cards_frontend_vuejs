<template>
  <teleport to="body">
    <div class="modal fade" ref="modalElement" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ title }}</h5>
            <button type="button" class="btn-close" aria-label="Schließen" @click="cancel"></button>
          </div>

          <div class="modal-body">
            <p class="mb-0" style="white-space: pre-line;">{{ message }}</p>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="cancel">{{ cancelLabel }}</button>
            <button type="button" class="btn" :class="confirmButtonClass" @click="confirm">{{ confirmLabel }}</button>
          </div>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script>
import { Modal } from 'bootstrap';

export default {
  name: 'AppConfirmModal',
  data() {
    return {
      modalInstance: null,
      title: 'Bitte bestätigen',
      message: '',
      confirmLabel: 'Bestätigen',
      cancelLabel: 'Abbrechen',
      confirmVariant: 'primary',
      resolver: null
    };
  },
  computed: {
    confirmButtonClass() {
      return `btn-${this.confirmVariant || 'primary'}`;
    }
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
      this.title = options.title || 'Bitte bestätigen';
      this.message = options.message || '';
      this.confirmLabel = options.confirmLabel || 'Bestätigen';
      this.cancelLabel = options.cancelLabel || 'Abbrechen';
      this.confirmVariant = options.confirmVariant || 'primary';

      return new Promise((resolve) => {
        this.resolver = resolve;
        this.modalInstance.show();
      });
    },
    confirm() {
      if (this.resolver) {
        this.resolver(true);
        this.resolver = null;
      }
      this.modalInstance.hide();
    },
    cancel() {
      if (this.resolver) {
        this.resolver(false);
        this.resolver = null;
      }
      this.modalInstance.hide();
    },
    onHidden() {
      if (this.resolver) {
        this.resolver(false);
        this.resolver = null;
      }
    }
  }
};
</script>
