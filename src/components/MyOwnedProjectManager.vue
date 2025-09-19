<template>
  <div class="container py‑4">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h2>Projects</h2>
      <button class="btn btn-primary" @click="showCreateProjectModal">+ Create Project</button>
    </div>

    <table class="table table-striped">
      <thead>
      <tr>
        <th @click="sort('id')" style="cursor: pointer">
          ID <small v-if="sortBy === 'id'">{{ sortDesc ? '↓' : '↑' }}</small>
        </th>
        <th @click="sort('name')" style="cursor: pointer">
          Name <small v-if="sortBy === 'name'">{{ sortDesc ? '↓' : '↑' }}</small>
        </th>
        <th>Actions</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="project in sortedProjects" :key="project.id">
        <td>{{ project.id }}</td>
        <td>{{ project.name }}</td>
        <td>
          <button class="btn btn-sm btn-secondary me-2" @click="editProject(project)">Edit</button>
          <button class="btn btn-sm btn-danger" @click="confirmDelete(project)">Delete</button>
        </td>
      </tr>
      </tbody>
    </table>

    <!-- Create Project Modal -->
    <div class="modal fade" id="createProjectModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Create New Project</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <CreateProject @created="projectCreated" @cancelled="hideCreateProjectModal" />
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Project Modal -->
    <div class="modal fade" id="editProjectModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content" v-if="projectToEdit">
          <div class="modal-header">
            <h5 class="modal-title">Edit Project</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" @click="hideEditProjectModal"></button>
          </div>
          <div class="modal-body">
            <EditProject :project="projectToEdit" @saved-edit="onProjectSaved" @cancelled="hideEditProjectModal" />
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirm Modal -->
    <div class="modal fade" id="deleteConfirmModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header bg-danger text-white">
            <h5 class="modal-title">Delete Project?</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <p>Are you sure you want to delete the project <strong>{{ projectToDelete?.name }}</strong>?</p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button class="btn btn-danger" @click="deleteConfirmed">Yes, delete</button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import { Modal } from 'bootstrap';
import ProjectService from '@/services/project.service.js';
import CreateProject from './CreateProject.vue';
import EditProject from './EditProject.vue';

export default {
  components: { CreateProject, EditProject },
  data() {
    return {
      projects: [],
      sortBy: 'id',
      sortDesc: false,
      projectToEdit: null,
      projectToDelete: null,
      createProjectModal: null,
      editProjectModal: null,
      deleteConfirmModal: null,
    };
  },
  computed: {
    currentUser() {
      return this.$store.state.auth.user;
    },
    sortedProjects() {
      return [...this.projects].sort((a, b) => {
        const field = this.sortBy;
        if (a[field] < b[field]) return this.sortDesc ? 1 : -1;
        if (a[field] > b[field]) return this.sortDesc ? -1 : 1;
        return 0;
      });
    }
  },
  mounted() {
    this.loadProjects();
    this.createProjectModal = new Modal(document.getElementById('createProjectModal'));
    this.editProjectModal = new Modal(document.getElementById('editProjectModal'));
    this.deleteConfirmModal = new Modal(document.getElementById('deleteConfirmModal'));
  },
  methods: {
    sort(field) {
      if (this.sortBy === field) {
        this.sortDesc = !this.sortDesc;
      } else {
        this.sortBy = field;
        this.sortDesc = false;
      }
    },
    loadProjects() {
      ProjectService
          .getMyOwnedProjects(this.currentUser.id)
          .then(
              (response) => {
                this.projects = response.data
              },
              (error) => {
                this.errorMessage = "There was an error while loading projects: " +
                    (error.response && error.response.data && error.response.data.message)
                    || error.message
                    || error.toString();
              }
          );
    },
    showCreateProjectModal() { this.createProjectModal.show(); },
    hideCreateProjectModal() { this.createProjectModal.hide(); },
    projectCreated(newProject) {
      this.projects.push(newProject);
      this.hideCreateProjectModal();
    },
    editProject(proj) {
      this.projectToEdit = { ...proj };
      this.editProjectModal.show();
    },
    hideEditProjectModal() {
      this.projectToEdit = null;
      this.editProjectModal.hide();
    },
    onProjectSaved(success, message) {
      if (!success) {
        this.errorMessage = message;
        return;
      }
      this.hideEditProjectModal();
      this.loadProjects();
      this.status = message;
    },
    confirmDelete(project) {
      this.projectToDelete = project;
      this.deleteConfirmModal.show();
    },
    async deleteConfirmed() {
      try {
        await ProjectService.deleteProject(this.projectToDelete.id);
        this.projects = this.projects.filter(p => p.id !== this.projectToDelete.id);
        this.projectToDelete = null;
        this.loadProjects();
      } catch (error) {
        this.errorMessage = "Error while deleting the project: " + (
            error.response?.data?.message || error.message || error.toString()
        );
      } finally {
        this.deleteConfirmModal.hide();
      }
    }
  }
};
</script>
