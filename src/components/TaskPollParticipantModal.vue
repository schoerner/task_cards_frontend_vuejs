<template>
  <teleport to="body">
    <div class="modal fade" ref="modalElement" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-xl participant-modal-dialog modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Teilnehmer auswählen</h5>
          <button type="button" class="btn-close" @click="hide"></button>
        </div>

        <div class="modal-body">
          <div class="row g-4 align-items-start">
            <div class="col-lg-7">
              <div class="d-flex flex-column gap-4">
                <div class="border rounded p-3">
                  <div class="d-flex justify-content-between align-items-start gap-3 mb-2">
                    <div>
                      <div class="fw-semibold">Externe Teilnehmende</div>
                      <div class="small text-muted">
                        Mehrere Adressen einfügen. Unterstützt auch Formate wie
                        <code>Max Mustermann &lt;max@example.org&gt;</code>.
                      </div>
                    </div>
                  </div>

                  <textarea
                      v-model="externalInput"
                      class="form-control mb-2"
                      rows="7"
                      placeholder="anna@example.org&#10;Max Mustermann <max@example.org>&#10;Heike Musterfrau <heike@example.net>"
                  ></textarea>

                  <div class="d-flex flex-wrap gap-2 justify-content-between align-items-center">
                    <button type="button" class="btn btn-primary btn-sm" @click="importExternalEntries">
                      Externe übernehmen
                    </button>
                    <div class="small text-muted">
                      {{ parsedPreviewCount }} erkannte Adresse(n)
                    </div>
                  </div>
                </div>

                <div class="border rounded p-3">
                  <div class="fw-semibold mb-2">Interne Teilnehmende</div>
                  <input
                      v-model.trim="memberSearch"
                      type="text"
                      class="form-control mb-3"
                      placeholder="Name oder E-Mail suchen"
                  />

                  <div v-if="loadingInternalMembers" class="small text-muted mb-2">
                    Projektmitglieder werden geladen...
                  </div>

                  <div v-else-if="internalMemberError" class="alert alert-danger py-2 mb-2">
                    {{ internalMemberError }}
                  </div>

                  <div v-else class="candidate-list d-flex flex-column gap-2">
                    <button
                        v-for="candidate in filteredCandidates"
                        :key="candidate.id"
                        type="button"
                        class="btn btn-outline-secondary text-start"
                        :disabled="selectedInternalUserIds.has(Number(candidate.userId))"
                        @click="addInternalCandidate(candidate)"
                    >
                      <div class="fw-semibold">{{ candidate.displayName }}</div>
                      <div class="small text-muted">{{ candidate.email }}</div>
                    </button>

                    <div v-if="filteredCandidates.length === 0" class="small text-muted">
                      Keine passenden Projektmitglieder gefunden.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="col-lg-5">
              <div class="border rounded p-3 selected-participants-panel">
                <div class="d-flex justify-content-between align-items-center gap-2 mb-2">
                  <div class="fw-semibold">Ausgewählte Teilnehmende</div>
                  <div class="small text-muted">{{ draftParticipants.length }} Eintrag / Einträge</div>
                </div>

                <div v-if="draftParticipants.length === 0" class="text-muted small border rounded p-3 bg-light-subtle">
                  Noch keine Teilnehmenden ausgewählt.
                </div>

                <div v-else class="list-group compact-list">
                  <div
                      v-for="participant in draftParticipants"
                      :key="participant.id"
                      class="list-group-item d-flex justify-content-between align-items-start gap-3"
                  >
                    <div class="min-w-0">
                      <div class="fw-semibold text-truncate">{{ participant.displayName }}</div>
                      <div class="small text-muted text-truncate">{{ participant.email || 'ohne E-Mail' }}</div>
                    </div>
                    <div class="d-flex align-items-center gap-2 flex-shrink-0">
            <span class="badge" :class="participant.type === 'internal' ? 'text-bg-primary' : 'text-bg-secondary'">
              {{ participant.type === 'internal' ? 'intern' : 'extern' }}
            </span>
                      <button type="button" class="btn btn-sm btn-outline-danger" @click="removeDraftParticipant(participant.id)">
                        Entfernen
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="hide">Abbrechen</button>
          <button type="button" class="btn btn-primary" @click="apply">Übernehmen</button>
        </div>
      </div>
    </div>
  </div>
  </teleport>
</template>

<script>
import { Modal } from 'bootstrap';
import TaskPollFakeService from '@/services/task-poll.fake.service.js';
import ProjectMemberService from '@/services/project-member.service.js';

