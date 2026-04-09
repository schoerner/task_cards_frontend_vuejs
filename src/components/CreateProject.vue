<template>
  <div class="modal fade" :id="modalId" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <form @submit.prevent="createProject">
          <div class="modal-header">
            <h5 class="modal-title">Projekt anlegen</h5>
            <button type="button" class="btn-close" @click="close"></button>
          </div>

          <div class="modal-body">
            <div class="mb-3">
              <label :for="`${modalId}-name`" class="form-label">Name</label>
              <input
                :id="`${modalId}-name`"
                ref="projectNameInput"
                v-model.trim="form.name"
                type="text"
                class="form-control"
                maxlength="150"
                required
              />
            </div>

            <div class="mb-0">
              <label :for="`${modalId}-description`" class="form-label">Beschreibung</label>
              <textarea
                :id="`${modalId}-description`"
                v-model.trim="form.description"
                class="form-control"
                rows="4"
                maxlength="5000"
              ></textarea>
            </div>

            <div v-if="errorMessage" class="alert alert-danger mt-3 mb-0">
              {{ errorMessage }}
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="close" :disabled="saving">
              Abbrechen
            </button>
            <button type="submit" class="btn btn-primary" :disabled="saving">
              {{ saving ? 'Speichert...' : 'Projekt anlegen' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { Modal } from 'bootstrap';
import ProjectService from '@/services/project.service.js';

export default {
  name: 'CreateProject',
  props: {
    modalId: {
      type: String,
      default: 'createProjectModal'
    }
  },
  emits: ['created-project', 'closed'],
  data() {
    return {
      modal: null,
      saving: false,
      errorMessage: '',
      form: this.getEmptyForm()
    };
  },
  mounted() {
    const element = document.getElementById(this.modalId);
    if (element) {
      this.modal = new Modal(element);
      element.addEventListener('shown.bs.modal', this.focusNameField);
      element.addEventListener('hidden.bs.modal', this.handleClosed);
    }
  },
  beforeUnmount() {
    const element = document.getElementById(this.modalId);
    element?.removeEventListener('shown.bs.modal', this.focusNameField);
    element?.removeEventListener('hidden.bs.modal', this.handleClosed);
  },
  methods: {
    getEmptyForm() {
      return {
        name: '',
        description: ''
      };
    },
    show() {
      this.form = this.getEmptyForm();
      this.errorMessage = '';
      this.modal?.show();
    },
    close() {
      this.modal?.hide();
    },
    focusNameField() {
      this.$nextTick(() => {
        this.$refs.projectNameInput?.focus();
      });
    },
    handleClosed() {
      this.form = this.getEmptyForm();
      this.errorMessage = '';
      this.$emit('closed');
    },
    extractErrorMessage(error, fallbackMessage) {
      return error?.response?.data?.detail
        || error?.response?.data?.message
        || error?.response?.data?.title
        || (typeof error?.response?.data === 'string' ? error.response.data : null)
        || error?.message
        || fallbackMessage;
    },
    async createProject() {
      this.saving = true;
      this.errorMessage = '';

      try {
        const response = await ProjectService.createProject({
          name: this.form.name,
          description: this.form.description || null
        });

        this.$emit('created-project', response.data);
        this.close();
      } catch (error) {
        this.errorMessage = this.extractErrorMessage(error, 'Fehler beim Anlegen des Projekts.');
      } finally {
        this.saving = false;
      }
    }
  }
};
</script>
