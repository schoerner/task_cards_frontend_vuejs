import axios from 'axios';
import authHeader from './auth-header';
import TaskAppConfig from '@/task_app.config.js';

const API_URL = `${TaskAppConfig.baseUrl()}/projects`;

class ProjectService {
    getVisibleProjects() {
        return axios.get(`${API_URL}/my`, { headers: authHeader() });
    }

    getMyProjects() {
        return this.getVisibleProjects();
    }

    getProject(projectId) {
        return axios.get(`${API_URL}/${projectId}`, { headers: authHeader() });
    }

    createProject(project) {
        return axios.post(`${API_URL}`, project, { headers: authHeader() });
    }

    updateProject(projectId, project) {
        return axios.put(`${API_URL}/${projectId}`, project, { headers: authHeader() });
    }

    archiveProject(projectId) {
        return axios.patch(`${API_URL}/${projectId}/archive`, {}, { headers: authHeader() });
    }

    deleteProject(projectId) {
        return axios.delete(`${API_URL}/${projectId}`, { headers: authHeader() });
    }
}

export default new ProjectService();