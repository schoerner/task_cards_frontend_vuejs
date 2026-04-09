<template>
  <div
    class="modal fade"
    :id="modalId"
    tabindex="-1"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-lg modal-dialog-centered">
      <div class="modal-content">
        <form v-if="localProject" @submit.prevent="saveEditedProject">
          <div class="modal-header">
            <h5 class="modal-title">Projekt bearbeiten</h5>
            <button type="button" class="btn-close" @click="close"></button>
          </div>

          <div class="modal-body">
            <div v-if="errorMessage" class="alert alert-danger" role="alert">
              {{ errorMessage }}
            </div>

            <div class="row mb-3">
              <label :for="`${modalId}-projectName`" class="col-sm-3 col-form-label">Projektname</label>
              <div class="col-sm-9">
                <input
                  :id="`${modalId}-projectName`"
                  ref="editProjectName"
                  v-model.trim="localProject.name"
                  class="form-control"
                  maxlength="150"
                  required
                />
              </div>
            </div>

            <div class="row mb-3">
              <label :for="`${modalId}-projectDescription`" class="col-sm-3 col-form-label">Beschreibung</label>
              <div class="col-sm-9">
                <textarea
                  :id="`${modalId}-projectDescription`"
                  v-model.trim="localProject.description"
                  rows="4"
                  maxlength="5000"
                  class="form-control"
                ></textarea>
              </div>
            </div>

            <div class="form-check mb-4">
              <input
                :id="`${modalId}-projectArchived`"
                v-model="localProject.archived"
                class="form-check-input"
                type="checkbox"
              />
              <label class="form-check-label" :for="`${modalId}-projectArchived`">
                Projekt archivieren
              </label>
            </div>

            <div class="border rounded p-3 bg-light">
              <div class="fw-semibold text-danger mb-2">Gefährliche Aktionen</div>
              <div class="d-flex flex-wrap gap-2">
                <button
                  type="button"
                  class="btn btn-outline-warning"
                  @click="toggleArchived"
                  :disabled="saving || deleting"
                >
                  {{ localProject.archived ? 'Archivierung aufheben' : 'Jetzt archivieren' }}
                </button>

                <button
                  type="button"
                  class="btn btn-outline-danger"
                  @click="openDeleteModal"
                  :disabled="saving || deleting"
                >
                  Löschen
                </button>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" type="button" @click="close" :disabled="saving || deleting">
              Abbrechen
            </button>
            <button class="btn btn-primary" type="submit" :disabled="saving || deleting">
              {{ saving ? 'Speichert...' : 'Speichern' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>

  <div
    class="modal fade"
    :id="deleteModalId"
    tabindex="-1"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header bg-danger text-white">
          <h5 class="modal-title">Projekt löschen?</h5>
          <button type="button" class="btn-close btn-close-white" @click="closeDeleteModal"></button>
        </div>

        <div class="modal-body">
          <p class="mb-2">Möchtest du dieses Projekt wirklich löschen?</p>
          <p class="mb-3"><strong>{{ localProject?.name }}</strong></p>

          <div class="alert alert-warning mb-3">
            Dabei können auch zugehörige Board-Spalten, Tasks, Kommentare, Zeiten und Mitgliedschaften verloren gehen.
          </div>

          <div class="form-check">
            <input
              :id="`${deleteModalId}-confirm`"
              v-model="deleteConfirmed"
              class="form-check-input"
              type="checkbox"
            />
            <label class="form-check-label" :for="`${deleteModalId}-confirm`">
              Ich habe die Konsequenzen verstanden und möchte das Projekt wirklich löschen.
            </label>
          </div>

          <div v-if="deleteErrorMessage" class="alert alert-danger mt-3 mb-0">
            {{ deleteErrorMessage }}
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="closeDeleteModal" :disabled="deleting">
            Abbrechen
          </button>
          <button type="button" class="btn btn-danger" @click="confirmDelete" :disabled="!deleteConfirmed || deleting">
            {{ deleting ? 'Löscht...' : 'Ja, endgültig löschen' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Modal } from 'bootstrap';
import ProjectService from '@/services/project.service.js';

export default {
  name: 'EditProject',
  props: {
    project: {
      type: Object,
      required: true
    },
    modalId: {
      type: String,
      default: 'editProjectModal'
    }
  },
  emits: ['saved-edit', 'deleted-project', 'closed'],
  data() {
    return {
      saving: false,
      deleting: false,
      errorMessage: '',
      deleteErrorMessage: '',
      localProject: null,
      editModal: null,
      deleteModal: null,
      deleteConfirmed: false
    };
  },
  computed: {
    deleteModalId() {
      return `${this.modalId}-delete`;
    }
  },
  watch: {
    project: {
      immediate: true,
      deep: true,
      handler(project) {
        if (!project) {
          this.localProject = null;
          return;
        }

        this.localProject = {
          id: project.id,
          name: project.name || '',
          description: project.description || '',
          archived: !!project.archived
        };
      }
    }
  },
  mounted() {
    const editElement = document.getElementById(this.modalId);
    const deleteElement = document.getElementById(this.deleteModalId);

    if (editElement) {
      this.editModal = new Modal(editElement);
      editElement.addEventListener('shown.bs.modal', this.focusNameField);
      editElement.addEventListener('hidden.bs.modal', this.handleClosed);
    }

    if (deleteElement) {
      this.deleteModal = new Modal(deleteElement);
      deleteElement.addEventListener('hidden.bs.modal', this.resetDeleteState);
    }
  },
  beforeUnmount() {
    const editElement = document.getElementById(this.modalId);
    const deleteElement = document.getElementById(this.deleteModalId);

    editElement?.removeEventListener('shown.bs.modal', this.focusNameField);
    editElement?.removeEventListener('hidden.bs.modal', this.handleClosed);
    deleteElement?.removeEventListener('hidden.bs.modal', this.resetDeleteState);
  },
  methods: {
    show() {
      this.resetMessages();
      this.syncLocalProject();
      this.editModal?.show();
    },
    close() {
      this.editModal?.hide();
    },
    focusNameField() {
      this.$nextTick(() => {
        this.$refs.editProjectName?.focus();
      });
    },
    handleClosed() {
      this.$emit('closed');
    },
    syncLocalProject() {
      this.localProject = {
        id: this.project.id,
        name: this.project.name || '',
        description: this.project.description || '',
        archived: !!this.project.archived
      };
    },
    resetMessages() {
      this.errorMessage = '';
      this.deleteErrorMessage = '';
    },
    extractErrorMessage(error, fallbackMessage) {
      return error?.response?.data?.detail
        || error?.response?.data?.message
        || error?.response?.data?.title
        || (typeof error?.response?.data === 'string' ? error.response.data : null)
        || error?.message
        || fallbackMessage;
    },
    async saveEditedProject() {
      this.saving = true;
      this.errorMessage = '';

      try {
        const response = await ProjectService.updateProject(this.localProject.id, {
          name: this.localProject.name,
          description: this.localProject.description || null,
          archived: !!this.localProject.archived
        });

        this.$emit('saved-edit', response.data);
        this.close();
      } catch (error) {
        this.errorMessage = this.extractErrorMessage(error, 'Fehler beim Speichern des Projekts.');
      } finally {
        this.saving = false;
      }
    },
    async toggleArchived() {
      this.localProject.archived = !this.localProject.archived;
      await this.saveEditedProject();
    },
    openDeleteModal() {
      this.deleteConfirmed = false;
      this.deleteErrorMessage = '';
      this.deleteModal?.show();
    },
    closeDeleteModal() {
      this.deleteModal?.hide();
    },
    resetDeleteState() {
      this.deleteConfirmed = false;
      this.deleteErrorMessage = '';
    },
    async confirmDelete() {
      this.deleting = true;
      this.deleteErrorMessage = '';

      try {
        await ProjectService.deleteProject(this.localProject.id);
        this.deleteModal?.hide();
        this.editModal?.hide();
        this.$emit('deleted-project', this.localProject.id);
      } catch (error) {
        this.deleteErrorMessage = this.extractErrorMessage(error, 'Fehler beim Löschen des Projekts.');
      } finally {
        this.deleting = false;
      }
    }
  }
};
</script>
