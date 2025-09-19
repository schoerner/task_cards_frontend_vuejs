<template>
  <div class="container py‑4">
    <table class="table table-striped">
      <thead>
      <tr>
        <th @click="sort('id')" style="cursor: pointer">
          ID <small v-if="sortBy === 'id'">{{ sortDesc ? '↓' : '↑' }}</small>
        </th>
        <th @click="sort('name')" style="cursor: pointer">
          Name <small v-if="sortBy === 'name'">{{ sortDesc ? '↓' : '↑' }}</small>
        </th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="project in sortedProjects" :key="project.id">
        <td>{{ project.id }}</td>
        <td>{{ project.name }}</td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import { Modal } from 'bootstrap';
import ProjectService from '@/services/project.service.js';

export default {
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
          .getMyProjects(this.currentUser.id)
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
    }
  }
};
</script>
