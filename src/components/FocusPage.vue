<template>
  <div class="container py-3">
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
      <h3 class="mb-0">Focus</h3>

      <div class="d-none d-md-flex align-items-center gap-2">
        <label class="form-label mb-0">Anzahl</label>
        <select v-model.number="selectedLimit" class="form-select form-select-sm" style="width: auto;">
          <option :value="10">10</option>
          <option :value="20">20</option>
          <option :value="50">50</option>
        </select>
      </div>
    </div>

    <div v-if="errorMessage" class="alert alert-danger">
      {{ errorMessage }}
    </div>

    <div v-else-if="loading" class="text-muted">
      Focus-Tasks werden geladen...
    </div>

    <div v-else-if="tasks.length === 0" class="alert alert-info">
      Keine Focus-Tasks gefunden.
    </div>

    <div v-else class="row g-3">
      <div
          v-for="task in tasks"
          :key="task.id"
          class="col-12 col-md-6 col-xl-4"
      >
        <div
            class="card h-100 shadow-sm focus-task-card"
            :class="{
              'border-success active-focus-task-card': task.active
            }"
            role="button"
            @click="toggleTracking(task)"
        >
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start gap-2 mb-2">
              <h5 class="card-title mb-0 focus-task-title">{{ task.title }}</h5>
              <div class="d-flex align-items-center gap-2 flex-shrink-0">
                <i :class="task.favorite ? 'bi bi-star-fill text-warning' : 'bi bi-star text-muted'"></i>
                <button
                    type="button"
                    class="btn btn-sm btn-outline-secondary focus-detail-button"
                    title="Task-Details öffnen"
                    aria-label="Task-Details öffnen"
                    @click.stop="openTaskDetails(task)"
                >
                  <i class="bi bi-box-arrow-up-right"></i>
                </button>
              </div>
            </div>

            <div class="d-flex flex-wrap gap-2 small text-muted focus-task-meta">
              <span class="badge rounded-pill text-bg-light border" :title="`Priorität: ${priorityLabel(task.priority)}`">
                <i :class="priorityIcon(task.priority)"></i>
              </span>
              <span class="badge rounded-pill text-bg-light border" :title="`Getrackt: ${task.trackedMinutes ?? 0} Minuten`">
                <i class="bi bi-stopwatch me-1"></i>{{ formatTrackedMinutes(task.trackedMinutes) }}
              </span>
              <span v-if="task.startAt" class="badge rounded-pill text-bg-light border" :title="`Start: ${formatDate(task.startAt)}`">
                <i class="bi bi-play-circle me-1"></i>{{ formatCompactDate(task.startAt) }}
              </span>
              <span v-if="task.dueDate" class="badge rounded-pill text-bg-light border" :title="`Fällig: ${formatDate(task.dueDate)}`">
                <i class="bi bi-calendar-event me-1"></i>{{ formatCompactDate(task.dueDate) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <task-details-modal
        ref="taskDetailsModal"
        @task-updated="loadTasks"
        @task-deleted="loadTasks"
    />
  </div>
</template>

<script>
import TaskService from '@/services/task.service.js';
import TaskDetailsModal from '@/components/TaskDetailsModal.vue';

export default {
  name: 'FocusPage',
  components: {
    TaskDetailsModal
  },
  data() {
    return {
      tasks: [],
      loading: false,
      errorMessage: '',
      selectedLimit: 10,
      isMobile: window.innerWidth < 768
    };
  },
  computed: {
    effectiveLimit() {
      return this.isMobile ? 10 : this.selectedLimit;
    }
  },
  async mounted() {
    window.addEventListener('resize', this.onResize);
    await this.loadTasks();
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.onResize);
  },
  watch: {
    effectiveLimit() {
      this.loadTasks();
    }
  },
  methods: {
    onResize() {
      this.isMobile = window.innerWidth < 768;
    },

    async loadTasks() {
      this.loading = true;
      this.errorMessage = '';

      try {
        const response = await TaskService.getFocusTasks(this.effectiveLimit);
        this.tasks = [...(response.data || [])].sort((a, b) => {
          if (!!a.favorite !== !!b.favorite) {
            return a.favorite ? -1 : 1;
          }

          if (!!a.active !== !!b.active) {
            return a.active ? -1 : 1;
          }

          return (a.id ?? 0) - (b.id ?? 0);
        });
      } catch (error) {
        this.errorMessage =
            error?.response?.data?.detail ||
            error?.response?.data?.message ||
            error?.message ||
            'Focus-Tasks konnten nicht geladen werden.';
      } finally {
        this.loading = false;
      }
    },

    async toggleTracking(task) {
      try {
        if (task.active) {
          await TaskService.stopTimeTracking(task.id);
        } else {
          await TaskService.startTimeTracking(task.id);
        }

        await this.loadTasks();
      } catch (error) {
        this.errorMessage =
            error?.response?.data?.detail ||
            error?.response?.data?.message ||
            error?.message ||
            'Task konnte nicht aktiviert werden.';
      }
    },

    async openTaskDetails(task) {
      try {
        await this.$refs.taskDetailsModal.open(task.id);
      } catch (error) {
        this.errorMessage =
            error?.response?.data?.detail ||
            error?.response?.data?.message ||
            error?.message ||
            'Task-Details konnten nicht geöffnet werden.';
      }
    },

    priorityIcon(priority) {
      switch (priority) {
        case 'HIGH':
          return 'bi bi-exclamation-triangle-fill text-danger';
        case 'MEDIUM':
          return 'bi bi-exclamation-circle-fill text-warning';
        case 'LOW':
          return 'bi bi-arrow-down-circle text-success';
        default:
          return 'bi bi-circle text-muted';
      }
    },

    priorityLabel(priority) {
      switch (priority) {
        case 'HIGH':
          return 'Hoch';
        case 'MEDIUM':
          return 'Mittel';
        case 'LOW':
          return 'Niedrig';
        default:
          return priority || 'Unbekannt';
      }
    },

    formatCompactDate(value) {
      try {
        return new Date(value).toLocaleString('de-DE', {
          day: '2-digit',
          month: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch {
        return value;
      }
    },

    formatTrackedMinutes(value) {
      const minutes = Number(value || 0);
      return `${minutes} Min.`;
    },

    formatDate(value) {
      try {
        return new Date(value).toLocaleString('de-DE');
      } catch {
        return value;
      }
    }
  }
};
</script>

<style scoped>
.focus-task-card {
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.focus-task-card:hover {
  transform: translateY(-2px);
}

.active-focus-task-card {
  background: rgba(25, 135, 84, 0.14);
  box-shadow: 0 0.35rem 1rem rgba(25, 135, 84, 0.22);
}

.focus-task-title {
  line-height: 1.35;
}

.focus-task-meta .badge {
  font-weight: 500;
}

.focus-detail-button {
  min-width: 2rem;
}
</style>
