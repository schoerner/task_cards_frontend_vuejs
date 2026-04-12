<template>
  <div class="app-wrapper">
    <header class="navbar navbar-expand-lg bd-navbar navbar-dark sticky-top">
      <nav class="container-xxl bd-gutter flex-wrap flex-lg-nowrap" aria-label="Main navigation">
        <div class="d-lg-none" style="width: 2.25rem;"></div>

        <router-link to="/" class="navbar-brand">
          <img src="/img/test_logo.drawio.svg" alt="Logo task.acosci.de" class="d-inline-block align-text-top">
        </router-link>

        <button
            class="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarScroll"
            aria-controls="navbarScroll"
            aria-expanded="false"
            aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="navbarScroll">
          <div class="d-flex flex-column flex-lg-row w-100 justify-content-between align-items-lg-center gap-3">

            <div class="d-flex flex-column flex-lg-row gap-3">

              <div v-if="isUser || isAdmin || isModerator" class="btn-toolbar" role="toolbar" aria-label="Projekt-Navigation">
                <div class="btn-group nav-btn-group" role="group" aria-label="Projekt-Bereich">
                  <router-link to="/boards" class="btn nav-group-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-kanban-fill" viewBox="0 0 16 16">
                      <path d="M2.5 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zm5 2h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1m-5 1a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1zm9-1h1a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1"/>
                    </svg>
                    <span class="nav-btn-label">Boards</span>
                  </router-link>

                  <router-link to="/calendar" class="btn nav-group-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-calendar3" viewBox="0 0 16 16">
                      <path d="M14 0a1 1 0 0 1 1 1v1h-1V1H2v1H1V1a1 1 0 0 1 1-1h1v1a1 1 0 1 0 2 0V0h6v1a1 1 0 1 0 2 0V0z"/>
                      <path d="M1 3h14v11a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2zm2 2v2h2V5zm3 0v2h2V5zm3 0v2h2V5zm3 0v2h2V5zM3 8v2h2V8zm3 0v2h2V8zm3 0v2h2V8zm-6 3v2h2v-2zm3 0v2h2v-2z"/>
                    </svg>
                    <span class="nav-btn-label">Kalender</span>
                  </router-link>

                  <router-link to="/projects" class="btn nav-group-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-card-list" viewBox="0 0 16 16">
                      <path d="M14.5 3a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5zm-13-1A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2z"/>
                      <path d="M5 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 5 8m0-2.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5m0 5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 5 10.5m-1-5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0M4 8a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0m0 2.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0"/>
                    </svg>
                    <span class="nav-btn-label">Projekte</span>
                  </router-link>

                  <router-link to="/projects/member" class="btn nav-group-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-people-fill" viewBox="0 0 16 16">
                      <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6m-5.784 6A2.24 2.24 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.3 6.3 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1zM4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5"/>
                    </svg>
                    <span class="nav-btn-label">Mitglieder</span>
                  </router-link>
                </div>
              </div>

              <div v-if="isUser || isAdmin || isModerator" class="btn-toolbar" role="toolbar" aria-label="Benutzersuche-Navigation">
                <div class="btn-group nav-btn-group" role="group" aria-label="Benutzersuche-Bereich">
                  <router-link to="/user_profiles" class="btn nav-group-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-search" viewBox="0 0 16 16">
                      <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"/>
                    </svg>
                    <span class="nav-btn-label">Benutzersuche</span>
                  </router-link>
                </div>
              </div>

              <div v-if="isAdmin" class="btn-toolbar" role="toolbar" aria-label="Admin-Navigation">
                <div
                    ref="adminMenuWrapper"
                    class="btn-group nav-btn-group admin-menu-group"
                    role="group"
                    aria-label="Administration"
                >
                  <button
                      class="btn nav-group-btn dropdown-toggle"
                      type="button"
                      :aria-expanded="adminMenuOpen ? 'true' : 'false'"
                      @click="toggleAdminMenu"
                  >
                    <i class="bi bi-gear-fill"></i>
                    <span class="nav-btn-label">Administration</span>
                  </button>

                  <ul
                      class="dropdown-menu"
                      :class="{ show: adminMenuOpen }"
                  >
                    <li>
                      <router-link to="/admin/backups" class="dropdown-item" @click="closeAdminMenu">
                        <i class="bi bi-database-fill-gear"></i>
                        <span class="nav-btn-label">Backups</span>
                      </router-link>
                    </li>
                    <li>
                      <router-link to="/user-management" class="dropdown-item" @click="closeAdminMenu">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-person-fill-add" viewBox="0 0 16 16">
                          <path d="M12.5 16a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7m.5-5v1h1a.5.5 0 0 1 0 1h-1v1a.5.5 0 0 1-1 0v-1h-1a.5.5 0 0 1 0-1h1v-1a.5.5 0 0 1 1 0m-2-6a3 3 0 1 1-6 0 3 3 0 0 1 6 0"/>
                          <path d="M2 13c0 1 1 1 1 1h5.256A4.5 4.5 0 0 1 8 12.5a4.5 4.5 0 0 1 1.544-3.393Q8.844 9.002 8 9c-5 0-6 3-6 4"/>
                        </svg>
                        <span class="nav-btn-label">Benutzerverwaltung</span>
                      </router-link>
                    </li>
                  </ul>
                </div>
              </div>
              </div>

            <div class="d-flex flex-column flex-lg-row gap-3 align-items-lg-center">
              <div v-if="!currentUser" class="btn-toolbar" role="toolbar" aria-label="Authentifizierung">
                <div class="btn-group nav-btn-group" role="group" aria-label="Login">
                  <router-link to="/login" class="btn nav-group-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-box-arrow-in-right" viewBox="0 0 16 16">
                      <path fill-rule="evenodd" d="M6 3.5a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-2a.5.5 0 0 0-1 0v2A1.5 1.5 0 0 0 6.5 14h8A1.5 1.5 0 0 0 16 12.5v-9A1.5 1.5 0 0 0 14.5 2h-8A1.5 1.5 0 0 0 5 3.5v2a.5.5 0 0 0 1 0z"/>
                      <path fill-rule="evenodd" d="M11.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 1 0-.708.708L10.293 7.5H1.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708z"/>
                    </svg>
                    <span class="nav-btn-label">Login</span>
                  </router-link>
                </div>
              </div>

              <div v-if="currentUser" class="btn-toolbar" role="toolbar" aria-label="Benutzer-Menü">
                <div
                    ref="userMenuWrapper"
                    class="btn-group nav-btn-group user-menu-group"
                    role="group"
                    aria-label="Benutzerkonto"
                >
                  <button
                      class="btn nav-group-btn dropdown-toggle"
                      type="button"
                      :aria-expanded="userMenuOpen ? 'true' : 'false'"
                      @click="toggleUserMenu"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-person-lines-fill" viewBox="0 0 16 16">
                      <path d="M6 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m-5 6s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1zM11 3.5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 1-.5-.5m.5 2.5a.5.5 0 0 0 0 1h4a.5.5 0 0 0 0-1zm2 3a.5.5 0 0 0 0 1h2a.5.5 0 0 0 0-1zm0 3a.5.5 0 0 0 0 1h2a.5.5 0 0 0 0-1z"/>
                    </svg>
                    <span class="nav-btn-label">Benutzer</span>
                  </button>

                  <ul
                      class="dropdown-menu dropdown-menu-end"
                      :class="{ show: userMenuOpen }"
                  >
                    <li>
                      <router-link to="/profile" class="dropdown-item" @click="closeUserMenu">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-person-lines-fill" viewBox="0 0 16 16">
                          <path d="M6 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m-5 6s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1zM11 3.5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 1-.5-.5m.5 2.5a.5.5 0 0 0 0 1h4a.5.5 0 0 0 0-1zm2 3a.5.5 0 0 0 0 1h2a.5.5 0 0 0 0-1zm0 3a.5.5 0 0 0 0 1h2a.5.5 0 0 0 0-1z"/>
                        </svg>
                        <span class="nav-btn-label">Profil</span>
                      </router-link>
                    </li>
                    <li><hr class="dropdown-divider"></li>
                    <li>
                      <button type="button" class="dropdown-item" @click="logOut">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-box-arrow-right" viewBox="0 0 16 16">
                          <path fill-rule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0z"/>
                          <path fill-rule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708z"/>
                        </svg>
                        <span class="nav-btn-label">Logout</span>
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

          </div>
        </div>
      </nav>
    </header>

    <main id="content" class="container app-content">
      <router-view />
    </main>

    <footer class="app-footer">
      <div class="container-xxl d-flex flex-column flex-md-row justify-content-between align-items-center gap-2">
        <span>© 2007 - 2026 <i>ACoSci Tasks App</i> by Gernot Schörner</span>
        <div class="d-flex gap-3">
          <router-link to="/about">Über ACoSci Tasks</router-link>
          <router-link to="/impressum">Impressum</router-link>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
