<template>
  <div class="container">
    <!-- Error -->
    <div v-if="errorMessage" class="alert alert-danger d-flex align-items-center" role="alert">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
           class="bi bi-exclamation-triangle me-2" viewBox="0 0 16 16">
        <path d="..."/>
        <path d="..."/>
      </svg>
      <p class="mb-0">{{ errorMessage }}</p>
    </div>

    <!-- Edit Form -->
    <form v-show="showForm" @submit.prevent="saveEditedProject">
      <div class="row mb-3">
        <label for="projectName" class="col-sm-2 col-form-label">Project Name:</label>
        <div class="col-sm-10">
          <input id="projectName" class="form-control" v-model="editProjectName" ref="editProjectName" required />
        </div>
      </div>

      <div class="d-flex justify-content-between">
        <div>
          <button class="btn btn-primary" type="submit">Save</button>
          <button class="btn btn-secondary ms-2" type="reset">Clear</button>
        </div>
        <div>
          <button type="button" class="btn btn-danger" @click="openDeleteModal">
            Delete
          </button>
        </div>
      </div>
    </form>

    <!-- Delete Modal -->
    <div class="modal fade" id="deleteConfirmModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header bg-danger text-white">
            <h5 class="modal-title">Delete Project?</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <p>Do you really want to delete this project?</p>
            <strong>{{ editProjectName }}</strong>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-danger" @click="confirmDelete">Yes, delete</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Modal } from 'bootstrap';
import ProjectService from "@/services/project.service.js";

export default {
  props: {
    project: Object
  },
  emits: ['saved-edit', 'cancelled-edit'],
  data() {
    return {
      showForm: true,
      editProjectName: "",
      errorMessage: ""
    };
  },
  mounted() {
    this.editProjectName = this.project.name;
    this.$refs.editProjectName.focus();
  },
  methods: {
    async saveEditedProject() {
      this.project.name = this.editProjectName;

      try {
        await ProjectService.updateProject(this.project);
        this.showForm = false;
        this.$emit('saved-edit', true, "Project has been updated.");
      } catch (error) {
        this.errorMessage = "Error while saving: " + error.message;
        this.$emit('saved-edit', false, this.errorMessage);
      }
    },
    openDeleteModal() {
      const modalEl = document.getElementById('deleteConfirmModal');
      const modal = new Modal(modalEl);
      modal.show();
    },
    async confirmDelete() {
      try {
        await ProjectService.deleteProject(this.project.id);
        const modal = Modal.getInstance(document.getElementById('deleteConfirmModal'));
        modal.hide();
        this.$emit('saved-edit', true, "The project was deleted successfully.");
      } catch (error) {
        this.errorMessage = "Error while deleting: " + error.message;
      }
    }
  }
};
</script>

<style scoped>
textarea {
  resize: vertical;
}
</style>