import axios from 'axios';
import authHeader from './auth-header';
import TaskAppConfig from "@/task_app.config.js";

const API_URL = TaskAppConfig.baseUrl() + '/api/projects';

class ProjectService {

    // Projekte, bei denen der User Mitglied ist
    getMyProjects() {
        return axios.get(API_URL + "/my", { headers: authHeader() });
    }

    // Projekte, die der User selbst erstellt hat
    getMyOwnedProjects() {
        return axios.get(API_URL + "/my-owned", { headers: authHeader() });
    }

    // Einzelnes Projekt abrufen
    getProject(id) {
        return axios.get(API_URL + "/" + id, { headers: authHeader() });
    }

    // Projekt erstellen (nur Moderator/Admin)
    createProject(project) {
        return axios.post(API_URL, project, { headers: authHeader() });
    }

    // Projekt aktualisieren (nur Owner/Admin)
    updateProject(id, project) {
        return axios.put(API_URL + "/" + id, project, { headers: authHeader() });
    }

    // Projekt löschen (nur Owner/Admin)
    deleteProject(id) {
        return axios.delete(API_URL + "/" + id, { headers: authHeader() });
    }
}

export default new ProjectService();
