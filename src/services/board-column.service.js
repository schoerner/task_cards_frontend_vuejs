import axios from 'axios';
import authHeader from './auth-header';
import TaskAppConfig from '@/task_app.config.js';

const PROJECTS_API_URL = `${TaskAppConfig.baseUrl()}/projects`;

class BoardColumnService {
    getBoardColumns(projectId) {
        return axios.get(
            `${PROJECTS_API_URL}/${projectId}/board-columns`,
            { headers: authHeader() }
        );
    }

    createColumn(projectId, payload) {
        return axios.post(
            `${PROJECTS_API_URL}/${projectId}/board-columns`,
            payload,
            { headers: authHeader() }
        );
    }

    updateColumn(projectId, columnId, payload) {
        return axios.put(
            `${PROJECTS_API_URL}/${projectId}/board-columns/${columnId}`,
            payload,
            { headers: authHeader() }
        );
    }

    deleteColumn(projectId, columnId, fallbackColumnId) {
        return axios.delete(
            `${PROJECTS_API_URL}/${projectId}/board-columns/${columnId}`,
            {
                headers: authHeader(),
                params: { fallbackColumnId }
            }
        );
    }

    reorderColumns(projectId, payload) {
        return axios.patch(
            `${PROJECTS_API_URL}/${projectId}/board-columns/reorder`,
            payload,
            { headers: authHeader() }
        );
    }
}

export default new BoardColumnService();