export default {
  name: 'TaskPollParticipantModal',
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
  data() {
    return {
      modalInstance: null,
      draftParticipants: [],
      externalInput: '',
      memberSearch: '',
      availableInternalMembers: [],
      loadingInternalMembers: false,
      internalMemberError: ''
    };
  },
  computed: {
    selectedIds() {
      return new Set(
          this.draftParticipants
              .map((participant) => participant.id)
              .filter(Boolean)
      );
    },

    selectedInternalUserIds() {
      return new Set(
          this.draftParticipants
              .filter((participant) => participant.type === 'internal' && participant.userId != null)
              .map((participant) => Number(participant.userId))
      );
    },

    selectedExternalEmails() {
      return new Set(
          this.draftParticipants
              .filter((participant) => participant.type === 'external')
              .map((participant) => (participant.email || '').trim().toLowerCase())
              .filter(Boolean)
      );
    },
    filteredCandidates() {
      const needle = (this.memberSearch || '').toLowerCase();

      return this.availableInternalMembers.filter((member) => {
        if (!needle) return true;

        return (member.displayName || '').toLowerCase().includes(needle)
            || (member.email || '').toLowerCase().includes(needle);
      });
    },
    parsedPreviewCount() {
      return this.externalInput
        .split(/\n|;|,(?=[^,]*@)/)
        .map((entry) => entry.trim())
        .filter(Boolean)
        .length;
    }
  },
  watch: {
    modelValue: {
      immediate: true,
      handler(value) {
        this.draftParticipants = JSON.parse(JSON.stringify(value || []));
      }
    }
  },
  mounted() {
    this.modalInstance = new Modal(this.$refs.modalElement);
  },
  methods: {
    resolveMemberDisplayName(member) {
      return (
          member.name ||
          member.displayName ||
          member.profile?.displayName ||
          member.profile?.name ||
          member.userProfile?.displayName ||
          member.userProfile?.name ||
          member.user?.profile?.displayName ||
          member.user?.profile?.name ||
          [member.firstName, member.lastName].filter(Boolean).join(' ').trim() ||
          [member.user?.firstName, member.user?.lastName].filter(Boolean).join(' ').trim() ||
          member.contactEmail ||
          member.profile?.contactEmail ||
          member.userProfile?.contactEmail ||
          member.user?.profile?.contactEmail ||
          `User ${member.userId}`
      );
    },

    resolveMemberEmail(member) {
      return (
          member.contactEmail ||
          member.profile?.contactEmail ||
          member.userProfile?.contactEmail ||
          member.user?.profile?.contactEmail ||
          member.email ||
          member.user?.email ||
          ''
      );
    },

    async loadInternalMembers() {
      if (!this.projectId) {
        this.availableInternalMembers = [];
        return;
      }

      this.loadingInternalMembers = true;
      this.internalMemberError = '';

      try {
        const response = await ProjectMemberService.getMembers(this.projectId);
        const members = response?.data || [];

        this.availableInternalMembers = members.map((member) => {
          const userId = member.userId ?? member.user?.id ?? member.id;

          return {
            id: `internal-${userId}`,
            type: 'internal',
            userId,
            displayName: this.resolveMemberDisplayName(member),
            email: this.resolveMemberEmail(member),
            response: {
              participantId: `internal-${userId}`,
              slots: {}
            }
          };
        });
      } catch (error) {
        this.availableInternalMembers = [];
        this.internalMemberError =
            error?.response?.data?.detail ||
            error?.response?.data?.message ||
            error?.message ||
            'Projektmitglieder konnten nicht geladen werden.';
      } finally {
        this.loadingInternalMembers = false;
      }
    },
    async show() {
      this.draftParticipants = JSON.parse(JSON.stringify(this.modelValue || []));
      this.externalInput = '';
      this.memberSearch = '';
      await this.loadInternalMembers();
      this.modalInstance?.show();
    },
    hide() {
      this.modalInstance?.hide();
    },
    addInternalCandidate(candidate) {
      if (!candidate?.userId) {
        return;
      }

      const userId = Number(candidate.userId);

      if (this.selectedInternalUserIds.has(userId)) {
        return;
      }

      this.draftParticipants.push({
        id: null,
        type: 'internal',
        userId,
        displayName: candidate.displayName,
        email: candidate.email,
        responseName: null,
        response: []
      });
    },
    importExternalEntries() {
      const created = TaskPollFakeService.importExternalParticipants(this.externalInput);

      const existingEmails = new Set(
          this.draftParticipants
              .filter((participant) => participant.type === 'external')
              .map((participant) => (participant.email || '').trim().toLowerCase())
              .filter(Boolean)
      );

      created.forEach((participant) => {
        const normalizedEmail = (participant.email || '').trim().toLowerCase();

        if (!normalizedEmail || existingEmails.has(normalizedEmail)) {
          return;
        }

        this.draftParticipants.push(participant);
        existingEmails.add(normalizedEmail);
      });

      this.externalInput = '';
    },
    removeDraftParticipant(participantId) {
      this.draftParticipants = this.draftParticipants.filter((participant) => participant.id !== participantId);
    },
    apply() {
      this.$emit('update:modelValue', JSON.parse(JSON.stringify(this.draftParticipants)));
      this.hide();
    }
  }
};
</script>

<style scoped>
.participant-modal-dialog {
  max-width: min(92vw, 1400px);
}

.candidate-list {
  max-height: 20rem;
  overflow-y: auto;
}

.selected-participants-panel {
  min-height: 100%;
}

.compact-list {
  max-height: 32rem;
  overflow-y: auto;
}

.min-w-0 {
  min-width: 0;
}
</style>
