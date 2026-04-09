import api from './api';
import TaskAppConfig from '@/task_app.config.js';

const PROJECTS_API_URL = `${TaskAppConfig.baseUrl()}/projects`;

class BoardColumnService {
    getBoardColumns(projectId) {
        return api.get(
            `${PROJECTS_API_URL}/${projectId}/board-columns`
        );
    }

    createColumn(projectId, payload) {
        return api.post(
            `${PROJECTS_API_URL}/${projectId}/board-columns`,
            payload
        );
    }

    updateColumn(projectId, columnId, payload) {
        return api.put(
            `${PROJECTS_API_URL}/${projectId}/board-columns/${columnId}`,
            payload
        );
    }

    deleteColumn(projectId, columnId, fallbackColumnId) {
        return api.delete(
            `${PROJECTS_API_URL}/${projectId}/board-columns/${columnId}`,
            { params: {fallbackColumnId} }
        );
    }

    reorderColumns(projectId, payload) {
        return api.patch(
            `${PROJECTS_API_URL}/${projectId}/board-columns/reorder`,
            payload
        );
    }
}

export default new BoardColumnService();