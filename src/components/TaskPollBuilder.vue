<template>
  <div class="container py-4 task-poll-builder">
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
      <div>
        <h2 class="mb-1">Terminabfrage</h2>
        <p class="text-muted mb-0">
          {{ backendMode
            ? 'Terminabfrage der ausgewählten Task bearbeiten, speichern und auswerten.'
            : 'Frontend-Prototyp mit lokaler Vorschau. Für echte Speicherung bitte aus einer Task heraus öffnen.' }}
        </p>
      </div>

      <div class="d-flex flex-wrap gap-2 align-items-center">
        <span v-if="saving" class="text-muted small">Verarbeite…</span>

        <button type="button" class="btn btn-outline-secondary" @click="reloadFromSource" :disabled="loading || saving">
          Neu laden
        </button>

        <button
          v-if="backendMode"
          type="button"
          class="btn btn-outline-danger"
          @click="deletePoll"
          :disabled="loading || saving"
        >
          Terminabfrage löschen
        </button>

        <button type="button" class="btn btn-outline-primary" @click="sendInvitations" :disabled="loading || saving || !backendMode">
          Terminabfrage versenden
        </button>

        <button type="button" class="btn btn-outline-secondary" @click="sendReminders" :disabled="loading || saving || !backendMode">
          Reminder senden
        </button>

        <button type="button" class="btn btn-primary" @click="savePoll" :disabled="loading || saving || !backendMode">
          Terminabfrage speichern
        </button>
      </div>
    </div>

    <div v-if="statusMessage" class="alert alert-success">{{ statusMessage }}</div>
    <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>

    <div class="row g-4 align-items-start mb-4">
      <div class="col-12 col-xl-8">
        <div class="card shadow-sm h-100">
          <div class="card-body">
            <div class="row g-3">
              <div class="col-lg-8">
                <label class="form-label">Titel</label>
                <input v-model.trim="pollDraft.title" type="text" class="form-control" placeholder="z. B. Projekt-Review Terminfindung" />
              </div>
              <div class="col-lg-4">
                <label class="form-label">Granularität</label>
                <select v-model.number="pollDraft.slotMinutes" class="form-select">
                  <option :value="15">15 Minuten</option>
                  <option :value="30">30 Minuten</option>
                  <option :value="60">60 Minuten</option>
                </select>
              </div>

              <div class="col-12">
                <MarkdownEditorWithPreview
                  v-model="pollDraft.description"
                  label="Beschreibung"
                  :rows="6"
                  empty-preview-text="Noch keine Beschreibung für die Terminabfrage."
                  placeholder="Infos zur Terminabfrage, Agenda, Ort oder Videokonferenz-Link..."
                />
              </div>

              <div class="col-md-3">
                <label class="form-label">Von</label>
                <input v-model="pollDraft.startDate" type="date" class="form-control" />
              </div>
              <div class="col-md-3">
                <label class="form-label">Bis</label>
                <input v-model="pollDraft.endDate" type="date" class="form-control" />
              </div>
              <div class="col-md-3">
                <label class="form-label">Tagesbeginn</label>
                <input v-model="pollDraft.dayStartTime" type="time" class="form-control" step="900" />
              </div>
              <div class="col-md-3">
                <label class="form-label">Tagesende</label>
                <input v-model="pollDraft.dayEndTime" type="time" class="form-control" step="900" />
              </div>
            </div>

            <div class="mt-4">
              <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2">
                <div>
                  <div class="fw-semibold">Tage im Zeitraum</div>
                  <div class="small text-muted">Angewählte Tage werden in die Terminabfrage aufgenommen.</div>
                </div>

                <div class="btn-group btn-group-sm flex-wrap quick-actions" role="group">
                  <button type="button" class="btn btn-outline-secondary" @click="selectAllDates">Alle</button>
                  <button type="button" class="btn btn-outline-secondary" @click="selectWeekdays([1,2,3,4,5])">Mo–Fr</button>
                  <button type="button" class="btn btn-outline-secondary" @click="selectWeekdays([1,2,3,4,5,6])">Mo–Sa</button>
                  <button type="button" class="btn btn-outline-secondary" @click="clearIncludedDates">Zurücksetzen</button>
                </div>
              </div>

              <div class="date-chip-week-grid">
                <template v-for="cell in dateButtonCells" :key="cell.key">
                  <div v-if="cell.type === 'placeholder'" class="date-chip-placeholder"></div>

                  <button
                    v-else
                    type="button"
                    class="btn btn-sm date-chip"
                    :class="includedDatesSet.has(cell.date) ? 'btn-primary' : 'btn-outline-secondary'"
                    @click="toggleDate(cell.date)"
                  >
                    <span class="date-chip-weekday">{{ formatWeekday(cell.date) }}</span>
                    <span class="date-chip-date">{{ formatDateShort(cell.date) }}</span>
                  </button>
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-12 col-xl-4">
        <TaskPollParticipantEditor
          v-model="participants"
          :project-id="currentProjectId"
        />
      </div>
    </div>

    <div class="d-flex flex-column gap-4">
      <TaskPollAvailabilityGrid
        :poll="pollDraft"
        :model-value="ownerResponse"
        :selected-mode="selectedMode"
        @update:modelValue="updateOwnerResponse"
        @update:selectedMode="selectedMode = $event"
      />

      <div class="card shadow-sm">
        <div class="card-body">
          <div class="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-3">
            <div>
              <div class="fw-semibold">Termin aus Verfügbarkeiten festlegen</div>
              <div class="small text-muted">
                Wähle einen Slot aus der Heatmap aus, um daraus den gemeinsamen Termin für die Task zu übernehmen.
              </div>
            </div>

            <div class="text-end">
              <div class="small text-muted mb-2">
                {{
                  selectedHeatmapSlot
                    ? `Ausgewählt: ${selectedHeatmapSlot.date} ${selectedHeatmapSlot.time}–${selectedHeatmapSlot.endTime}`
                    : 'Kein Slot ausgewählt'
                }}
              </div>

              <button
                type="button"
                class="btn btn-success"
                :disabled="loading || saving || !backendMode || !selectedHeatmapSlot"
                @click="finalizeSelectedSlot"
              >
                Termin übernehmen
              </button>
            </div>
          </div>

          <TaskPollHeatmap
            :poll="pollDraft"
            :heatmap="heatmap"
            :selectable="true"
            :selected-slot-start-at="selectedHeatmapSlotStartAt"
            title="Aktuelle Heatmap mit Verfügbarkeiten"
            subtitle="Bewertung: „Kann“ zählt 2 Punkte, „Bedingt“ 1 Punkt, „Kann nicht“ 0 Punkte. Ein Gesamtwert von 2 kann also auch aus zwei bedingten Zusagen entstehen."
            @select-slot="selectedHeatmapSlotStartAt = $event.slotStartAt"
          />
        </div>
      </div>
    </div>

    <AppConfirmModal ref="confirmModal" />
    <TaskPollMailComposerModal ref="mailComposerModal" />
  </div>
