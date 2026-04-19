<template>
  <div class="card shadow-sm h-100 participant-summary-card">
    <div class="card-body d-flex flex-column gap-3">
      <div class="d-flex justify-content-between align-items-start gap-2">
        <div>
          <h5 class="card-title mb-1">Teilnehmende</h5>
          <div class="small text-muted">
            {{ participants.length }} insgesamt · {{ internalCount }} intern · {{ externalCount }} extern
          </div>
        </div>
        <button type="button" class="btn btn-primary btn-sm" @click="$refs.participantModal.show()">
          Teilnehmer auswählen
        </button>
      </div>

      <div v-if="participants.length === 0" class="border rounded p-3 bg-light-subtle small text-muted">
        Noch keine Teilnehmenden ausgewählt.
      </div>

      <div v-else class="d-flex flex-column gap-2 participant-list">
        <div
          v-for="participant in participants"
          :key="participant.id"
          class="border rounded px-3 py-2 d-flex justify-content-between align-items-center gap-2"
        >
          <div class="min-w-0">
            <div class="fw-semibold text-truncate">{{ participant.displayName }}</div>
            <div class="small text-muted text-truncate">{{ participant.email || 'interner Teilnehmer' }}</div>
          </div>
          <span class="badge flex-shrink-0" :class="participant.type === 'internal' ? 'text-bg-primary' : 'text-bg-secondary'">
            {{ participant.type === 'internal' ? 'intern' : 'extern' }}
          </span>
        </div>
      </div>
    </div>

    <TaskPollParticipantModal
        ref="participantModal"
        :model-value="participants"
        :project-id="projectId"
        @update:modelValue="$emit('update:modelValue', $event)"
    />
  </div>
</template>

<script>
import TaskPollParticipantModal from '@/components/TaskPollParticipantModal.vue';

export default {
  name: 'TaskPollParticipantEditor',
  components: {
    TaskPollParticipantModal
  },
  props: {
    modelValue: {
      type: Array,
      default: () => []
    },
    projectId: {
      type: Number,
      default: null
    }
  },
  emits: ['update:modelValue'],
  computed: {
    participants() {
      return this.modelValue || [];
    },
    internalCount() {
      return this.participants.filter((participant) => participant.type === 'internal').length;
    },
    externalCount() {
      return this.participants.filter((participant) => participant.type === 'external').length;
    }
  }
};
</script>

<style scoped>
.participant-summary-card {
  position: sticky;
  top: 5rem;
}

.participant-list {
  max-height: 28rem;
  overflow-y: auto;
}

.min-w-0 {
  min-width: 0;
}
</style>
