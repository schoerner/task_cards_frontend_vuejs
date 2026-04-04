<template>
  <div v-if="currentUser">
    <h1>Welcome to the <i>ACoSci Tasks App</i>, <strong>{{currentUser.username}}</strong></h1>
    <h2>You have been registered.</h2>
    <p>That's a good sign.</p>
    <h2>You are able to ...</h2>
    <ul>
      <li>
        See this welcome page.
        <span v-if="isUser" class="badge text-bg-success">Yes</span>
        <span v-if="!isUser" class="badge text-bg-danger">No</span>
      </li>
      <li>
        Manage tasks and projects.
        <span v-if="isModerator" class="badge text-bg-success">Yes</span>
        <span v-if="!isModerator" class="badge text-bg-danger">No</span>
      </li>
      <li>
        Manage users.
        <span v-if="isAdmin" class="badge text-bg-success">Yes</span>
        <span v-if="!isAdmin" class="badge text-bg-danger">No</span>
      </li>
    </ul>
  </div>
  <div v-if="!currentUser">
    <h1>Welcome to the <i>ACoSci Tasks App</i></h1>
    <p class="alert alert-info" role="alert">
      Log in to the <i>ACoSci Tasks App</i>.
    </p>
  </div>
</template>

<script>

export default {
  computed: {
    currentUser() {
      return this.$store.getters["auth/currentUser"];
    },
    isUser() {
      return this.$store.getters["auth/isUser"];
    },
    isModerator() {
      return this.$store.getters["auth/isModerator"];
    },
    isAdmin() {
      return this.$store.getters["auth/isAdmin"];
    }
  }
}
</script>

<style></style>