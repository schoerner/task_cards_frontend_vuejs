import api from './api';
import TaskAppConfig from '@/task_app.config.js';

const API_URL = `${TaskAppConfig.baseUrl()}/users`;

class UserService {
    getUserById(userId) {
        return api.get(`${API_URL}/${userId}`);
    }

    updateUser(userId, payload) {
        return api.put(`${API_URL}/${userId}`, payload);
    }

    deleteUser(userId) {
        return api.delete(`${API_URL}/${userId}`);
    }

    changePassword(userId, payload) {
        return api.patch(`${API_URL}/${userId}/password`, payload);
    }
}

export default new UserService();