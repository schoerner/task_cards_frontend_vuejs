import axios from 'axios';
import authHeader from './auth-header';
import TaskAppConfig from "@/task_app.config.js";

const API_URL = TaskAppConfig.baseUrl() + '/api/tasks';

class TaskService {
    // 🔹 Alle Tasks des eingeloggten Users (oder alle, wenn Admin)
    getAllTasks() {
        return axios.get(API_URL, { headers: authHeader() });
    }

    // 🔹 Tasks, an denen ich beteiligt bin (Creator oder Assignee)
    getMyTasks() {
        return axios.get(`${API_URL}/my`, { headers: authHeader() });
    }

    // 🔹 Tasks, die ich selbst erstellt habe
    getMyOwnedTasks() {
        return axios.get(`${API_URL}/my/owned`, { headers: authHeader() });
    }

    // 🔹 Einzelnes Task holen
    getTask(taskID) {
        return axios.get(`${API_URL}/${taskID}`, { headers: authHeader() });
    }

    // 🔹 Task anlegen (nur MODERATOR/ADMIN)
    saveTask(task) {
        return axios.post(API_URL, task, { headers: authHeader() });
    }

    // 🔹 Task updaten (REST-konform mit ID in URL)
    updateTask(task) {
        return axios.put(`${API_URL}/${task.id}`, task, { headers: authHeader() });
    }

    // 🔹 Task löschen (nur MODERATOR/ADMIN)
    deleteTask(taskID) {
        return axios.delete(`${API_URL}/${taskID}`, { headers: authHeader() });
    }

    // 🔹 Task starten
    startTask(taskID) {
        return axios.post(`${API_URL}/${taskID}/start`, {}, { headers: authHeader() });
    }

    // 🔹 Task stoppen
    stopTask(taskID) {
        return axios.post(`${API_URL}/${taskID}/stop`, {}, { headers: authHeader() });
    }
}

export default new TaskService();
