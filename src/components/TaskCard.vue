<template>
  <div class="col">
    <div class="card shadow-sm" v-on:click="startStop" v-bind:class="{active: isActive, inactive: !isActive}">
      <div class="card-body">
        <h3 class="card-title">{{ task.title }}</h3>
        <p class="card-text">{{ task.description }}</p>
        <!--
        <pre>ID: {{ task.id }}</pre>
        <pre>CreatorID: {{ task.creator }}</pre>
        <pre>TimeRecords: {{ task.timeRecords }}</pre>
        <pre>Active: {{ task.active }}</pre>
        -->
        <p>
          <button class="btn btn-primary" @click="editItem">Edit</button>
          <button v-show="!showSureToDeleteDialog" class="btn btn-danger" @click="areYouSureToDeleteItemDialog">Delete
          </button>
        </p>
        <div v-show="showSureToDeleteDialog" class="alert alert-primary" role="alert">
          <p>Do you really want to delete this item?</p>
          <button class="btn btn-primary" @click="notSureToDeleteItem">No</button>
          <button class="btn btn-danger" @click="deleteItem">Yes, delete!</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

import TaskService from "@/services/task.service.js";

export default {
  data() {
    return {
      showSureToDeleteDialog: false,
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
    'edit-item',
    'delete-item'
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
    editItem() {
      console.log("TaskCard.editItem", this.task);
      this.$emit('edit-item', this.task)
    },
    areYouSureToDeleteItemDialog() {
      this.showSureToDeleteDialog = true
    },
    notSureToDeleteItem() {
      this.showSureToDeleteDialog = false
    },
    deleteItem() {
      this.$emit('delete-item', this.task.id)
      this.showSureToDeleteDialog = false
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