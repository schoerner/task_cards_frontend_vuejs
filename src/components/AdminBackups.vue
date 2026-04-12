<template>
  <div class="container py-4">
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
      <div>
        <h2 class="mb-1">Backups</h2>
        <p class="text-muted mb-0">
          Manuelles Starten, Liste der vorhandenen Backup-Archive und Download.
        </p>
      </div>

      <button
          class="btn btn-primary"
          :disabled="runInProgress"
          @click="runBackup"
      >
        <span
            v-if="runInProgress"
            class="spinner-border spinner-border-sm me-2"
            role="status"
            aria-hidden="true"
        ></span>
        Backup jetzt starten
      </button>
    </div>

    <div v-if="message" class="alert alert-success" role="alert">
      {{ message }}
    </div>

    <div v-if="errorMessage" class="alert alert-danger" role="alert">
      {{ errorMessage }}
    </div>

    <div class="card shadow-sm">
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead>
            <tr>
              <th>Datei</th>
              <th>Erstellt</th>
              <th>Größe</th>
              <th>Aufbewahrung</th>
              <th class="text-end">Aktion</th>
            </tr>
            </thead>
            <tbody>
            <tr v-if="loading">
              <td colspan="5" class="text-center py-4">
                <div class="spinner-border spinner-border-sm me-2" role="status"></div>
                Lade Backups...
              </td>
            </tr>

            <tr v-else-if="backups.length === 0">
              <td colspan="5" class="text-center py-4 text-muted">
                Noch keine Backups vorhanden.
              </td>
            </tr>

            <tr v-for="backup in backups" :key="backup.fileName">
              <td>
                <div class="fw-semibold">{{ backup.fileName }}</div>
                <small v-if="backup.latest" class="text-success">Neuester Stand</small>
              </td>
              <td>{{ formatDate(backup.createdAt) }}</td>
              <td>{{ formatSize(backup.sizeBytes) }}</td>
              <td>
                  <span class="badge" :class="bucketClass(backup)">
                    {{ bucketLabel(backup) }}
                  </span>
              </td>
              <td class="text-end">
                <button
                    class="btn btn-outline-secondary btn-sm"
                    @click="downloadBackup(backup)"
                >
                  Herunterladen
                </button>
              </td>
            </tr>
            </tbody>
          </table>
        </div>

        <div class="mt-3 text-muted small">
          Sortierung: chronologisch absteigend.
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import BackupService from '@/services/backup.service';

export default {
  name: 'AdminBackups',

  data() {
    return {
      backups: [],
      loading: false,
      runInProgress: false,
      errorMessage: '',
      message: '',
    };
  },

  mounted() {
    this.loadBackups();
  },

  methods: {
    async loadBackups() {
      this.loading = true;
      this.errorMessage = '';

      try {
        const response = await BackupService.listBackups();
        this.backups = Array.isArray(response.data) ? response.data : [];
      } catch (error) {
        this.errorMessage = this.extractErrorMessage(error, 'Backups konnten nicht geladen werden.');
      } finally {
        this.loading = false;
      }
    },

    async runBackup() {
      this.runInProgress = true;
      this.errorMessage = '';
      this.message = '';

      try {
        const response = await BackupService.runBackup();
        this.message = response?.data?.message || 'Backup wurde gestartet.';

        await this.loadBackups();
        window.setTimeout(() => this.loadBackups(), 3000);
      } catch (error) {
        this.errorMessage = this.extractErrorMessage(error, 'Backup konnte nicht gestartet werden.');
      } finally {
        this.runInProgress = false;
      }
    },

    async downloadBackup(backup) {
      this.errorMessage = '';

      try {
        const response = await BackupService.downloadBackup(backup.fileName);
        const blob = new Blob([response.data], { type: 'application/zip' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = backup.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        this.errorMessage = this.extractErrorMessage(error, 'Download fehlgeschlagen.');
      }
    },

    formatDate(value) {
      if (!value) return '-';

      const date = new Date(value);
      return new Intl.DateTimeFormat('de-DE', {
        dateStyle: 'medium',
        timeStyle: 'medium',
      }).format(date);
    },

    formatSize(bytes) {
      if (!bytes && bytes !== 0) return '-';

      const units = ['B', 'KB', 'MB', 'GB', 'TB'];
      let size = bytes;
      let unitIndex = 0;

      while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex += 1;
      }

      return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
    },

    bucketLabel(backup) {
      if (backup.latest) return 'Letztes Backup';

      switch (backup.retentionBucket) {
        case 'DAILY':
          return 'Täglich';
        case 'WEEKLY':
          return 'Wöchentlich';
        case 'MONTHLY':
          return 'Monatlich';
        case 'YEARLY':
          return 'Jährlich';
        default:
          return backup.retentionBucket || '-';
      }
    },

    bucketClass(backup) {
      if (backup.latest) return 'text-bg-success';

      switch (backup.retentionBucket) {
        case 'DAILY':
          return 'text-bg-primary';
        case 'WEEKLY':
          return 'text-bg-info';
        case 'MONTHLY':
          return 'text-bg-warning';
        case 'YEARLY':
          return 'text-bg-secondary';
        default:
          return 'text-bg-light';
      }
    },

    extractErrorMessage(error, fallback) {
      return (
          error?.response?.data?.detail ||
          error?.response?.data?.message ||
          error?.message ||
          fallback
      );
    },
  },
};
</script>