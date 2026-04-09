import api from './api';
import TaskAppConfig from '@/task_app.config.js';

const API_URL = TaskAppConfig.baseUrl() + '/user-management';

class UserManagementService {
    getAllUsers() {
        return api.get(API_URL);
    }

    getUser(userId) {
        return api.get(`${API_URL}/${userId}`);
    }

    createUser(user) {
        return api.post(API_URL, user);
    }

    updateUser(user) {
        return api.put(`${API_URL}/${user.id}`, user);
    }

    deleteUser(userId) {
        return api.delete(`${API_URL}/${userId}`);
    }
}

export default new UserManagementService();