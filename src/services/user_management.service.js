import axios from 'axios';
import authHeader from './auth-header';
import TaskAppConfig from '@/task_app.config.js';

const API_URL = TaskAppConfig.baseUrl() + '/user-management';

class UserManagementService {
    getAllUsers() {
        return axios.get(API_URL, { headers: authHeader() });
    }

    getUser(userId) {
        return axios.get(`${API_URL}/${userId}`, { headers: authHeader() });
    }

    createUser(user) {
        return axios.post(API_URL, user, { headers: authHeader() });
    }

    updateUser(user) {
        return axios.put(`${API_URL}/${user.id}`, user, { headers: authHeader() });
    }

    deleteUser(userId) {
        return axios.delete(`${API_URL}/${userId}`, { headers: authHeader() });
    }
}

export default new UserManagementService();