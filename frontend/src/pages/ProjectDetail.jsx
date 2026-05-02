import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import projectService from '../services/projectService';
import taskService from '../services/taskService';
import { handleApiError } from '../utils/errorHandler';
import Modal from '../components/Modal';

const statusCls = { 'To Do': 'status-todo', 'In Progress': 'status-inprogress', 'Done': 'status-done' };
const priCls    = { High: 'priority-high', Medium: 'priority-medium', Low: 'priority-low' };

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [email, setEmail] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => { loadProject(); loadTasks(); }, [id]);

  const loadProject = async () => {
    try {
      setLoading(true);
      const res = await projectService.getProjects();
      const all = res.data || res.projects || [];
      const cur = all.find(p => (p._id || p.id) === id);
      if (!cur) { setError('Project not found'); return; }
      setProject(cur);
      setIsAdmin(cur.role === 'Admin');
    } catch (err) {
      setError(handleApiError(err).message);
    } finally {
      setLoading(false);
    }
  };

  const loadTasks = async () => {
    try {
      const res = await taskService.getTasks(id);
      setTasks(res.tasks || res.data || []);
    } catch {  }
  };

  const addMember = async e => {
    e.preventDefault();
    if (!email.trim()) return;
    try {
      setAdding(true); setError('');
      await projectService.addMember(id, email);
      setEmail(''); setShowAdd(false); loadProject();
    } catch (err) {
      setError(handleApiError(err).message);
    } finally {
      setAdding(false);
    }
  };

  const removeMember = async uid => {
    if (!window.confirm('Remove this member?')) return;
    try {
      setError('');
      await projectService.removeMember(id, uid);
      loadProject();
    } catch (err) {
      setError(handleApiError(err).message);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-5 h-5 rounded-full border-2 border-t-indigo-500 border-r-indigo-500 border-b-transparent border-l-transparent animate-spin" />
    </div>
  );

  if (!project) return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-3">
      <p style={{ color: 'var(--text-3)' }}>{error || 'Project not found'}</p>
      <button onClick={() => navigate('/projects')} className="btn-primary px-4 py-2">Back</button>
    </div>
  );

  return (
    <div className="px-4 py-6 sm:p-8 max-w-6xl mx-auto w-full animate-fade-in">

      <button onClick={() => navigate('/projects')}
        className="flex items-center gap-1.5 text-sm mb-5 transition-colors"
        style={{ color: 'var(--text-3)' }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--text-1)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Projects
      </button>

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-1" style={{ color: 'var(--text-1)' }}>{project.name}</h1>
          <div className="flex items-center gap-2">
            <span className="text-sm px-2 py-0.5 rounded"
              style={isAdmin
                ? { background: 'rgba(99,102,241,0.1)', color: '#818cf8' }
                : { background: 'var(--line)', color: 'var(--text-3)' }}>
              {project.role}
            </span>
            <span className="text-sm" style={{ color: 'var(--text-3)' }}>
              {project.members?.length || 0} members
            </span>
          </div>
        </div>
        {isAdmin && (
          <button onClick={() => setShowAdd(true)} className="btn-primary px-4 py-2.5 flex-shrink-0 self-start">
            Add member
          </button>
        )}
      </div>

      {error && (
        <div className="mb-5 px-3 py-2.5 rounded-lg text-base"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        
        <div className="card p-4">
          <p className="text-base font-medium mb-3" style={{ color: 'var(--text-1)' }}>Members</p>
          {project.members?.length > 0 ? (
            <div className="space-y-2">
              {project.members.map((m, i) => (
                <div key={m._id} className="flex items-center justify-between py-1.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-base font-semibold flex-shrink-0"
                      style={{ background: `hsl(${(i*55+220)%360},40%,30%)`, color: `hsl(${(i*55+220)%360},70%,70%)` }}>
                      {m.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-base truncate" style={{ color: 'var(--text-1)' }}>{m.name}</p>
                      <p className="text-base truncate" style={{ color: 'var(--text-3)' }}>{m.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    <span className="text-base" style={{ color: m._id === project.adminId ? '#818cf8' : 'var(--text-3)' }}>
                      {m._id === project.adminId ? 'Admin' : 'Member'}
                    </span>
                    {isAdmin && m._id !== project.adminId && (
                      <button onClick={() => removeMember(m._id)} style={{ color: 'var(--text-3)' }}
                        onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
                        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-base" style={{ color: 'var(--text-3)' }}>No members yet</p>
          )}
        </div>

        
        <div className="lg:col-span-2 card p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-base font-medium" style={{ color: 'var(--text-1)' }}>Tasks</p>
            <button onClick={() => navigate('/tasks')} className="text-base" style={{ color: 'var(--accent)' }}>
              View all
            </button>
          </div>
          {tasks.length > 0 ? (
            <div className="space-y-2">
              {tasks.map(t => (
                <div key={t._id} className="flex items-start justify-between gap-3 py-2.5"
                  style={{ borderBottom: '1px solid var(--line)' }}>
                  <div className="min-w-0 flex-1">
                    <p className="text-base font-medium truncate mb-1" style={{ color: 'var(--text-1)' }}>{t.title}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-base px-1.5 py-0.5 rounded ${priCls[t.priority]}`}>{t.priority}</span>
                      {t.assignee && (
                        <span className="text-base" style={{ color: 'var(--text-3)' }}>{t.assignee.name}</span>
                      )}
                      {t.dueDate && (
                        <span className="text-base" style={{ color: 'var(--text-3)' }}>
                          {new Date(t.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className={`text-base px-2 py-0.5 rounded flex-shrink-0 ${statusCls[t.status]}`}>
                    {t.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-base" style={{ color: 'var(--text-3)' }}>No tasks yet</p>
          )}
        </div>
      </div>

      
      {showAdd && (
        <Modal onClose={() => { setShowAdd(false); setEmail(''); }}>
          <div className="card p-5 animate-fade-in" style={{ width: 'min(380px, calc(100vw - 32px))' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold" style={{ color: 'var(--text-1)' }}>Add member</h2>
              <button onClick={() => { setShowAdd(false); setEmail(''); }} style={{ color: 'var(--text-3)' }}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={addMember}>
              <label className="block text-base font-medium mb-1.5" style={{ color: 'var(--text-2)' }}>Email address</label>
              <input type="email" required autoFocus value={email} onChange={e => setEmail(e.target.value)}
                placeholder="member@example.com" className="input-dark w-full px-3 py-2.5 mb-1" />
              <p className="text-base mb-4" style={{ color: 'var(--text-3)' }}>User must already have an account</p>
              <div className="flex gap-2">
                <button type="button" onClick={() => { setShowAdd(false); setEmail(''); }}
                  className="btn-ghost flex-1 py-2">Cancel</button>
                <button type="submit" disabled={adding} className="btn-primary flex-1 py-2">
                  {adding ? 'Adding…' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}
    </div>
  );
}