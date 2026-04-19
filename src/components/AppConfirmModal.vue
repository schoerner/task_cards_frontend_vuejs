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

          <div class="modal-footer flex-wrap justify-content-end gap-2">
            <template v-if="actionButtons.length">
              <button
                v-for="button in actionButtons"
                :key="button.value"
                type="button"
                class="btn"
                :class="button.className || `btn-${button.variant || 'primary'}`"
                @click="resolveWith(button.value)"
              >
                {{ button.label }}
              </button>
            </template>
            <template v-else>
              <button type="button" class="btn btn-secondary" @click="cancel">{{ cancelLabel }}</button>
              <button type="button" class="btn" :class="confirmButtonClass" @click="confirm">{{ confirmLabel }}</button>
            </template>
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
      actionButtons: [],
      resolver: null,
      defaultResolveValue: false
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
      this.actionButtons = Array.isArray(options.buttons) ? options.buttons : [];
      this.defaultResolveValue = Object.prototype.hasOwnProperty.call(options, 'defaultResolveValue')
        ? options.defaultResolveValue
        : false;

      return new Promise((resolve) => {
        this.resolver = resolve;
        this.modalInstance.show();
      });
    },
    resolveWith(value) {
      if (this.resolver) {
        this.resolver(value);
        this.resolver = null;
      }
      this.modalInstance.hide();
    },
    confirm() {
      this.resolveWith(true);
    },
    cancel() {
      this.resolveWith(false);
    },
    onHidden() {
      if (this.resolver) {
        this.resolver(this.defaultResolveValue);
        this.resolver = null;
      }
    }
  }
};
</script>
