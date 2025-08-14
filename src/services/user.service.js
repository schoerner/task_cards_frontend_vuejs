import axios from 'axios';
import authHeader from './auth-header';
import TaskAppConfig from "@/task_app.config.js";

const API_URL = TaskAppConfig.baseUrl() + '/api/users';

class UserService {
    getPublicContent() {
        return axios.get(API_URL + '');
    }

    getUserBoard() {
        return axios.get(API_URL + 'user', { headers: authHeader() });
    }

    getModeratorBoard() {
        return axios.get(API_URL + 'mod', { headers: authHeader() });
    }

    getAdminBoard() {
        return axios.get(API_URL + 'admin', { headers: authHeader() });
    }
}

export default new UserService();
