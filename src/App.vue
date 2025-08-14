<template>
  <header class="navbar navbar-expand-lg bd-navbar navbar-dark sticky-top">
    <nav class="container-xxl bd-gutter flex-wrap flex-lg-nowrap" aria-label="Main navigation">
      <div class="d-lg-none" style="width: 2.25rem;"></div>
      <router-link to="/" class="navbar-brand">
        <img src="/img/test_logo.drawio.svg" alt="Logo acosci.de" class="d-inline-block align-text-top">
        <span style="font-style: italic;">aCoSci.de</span>
      </router-link>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarScroll"
        aria-controls="navbarScroll" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarScroll">
        <ul class="navbar-nav me-auto my-2 my-lg-0 navbar-nav-scroll" style="--bs-scroll-height: 100px;">
          <li class="nav-item">
            <router-link to="/tasks" class="nav-link">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                class="bi bi-card-checklist" viewBox="0 0 16 16">
                <path
                  d="M14.5 3a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5zm-13-1A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2z" />
                <path
                  d="M7 5.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5m-1.496-.854a.5.5 0 0 1 0 .708l-1.5 1.5a.5.5 0 0 1-.708 0l-.5-.5a.5.5 0 1 1 .708-.708l.146.147 1.146-1.147a.5.5 0 0 1 .708 0M7 9.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5m-1.496-.854a.5.5 0 0 1 0 .708l-1.5 1.5a.5.5 0 0 1-.708 0l-.5-.5a.5.5 0 0 1 .708-.708l.146.147 1.146-1.147a.5.5 0 0 1 .708 0" />
              </svg>
              Tasks
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/tasks/add" class="nav-link">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-plus-square" viewBox="0 0 16 16">
                      <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z"/>
                      <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"/>
                  </svg>
              </router-link>
          </li>

          <li v-if="showAdminBoard" class="nav-item">
            <router-link to="/admin" class="nav-link">Admin Board</router-link>
          </li>
          <li v-if="showModeratorBoard" class="nav-item">
            <router-link to="/mod" class="nav-link">Moderator Board</router-link>
          </li>

          <li v-if="!currentUser" class="nav-item">
            <router-link to="/signup" class="nav-link">Sign up</router-link><br>
          </li>
          <li v-if="!currentUser" class="nav-item">
            <router-link to="/login" class="nav-link">Log in</router-link><br>
          </li>

          <li v-if="currentUser" class="nav-item">
            <router-link to="/profile" class="nav-link">{{ currentUser.username }}´s Profile</router-link>
          </li>
          <li v-if="currentUser" class="nav-item">
            <a class="nav-link" @click.prevent="logOut">Log out</a>
          </li>

          <li class="nav-item">
            <router-link to="/about" class="nav-link">About</router-link><br>
          </li>
        </ul>
      </div>
    </nav>
  </header>
  <main id="content" class="container">
    <router-view></router-view>
  </main>
  <footer class="bd-footer py-4 py-md-5 mt-5 bg-body-tertiary">
    <div class="container py-4 py-md-5 px-4 px-md-3 text-body-secondary">
      <p>&copy; <i>Task App</i> by Gernot Schörner</p>
    </div>
  </footer>
</template>

<script>

export default {
  computed: {
    currentUser() {
      return this.$store.state.auth.user;
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
  },
  methods: {
    logOut() {
      this.$store.dispatch("auth/logout");
      this.$router.push('/login');
    }
  }
}
</script>

<style>
.navbar {
  background-color: #e3f2fd;
}

.bd-navbar {
  padding: 20px 0px;
  background-image: linear-gradient(to bottom, rgb(83, 75, 176), rgba(131, 86, 151, 0.95));
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15), inset 0 -1px 0 rgba(0, 0, 0, 0.15);
  margin-bottom: 50px;
}
</style>
// docker run --name mariadbtest -e MYSQL_ROOT_PASSWORD=Geheim01 -p 3306:3306 -d docker.io/library/mariadb:10.3