<template>
  <div v-on:click="countClicks">
    <h2>{{ itemTitle }} <span style="color:red;font-weight:bold" v-show="isFavorite">fav!</span></h2>
    <p>{{ itemDescription  }}</p>
    <pre>ID: {{ itemId  }}</pre>
    <pre>CreatorID: {{ itemCreator  }}</pre>
    <p>{{ iLikeMessage }}</p>
    <p id="red">You have clicked me {{ clicks }} times.</p>
    <button v-on:click="toggleFavorite">Favorite</button>
    <button @click="removeitem">Remove</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      name: 'Apples',
      message: 'I like',
      clicks: 0,
      itemIsFavorite: this.isFavorite
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
        validator: function(value) {
          if( 2<value.length && value.length<120 ) {
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
    'toggle-favorite',
    'remove-item'
  ],
  computed: {
    iLikeMessage() {
      return this.message + " " + this.itemTitle
    }
  },
  methods: {
    countClicks() {
        this.clicks++;
    },
    toggleFavorite() { 
      //this.isFavorite = !this.isFavorite; Property-Objekte von außen sind read-only
      // man darf nur "eigene" data values verändern
      //this.itemIsFavorite = !this.itemIsFavorite
      this.$emit('toggle-favorite', this.itemId)
    },
    removeitem() { 
      this.$emit('remove-item', this.itemId)
    }
  }
};
</script>

<style scoped>
  #red {
    font-weight: bold ;
    color: rgb(144, 12, 12);
  }
  h1, h2, h3, p {
    font-family:'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif;
  }
</style>