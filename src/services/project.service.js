import api from './api';
import TaskAppConfig from '@/task_app.config.js';

const API_URL = `${TaskAppConfig.baseUrl()}/projects`;

class ProjectService {
    getVisibleProjects() {
        return api.get(`${API_URL}/my`);
    }

    getMyProjects() {
        return this.getVisibleProjects();
    }

    getProject(projectId) {
        return api.get(`${API_URL}/${projectId}`);
    }

    createProject(project) {
        return api.post(`${API_URL}`, project);
    }

    updateProject(projectId, project) {
        return api.put(`${API_URL}/${projectId}`, project);
    }

    archiveProject(projectId) {
        return api.patch(`${API_URL}/${projectId}/archive`, {});
    }

    deleteProject(projectId) {
        return api.delete(`${API_URL}/${projectId}`);
    }
}

export default new ProjectService();