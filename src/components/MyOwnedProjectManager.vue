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

    <create-project
        ref="createProjectModal"
        modal-id="projectsCreateProjectModal"
        @created-project="handleProjectCreated"
    />

    <edit-project
        v-if="selectedProjectForEdit"
        ref="editProjectModal"
        :project="selectedProjectForEdit"
        modal-id="projectsEditProjectModal"
        @saved-edit="handleProjectUpdated"
        @deleted-project="handleProjectDeleted"
    />
  </div>
</template>

<script>
import CreateProject from '@/components/CreateProject.vue';
import EditProject from '@/components/EditProject.vue';
import ProjectService from '@/services/project.service.js';
import ProjectMemberService from '@/services/project-member.service.js';

export default {
  name: 'MyOwnedProjectManager',
  components: {
    CreateProject,
    EditProject
  },
  data() {
    return {
      loading: false,
      projects: [],
      filterText: '',
      archiveFilter: 'active',
      sortBy: 'id',
      sortDesc: false,
      errorMessage: '',
      statusMessage: '',
      selectedProjectForEdit: null
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
    await this.loadProjectsAndRoles();
  },
  methods: {

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
                    member => Number(member.userId) === Number(this.currentUser?.id)
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
      this.$refs.createProjectModal?.show();
    },

    openEditProjectModal(project) {
      this.selectedProjectForEdit = { ...project };
      this.$nextTick(() => {
        this.$refs.editProjectModal?.show();
      });
    },

    async handleProjectCreated(createdProject) {
      this.statusMessage = 'Projekt wurde erfolgreich angelegt.';
      await this.loadProjectsAndRoles();

      if (createdProject?.id) {
        this.$router.push({
          path: '/boards',
          query: { projectId: createdProject.id }
        });
      }
    },

    async handleProjectUpdated() {
      this.statusMessage = 'Projekt wurde erfolgreich aktualisiert.';
      await this.loadProjectsAndRoles();
    },

    async handleProjectDeleted(deletedProjectId) {
      this.statusMessage = 'Projekt wurde gelöscht.';
      this.selectedProjectForEdit = null;
      await this.loadProjectsAndRoles();

      if (this.$route?.query?.projectId && Number(this.$route.query.projectId) === Number(deletedProjectId)) {
        this.$router.replace({ path: '/projects' });
      }
    },

    async archiveProject(project) {
      this.selectedProjectForEdit = { ...project, archived: true };
      this.$nextTick(() => {
        this.$refs.editProjectModal?.show();
      });
    },

    confirmDelete(project) {
      this.selectedProjectForEdit = { ...project };
      this.$nextTick(() => {
        this.$refs.editProjectModal?.show();
      });
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