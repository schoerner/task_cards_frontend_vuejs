<template>
  <div class="container py-4">
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
      <div>
        <h2 class="mb-1">Kalender</h2>
        <p class="text-muted mb-0">
          Gesamtübersicht aller terminierten Tasks des angemeldeten Benutzers.
        </p>
      </div>

      <div class="d-flex flex-wrap gap-2 align-items-center">
        <div class="btn-group" role="group" aria-label="Ansicht wählen">
          <button
              v-for="mode in viewModes"
              :key="mode.value"
              type="button"
              class="btn"
              :class="selectedView === mode.value ? 'btn-primary' : 'btn-outline-primary'"
              @click="selectedView = mode.value"
          >
            {{ mode.label }}
          </button>
        </div>

        <button type="button" class="btn btn-outline-secondary" @click="goToToday">
          Heute
        </button>
        <button type="button" class="btn btn-outline-secondary" @click="shiftRange(-1)">
          ←
        </button>
        <button type="button" class="btn btn-outline-secondary" @click="shiftRange(1)">
          →
        </button>
        <button type="button" class="btn btn-outline-secondary" @click="loadCalendarTasks" :disabled="loading">
          Neu laden
        </button>
      </div>
    </div>

    <div v-if="errorMessage" class="alert alert-danger alert-dismissible fade show" role="alert">
      {{ errorMessage }}
      <button type="button" class="btn-close" @click="errorMessage = ''"></button>
    </div>

    <div class="card shadow-sm">
      <div class="card-body">
        <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
          <h5 class="mb-0">{{ currentRangeLabel }}</h5>
          <span class="text-muted small">{{ visibleTasks.length }} Task(s) im sichtbaren Zeitraum</span>
        </div>

        <div v-if="loading" class="text-muted">Kalender wird geladen...</div>

        <template v-else>
          <div v-if="selectedView === 'month'" class="month-grid">
            <div v-for="weekday in weekdayLabels" :key="weekday" class="month-weekday">
              {{ weekday }}
            </div>

            <div
                v-for="day in monthCells"
                :key="day.dateKey"
                class="month-cell"
                :class="{
                'is-outside': !day.isCurrentMonth,
                'is-today': day.isToday
              }"
            >
              <div class="month-cell-header">
                <span class="fw-semibold">{{ day.dayNumber }}</span>
                <span v-if="day.tasks.length" class="badge text-bg-light">{{ day.tasks.length }}</span>
              </div>

              <div v-if="day.tasks.length === 0" class="text-muted small">—</div>

              <div v-else class="d-flex flex-column gap-2">
                <div
                    v-for="task in day.tasks"
                    :key="task.id"
                    class="calendar-task-card calendar-task-clickable"
                    :class="{
                    'calendar-task-archived': task.archived,
                    'calendar-task-active': task.active
                  }"
                    @click="openTask(task)"
                >
                  <div class="fw-semibold small text-truncate">{{ task.title }}</div>
                  <div class="small text-muted text-truncate">{{ task.boardColumnName || 'Ohne Spalte' }}</div>
                  <div class="mt-1 d-flex flex-wrap gap-1">
                    <span class="badge rounded-pill text-bg-secondary">{{ task.projectName }}</span>
                    <span v-if="task.active" class="badge rounded-pill text-bg-success">Aktiv</span>
                    <span v-if="task.archived" class="badge rounded-pill text-bg-dark">Archiviert</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="list-groups-wrapper">
            <div v-for="group in groupedVisibleTasks" :key="group.key" class="mb-4">
              <h6 class="border-bottom pb-2 mb-3">{{ group.label }}</h6>

              <div v-if="group.tasks.length === 0" class="text-muted small">Keine Tasks in diesem Zeitraum.</div>

              <div v-else class="d-flex flex-column gap-2">
                <div
                    v-for="task in group.tasks"
                    :key="task.id"
                    class="calendar-task-list-item calendar-task-clickable"
                    :class="{
                    'calendar-task-archived': task.archived,
                    'calendar-task-active': task.active
                  }"
                    @click="openTask(task)"
                >
                  <div class="d-flex flex-wrap justify-content-between gap-2">
                    <div>
                      <div class="fw-semibold">{{ task.title }}</div>
                      <div class="small text-muted">
                        {{ formatTaskRange(task) }} · {{ task.boardColumnName || 'Ohne Spalte' }}
                      </div>
                    </div>

                    <div class="d-flex flex-wrap gap-1 align-items-start justify-content-end">
                      <span class="badge rounded-pill text-bg-secondary">{{ task.projectName }}</span>
                      <span v-if="task.active" class="badge rounded-pill text-bg-success">Aktiv</span>
                      <span v-if="task.archived" class="badge rounded-pill text-bg-dark">Archiviert</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="!loading && visibleTasks.length === 0" class="alert alert-info mb-0 mt-3">
            Im aktuellen Zeitraum gibt es keine terminierten Tasks.
          </div>
        </template>
      </div>
    </div>


    <div class="card shadow-sm mt-4">
      <div class="card-body">
        <h5 class="mb-1">Externer Kalender-Link</h5>
        <p class="text-muted mb-3">
          Diesen Read-only-Link kannst du z. B. in Thunderbird als Netzwerk-Kalender abonnieren.
        </p>

        <div class="w-100 d-flex flex-column gap-2">
          <div class="fw-semibold">Aktueller Link:</div>

          <div v-if="feedLinkInfo.tokenGenerated && feedLinkInfo.feedUrl" class="d-flex flex-column flex-lg-row align-items-stretch gap-2 w-100">
            <div class="p-2 border rounded bg-light text-break flex-grow-1 d-flex align-items-center min-link-box">
              {{ feedLinkInfo.feedUrl }}
            </div>

            <div class="d-flex flex-wrap align-items-center gap-2">
              <button
                  type="button"
                  class="btn btn-outline-secondary"
                  @click="copyFeedUrl"
                  :disabled="feedBusy"
                  title="Link kopieren"
              >
                <i class="bi bi-copy"></i>
              </button>

              <button
                  type="button"
                  class="btn btn-outline-primary"
                  @click="regenerateFeedLink"
                  :disabled="feedBusy"
              >
                <i
                    :class="feedLinkInfo.tokenGenerated ? 'bi bi-arrow-clockwise' : 'bi bi-plus-circle'"
                    class="me-1"
                ></i>
                {{ feedLinkInfo.tokenGenerated ? 'Token neu generieren' : 'Link erzeugen' }}
              </button>
            </div>
          </div>

          <div v-else class="d-flex flex-column flex-lg-row align-items-stretch gap-2 w-100">
            <div class="p-2 border rounded bg-light text-muted flex-grow-1 d-flex align-items-center min-link-box">
              Es wurde noch kein externer Kalender-Link erzeugt.
            </div>

            <div class="d-flex flex-wrap align-items-center gap-2">
              <button
                  type="button"
                  class="btn btn-outline-primary"
                  @click="regenerateFeedLink"
                  :disabled="feedBusy"
              >
                <i
                    :class="feedLinkInfo.tokenGenerated ? 'bi bi-arrow-clockwise' : 'bi bi-plus-circle'"
                    class="me-1"
                ></i>
                {{ feedLinkInfo.tokenGenerated ? 'Token neu generieren' : 'Link erzeugen' }}
              </button>
            </div>
          </div>
        </div>

        <div v-if="feedMessage" class="alert alert-info mt-3 mb-0">
          {{ feedMessage }}
        </div>

        <div v-if="feedLinkInfo.tokenGenerated" class="alert alert-warning mt-3 mb-0">
          Beim Neu-Generieren werden alle bisherigen Kalender-Links sofort ungültig.
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import TaskService from '@/services/task.service';

