import api from './api';
import TaskAppConfig from '@/task_app.config.js';

const API_URL = `${TaskAppConfig.baseUrl()}/tasks`;

class TaskCommentService {
    getComments(taskId) {
        return api.get(`${API_URL}/${taskId}/comments`);
    }

    createComment(taskId, payload) {
        return api.post(`${API_URL}/${taskId}/comments`, payload);
    }

    deleteComment(taskId, commentId) {
        return api.delete(`${API_URL}/${taskId}/comments/${commentId}`);
    }
}

export default new TaskCommentService();