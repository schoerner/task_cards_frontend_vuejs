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

          <router-link to="/boards" class="btn btn-outline-secondary btn-lg">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-calendar3" viewBox="0 0 16 16">
              <path d="M14 0a1 1 0 0 1 1 1v1h-1V1H2v1H1V1a1 1 0 0 1 1-1h1v1a1 1 0 1 0 2 0V0h6v1a1 1 0 1 0 2 0V0z"/>
              <path d="M1 3h14v11a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2zm2 2v2h2V5zm3 0v2h2V5zm3 0v2h2V5zm3 0v2h2V5zM3 8v2h2V8zm3 0v2h2V8zm3 0v2h2V8zm-6 3v2h2v-2zm3 0v2h2v-2z"/>
            </svg>
            Zum Kalender
          </router-link>
        </div>
      </div>
    </section>

    <section class="features-section py-5">
      <div class="container">
        <div class="row g-4">
          <div class="col-md-6 col-lg-4">
            <router-link :to="featureRoute('/projects')" class="feature-card-link">
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
            </router-link>
          </div>

          <div class="col-md-6 col-lg-4">
            <router-link :to="featureRoute('/boards')" class="feature-card-link">
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
            </router-link>
          </div>

          <div class="col-md-6 col-lg-4">
            <router-link :to="featureRoute('/focus')" class="feature-card-link">
              <div class="card h-100 shadow-sm border-0 feature-card">
                <div class="card-body">
                  <div class="feature-icon mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" class="bi bi-bullseye" viewBox="0 0 16 16">
                      <path d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14m0 1A8 8 0 1 1 8 0a8 8 0 0 1 0 16"/>
                      <path d="M8 13A5 5 0 1 0 8 3a5 5 0 0 0 0 10m0 1A6 6 0 1 1 8 2a6 6 0 0 1 0 12"/>
                      <path d="M8 11A3 3 0 1 0 8 5a3 3 0 0 0 0 6m0 1A4 4 0 1 1 8 4a4 4 0 0 1 0 8"/>
                      <path d="M9.5 8a1.5 1.5 0 1 1-3.001-.001A1.5 1.5 0 0 1 9.5 8"/>
                    </svg>
                  </div>
                  <h3 class="h5">Fokus auf wichtige Termine</h3>
                  <p class="card-text mb-0">
                    Behalte besonders wichtige oder favorisierende Tasks mit Termindruck schnell im Blick und starte direkt das Zeit-Tracking.
                  </p>
                </div>
              </div>
            </router-link>
          </div>

          <div class="col-md-6 col-lg-4">
            <router-link :to="featureRoute('/polls')" class="feature-card-link">
              <div class="card h-100 shadow-sm border-0 feature-card">
                <div class="card-body">
                  <div class="feature-icon mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" class="bi bi-calendar-event" viewBox="0 0 16 16">
                      <path d="M11 6.5a.5.5 0 0 1 .5-.5h1A1.5 1.5 0 0 1 14 7.5v1a.5.5 0 0 1-1 0v-1a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 1-.5-.5"/>
                      <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h.5A1.5 1.5 0 0 1 15 2.5v11A1.5 1.5 0 0 1 13.5 15h-11A1.5 1.5 0 0 1 1 13.5v-11A1.5 1.5 0 0 1 2.5 1H3V.5a.5.5 0 0 1 .5-.5M2 4v9.5a.5.5 0 0 0 .5.5H8v-2.5A1.5 1.5 0 0 1 9.5 10H14V4zm7 10h4.5a.5.5 0 0 0 .5-.5V11H9.5a.5.5 0 0 0-.5.5z"/>
                    </svg>
                  </div>
                  <h3 class="h5">Integrierte Terminabfragen</h3>
                  <p class="card-text mb-0">
                    Starte direkt aus einer Task eine Terminabfrage, sammle Verfügbarkeiten und übernimm den besten Termin anschließend in die Aufgabe.
                  </p>
                </div>
              </div>
            </router-link>
          </div>

          <div class="col-md-6 col-lg-4">
            <router-link :to="featureRoute('/boards')" class="feature-card-link">
              <div class="card h-100 shadow-sm border-0 feature-card">
                <div class="card-body">
                  <div class="feature-icon mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" class="bi bi-stopwatch" viewBox="0 0 16 16">
                      <path d="M8.5 5.6a.5.5 0 1 0-1 0v2.9h-3a.5.5 0 0 0 0 1H8a.5.5 0 0 0 .5-.5z"/>
                      <path d="M6.5 1A.5.5 0 0 1 7 .5h2a.5.5 0 0 1 0 1v.57c1.36.196 2.594.78 3.584 1.64l.012-.013.354-.354-.354-.353a.5.5 0 0 1 .707-.708l1.414 1.415a.5.5 0 1 1-.707.707l-.353-.354-.354.354-.013.012A7 7 0 1 1 7 2.071V1.5a.5.5 0 0 1-.5-.5M8 3a6 6 0 1 0 .001 12A6 6 0 0 0 8 3"/>
                    </svg>
                  </div>
                  <h3 class="h5">Zeiterfassung mit einem Klick</h3>
                  <p class="card-text mb-0">
                    Starte und stoppe Zeiten direkt an der Aufgabe, ohne unnötige Zwischenschritte.
                  </p>
                </div>
              </div>
            </router-link>
          </div>

          <div class="col-md-6 col-lg-4">
            <router-link :to="featureRoute('/boards')" class="feature-card-link">
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
            </router-link>
          </div>
        </div>

        <div class="card border-0 shadow-sm mt-4 privacy-card">
          <div class="card-body p-4">
            <h2 class="h5 mb-2">Datenschutzbewusst organisiert</h2>
            <p class="mb-2 text-muted">
              Für integrierte Terminabfragen werden Namen und E-Mail-Adressen nur für Einladung, Rückmeldung, Erinnerung und die Mitteilung des gemeinsamen Termins verwendet.
            </p>
            <p class="mb-0 text-muted">
              Externe Kontaktdaten werden nach Finalisierung des Termins beziehungsweise nach Wegfall des Zwecks nicht weiter für die jeweilige Terminabfrage verwendet. Die Verarbeitung erfolgt auf einem Server in Deutschland und nicht zu Werbezwecken.
            </p>
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
  methods: {
    featureRoute(authenticatedRoute) {
      return this.currentUser ? authenticatedRoute : '/login';
    }
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
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.feature-card-link {
  display: block;
  text-decoration: none;
  color: inherit;
  height: 100%;
}

.feature-card-link:hover .feature-card,
.feature-card-link:focus-visible .feature-card {
  transform: translateY(-2px);
  box-shadow: 0 0.5rem 1.2rem rgba(0, 0, 0, 0.12);
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