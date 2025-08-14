<template>
  <div>
    <div class="container">
      <div class="row">
        <div class="col">
          <h1>Task Cards</h1>
        </div>
        <div class="col text-end">
          <button class="btn btn-primary" @click="showAddItem = true" v-show="!showAddItem">+</button>
        </div>
      </div>
      <div class="row" v-if="status">
        <div class="alert alert-success" role="alert">
          <h4 class="alert-heading">Success!</h4>
          <p>{{ status }}</p>
          <button @click="status=''" class="btn btn-primary">OK</button>
        </div>
      </div>
      <div class="row" v-if="errorMessage">
        <div class="alert alert-danger d-flex align-items-center" role="alert">
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
      <div class="row">
        <add-task-item v-show="showAddItem" @cancelled-add="cancelledAdd" @saved-add="savedAdd"/>
        <edit-task-item v-if="showEditItem" :task="taskToEdit" @cancelled-edit="cancelledEdit"
                        @saved-edit="savedEdit"/>
      </div>
      <div class="row">
        <div class="row g-3 row-cols-1 row-cols-sm-2 row-cols-md-3">
          <task-card v-for="x in items" :task="x" @edit-item="editItem" @delete-item="deleteItem"/>
          <!-- <task-item v-for="x in items" :key="x.id" :item-id="x.id" :item-title="x.title"
              :item-description="x.description" :item-creator="x.creator" :item-time-records="x.timeRecords"
              @edit-item="editItem" @delete-item="deleteItem" /> -->
        </div>
      </div>
    </div>
  </div>
</template>

<script>

import TaskService from "@/services/task.service.js";
import TaskCard from './TaskCard.vue';
import AddTask from './AddTask.vue'
import EditTask from './EditTask.vue'

export default {
  data() {
    return {
      result: null,
      items: null,
      showAddItem: false,
      showEditItem: false,
      taskToEdit: null,
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
    this.fetchAllData();
  },
  components: {
    'task-card': TaskCard,
    'add-task-item': AddTask,
    'edit-task-item': EditTask
  },
  methods: {
    editItem(task) {
      console.log("TaskCards.editItem", task);
      this.taskToEdit = task;
      this.showEditItem = true;
    },
    cancelledAdd() {
      this.showAddItem = false;
    },
    savedAdd(successfully, message) {
      if (!successfully) {
        this.errorMessage = message
        return
      }

      this.showAddItem = false
      this.status = message
      this.fetchAllData()
    },
    cancelledEdit() {
      this.taskToEdit = null
      this.showEditItem = false
    },
    savedEdit(successfully, message) {
      if (!successfully) {
        this.errorMessage = message
        return
      }

      this.showEditItem = false
      this.status = message
      this.fetchAllData()
    },
    async deleteItem(itemId) {
      console.log("TaskCards delete", itemId)
      TaskService
          .deleteTask(itemId)
          .then(
              (response) => {
                this.status = 'The task with ID ' + itemId + ' was deleted successfully.'
                this.fetchAllData()
              },
              (error) => {
                this.errorMessage = "There was an error while deleting the task: " +
                    (error.response && error.response.data && error.response.data.message)
                    || error.message
                    || error.toString();
              });
    },
    fetchAllData() {
      TaskService
          .getAllTasksByUserId(this.currentUser.id)
          .then(
              (response) => {
                this.items = response.data
              },
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