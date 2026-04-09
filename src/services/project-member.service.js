import api from './api';
import TaskAppConfig from '@/task_app.config.js';

const API_URL = TaskAppConfig.baseUrl() + '/projects';

class ProjectMemberService {
    getMembers(projectId) {
        return api.get(`${API_URL}/${projectId}/members`);
    }

    addMember(projectId, memberData) {
        return api.post(`${API_URL}/${projectId}/members`, memberData);
    }

    updateMember(projectId, memberUserId, memberData) {
        return api.put(`${API_URL}/${projectId}/members/${memberUserId}`, memberData);
    }

    updateMemberRole(projectId, memberUserId, memberData) {
        return api.put(`${API_URL}/${projectId}/members/${memberUserId}`, memberData);
    }

    removeMember(projectId, memberUserId) {
        return api.delete(`${API_URL}/${projectId}/members/${memberUserId}`);
    }

    searchMemberCandidates(projectId, query) {
        return api.get(`${API_URL}/${projectId}/members/candidates`, {
            params: { query }
        });
    }
}

export default new ProjectMemberService();