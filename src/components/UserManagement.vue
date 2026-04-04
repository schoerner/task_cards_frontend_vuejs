<template>
  <div class="container py-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h1 class="h3 mb-1">Benutzerverwaltung</h1>
        <p class="text-muted mb-0">Benutzer anlegen, bearbeiten und löschen</p>
      </div>
      <button class="btn btn-primary" @click="openCreateModal">
        Benutzer anlegen
      </button>
    </div>

    <div v-if="errorMessage" class="alert alert-danger" role="alert">
      {{ errorMessage }}
    </div>

    <div class="card shadow-sm">
      <div class="card-body">
        <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-3">
          <div class="text-muted">
            {{ sortedUsers.length }} Benutzer insgesamt
          </div>
          <div class="d-flex align-items-center gap-2">
            <label for="pageSizeSelect" class="form-label mb-0">Anzeigen:</label>
            <select
                id="pageSizeSelect"
                v-model.number="pageSize"
                class="form-select w-auto"
                @change="handlePageSizeChange"
            >
              <option v-for="option in pageSizeOptions" :key="option" :value="option">
                {{ option === -1 ? 'Alle' : option }}
              </option>
            </select>
          </div>
        </div>

        <div class="table-responsive">
          <table class="table table-striped align-middle mb-0">
            <thead>
            <tr>
              <th>
                <button
                    type="button"
                    class="btn btn-link p-0 text-decoration-none fw-semibold"
                    @click="changeSort('id')"
                >
                  ID {{ sortIndicator('id') }}
                </button>
              </th>
              <th>
                <button
                    type="button"
                    class="btn btn-link p-0 text-decoration-none fw-semibold"
                    @click="changeSort('email')"
                >
                  E-Mail {{ sortIndicator('email') }}
                </button>
              </th>
              <th>
                <button
                    type="button"
                    class="btn btn-link p-0 text-decoration-none fw-semibold"
                    @click="changeSort('firstName')"
                >
                  Vorname {{ sortIndicator('firstName') }}
                </button>
              </th>
              <th>
                <button
                    type="button"
                    class="btn btn-link p-0 text-decoration-none fw-semibold"
                    @click="changeSort('lastName')"
                >
                  Nachname {{ sortIndicator('lastName') }}
                </button>
              </th>
              <th>
                <button
                    type="button"
                    class="btn btn-link p-0 text-decoration-none fw-semibold"
                    @click="changeSort('registration')"
                >
                  Registriert am {{ sortIndicator('registration') }}
                </button>
              </th>
              <th>Rollen</th>
              <th class="text-end">Aktionen</th>
            </tr>
            </thead>
            <tbody>
            <tr v-if="!loading && paginatedUsers.length === 0">
              <td colspan="7" class="text-center text-muted py-4">Keine Benutzer gefunden.</td>
            </tr>
            <tr v-for="user in paginatedUsers" :key="user.id">
              <td>{{ user.id }}</td>
              <td>{{ user.email }}</td>
              <td>{{ user.firstName }}</td>
              <td>{{ user.lastName }}</td>
              <td>{{ formatDate(user.registration) }}</td>
              <td>
                  <span
                      v-for="role in user.roles"
                      :key="extractRoleName(role)"
                      class="badge me-1"
                      :class="roleBadgeClass(role)"
                  >
                    {{ extractRoleName(role) }}
                  </span>
              </td>
              <td class="text-end">
                <button class="btn btn-outline-primary btn-sm me-2" @click="openEditModal(user)">
                  Bearbeiten
                </button>
                <button class="btn btn-outline-danger btn-sm" @click="openDeleteModal(user)">
                  Löschen
                </button>
              </td>
            </tr>
            <tr v-if="loading">
              <td colspan="7" class="text-center text-muted py-4">Lade Benutzer...</td>
            </tr>
            </tbody>
          </table>
        </div>

        <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mt-3">
          <div class="text-muted" v-if="pageSize !== -1">
            Seite {{ currentPage }} von {{ totalPages }}
          </div>
          <div class="text-muted" v-else>
            Alle Benutzer werden angezeigt.
          </div>

          <div class="d-flex gap-2">
            <button
                type="button"
                class="btn btn-outline-secondary btn-sm"
                :disabled="pageSize === -1 || currentPage <= 1"
                @click="currentPage--"
            >
              Zurück
            </button>
            <button
                type="button"
                class="btn btn-outline-secondary btn-sm"
                :disabled="pageSize === -1 || currentPage >= totalPages"
                @click="currentPage++"
            >
              Weiter
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="modal fade" id="userFormModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ isEditMode ? 'Benutzer bearbeiten' : 'Benutzer anlegen' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div v-if="formErrorMessage" class="alert alert-danger" role="alert">
              {{ formErrorMessage }}
            </div>

            <form @submit.prevent="saveUser">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label">Vorname</label>
                  <input v-model.trim="form.firstName" type="text" class="form-control" required>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Nachname</label>
                  <input v-model.trim="form.lastName" type="text" class="form-control" required>
                </div>
                <div class="col-12">
                  <label class="form-label">E-Mail</label>
                  <input v-model.trim="form.email" type="email" class="form-control" required>
                </div>
                <div class="col-12">
                  <label class="form-label">
                    Passwort
                    <span v-if="isEditMode" class="text-muted">(leer lassen, um es nicht zu ändern)</span>
                  </label>
                  <input
                      v-model="form.password"
                      type="password"
                      class="form-control"
                      :required="!isEditMode"
                  >
                </div>
                <div class="col-12">
                  <label class="form-label d-block">Rollen</label>
                  <div class="form-check form-check-inline" v-for="role in availableRoles" :key="role">
                    <input
                        class="form-check-input"
                        type="checkbox"
                        :id="`role-${role}`"
                        :value="role"
                        v-model="form.roles"
                    >
                    <label class="form-check-label" :for="`role-${role}`">{{ role }}</label>
                  </div>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Abbrechen</button>
            <button type="button" class="btn btn-primary" @click="saveUser">
              {{ isEditMode ? 'Änderungen speichern' : 'Benutzer anlegen' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="modal fade" id="deleteUserModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Benutzer löschen</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p>
              Soll der Benutzer <strong>{{ userToDelete?.email }}</strong> wirklich gelöscht werden?
            </p>
            <div class="form-check">
              <input
                  id="confirmDeleteCheckbox"
                  v-model="deleteConfirmed"
                  class="form-check-input"
                  type="checkbox"
              >
              <label class="form-check-label" for="confirmDeleteCheckbox">
                Ich bin mir der Konsequenzen des Löschens bewusst.
              </label>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Abbrechen</button>
            <button type="button" class="btn btn-danger" :disabled="!deleteConfirmed" @click="deleteUser">
              Endgültig löschen
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Modal } from 'bootstrap';
import UserManagementService from '@/services/user_management.service';

export default {
  name: 'UserManagement',
  data() {
    return {
      users: [],
      loading: false,
      errorMessage: '',
      formErrorMessage: '',
      isEditMode: false,
      availableRoles: ['ROLE_USER', 'ROLE_MODERATOR', 'ROLE_ADMIN'],
      form: this.emptyForm(),
      userToDelete: null,
      deleteConfirmed: false,
      userFormModalInstance: null,
      deleteUserModalInstance: null,
      sortKey: 'id',
      sortDirection: 'asc',
      pageSize: 10,
      currentPage: 1,
      pageSizeOptions: [10, 20, 50, -1],
    };
  },
  computed: {
    sortedUsers() {
      const usersCopy = [...this.users];

      usersCopy.sort((a, b) => {
        let valueA;
        let valueB;

        switch (this.sortKey) {
          case 'id':
            valueA = a.id ?? 0;
            valueB = b.id ?? 0;
            break;
          case 'firstName':
            valueA = a.firstName || '';
            valueB = b.firstName || '';
            break;
          case 'lastName':
            valueA = a.lastName || '';
            valueB = b.lastName || '';
            break;
          case 'registration':
            valueA = a.registration ? new Date(a.registration).getTime() : 0;
            valueB = b.registration ? new Date(b.registration).getTime() : 0;
            break;
          case 'email':
          default:
            valueA = a.email || '';
            valueB = b.email || '';
        }

        if (typeof valueA === 'string') {
          valueA = valueA.toLowerCase();
          valueB = valueB.toLowerCase();
        }

        if (valueA < valueB) {
          return this.sortDirection === 'asc' ? -1 : 1;
        }
        if (valueA > valueB) {
          return this.sortDirection === 'asc' ? 1 : -1;
        }
        return 0;
      });

      return usersCopy;
    },
    paginatedUsers() {
      if (this.pageSize === -1) {
        return this.sortedUsers;
      }

      const start = (this.currentPage - 1) * this.pageSize;
      return this.sortedUsers.slice(start, start + this.pageSize);
    },
    totalPages() {
      if (this.pageSize === -1) {
        return 1;
      }

      return Math.max(1, Math.ceil(this.sortedUsers.length / this.pageSize));
    },
  },
  mounted() {
    this.userFormModalInstance = new Modal(document.getElementById('userFormModal'));
    this.deleteUserModalInstance = new Modal(document.getElementById('deleteUserModal'));
    this.loadUsers();
  },
  methods: {
    emptyForm() {
      return {
        id: null,
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        roles: ['ROLE_USER'],
      };
    },
    async loadUsers() {
      this.loading = true;
      this.errorMessage = '';
      try {
        const response = await UserManagementService.getAllUsers();
        this.users = response.data;
        this.ensureValidPage();
      } catch (error) {
        this.errorMessage = this.extractErrorMessage(error, 'Benutzer konnten nicht geladen werden.');
      } finally {
        this.loading = false;
      }
    },
    openCreateModal() {
      this.isEditMode = false;
      this.formErrorMessage = '';
      this.form = this.emptyForm();
      this.userFormModalInstance.show();
    },
    openEditModal(user) {
      this.isEditMode = true;
      this.formErrorMessage = '';
      this.form = {
        id: user.id,
        email: user.email,
        password: '',
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles.map(role => this.extractRoleName(role)),
      };
      this.userFormModalInstance.show();
    },
    openDeleteModal(user) {
      this.userToDelete = user;
      this.deleteConfirmed = false;
      this.deleteUserModalInstance.show();
    },
    async saveUser() {
      this.formErrorMessage = '';

      if (!this.form.roles.length) {
        this.formErrorMessage = 'Mindestens eine Rolle muss ausgewählt sein.';
        return;
      }

      const payload = {
        email: this.form.email,
        password: this.form.password,
        firstName: this.form.firstName,
        lastName: this.form.lastName,
        roles: this.form.roles,
      };

      try {
        if (this.isEditMode) {
          await UserManagementService.updateUser({ ...payload, id: this.form.id });
        } else {
          await UserManagementService.createUser(payload);
        }

        this.userFormModalInstance.hide();
        await this.loadUsers();
      } catch (error) {
        this.formErrorMessage = this.extractErrorMessage(error, 'Benutzer konnte nicht gespeichert werden.');
      }
    },
    async deleteUser() {
      if (!this.userToDelete) {
        return;
      }

      try {
        await UserManagementService.deleteUser(this.userToDelete.id);
        this.deleteUserModalInstance.hide();
        this.userToDelete = null;
        await this.loadUsers();
      } catch (error) {
        this.errorMessage = this.extractErrorMessage(error, 'Benutzer konnte nicht gelöscht werden.');
      }
    },
    changeSort(key) {
      if (this.sortKey === key) {
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortKey = key;
        this.sortDirection = 'asc';
      }

      this.currentPage = 1;
    },
    sortIndicator(key) {
      if (this.sortKey !== key) {
        return '';
      }

      return this.sortDirection === 'asc' ? '▲' : '▼';
    },
    handlePageSizeChange() {
      this.currentPage = 1;
      this.ensureValidPage();
    },
    ensureValidPage() {
      if (this.pageSize === -1) {
        this.currentPage = 1;
        return;
      }

      if (this.currentPage > this.totalPages) {
        this.currentPage = this.totalPages;
      }

      if (this.currentPage < 1) {
        this.currentPage = 1;
      }
    },
    extractRoleName(role) {
      return typeof role === 'string' ? role : role?.name || '';
    },
    roleBadgeClass(role) {
      const roleName = this.extractRoleName(role);

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
    extractErrorMessage(error, fallback) {
      return error?.response?.data?.message || fallback;
    },
  },
};
</script>

<style scoped>
.text-bg-purple {
  background-color: #6f42c1;
  color: #fff;
}
</style>
