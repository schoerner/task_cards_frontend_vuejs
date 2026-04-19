<template>
  <div class="container py-4">
    <div class="mx-auto" style="max-width: 1150px;">
      <div class="card shadow-sm">
        <div class="card-body">
          <div class="mb-4">
            <h2 class="mb-1">{{ poll.title || 'Terminabfrage' }}</h2>
            <div class="text-muted small">
              Bitte gib deinen Namen oder ein Pseudonym ein und trage deine Verfügbarkeiten ein.
              Du kannst denselben Link später erneut öffnen und deine Angaben ändern, solange die Terminabfrage läuft.
            </div>
          </div>

          <div v-if="errorMessage" class="alert alert-danger">
            {{ errorMessage }}
          </div>

          <div v-if="loading" class="text-muted">
            Terminabfrage wird geladen...
          </div>

          <div v-else>
            <div class="mb-3">
              <label class="form-label">Name oder Pseudonym</label>
              <input v-model.trim="displayName" type="text" class="form-control" />
            </div>

            <div v-if="poll.description" class="border rounded p-3 bg-light-subtle mb-4">
              <MarkdownRenderedContent
                :content="poll.description"
                :clickable-task-lists="false"
                empty-text=""
              />
            </div>

            <TaskPollAvailabilityGrid
              v-if="poll && poll.dayStartTime && poll.dayEndTime && poll.slotMinutes && poll.includedDates?.length"
              :poll="poll"
              v-model="response"
              :selected-mode="selectedMode"
              @update:selectedMode="selectedMode = $event"
            />

            <div class="d-flex justify-content-end mt-4">
              <button class="btn btn-primary" :disabled="saving" @click="saveResponse">
                {{ saving ? 'Speichern...' : 'Verfügbarkeit absenden' }}
              </button>
            </div>

            <div v-if="statusMessage" class="alert alert-success mt-3 mb-0">
              {{ statusMessage }}
            </div>
          </div>

          <div v-if="poll.heatmap?.length" class="mt-4">
            <TaskPollHeatmap
              :poll="poll"
              :heatmap="poll.heatmap"
              :selectable="false"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import TaskPollHeatmap from '@/components/TaskPollHeatmap.vue';
import TaskPollService from '@/services/task-poll.service.js';
import TaskPollFakeService from '@/services/task-poll.fake.service.js';
import TaskPollAvailabilityGrid from '@/components/TaskPollAvailabilityGrid.vue';
import MarkdownRenderedContent from '@/components/MarkdownRenderedContent.vue';
import {
  normalizeHeatmapSlots,
  toLocalSlotKeyFromOffsetDateTime,
  toOffsetDateTimeString
} from '@/utils/task-poll.utils.js';

export default {
  name: 'TaskPollPublicPage',
  components: {
    TaskPollAvailabilityGrid,
    TaskPollHeatmap,
    MarkdownRenderedContent
  },
  data() {
    return {
      loading: true,
      saving: false,
      errorMessage: '',
      statusMessage: '',
      poll: {
        includedDates: [],
        heatmap: []
      },
      response: {
        participantId: null,
        slots: {}
      },
      displayName: '',
      selectedMode: TaskPollFakeService.STATUS.AVAILABLE
    };
  },
  computed: {
    token() {
      return this.$route.params.token;
    }
  },
  async mounted() {
    await this.loadPoll();
  },
  methods: {
    applyPublicPayload(data) {
      this.poll = {
        ...data,
        heatmap: normalizeHeatmapSlots(data.heatmap, data.slotMinutes)
      };

      this.displayName = data.displayName || '';
      this.response = {
        participantId: data.participantId,
        slots: Object.fromEntries(
          (data.response || [])
            .map((entry) => [toLocalSlotKeyFromOffsetDateTime(entry.slotStartAt), entry.availability])
            .filter(([key]) => !!key)
        )
      };
    },

    async loadPoll() {
      this.loading = true;
      this.errorMessage = '';

      try {
        const { data } = await TaskPollService.getPublicPoll(this.token);
        this.applyPublicPayload(data);
      } catch (error) {
        this.errorMessage =
          error?.response?.data?.detail ||
          error?.response?.data?.message ||
          error?.message ||
          'Terminabfrage konnte nicht geladen werden.';
      } finally {
        this.loading = false;
      }
    },

    async saveResponse() {
      this.saving = true;
      this.errorMessage = '';
      this.statusMessage = '';

      try {
        const { data } = await TaskPollService.submitPublicPoll(this.token, {
          displayName: this.displayName,
          response: Object.entries(this.response?.slots || {}).map(([slotStartAt, availability]) => ({
            slotStartAt: toOffsetDateTimeString(slotStartAt),
            availability
          }))
        });

        this.applyPublicPayload(data);
        this.statusMessage = 'Vielen Dank. Deine Verfügbarkeit wurde gespeichert.';
      } catch (error) {
        this.errorMessage =
          error?.response?.data?.detail ||
          error?.response?.data?.message ||
          error?.message ||
          'Verfügbarkeit konnte nicht gespeichert werden.';
      } finally {
        this.saving = false;
      }
    }
  }
};
</script>
