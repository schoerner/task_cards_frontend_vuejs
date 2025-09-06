<template>
  <div v-if="currentUser">
    <h1>Welcome to the Task Cards App, <strong>{{currentUser.username}}</strong></h1>
    <h2>You have been registered.</h2>
    <p>That's a good sign.</p>
    <h2>You are able to ...</h2>
    <ul>
      <li>
        See this welcome page.
        <span v-if="showWelcomeBoard" class="badge text-bg-success">Yes</span>
        <span v-if="!showWelcomeBoard" class="badge text-bg-danger">No</span>
      </li>
      <li>
        Manage tasks and projects.
        <span v-if="showModeratorBoard" class="badge text-bg-success">Yes</span>
        <span v-if="!showModeratorBoard" class="badge text-bg-danger">No</span>
      </li>
      <li>
        Manage users.
        <span v-if="showAdminBoard" class="badge text-bg-success">Yes</span>
        <span v-if="!showAdminBoard" class="badge text-bg-danger">No</span>
      </li>
    </ul>
  </div>
  <div v-if="!currentUser">
    <h1>Welcome to the Task Cards App></h1>
    <div class="alert alert-info" role="alert">
      Sign up and log in to the Task Cards App.
    </div>
  </div>
</template>

<script>

export default {
  computed: {
    currentUser() {
      return this.$store.state.auth.user;
    },
    showWelcomeBoard() {
      if (this.currentUser && this.currentUser['roles']) {
        return this.currentUser['roles'].includes('ROLE_USER');
      }
      return false;
    },
    showAdminBoard() {
      if (this.currentUser && this.currentUser['roles']) {
        return this.currentUser['roles'].includes('ROLE_ADMIN');
      }
      return false;
    },
    showModeratorBoard() {
      if (this.currentUser && this.currentUser['roles']) {
        return this.currentUser['roles'].includes('ROLE_MODERATOR');
      }
      return false;
    }
  }
}
</script>

<style></style>