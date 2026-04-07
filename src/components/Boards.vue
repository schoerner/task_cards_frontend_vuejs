<template>
  <div class="container py-4">
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
      <div>
        <h2 class="mb-1">Boards</h2>
        <p class="text-muted mb-0">
          Projektbezogene Kanban-Ansicht mit Spaltenverwaltung, Drag-and-drop und Task-Details.
        </p>
      </div>

      <div class="d-flex gap-2">
        <button class="btn btn-outline-secondary" @click="reloadBoard" :disabled="loading">
          Neu laden
        </button>
        <button class="btn btn-outline-primary" @click="openCreateTaskModal()" :disabled="!selectedProjectId">
          + Task
        </button>
        <button class="btn btn-primary" @click="openCreateColumnModal" :disabled="!selectedProjectId || !canManageBoard">
          + Spalte
        </button>
      </div>
    </div>

    <div v-if="statusMessage" class="alert alert-success alert-dismissible fade show" role="alert">
      {{ statusMessage }}
      <button type="button" class="btn-close" @click="statusMessage = ''"></button>
    </div>

    <div v-if="errorMessage" class="alert alert-danger alert-dismissible fade show" role="alert">
      {{ errorMessage }}
      <button type="button" class="btn-close" @click="errorMessage = ''"></button>
    </div>

    <div class="card mb-4">
      <div class="card-body">
        <div class="row g-3 align-items-end">
          <div class="col-md-8">
            <label for="projectSelect" class="form-label">Projekt</label>
            <select
                id="projectSelect"
                v-model="selectedProjectId"
                class="form-select"
                @change="onProjectChanged"
            >
              <option :value="null" disabled>-- Projekt auswählen --</option>
              <option v-for="project in activeProjects" :key="project.id" :value="project.id">
                {{ project.name }}
              </option>
            </select>
          </div>

          <div class="col-md-4">
            <div v-if="selectedProject" class="border rounded p-3 bg-light">
              <div class="fw-semibold">{{ selectedProject.name }}</div>
              <div class="small text-muted">
                Eigene Rolle:
                <span class="badge ms-1" :class="roleBadgeClass(currentUserRole)">
                  {{ currentUserRole || 'UNBEKANNT' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="loading" class="text-muted mb-3">
      Board wird geladen...
    </div>

    <div v-if="selectedProjectId && !loading">
      <div v-if="sortedBoardColumns.length === 0" class="alert alert-warning">
        Keine Board-Spalten vorhanden.
      </div>

      <div v-else class="board-scroll">
        <div class="board-row">
          <div
              v-for="column in sortedBoardColumns"
              :key="column.id"
              class="board-column"
              :class="{
              'drop-highlight': hoveredTaskColumnId === Number(column.id),
              'column-drop-highlight': hoveredColumnDropId === Number(column.id)
            }"
              @dragover.prevent="onCombinedDragOver(column.id, $event)"
              @dragleave="onCombinedDragLeave(column.id, $event)"
              @drop="handleCombinedDrop(column.id, $event)"
          >
            <div class="card shadow-sm h-100">
              <div class="card-header bg-white">
                <div class="d-flex justify-content-between align-items-start gap-2">
                  <div class="d-flex align-items-start gap-2 flex-grow-1 min-w-0">
                    <button
                        v-if="canManageBoard"
                        class="btn btn-sm btn-light drag-handle-column"
                        type="button"
                        title="Spalte verschieben"
                        draggable="true"
                        @dragstart="onColumnDragStart(column, $event)"
                        @dragend="onColumnDragEnd"
                        @click.stop
                    >
                      ⠿
                    </button>

                    <div class="min-w-0">
                      <div class="fw-semibold text-truncate">
                        {{ column.name }}
                      </div>
                      <div class="small text-muted">
                        {{ tasksByColumn(column.id).length }} Task(s)
                      </div>
                    </div>
                  </div>

                  <div class="d-flex gap-1 align-items-center">
                    <button
                        class="btn btn-sm btn-outline-primary"
                        @click="openCreateTaskModal(column.id)"
                        :disabled="!selectedProjectId"
                        :title="`Task in ${column.name} anlegen`"
                    >
                      +
                    </button>

                    <template v-if="canManageBoard">
                      <button
                          class="btn btn-sm btn-outline-secondary"
                          @click="openEditColumnModal(column)"
                          title="Spalte bearbeiten"
                      >
                        <i class="bi bi-pencil-fill"></i>
                      </button>
                      <button
                          class="btn btn-sm btn-outline-danger"
                          @click="openDeleteColumnModal(column)"
                          :disabled="column.deletable === false"
                          title="Spalte löschen"
                      >
                        <i class="bi bi-trash-fill"></i>
                      </button>
                    </template>
                  </div>
                </div>
              </div>

              <div class="card-body board-column-body">
                <div v-if="tasksByColumn(column.id).length === 0" class="text-muted small">
                  Keine Tasks in dieser Spalte.
                </div>

                <div class="d-flex flex-column gap-3">
                  <task-board-card
                      v-for="task in tasksByColumn(column.id)"
                      :key="task.id"
                      :task="task"
                      @open-details="openTaskDetails"
                      @time-tracking-changed="handleTaskChanged"
                      @drag-started="onTaskDragStarted"
                      @drag-ended="onTaskDragEnded"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="!loading" class="alert alert-info">
      Bitte zuerst ein Projekt auswählen.
    </div>

    <task-details-modal
        ref="taskDetailsModal"
        @task-updated="handleTaskChanged"
        @task-deleted="handleTaskDeleted"
    />

    <!-- Create Task Modal -->
    <div class="modal fade" id="createTaskModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <form @submit.prevent="createTask">
            <div class="modal-header">
              <h5 class="modal-title">Task anlegen</h5>
              <button type="button" class="btn-close" @click="hideCreateTaskModal"></button>
            </div>
            <div class="modal-body">
              <div class="row g-3">
                <div class="col-12">
                  <label class="form-label">Titel</label>
                  <input v-model.trim="createTaskForm.title" type="text" class="form-control" required>
                </div>

                <div class="col-12">
                  <label class="form-label">Beschreibung</label>
                  <textarea v-model.trim="createTaskForm.description" class="form-control" rows="4"></textarea>
                </div>

                <div class="col-md-4">
                  <label class="form-label">Priorität</label>
                  <select v-model="createTaskForm.priority" class="form-select">
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="URGENT">URGENT</option>
                  </select>
                </div>

                <div class="col-md-4">
                  <label class="form-label">Fällig bis</label>
                  <input v-model="createTaskForm.dueDate" type="datetime-local" class="form-control">
                </div>

                <div class="col-md-4">
                  <label class="form-label">Schätzung (Min.)</label>
                  <input v-model.number="createTaskForm.estimatedMinutes" type="number" min="0" class="form-control">
                </div>

                <div class="col-md-6">
                  <label class="form-label">Startspalte</label>
                  <select v-model="createTaskForm.boardColumnId" class="form-select">
                    <option :value="null">Automatisch / Standardspalte</option>
                    <option v-for="column in sortedBoardColumns" :key="column.id" :value="column.id">
                      {{ column.name }}
                    </option>
                  </select>
                </div>
              </div>

              <div v-if="modalErrorMessage" class="alert alert-danger mt-3 mb-0">
                {{ modalErrorMessage }}
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="hideCreateTaskModal">Abbrechen</button>
              <button type="submit" class="btn btn-primary" :disabled="savingTask">
                {{ savingTask ? 'Speichert...' : 'Task anlegen' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Create Column Modal -->
    <div class="modal fade" id="createColumnModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <form @submit.prevent="createColumn">
            <div class="modal-header">
              <h5 class="modal-title">Spalte anlegen</h5>
              <button type="button" class="btn-close" @click="hideCreateColumnModal"></button>
            </div>
            <div class="modal-body">
              <div class="mb-3">
                <label class="form-label">Name</label>
                <input v-model.trim="createColumnForm.name" type="text" class="form-control" maxlength="100" required>
              </div>

              <div class="mb-0">
                <label class="form-label">Position</label>
                <input v-model.number="createColumnForm.position" type="number" min="0" max="999" class="form-control" required>
              </div>

              <div v-if="modalErrorMessage" class="alert alert-danger mt-3 mb-0">
                {{ modalErrorMessage }}
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="hideCreateColumnModal">Abbrechen</button>
              <button type="submit" class="btn btn-primary" :disabled="savingColumn">
                {{ savingColumn ? 'Speichert...' : 'Anlegen' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Edit Column Modal -->
    <div class="modal fade" id="editColumnModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <form @submit.prevent="saveColumn">
            <div class="modal-header">
              <h5 class="modal-title">Spalte bearbeiten</h5>
              <button type="button" class="btn-close" @click="hideEditColumnModal"></button>
            </div>
            <div class="modal-body">
              <div class="mb-3">
                <label class="form-label">Name</label>
                <input v-model.trim="editColumnForm.name" type="text" class="form-control" maxlength="100" required>
              </div>

              <div class="mb-0">
                <label class="form-label">Position</label>
                <input v-model.number="editColumnForm.position" type="number" min="0" max="999" class="form-control" required>
              </div>

              <div v-if="modalErrorMessage" class="alert alert-danger mt-3 mb-0">
                {{ modalErrorMessage }}
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="hideEditColumnModal">Abbrechen</button>
              <button type="submit" class="btn btn-primary" :disabled="savingColumn">
                {{ savingColumn ? 'Speichert...' : 'Speichern' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Delete Column Modal -->
    <div class="modal fade" id="deleteColumnModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <form @submit.prevent="deleteColumnConfirmed">
            <div class="modal-header">
              <h5 class="modal-title">Spalte löschen</h5>
              <button type="button" class="btn-close" @click="hideDeleteColumnModal"></button>
            </div>
            <div class="modal-body">
              <p class="mb-3">
                Soll die Spalte <strong>{{ columnToDelete?.name }}</strong> wirklich gelöscht werden?
              </p>

              <div class="mb-0">
                <label class="form-label">Fallback-Spalte für enthaltene Tasks</label>
                <select v-model="deleteColumnForm.fallbackColumnId" class="form-select" required>
                  <option :value="null" disabled>-- Zielspalte auswählen --</option>
                  <option
                      v-for="column in fallbackColumns"
                      :key="column.id"
                      :value="column.id"
                  >
                    {{ column.name }}
                  </option>
                </select>
              </div>

              <div v-if="modalErrorMessage" class="alert alert-danger mt-3 mb-0">
                {{ modalErrorMessage }}
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="hideDeleteColumnModal">Abbrechen</button>
              <button type="submit" class="btn btn-danger" :disabled="savingColumn">
                {{ savingColumn ? 'Löscht...' : 'Löschen' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Modal } from 'bootstrap';
import ProjectService from '@/services/project.service.js';
import ProjectMemberService from '@/services/project-member.service.js';
import BoardColumnService from '@/services/board-column.service.js';
import TaskService from '@/services/task.service.js';
import TaskBoardCard from '@/components/TaskBoardCard.vue';
import TaskDetailsModal from '@/components/TaskDetailsModal.vue';

export default {
  name: 'Boards',
  components: {
    TaskBoardCard,
    TaskDetailsModal
  },
  data() {
    return {
      loading: false,
      savingColumn: false,
      savingTask: false,
      errorMessage: '',
      modalErrorMessage: '',
      statusMessage: '',
      projects: [],
      members: [],
      boardColumns: [],
      tasks: [],
      selectedProjectId: null,

      draggedTaskId: null,
      hoveredTaskColumnId: null,

      draggedColumnId: null,
      hoveredColumnDropId: null,

      createTaskModal: null,
      createColumnModal: null,
      editColumnModal: null,
      deleteColumnModal: null,
      createTaskForm: {
        title: '',
        description: '',
        priority: 'MEDIUM',
        dueDate: '',
        estimatedMinutes: 0,
        boardColumnId: null
      },
      createColumnForm: {
        name: '',
        position: 0
      },
      editColumnForm: {
        id: null,
        name: '',
        position: 0
      },
      columnToDelete: null,
      deleteColumnForm: {
        fallbackColumnId: null
      }
    };
  },
  computed: {
    currentUser() {
      return this.$store.getters['auth/currentUser'];
    },
    isAdmin() {
      return this.$store.getters['auth/isAdmin'];
    },
    activeProjects() {
      return this.projects.filter(project => !project.archived);
    },
    selectedProject() {
      return this.projects.find(project => Number(project.id) === Number(this.selectedProjectId)) || null;
    },
    sortedBoardColumns() {
      return [...this.boardColumns].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
    },
    currentUserRole() {
      const ownMember = this.members.find(member => Number(member.userId) === Number(this.currentUser?.id));
      return ownMember?.role || null;
    },
    canManageBoard() {
      return this.isAdmin || this.currentUserRole === 'OWNER' || this.currentUserRole === 'MAINTAINER';
    },
    fallbackColumns() {
      return this.sortedBoardColumns.filter(column => Number(column.id) !== Number(this.columnToDelete?.id));
    }
  },
  async mounted() {
    this.createTaskModal = new Modal(document.getElementById('createTaskModal'));
    this.createColumnModal = new Modal(document.getElementById('createColumnModal'));
    this.editColumnModal = new Modal(document.getElementById('editColumnModal'));
    this.deleteColumnModal = new Modal(document.getElementById('deleteColumnModal'));

    await this.loadProjects();

    const routeProjectId = this.$route.query.projectId;
    if (routeProjectId && this.activeProjects.some(project => Number(project.id) === Number(routeProjectId))) {
      this.selectedProjectId = Number(routeProjectId);
      await this.reloadBoard();
    } else if (this.activeProjects.length > 0) {
      this.selectedProjectId = this.activeProjects[0].id;
      await this.reloadBoard();
    }
  },
  methods: {
    async loadProjects() {
      try {
        const response = await ProjectService.getVisibleProjects();
        this.projects = response.data || [];
      } catch (error) {
        this.errorMessage = this.extractErrorMessage(error, 'Projekte konnten nicht geladen werden.');
      }
    },

    async onProjectChanged() {
      this.$router.replace({
        path: '/boards',
        query: { projectId: this.selectedProjectId }
      });

      await this.reloadBoard();
    },

    async reloadBoard() {
      if (!this.selectedProjectId) {
        this.members = [];
        this.boardColumns = [];
        this.tasks = [];
        return;
      }

      this.loading = true;
      this.errorMessage = '';

      try {
        const [membersResponse, columnsResponse, tasksResponse] = await Promise.all([
          ProjectMemberService.getMembers(this.selectedProjectId),
          BoardColumnService.getBoardColumns(this.selectedProjectId),
          TaskService.getTasksByProject(this.selectedProjectId)
        ]);

        this.members = membersResponse.data || [];
        this.boardColumns = columnsResponse.data || [];
        this.tasks = tasksResponse.data || [];
      } catch (error) {
        this.errorMessage = this.extractErrorMessage(error, 'Board konnte nicht geladen werden.');
      } finally {
        this.loading = false;
      }
    },

    getTaskColumnId(task) {
      return Number(task?.boardColumnId ?? task?.boardColumn?.id ?? null);
    },

    tasksByColumn(columnId) {
      return this.tasks.filter(task => this.getTaskColumnId(task) === Number(columnId));
    },

    async handleTaskChanged() {
      await this.reloadBoard();
    },

    async handleTaskDeleted() {
      this.statusMessage = 'Task wurde gelöscht.';
      await this.reloadBoard();
    },

    async openTaskDetails(task) {
      await this.$refs.taskDetailsModal.open(task.id);
    },

    roleBadgeClass(role) {
      switch (role) {
        case 'OWNER':
          return 'text-bg-danger';
        case 'MAINTAINER':
          return 'text-bg-warning';
        case 'MEMBER':
          return 'text-bg-primary';
        case 'VIEWER':
          return 'text-bg-secondary';
        default:
          return 'text-bg-dark';
      }
    },

    onTaskDragStarted(task) {
      this.draggedTaskId = Number(task?.id);
      this.hoveredColumnDropId = null;
    },

    onTaskDragEnded() {
      this.draggedTaskId = null;
      this.hoveredTaskColumnId = null;
    },

    onTaskColumnDragOver(columnId, event) {
      if (!this.draggedTaskId) {
        return;
      }

      event.dataTransfer.dropEffect = 'move';
      this.hoveredTaskColumnId = Number(columnId);
    },

    onTaskColumnDragLeave(columnId, event) {
      const currentTarget = event.currentTarget;
      const related = event.relatedTarget;

      if (currentTarget && related && currentTarget.contains(related)) {
        return;
      }

      if (Number(this.hoveredTaskColumnId) === Number(columnId)) {
        this.hoveredTaskColumnId = null;
      }
    },

    onCombinedDragOver(columnId, event) {
      const draggedColumnId = event.dataTransfer?.getData('application/x-board-column-id');

      if (draggedColumnId) {
        this.onColumnDragOver(columnId, event);
        return;
      }

      this.onTaskColumnDragOver(columnId, event);
    },

    onCombinedDragLeave(columnId, event) {
      if (Number(this.hoveredTaskColumnId) === Number(columnId)) {
        this.onTaskColumnDragLeave(columnId, event);
      }

      if (Number(this.hoveredColumnDropId) === Number(columnId)) {
        const currentTarget = event.currentTarget;
        const related = event.relatedTarget;

        if (currentTarget && related && currentTarget.contains(related)) {
          return;
        }

        this.hoveredColumnDropId = null;
      }
    },

    async handleTaskDrop(targetColumnId, event) {
      event.preventDefault();

      const taskId = Number(event.dataTransfer?.getData('text/plain') || this.draggedTaskId);
      this.hoveredTaskColumnId = null;

      if (!taskId) {
        this.draggedTaskId = null;
        return;
      }

      const task = this.tasks.find(item => Number(item.id) === taskId);
      if (!task || this.getTaskColumnId(task) === Number(targetColumnId)) {
        this.draggedTaskId = null;
        return;
      }

      try {
        await TaskService.moveTask(taskId, targetColumnId);
        this.statusMessage = 'Task wurde verschoben.';
        await this.reloadBoard();
      } catch (error) {
        this.errorMessage = this.extractErrorMessage(error, 'Task konnte nicht verschoben werden.');
      } finally {
        this.draggedTaskId = null;
      }
    },

    onColumnDragStart(column, event) {
      this.draggedColumnId = Number(column.id);
      this.hoveredTaskColumnId = null;
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('application/x-board-column-id', String(column.id));
    },

    onColumnDragEnd() {
      this.draggedColumnId = null;
      this.hoveredColumnDropId = null;
    },

    onColumnDragOver(targetColumnId, event) {
      if (!this.draggedColumnId || Number(this.draggedColumnId) === Number(targetColumnId)) {
        return;
      }

      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
      this.hoveredColumnDropId = Number(targetColumnId);
    },

    async handleColumnDrop(targetColumnId, event) {
      event.preventDefault();

      const sourceColumnId = Number(
          event.dataTransfer?.getData('application/x-board-column-id') || this.draggedColumnId
      );

      if (!sourceColumnId || !targetColumnId || sourceColumnId === Number(targetColumnId)) {
        this.onColumnDragEnd();
        return;
      }

      const reordered = [...this.sortedBoardColumns];
      const sourceIndex = reordered.findIndex(column => Number(column.id) === sourceColumnId);
      const targetIndex = reordered.findIndex(column => Number(column.id) === Number(targetColumnId));

      if (sourceIndex < 0 || targetIndex < 0) {
        this.onColumnDragEnd();
        return;
      }

      const [movedColumn] = reordered.splice(sourceIndex, 1);
      const adjustedTargetIndex = reordered.findIndex(column => Number(column.id) === Number(targetColumnId));
      reordered.splice(adjustedTargetIndex, 0, movedColumn);

      try {
        await Promise.all(
            reordered.map((column, index) =>
                BoardColumnService.updateColumn(this.selectedProjectId, column.id, {
                  name: column.name,
                  position: index
                })
            )
        );

        this.statusMessage = 'Spalten wurden neu angeordnet.';
        await this.reloadBoard();
      } catch (error) {
        this.errorMessage = this.extractErrorMessage(error, 'Spalten konnten nicht neu angeordnet werden.');
      } finally {
        this.onColumnDragEnd();
      }
    },

    async handleCombinedDrop(targetColumnId, event) {
      const draggedColumnId = event.dataTransfer?.getData('application/x-board-column-id');
      if (draggedColumnId) {
        await this.handleColumnDrop(targetColumnId, event);
        return;
      }

      await this.handleTaskDrop(targetColumnId, event);
    },

    openCreateTaskModal(columnId = null) {
      this.createTaskForm = {
        title: '',
        description: '',
        priority: 'MEDIUM',
        dueDate: '',
        estimatedMinutes: 0,
        boardColumnId: columnId ? Number(columnId) : null
      };
      this.modalErrorMessage = '';
      this.createTaskModal.show();
    },

    hideCreateTaskModal() {
      this.modalErrorMessage = '';
      this.createTaskModal.hide();
    },

    async createTask() {
      this.savingTask = true;
      this.modalErrorMessage = '';

      try {
        await TaskService.createTask({
          projectId: Number(this.selectedProjectId),
          boardColumnId: this.createTaskForm.boardColumnId ? Number(this.createTaskForm.boardColumnId) : null,
          title: this.createTaskForm.title,
          description: this.createTaskForm.description || null,
          priority: this.createTaskForm.priority,
          dueDate: this.createTaskForm.dueDate ? new Date(this.createTaskForm.dueDate).toISOString() : null,
          estimatedMinutes: Number(this.createTaskForm.estimatedMinutes || 0),
          assigneeIds: [],
          labelIds: []
        });

        this.hideCreateTaskModal();
        this.statusMessage = 'Task wurde angelegt.';
        await this.reloadBoard();
      } catch (error) {
        this.modalErrorMessage = this.extractErrorMessage(error, 'Task konnte nicht angelegt werden.');
      } finally {
        this.savingTask = false;
      }
    },

    openCreateColumnModal() {
      const nextPosition = this.sortedBoardColumns.length > 0
          ? Math.max(...this.sortedBoardColumns.map(column => column.position ?? 0)) + 1
          : 0;

      this.createColumnForm = {
        name: '',
        position: nextPosition
      };
      this.modalErrorMessage = '';
      this.createColumnModal.show();
    },

    hideCreateColumnModal() {
      this.modalErrorMessage = '';
      this.createColumnModal.hide();
    },

    async createColumn() {
      this.savingColumn = true;
      this.modalErrorMessage = '';

      try {
        await BoardColumnService.createColumn(this.selectedProjectId, {
          name: this.createColumnForm.name,
          position: Number(this.createColumnForm.position)
        });

        this.hideCreateColumnModal();
        this.statusMessage = 'Spalte wurde angelegt.';
        await this.reloadBoard();
      } catch (error) {
        this.modalErrorMessage = this.extractErrorMessage(error, 'Spalte konnte nicht angelegt werden.');
      } finally {
        this.savingColumn = false;
      }
    },

    openEditColumnModal(column) {
      this.editColumnForm = {
        id: column.id,
        name: column.name || '',
        position: column.position ?? 0
      };
      this.modalErrorMessage = '';
      this.editColumnModal.show();
    },

    hideEditColumnModal() {
      this.modalErrorMessage = '';
      this.editColumnModal.hide();
    },

    async saveColumn() {
      this.savingColumn = true;
      this.modalErrorMessage = '';

      try {
        await BoardColumnService.updateColumn(
            this.selectedProjectId,
            this.editColumnForm.id,
            {
              name: this.editColumnForm.name,
              position: Number(this.editColumnForm.position)
            }
        );

        this.hideEditColumnModal();
        this.statusMessage = 'Spalte wurde aktualisiert.';
        await this.reloadBoard();
      } catch (error) {
        this.modalErrorMessage = this.extractErrorMessage(error, 'Spalte konnte nicht aktualisiert werden.');
      } finally {
        this.savingColumn = false;
      }
    },

    openDeleteColumnModal(column) {
      this.columnToDelete = column;
      this.deleteColumnForm = {
        fallbackColumnId: this.fallbackColumns[0]?.id ?? null
      };
      this.modalErrorMessage = '';
      this.deleteColumnModal.show();
    },

    hideDeleteColumnModal() {
      this.modalErrorMessage = '';
      this.deleteColumnModal.hide();
      this.columnToDelete = null;
      this.deleteColumnForm = { fallbackColumnId: null };
    },

    async deleteColumnConfirmed() {
      if (!this.columnToDelete?.id || !this.deleteColumnForm.fallbackColumnId) {
        this.modalErrorMessage = 'Bitte eine Fallback-Spalte auswählen.';
        return;
      }

      this.savingColumn = true;
      this.modalErrorMessage = '';

      try {
        await BoardColumnService.deleteColumn(
            this.selectedProjectId,
            this.columnToDelete.id,
            this.deleteColumnForm.fallbackColumnId
        );

        this.hideDeleteColumnModal();
        this.statusMessage = 'Spalte wurde gelöscht.';
        await this.reloadBoard();
      } catch (error) {
        this.modalErrorMessage = this.extractErrorMessage(error, 'Spalte konnte nicht gelöscht werden.');
      } finally {
        this.savingColumn = false;
      }
    },

    extractErrorMessage(error, fallbackMessage) {
      return error?.response?.data?.detail
          || error?.response?.data?.message
          || error?.response?.data?.title
          || (typeof error?.response?.data === 'string' ? error.response.data : null)
          || error?.message
          || fallbackMessage;
    }
  }
};
</script>

<style scoped>
.board-scroll {
  overflow-x: auto;
  padding-bottom: 0.5rem;
}

.board-row {
  display: flex;
  gap: 1rem;
  align-items: stretch;
  min-width: max-content;
}

.board-column {
  width: 360px;
  min-width: 360px;
  transition: transform 0.12s ease;
}

.board-column .card {
  transition: border-color 0.15s ease, box-shadow 0.15s ease, background-color 0.15s ease;
}

.board-column.drop-highlight .card {
  border: 2px solid var(--bs-primary);
  box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.15);
  background: rgba(13, 110, 253, 0.03);
}

.board-column.column-drop-highlight .card {
  border: 2px solid var(--bs-warning);
  box-shadow: 0 0 0 0.2rem rgba(255, 193, 7, 0.18);
  background: rgba(255, 193, 7, 0.08);
}

.board-column-body {
  min-height: 240px;
  background: var(--bs-tertiary-bg);
}

.drag-handle-column {
  cursor: grab;
  line-height: 1;
  user-select: none;
}

.drag-handle-column:active {
  cursor: grabbing;
}

.min-w-0 {
  min-width: 0;
}
</style>