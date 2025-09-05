<template>
  <div>
    <div class="container">

      <!-- Header -->
      <div class="row">
        <div class="col">
          <h1>Task Cards</h1>
        </div>
        <div class="col text-end">
          <button class="btn btn-primary" @click="showCreateTaskModal">+</button>
        </div>
      </div>

      <!-- Status Message -->
      <div class="row" v-if="status">
        <div class="alert alert-success" role="alert">
          <h4 class="alert-heading">Success!</h4>
          <p>{{ status }}</p>
          <button @click="status=''" class="btn btn-primary">OK</button>
        </div>
      </div>

      <!-- Error Message -->
      <div class="row" v-if="errorMessage">
        <div class="alert alert-danger d-flex align-tasks-center" role="alert">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
               class="bi bi-exclamation-triangle" viewBox="0 0 16 16">
            <path
                d="M7.938 2.016A.13.13 0 0 1 8.002 2a.13.13 0 0 1 .063.016.15.15 0 0 1 .054.057l6.857 11.667c.036.06.035.124.002.183a.2.2 0 0 1-.054.06.1.1 0 0 1-.066.017H1.146a.1.1 0 0 1-.066-.017.2.2 0 0 1-.054-.06.18.18 0 0 1 .002-.183L7.884 2.073a.15.15 0 0 1 .054-.057m1.044-.45a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767z"/>
            <path
                d="M7.002 12a1 1 0 1 1 2 0 1 1 0 0 1-2 0M7.1 5.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0z"/>
          </svg>
          <div>
            <p>{{ errorMessage }}</p>
          </div>
          <button @click="errorMessage=''" class="btn btn-primary">OK</button>
        </div>
      </div>

      <!-- Task Cards -->
      <div class="row">
        <div class="row g-3 row-cols-1 row-cols-sm-2 row-cols-md-3">
          <task-card
              v-for="task in tasks"
              :key="task.id"
              :task="task"
              @edit-task="showEditTaskModal"
              @delete-task="confirmDelete"
          />
        </div>
      </div>
    </div>

    <!-- Add Task Modal -->
    <div class="modal fade" id="createTaskModal" tabindex="-1" aria-labelledby="createTaskModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="createTaskModalLabel">Create Task</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"
                    @click="createTaskCancelled"></button>
          </div>
          <div class="modal-body">
            <add-task-task @cancelled-add="createTaskCancelled" @saved-add="createTaskDone" />
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Task Modal -->
    <div class="modal fade" id="editTaskModal" tabindex="-1" aria-labelledby="editTaskModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="editTaskModalLabel">Edit Task</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"
                    @click="editTaskCancelled"></button>
          </div>
          <div class="modal-body">
            <edit-task-task
                v-if="taskToEdit"
                :task="taskToEdit"
                @cancelled-edit="editTaskCancelled"
                @saved-edit="editTaskDone"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirm Modal -->
    <div class="modal fade" id="deleteConfirmModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header bg-danger text-white">
            <h5 class="modal-title">Delete Task</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p>Are you sure to delete this task?</p>
            <strong>{{ taskToDelete?.title }}</strong>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-danger" @click="deleteConfirmed">Yes, delete</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

import TaskService from "@/services/task.service.js";
import TaskCard from './TaskCard.vue';
import CreateTask from './CreateTask.vue'
import EditTask from './EditTask.vue'

import { Modal } from 'bootstrap';

export default {
  data() {
    return {
      result: null,
      tasks: null,
      showAddItem: false,
      showEditItem: false,
      taskToEdit: null,
      taskToDelete: null,
      status: "",
      errorMessage: ""
    };
  },
  computed: {
    currentUser() {
      return this.$store.state.auth.user;
    }
  },
  mounted() {
    this.getAllTasks();
  },
  components: {
    'task-card': TaskCard,
    'add-task-task': CreateTask,
    'edit-task-task': EditTask
  },
  methods: {
    showCreateTaskModal() {
      const modal = new Modal(document.getElementById('createTaskModal'));
      modal.show();
    },
    showEditTaskModal(task) {
      this.taskToEdit = task;
      this.$nextTick(() => {
        const modal = new Modal(document.getElementById('editTaskModal'));
        modal.show();
      });
    },
    createTaskCancelled() {
      // Wird beim Schließen des Modals aufgerufen
      const modal = Modal.getInstance(document.getElementById('createTaskModal'));
      modal.hide();
    },
    createTaskDone(successfully, message) {
      if (!successfully) {
        this.errorMessage = message;
        return;
      }
      this.createTaskCancelled(); // Modal schließen
      this.status = message;
      this.getAllTasks();
    },
    editTaskCancelled() {
      this.taskToEdit = null;
      const modal = Modal.getInstance(document.getElementById('editTaskModal'));
      modal.hide();
    },
    editTaskDone(successfully, message) {
      if (!successfully) {
        this.errorMessage = message;
        return;
      }
      this.editTaskCancelled(); // Modal schließen
      this.status = message;
      this.getAllTasks();
    },
    confirmDelete(task) {
      this.taskToDelete = task;
      const modal = new Modal(document.getElementById('deleteConfirmModal'));
      modal.show();
    },
    async deleteConfirmed() {
      try {
        await TaskService.deleteTask(this.taskToDelete.id);
        this.status = `Task "${this.taskToDelete.title}" was deleted successfully.`;
        this.taskToDelete = null;
        this.getAllTasks();
      } catch (error) {
        this.errorMessage = "Fehler beim Löschen: " + (
            error.response?.data?.message || error.message || error.toString()
        );
      } finally {
        const modal = Modal.getInstance(document.getElementById('deleteConfirmModal'));
        modal.hide();
      }
    },
    setTasksByResponse(response) {
      this.tasks = response.data;
      console.log("TaskCards.setTasksByResponse(): " + this.tasks);
    },
    getAllTasks() {
      TaskService
          .getAllTasksByUserId(this.currentUser.id)
          .then(
              // Version with callback function
              this.setTasksByResponse
              /* Alternative with lambda:
              (response) => {
                this.items = response.data
              }*/,
              // (anonymous) lambda function
              (error) => {
                this.errorMessage = "There was an error while fetching data : " +
                    (error.response && error.response.data && error.response.data.message)
                    || error.message
                    || error.toString();
              }
          );
    }
  }
}

</script>

<style></style>