const WEEKDAY_LABELS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

function startOfDay(date) {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

function endOfDay(date) {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}

function startOfWeek(date) {
  const result = startOfDay(date);
  const day = result.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  result.setDate(result.getDate() + diff);
  return result;
}

function endOfWeek(date) {
  const result = startOfWeek(date);
  result.setDate(result.getDate() + 6);
  return endOfDay(result);
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
}

function endOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear()
      && a.getMonth() === b.getMonth()
      && a.getDate() === b.getDate();
}

function taskOverlapsDay(task, day) {
  if (!task?.dueDate && !task?.startAt) {
    return false;
  }

  const dayStart = startOfDay(day);
  const dayEnd = endOfDay(day);

  const taskStart = task.startAt ? new Date(task.startAt) : new Date(task.dueDate);
  let taskEnd = task.dueDate ? new Date(task.dueDate) : new Date(taskStart.getTime() + 30 * 60 * 1000);

  if (!(taskEnd > taskStart)) {
    taskEnd = new Date(taskStart.getTime() + 30 * 60 * 1000);
  }

  return taskStart <= dayEnd && taskEnd >= dayStart;
}

export default {
  name: 'TaskCalendar',
  data() {
    return {
      loading: false,
      errorMessage: '',
      selectedView: 'month',
      anchorDate: startOfDay(new Date()),
      calendarTasks: [],
      viewModes: [
        {value: 'day', label: 'Tag'},
        {value: 'week', label: 'Woche'},
        {value: 'month', label: 'Monat'}
      ],
      feedLinkInfo: {
        tokenGenerated: false,
        feedUrl: null,
        tokenHint: null
      },
      feedBusy: false,
      feedMessage: ''
    };
  },
  computed: {
    weekdayLabels() {
      return WEEKDAY_LABELS;
    },
    rangeStart() {
      if (this.selectedView === 'day') return startOfDay(this.anchorDate);
      if (this.selectedView === 'week') return startOfWeek(this.anchorDate);
      return startOfMonth(this.anchorDate);
    },
    rangeEnd() {
      if (this.selectedView === 'day') return endOfDay(this.anchorDate);
      if (this.selectedView === 'week') return endOfWeek(this.anchorDate);
      return endOfMonth(this.anchorDate);
    },
    visibleTasks() {
      return this.calendarTasks.filter(task => {
        if (!task?.dueDate && !task?.startAt) {
          return false;
        }

        const taskStart = task.startAt ? new Date(task.startAt) : new Date(task.dueDate);
        let taskEnd = task.dueDate ? new Date(task.dueDate) : new Date(taskStart.getTime() + 30 * 60 * 1000);

        if (!(taskEnd > taskStart)) {
          taskEnd = new Date(taskStart.getTime() + 30 * 60 * 1000);
        }

        return taskStart <= this.rangeEnd && taskEnd >= this.rangeStart;
      });
    },
    monthCells() {
      if (this.selectedView !== 'month') return [];

      const firstDay = startOfMonth(this.anchorDate);
      const gridStart = startOfWeek(firstDay);
      const cells = [];
      const today = startOfDay(new Date());

      for (let i = 0; i < 42; i += 1) {
        const current = new Date(gridStart);
        current.setDate(gridStart.getDate() + i);

        const tasks = this.calendarTasks.filter(task => taskOverlapsDay(task, current));

        cells.push({
          dateKey: current.toISOString(),
          dayNumber: current.getDate(),
          isCurrentMonth: current.getMonth() === this.anchorDate.getMonth(),
          isToday: sameDay(current, today),
          tasks
        });
      }

      return cells;
    },
    groupedVisibleTasks() {
      if (this.selectedView === 'day') {
        return [
          {
            key: this.rangeStart.toISOString(),
            label: this.formatLongDate(this.rangeStart),
            tasks: this.visibleTasks
          }
        ];
      }

      if (this.selectedView === 'week') {
        const groups = [];
        for (let i = 0; i < 7; i += 1) {
          const current = new Date(this.rangeStart);
          current.setDate(this.rangeStart.getDate() + i);
          groups.push({
            key: current.toISOString(),
            label: this.formatLongDate(current),
            tasks: this.visibleTasks.filter(task => taskOverlapsDay(task, current))
          });
        }
        return groups;
      }

      return [];
    },
    currentRangeLabel() {
      if (this.selectedView === 'day') {
        return this.formatLongDate(this.rangeStart);
      }

      if (this.selectedView === 'week') {
        return `${this.formatShortDate(this.rangeStart)} – ${this.formatShortDate(this.rangeEnd)}`;
      }

      return new Intl.DateTimeFormat('de-DE', { month: 'long', year: 'numeric' }).format(this.anchorDate);
    }
  },
  async mounted() {
    await this.loadCalendarTasks();
    await this.loadFeedLink();
  },
  methods: {
    async loadCalendarTasks() {
      this.loading = true;
      this.errorMessage = '';

      try {
        const response = await TaskService.getMyCalendarTasks();
        this.calendarTasks = Array.isArray(response.data) ? response.data : [];
      } catch (error) {
        this.errorMessage = error?.response?.data?.detail
            || error?.response?.data?.message
            || error?.message
            || 'Kalenderdaten konnten nicht geladen werden.';
      } finally {
        this.loading = false;
      }
    },
    goToToday() {
      this.anchorDate = startOfDay(new Date());
    },
    shiftRange(direction) {
      const next = new Date(this.anchorDate);

      if (this.selectedView === 'day') {
        next.setDate(next.getDate() + direction);
      } else if (this.selectedView === 'week') {
        next.setDate(next.getDate() + (direction * 7));
      } else {
        next.setMonth(next.getMonth() + direction);
      }

      this.anchorDate = next;
    },
    formatDateTime(value) {
      if (!value) return 'Kein Termin';
      return new Intl.DateTimeFormat('de-DE', {
        dateStyle: 'medium',
        timeStyle: 'short'
      }).format(new Date(value));
    },
    formatTaskRange(task) {
      if (!task?.startAt && !task?.dueDate) {
        return 'Kein Termin';
      }

      const start = task.startAt ? new Date(task.startAt) : new Date(task.dueDate);
      let end = task.dueDate ? new Date(task.dueDate) : new Date(start.getTime() + 30 * 60 * 1000);

      if (!(end > start)) {
        end = new Date(start.getTime() + 30 * 60 * 1000);
      }

      const formatter = new Intl.DateTimeFormat('de-DE', {
        dateStyle: 'medium',
        timeStyle: 'short'
      });

      return `${formatter.format(start)} – ${formatter.format(end)}`;
    },
    formatShortDate(value) {
      return new Intl.DateTimeFormat('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(new Date(value));
    },
    formatLongDate(value) {
      return new Intl.DateTimeFormat('de-DE', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      }).format(new Date(value));
    },

    openTask(task) {
      if (!task?.id || !task?.projectId) {
        return;
      }

      this.$router.push({
        path: '/boards',
        query: {
          projectId: task.projectId,
          taskId: task.id
        }
      });
    },

    async loadFeedLink() {
      this.feedBusy = true;
      this.feedMessage = '';

      try {
        const response = await TaskService.getCalendarFeedLink();
        this.feedLinkInfo = response.data || {
          tokenGenerated: false,
          feedUrl: null,
          tokenHint: null
        };
      } catch (error) {
        this.feedMessage = error?.response?.data?.detail
            || error?.response?.data?.message
            || error?.message
            || 'Kalender-Link konnte nicht geladen werden.';
      } finally {
        this.feedBusy = false;
      }
    },

    async regenerateFeedLink() {
      this.feedBusy = true;
      this.feedMessage = '';

      try {
        const response = await TaskService.regenerateCalendarFeedLink();
        this.feedLinkInfo = response.data;
        this.feedMessage = 'Neuer Kalender-Link wurde erzeugt. Frühere Links sind jetzt ungültig.';
      } catch (error) {
        this.feedMessage = error?.response?.data?.detail
            || error?.response?.data?.message
            || error?.message
            || 'Kalender-Link konnte nicht neu generiert werden.';
      } finally {
        this.feedBusy = false;
      }
    },
    async copyFeedUrl() {
      if (!this.feedLinkInfo?.feedUrl) return;

      try {
        await navigator.clipboard.writeText(this.feedLinkInfo.feedUrl);
        this.feedMessage = 'Kalender-Link in die Zwischenablage kopiert.';
      } catch {
        this.feedMessage = 'Kopieren fehlgeschlagen. Bitte Link manuell kopieren.';
      }
    }
  }
};
</script>

