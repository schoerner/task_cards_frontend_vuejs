<template>
  <div>
    <form @submit.prevent="createProject">
      <div class="mb-3">
        <label for="projectName" class="form-label">Project Name</label>
        <input type="text" class="form-control" id="projectName" v-model="projectName" required>
      </div>
      <div v-if="errorMessage" class="alert alert-danger">
        {{ errorMessage }}
      </div>
      <div class="d-flex justify-content-end">
        <button type="button" class="btn btn-secondary me-2" @click="$emit('cancelled')">Cancel</button>
        <button type="submit" class="btn btn-primary">Create</button>
      </div>
    </form>
  </div>
</template>

<script>
import ProjectService from '@/services/project.service.js';

export default {
  name: 'CreateProject',
  data() {
    return {
      projectName: '',
      errorMessage: ''
    };
  },
  emits: ['created', 'cancelled'],
  computed: {
    currentUser() {
      return this.$store.state.auth.user;
    }
  },
  methods: {
    async createProject() {
      const newProject = {
        name: this.projectName,
        creator: {id: this.currentUser.id},
        users: [{id: this.currentUser.id}]
      }

      try {
        const response = await ProjectService.createProject(newProject);
        this.$emit('created', response.data); // Gibt das neue Projekt an den Parent zurück
        this.projectName = '';
        this.errorMessage = '';
      } catch (error) {
        this.errorMessage = error.response?.data?.message || error.message || 'An unknown error occurred.';
      }
    }
  }
};
</script>

<style scoped>
</style>
