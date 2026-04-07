<template>
  <div class="welcome-page">
    <section class="hero-section text-center">
      <div class="container">
        <img
            src="/img/test_logo.drawio.svg"
            alt="Logo ACoSci Tasks App"
            class="welcome-logo mb-4"
        >

        <h1 class="display-5 fw-bold mb-3">
          Willkommen bei <i>ACoSci Tasks</i>
        </h1>

        <p class="lead mb-4" v-if="!currentUser">
          Die App zur Verwaltung von Projekten, Aufgaben, Boards und Zusammenarbeit im Team.
        </p>

        <p class="lead mb-4" v-else>
          Schön, dass du da bist,
          <strong>{{ displayName }}</strong>.
        </p>

        <p class="hero-subtext mx-auto mb-4">
          Behalte Aufgaben, Projektfortschritt und Zeiten übersichtlich im Blick –
          von flexibel anpassbaren Boards bis zur Zeiterfassung mit nur einem Klick.
        </p>

        <div v-if="!currentUser" class="d-flex flex-column flex-sm-row justify-content-center gap-3">
          <router-link to="/login" class="btn btn-primary btn-lg">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                 class="bi bi-box-arrow-in-right me-2" viewBox="0 0 16 16">
              <path fill-rule="evenodd"
                    d="M6 3.5a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-2a.5.5 0 0 0-1 0v2A1.5 1.5 0 0 0 6.5 14h8A1.5 1.5 0 0 0 16 12.5v-9A1.5 1.5 0 0 0 14.5 2h-8A1.5 1.5 0 0 0 5 3.5v2a.5.5 0 0 0 1 0z"/>
              <path fill-rule="evenodd"
                    d="M11.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 1 0-.708.708L10.293 7.5H1.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708z"/>
            </svg>
            Login
          </router-link>

          <router-link to="/about" class="btn btn-outline-secondary btn-lg">
            Über ACoSci Tasks
          </router-link>
        </div>

        <div v-else class="d-flex flex-column flex-sm-row justify-content-center gap-3">
          <router-link to="/projects" class="btn btn-primary btn-lg">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                 class="bi bi-card-list me-2" viewBox="0 0 16 16">
              <path d="M14.5 3a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5zm-13-1A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2z"/>
              <path d="M5 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 5 8m0-2.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5m0 5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 5 10.5m-1-5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0M4 8a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0m0 2.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0"/>
            </svg>
            Zu den Projekten
          </router-link>

          <router-link to="/boards" class="btn btn-outline-secondary btn-lg">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                 class="bi bi-kanban-fill me-2" viewBox="0 0 16 16">
              <path d="M2.5 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zm5 2h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1m-5 1a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1zm9-1h1a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1"/>
            </svg>
            Zu den Boards
          </router-link>
        </div>
      </div>
    </section>

    <section class="features-section py-5">
      <div class="container">
        <div class="row g-4">
          <div class="col-md-6 col-lg-3">
            <div class="card h-100 shadow-sm border-0 feature-card">
              <div class="card-body">
                <div class="feature-icon mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor"
                       class="bi bi-card-list" viewBox="0 0 16 16">
                    <path d="M14.5 3a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5zm-13-1A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2z"/>
                    <path d="M5 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 5 8m0-2.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5m0 5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 5 10.5"/>
                  </svg>
                </div>
                <h3 class="h5">Projekte verwalten</h3>
                <p class="card-text mb-0">
                  Organisiere Projekte, Zuständigkeiten und Aufgaben strukturiert an einem Ort.
                </p>
              </div>
            </div>
          </div>

          <div class="col-md-6 col-lg-3">
            <div class="card h-100 shadow-sm border-0 feature-card">
              <div class="card-body">
                <div class="feature-icon mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor"
                       class="bi bi-kanban-fill" viewBox="0 0 16 16">
                    <path d="M2.5 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zm5 2h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1m-5 1a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1zm9-1h1a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1"/>
                  </svg>
                </div>
                <h3 class="h5">Flexible Boards</h3>
                <p class="card-text mb-0">
                  Passe Board-Spalten dynamisch an deinen Workflow und den Projektkontext an.
                </p>
              </div>
            </div>
          </div>

          <div class="col-md-6 col-lg-3">
            <div class="card h-100 shadow-sm border-0 feature-card">
              <div class="card-body">
                <div class="feature-icon mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor"
                       class="bi bi-stopwatch-fill" viewBox="0 0 16 16">
                    <path d="M6.5 0a.5.5 0 0 0 0 1H7v1.07A7 7 0 1 0 8 2.07V1h.5a.5.5 0 0 0 0-1zm2.5 3.255A6 6 0 1 1 8 2a6 6 0 0 1 1 1.255"/>
                    <path d="M8 4a.5.5 0 0 0-.5.5v3.25c0 .167.083.323.22.416l2.5 1.5a.5.5 0 1 0 .56-.832L8.5 7.466V4.5A.5.5 0 0 0 8 4"/>
                  </svg>
                </div>
                <h3 class="h5">Zeiterfassung mit einem Klick</h3>
                <p class="card-text mb-0">
                  Starte und stoppe Zeiten direkt an der Aufgabe, ohne unnötige Zwischenschritte.
                </p>
              </div>
            </div>
          </div>

          <div class="col-md-6 col-lg-3">
            <div class="card h-100 shadow-sm border-0 feature-card">
              <div class="card-body">
                <div class="feature-icon mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor"
                       class="bi bi-people-fill" viewBox="0 0 16 16">
                    <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6m-5.784 6A2.24 2.24 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.3 6.3 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1zM4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5"/>
                  </svg>
                </div>
                <h3 class="h5">Zusammenarbeit im Team</h3>
                <p class="card-text mb-0">
                  Binde Mitglieder in Projekte ein und arbeite gemeinsam transparent an Aufgaben.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div v-if="currentUser" class="quick-links mt-5">
          <div class="card border-0 shadow-sm">
            <div class="card-body p-4">
              <h2 class="h4 mb-3">Schneller Einstieg</h2>
              <div class="d-flex flex-column flex-md-row gap-3 flex-wrap">
                <router-link to="/projects" class="btn btn-outline-primary">
                  Projekte öffnen
                </router-link>
                <router-link to="/boards" class="btn btn-outline-primary">
                  Boards öffnen
                </router-link>
                <router-link to="/projects/member" class="btn btn-outline-primary" v-if="isUser">
                  Projektmitglieder
                </router-link>
                <router-link to="/profile" class="btn btn-outline-secondary">
                  Profil öffnen
                </router-link>
                <router-link
                    v-if="isAdmin"
                    to="/user-management"
                    class="btn btn-outline-danger"
                >
                  Benutzerverwaltung
                </router-link>
              </div>
            </div>
          </div>
        </div>

        <div class="project-note text-center mt-5">
          <p class="text-muted mb-0">
            <i>ACoSci Tasks</i> ist ein nicht-kommerzielles Entwicklungs-, Lern- und Praxisprojekt.
          </p>
        </div>
      </div>
    </section>
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
    },
    displayName() {
      if (!this.currentUser) {
        return "";
      }
      return this.currentUser.username || "Benutzer";
    }
  }
};
</script>

<style scoped>
.welcome-page {
  padding-bottom: 2rem;
}

.hero-section {
  padding: 3rem 0 2rem;
}

.welcome-logo {
  max-width: 110px;
  height: auto;
}

.hero-subtext {
  max-width: 760px;
  color: #5c6770;
}

.feature-card {
  border-radius: 1rem;
}

.feature-icon {
  color: rgb(83, 75, 176);
}

.quick-links .card,
.feature-card {
  background: #fff;
}

@media (max-width: 767.98px) {
  .hero-section {
    padding-top: 1.5rem;
  }

  .welcome-logo {
    max-width: 90px;
  }
}
</style>