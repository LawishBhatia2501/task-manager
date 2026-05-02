import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import projectService from '../services/projectService';
import { handleApiError } from '../utils/errorHandler';
import Modal from '../components/Modal';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      setLoading(true);
      const data = await projectService.getProjects();
      setProjects(data.data || data.projects || []);
    } catch (err) {
      setError(handleApiError(err).message);
    } finally {
      setLoading(false);
    }
  };

  const create = async e => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      setCreating(true);
      await projectService.createProject(name);
      setName(''); setShowModal(false); load();
    } catch (err) {
      setError(handleApiError(err).message);
    } finally {
      setCreating(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-5 h-5 rounded-full border-2 border-t-indigo-500 border-r-indigo-500 border-b-transparent border-l-transparent animate-spin" />
    </div>
  );

  return (
    <div className="px-4 py-6 sm:p-8 max-w-5xl mx-auto w-full animate-fade-in">

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--text-1)' }}>Projects</h1>
          <p className="text-sm sm:text-base" style={{ color: 'var(--text-3)' }}>{projects.length} total</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary px-4 py-2.5 text-sm sm:text-base">
          New project
        </button>
      </div>

      {error && (
        <div className="mb-5 px-3 py-2.5 rounded-lg text-base"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
          {error}
        </div>
      )}

      {projects.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-base mb-3" style={{ color: 'var(--text-3)' }}>No projects yet</p>
          <button onClick={() => setShowModal(true)} className="btn-primary px-4 py-2">
            Create your first project
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {projects.map(p => (
            <Link key={p._id || p.id} to={`/projects/${p._id || p.id}`}
              className="card card-hover flex items-center justify-between px-4 py-3.5 block">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-base font-semibold flex-shrink-0"
                  style={{ background: 'rgba(99,102,241,0.12)', color: '#818cf8' }}>
                  {p.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-base font-medium truncate" style={{ color: 'var(--text-1)' }}>{p.name}</p>
                  <p className="text-base" style={{ color: 'var(--text-3)' }}>
                    {p.members?.length || 0} member{(p.members?.length || 0) !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                <span className="text-base px-2 py-0.5 rounded"
                  style={p.role === 'Admin'
                    ? { background: 'rgba(99,102,241,0.1)', color: '#818cf8' }
                    : { background: 'var(--line)', color: 'var(--text-3)' }}>
                  {p.role}
                </span>
                <svg className="w-3.5 h-3.5" style={{ color: 'var(--text-3)' }} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      )}

      {showModal && (
        <Modal onClose={() => { setShowModal(false); setName(''); }}>
          <div className="card p-5 animate-fade-in" style={{ width: 'min(380px, calc(100vw - 32px))' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold" style={{ color: 'var(--text-1)' }}>New project</h2>
              <button onClick={() => { setShowModal(false); setName(''); }} style={{ color: 'var(--text-3)' }}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={create}>
              <label className="block text-base font-medium mb-1.5" style={{ color: 'var(--text-2)' }}>Project name</label>
              <input type="text" required autoFocus value={name} onChange={e => setName(e.target.value)}
                placeholder="e.g. Website Redesign" className="input-dark w-full px-3 py-2.5 mb-4" />
              <div className="flex gap-2">
                <button type="button" onClick={() => { setShowModal(false); setName(''); }}
                  className="btn-ghost flex-1 py-2">Cancel</button>
                <button type="submit" disabled={creating} className="btn-primary flex-1 py-2">
                  {creating ? 'Creating…' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}
    </div>
  );
}