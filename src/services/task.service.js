import axios from 'axios';
import authHeader from './auth-header';
import TaskAppConfig from '@/task_app.config.js';

const API_URL = `${TaskAppConfig.baseUrl()}/tasks`;
const PROJECTS_API_URL = `${TaskAppConfig.baseUrl()}/projects`;

class TaskService {
    getTasksByProject(projectId) {
        return axios.get(`${PROJECTS_API_URL}/${projectId}/tasks`, { headers: authHeader() });
    }

    getTask(taskId) {
        return axios.get(`${API_URL}/${taskId}`, { headers: authHeader() });
    }

    createTask(task) {
        return axios.post(`${API_URL}`, task, { headers: authHeader() });
    }

    saveTask(task) {
        return this.createTask(task);
    }

    updateTask(taskIdOrTask, taskPayload = null) {
        let taskId = taskIdOrTask;
        let payload = taskPayload;

        if (typeof taskIdOrTask === 'object' && taskIdOrTask !== null) {
            taskId = taskIdOrTask.id;
            payload = taskIdOrTask;
        }

        return axios.put(`${API_URL}/${taskId}`, payload, { headers: authHeader() });
    }

    moveTask(taskId, boardColumnId) {
        return axios.patch(
            `${API_URL}/${taskId}/move`,
            null,
            {
                headers: authHeader(),
                params: { boardColumnId }
            }
        );
    }

    archiveTask(taskId) {
        return axios.patch(`${API_URL}/${taskId}/archive`, {}, { headers: authHeader() });
    }

    restoreTask(taskId) {
        return axios.patch(`${API_URL}/${taskId}/restore`, {}, { headers: authHeader() });
    }

    deleteTask(taskId) {
        return axios.delete(`${API_URL}/${taskId}`, { headers: authHeader() });
    }

    getTimeRecords(taskId) {
        return axios.get(`${API_URL}/${taskId}/time-records`, { headers: authHeader() });
    }

    isTimeTrackingActive(taskId) {
        return axios.get(`${API_URL}/${taskId}/time-tracking/active`, { headers: authHeader() });
    }

    startTimeTracking(taskId) {
        return axios.post(`${API_URL}/${taskId}/time-tracking/start`, {}, { headers: authHeader() });
    }

    stopTimeTracking(taskId) {
        return axios.post(`${API_URL}/${taskId}/time-tracking/stop`, {}, { headers: authHeader() });
    }

    startTask(taskId) {
        return this.startTimeTracking(taskId);
    }

    stopTask(taskId) {
        return this.stopTimeTracking(taskId);
    }
}

export default new TaskService();