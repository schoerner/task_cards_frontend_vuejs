<template>
  <div class="container">
    <div v-if="errorMessage" class="alert alert-danger d-flex align-tasks-center" role="alert">
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
    </div>
    <form v-on:submit.prevent="addItem">
      <div class="row mb-3">
        <label for="title" class="col-sm-2 col-form-label">Title: </label>
        <div class="col-sm-10">
          <input id="title" v-model="newTaskTitle" ref="newItemTitleRef" required>
        </div>
      </div>
      <div class="row mb-3">
        <label for="description" class="col-sm-2 col-form-label">Description: </label>
        <div class="col-sm-10">
          <textarea id="description" placeholder="Description" rows="4" cols="50" class="form-control"
                    v-model="newTaskDescription"/>
        </div>
      </div>
      <button class="btn btn-primary" type="submit">Add</button>
      <button class="btn btn-secondary" type="reset">Clear</button>
    </form>
  </div>
</template>


<script>
import TaskService from "@/services/task.service.js";

export default {
  data() {
    return {
      newTaskId: null,
      newTaskTitle: "",
      newTaskDescription: "",
      newTaskCreator: null,
      errorMessage: ""
    }
  },
  mounted() {
    this.$refs.newItemTitleRef.focus()
  },
  emits: [
    'saved-add',
    'cancelled-add'
  ],
  computed: {
    currentUser() {
      return this.$store.state.auth.user;
    }
  },
  methods: {
    addItem() {
      // todo: do some consistency checks here
      const newTask = {
        title: this.newTaskTitle,
        description: this.newTaskDescription,
        creator: {id: this.currentUser.id}
      }
      TaskService.saveTask(newTask)
          .then(response => {
            this.newTaskId = response.data.id

            this.newTaskId = null
            this.newTaskTitle = ""
            this.newTaskDescription = ""
            this.newTaskCreator = null

            this.$emit('saved-add', true, "The task was saved with id " + response.data.id + ".")
          })
          .catch(error => {
            this.errorMessage = error.message;
            console.error("There was an error!", error);
            this.$emit('saved-add', false, this.errorMessage)
          });
    }
  }
}
</script>


<style></style>