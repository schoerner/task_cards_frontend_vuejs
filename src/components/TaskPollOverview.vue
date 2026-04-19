<template>
  <div class="container py-4">
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
      <div>
        <h2 class="mb-1">Meine Terminabfragen</h2>
        <p class="text-muted mb-0">Laufende und bereits finalisierte Terminabfragen verwalten, öffnen oder löschen.</p>
      </div>

      <button type="button" class="btn btn-outline-secondary" @click="loadPolls" :disabled="loading || deletingTaskId !== null">
        Neu laden
      </button>
    </div>

    <div v-if="statusMessage" class="alert alert-success">{{ statusMessage }}</div>
    <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>

    <div v-if="loading" class="text-muted">Terminabfragen werden geladen...</div>

    <div v-else-if="polls.length === 0" class="card shadow-sm">
      <div class="card-body text-muted">
        Du hast aktuell noch keine Terminabfragen angelegt.
      </div>
    </div>

    <div v-else class="d-flex flex-column gap-3">
      <div v-for="poll in polls" :key="poll.id" class="card shadow-sm">
        <div class="card-body">
          <div class="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-3">
            <div>
              <div class="d-flex flex-wrap align-items-center gap-2 mb-1">
                <h5 class="mb-0">{{ poll.title || poll.taskTitle || `Terminabfrage #${poll.id}` }}</h5>
                <span class="badge" :class="statusBadgeClass(poll.status)">{{ statusLabel(poll.status) }}</span>
              </div>
              <div class="text-muted small">
                Task: {{ poll.taskTitle || `#${poll.taskId}` }} · Projekt: {{ poll.projectName || `#${poll.projectId}` }}
              </div>
            </div>

            <div class="text-muted small text-end">
              <div>Zeitraum: {{ formatDateRange(poll) }}</div>
              <div>Aktualisiert: {{ formatDateTimeWithWeekday(poll.updatedAt) }}</div>
              <div v-if="poll.finalizedStartAt">Finalisiert: {{ formatSlot(poll.finalizedStartAt, poll.finalizedEndAt) }}</div>
            </div>
          </div>

          <div class="row g-3 mb-3 small">
            <div class="col-md-3">
              <div class="border rounded p-2 h-100 bg-light-subtle">
                <div class="fw-semibold">Teilnehmende</div>
                <div>{{ poll.participantCount }}</div>
              </div>
            </div>
            <div class="col-md-3">
              <div class="border rounded p-2 h-100 bg-light-subtle">
                <div class="fw-semibold">Bereits geantwortet</div>
                <div>{{ poll.respondedParticipantCount }}</div>
              </div>
            </div>
            <div class="col-md-3">
              <div class="border rounded p-2 h-100 bg-light-subtle">
                <div class="fw-semibold">Offen</div>
                <div>{{ Math.max(0, poll.participantCount - poll.respondedParticipantCount) }}</div>
              </div>
            </div>
            <div class="col-md-3">
              <div class="border rounded p-2 h-100 bg-light-subtle">
                <div class="fw-semibold">Raster</div>
                <div>{{ poll.slotMinutes }} Minuten</div>
              </div>
            </div>
          </div>

          <div class="d-flex flex-wrap gap-2">
            <router-link :to="pollEditRoute(poll)" class="btn btn-primary">Bearbeiten</router-link>
            <router-link :to="pollTaskRoute(poll)" class="btn btn-outline-secondary">Zum Task</router-link>
            <button
              type="button"
              class="btn btn-outline-danger"
              :disabled="deletingTaskId === poll.taskId"
              @click="deletePoll(poll)"
            >
              {{ deletingTaskId === poll.taskId ? 'Lösche...' : 'Löschen' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <AppConfirmModal ref="confirmModal" />
  </div>
</template>

<script>
import AppConfirmModal from '@/components/AppConfirmModal.vue';
import TaskPollService from '@/services/task-poll.service.js';

export default {
  name: 'TaskPollOverview',
  components: {
    AppConfirmModal
  },
  data() {
    return {
      loading: false,
      deletingTaskId: null,
      polls: [],
      statusMessage: '',
      errorMessage: ''
    };
  },
  async mounted() {
    await this.loadPolls();
  },
  methods: {
    async loadPolls() {
      this.loading = true;
      this.errorMessage = '';

      try {
        const response = await TaskPollService.getOwnedPolls();
        this.polls = response.data || [];
      } catch (error) {
        this.errorMessage = this.extractErrorMessage(error, 'Terminabfragen konnten nicht geladen werden.');
      } finally {
        this.loading = false;
      }
    },
    async deletePoll(poll) {
      const confirmed = await this.$refs.confirmModal.show({
        title: 'Terminabfrage löschen',
        message: `Soll die Terminabfrage „${poll.title || poll.taskTitle || `#${poll.id}`}“ wirklich gelöscht werden? Alle Teilnehmenden und Antworten gehen dabei verloren.`,
        confirmLabel: 'Terminabfrage löschen',
        confirmVariant: 'danger'
      });

      if (!confirmed) {
        return;
      }

      this.deletingTaskId = poll.taskId;
      this.errorMessage = '';
      this.statusMessage = '';

      try {
        await TaskPollService.deletePoll(poll.taskId);
        this.polls = this.polls.filter((entry) => Number(entry.id) !== Number(poll.id));
        this.statusMessage = 'Terminabfrage wurde gelöscht.';
      } catch (error) {
        this.errorMessage = this.extractErrorMessage(error, 'Terminabfrage konnte nicht gelöscht werden.');
      } finally {
        this.deletingTaskId = null;
      }
    },
    pollEditRoute(poll) {
      return `/polls/task/${poll.taskId}`;
    },
    pollTaskRoute(poll) {
      return {
        path: '/boards',
        query: {
          projectId: String(poll.projectId),
          taskId: String(poll.taskId)
        }
      };
    },
    statusLabel(status) {
      switch (status) {
        case 'FINALIZED': return 'Finalisiert';
        case 'CANCELLED': return 'Abgebrochen';
        default: return 'Offen';
      }
    },
    statusBadgeClass(status) {
      switch (status) {
        case 'FINALIZED': return 'text-bg-success';
        case 'CANCELLED': return 'text-bg-secondary';
        default: return 'text-bg-primary';
      }
    },
    formatDateRange(poll) {
      return `${this.formatDate(poll.startDate)} – ${this.formatDate(poll.endDate)}`;
    },
    formatDate(value) {
      if (!value) return '—';
      return new Date(`${value}T00:00:00`).toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit', year: '2-digit' });
    },
    formatDateTimeWithWeekday(value) {
      if (!value) return '—';
      return new Date(value).toLocaleString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
    },
    formatSlot(startAt, endAt) {
      if (!startAt) return '—';
      const start = new Date(startAt);
      const end = endAt ? new Date(endAt) : null;
      const startText = start.toLocaleString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
      const endText = end ? end.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) : '—';
      return `${startText} – ${endText}`;
    },
    extractErrorMessage(error, fallback) {
      return error?.response?.data?.detail || error?.response?.data?.message || error?.message || fallback;
    }
  }
};
</script>
