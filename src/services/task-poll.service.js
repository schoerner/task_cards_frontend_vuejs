import api from './api.js';
import TaskAppConfig from '@/task_app.config.js';

const API_URL = `${TaskAppConfig.baseUrl()}/tasks`;
const POLL_API_URL = `${TaskAppConfig.baseUrl()}/task-polls`;
const PUBLIC_API_URL = `${TaskAppConfig.baseUrl().replace('/v1', '/public/v1')}/task-polls/respond`;

class TaskPollService {
  getOwnedPolls() {
    return api.get(`${POLL_API_URL}/owned`);
  }

  getPollByTask(taskId) {
    return api.get(`${API_URL}/${taskId}/poll`);
  }

  savePoll(taskId, payload) {
    return api.put(`${API_URL}/${taskId}/poll`, payload);
  }

  finalizePoll(taskId, payload) {
    return api.post(`${API_URL}/${taskId}/poll/finalize`, payload);
  }

  sendFinalizationNotification(taskId, payload) {
    return api.post(`${API_URL}/${taskId}/poll/finalization-notification/send`, payload);
  }

  deletePoll(taskId) {
    return api.delete(`${API_URL}/${taskId}/poll`);
  }

  sendInvitations(taskId, payload) {
    return api.post(`${API_URL}/${taskId}/poll/invitations/send`, payload || {});
  }

  sendReminders(taskId, payload) {
    return api.post(`${API_URL}/${taskId}/poll/reminders/send`, payload || {});
  }

  getPublicPoll(token) {
    return api.get(`${PUBLIC_API_URL}/${token}`);
  }

  submitPublicPoll(token, payload) {
    return api.put(`${PUBLIC_API_URL}/${token}`, payload);
  }
}

export default new TaskPollService();
