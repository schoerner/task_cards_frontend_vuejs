<template>
  <div class="container py-4">
    <div v-if="successMessage" class="alert alert-success" role="alert">
      {{ successMessage }}
    </div>

    <div v-if="errorMessage" class="alert alert-danger" role="alert">
      {{ errorMessage }}
    </div>

    <div class="card shadow-sm border-0">
      <div class="card-body p-4">
        <div class="d-flex flex-column flex-lg-row justify-content-between align-items-lg-start gap-4">
          <div>
            <h1 class="h3 mb-1">Mein Profil</h1>
            <p class="text-muted mb-3">Persönliche Kontodaten und Sicherheitseinstellungen</p>

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
            <button type="button" class="btn btn-outline-primary" @click="openPasswordModal">
              Passwort ändern
            </button>
          </div>
        </div>

        <hr class="my-4">

        <div class="row g-4">
          <div class="col-md-6">
            <div class="profile-item">
              <div class="profile-label">ID</div>
              <div class="profile-value">{{ currentUser?.id ?? '-' }}</div>
            </div>
          </div>

          <div class="col-md-6">
            <div class="profile-item">
              <div class="profile-label">E-Mail</div>
              <div class="profile-value">{{ currentUser?.email || '-' }}</div>
            </div>
          </div>

          <div class="col-md-6">
            <div class="profile-item">
              <div class="profile-label">Vorname</div>
              <div class="profile-value">{{ currentUser?.firstName || '-' }}</div>
            </div>
          </div>

          <div class="col-md-6">
            <div class="profile-item">
              <div class="profile-label">Nachname</div>
              <div class="profile-value">{{ currentUser?.lastName || '-' }}</div>
            </div>
          </div>

          <div class="col-md-6">
            <div class="profile-item">
              <div class="profile-label">Registriert am</div>
              <div class="profile-value">{{ formatDate(currentUser?.registration) }}</div>
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

    <div class="modal fade" id="changePasswordModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Passwort ändern</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
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
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Abbrechen</button>
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

export default {
  name: 'UserProfile',
  data() {
    return {
      changePasswordModalInstance: null,
      errorMessage: '',
      successMessage: '',
      passwordErrorMessage: '',
      passwordForm: this.emptyPasswordForm(),
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

      return this.currentUser.roles.map(role => {
        if (typeof role === 'string') {
          return role;
        }
        return role?.name || '';
      }).filter(Boolean);
    },
  },
  mounted() {
    if (!this.currentUser) {
      this.$router.push('/login');
      return;
    }

    this.changePasswordModalInstance = new Modal(document.getElementById('changePasswordModal'));
  },
  methods: {
    emptyPasswordForm() {
      return {
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      };
    },
    openPasswordModal() {
      this.passwordErrorMessage = '';
      this.passwordForm = this.emptyPasswordForm();
      this.changePasswordModalInstance.show();
    },
    async changePassword() {
      this.passwordErrorMessage = '';
      this.errorMessage = '';
      this.successMessage = '';

      if (!this.currentUser?.id) {
        this.passwordErrorMessage = 'Kein gültiger Benutzer geladen.';
        return;
      }

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
          confirmNewPassword: this.passwordForm.confirmNewPassword,
        });

        this.changePasswordModalInstance.hide();
        this.passwordForm = this.emptyPasswordForm();
        this.successMessage = 'Das Passwort wurde erfolgreich geändert.';
      } catch (error) {
        this.passwordErrorMessage =
            error?.response?.data?.message || 'Das Passwort konnte nicht geändert werden.';
      }
    },
    roleBadgeClass(roleName) {
      if (roleName === 'ROLE_ADMIN') {
        return 'text-bg-danger';
      }
      if (roleName === 'ROLE_MODERATOR') {
        return 'text-bg-purple';
      }
      return 'text-bg-primary';
    },
    formatDate(value) {
      if (!value) {
        return '-';
      }

      return new Date(value).toLocaleString('de-DE');
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
    },
  },
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

.text-bg-purple {
  background-color: #6f42c1;
  color: #fff;
}
</style>
