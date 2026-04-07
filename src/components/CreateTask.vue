<template>
  <div class="container py-4">
    <div class="mb-4">
      <h2 class="mb-1">Task anlegen</h2>
      <p class="text-muted mb-0">Neue projektbezogene Task nach dem neuen Backend-Modell anlegen.</p>
    </div>

    <div v-if="successMessage" class="alert alert-success" role="alert">
      {{ successMessage }}
    </div>

    <div v-if="errorMessage" class="alert alert-danger" role="alert">
      {{ errorMessage }}
    </div>

    <form @submit.prevent="createTask" class="card shadow-sm">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-12">
            <label for="title" class="form-label">Titel</label>
            <input
                id="title"
                ref="newItemTitleRef"
                v-model.trim="form.title"
                type="text"
                class="form-control"
                maxlength="255"
                required
            >
          </div>

          <div class="col-12">
            <label for="description" class="form-label">Beschreibung</label>
            <textarea
                id="description"
                v-model.trim="form.description"
                rows="4"
                maxlength="20000"
                class="form-control"
            ></textarea>
          </div>

          <div class="col-md-6">
            <label for="projectSelect" class="form-label">Projekt</label>
            <select
                id="projectSelect"
                v-model="form.projectId"
                class="form-select"
                required
                @change="loadBoardColumns"
            >
              <option :value="null" disabled>-- Projekt auswählen --</option>
              <option v-for="project in activeProjects" :key="project.id" :value="project.id">
                {{ project.name }}
              </option>
            </select>
          </div>

          <div class="col-md-6">
            <label for="boardColumnSelect" class="form-label">Spalte</label>
            <select
                id="boardColumnSelect"
                v-model="form.boardColumnId"
                class="form-select"
            >
              <option :value="null">Automatisch / Standardspalte</option>
              <option v-for="column in sortedBoardColumns" :key="column.id" :value="column.id">
                {{ column.name }}
              </option>
            </select>
          </div>

          <div class="col-md-4">
            <label for="priority" class="form-label">Priorität</label>
            <select id="priority" v-model="form.priority" class="form-select">
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
              <option value="URGENT">URGENT</option>
            </select>
          </div>

          <div class="col-md-4">
            <label for="dueDate" class="form-label">Fällig bis</label>
            <input
                id="dueDate"
                v-model="form.dueDate"
                type="datetime-local"
                class="form-control"
            >
          </div>

          <div class="col-md-4">
            <label for="estimatedMinutes" class="form-label">Schätzung (Min.)</label>
            <input
                id="estimatedMinutes"
                v-model.number="form.estimatedMinutes"
                type="number"
                min="0"
                class="form-control"
            >
          </div>
        </div>
      </div>

      <div class="card-footer d-flex gap-2">
        <button class="btn btn-primary" type="submit" :disabled="saving">
          {{ saving ? 'Speichert...' : 'Task anlegen' }}
        </button>
        <button class="btn btn-secondary" type="button" @click="resetForm">
          Zurücksetzen
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import ProjectService from '@/services/project.service.js';
import BoardColumnService from '@/services/board-column.service.js';
import TaskService from '@/services/task.service.js';

export default {
  name: 'CreateTask',
  emits: ['saved-add', 'cancelled-add'],
  data() {
    return {
      saving: false,
      errorMessage: '',
      successMessage: '',
      projects: [],
      boardColumns: [],
      form: this.emptyForm()
    };
  },
  computed: {
    activeProjects() {
      return this.projects.filter(project => !project.archived);
    },
    sortedBoardColumns() {
      return [...this.boardColumns].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
    }
  },
  async mounted() {
    this.$refs.newItemTitleRef?.focus();
    await this.loadProjects();

    const routeProjectId = this.$route.query.projectId;
    if (routeProjectId && this.activeProjects.some(project => Number(project.id) === Number(routeProjectId))) {
      this.form.projectId = Number(routeProjectId);
      await this.loadBoardColumns();
    }
  },
  methods: {
    emptyForm() {
      return {
        title: '',
        description: '',
        projectId: null,
        boardColumnId: null,
        priority: 'MEDIUM',
        dueDate: '',
        estimatedMinutes: 0
      };
    },

    async loadProjects() {
      try {
        const response = await ProjectService.getVisibleProjects();
        this.projects = response.data || [];
      } catch (error) {
        this.errorMessage =
            error?.response?.data?.message ||
            error?.response?.data ||
            error?.message ||
            'Projekte konnten nicht geladen werden.';
      }
    },

    async loadBoardColumns() {
      this.boardColumns = [];
      this.form.boardColumnId = null;

      if (!this.form.projectId) {
        return;
      }

      try {
        const response = await BoardColumnService.getBoardColumns(this.form.projectId);
        this.boardColumns = response.data || [];
      } catch (error) {
        this.errorMessage =
            error?.response?.data?.message ||
            error?.response?.data ||
            error?.message ||
            'Board-Spalten konnten nicht geladen werden.';
      }
    },

    async createTask() {
      this.saving = true;
      this.errorMessage = '';
      this.successMessage = '';

      try {
        const payload = {
          projectId: Number(this.form.projectId),
          boardColumnId: this.form.boardColumnId ? Number(this.form.boardColumnId) : null,
          title: this.form.title,
          description: this.form.description || null,
          priority: this.form.priority,
          dueDate: this.form.dueDate ? new Date(this.form.dueDate).toISOString() : null,
          estimatedMinutes: Number(this.form.estimatedMinutes || 0),
          assigneeIds: [],
          labelIds: []
        };

        const response = await TaskService.createTask(payload);
        this.successMessage = 'Task wurde erfolgreich angelegt.';
        this.$emit('saved-add', true, response.data);
        this.resetForm();

        if (payload.projectId) {
          this.$router.push({
            path: '/boards',
            query: { projectId: payload.projectId }
          });
        }
      } catch (error) {
        this.errorMessage =
            error?.response?.data?.message ||
            error?.response?.data ||
            error?.message ||
            'Task konnte nicht angelegt werden.';
        this.$emit('saved-add', false, this.errorMessage);
      } finally {
        this.saving = false;
      }
    },

    resetForm() {
      const currentProjectId = this.form.projectId;
      this.form = this.emptyForm();
      this.form.projectId = currentProjectId;
    }
  }
};
</script>