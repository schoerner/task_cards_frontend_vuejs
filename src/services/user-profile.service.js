import api from './api';
import TaskAppConfig from "@/task_app.config.js";

const API_URL = TaskAppConfig.baseUrl() + '/users/me/profile';
const PUBLIC_PROFILE_API_URL = TaskAppConfig.baseUrl() + '/user-profiles';

class UserProfileService {
    getOwnProfile() {
        return api.get(API_URL);
    }

    updateOwnProfile(profileData) {
        return api.put(API_URL, profileData);
    }

    searchProfiles(query) {
        return api.get(PUBLIC_PROFILE_API_URL, {
            params: { query }
        });
    }

    getProfileByUserId(userId) {
        return api.get(`${PUBLIC_PROFILE_API_URL}/${userId}`);
    }
}

export default new UserProfileService();