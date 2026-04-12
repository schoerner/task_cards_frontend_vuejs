import api from './api';
import TaskAppConfig from '@/task_app.config.js';

const API_URL = TaskAppConfig.baseUrl() + '/admin/backups';

class BackupService {
    listBackups() {
        return api.get(API_URL);
    }

    runBackup() {
        return api.post(`${API_URL}/run`);
    }

    downloadBackup(fileName) {
        return api.get(`${API_URL}/${encodeURIComponent(fileName)}`, {
            responseType: 'blob',
        });
    }
}

export default new BackupService();