import { useState, useEffect, useRef } from "react";
import taskService from "../services/taskService";
import projectService from "../services/projectService";
import { handleApiError } from "../utils/errorHandler";

const PRIORITIES = [
  { value: 'Low',    dot: '#16a34a' },
  { value: 'Medium', dot: '#ca8a04' },
  { value: 'High',   dot: '#dc2626' },
];

export default function CreateTask({ onTaskCreated, onClose }) {
  const [form, setForm] = useState({ title: "", description: "", dueDate: "", priority: "Medium", projectId: "" });
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPri, setShowPri] = useState(false);
  const [showProj, setShowProj] = useState(false);
  const priRef  = useRef(null);
  const projRef = useRef(null);

  useEffect(() => { loadProjects(); }, []);
  useEffect(() => {
    const close = e => {
      if (priRef.current  && !priRef.current.contains(e.target))  setShowPri(false);
      if (projRef.current && !projRef.current.contains(e.target)) setShowProj(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const loadProjects = async () => {
    try {
      const res = await projectService.getProjects();
      const all = res.data || res.projects || [];
      const admin = all.filter(p => p.role === "Admin");
      setProjects(admin);
      if (admin.length > 0) setForm(f => ({ ...f, projectId: admin[0]._id || admin[0].id }));
    } catch (e) { setError(handleApiError(e).message); }
  };

  const onChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async e => {
    e.preventDefault();
    if (!form.title.trim()) return setError("Title is required");
    if (!form.projectId)    return setError("Select a project");
    try {
      setLoading(true); setError("");
      await taskService.createTask(form);
      onTaskCreated?.(); onClose?.();
    } catch (e) { setError(handleApiError(e).message); }
    finally { setLoading(false); }
  };

  if (projects.length === 0 && !error) return (
    <div className="py-6 text-center">
      <p className="text-base mb-1" style={{ color: "var(--text-2)" }}>No admin projects</p>
      <p className="text-base" style={{ color: "var(--text-3)" }}>You need to be an admin to create tasks.</p>
    </div>
  );

  const selProject = projects.find(p => (p._id || p.id) === form.projectId);
  const selPri     = PRIORITIES.find(p => p.value === form.priority);

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-semibold" style={{ color: "var(--text-1)" }}>New task</h2>
        {onClose && (
          <button onClick={onClose} style={{ color: "var(--text-3)" }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 px-3 py-2.5 rounded-lg text-base"
          style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}>
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-3.5">

        <div>
          <label className="block text-base font-medium mb-1.5" style={{ color: "var(--text-2)" }}>Project</label>
          <div className="relative" ref={projRef}>
            <button type="button" onClick={() => setShowProj(v => !v)}
              className="input-dark w-full px-3 py-2.5 flex items-center justify-between">
              <span style={{ color: selProject ? "var(--text-1)" : "var(--text-3)" }}>
                {selProject?.name || "Select project"}
              </span>
              <svg className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "var(--text-3)" }} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showProj && (
              <div className="absolute inset-x-0 top-full mt-1 z-50 rounded-lg overflow-hidden shadow-lg"
                style={{ background: "var(--surface)", border: "1px solid var(--line)", maxHeight: "180px", overflowY: "auto" }}>
                {projects.map(p => {
                  const pid = p._id || p.id;
                  return (
                    <button key={pid} type="button"
                      onClick={() => { setForm(f => ({ ...f, projectId: pid })); setShowProj(false); }}
                      className="w-full text-left px-3 py-2 text-base transition-colors"
                      style={{ color: form.projectId === pid ? "var(--text-1)" : "var(--text-2)", background: form.projectId === pid ? "var(--bg)" : "transparent" }}
                      onMouseEnter={e => e.currentTarget.style.background = "var(--bg)"}
                      onMouseLeave={e => e.currentTarget.style.background = form.projectId === pid ? "var(--bg)" : "transparent"}>
                      {p.name}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-base font-medium mb-1.5" style={{ color: "var(--text-2)" }}>Title</label>
          <input name="title" type="text" required value={form.title} onChange={onChange}
            placeholder="What needs to be done? e.g. Fix login bug" className="input-dark w-full px-3 py-2.5" />
        </div>

        <div>
          <label className="block text-base font-medium mb-1.5" style={{ color: "var(--text-2)" }}>Description</label>
          <textarea name="description" value={form.description} onChange={onChange} rows={3}
            placeholder="e.g. Steps to reproduce, expected outcome..." className="input-dark w-full px-3 py-2.5 resize-none" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-base font-medium mb-1.5" style={{ color: "var(--text-2)" }}>Priority</label>
            <div className="relative" ref={priRef}>
              <button type="button" onClick={() => setShowPri(v => !v)}
                className="input-dark w-full px-3 py-2.5 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: selPri?.dot }} />
                  <span style={{ color: "var(--text-1)" }}>{form.priority}</span>
                </span>
                <svg className="w-3.5 h-3.5" style={{ color: "var(--text-3)" }} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showPri && (
                <div className="absolute inset-x-0 top-full mt-1 z-50 rounded-lg overflow-hidden shadow-lg"
                  style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
                  {PRIORITIES.map(p => (
                    <button key={p.value} type="button"
                      onClick={() => { setForm(f => ({ ...f, priority: p.value })); setShowPri(false); }}
                      className="w-full text-left px-3 py-2 text-base flex items-center gap-2 transition-colors"
                      style={{ color: form.priority === p.value ? "var(--text-1)" : "var(--text-2)", background: form.priority === p.value ? "var(--bg)" : "transparent" }}
                      onMouseEnter={e => e.currentTarget.style.background = "var(--bg)"}
                      onMouseLeave={e => e.currentTarget.style.background = form.priority === p.value ? "var(--bg)" : "transparent"}>
                      <span className="w-2 h-2 rounded-full" style={{ background: p.dot }} />
                      {p.value}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div>
            <label className="block text-base font-medium mb-1.5" style={{ color: "var(--text-2)" }}>Due date</label>
            <input name="dueDate" type="date" value={form.dueDate} onChange={onChange}
              min={new Date().toISOString().split("T")[0]}
              className="input-dark w-full px-3 py-2.5" />
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          <button type="submit" disabled={loading} className="btn-primary flex-1 py-2.5">
            {loading ? "Creating�" : "Create task"}
          </button>
          {onClose && (
            <button type="button" onClick={onClose} className="btn-ghost flex-1 py-2.5">Cancel</button>
          )}
        </div>
      </form>
    </div>
  );
}