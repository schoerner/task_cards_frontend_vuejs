<template>
  <div class="col">
    <div class="card shadow-sm" v-on:click="startStop" v-bind:class="{active: isActive, inactive: !isActive}">
      <div class="card-body">
        <h3 class="card-title">{{ task.title }}</h3>
        <p class="card-text">{{ task.description }}</p>
        <pre>ID: {{ task.id }}</pre>
        <pre>CreatorID: {{ task.creator }}</pre>
        <pre>TimeRecords: {{ task.timeRecords }}</pre>
        <p>
          <button class="btn btn-primary" @click="editItem">Edit</button>
          <button v-show="!showSureToDeleteDialog" class="btn btn-danger" @click="areYouSureToDeleteItemDialog">Delete</button>
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

import axios from 'axios';

export default {
  data() {
    return {
      showSureToDeleteDialog: false,
      isActive: false
    }
  },
  props: {
    task: Object,
    timeRecord: Object
  },
  emits: [
    'edit-item',
    'delete-item'
  ],
  computed: {
  },
  methods: {
    startStop() {
        if (this.task.active) {
            console.group("");
            console.log(this.timeRecord);
            axios
                .put("http://localhost:8088/rest/time_records", this.timeRecord)
                .then((response) => {
                    console.log(response.status);
                    console.log(response.data);
                    this.timeRecord = response.data; // todo
                })
                .catch((e) => console.log('something went wrong :(', e));
        }
        else {
            axios.post("http://localhost:8088/rest/time_records", this.task )
                .then(function (response) {
                    console.log(response);
                    this.timeRecord = response.data; // todo
                })
                .catch(function (error) {
                    console.log(error);
                });
        }
        this.task.active = !this.task.active;
        
      //this.isActive = !this.isActive
    },
    editItem() {
      this.$emit('edit-item', this.itemId)
    },
    areYouSureToDeleteItemDialog() {
      this.showSureToDeleteDialog = true
    },
    notSureToDeleteItem() {
      this.showSureToDeleteDialog = false
    },
    deleteItem() {
      this.$emit('delete-item', this.itemId)
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