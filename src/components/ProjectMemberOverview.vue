<template>
  <div class="container py-4">
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
      <div>
        <h2 class="mb-1">Projektmitglieder</h2>
        <p class="text-muted mb-0">
          Mitglieder und Projektrollen pro Projekt verwalten.
        </p>
      </div>

      <button
          class="btn btn-primary"
          @click="openAddMemberModal"
          :disabled="!selectedProjectId || !canManageMembers"
      >
        Mitglied hinzufügen
      </button>
    </div>

    <div v-if="statusMessage" class="alert alert-success alert-dismissible fade show" role="alert">
      {{ statusMessage }}
      <button type="button" class="btn-close" @click="statusMessage = ''"></button>
    </div>

    <div v-if="errorMessage" class="alert alert-danger alert-dismissible fade show" role="alert">
      {{ errorMessage }}
      <button type="button" class="btn-close" @click="errorMessage = ''"></button>
    </div>

    <div class="card mb-4">
      <div class="card-body">
        <div class="row g-3 align-items-end">
          <div class="col-md-8">
            <label for="projectSelect" class="form-label">Projekt</label>
            <select
                id="projectSelect"
                v-model="selectedProjectId"
                class="form-select"
                @change="onProjectChanged"
            >
              <option :value="null" disabled>-- Projekt auswählen --</option>
              <option v-for="project in activeProjects" :key="project.id" :value="project.id">
                {{ project.name }}
              </option>
            </select>
          </div>

          <div class="col-md-4">
            <div v-if="selectedProject" class="border rounded p-3 bg-light">
              <div class="fw-semibold">{{ selectedProject.name }}</div>
              <div class="small text-muted">
                Eigene Rolle:
                <span class="badge ms-1" :class="roleBadgeClass(currentUserRole)">
                  {{ currentUserRole || 'UNBEKANNT' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="loading" class="text-muted mb-3">
      Mitglieder werden geladen...
    </div>

    <div v-if="selectedProjectId && !loading" class="card shadow-sm">
      <div class="card-body">
        <div v-if="sortedMembers.length === 0" class="text-muted">
          Keine Mitglieder gefunden.
        </div>

        <div v-else class="table-responsive">
          <table class="table table-striped align-middle mb-0">
            <thead>
            <tr>
              <th @click="sort('id')" style="cursor: pointer">ID</th>
              <th @click="sort('email')" style="cursor: pointer">E-Mail</th>
              <th @click="sort('name')" style="cursor: pointer">Name</th>
              <th @click="sort('role')" style="cursor: pointer">Rolle</th>
              <th @click="sort('joinedAt')" style="cursor: pointer">Beigetreten</th>
              <th class="text-end">Aktionen</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="member in sortedMembers" :key="member.userId">
              <td>{{ member.userId }}</td>
              <td>{{ member.email }}</td>
              <td>{{ fullName(member) }}</td>
              <td>
    <span class="badge" :class="roleBadgeClass(member.role)">
      {{ member.role }}
    </span>
              </td>
              <td>{{ formatDate(member.joinedAt) }}</td>
              <td class="text-end">
                <div class="d-flex justify-content-end gap-2">
                  <select
                      class="form-select form-select-sm w-auto"
                      :value="member.role"
                      @change="updateRole(member, $event.target.value)"
                      :disabled="!canManageMembers || isCurrentUser(member.userId)"
                  >
                    <option value="OWNER">OWNER</option>
                    <option value="MAINTAINER">MAINTAINER</option>
                    <option value="MEMBER">MEMBER</option>
                    <option value="VIEWER">VIEWER</option>
                  </select>

                  <button
                      class="btn btn-outline-danger btn-sm"
                      @click="removeMember(member)"
                      :disabled="!canManageMembers || isCurrentUser(member.userId)"
                  >
                    Entfernen
                  </button>
                </div>
              </td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div v-else-if="!loading" class="alert alert-info">
      Bitte zuerst ein Projekt auswählen.
    </div>

    <div class="modal fade" id="addMemberModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <form @submit.prevent="addMember">
            <div class="modal-header">
              <h5 class="modal-title">Mitglied hinzufügen</h5>
              <button type="button" class="btn-close" @click="hideAddMemberModal"></button>
            </div>
            <div class="modal-body">
              <div class="mb-3">
                <label class="form-label" for="userIdInput">Benutzer-ID</label>
                <input
                    id="userIdInput"
                    v-model.number="addForm.userId"
                    type="number"
                    min="1"
                    class="form-control"
                    required
                />
              </div>

              <div class="mb-3">
                <label class="form-label" for="memberRoleInput">Rolle</label>
                <select id="memberRoleInput" v-model="addForm.role" class="form-select" required>
                  <option value="OWNER">OWNER</option>
                  <option value="MAINTAINER">MAINTAINER</option>
                  <option value="MEMBER">MEMBER</option>
                  <option value="VIEWER">VIEWER</option>
                </select>
              </div>

              <div v-if="modalErrorMessage" class="alert alert-danger mb-0">
                {{ modalErrorMessage }}
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="hideAddMemberModal">
                Abbrechen
              </button>
              <button type="submit" class="btn btn-primary" :disabled="saving">
                {{ saving ? 'Speichert...' : 'Hinzufügen' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Modal } from 'bootstrap';
import ProjectService from '@/services/project.service.js';
import ProjectMemberService from '@/services/project-member.service.js';

export default {
  name: 'ProjectMemberOverview',
  data() {
    return {
      loading: false,
      saving: false,
      errorMessage: '',
      modalErrorMessage: '',
      statusMessage: '',
      projects: [],
      members: [],
      selectedProjectId: null,
      sortBy: 'id',
      sortDesc: false,
      addMemberModal: null,
      addForm: {
        userId: null,
        role: 'MEMBER'
      }
    };
  },
  computed: {
    currentUser() {
      return this.$store.getters['auth/currentUser'];
    },
    isAdmin() {
      return this.$store.getters['auth/isAdmin'];
    },
    activeProjects() {
      return this.projects.filter(project => !project.archived);
    },
    selectedProject() {
      return this.projects.find(project => Number(project.id) === Number(this.selectedProjectId)) || null;
    },
    currentUserRole() {
      const ownMember = this.members.find(member => Number(member.userId) === Number(this.currentUser?.id));
      return ownMember?.role || null;
    },
    canManageMembers() {
      return this.isAdmin || this.currentUserRole === 'OWNER' || this.currentUserRole === 'MAINTAINER';
    },
    sortedMembers() {
      return [...this.members].sort((a, b) => {
        const left = this.sortValue(a, this.sortBy);
        const right = this.sortValue(b, this.sortBy);

        if (left == null && right == null) return 0;
        if (left == null) return this.sortDesc ? 1 : -1;
        if (right == null) return this.sortDesc ? -1 : 1;

        if (left < right) return this.sortDesc ? 1 : -1;
        if (left > right) return this.sortDesc ? -1 : 1;
        return 0;
      });
    }
  },
  async mounted() {
    this.addMemberModal = new Modal(document.getElementById('addMemberModal'));
    await this.loadProjects();

    const routeProjectId = this.$route.query.projectId;
    if (routeProjectId && this.activeProjects.some(project => Number(project.id) === Number(routeProjectId))) {
      this.selectedProjectId = Number(routeProjectId);
      await this.loadMembers();
    }
  },
  methods: {
    async loadProjects() {
      try {
        const response = await ProjectService.getVisibleProjects();
        this.projects = response.data || [];
      } catch (error) {
        this.errorMessage = this.extractErrorMessage(error, 'Projekte konnten nicht geladen werden.');
      }
    },

    async onProjectChanged() {
      this.$router.replace({
        path: '/projects/member',
        query: { projectId: this.selectedProjectId }
      });

      await this.loadMembers();
    },

    async loadMembers() {
      if (!this.selectedProjectId) {
        this.members = [];
        return;
      }

      this.loading = true;
      this.errorMessage = '';

      try {
        const response = await ProjectMemberService.getMembers(this.selectedProjectId);
        this.members = response.data || [];
      } catch (error) {
        this.errorMessage = this.extractErrorMessage(error, 'Mitglieder konnten nicht geladen werden.');
      } finally {
        this.loading = false;
      }
    },

    sort(field) {
      if (this.sortBy === field) {
        this.sortDesc = !this.sortDesc;
      } else {
        this.sortBy = field;
        this.sortDesc = false;
      }
    },

    sortValue(member, field) {
      switch (field) {
        case 'id':
          return member.userId ?? null;
        case 'email':
          return member.email ?? '';
        case 'name':
          return this.fullName(member).toLowerCase();
        case 'role':
          return member.role ?? '';
        case 'joinedAt':
          return member.joinedAt ?? '';
        default:
          return '';
      }
    },

    fullName(member) {
      const firstName = member?.firstName || '';
      const lastName = member?.lastName || '';
      return `${firstName} ${lastName}`.trim() || '—';
    },

    roleBadgeClass(role) {
      switch (role) {
        case 'OWNER':
          return 'text-bg-danger';
        case 'MAINTAINER':
          return 'text-bg-warning';
        case 'MEMBER':
          return 'text-bg-primary';
        case 'VIEWER':
          return 'text-bg-secondary';
        default:
          return 'text-bg-dark';
      }
    },

    formatDate(value) {
      if (!value) {
        return '—';
      }
      return new Date(value).toLocaleString('de-DE');
    },

    isCurrentUser(userId) {
      return Number(this.currentUser?.id) === Number(userId);
    },

    openAddMemberModal() {
      this.addForm = {
        userId: null,
        role: 'MEMBER'
      };
      this.modalErrorMessage = '';
      this.addMemberModal.show();
    },

    hideAddMemberModal() {
      this.modalErrorMessage = '';
      this.addMemberModal.hide();
    },

    async addMember() {
      this.saving = true;
      this.modalErrorMessage = '';

      try {
        await ProjectMemberService.addMember(this.selectedProjectId, {
          userId: Number(this.addForm.userId),
          role: this.addForm.role
        });

        this.hideAddMemberModal();
        this.statusMessage = 'Mitglied wurde hinzugefügt.';
        await this.loadMembers();
      } catch (error) {
        this.modalErrorMessage = this.extractErrorMessage(error, 'Mitglied konnte nicht hinzugefügt werden.');
      } finally {
        this.saving = false;
      }
    },

    async updateRole(member, role) {
      try {
        await ProjectMemberService.updateMemberRole(this.selectedProjectId, member.userId, {
          userId: member.userId,
          role
        });

        this.statusMessage = 'Projektrolle wurde aktualisiert.';
        await this.loadMembers();
      } catch (error) {
        this.errorMessage = this.extractErrorMessage(error, 'Projektrolle konnte nicht geändert werden.');
      }
    },

    async removeMember(member) {
      try {
        await ProjectMemberService.removeMember(this.selectedProjectId, member.userId);
        this.statusMessage = 'Mitglied wurde entfernt.';
        await this.loadMembers();
      } catch (error) {
        this.errorMessage = this.extractErrorMessage(error, 'Mitglied konnte nicht entfernt werden.');
      }
    },

    extractErrorMessage(error, fallbackMessage) {
      return error?.response?.data?.detail
          || error?.response?.data?.message
          || error?.response?.data?.title
          || (typeof error?.response?.data === 'string' ? error.response.data : null)
          || error?.message
          || fallbackMessage;
    }
  }
};
</script>