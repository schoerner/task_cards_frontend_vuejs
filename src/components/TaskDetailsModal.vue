<template>
  <div class="modal fade" id="taskDetailsModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-xl modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header">
          <div class="w-100">
            <h5 class="modal-title mb-1">
              {{ taskDetails?.title || 'Task-Details' }}
            </h5>
            <div class="d-flex flex-wrap gap-2">
              <span class="badge" :class="priorityBadgeClass(taskDetails?.priority)">
                {{ taskDetails?.priority || 'MEDIUM' }}
              </span>
              <span class="badge" :class="isActive ? 'text-bg-success' : 'text-bg-secondary'">
                {{ isActive ? 'Tracking aktiv' : 'Inaktiv' }}
              </span>
              <span v-if="taskDetails?.archived" class="badge text-bg-dark">
                archiviert
              </span>
            </div>
          </div>

          <button type="button" class="btn-close" @click="hide"></button>
        </div>

        <div class="modal-body">
          <div v-if="loading" class="text-muted">Task-Details werden geladen...</div>

          <div v-else-if="errorMessage" class="alert alert-danger">
            {{ errorMessage }}
          </div>

          <div v-else-if="taskDetails" class="row g-4">
            <div class="col-lg-7">
              <div class="card shadow-sm border-0">
                <div class="card-body">
                  <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                    <h6 class="card-title mb-0">Allgemein</h6>

                    <div class="d-flex flex-wrap gap-2">
                      <button
                          class="btn btn-sm"
                          :class="isActive ? 'btn-outline-danger' : 'btn-outline-success'"
                          @click="toggleTimeTracking"
                          :disabled="busy"
                      >
                        {{ isActive ? 'Stop' : 'Start' }}
                      </button>

                      <button
                          class="btn btn-sm btn-outline-primary"
                          @click="toggleEditMode"
                          :disabled="busy"
                      >
                        {{ editMode ? 'Bearbeitung abbrechen' : 'Bearbeiten' }}
                      </button>

                      <button
                          class="btn btn-sm btn-outline-warning"
                          v-if="!taskDetails.archived"
                          @click="archiveTask"
                          :disabled="busy"
                      >
                        Archivieren
                      </button>

                      <button
                          class="btn btn-sm btn-outline-secondary"
                          v-else
                          @click="restoreTask"
                          :disabled="busy"
                      >
                        Wiederherstellen
                      </button>

                      <button
                          class="btn btn-sm btn-outline-danger"
                          @click="deleteTask"
                          :disabled="busy"
                      >
                        Löschen
                      </button>
                    </div>
                  </div>

                  <div v-if="!editMode">
                    <div class="detail-grid">
                      <div>
                        <div class="detail-label">Titel</div>
                        <div class="detail-value">{{ taskDetails.title || '-' }}</div>
                      </div>

                      <div>
                        <div class="detail-label">Projekt</div>
                        <div class="detail-value">{{ taskDetails.project?.name || '-' }}</div>
                      </div>

                      <div>
                        <div class="detail-label">Spalte</div>
                        <div class="detail-value">{{ taskDetails.boardColumn?.name || '-' }}</div>
                      </div>

                      <div>
                        <div class="detail-label">Priorität</div>
                        <div class="detail-value">{{ taskDetails.priority || '-' }}</div>
                      </div>

                      <div>
                        <div class="detail-label">Fällig</div>
                        <div class="detail-value">{{ formatDate(taskDetails.dueDate) }}</div>
                      </div>

                      <div>
                        <div class="detail-label">Schätzung</div>
                        <div class="detail-value">{{ taskDetails.estimatedMinutes ?? 0 }} Min.</div>
                      </div>

                      <div>
                        <div class="detail-label">Getrackt</div>
                        <div class="detail-value">{{ taskDetails.trackedMinutes ?? 0 }} Min.</div>
                      </div>

                      <div>
                        <div class="detail-label">Aktiv</div>
                        <div class="detail-value">{{ isActive ? 'Ja' : 'Nein' }}</div>
                      </div>
                    </div>

                    <hr>

                    <div>
                      <div class="detail-label mb-2">Beschreibung</div>
                      <div class="detail-value description-box">
                        {{ taskDetails.description || 'Keine Beschreibung vorhanden.' }}
                      </div>
                    </div>
                  </div>

                  <form v-else @submit.prevent="saveTask">
                    <div class="row g-3">
                      <div class="col-12">
                        <label class="form-label">Titel</label>
                        <input v-model.trim="editForm.title" type="text" class="form-control" required>
                      </div>

                      <div class="col-12">
                        <label class="form-label">Beschreibung</label>
                        <textarea v-model.trim="editForm.description" class="form-control" rows="4"></textarea>
                      </div>

                      <div class="col-md-4">
                        <label class="form-label">Priorität</label>
                        <select v-model="editForm.priority" class="form-select">
                          <option value="LOW">LOW</option>
                          <option value="MEDIUM">MEDIUM</option>
                          <option value="HIGH">HIGH</option>
                          <option value="URGENT">URGENT</option>
                        </select>
                      </div>

                      <div class="col-md-4">
                        <label class="form-label">Fällig bis</label>
                        <input v-model="editForm.dueDate" type="datetime-local" class="form-control">
                      </div>

                      <div class="col-md-4">
                        <label class="form-label">Schätzung (Min.)</label>
                        <input v-model.number="editForm.estimatedMinutes" type="number" min="0" class="form-control">
                      </div>

                      <div class="col-md-6">
                        <label class="form-label">Spalte</label>
                        <select v-model="editForm.boardColumnId" class="form-select">
                          <option
                              v-for="column in boardColumns"
                              :key="column.id"
                              :value="column.id"
                          >
                            {{ column.name }}
                          </option>
                        </select>
                      </div>

                      <div class="col-md-6">
                        <label class="form-label">Archiviert</label>
                        <div class="form-check mt-2">
                          <input v-model="editForm.archived" class="form-check-input" type="checkbox" id="taskArchived">
                          <label class="form-check-label" for="taskArchived">Task archiviert</label>
                        </div>
                      </div>
                    </div>

                    <div class="d-flex justify-content-end gap-2 mt-3">
                      <button type="button" class="btn btn-secondary" @click="toggleEditMode">
                        Abbrechen
                      </button>
                      <button type="submit" class="btn btn-primary" :disabled="busy">
                        Speichern
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              <div class="card shadow-sm border-0 mt-4">
                <div class="card-body">
                  <div class="d-flex justify-content-between align-items-center mb-3">
                    <h6 class="card-title mb-0">Kommentare</h6>
                    <span class="badge text-bg-secondary">{{ comments.length }}</span>
                  </div>

                  <form @submit.prevent="createComment" class="mb-4">
                    <label class="form-label">Neuer Kommentar</label>
                    <textarea
                        v-model.trim="commentForm.content"
                        class="form-control"
                        rows="3"
                        maxlength="10000"
                        placeholder="Kommentar eingeben..."
                        :disabled="busyComment"
                    ></textarea>

                    <div class="d-flex justify-content-end mt-2">
                      <button class="btn btn-primary btn-sm" type="submit" :disabled="busyComment || !commentForm.content">
                        {{ busyComment ? 'Speichert...' : 'Kommentar speichern' }}
                      </button>
                    </div>
                  </form>

                  <div v-if="comments.length === 0" class="text-muted">
                    Noch keine Kommentare vorhanden.
                  </div>

                  <div v-else class="d-flex flex-column gap-3">
                    <div
                        v-for="comment in sortedComments"
                        :key="comment.id"
                        class="border rounded p-3"
                    >
                      <div class="d-flex justify-content-between align-items-start gap-2 mb-2">
                        <div>
                          <div class="fw-semibold">
                            {{ commentAuthorLabel(comment) }}
                          </div>
                          <div class="small text-muted">
                            {{ formatDate(comment.createdAt) }}
                          </div>
                        </div>

                        <button
                            class="btn btn-sm btn-outline-danger"
                            @click="deleteComment(comment.id)"
                            :disabled="busyComment"
                        >
                          Löschen
                        </button>
                      </div>

                      <div class="comment-content">
                        {{ comment.content }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="col-lg-5">
              <div class="card shadow-sm border-0">
                <div class="card-body">
                  <div class="d-flex justify-content-between align-items-center mb-3">
                    <h6 class="card-title mb-0">Time Records</h6>
                    <span class="badge text-bg-secondary">{{ timeRecords.length }}</span>
                  </div>

                  <div v-if="timeRecords.length === 0" class="text-muted">
                    Noch keine Zeitbuchungen vorhanden.
                  </div>

                  <div v-else class="table-responsive">
                    <table class="table table-sm align-middle">
                      <thead>
                      <tr>
                        <th>ID</th>
                        <th>Start</th>
                        <th>Ende</th>
                        <th>Dauer</th>
                      </tr>
                      </thead>
                      <tbody>
                      <tr v-for="record in sortedTimeRecords" :key="record.id">
                        <td>{{ record.id }}</td>
                        <td>{{ formatDate(record.timeStart) }}</td>
                        <td>{{ formatDate(record.timeEnd) }}</td>
                        <td>{{ formatDuration(record.timeStart, record.timeEnd) }}</td>
                      </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div v-if="modalInnerError" class="alert alert-danger mt-3 mb-0">
                {{ modalInnerError }}
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" @click="hide">Schließen</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Modal } from 'bootstrap';
import TaskService from '@/services/task.service.js';
import TaskCommentService from '@/services/task-comment.service.js';
import BoardColumnService from '@/services/board-column.service.js';

export default {
  name: 'TaskDetailsModal',
  emits: ['task-updated', 'task-deleted'],
  data() {
    return {
      modalInstance: null,
      taskId: null,
      taskDetails: null,
      comments: [],
      timeRecords: [],
      boardColumns: [],
      loading: false,
      busy: false,
      busyComment: false,
      errorMessage: '',
      modalInnerError: '',
      commentForm: {
        content: ''
      },
      isActive: false,
      editMode: false,
      editForm: {
        title: '',
        description: '',
        priority: 'MEDIUM',
        dueDate: '',
        estimatedMinutes: 0,
        boardColumnId: null,
        archived: false
      }
    };
  },
  computed: {
    sortedComments() {
      return [...this.comments].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },
    sortedTimeRecords() {
      return [...this.timeRecords].sort((a, b) => new Date(b.timeStart) - new Date(a.timeStart));
    }
  },
  mounted() {
    this.modalInstance = new Modal(document.getElementById('taskDetailsModal'));
  },
  methods: {
    async open(taskId) {
      this.taskId = taskId;
      this.commentForm.content = '';
      this.modalInnerError = '';
      this.editMode = false;
      this.modalInstance.show();
      await this.loadAll();
    },

    hide() {
      this.modalInstance.hide();
    },

    async loadAll() {
      if (!this.taskId) {
        return;
      }

      this.loading = true;
      this.errorMessage = '';

      try {
        const [taskResponse, recordsResponse, commentsResponse] = await Promise.all([
          TaskService.getTask(this.taskId),
          TaskService.getTimeRecords(this.taskId),
          TaskCommentService.getComments(this.taskId)
        ]);

        this.taskDetails = taskResponse.data;
        this.timeRecords = recordsResponse.data || [];
        this.comments = commentsResponse.data || [];
        this.isActive = !!taskResponse.data?.active;

        this.editForm = {
          title: taskResponse.data?.title || '',
          description: taskResponse.data?.description || '',
          priority: taskResponse.data?.priority || 'MEDIUM',
          dueDate: this.toLocalDateTime(taskResponse.data?.dueDate),
          estimatedMinutes: taskResponse.data?.estimatedMinutes ?? 0,
          boardColumnId: taskResponse.data?.boardColumn?.id ?? null,
          archived: !!taskResponse.data?.archived
        };

        const projectId = taskResponse.data?.project?.id;
        if (projectId) {
          const columnsResponse = await BoardColumnService.getBoardColumns(projectId);
          this.boardColumns = columnsResponse.data || [];
        } else {
          this.boardColumns = [];
        }
      } catch (error) {
        this.errorMessage =
            error?.response?.data?.message ||
            error?.response?.data ||
            error?.message ||
            'Task-Details konnten nicht geladen werden.';
      } finally {
        this.loading = false;
      }
    },

    toggleEditMode() {
      this.editMode = !this.editMode;

      if (this.editMode && this.taskDetails) {
        this.editForm = {
          title: this.taskDetails.title || '',
          description: this.taskDetails.description || '',
          priority: this.taskDetails.priority || 'MEDIUM',
          dueDate: this.toLocalDateTime(this.taskDetails.dueDate),
          estimatedMinutes: this.taskDetails.estimatedMinutes ?? 0,
          boardColumnId: this.taskDetails.boardColumn?.id ?? null,
          archived: !!this.taskDetails.archived
        };
      }
    },

    async saveTask() {
      this.busy = true;
      this.modalInnerError = '';

      try {
        await TaskService.updateTask(this.taskId, {
          title: this.editForm.title,
          description: this.editForm.description || null,
          boardColumnId: this.editForm.boardColumnId ? Number(this.editForm.boardColumnId) : null,
          priority: this.editForm.priority,
          dueDate: this.editForm.dueDate ? new Date(this.editForm.dueDate).toISOString() : null,
          estimatedMinutes: Number(this.editForm.estimatedMinutes || 0),
          trackedMinutes: this.taskDetails?.trackedMinutes ?? 0,
          archived: !!this.editForm.archived,
          assigneeIds: [],
          labelIds: []
        });

        this.editMode = false;
        await this.loadAll();
        this.$emit('task-updated', this.taskId);
      } catch (error) {
        this.modalInnerError =
            error?.response?.data?.message ||
            error?.response?.data ||
            error?.message ||
            'Task konnte nicht gespeichert werden.';
      } finally {
        this.busy = false;
      }
    },

    async toggleTimeTracking() {
      this.busy = true;
      this.modalInnerError = '';

      try {
        if (this.isActive) {
          await TaskService.stopTimeTracking(this.taskId);
        } else {
          await TaskService.startTimeTracking(this.taskId);
        }

        await this.loadAll();
        this.$emit('task-updated', this.taskId);
      } catch (error) {
        this.modalInnerError =
            error?.response?.data?.message ||
            error?.response?.data ||
            error?.message ||
            'Zeittracking konnte nicht aktualisiert werden.';
      } finally {
        this.busy = false;
      }
    },

    async archiveTask() {
      this.busy = true;
      this.modalInnerError = '';

      try {
        await TaskService.archiveTask(this.taskId);
        await this.loadAll();
        this.$emit('task-updated', this.taskId);
      } catch (error) {
        this.modalInnerError =
            error?.response?.data?.message ||
            error?.response?.data ||
            error?.message ||
            'Task konnte nicht archiviert werden.';
      } finally {
        this.busy = false;
      }
    },

    async restoreTask() {
      this.busy = true;
      this.modalInnerError = '';

      try {
        await TaskService.restoreTask(this.taskId);
        await this.loadAll();
        this.$emit('task-updated', this.taskId);
      } catch (error) {
        this.modalInnerError =
            error?.response?.data?.message ||
            error?.response?.data ||
            error?.message ||
            'Task konnte nicht wiederhergestellt werden.';
      } finally {
        this.busy = false;
      }
    },

    async deleteTask() {
      if (!window.confirm('Soll diese Task wirklich gelöscht werden?')) {
        return;
      }

      this.busy = true;
      this.modalInnerError = '';

      try {
        await TaskService.deleteTask(this.taskId);
        this.hide();
        this.$emit('task-deleted', this.taskId);
      } catch (error) {
        this.modalInnerError =
            error?.response?.data?.message ||
            error?.response?.data ||
            error?.message ||
            'Task konnte nicht gelöscht werden.';
      } finally {
        this.busy = false;
      }
    },

    async createComment() {
      if (!this.commentForm.content) {
        return;
      }

      this.busyComment = true;
      this.modalInnerError = '';

      try {
        await TaskCommentService.createComment(this.taskId, {
          content: this.commentForm.content
        });

        this.commentForm.content = '';
        await this.loadAll();
        this.$emit('task-updated', this.taskId);
      } catch (error) {
        this.modalInnerError =
            error?.response?.data?.message ||
            error?.response?.data ||
            error?.message ||
            'Kommentar konnte nicht gespeichert werden.';
      } finally {
        this.busyComment = false;
      }
    },

    async deleteComment(commentId) {
      this.busyComment = true;
      this.modalInnerError = '';

      try {
        await TaskCommentService.deleteComment(this.taskId, commentId);
        await this.loadAll();
        this.$emit('task-updated', this.taskId);
      } catch (error) {
        this.modalInnerError =
            error?.response?.data?.message ||
            error?.response?.data ||
            error?.message ||
            'Kommentar konnte nicht gelöscht werden.';
      } finally {
        this.busyComment = false;
      }
    },

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
      if (!value) {
        return '—';
      }

      try {
        return new Date(value).toLocaleString('de-DE');
      } catch {
        return String(value);
      }
    },

    formatDuration(start, end) {
      if (!start) {
        return '—';
      }

      const startDate = new Date(start);
      const endDate = end ? new Date(end) : new Date();

      if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
        return '—';
      }

      const diffMs = Math.max(0, endDate.getTime() - startDate.getTime());
      const totalMinutes = Math.floor(diffMs / 60000);
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;

      if (hours > 0) {
        return `${hours} h ${minutes} min`;
      }
      return `${minutes} min`;
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

<style scoped>
.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.detail-label {
  font-size: 0.85rem;
  color: var(--bs-secondary-color);
  margin-bottom: 0.25rem;
}

.detail-value {
  font-weight: 500;
  word-break: break-word;
}

.description-box,
.comment-content {
  white-space: pre-wrap;
}

@media (max-width: 768px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>