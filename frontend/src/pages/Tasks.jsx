import React, { useState, useEffect } from 'react';
import taskService from '../services/taskService';
import { handleApiError } from '../utils/errorHandler';
import TaskCard from '../components/TaskCard';
import CreateTask from '../components/CreateTask';
import Modal from '../components/Modal';

const FILTERS = [
  { key: 'all',        label: 'All' },
  { key: 'todo',       label: 'To Do',       status: 'To Do' },
  { key: 'inprogress', label: 'In Progress',  status: 'In Progress' },
  { key: 'done',       label: 'Done',         status: 'Done' },
];

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      setLoading(true);
      const res = await taskService.getTasks();
      setTasks(res.tasks || res.data || []);
    } catch (err) {
      setError(handleApiError(err).message);
    } finally {
      setLoading(false);
    }
  };

  const filtered = tasks.filter(t => {
    const f = FILTERS.find(f => f.key === filter);
    return !f?.status || t.status === f.status;
  });

  const count = key => {
    const f = FILTERS.find(f => f.key === key);
    return !f?.status ? tasks.length : tasks.filter(t => t.status === f.status).length;
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-5 h-5 rounded-full border-2 border-t-indigo-500 border-r-indigo-500 border-b-transparent border-l-transparent animate-spin" />
    </div>
  );

  return (
    <div className="px-4 py-6 sm:p-8 max-w-6xl mx-auto w-full animate-fade-in">

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--text-1)' }}>Tasks</h1>
          <p className="text-sm sm:text-base" style={{ color: 'var(--text-3)' }}>{tasks.length} total</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary px-4 py-2.5 text-sm sm:text-base">
          New task
        </button>
      </div>

      {error && (
        <div className="mb-5 px-3 py-2.5 rounded-lg text-base"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
          {error}
        </div>
      )}

      
      <div className="flex gap-0 mb-5 border-b overflow-x-auto" style={{ borderColor: 'var(--line)' }}>
        {FILTERS.map(({ key, label }) => (
          <button key={key} onClick={() => setFilter(key)}
            className="px-3 py-2.5 text-sm sm:text-base font-medium transition-colors relative whitespace-nowrap flex-shrink-0"
            style={{ color: filter === key ? 'var(--text-1)' : 'var(--text-3)' }}>
            {label}
            <span className="ml-1 text-xs sm:text-sm" style={{ color: 'var(--text-3)' }}>{count(key)}</span>
            {filter === key && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: 'var(--accent)' }} />
            )}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-base mb-3" style={{ color: 'var(--text-3)' }}>
            {filter === 'all' ? 'No tasks yet' : `No ${FILTERS.find(f => f.key === filter)?.label} tasks`}
          </p>
          <button onClick={() => setShowCreate(true)} className="btn-primary px-4 py-2">
            Create a task
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map(task => (
            <TaskCard key={task._id} task={task} onTaskUpdated={load} showProject />
          ))}
        </div>
      )}

      {showCreate && (
        <Modal onClose={() => setShowCreate(false)}>
          <div className="card w-full animate-fade-in" style={{ width: 'min(440px, calc(100vw - 32px))', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="p-5">
              <CreateTask onTaskCreated={() => { load(); setShowCreate(false); }} onClose={() => setShowCreate(false)} />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}