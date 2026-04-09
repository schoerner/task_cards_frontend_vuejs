<template>
  <div class="container py-4">
    <div class="mb-4">
      <h2 class="mb-1">Benutzersuche</h2>
      <p class="text-muted mb-0">Suche nach Benutzerprofilen anhand von Anzeigename oder Kontakt-E-Mail und zeige die öffentliche Profilansicht an.</p>
    </div>

    <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>

    <div class="row g-4">
      <div class="col-lg-5">
        <div class="card shadow-sm h-100">
          <div class="card-body">
            <label for="profileSearchInput" class="form-label fw-semibold">Profile suchen</label>
            <input
                id="profileSearchInput"
                v-model.trim="searchQuery"
                type="text"
                class="form-control mb-3"
                placeholder="Anzeigename oder Kontakt-E-Mail"
                @input="onSearchInput"
            />

            <div v-if="searching" class="text-muted small mb-3">Profile werden gesucht...</div>

            <div v-if="!searchQuery" class="p-3 text-muted">Bitte einen Suchbegriff eingeben.</div>
            <div v-else-if="results.length === 0" class="p-3 text-muted">Keine Profile gefunden.</div>
            <div v-else class="list-group list-group-flush">
              <button
                  v-for="profile in results"
                  :key="profile.userId"
                  type="button"
                  class="list-group-item list-group-item-action"
                  :class="{ active: Number(selectedUserId) === Number(profile.userId) }"
                  @click="openProfile(profile.userId)"
              >
                <div class="fw-semibold">{{ profile.name || 'Ohne Anzeigename' }}</div>
                <div class="small opacity-75">{{ profile.contactEmail || 'Keine Kontakt-E-Mail' }}</div>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="col-lg-7">
        <div class="card shadow-sm h-100">
          <div class="card-header bg-white d-flex justify-content-between align-items-center">
            <strong>Profilansicht</strong>
          </div>
          <div class="card-body">
            <div v-if="loadingProfile" class="text-muted">Profil wird geladen...</div>
            <div v-else-if="!profile" class="text-muted">Wähle links ein Profil aus.</div>
            <div v-else class="row g-4">
              <div class="col-md-8">
                <h3 class="h5 mb-1">{{ profile.name || 'Ohne Anzeigename' }}</h3>
                <div class="text-muted mb-3">{{ profile.contactEmail || 'Keine Kontakt-E-Mail hinterlegt' }}</div>
                <p class="mb-0" style="white-space: pre-line;">{{ profile.description || 'Keine Beschreibung hinterlegt.' }}</p>
              </div>
              <div class="col-md-4">
                <div class="border rounded p-3 bg-light h-100">
                  <div class="small text-muted mb-1">Bild-URL</div>
                  <a v-if="profile.pictureUrl" :href="profile.pictureUrl" target="_blank" rel="noopener noreferrer" class="small text-break">
                    {{ profile.pictureUrl }}
                  </a>
                  <div v-else class="text-muted small">Keine Bild-URL hinterlegt.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import UserProfileService from '@/services/user-profile.service.js';

let searchTimeout = null;

export default {
  name: 'UserProfiles',
  data() {
    return {
      searchQuery: this.$route.query.query || '',
      selectedUserId: this.$route.params.userId || null,
      searching: false,
      loadingProfile: false,
      errorMessage: '',
      results: [],
      profile: null
    };
  },
  async mounted() {
    if (this.searchQuery) {
      await this.searchProfiles();
    }

    if (this.selectedUserId) {
      await this.loadProfile(this.selectedUserId);
    }
  },
  watch: {
    '$route.params.userId': {
      immediate: false,
      async handler(userId) {
        this.selectedUserId = userId || null;
        if (!userId) {
          this.profile = null;
          return;
        }
        await this.loadProfile(userId);
      }
    }
  },
  beforeUnmount() {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
  },
  methods: {
    onSearchInput() {
      this.errorMessage = '';

      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }

      if (!this.searchQuery) {
        this.results = [];
        return;
      }

      searchTimeout = setTimeout(() => {
        this.searchProfiles();
      }, 250);
    },

    async searchProfiles() {
      if (!this.searchQuery) {
        this.results = [];
        return;
      }

      this.searching = true;
      this.errorMessage = '';

      try {
        const response = await UserProfileService.searchProfiles(this.searchQuery);
        this.results = response.data || [];

        this.$router.replace({
          path: this.$route.path,
          query: {
            ...this.$route.query,
            query: this.searchQuery
          }
        });
      } catch (error) {
        this.results = [];
        this.errorMessage = this.extractErrorMessage(error, 'Profile konnten nicht gesucht werden.');
      } finally {
        this.searching = false;
      }
    },

    openProfile(userId) {
      this.$router.push({
        path: `/user_profiles/${userId}`,
        query: {
          ...(this.searchQuery ? { query: this.searchQuery } : {})
        }
      });
    },

    async loadProfile(userId) {
      this.loadingProfile = true;
      this.errorMessage = '';

      try {
        const response = await UserProfileService.getProfileByUserId(userId);
        this.profile = response.data;
      } catch (error) {
        this.profile = null;
        this.errorMessage = this.extractErrorMessage(error, 'Profil konnte nicht geladen werden.');
      } finally {
        this.loadingProfile = false;
      }
    },

    extractErrorMessage(error, fallback) {
      return error?.response?.data?.detail
          || error?.response?.data?.message
          || error?.response?.data
          || error?.message
          || fallback;
    }
  }
};
</script>