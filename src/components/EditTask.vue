<template>
  <div class="container">
    <div v-if="errorMessage" class="alert alert-danger" role="alert">
      {{ errorMessage }}
    </div>

    <form v-if="localTask" @submit.prevent="saveEditedTask">
      <div class="row mb-3">
        <label for="taskTitle" class="col-sm-3 col-form-label">Titel</label>
        <div class="col-sm-9">
          <input
              id="taskTitle"
              ref="editTaskTitle"
              v-model.trim="localTask.title"
              class="form-control"
              maxlength="255"
              required
          />
        </div>
      </div>

      <div class="row mb-3">
        <label for="taskDescription" class="col-sm-3 col-form-label">Beschreibung</label>
        <div class="col-sm-9">
          <textarea
              id="taskDescription"
              v-model.trim="localTask.description"
              rows="4"
              maxlength="20000"
              class="form-control"
          ></textarea>
        </div>
      </div>

      <div class="row mb-3">
        <label for="taskPriority" class="col-sm-3 col-form-label">Priorität</label>
        <div class="col-sm-9">
          <select id="taskPriority" v-model="localTask.priority" class="form-select">
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
            <option value="URGENT">URGENT</option>
          </select>
        </div>
      </div>

      <div class="row mb-3">
        <label for="taskDueDate" class="col-sm-3 col-form-label">Fällig bis</label>
        <div class="col-sm-9">
          <input
              id="taskDueDate"
              v-model="localTask.dueDate"
              type="datetime-local"
              class="form-control"
          />
        </div>
      </div>

      <div class="row mb-3">
        <label for="taskEstimatedMinutes" class="col-sm-3 col-form-label">Schätzung (Min.)</label>
        <div class="col-sm-9">
          <input
              id="taskEstimatedMinutes"
              v-model.number="localTask.estimatedMinutes"
              type="number"
              min="0"
              class="form-control"
          />
        </div>
      </div>

      <div class="row mb-3">
        <label for="taskBoardColumn" class="col-sm-3 col-form-label">Spalte</label>
        <div class="col-sm-9">
          <select id="taskBoardColumn" v-model="localTask.boardColumnId" class="form-select">
            <option v-for="column in sortedBoardColumns" :key="column.id" :value="column.id">
              {{ column.name }}
            </option>
          </select>
        </div>
      </div>

      <div class="form-check mb-3">
        <input
            id="taskArchived"
            v-model="localTask.archived"
            class="form-check-input"
            type="checkbox"
        />
        <label class="form-check-label" for="taskArchived">
          Task archiviert
        </label>
      </div>

      <div class="d-flex justify-content-between">
        <div>
          <button class="btn btn-primary" type="submit" :disabled="saving">
            {{ saving ? 'Speichert...' : 'Speichern' }}
          </button>
          <button class="btn btn-secondary ms-2" type="button" @click="$emit('cancelled-edit')">
            Abbrechen
          </button>
        </div>
        <div>
          <button type="button" class="btn btn-danger" @click="deleteTask">
            Löschen
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import BoardColumnService from '@/services/board-column.service.js';
import TaskService from '@/services/task.service.js';

export default {
  name: 'EditTask',
  props: {
    task: {
      type: Object,
      required: true
    }
  },
  emits: ['saved-edit', 'cancelled-edit', 'deleted'],
  data() {
    return {
      saving: false,
      errorMessage: '',
      boardColumns: [],
      localTask: null
    };
  },
  computed: {
    sortedBoardColumns() {
      return [...this.boardColumns].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
    }
  },
  async mounted() {
    this.localTask = {
      id: this.task.id,
      title: this.task.title || '',
      description: this.task.description || '',
      priority: this.task.priority || 'MEDIUM',
      dueDate: this.toLocalDateTime(this.task.dueDate),
      estimatedMinutes: this.task.estimatedMinutes ?? 0,
      trackedMinutes: this.task.trackedMinutes ?? 0,
      boardColumnId: this.task.boardColumn?.id ?? null,
      archived: !!this.task.archived,
      projectId: this.task.project?.id ?? null
    };

    if (this.localTask.projectId) {
      await this.loadBoardColumns(this.localTask.projectId);
    }

    this.$nextTick(() => {
      this.$refs.editTaskTitle?.focus();
    });
  },
  methods: {
    async loadBoardColumns(projectId) {
      try {
        const response = await BoardColumnService.getBoardColumns(projectId);
        this.boardColumns = response.data || [];
      } catch (error) {
        this.errorMessage =
            error?.response?.data?.message ||
            error?.response?.data ||
            error?.message ||
            'Board-Spalten konnten nicht geladen werden.';
      }
    },

    async saveEditedTask() {
      this.saving = true;
      this.errorMessage = '';

      try {
        const payload = {
          title: this.localTask.title,
          description: this.localTask.description || null,
          boardColumnId: this.localTask.boardColumnId ? Number(this.localTask.boardColumnId) : null,
          priority: this.localTask.priority,
          dueDate: this.localTask.dueDate ? new Date(this.localTask.dueDate).toISOString() : null,
          estimatedMinutes: Number(this.localTask.estimatedMinutes || 0),
          trackedMinutes: Number(this.localTask.trackedMinutes || 0),
          archived: !!this.localTask.archived,
          assigneeIds: [],
          labelIds: []
        };

        const response = await TaskService.updateTask(this.localTask.id, payload);
        this.$emit('saved-edit', true, 'Task wurde aktualisiert.', response.data);
      } catch (error) {
        this.errorMessage =
            error?.response?.data?.message ||
            error?.response?.data ||
            error?.message ||
            'Task konnte nicht gespeichert werden.';
        this.$emit('saved-edit', false, this.errorMessage);
      } finally {
        this.saving = false;
      }
    },

    async deleteTask() {
      try {
        await TaskService.deleteTask(this.localTask.id);
        this.$emit('deleted', this.localTask.id);
      } catch (error) {
        this.errorMessage =
            error?.response?.data?.message ||
            error?.response?.data ||
            error?.message ||
            'Task konnte nicht gelöscht werden.';
      }
    },

    toLocalDateTime(value) {
      if (!value) {
        return '';
      }

      const date = new Date(value);
      if (Number.isNaN(date.getTime())) {
        return '';
      }

      const pad = (number) => String(number).padStart(2, '0');

      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
    }
  }
};
</script>