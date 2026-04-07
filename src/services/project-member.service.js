import axios from 'axios';
import authHeader from './auth-header';
import TaskAppConfig from '@/task_app.config.js';

const PROJECTS_API_URL = `${TaskAppConfig.baseUrl()}/projects`;

class ProjectMemberService {
    getMembers(projectId) {
        return axios.get(
            `${PROJECTS_API_URL}/${projectId}/members`,
            { headers: authHeader() }
        );
    }

    addMember(projectId, payload) {
        return axios.post(
            `${PROJECTS_API_URL}/${projectId}/members`,
            payload,
            { headers: authHeader() }
        );
    }

    updateMemberRole(projectId, memberUserId, payload) {
        return axios.put(
            `${PROJECTS_API_URL}/${projectId}/members/${memberUserId}`,
            payload,
            { headers: authHeader() }
        );
    }

    removeMember(projectId, memberUserId) {
        return axios.delete(
            `${PROJECTS_API_URL}/${projectId}/members/${memberUserId}`,
            { headers: authHeader() }
        );
    }
}

export default new ProjectMemberService();