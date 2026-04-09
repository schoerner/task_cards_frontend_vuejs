import api from './api';
import TaskAppConfig from '@/task_app.config.js';

const API_URL = `${TaskAppConfig.baseUrl()}/tasks`;
const PROJECTS_API_URL = `${TaskAppConfig.baseUrl()}/projects`;

class TaskService {
    getTasksByProject(projectId) {
        return api.get(`${PROJECTS_API_URL}/${projectId}/tasks`);
    }

    getTask(taskId) {
        return api.get(`${API_URL}/${taskId}`);
    }

    createTask(task) {
        return api.post(`${API_URL}`, task);
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

        return api.put(`${API_URL}/${taskId}`, payload);
    }

    moveTask(taskId, boardColumnId) {
        return api.patch(
            `${API_URL}/${taskId}/move`,
            null,
            { params: { boardColumnId } }
        );
    }

    archiveTask(taskId) {
        return api.patch(`${API_URL}/${taskId}/archive`, {});
    }

    restoreTask(taskId) {
        return api.patch(`${API_URL}/${taskId}/restore`, {});
    }

    deleteTask(taskId) {
        return api.delete(`${API_URL}/${taskId}`);
    }

    getTimeRecords(taskId) {
        return api.get(`${API_URL}/${taskId}/time-records`);
    }

    isTimeTrackingActive(taskId) {
        return api.get(`${API_URL}/${taskId}/time-tracking/active`);
    }

    startTimeTracking(taskId) {
        return api.post(`${API_URL}/${taskId}/time-tracking/start`, {});
    }

    stopTimeTracking(taskId) {
        return api.post(`${API_URL}/${taskId}/time-tracking/stop`, {});
    }

    getMyCalendarTasks() {
        return api.get(`${TaskAppConfig.baseUrl()}/calendar/tasks`);
    }

    getCalendarFeedLink() {
        return api.get(`${TaskAppConfig.baseUrl()}/calendar/feed-link`);
    }

    regenerateCalendarFeedLink() {
        return api.post(`${TaskAppConfig.baseUrl()}/calendar/feed-link/regenerate`, {});
    }
}

export default new TaskService();