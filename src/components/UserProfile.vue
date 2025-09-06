<script>
import {jwtDecode} from "jwt-decode";

export default {
  name: "UserProfile",
  methods: {jwtDecode},
  computed: {
    currentUser() {
      return this.$store.state.auth.user;
    }
  },
  mounted() {
    if (!this.currentUser) {
      this.$router.push('/login');
    }
  }
};
</script>

<template>
  <div class="container">
    <h3>
      <strong>{{currentUser.username}}</strong>´s Profile
    </h3>
    <p>
      <strong>Token:</strong>
      {{currentUser.token.substring(0, 20)}} ... {{currentUser.token.substring(currentUser.token.length - 20)}}
    </p>
    <p>
      <strong>Id:</strong>
      {{currentUser.id}}
    </p>
    <p>
      <strong>Username:</strong>
      {{currentUser.username}}
    </p>
    <p>
      <strong>Email:</strong>
      {{currentUser.email}}
    </p>
    <strong>Authorities (roles):</strong>
    <ul>
      <li v-for="role in currentUser.roles" :key="role">{{role}}</li>
    </ul>
  </div>
</template>

<style></style>