export default {
  data() {
    return {
      userMenuOpen: false,
      adminMenuOpen: false
    };
  },
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
  },
  mounted() {
    document.addEventListener("click", this.handleDocumentClick);
    document.addEventListener("keydown", this.handleEscapeKey);
  },
  beforeUnmount() {
    document.removeEventListener("click", this.handleDocumentClick);
    document.removeEventListener("keydown", this.handleEscapeKey);
  },
  methods: {
    toggleUserMenu() {
      this.userMenuOpen = !this.userMenuOpen;
      if (this.userMenuOpen) {
        this.adminMenuOpen = false;
      }
    },
    closeUserMenu() {
      this.userMenuOpen = false;
    },
    toggleAdminMenu() {
      this.adminMenuOpen = !this.adminMenuOpen;
      if (this.adminMenuOpen) {
        this.userMenuOpen = false;
      }
    },
    closeAdminMenu() {
      this.adminMenuOpen = false;
    },
    handleDocumentClick(event) {
      const userWrapper = this.$refs.userMenuWrapper;
      const adminWrapper = this.$refs.adminMenuWrapper;

      if (userWrapper && !userWrapper.contains(event.target)) {
        this.closeUserMenu();
      }

      if (adminWrapper && !adminWrapper.contains(event.target)) {
        this.closeAdminMenu();
      }
    },
    handleEscapeKey(event) {
      if (event.key === "Escape") {
        this.closeUserMenu();
        this.closeAdminMenu();
      }
    },
    logOut() {
      this.closeUserMenu();
      this.closeAdminMenu();
      this.$store.dispatch("auth/logout");
      this.$router.push("/login");
    }
  },
  watch: {
    $route() {
      this.closeUserMenu();
    }
  }
};
</script>

