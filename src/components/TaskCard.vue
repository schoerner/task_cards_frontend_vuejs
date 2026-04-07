<template>
  <div class="col-12">
    <div class="card shadow-sm h-100" :class="cardClass">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-start gap-2 mb-2">
          <h5 class="card-title mb-0">{{ task.title }}</h5>
          <span class="badge" :class="priorityBadgeClass(task.priority)">
            {{ task.priority || 'MEDIUM' }}
          </span>
        </div>

        <p class="card-text small text-muted mb-2">
          {{ shortDescription }}
        </p>

        <div class="small mb-3">
          <div>
            <strong>Projekt:</strong> {{ task.project?.name || '—' }}
          </div>
          <div>
            <strong>Getrackt:</strong> {{ task.trackedMinutes ?? 0 }} Min.
          </div>
          <div v-if="task.dueDate">
            <strong>Fällig:</strong> {{ formatDate(task.dueDate) }}
          </div>
          <div>
            <strong>Status:</strong>
            <span class="badge ms-1" :class="isActive ? 'text-bg-success' : 'text-bg-secondary'">
              {{ isActive ? 'Tracking aktiv' : 'Inaktiv' }}
            </span>
          </div>
        </div>

        <div class="d-flex flex-wrap gap-2 mb-2">
          <button
              class="btn btn-sm"
              :class="isActive ? 'btn-outline-danger' : 'btn-outline-success'"
              @click.stop="toggleTimeTracking"
              :disabled="busy"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-stopwatch" viewBox="0 0 16 16">
              <path d="M8.5 5.6a.5.5 0 1 0-1 0v2.9h-3a.5.5 0 0 0 0 1H8a.5.5 0 0 0 .5-.5z"/>
              <path d="M6.5 1A.5.5 0 0 1 7 .5h2a.5.5 0 0 1 0 1v.57c1.36.196 2.594.78 3.584 1.64l.012-.013.354-.354-.354-.353a.5.5 0 0 1 .707-.708l1.414 1.415a.5.5 0 1 1-.707.707l-.353-.354-.354.354-.013.012A7 7 0 1 1 7 2.071V1.5a.5.5 0 0 1-.5-.5M8 3a6 6 0 1 0 .001 12A6 6 0 0 0 8 3"/>
            </svg>
            {{ isActive ? 'Stop' : 'Start' }}
          </button>

          <button
              class="btn btn-sm btn-outline-primary"
              @click.stop="editTask"
          >
            Bearbeiten
          </button>

          <button
              class="btn btn-sm btn-outline-danger"
              @click.stop="deleteTask"
          >
            Löschen
          </button>
        </div>

        <div class="mt-2">
          <label class="form-label form-label-sm">Verschieben nach</label>
          <select
              class="form-select form-select-sm"
              :value="task.boardColumn?.id ?? ''"
              @change="onMoveChange"
              :disabled="busy"
          >
            <option
                v-for="column in boardColumns"
                :key="column.id"
                :value="column.id"
            >
              {{ column.name }}
            </option>
          </select>
        </div>

        <div v-if="errorMessage" class="alert alert-danger mt-3 mb-0 py-2 small">
          {{ errorMessage }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import TaskService from '@/services/task.service.js';

export default {
  name: 'TaskCard',
  props: {
    task: {
      type: Object,
      required: true
    },
    boardColumns: {
      type: Array,
      default: () => []
    }
  },
  emits: [
    'edit-task',
    'delete-task',
    'move-task',
    'time-tracking-changed'
  ],
  data() {
    return {
      isActive: !!this.task.active,
      busy: false,
      errorMessage: ''
    };
  },
  watch: {
    task: {
      deep: true,
      immediate: true,
      handler(newTask) {
        this.isActive = !!newTask?.active;
      }
    }
  },
  computed: {
    shortDescription() {
      if (!this.task.description) {
        return 'Keine Beschreibung';
      }

      if (this.task.description.length <= 140) {
        return this.task.description;
      }

      return `${this.task.description.slice(0, 140)}...`;
    },
    cardClass() {
      return this.isActive ? 'border-success' : 'border-light';
    }
  },
  methods: {
    priorityBadgeClass(priority) {
      switch (priority) {
        case 'LOW':
          return 'text-bg-secondary';
        case 'MEDIUM':
          return 'text-bg-primary';
        case 'HIGH':
          return 'text-bg-warning';
        case 'URGENT':
          return 'text-bg-danger';
        default:
          return 'text-bg-primary';
      }
    },

    formatDate(value) {
      try {
        return new Date(value).toLocaleString('de-DE');
      } catch {
        return value;
      }
    },

    async toggleTimeTracking() {
      this.busy = true;
      this.errorMessage = '';

      try {
        if (this.isActive) {
          const response = await TaskService.stopTimeTracking(this.task.id);
          this.isActive = !!response.data?.active;
        } else {
          const response = await TaskService.startTimeTracking(this.task.id);
          this.isActive = !!response.data?.active;
        }

        this.$emit('time-tracking-changed', this.task.id);
      } catch (error) {
        this.errorMessage =
            error?.response?.data?.message ||
            error?.response?.data ||
            error?.message ||
            'Fehler beim Umschalten des Zeittrackings.';
      } finally {
        this.busy = false;
      }
    },

    onMoveChange(event) {
      const boardColumnId = Number(event.target.value);
      if (!boardColumnId || boardColumnId === this.task.boardColumn?.id) {
        return;
      }

      this.$emit('move-task', {
        taskId: this.task.id,
        boardColumnId
      });
    },

    editTask() {
      this.$emit('edit-task', this.task);
    },

    deleteTask() {
      this.$emit('delete-task', this.task);
    }
  }
};
</script>