<style scoped>
.month-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 0.75rem;
}

.month-weekday {
  font-weight: 600;
  color: #6c757d;
}

.month-cell {
  min-height: 12rem;
  border: 1px solid #dee2e6;
  border-radius: 0.75rem;
  padding: 0.75rem;
  background: #fff;
}

.month-cell.is-outside {
  background: #f8f9fa;
}

.month-cell.is-today {
  border-color: #0d6efd;
}

.month-cell-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.calendar-task-card,
.calendar-task-list-item {
  border: 1px solid #dee2e6;
  border-left-width: 0.35rem;
  border-radius: 0.75rem;
  padding: 0.6rem 0.75rem;
  background: #fff;
}

.calendar-task-active {
  border-left-color: #198754;
}

.calendar-task-archived {
  opacity: 0.55;
  background: #f8f9fa;
}

.list-groups-wrapper {
  margin-top: 0.5rem;
}

.calendar-task-clickable {
  cursor: pointer;
}

.calendar-task-clickable:hover {
  box-shadow: 0 0.125rem 0.5rem rgba(0, 0, 0, 0.08);
}

.min-link-box {
  min-height: 42px;
}

@media (max-width: 991.98px) {
  .month-grid {
    grid-template-columns: 1fr;
  }

  .month-weekday {
    display: none;
  }

  .month-cell {
    min-height: auto;
  }
}
</style>