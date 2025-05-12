<template>
  <div class="col">
    <div class="card shadow-sm" v-on:click="countClicks">
      <div class="card-body">
        <h3 class="card-title">{{ itemTitle }}</h3>
        <p class="card-text">{{ itemDescription }}</p>
        <pre>ID: {{ itemId }}</pre>
        <pre>CreatorID: {{ itemCreator }}</pre>
        <button class="btn btn-primary" @click="editItem">Edit</button>
        <button class="btn btn-danger" @click="deleteItem">Delete</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
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
        if (2 < value.length && value.length < 120) {
          return true;
        }
        else {
          return false;
        }
      }
    },
    itemCreator: {
      type: Number,
      required: false
    },
    isFavorite: {
      type: Boolean,
      required: false,
      default: false
    }
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
    deleteItem() {
      this.$emit('delete-item', this.itemId)
    }
  }
};
</script>

<style scoped>
#red {
  font-weight: bold;
  color: rgb(144, 12, 12);
}

h1,
h2,
h3,
p {
  font-family: 'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif;
}
</style>