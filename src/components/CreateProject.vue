<template>
  <div>
    <form @submit.prevent="createProject">
      <div class="mb-3">
        <label for="projectName" class="form-label">Projektname</label>
        <input
            id="projectName"
            v-model.trim="form.name"
            type="text"
            class="form-control"
            maxlength="150"
            required
        >
      </div>

      <div class="mb-3">
        <label for="projectDescription" class="form-label">Beschreibung</label>
        <textarea
            id="projectDescription"
            v-model.trim="form.description"
            rows="4"
            maxlength="5000"
            class="form-control"
        ></textarea>
      </div>

      <div v-if="errorMessage" class="alert alert-danger">
        {{ errorMessage }}
      </div>

      <div class="d-flex justify-content-end gap-2">
        <button type="button" class="btn btn-secondary" @click="$emit('cancelled')">
          Abbrechen
        </button>
        <button type="submit" class="btn btn-primary" :disabled="saving">
          {{ saving ? 'Speichert...' : 'Anlegen' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import ProjectService from '@/services/project.service.js';

export default {
  name: 'CreateProject',
  emits: ['created', 'cancelled'],
  data() {
    return {
      saving: false,
      errorMessage: '',
      form: {
        name: '',
        description: ''
      }
    };
  },
  methods: {
    async createProject() {
      this.saving = true;
      this.errorMessage = '';

      try {
        const payload = {
          name: this.form.name,
          description: this.form.description || null
        };

        const response = await ProjectService.createProject(payload);
        this.$emit('created', response.data);

        this.form = {
          name: '',
          description: ''
        };
      } catch (error) {
        this.errorMessage =
            error?.response?.data?.message ||
            error?.response?.data ||
            error?.message ||
            'Projekt konnte nicht angelegt werden.';
      } finally {
        this.saving = false;
      }
    }
  }
};
</script>