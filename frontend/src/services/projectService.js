import api from '../utils/api';

let _cache = null;
let _cacheTime = 0;
let _inflight = null;
const CACHE_TTL = 10_000; 

const projectService = {
  getProjects: async () => {
    const now = Date.now();
    
    if (_cache && now - _cacheTime < CACHE_TTL) return _cache;
    
    if (_inflight) return _inflight;
    _inflight = api.get('/projects').then(res => {
      _cache = res.data;
      _cacheTime = Date.now();
      _inflight = null;
      return _cache;
    }).catch(err => {
      _inflight = null;
      throw err;
    });
    return _inflight;
  },

  
  invalidateCache: () => { _cache = null; _cacheTime = 0; },

  createProject: async (name) => {
    const response = await api.post('/projects', { name });
    projectService.invalidateCache();
    return response.data;
  },

  addMember: async (projectId, userEmail) => {
    const response = await api.post(`/projects/${projectId}/members`, { userEmail });
    projectService.invalidateCache();
    return response.data;
  },

  removeMember: async (projectId, userId) => {
    const response = await api.delete(`/projects/${projectId}/members/${userId}`);
    projectService.invalidateCache();
    return response.data;
  }
};

export default projectService;