</template>

<script>
import AppConfirmModal from '@/components/AppConfirmModal.vue';
import TaskPollMailComposerModal from '@/components/TaskPollMailComposerModal.vue';
import MarkdownEditorWithPreview from '@/components/MarkdownEditorWithPreview.vue';
import TaskPollAvailabilityGrid from '@/components/TaskPollAvailabilityGrid.vue';
import TaskPollHeatmap from '@/components/TaskPollHeatmap.vue';
import TaskPollParticipantEditor from '@/components/TaskPollParticipantEditor.vue';
import TaskPollFakeService from '@/services/task-poll.fake.service.js';
import TaskPollService from '@/services/task-poll.service.js';
import TaskService from '@/services/task.service.js';
import {
  addDays,
  addMinutesToOffsetDateTime,
  formatDateShort,
  formatWeekday,
  getDateRange,
  normalizeHeatmapSlots,
  toLocalSlotKeyFromOffsetDateTime,
  toOffsetDateTimeString
} from '@/utils/task-poll.utils.js';

export default {
  name: 'TaskPollBuilder',
  components: {
    AppConfirmModal,
    TaskPollMailComposerModal,
    MarkdownEditorWithPreview,
    TaskPollAvailabilityGrid,
    TaskPollHeatmap,
    TaskPollParticipantEditor
  },
  data() {
    return {
      originalPollSettings: null,
      pollDraft: TaskPollFakeService.getPoll(),
      ownerResponse: TaskPollFakeService.getOwnerResponse(),
      participants: TaskPollFakeService.getParticipants(),
      selectedMode: TaskPollFakeService.STATUS.AVAILABLE,
      currentProjectId: null,
      selectedHeatmapSlotStartAt: null,
      backendHeatmap: [],
      loading: false,
      saving: false,
      statusMessage: '',
      errorMessage: ''
    };
  },
  computed: {
    currentTaskId() {
      return Number(this.$route.params.taskId || this.$route.query.taskId || 0) || null;
    },
    backendMode() {
      return !!this.currentTaskId;
    },
    allDatesInRange() {
      return getDateRange(this.pollDraft.startDate, this.pollDraft.endDate);
    },
    includedDatesSet() {
      return new Set(this.pollDraft.includedDates || []);
    },
    dateButtonCells() {
      const dates = this.allDatesInRange;
      if (!dates.length) return [];

      const [year, month, day] = dates[0].split('-').map(Number);
      const firstJsDay = new Date(year, month - 1, day).getDay();
      const normalizedFirstDay = firstJsDay === 0 ? 7 : firstJsDay;
      const cells = [];

      for (let i = 1; i < normalizedFirstDay; i += 1) {
        cells.push({ key: `placeholder-${i}`, type: 'placeholder' });
      }

      dates.forEach((date) => cells.push({ key: date, type: 'date', date }));
      return cells;
    },
    heatmap() {
      if (this.backendMode) {
        return this.backendHeatmap || [];
      }

      TaskPollFakeService.updatePoll(this.pollDraft);
      TaskPollFakeService.updateOwnerResponse(this.ownerResponse);
      TaskPollFakeService.replaceParticipants(this.participants);
      return TaskPollFakeService.getHeatmap();
    },
    selectedHeatmapSlot() {
      if (!this.selectedHeatmapSlotStartAt) {
        return null;
      }

      return (this.heatmap || []).find((slot) => slot.slotStartAt === this.selectedHeatmapSlotStartAt) || null;
    }
  },
  watch: {
    '$route.fullPath': {
      immediate: true,
      handler() {
        this.reloadFromSource();
      }
    },
    'pollDraft.startDate': 'normalizeDateSelection',
    'pollDraft.endDate': 'normalizeDateSelection',
    participants: {
      deep: true,
      handler(value) {
        TaskPollFakeService.replaceParticipants(value);
      }
    }
  },
  methods: {
    formatWeekday,
    formatDateShort,

    async confirmAction(options) {
      return this.$refs.confirmModal.show(options);
    },

    async reloadFromSource() {
      this.loading = true;
      this.errorMessage = '';
      this.statusMessage = '';

      try {
        if (!this.backendMode) {
          this.currentProjectId = null;
          this.pollDraft = TaskPollFakeService.getPoll();
          this.ownerResponse = TaskPollFakeService.getOwnerResponse();
          this.participants = TaskPollFakeService.getParticipants();
          this.backendHeatmap = [];
          this.originalPollSettings = null;
          this.selectedHeatmapSlotStartAt = null;
          return;
        }

        const taskResponse = await TaskService.getTask(this.currentTaskId);
        this.currentProjectId = taskResponse?.data?.projectId || null;

        const response = await TaskPollService.getPollByTask(this.currentTaskId);
        this.applyBackendPayload(response.data);
      } catch (error) {
        if (this.backendMode && (error?.response?.status === 400 || error?.response?.status === 404)) {
          this.pollDraft = { ...TaskPollFakeService.getPoll(), taskId: this.currentTaskId };
          this.ownerResponse = TaskPollFakeService.getOwnerResponse();
          this.participants = [];
          this.backendHeatmap = [];
          this.originalPollSettings = null;
          this.selectedHeatmapSlotStartAt = null;
          TaskPollFakeService.updatePoll(this.pollDraft);
          TaskPollFakeService.updateOwnerResponse(this.ownerResponse);
          TaskPollFakeService.replaceParticipants([]);
        } else {
          this.errorMessage = this.extractErrorMessage(error, 'Terminabfrage konnte nicht geladen werden.');
        }
      } finally {
        this.loading = false;
      }
    },

    applyBackendPayload(payload) {
      this.pollDraft = {
        id: payload.id,
        taskId: payload.taskId,
        title: payload.title || '',
        description: payload.description || '',
        startDate: payload.startDate,
        endDate: payload.endDate,
        dayStartTime: payload.dayStartTime,
        dayEndTime: payload.dayEndTime,
        slotMinutes: payload.slotMinutes,
        includedDates: payload.includedDates || []
      };

      this.ownerResponse = {
        participantId: 'owner',
        slots: (payload.ownerResponse || []).reduce((acc, selection) => {
          const key = toLocalSlotKeyFromOffsetDateTime(selection.slotStartAt);
          if (key) acc[key] = selection.availability;
          return acc;
        }, {})
      };

      this.participants = (payload.participants || []).map((participant) => ({
        id: participant.id,
        type: participant.type,
        userId: participant.userId || null,
        displayName: participant.displayName,
        email: participant.email,
        responseName: participant.responseName || null,
        invitedAt: participant.invitedAt || null,
        respondedAt: participant.respondedAt || null,
        lastReminderAt: participant.lastReminderAt || null,
        response: {
          participantId: participant.id,
          slots: (participant.response || []).reduce((acc, selection) => {
            const key = toLocalSlotKeyFromOffsetDateTime(selection.slotStartAt);
            if (key) acc[key] = selection.availability;
            return acc;
          }, {})
        }
      }));

      this.backendHeatmap = normalizeHeatmapSlots(payload.heatmap, payload.slotMinutes);
      this.selectedHeatmapSlotStartAt = null;

      TaskPollFakeService.updatePoll(this.pollDraft);
      TaskPollFakeService.updateOwnerResponse(this.ownerResponse);
      TaskPollFakeService.replaceParticipants(this.participants);

      this.originalPollSettings = {
        startDate: this.pollDraft.startDate,
        endDate: this.pollDraft.endDate,
        dayStartTime: this.pollDraft.dayStartTime,
        dayEndTime: this.pollDraft.dayEndTime,
        slotMinutes: this.pollDraft.slotMinutes,
        includedDates: [...(this.pollDraft.includedDates || [])]
      };
    },

    hasStructuralPollChanges() {
      if (!this.originalPollSettings) {
        return false;
      }

      return (
        this.originalPollSettings.startDate !== this.pollDraft.startDate ||
        this.originalPollSettings.endDate !== this.pollDraft.endDate ||
        this.originalPollSettings.dayStartTime !== this.pollDraft.dayStartTime ||
        this.originalPollSettings.dayEndTime !== this.pollDraft.dayEndTime ||
        this.originalPollSettings.slotMinutes !== this.pollDraft.slotMinutes ||
        JSON.stringify(this.originalPollSettings.includedDates || []) !== JSON.stringify(this.pollDraft.includedDates || [])
      );
    },

    toUpsertPayload() {
      return {
        title: this.pollDraft.title,
        description: this.pollDraft.description,
        startDate: this.pollDraft.startDate,
        endDate: this.pollDraft.endDate,
        dayStartTime: this.pollDraft.dayStartTime,
        dayEndTime: this.pollDraft.dayEndTime,
        slotMinutes: this.pollDraft.slotMinutes,
        includedDates: this.pollDraft.includedDates,
        participants: this.participants.map((participant) => ({
          id: typeof participant.id === 'number' ? participant.id : null,
          type: participant.type,
          userId: participant.userId || null,
          displayName: participant.displayName,
          email: participant.email,
          responseName: participant.responseName || null,
          response: Object.entries(participant.response?.slots || {}).map(([slotStartAt, availability]) => ({
            slotStartAt: toOffsetDateTimeString(slotStartAt),
            availability
          }))
        })),
        ownerResponse: Object.entries(this.ownerResponse?.slots || {}).map(([slotStartAt, availability]) => ({
          slotStartAt: toOffsetDateTimeString(slotStartAt),
          availability
        }))
      };
    },

    async persistPoll({ skipStructuralConfirmation = false, structuralSaveMode = null } = {}) {
      if (!this.backendMode) {
        return null;
      }

      let effectiveSaveMode = structuralSaveMode;

      if (!skipStructuralConfirmation && this.hasStructuralPollChanges()) {
        effectiveSaveMode = await this.confirmAction({
          title: 'Basis-Einstellungen geändert',
          message: 'Du hast Basis-Einstellungen der Terminabfrage geändert. Bereits abgegebene Verfügbarkeiten werden dadurch zurückgesetzt.\n\nWie möchtest du fortfahren?',
          buttons: [
            { value: 'save', label: 'Ja, Terminabfrage nur speichern', variant: 'warning' },
            { value: 'save-and-send', label: 'Speichern und Terminabfrage direkt neu versenden', variant: 'primary' },
            { value: 'cancel', label: 'Abbrechen', variant: 'secondary' }
          ],
          defaultResolveValue: 'cancel'
        });

        if (!effectiveSaveMode || effectiveSaveMode === 'cancel') {
          return null;
        }
      }

      const response = await TaskPollService.savePoll(this.currentTaskId, this.toUpsertPayload());
      this.applyBackendPayload(response.data);

      if (effectiveSaveMode === 'save-and-send') {
        const invitationPayload = await this.openInvitationComposer();
        if (!invitationPayload) {
          return response;
        }
        await TaskPollService.sendInvitations(this.currentTaskId, invitationPayload);
        await this.reloadFromSource();
        this.statusMessage = 'Terminabfrage wurde gespeichert und direkt neu versendet.';
      }

      return response;
    },

    buildInvitationDefaultMessage() {
      return [
        `Hallo,`,
        '',
        `ich habe die Terminabfrage **${this.pollDraft.title || 'Terminabfrage'}** aktualisiert.`,
        '',
        `Bitte trage deine Verfügbarkeit über den bekannten Link ein oder aktualisiere deine Angaben dort noch einmal.`,
        '',
        `Vielen Dank!`
].join('\n');
    },

    buildReminderDefaultMessage() {
      return [
        'Hallo,',
        '',
        `zur Terminabfrage **${this.pollDraft.title || 'Terminabfrage'}** steht deine Rückmeldung noch aus.`,
        '',
        'Bitte öffne den Link aus der Einladung und ergänze deine Verfügbarkeit.',
        '',
        'Vielen Dank!'
].join('\n');
    },

    buildFinalizationDefaultMessage(slot) {
      return [
        'Hallo,',
        '',
        `die Terminabfrage **${this.pollDraft.title || 'Terminabfrage'}** ergab für folgenden Slot die höchste Übereinstimmung:`,
        '',
        `**${slot.date} ${slot.time}–${slot.endTime} Uhr**`,
        '',
        'Diesen Termin habe ich jetzt für die zugehörige Task übernommen.',
        '',
        'Viele Grüße'
].join('\n');
    },

    async openInvitationComposer() {
      return this.$refs.mailComposerModal.show({
        title: 'Terminabfrage versenden',
        lead: 'Formuliere die Nachricht, die zusammen mit dem persönlichen Teilnahmelink als HTML-Mail verschickt werden soll.',
        subject: `Terminabfrage: ${this.pollDraft.title || 'Bitte Verfügbarkeit eintragen'}`,
        messageMarkdown: this.buildInvitationDefaultMessage(),
        placeholder: 'Kurze Einladung, Agenda, Ort oder Hinweise zur Terminabfrage …',
        submitLabel: 'Terminabfrage versenden'
      });
    },

    async openReminderComposer() {
      return this.$refs.mailComposerModal.show({
        title: 'Reminder versenden',
        lead: 'Diese Nachricht wird an alle Teilnehmenden verschickt, die noch nicht geantwortet haben.',
        subject: `Erinnerung zur Terminabfrage: ${this.pollDraft.title || ''}`.trim(),
        messageMarkdown: this.buildReminderDefaultMessage(),
        placeholder: 'Freundliche Erinnerung formulieren …',
        submitLabel: 'Reminder senden'
      });
    },

    async openFinalizationComposer(slot) {
      return this.$refs.mailComposerModal.show({
        title: 'Terminbestätigung verfassen',
        lead: 'Optional kannst du direkt eine HTML-Mail an alle Teilnehmenden mit dem finalen Termin verschicken.',
        subject: `Termin steht fest: ${this.pollDraft.title || 'Terminabfrage'}`,
        messageMarkdown: this.buildFinalizationDefaultMessage(slot),
        placeholder: 'Zusätzliche Hinweise zum gemeinsamen Termin …',
        submitLabel: 'Terminbestätigung senden'
      });
    },

    async savePoll() {
      if (!this.backendMode) return;

      this.saving = true;
      this.errorMessage = '';
      this.statusMessage = '';

      try {
        const response = await this.persistPoll();
        if (response) {
          this.statusMessage = 'Terminabfrage wurde gespeichert.';
        }
      } catch (error) {
        this.errorMessage = this.extractErrorMessage(error, 'Terminabfrage konnte nicht gespeichert werden.');
      } finally {
        this.saving = false;
      }
    },

    async deletePoll() {
      if (!this.backendMode || !this.currentTaskId) {
        return;
      }

      const confirmed = await this.confirmAction({
        title: 'Terminabfrage löschen',
        message: 'Die Terminabfrage inklusive Teilnehmenden und Antworten wird gelöscht.\n\nMöchtest du fortfahren?',
        confirmLabel: 'Löschen',
        confirmVariant: 'danger'
      });

      if (!confirmed) {
        return;
      }

      this.saving = true;
      this.errorMessage = '';
      this.statusMessage = '';

      try {
        await TaskPollService.deletePoll(this.currentTaskId);
        this.$router.push('/polls');
      } catch (error) {
        this.errorMessage = this.extractErrorMessage(error, 'Terminabfrage konnte nicht gelöscht werden.');
      } finally {
        this.saving = false;
      }
    },

    async sendInvitations() {
      if (!this.backendMode || !this.currentTaskId) {
        return;
      }

      const mailPayload = await this.openInvitationComposer();
      if (!mailPayload) {
        return;
      }

      this.saving = true;
      this.errorMessage = '';
      this.statusMessage = 'Terminabfrage wird versendet...';

      try {
        await this.persistPoll({ skipStructuralConfirmation: true });
        await TaskPollService.sendInvitations(this.currentTaskId, mailPayload);
        await this.reloadFromSource();
        this.statusMessage = 'Terminabfrage wurde versendet.';
      } catch (error) {
        this.errorMessage = this.extractErrorMessage(error, 'Terminabfrage konnte nicht versendet werden.');
        this.statusMessage = '';
      } finally {
        this.saving = false;
      }
    },

    async sendReminders() {
      if (!this.backendMode || !this.currentTaskId) {
        return;
      }

      const hasInvitedParticipants = this.participants.some((participant) => !!participant.invitedAt);
      if (!hasInvitedParticipants) {
        this.errorMessage = 'Reminder können erst gesendet werden, nachdem die Terminabfrage verschickt wurde.';
        return;
      }

      const mailPayload = await this.openReminderComposer();
      if (!mailPayload) {
        return;
      }

      this.saving = true;
      this.errorMessage = '';
      this.statusMessage = 'Reminder werden versendet...';

      try {
        await TaskPollService.sendReminders(this.currentTaskId, mailPayload);
        await this.reloadFromSource();
        this.statusMessage = 'Reminder wurden versendet.';
      } catch (error) {
        this.errorMessage = this.extractErrorMessage(error, 'Reminder konnten nicht versendet werden.');
        this.statusMessage = '';
      } finally {
        this.saving = false;
      }
    },

    async finalizeSelectedSlot() {
      if (!this.backendMode || !this.currentTaskId || !this.selectedHeatmapSlot) {
        return;
      }

      const slot = this.selectedHeatmapSlot;
      const decision = await this.confirmAction({
        title: 'Termin wirklich übernehmen?',
        message: `Soll der Slot ${slot.date} ${slot.time}–${slot.endTime} als Termin in die zugehörige Task übernommen werden?`,
        buttons: [
          { value: 'stay', label: 'Ja, und auf dieser Seite bleiben', variant: 'success' },
          { value: 'task', label: 'Ja, und zum zugehörigen Task weiterleiten', variant: 'primary' },
          { value: 'notify', label: 'Ja, und Terminmail verfassen', variant: 'outline-primary', className: 'btn-outline-primary' },
          { value: 'cancel', label: 'Abbrechen', variant: 'secondary' }
        ],
        defaultResolveValue: 'cancel'
      });

      if (!decision || decision === 'cancel') {
        return;
      }

      let notificationPayload = null;
      if (decision === 'notify') {
        notificationPayload = await this.openFinalizationComposer(slot);
        if (!notificationPayload) {
          return;
        }
      }

      this.saving = true;
      this.errorMessage = '';
      this.statusMessage = '';

      try {
        const startAt = slot.slotStartAt;
        const endAt = addMinutesToOffsetDateTime(startAt, this.pollDraft.slotMinutes);

        const response = await TaskPollService.finalizePoll(this.currentTaskId, {
          finalizedStartAt: startAt,
          finalizedEndAt: endAt
        });

        this.applyBackendPayload(response.data);

        if (notificationPayload) {
          await TaskPollService.sendFinalizationNotification(this.currentTaskId, notificationPayload);
          await this.reloadFromSource();
          this.statusMessage = 'Termin wurde übernommen und die Terminbestätigung versendet.';
        } else {
          this.statusMessage = 'Termin wurde in die Task übernommen.';
        }

        if (decision === 'task') {
          this.$router.push({
            path: '/boards',
            query: {
              projectId: String(this.currentProjectId),
              taskId: String(this.currentTaskId)
            }
          });
        }
      } catch (error) {
        this.errorMessage = this.extractErrorMessage(error, 'Termin konnte nicht übernommen werden.');
      } finally {
        this.saving = false;
      }
    },

    extractErrorMessage(error, fallback) {
      return error?.response?.data?.detail || error?.response?.data?.message || error?.message || fallback;
    },

    normalizeDateSelection() {
      if (this.pollDraft.startDate && this.pollDraft.endDate && this.pollDraft.startDate > this.pollDraft.endDate) {
        this.pollDraft.endDate = this.pollDraft.startDate;
      }

      const allDates = this.allDatesInRange;
      const filtered = (this.pollDraft.includedDates || []).filter((date) => allDates.includes(date));
      this.pollDraft.includedDates = filtered.length > 0 ? filtered : [...allDates];
      TaskPollFakeService.updatePoll(this.pollDraft);
    },

    toggleDate(date) {
      const next = new Set(this.pollDraft.includedDates || []);
      next.has(date) ? next.delete(date) : next.add(date);
      this.pollDraft.includedDates = this.allDatesInRange.filter((candidate) => next.has(candidate));
    },

    selectAllDates() {
      this.pollDraft.includedDates = [...this.allDatesInRange];
    },

    clearIncludedDates() {
      this.pollDraft.includedDates = [];
    },

    selectWeekdays(weekdayNumbers) {
      this.pollDraft.includedDates = this.allDatesInRange.filter((date) => {
        const jsDay = new Date(`${date}T00:00:00`).getDay();
        const normalized = jsDay === 0 ? 7 : jsDay;
        return weekdayNumbers.includes(normalized);
      });
    },

    updateOwnerResponse(nextResponse) {
      this.ownerResponse = nextResponse;
      TaskPollFakeService.updateOwnerResponse(nextResponse);
    },

    addDays
  }
};
</script>

<style scoped>
.quick-actions .btn {
  white-space: nowrap;
}

.date-chip-week-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 5.25rem));
  gap: 0.35rem;
  align-items: stretch;
}

.date-chip-placeholder {
  min-height: 3.1rem;
}

.date-chip {
  min-height: 3.1rem;
  padding: 0.25rem 0.35rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  line-height: 1.1;
}

.date-chip-weekday {
  display: block;
  font-size: 0.78rem;
  font-weight: 600;
}

.date-chip-date {
  display: block;
  font-size: 0.74rem;
}
</style>
