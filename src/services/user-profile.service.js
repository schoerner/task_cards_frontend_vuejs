import axios from 'axios';
import authHeader from './auth-header';
import TaskAppConfig from "@/task_app.config.js";

const API_URL = TaskAppConfig.baseUrl() + '/users/me/profile';
const PUBLIC_PROFILE_API_URL = TaskAppConfig.baseUrl() + '/user-profiles';

class UserProfileService {
    getOwnProfile() {
        return axios.get(API_URL, { headers: authHeader() });
    }

    updateOwnProfile(profileData) {
        return axios.put(API_URL, profileData, { headers: authHeader() });
    }

    searchProfiles(query) {
        return axios.get(PUBLIC_PROFILE_API_URL, {
            headers: authHeader(),
            params: { query }
        });
    }

    getProfileByUserId(userId) {
        return axios.get(`${PUBLIC_PROFILE_API_URL}/${userId}`, {
            headers: authHeader()
        });
    }
}

export default new UserProfileService();