<template>
  <div class="col">
    <div class="card shadow-sm" v-on:click="countClicks">
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
export default {
  data() {
    return {
      showSureToDeleteDialog: false
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

<style scoped></style>