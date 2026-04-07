<template>
  <div class="container">
    <div v-if="errorMessage" class="alert alert-danger" role="alert">
      {{ errorMessage }}
    </div>

    <form v-if="localProject" @submit.prevent="saveEditedProject">
      <div class="row mb-3">
        <label for="projectName" class="col-sm-3 col-form-label">Projektname</label>
        <div class="col-sm-9">
          <input
              id="projectName"
              ref="editProjectName"
              v-model.trim="localProject.name"
              class="form-control"
              maxlength="150"
              required
          />
        </div>
      </div>

      <div class="row mb-3">
        <label for="projectDescription" class="col-sm-3 col-form-label">Beschreibung</label>
        <div class="col-sm-9">
          <textarea
              id="projectDescription"
              v-model.trim="localProject.description"
              rows="4"
              maxlength="5000"
              class="form-control"
          ></textarea>
        </div>
      </div>

      <div class="form-check mb-3">
        <input
            id="projectArchived"
            v-model="localProject.archived"
            class="form-check-input"
            type="checkbox"
        />
        <label class="form-check-label" for="projectArchived">
          Projekt archiviert
        </label>
      </div>

      <div class="d-flex justify-content-between">
        <div>
          <button class="btn btn-primary" type="submit" :disabled="saving">
            {{ saving ? 'Speichert...' : 'Speichern' }}
          </button>
          <button class="btn btn-secondary ms-2" type="button" @click="$emit('cancelled-edit')">
            Abbrechen
          </button>
        </div>
        <div>
          <button type="button" class="btn btn-danger" @click="openDeleteModal">
            Löschen
          </button>
        </div>
      </div>
    </form>

    <div class="modal fade" id="deleteConfirmModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header bg-danger text-white">
            <h5 class="modal-title">Projekt löschen?</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <p>Möchtest du dieses Projekt wirklich löschen?</p>
            <strong>{{ localProject?.name }}</strong>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Abbrechen</button>
            <button type="button" class="btn btn-danger" @click="confirmDelete">Ja, löschen</button>
          </div>
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
    }
  },
  emits: ['saved-edit', 'cancelled-edit'],
  data() {
    return {
      saving: false,
      errorMessage: '',
      localProject: null
    };
  },
  mounted() {
    this.localProject = {
      id: this.project.id,
      name: this.project.name || '',
      description: this.project.description || '',
      archived: !!this.project.archived
    };

    this.$nextTick(() => {
      this.$refs.editProjectName?.focus();
    });
  },
  methods: {
    async saveEditedProject() {
      this.saving = true;
      this.errorMessage = '';

      try {
        const response = await ProjectService.updateProject(this.localProject.id, {
          name: this.localProject.name,
          description: this.localProject.description || null,
          archived: !!this.localProject.archived
        });

        this.$emit('saved-edit', true, 'Projekt wurde aktualisiert.', response.data);
      } catch (error) {
        this.errorMessage =
            error?.response?.data?.message ||
            error?.response?.data ||
            error?.message ||
            'Fehler beim Speichern des Projekts.';
        this.$emit('saved-edit', false, this.errorMessage);
      } finally {
        this.saving = false;
      }
    },

    openDeleteModal() {
      const modal = new Modal(document.getElementById('deleteConfirmModal'));
      modal.show();
    },

    async confirmDelete() {
      try {
        await ProjectService.deleteProject(this.localProject.id);
        const modal = Modal.getInstance(document.getElementById('deleteConfirmModal'));
        modal?.hide();
        this.$emit('saved-edit', true, 'Projekt wurde gelöscht.');
      } catch (error) {
        this.errorMessage =
            error?.response?.data?.message ||
            error?.response?.data ||
            error?.message ||
            'Fehler beim Löschen des Projekts.';
      }
    }
  }
};
</script>