<style>
html, body {
  height: 100%;
  margin: 0;
}

.app-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-content {
  flex: 1;
}

.navbar {
  background-color: #e3f2fd;
}

.bd-navbar {
  padding: 20px 0;
  background-image: linear-gradient(to bottom, rgb(83, 75, 176), rgba(131, 86, 151, 0.95));
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15), inset 0 -1px 0 rgba(0, 0, 0, 0.15);
  margin-bottom: 50px;
}

.navbar-brand img {
  height: 40px;
  width: auto;
}

.nav-btn-group {
  border: 1px solid rgba(255, 255, 255, 0.85);
  border-radius: 0.375rem;
  overflow: visible;
}

.nav-group-btn {
  color: #fff;
  background: transparent;
  border: none;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  white-space: nowrap;
  box-shadow: none;
  text-decoration: none;
}

.nav-group-btn:hover,
.nav-group-btn:focus {
  color: #fff;
  background-color: rgba(255, 255, 255, 0.15);
  box-shadow: none;
}

.nav-group-btn.router-link-active,
.nav-group-btn.router-link-exact-active {
  color: #fff;
  background-color: rgba(255, 255, 255, 0.15);
  box-shadow: none;
}

.nav-group-btn + .nav-group-btn {
  border-left: 1px solid rgba(255, 255, 255, 0.85);
}

.nav-btn-group .dropdown-toggle::after {
  margin-left: 0.55rem;
}

.dropdown-menu .dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.user-menu-group {
  position: relative;
}

.app-footer {
  flex-shrink: 0;
  padding: 1rem 0;
  background: #f8f9fa;
  border-top: 1px solid #dee2e6;
}

.app-footer a {
  color: #0d6efd;
  text-decoration: none;
}

.app-footer a:hover {
  text-decoration: underline;
}

@media (max-width: 991.98px) {
  .nav-btn-group {
    width: 100%;
  }

  .nav-btn-group .nav-group-btn {
    justify-content: flex-start;
  }
}
@media (max-width: 767.98px) {
  .nav-group-btn {
    justify-content: center;
  }

  .nav-btn-label {
    display: none;
  }

  .nav-btn-group .dropdown-toggle::after {
    margin-left: 0.25rem;
  }
}
</style>