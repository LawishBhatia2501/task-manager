import api from '../utils/api';

const taskService = {
  
  getTasks: async (projectId = null) => {
    const url = projectId ? `/tasks?projectId=${projectId}` : '/tasks';
    const response = await api.get(url);
    return response.data;
  },

  
  createTask: async (taskData) => {
    const response = await api.post('/tasks', taskData);
    return response.data;
  },

  
  deleteTask: async (taskId) => {
    const response = await api.delete(`/tasks/${taskId}`);
    return response.data;
  },

  
  assignTask: async (taskId, assigneeId) => {
    const response = await api.put(`/tasks/${taskId}/assign`, { assigneeId });
    return response.data;
  },

  
  updateTaskStatus: async (taskId, status) => {
    const response = await api.put(`/tasks/${taskId}/status`, { status });
    return response.data;
  }
};

export default taskService;