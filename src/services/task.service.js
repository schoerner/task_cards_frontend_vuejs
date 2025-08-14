import axios from 'axios';
import authHeader from './auth-header';
import TaskAppConfig from "@/task_app.config.js";

const API_URL = TaskAppConfig.baseUrl() + '/api/tasks';

class TaskService {
    getAllTasks() {
        return axios.get(API_URL, { headers: authHeader() });
    }

    getAllTasksByUserId(userID) {
        return axios.get(API_URL + "/user/" + userID, { headers: authHeader() });
    }

    getTask(taskID) {
        return axios.get(API_URL + "/" + taskID, { headers: authHeader() });
    }

    startTask(taskID) {
        return axios.get(API_URL + "/start/" + taskID, { headers: authHeader() });
    }

    stopTask(taskID) {
        return axios.get(API_URL + "/stop/" + taskID, { headers: authHeader() });
    }

    saveTask(task) {
        return axios.
            post(API_URL, task, { headers: authHeader() });
    }

    updateTask(task) {
        return axios
            .put(API_URL, task, { headers: authHeader() });
    }

    deleteTask(taskID) {
        return axios.delete(API_URL + "/" + taskID, { headers: authHeader() });
    }
}

export default new TaskService();
