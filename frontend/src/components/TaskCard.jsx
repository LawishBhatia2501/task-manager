import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import taskService from '../services/taskService';
import projectService from '../services/projectService';
import { handleApiError } from '../utils/errorHandler';

const statusConfig = {
  'To Do':       { cls: 'status-todo',       dot: '#9399a8' },
  'In Progress': { cls: 'status-inprogress', dot: '#4f52d4' },
  'Done':        { cls: 'status-done',       dot: '#16a34a' },
};
const priorityConfig = {
  High:   { cls: 'priority-high',   dot: '#dc2626' },
  Medium: { cls: 'priority-medium', dot: '#ca8a04' },
  Low:    { cls: 'priority-low',    dot: '#16a34a' },
};

export default function TaskCard({ task, onTaskUpdated, showProject = false }) {
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [members, setMembers] = useState([]);
  const [role, setRole] = useState('Member');
  const [statusOpen, setStatusOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);

  useEffect(() => { if (task.projectId) loadMembers(); }, [task.projectId]);
  useEffect(() => {
    const close = () => { setStatusOpen(false); setAssignOpen(false); };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  const loadMembers = async () => {
    try {
      const res = await projectService.getProjects();
      const all = res.data || res.projects || [];
      const proj = all.find(p => (p._id || p.id) === task.projectId);
      if (proj) { setMembers(proj.members || []); setRole(proj.role); }
    } catch {  }
  };

  const updateStatus = async s => {
    try { setBusy(true); setErr(''); await taskService.updateTaskStatus(task._id, s); onTaskUpdated?.(); }
    catch (e) { setErr(handleApiError(e).message); }
    finally { setBusy(false); }
  };

  const assign = async uid => {
    try { setBusy(true); setErr(''); await taskService.assignTask(task._id, uid); onTaskUpdated?.(); }
    catch (e) { setErr(handleApiError(e).message); }
    finally { setBusy(false); }
  };

  const del = async () => {
    if (!window.confirm('Delete this task?')) return;
    try { setBusy(true); await taskService.deleteTask(task._id); onTaskUpdated?.(); }
    catch (e) { setErr(handleApiError(e).message); setBusy(false); }
  };

  const overdue = () => task.dueDate && task.status !== 'Done' && new Date(task.dueDate) < new Date();
  const isAdmin = () => role === 'Admin';
  const canStatus = () => isAdmin() || (task.assignee && task.assignee._id === user?.id);

  const sc = statusConfig[task.status] || statusConfig['To Do'];
  const pc = priorityConfig[task.priority] || priorityConfig['Medium'];

  return (
    <div className="card flex flex-col gap-3 p-4" style={overdue() ? { borderColor: 'rgba(239,68,68,0.3)' } : {}}>

      
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-base font-medium leading-snug" style={{ color: 'var(--text-1)' }}>{task.title}</p>
          {showProject && task.project && (
            <p className="text-base mt-0.5" style={{ color: 'var(--accent)' }}>{task.project.name}</p>
          )}
        </div>
        <span className={`text-base px-1.5 py-0.5 rounded flex items-center gap-1 flex-shrink-0 ${pc.cls}`}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: pc.dot }} />
          {task.priority}
        </span>
      </div>

      {task.description && (
        <p className="text-base line-clamp-2" style={{ color: 'var(--text-3)' }}>{task.description}</p>
      )}

      
      <div className="flex items-center justify-between">
        <span className="text-base" style={{ color: 'var(--text-3)' }}>Status</span>
        {canStatus() ? (
          <div className="relative" onClick={e => e.stopPropagation()}>
            <button disabled={busy}
              onClick={() => { setStatusOpen(v => !v); setAssignOpen(false); }}
              className={`text-base px-2 py-1 rounded flex items-center gap-1.5 ${sc.cls}`}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: sc.dot }} />
              {task.status}
              <svg className="w-2.5 h-2.5 opacity-50" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {statusOpen && (
              <div className="absolute right-0 top-full mt-1 z-50 rounded-lg overflow-hidden shadow-lg w-36"
                style={{ background: 'var(--surface)', border: '1px solid var(--line)' }}>
                {Object.entries(statusConfig).map(([s, cfg]) => (
                  <button key={s} onClick={() => { updateStatus(s); setStatusOpen(false); }}
                    className="w-full text-left px-3 py-2 text-base flex items-center gap-2 transition-colors"
                    style={{ color: task.status === s ? 'var(--text-1)' : 'var(--text-2)', background: task.status === s ? 'var(--bg)' : 'transparent' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                    onMouseLeave={e => e.currentTarget.style.background = task.status === s ? 'var(--bg)' : 'transparent'}>
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: cfg.dot }} />
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <span className={`text-base px-2 py-0.5 rounded flex items-center gap-1 ${sc.cls}`}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: sc.dot }} />
            {task.status}
          </span>
        )}
      </div>

      
      <div className="flex items-center justify-between">
        <span className="text-base" style={{ color: 'var(--text-3)' }}>Assignee</span>
        {isAdmin() ? (
          <div className="relative" onClick={e => e.stopPropagation()}>
            <button disabled={busy}
              onClick={() => { setAssignOpen(v => !v); setStatusOpen(false); }}
              className="text-base flex items-center gap-1 transition-colors"
              style={{ color: 'var(--text-2)' }}>
              <span className="max-w-[120px] truncate">{task.assignee?.name || 'Unassigned'}</span>
              <svg className="w-2.5 h-2.5 opacity-50 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {assignOpen && (
              <div className="absolute right-0 top-full mt-1 z-50 rounded-lg overflow-hidden shadow-lg w-44"
                style={{ background: 'var(--surface)', border: '1px solid var(--line)' }}>
                <button onClick={() => { assign(''); setAssignOpen(false); }}
                  className="w-full text-left px-3 py-2 text-base transition-colors"
                  style={{ color: 'var(--text-3)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  Unassigned
                </button>
                {members.map(m => (
                  <button key={m._id} onClick={() => { assign(m._id); setAssignOpen(false); }}
                    className="w-full text-left px-3 py-2 text-base flex items-center gap-2 transition-colors"
                    style={{ color: task.assignee?._id === m._id ? 'var(--text-1)' : 'var(--text-2)', background: task.assignee?._id === m._id ? 'var(--bg)' : 'transparent' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                    onMouseLeave={e => e.currentTarget.style.background = task.assignee?._id === m._id ? 'var(--bg)' : 'transparent'}>
                    <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
                      style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8' }}>
                      {m.name?.charAt(0).toUpperCase()}
                    </span>
                    <span className="truncate">{m.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <span className="text-base" style={{ color: 'var(--text-2)' }}>
            {task.assignee?.name || <span style={{ color: 'var(--text-3)' }}>Unassigned</span>}
          </span>
        )}
      </div>

      
      <div className="flex items-center justify-between pt-2" style={{ borderTop: '1px solid var(--line)' }}>
        {task.dueDate ? (
          <span className="text-base flex items-center gap-1" style={{ color: overdue() ? 'var(--red)' : 'var(--text-3)' }}>
            {overdue() && (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            )}
            {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        ) : (
          <span className="text-base" style={{ color: 'var(--text-3)' }}>No due date</span>
        )}
        <div className="flex items-center gap-2">
          {busy && <div className="w-3 h-3 rounded-full border border-t-indigo-400 border-r-indigo-400 border-b-transparent border-l-transparent animate-spin" />}
          {isAdmin() && (
            <button onClick={del} disabled={busy} style={{ color: 'var(--text-3)' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {err && <p className="text-base" style={{ color: 'var(--red)' }}>{err}</p>}
    </div>
  );
}