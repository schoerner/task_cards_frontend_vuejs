<template>
  <div
      class="card shadow-sm h-100 task-board-card"
      :class="{
      'border-success active-task-card': isActive,
      'border-light': !isActive,
      'opacity-75': busy
    }"
  >
    <div class="card-body p-3">
      <div class="d-flex justify-content-between align-items-start gap-2 mb-2">
        <div class="d-flex align-items-start gap-2 flex-grow-1 min-w-0">
          <button
              class="btn btn-sm btn-light drag-handle"
              type="button"
              draggable="true"
              title="Task verschieben"
              @dragstart="onDragStart"
              @dragend="onDragEnd"
              @click.stop
          >
            ⠿
          </button>

          <div class="flex-grow-1 min-w-0">
            <div class="fw-semibold text-truncate" :title="task.title">
              {{ task.title }}
            </div>

            <div class="small text-muted text-truncate" v-if="shortDescription">
              {{ shortDescription }}
            </div>
          </div>
        </div>

        <div class="d-flex flex-column align-items-end gap-1">
          <button
              class="btn btn-sm btn-light favorite-btn"
              type="button"
              :title="task.favorite ? 'Favorit entfernen' : 'Als Favorit markieren'"
              @click.stop="$emit('toggle-favorite', task)"
          >
            <i :class="task.favorite ? 'bi bi-star-fill text-warning' : 'bi bi-star'"></i>
          </button>

          <span class="badge" :class="priorityBadgeClass(task.priority)">
            {{ task.priority || 'MEDIUM' }}
          </span>

          <span
              v-if="isActive"
              class="badge text-bg-success"
          >
            aktiv
          </span>
        </div>
      </div>

      <div class="small text-muted mb-3">
        <div v-if="task.dueDate">
          <strong>Fällig:</strong> {{ formatDate(task.dueDate) }}
        </div>
        <div>
          <strong>Getrackt:</strong> {{ task.trackedMinutes ?? 0 }} Min.
        </div>
      </div>

      <div class="d-flex flex-wrap gap-2">
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
            @click.stop="$emit('open-details', task)"
            title="Details öffnen"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-box-arrow-in-down-right me-1" viewBox="0 0 16 16">
            <path fill-rule="evenodd" d="M6.364 13.364a.5.5 0 0 1 0-.707L11.293 7.5H8.5a.5.5 0 0 1 0-1h4a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-1 0V8.207l-4.929 4.93a.5.5 0 0 1-.707 0"/>
            <path fill-rule="evenodd" d="M13.5 3a.5.5 0 0 0-.5-.5h-10A1.5 1.5 0 0 0 1.5 4v9A1.5 1.5 0 0 0 3 14.5h9a1.5 1.5 0 0 0 1.5-1.5zM13 3.5a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5H3a.5.5 0 0 1-.5-.5V4a.5.5 0 0 1 .5-.5z"/>
          </svg>
          Details
        </button>
      </div>

      <div v-if="errorMessage" class="alert alert-danger py-2 px-2 mt-3 mb-0 small">
        {{ errorMessage }}
      </div>
    </div>
  </div>
</template>

<script>
import TaskService from '@/services/task.service.js';

export default {
  name: 'TaskBoardCard',
  props: {
    task: {
      type: Object,
      required: true
    }
  },
  emits: ['open-details', 'time-tracking-changed', 'drag-started', 'drag-ended', 'toggle-favorite'],
  data() {
    return {
      busy: false,
      errorMessage: '',
      isActive: !!this.task?.active
    };
  },
  computed: {
    shortDescription() {
      if (!this.task?.description) {
        return '';
      }

      return this.task.description.length > 90
          ? `${this.task.description.slice(0, 90)}...`
          : this.task.description;
    }
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
        let response;

        if (this.isActive) {
          response = await TaskService.stopTimeTracking(this.task.id);
        } else {
          response = await TaskService.startTimeTracking(this.task.id);
        }

        this.isActive = !!response.data?.active;
        this.$emit('time-tracking-changed', this.task.id);
      } catch (error) {
        this.errorMessage =
            error?.response?.data?.message ||
            error?.response?.data ||
            error?.message ||
            'Zeittracking konnte nicht geändert werden.';
      } finally {
        this.busy = false;
      }
    },

    onDragStart(event) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', String(this.task.id));
      this.$emit('drag-started', this.task);
    },

    onDragEnd() {
      this.$emit('drag-ended', this.task);
    }
  }
};
</script>

<style scoped>
.task-board-card {
  transition: box-shadow 0.15s ease, border-color 0.15s ease, transform 0.15s ease;
}

.task-board-card:hover {
  transform: translateY(-1px);
}

.active-task-card {
  background: rgba(25, 135, 84, 0.12);
  box-shadow: 0 0.35rem 0.95rem rgba(25, 135, 84, 0.22);
}

.drag-handle {
  cursor: grab;
  line-height: 1;
  user-select: none;
}

.drag-handle:active {
  cursor: grabbing;
}

.min-w-0 {
  min-width: 0;
}

.favorite-btn {
  line-height: 1;
  padding: 0.2rem 0.45rem;
}
</style>