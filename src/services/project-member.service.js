import axios from 'axios';
import authHeader from './auth-header';
import TaskAppConfig from '@/task_app.config.js';

const API_URL = TaskAppConfig.baseUrl() + '/projects';

class ProjectMemberService {
    getMembers(projectId) {
        return axios.get(`${API_URL}/${projectId}/members`, { headers: authHeader() });
    }

    addMember(projectId, memberData) {
        return axios.post(`${API_URL}/${projectId}/members`, memberData, { headers: authHeader() });
    }

    updateMember(projectId, memberUserId, memberData) {
        return axios.put(`${API_URL}/${projectId}/members/${memberUserId}`, memberData, { headers: authHeader() });
    }

    updateMemberRole(projectId, memberUserId, memberData) {
        return axios.put(`${API_URL}/${projectId}/members/${memberUserId}`, memberData, { headers: authHeader() });
    }

    removeMember(projectId, memberUserId) {
        return axios.delete(`${API_URL}/${projectId}/members/${memberUserId}`, { headers: authHeader() });
    }

    searchMemberCandidates(projectId, query) {
        return axios.get(`${API_URL}/${projectId}/members/candidates`, {
            headers: authHeader(),
            params: { query }
        });
    }
}

export default new ProjectMemberService();