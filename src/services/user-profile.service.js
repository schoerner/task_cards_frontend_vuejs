import axios from 'axios';
import authHeader from './auth-header';
import TaskAppConfig from '@/task_app.config.js';

const API_URL = `${TaskAppConfig.baseUrl()}/users/me/profile`;

class UserProfileService {
    getOwnProfile() {
        return axios.get(API_URL, { headers: authHeader() });
    }

    updateOwnProfile(payload) {
        return axios.put(API_URL, payload, { headers: authHeader() });
    }
}

export default new UserProfileService();