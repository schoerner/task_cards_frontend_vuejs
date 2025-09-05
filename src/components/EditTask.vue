<template>
  <div class="container">
    <!-- Error -->
    <div v-if="errorMessage" class="alert alert-danger d-flex align-items-center" role="alert">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
           class="bi bi-exclamation-triangle me-2" viewBox="0 0 16 16">
        <path
            d="M7.938 2.016A.13.13 0 0 1 8.002 2a.13.13 0 0 1 .063.016.15.15 0 0 1 .054.057l6.857 11.667c.036.06.035.124.002.183a.2.2 0 0 1-.054.06.1.1 0 0 1-.066.017H1.146a.1.1 0 0 1-.066-.017.2.2 0 0 1-.054-.06.18.18 0 0 1 .002-.183L7.884 2.073a.15.15 0 0 1 .054-.057m1.044-.45a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767z"/>
        <path
            d="M7.002 12a1 1 0 1 1 2 0 1 1 0 0 1-2 0M7.1 5.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0z"/>
      </svg>
      <p class="mb-0">{{ errorMessage }}</p>
    </div>

    <!-- Bearbeiten-Formular -->
    <form v-show="showForm" @submit.prevent="saveEditedItem">
      <div class="row mb-3">
        <label for="title" class="col-sm-2 col-form-label">Title:</label>
        <div class="col-sm-10">
          <input id="title" class="form-control" v-model="editItemTitle" ref="editItemTitle" required />
        </div>
      </div>
      <div class="row mb-3">
        <label for="description" class="col-sm-2 col-form-label">Description:</label>
        <div class="col-sm-10">
          <textarea id="description" class="form-control" rows="4"
                    v-model="editItemDescription" required></textarea>
        </div>
      </div>

      <div class="d-flex justify-content-between">
        <div>
          <button class="btn btn-primary" type="submit">Speichern</button>
          <button class="btn btn-secondary ms-2" type="reset">Zurücksetzen</button>
        </div>
        <div>
          <button type="button" class="btn btn-danger" @click="openDeleteModal">
            Löschen
          </button>
        </div>
      </div>
    </form>

    <!-- Bootstrap Delete Modal -->
    <div class="modal fade" id="deleteConfirmModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header bg-danger text-white">
            <h5 class="modal-title">Aufgabe löschen?</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <p>Möchtest du diese Aufgabe wirklich löschen?</p>
            <strong>{{ editItemTitle }}</strong>
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
import TaskService from "@/services/task.service.js";

export default {
  props: {
    task: Object
  },
  emits: ['saved-edit', 'cancelled-edit'],
  data() {
    return {
      showForm: true,
      editItemTitle: "",
      editItemDescription: "",
      errorMessage: "",
    };
  },
  mounted() {
    this.editItemTitle = this.task.title;
    this.editItemDescription = this.task.description;
    this.$refs.editItemTitle.focus();
  },
  methods: {
    async saveEditedItem() {
      this.task.title = this.editItemTitle;
      this.task.description = this.editItemDescription;

      try {
        await TaskService.updateTask(this.task);
        this.showForm = false;
        this.$emit('saved-edit', true, "The task has been updated.");
      } catch (error) {
        this.errorMessage = "Fehler beim Speichern: " + error.message;
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
        await TaskService.deleteTask(this.task.id);
        const modal = Modal.getInstance(document.getElementById('deleteConfirmModal'));
        modal.hide();
        this.$emit('saved-edit', true, "The task was deleted successfully."); // Oder separater Event wie 'deleted'
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
