import axios from 'axios';
import authHeader from './auth-header';
import TaskAppConfig from '@/task_app.config.js';

const API_URL = `${TaskAppConfig.baseUrl()}/users`;

class UserService {
    getUserById(userId) {
        return axios.get(`${API_URL}/${userId}`, { headers: authHeader() });
    }

    updateUser(userId, payload) {
        return axios.put(`${API_URL}/${userId}`, payload, { headers: authHeader() });
    }

    deleteUser(userId) {
        return axios.delete(`${API_URL}/${userId}`, { headers: authHeader() });
    }

    changePassword(userId, payload) {
        return axios.patch(`${API_URL}/${userId}/password`, payload, { headers: authHeader() });
    }
}

export default new UserService();