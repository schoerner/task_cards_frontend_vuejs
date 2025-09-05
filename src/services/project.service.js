import axios from 'axios';
import authHeader from './auth-header';
import TaskAppConfig from "@/task_app.config.js";

const API_URL = TaskAppConfig.baseUrl() + '/api/projects';

class ProjectService {
    getAllProjects() {
        return axios.get(API_URL, { headers: authHeader() });
    }

    getAllProjectsByUserId(userID) {
        return axios.get(API_URL + "/user/" + userID, { headers: authHeader() });
    }

    getProject(id) {
        return axios.get(API_URL + "/" + id, { headers: authHeader() });
    }

    saveProject(project) {
        return axios.
            post(API_URL, project, { headers: authHeader() });
    }

    updateProject(project) {
        return axios
            .put(API_URL, project, { headers: authHeader() });
    }

    deleteProject(id) {
        return axios.delete(API_URL + "/" + id, { headers: authHeader() });
    }
}

export default new ProjectService();
