<template>
  <div class="col">
    <div class="card shadow-sm" v-on:click="startStop" v-bind:class="{active: isActive, inactive: !isActive}">
      <div class="card-body">
        <h3 class="card-title">{{ task.title }}</h3>
        <p class="card-text">{{ task.description }}</p>
        <p class="card-text">
          <span class="badge text-bg-info">
            {{ task.project.name}}
          </span>
        </p>
        <p>
          <button class="btn btn-primary" @click.stop="editTask">Edit</button>
          <button class="btn btn-danger" @click.stop="deleteTask">Delete</button>
        </p>
      </div>
    </div>
  </div>
</template>

<script>

import TaskService from "@/services/task.service.js";

export default {
  data() {
    return {
      isActive: false
    }
  },
  mounted() {
    this.isActive = this.task.active;
    console.log("mounted.task", this.task);
    console.log("mounted.task.active", this.task.active);
    console.log("mounted.active", this.isActive);
  },
  created() {
  },
  props: {
    task: Object
  },
  emits: [
    'edit-task',
    'delete-task'
  ],
  computed: {},
  methods: {
    startStop() {
      if (this.task.active) {
        TaskService.stopTask(this.task.id) // todo post task instead of task.id
            .then(
                (response) => {
                  console.log(response.status);
                  console.log(response.data);
                  this.task.active = response.data.active; // todo
                  this.isActive = this.task.active; // *wichtig: muss hier sein, da async - await
                },
                (error) => {
                  this.errorMessage = "There was an error while fetching data: " +
                      (error.response && error.response.data && error.response.data.message)
                      || error.message
                      || error.toString();
                }
            );
      } else {
        TaskService.startTask(this.task.id) // todo post task instead of task.id
            .then(
                (response) => {
                  console.log(response.status);
                  console.log(response.data);
                  this.task.active = response.data.active; // todo
                  this.isActive = this.task.active;
                },
                (error) => {
                  this.errorMessage = "There was an error while fetching data: " +
                      (error.response && error.response.data && error.response.data.message)
                      || error.message
                      || error.toString();
                }
            );
      }
      // * context außerhalb await, wird nicht ausgeführt
      console.log("startStop() after TaskService...")
    },
    editTask() {
      console.log("TaskCard.editTask", this.task);
      this.$emit('edit-task', this.task)
    },
    deleteTask() {
      this.$emit('delete-task', this.task)
    }
  }
};
</script>

<style scoped>
.active {
  background-color: #afdfaf;
  color: darkgreen;
}

.inactive {
  background-color: lightgray;
  color: black;
}
</style>