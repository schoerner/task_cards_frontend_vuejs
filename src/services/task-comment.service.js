import axios from 'axios';
import authHeader from './auth-header';
import TaskAppConfig from '@/task_app.config.js';

const API_URL = `${TaskAppConfig.baseUrl()}/tasks`;

class TaskCommentService {
    getComments(taskId) {
        return axios.get(`${API_URL}/${taskId}/comments`, { headers: authHeader() });
    }

    createComment(taskId, payload) {
        return axios.post(`${API_URL}/${taskId}/comments`, payload, { headers: authHeader() });
    }

    deleteComment(taskId, commentId) {
        return axios.delete(`${API_URL}/${taskId}/comments/${commentId}`, { headers: authHeader() });
    }
}

export default new TaskCommentService();