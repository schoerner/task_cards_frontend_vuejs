<template>
  <div class="container py-4">
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
      <div>
        <h2 class="mb-1">Projekte</h2>
        <p class="text-muted mb-0">
          Übersicht über sichtbare Projekte mit eigener Projektrolle.
        </p>
      </div>

      <div class="d-flex gap-2">
        <button class="btn btn-outline-secondary" @click="loadProjectsAndRoles" :disabled="loading">
          Neu laden
        </button>
        <button class="btn btn-primary" @click="openCreateProjectModal">
          + Projekt anlegen
        </button>
      </div>
    </div>

    <div v-if="statusMessage" class="alert alert-success alert-dismissible fade show" role="alert">
      {{ statusMessage }}
      <button type="button" class="btn-close" @click="statusMessage = ''"></button>
    </div>

    <div v-if="errorMessage" class="alert alert-danger alert-dismissible fade show" role="alert">
      {{ errorMessage }}
      <button type="button" class="btn-close" @click="errorMessage = ''"></button>
    </div>

    <div class="row g-3 mb-4">
      <div class="col-md-4">
        <label class="form-label" for="filterText">Suche</label>
        <input
            id="filterText"
            v-model.trim="filterText"
            type="text"
            class="form-control"
            placeholder="Projektname oder Beschreibung"
        />
      </div>

      <div class="col-md-3">
        <label class="form-label" for="archiveFilter">Status</label>
        <select id="archiveFilter" v-model="archiveFilter" class="form-select">
          <option value="active">Nur aktiv</option>
          <option value="archived">Nur archiviert</option>
          <option value="all">Alle</option>
        </select>
      </div>

      <div class="col-md-3">
        <label class="form-label" for="sortBy">Sortierung</label>
        <select id="sortBy" v-model="sortBy" class="form-select">
          <option value="id">ID</option>
          <option value="name">Name</option>
          <option value="role">Eigene Rolle</option>
        </select>
      </div>

      <div class="col-md-2">
        <label class="form-label d-block">&nbsp;</label>
        <button class="btn btn-outline-secondary w-100" @click="toggleSortDirection">
          {{ sortDesc ? 'Absteigend' : 'Aufsteigend' }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="text-muted mb-3">
      Projekte werden geladen...
    </div>

    <div v-if="filteredAndSortedProjects.length === 0 && !loading" class="alert alert-info">
      Keine Projekte gefunden.
    </div>

    <div v-else class="table-responsive">
      <table class="table table-striped align-middle">
        <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Beschreibung</th>
          <th>Eigene Rolle</th>
          <th>Status</th>
          <th class="text-end">Aktionen</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="project in filteredAndSortedProjects" :key="project.id">
          <td>{{ project.id }}</td>
          <td class="fw-semibold">{{ project.name }}</td>
          <td>{{ project.description || '—' }}</td>
          <td>
              <span class="badge" :class="roleBadgeClass(project.currentUserProjectRole)">
                {{ project.currentUserProjectRole || 'UNBEKANNT' }}
              </span>
          </td>
          <td>
              <span class="badge" :class="project.archived ? 'text-bg-secondary' : 'text-bg-success'">
                {{ project.archived ? 'archiviert' : 'aktiv' }}
              </span>
          </td>
          <td class="text-end">
            <div class="d-flex flex-wrap justify-content-end gap-2">
              <button
                  class="btn btn-sm btn-outline-primary"
                  @click="openProjectBoard(project)"
              >
                Board
              </button>

              <button
                  class="btn btn-sm btn-secondary"
                  @click="openEditProjectModal(project)"
                  :disabled="!canManageProject(project)"
              >
                Bearbeiten
              </button>

              <button
                  class="btn btn-sm btn-warning"
                  @click="archiveProject(project)"
                  :disabled="!canManageProject(project) || project.archived"
              >
                Archivieren
              </button>

              <button
                  class="btn btn-sm btn-danger"
                  @click="confirmDelete(project)"
                  :disabled="!canManageProject(project)"
              >
                Löschen
              </button>
            </div>
          </td>
        </tr>
        </tbody>
      </table>
    </div>

    <!-- Create Project Modal -->
    <div class="modal fade" id="createProjectModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <form @submit.prevent="createProject">
            <div class="modal-header">
              <h5 class="modal-title">Projekt anlegen</h5>
              <button type="button" class="btn-close" @click="hideCreateProjectModal"></button>
            </div>

            <div class="modal-body">
              <div class="mb-3">
                <label for="createProjectName" class="form-label">Name</label>
                <input
                    id="createProjectName"
                    ref="createProjectNameInput"
                    v-model.trim="createForm.name"
                    type="text"
                    class="form-control"
                    required
                />
              </div>

              <div class="mb-3">
                <label for="createProjectDescription" class="form-label">Beschreibung</label>
                <textarea
                    id="createProjectDescription"
                    v-model.trim="createForm.description"
                    class="form-control"
                    rows="4"
                ></textarea>
              </div>

              <div v-if="modalErrorMessage" class="alert alert-danger mb-0">
                {{ modalErrorMessage }}
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="hideCreateProjectModal">
                Abbrechen
              </button>
              <button type="submit" class="btn btn-primary" :disabled="saving">
                {{ saving ? 'Speichert...' : 'Projekt anlegen' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Edit Project Modal -->
    <div class="modal fade" id="editProjectModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <form v-if="editForm.id" @submit.prevent="saveProject">
            <div class="modal-header">
              <h5 class="modal-title">Projekt bearbeiten</h5>
              <button type="button" class="btn-close" @click="hideEditProjectModal"></button>
            </div>

            <div class="modal-body">
              <div class="mb-3">
                <label for="editProjectName" class="form-label">Name</label>
                <input
                    id="editProjectName"
                    ref="editProjectNameInput"
                    v-model.trim="editForm.name"
                    type="text"
                    class="form-control"
                    required
                />
              </div>

              <div class="mb-3">
                <label for="editProjectDescription" class="form-label">Beschreibung</label>
                <textarea
                    id="editProjectDescription"
                    v-model.trim="editForm.description"
                    class="form-control"
                    rows="4"
                ></textarea>
              </div>

              <div class="form-check mb-3">
                <input
                    id="editProjectArchived"
                    v-model="editForm.archived"
                    class="form-check-input"
                    type="checkbox"
                />
                <label class="form-check-label" for="editProjectArchived">
                  Projekt archiviert
                </label>
              </div>

              <div v-if="modalErrorMessage" class="alert alert-danger mb-0">
                {{ modalErrorMessage }}
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="hideEditProjectModal">
                Abbrechen
              </button>
              <button type="submit" class="btn btn-primary" :disabled="saving">
                {{ saving ? 'Speichert...' : 'Änderungen speichern' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Delete Confirm Modal -->
    <div class="modal fade" id="deleteConfirmModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header bg-danger text-white">
            <h5 class="modal-title">Projekt löschen</h5>
            <button type="button" class="btn-close" @click="hideDeleteConfirmModal"></button>
          </div>
          <div class="modal-body">
            <p>Möchtest du dieses Projekt wirklich löschen?</p>
            <strong>{{ projectToDelete?.name }}</strong>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="hideDeleteConfirmModal">Abbrechen</button>
            <button class="btn btn-danger" @click="deleteConfirmed">Ja, löschen</button>
          </div>
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
  name: 'MyOwnedProjectManager',
  data() {
    return {
      loading: false,
      saving: false,
      projects: [],
      filterText: '',
      archiveFilter: 'active',
      sortBy: 'id',
      sortDesc: false,
      errorMessage: '',
      modalErrorMessage: '',
      statusMessage: '',
      projectToDelete: null,
      createProjectModal: null,
      editProjectModal: null,
      deleteConfirmModal: null,
      createForm: this.getEmptyCreateForm(),
      editForm: this.getEmptyEditForm()
    };
  },
  computed: {
    currentUser() {
      return this.$store.getters['auth/currentUser'];
    },
    isAdmin() {
      return this.$store.getters['auth/isAdmin'];
    },
    filteredAndSortedProjects() {
      let result = [...this.projects];

      if (this.archiveFilter === 'active') {
        result = result.filter(project => !project.archived);
      } else if (this.archiveFilter === 'archived') {
        result = result.filter(project => project.archived);
      }

      if (this.filterText) {
        const query = this.filterText.toLowerCase();
        result = result.filter(project =>
            project.name?.toLowerCase().includes(query) ||
            project.description?.toLowerCase().includes(query)
        );
      }

      result.sort((a, b) => {
        let left;
        let right;

        if (this.sortBy === 'role') {
          left = a.currentUserProjectRole || '';
          right = b.currentUserProjectRole || '';
        } else {
          left = a[this.sortBy];
          right = b[this.sortBy];
        }

        if (left == null && right == null) return 0;
        if (left == null) return this.sortDesc ? 1 : -1;
        if (right == null) return this.sortDesc ? -1 : 1;

        if (left < right) return this.sortDesc ? 1 : -1;
        if (left > right) return this.sortDesc ? -1 : 1;
        return 0;
      });

      return result;
    }
  },
  async mounted() {
    this.createProjectModal = new Modal(document.getElementById('createProjectModal'));
    this.editProjectModal = new Modal(document.getElementById('editProjectModal'));
    this.deleteConfirmModal = new Modal(document.getElementById('deleteConfirmModal'));

    await this.loadProjectsAndRoles();
  },
  methods: {
    getEmptyCreateForm() {
      return {
        name: '',
        description: ''
      };
    },

    getEmptyEditForm() {
      return {
        id: null,
        name: '',
        description: '',
        archived: false
      };
    },

    toggleSortDirection() {
      this.sortDesc = !this.sortDesc;
    },

    async loadProjectsAndRoles() {
      this.loading = true;
      this.errorMessage = '';

      try {
        const projectResponse = await ProjectService.getVisibleProjects();
        const baseProjects = projectResponse.data || [];

        const enrichedProjects = await Promise.all(
            baseProjects.map(async project => {
              try {
                const membersResponse = await ProjectMemberService.getMembers(project.id);
                const members = membersResponse.data || [];
                const ownMembership = members.find(
                    member => Number(member.user?.id) === Number(this.currentUser?.id)
                );

                return {
                  ...project,
                  currentUserProjectRole: ownMembership?.role || null
                };
              } catch {
                return {
                  ...project,
                  currentUserProjectRole: null
                };
              }
            })
        );

        this.projects = enrichedProjects;
      } catch (error) {
        this.errorMessage = this.extractErrorMessage(error, 'Fehler beim Laden der Projekte.');
      } finally {
        this.loading = false;
      }
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

    canManageProject(project) {
      if (this.isAdmin) {
        return true;
      }

      return project.currentUserProjectRole === 'OWNER';
    },

    openProjectBoard(project) {
      this.$router.push({
        path: '/boards',
        query: { projectId: project.id }
      });
    },

    openCreateProjectModal() {
      this.createForm = this.getEmptyCreateForm();
      this.modalErrorMessage = '';
      this.createProjectModal.show();

      this.$nextTick(() => {
        this.$refs.createProjectNameInput?.focus();
      });
    },

    hideCreateProjectModal() {
      this.modalErrorMessage = '';
      this.createProjectModal.hide();
    },

    async createProject() {
      this.saving = true;
      this.modalErrorMessage = '';

      try {
        const payload = {
          name: this.createForm.name,
          description: this.createForm.description || null
        };

        await ProjectService.createProject(payload);
        this.hideCreateProjectModal();
        this.statusMessage = 'Projekt wurde erfolgreich angelegt.';
        await this.loadProjectsAndRoles();
      } catch (error) {
        this.modalErrorMessage = this.extractErrorMessage(error, 'Fehler beim Anlegen des Projekts.');
      } finally {
        this.saving = false;
      }
    },

    openEditProjectModal(project) {
      this.editForm = {
        id: project.id,
        name: project.name || '',
        description: project.description || '',
        archived: !!project.archived
      };

      this.modalErrorMessage = '';
      this.editProjectModal.show();

      this.$nextTick(() => {
        this.$refs.editProjectNameInput?.focus();
      });
    },

    hideEditProjectModal() {
      this.modalErrorMessage = '';
      this.editProjectModal.hide();
      this.editForm = this.getEmptyEditForm();
    },

    async saveProject() {
      if (!this.editForm.id) {
        return;
      }

      this.saving = true;
      this.modalErrorMessage = '';

      try {
        const payload = {
          name: this.editForm.name,
          description: this.editForm.description || null,
          archived: !!this.editForm.archived
        };

        await ProjectService.updateProject(this.editForm.id, payload);
        this.hideEditProjectModal();
        this.statusMessage = 'Projekt wurde erfolgreich aktualisiert.';
        await this.loadProjectsAndRoles();
      } catch (error) {
        this.modalErrorMessage = this.extractErrorMessage(error, 'Fehler beim Speichern des Projekts.');
      } finally {
        this.saving = false;
      }
    },

    async archiveProject(project) {
      try {
        await ProjectService.archiveProject(project.id);
        this.statusMessage = `Projekt "${project.name}" wurde archiviert.`;
        await this.loadProjectsAndRoles();
      } catch (error) {
        this.errorMessage = this.extractErrorMessage(error, 'Fehler beim Archivieren des Projekts.');
      }
    },

    confirmDelete(project) {
      this.projectToDelete = project;
      this.deleteConfirmModal.show();
    },

    hideDeleteConfirmModal() {
      this.deleteConfirmModal.hide();
      this.projectToDelete = null;
    },

    async deleteConfirmed() {
      if (!this.projectToDelete?.id) {
        return;
      }

      try {
        await ProjectService.deleteProject(this.projectToDelete.id);
        this.statusMessage = `Projekt "${this.projectToDelete.name}" wurde gelöscht.`;
        this.hideDeleteConfirmModal();
        await this.loadProjectsAndRoles();
      } catch (error) {
        this.errorMessage = this.extractErrorMessage(error, 'Fehler beim Löschen des Projekts.');
      }
    },

    extractErrorMessage(error, fallbackMessage) {
      return error?.response?.data?.message
          || error?.response?.data
          || error?.message
          || fallbackMessage;
    }
  }
};
</script>