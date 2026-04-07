<template>
  <div class="container py-4">
    <div v-if="successMessage" class="alert alert-success" role="alert">
      {{ successMessage }}
    </div>

    <div v-if="errorMessage" class="alert alert-danger" role="alert">
      {{ errorMessage }}
    </div>

    <div class="card shadow-sm border-0 mb-4">
      <div class="card-body p-4">
        <div class="d-flex flex-column flex-lg-row justify-content-between align-items-lg-start gap-4">
          <div>
            <h1 class="h3 mb-1">Mein Profil</h1>
            <p class="text-muted mb-3">Persönliche Profildaten und Sicherheitseinstellungen</p>

            <div class="d-flex flex-wrap gap-2 mb-3">
              <span
                  v-for="role in normalizedRoles"
                  :key="role"
                  class="badge"
                  :class="roleBadgeClass(role)"
              >
                {{ role }}
              </span>
            </div>
          </div>

          <div class="d-flex flex-wrap gap-2">
            <button type="button" class="btn btn-outline-primary" @click="openEditProfileModal">
              Profil bearbeiten
            </button>
            <button type="button" class="btn btn-outline-primary" @click="openPasswordModal">
              Passwort ändern
            </button>
          </div>
        </div>

        <hr class="my-4">

        <div v-if="loading" class="text-muted mb-3">Profil wird geladen...</div>

        <div v-else class="row g-4">
          <div class="col-md-6">
            <div class="profile-item">
              <div class="profile-label">Anzeigename</div>
              <div class="profile-value">{{ profile?.name || '-' }}</div>
            </div>
          </div>

          <div class="col-md-6">
            <div class="profile-item">
              <div class="profile-label">Kontakt-E-Mail</div>
              <div class="profile-value">{{ profile?.contactEmail || '-' }}</div>
            </div>
          </div>

          <div class="col-md-6">
            <div class="profile-item">
              <div class="profile-label">Bild-URL</div>
              <div class="profile-value">
                <a v-if="profile?.pictureUrl" :href="profile.pictureUrl" target="_blank" rel="noopener noreferrer">
                  {{ profile.pictureUrl }}
                </a>
                <span v-else>-</span>
              </div>
            </div>
          </div>

          <div class="col-md-6">
            <div class="profile-item">
              <div class="profile-label">Login-E-Mail</div>
              <div class="profile-value">{{ currentUser?.email || '-' }}</div>
            </div>
          </div>

          <div class="col-12">
            <div class="profile-item">
              <div class="profile-label">Beschreibung</div>
              <div class="profile-value">{{ profile?.description || '-' }}</div>
            </div>
          </div>

          <div class="col-md-6">
            <div class="profile-item">
              <div class="profile-label">Benutzer-ID</div>
              <div class="profile-value">{{ currentUser?.id ?? '-' }}</div>
            </div>
          </div>

          <div class="col-md-6">
            <div class="profile-item">
              <div class="profile-label">JWT gültig bis</div>
              <div class="profile-value">{{ formatTokenExpiration(currentUser?.token) }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="modal fade" id="editProfileModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Profil bearbeiten</h5>
            <button type="button" class="btn-close" @click="hideEditProfileModal"></button>
          </div>
          <div class="modal-body">
            <div v-if="profileErrorMessage" class="alert alert-danger" role="alert">
              {{ profileErrorMessage }}
            </div>

            <form @submit.prevent="saveProfile">
              <div class="mb-3">
                <label class="form-label">Anzeigename</label>
                <input
                    v-model.trim="profileForm.name"
                    type="text"
                    class="form-control"
                    maxlength="255"
                    required
                >
              </div>

              <div class="mb-3">
                <label class="form-label">Kontakt-E-Mail</label>
                <input
                    v-model.trim="profileForm.contactEmail"
                    type="email"
                    class="form-control"
                    maxlength="255"
                >
              </div>

              <div class="mb-3">
                <label class="form-label">Bild-URL</label>
                <input
                    v-model.trim="profileForm.pictureUrl"
                    type="url"
                    class="form-control"
                    maxlength="1000"
                >
              </div>

              <div class="mb-0">
                <label class="form-label">Beschreibung</label>
                <textarea
                    v-model.trim="profileForm.description"
                    class="form-control"
                    rows="5"
                    maxlength="5000"
                ></textarea>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="hideEditProfileModal">Abbrechen</button>
            <button type="button" class="btn btn-primary" @click="saveProfile" :disabled="savingProfile">
              {{ savingProfile ? 'Speichert...' : 'Speichern' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="modal fade" id="changePasswordModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Passwort ändern</h5>
            <button type="button" class="btn-close" @click="hidePasswordModal"></button>
          </div>
          <div class="modal-body">
            <div v-if="passwordErrorMessage" class="alert alert-danger" role="alert">
              {{ passwordErrorMessage }}
            </div>

            <form @submit.prevent="changePassword">
              <div class="mb-3">
                <label class="form-label">Aktuelles Passwort</label>
                <input
                    v-model="passwordForm.currentPassword"
                    type="password"
                    class="form-control"
                    required
                >
              </div>

              <div class="mb-3">
                <label class="form-label">Neues Passwort</label>
                <input
                    v-model="passwordForm.newPassword"
                    type="password"
                    class="form-control"
                    required
                >
              </div>

              <div class="mb-0">
                <label class="form-label">Neues Passwort wiederholen</label>
                <input
                    v-model="passwordForm.confirmNewPassword"
                    type="password"
                    class="form-control"
                    required
                >
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="hidePasswordModal">Abbrechen</button>
            <button type="button" class="btn btn-primary" @click="changePassword">
              Passwort speichern
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Modal } from 'bootstrap';
import { jwtDecode } from 'jwt-decode';
import UserService from '@/services/user.service';
import UserProfileService from '@/services/user-profile.service';

export default {
  name: 'UserProfile',
  data() {
    return {
      loading: false,
      savingProfile: false,
      profile: null,
      changePasswordModalInstance: null,
      editProfileModalInstance: null,
      errorMessage: '',
      successMessage: '',
      profileErrorMessage: '',
      passwordErrorMessage: '',
      profileForm: this.emptyProfileForm(),
      passwordForm: this.emptyPasswordForm()
    };
  },
  computed: {
    currentUser() {
      return this.$store.getters['auth/currentUser'];
    },
    normalizedRoles() {
      if (!this.currentUser?.roles) {
        return [];
      }

      return this.currentUser.roles
          .map(role => typeof role === 'string' ? role : role?.name || '')
          .filter(Boolean);
    }
  },
  async mounted() {
    if (!this.currentUser?.id) {
      this.$router.push('/login');
      return;
    }

    this.changePasswordModalInstance = new Modal(document.getElementById('changePasswordModal'));
    this.editProfileModalInstance = new Modal(document.getElementById('editProfileModal'));
    await this.loadProfile();
  },
  methods: {
    emptyPasswordForm() {
      return {
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
      };
    },

    emptyProfileForm() {
      return {
        name: '',
        contactEmail: '',
        pictureUrl: '',
        description: ''
      };
    },

    async loadProfile() {
      this.loading = true;
      this.errorMessage = '';

      try {
        const response = await UserProfileService.getOwnProfile();
        this.profile = response.data;

        this.profileForm = {
          name: response.data?.name || '',
          contactEmail: response.data?.contactEmail || '',
          pictureUrl: response.data?.pictureUrl || '',
          description: response.data?.description || ''
        };
      } catch (error) {
        this.errorMessage =
            error?.response?.data?.message ||
            error?.response?.data ||
            error?.message ||
            'Profil konnte nicht geladen werden.';
      } finally {
        this.loading = false;
      }
    },

    openEditProfileModal() {
      this.profileErrorMessage = '';
      this.profileForm = {
        name: this.profile?.name || '',
        contactEmail: this.profile?.contactEmail || '',
        pictureUrl: this.profile?.pictureUrl || '',
        description: this.profile?.description || ''
      };
      this.editProfileModalInstance.show();
    },

    hideEditProfileModal() {
      this.profileErrorMessage = '';
      this.editProfileModalInstance.hide();
    },

    async saveProfile() {
      this.savingProfile = true;
      this.profileErrorMessage = '';
      this.errorMessage = '';
      this.successMessage = '';

      try {
        const payload = {
          name: this.profileForm.name,
          contactEmail: this.profileForm.contactEmail || null,
          pictureUrl: this.profileForm.pictureUrl || null,
          description: this.profileForm.description || null
        };

        const response = await UserProfileService.updateOwnProfile(payload);
        this.profile = response.data;
        this.editProfileModalInstance.hide();
        this.successMessage = 'Profil wurde erfolgreich aktualisiert.';
      } catch (error) {
        this.profileErrorMessage =
            error?.response?.data?.message ||
            error?.response?.data ||
            error?.message ||
            'Profil konnte nicht gespeichert werden.';
      } finally {
        this.savingProfile = false;
      }
    },

    openPasswordModal() {
      this.passwordErrorMessage = '';
      this.passwordForm = this.emptyPasswordForm();
      this.changePasswordModalInstance.show();
    },

    hidePasswordModal() {
      this.passwordErrorMessage = '';
      this.changePasswordModalInstance.hide();
    },

    async changePassword() {
      this.passwordErrorMessage = '';
      this.errorMessage = '';
      this.successMessage = '';

      if (this.passwordForm.newPassword !== this.passwordForm.confirmNewPassword) {
        this.passwordErrorMessage = 'Die neuen Passwörter stimmen nicht überein.';
        return;
      }

      if (this.passwordForm.newPassword.length < 8) {
        this.passwordErrorMessage = 'Das neue Passwort muss mindestens 8 Zeichen lang sein.';
        return;
      }

      try {
        await UserService.changePassword(this.currentUser.id, {
          currentPassword: this.passwordForm.currentPassword,
          newPassword: this.passwordForm.newPassword,
          confirmNewPassword: this.passwordForm.confirmNewPassword
        });

        this.changePasswordModalInstance.hide();
        this.passwordForm = this.emptyPasswordForm();
        this.successMessage = 'Das Passwort wurde erfolgreich geändert.';
      } catch (error) {
        this.passwordErrorMessage =
            error?.response?.data?.message ||
            error?.response?.data ||
            error?.message ||
            'Das Passwort konnte nicht geändert werden.';
      }
    },

    roleBadgeClass(roleName) {
      if (roleName === 'ROLE_ADMIN') {
        return 'text-bg-danger';
      }
      return 'text-bg-primary';
    },

    formatTokenExpiration(token) {
      if (!token) {
        return '-';
      }

      try {
        const decoded = jwtDecode(token);
        if (!decoded?.exp) {
          return '-';
        }
        return new Date(decoded.exp * 1000).toLocaleString('de-DE');
      } catch {
        return '-';
      }
    }
  }
};
</script>

<style scoped>
.profile-item {
  padding: 1rem;
  border: 1px solid var(--bs-border-color);
  border-radius: 0.75rem;
  height: 100%;
  background-color: var(--bs-body-bg);
}

.profile-label {
  font-size: 0.875rem;
  color: var(--bs-secondary-color);
  margin-bottom: 0.35rem;
}

.profile-value {
  font-size: 1rem;
  font-weight: 500;
  word-break: break-word;
}
</style>