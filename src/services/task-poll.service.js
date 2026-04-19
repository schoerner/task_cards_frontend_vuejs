import api from '../../../../../../../../Downloads/task_app_Terminfindung_cleaned/task_cards_frontend_vuejs/src/services/api.js';
import TaskAppConfig from '@/task_app.config.js';

const API_URL = `${TaskAppConfig.baseUrl()}/tasks`;
const PUBLIC_API_URL = `${TaskAppConfig.baseUrl().replace('/v1', '/public/v1')}/task-polls/respond`;

class TaskPollService {
  getPollByTask(taskId) {
    return api.get(`${API_URL}/${taskId}/poll`);
  }

  savePoll(taskId, payload) {
    return api.put(`${API_URL}/${taskId}/poll`, payload);
  }

  finalizePoll(taskId, payload) {
    return api.post(`${API_URL}/${taskId}/poll/finalize`, payload);
  }

  deletePoll(taskId) {
    return api.delete(`${API_URL}/${taskId}/poll`);
  }

  sendInvitations(taskId) {
    return api.post(`${API_URL}/${taskId}/poll/invitations/send`, {});
  }

  sendReminders(taskId) {
    return api.post(`${API_URL}/${taskId}/poll/reminders/send`, {});
  }

  getPublicPoll(token) {
    return api.get(`${PUBLIC_API_URL}/${token}`);
  }

  submitPublicPoll(token, payload) {
    return api.put(`${PUBLIC_API_URL}/${token}`, payload);
  }
}

export default new TaskPollService();