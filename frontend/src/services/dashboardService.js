import api from '../utils/api';

const dashboardService = {
  
  getMetrics: async () => {
    const response = await api.get('/dashboard/metrics');
    return response.data;
  }
};

export default dashboardService;