<template>
  <div class="col">
    <div class="card shadow-sm" v-on:click="startStop" v-bind:class="{active: isActive, inactive: !isActive}">
      <div class="card-body">
        <h3 class="card-title">{{ itemTitle }}</h3>
        <p class="card-text">{{ itemDescription }}</p>
        <pre>ID: {{ itemId }}</pre>
        <pre>CreatorID: {{ itemCreator }}</pre>
        <pre>TimeRecords: {{ itemTimeRecords }}</pre>
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
  // props: ['itemName','itemDesc','isFavorite']
  props: {
    itemId: {
      type: Number,
      required: false
    },
    itemTitle: {
      type: String,
      required: true
    },
    itemDescription: {
      type: String,
      required: false,
      default: 'This is the default description.',
      validator: function (value) {
        if (2 <= value.length && value.length < 120) {
          return true;
        }
        else {
          return false;
        }
      }
    },
    itemCreator: Object,
    itemTimeRecords: Object
  },
  emits: [
    'edit-item',
    'delete-item'
  ],
  computed: {
  },
  methods: {
    startStop() {
      /*
        if (data.task.active) {
            console.group("");
            console.log(timeRecord);
            axios
                .put("http://localhost:8080/rest/time_records", timeRecord)
                .then((response) => {
                    console.log(response.status);
                    console.log(response.data);
                    setTimeRecord(response.data); // todo
                })
                .catch((e) => console.log('something went wrong :(', e));
        }
        else {
            axios.post("http://localhost:8080/rest/time_records", data.task )
                .then(function (response) {
                    console.log(response);
                    setTimeRecord(response.data); // todo
                })
                .catch(function (error) {
                    console.log(error);
                });
        }
        data.task.active = !data.task.active;
        */
      this.isActive = !this.isActive
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