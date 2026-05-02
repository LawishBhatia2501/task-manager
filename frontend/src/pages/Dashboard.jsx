import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import dashboardService from '../services/dashboardService';
import { handleApiError } from '../utils/errorHandler';
import { useAuth } from '../context/AuthContext';

function Stat({ label, value, color }) {
  return (
    <div className="card p-5">
      <p className="text-base font-medium mb-2" style={{ color: 'var(--text-3)' }}>{label}</p>
      <p className="text-4xl font-bold tabular-nums" style={{ color }}>{value}</p>
    </div>
  );
}

function PieChart({ slices }) {
  const total = slices.reduce((s, d) => s + d.value, 0);
  const cx = 120, cy = 120, r = 80;
  const vb = "0 0 240 240";

  if (total === 0) {
    return (
      <svg viewBox={vb} width="240" height="240">
        <circle cx={cx} cy={cy} r={r} fill="#e4e6eb" />
        <text x={cx} y={cy + 5} textAnchor="middle" fontSize="15" fill="var(--text-3)">No data</text>
      </svg>
    );
  }

  
  const nonZero = slices.filter(s => s.value > 0);
  if (nonZero.length === 1) {
    const s = nonZero[0];
    const lx = cx + (r + 28);
    const ly = cy;
    return (
      <svg viewBox={vb} width="240" height="240">
        <circle cx={cx} cy={cy} r={r} fill={s.color} />
        <line x1={cx + r} y1={cy} x2={lx - 4} y2={ly} stroke={s.color} strokeWidth="1.2" />
        <text x={lx + 3} y={ly + 4} textAnchor="start" fontSize="15" fontWeight="600" fill="var(--text-1)">{s.value}</text>
      </svg>
    );
  }

  let cumAngle = -Math.PI / 2;
  const segments = slices
    .filter(s => s.value > 0)
    .map(slice => {
      const angle = (slice.value / total) * 2 * Math.PI;
      const midAngle = cumAngle + angle / 2;
      const x1 = cx + r * Math.cos(cumAngle);
      const y1 = cy + r * Math.sin(cumAngle);
      cumAngle += angle;
      const x2 = cx + r * Math.cos(cumAngle);
      const y2 = cy + r * Math.sin(cumAngle);
      const large = angle > Math.PI ? 1 : 0;
      const lx1 = cx + (r + 8)  * Math.cos(midAngle);
      const ly1 = cy + (r + 8)  * Math.sin(midAngle);
      const lx2 = cx + (r + 22) * Math.cos(midAngle);
      const ly2 = cy + (r + 22) * Math.sin(midAngle);
      const lx3 = lx2 + (Math.cos(midAngle) >= 0 ? 10 : -10);
      const anchor = Math.cos(midAngle) >= 0 ? 'start' : 'end';
      return {
        d: `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2} Z`,
        color: slice.color, lx1, ly1, lx2, ly2, lx3, ly3: ly2, anchor, value: slice.value,
      };
    });

  return (
    <svg viewBox={vb} width="240" height="240" style={{ overflow: 'visible' }}>
      {segments.map((s, i) => (
        <g key={i}>
          <path d={s.d} fill={s.color} />
          <polyline points={`${s.lx1},${s.ly1} ${s.lx2},${s.ly2} ${s.lx3},${s.ly3}`}
            fill="none" stroke={s.color} strokeWidth="1.2" />
          <text x={s.lx3 + (s.anchor === 'start' ? 3 : -3)} y={s.ly3 + 4}
            textAnchor={s.anchor} fontSize="15" fontWeight="600" fill="var(--text-1)">
            {s.value}
          </text>
        </g>
      ))}
    </svg>
  );
}

function BarGraph({ data }) {
  const maxVal = Math.max(...data.map(d => d.value), 1);
  
  const yMax = Math.ceil(maxVal / 1) < 4 ? 4 : Math.ceil(maxVal * 1.2);
  const yTicks = Array.from({ length: yMax + 1 }, (_, i) => i).filter(v => v <= yMax);
  const chartH = 140, chartW = 320;
  const padL = 28, padB = 28, padT = 10, padR = 10;
  const innerW = chartW - padL - padR;
  const innerH = chartH - padB - padT;
  const barW = Math.min(48, (innerW / data.length) * 0.55);
  const step = innerW / data.length;

  const yPos = v => padT + innerH - (v / yMax) * innerH;

  return (
    <svg viewBox={`0 0 ${chartW} ${chartH}`} width="100%" style={{ overflow: 'visible' }}>
      
      {yTicks.filter(v => v % Math.max(1, Math.floor(yMax / 4)) === 0 || v === 0).map(v => (
        <g key={v}>
          <line x1={padL} y1={yPos(v)} x2={chartW - padR} y2={yPos(v)}
            stroke="#d1d5db" strokeWidth="1" strokeDasharray="4,3" />
          <text x={padL - 5} y={yPos(v) + 4} textAnchor="end" fontSize="11" fill="var(--text-3)">{v}</text>
        </g>
      ))}
      
      <line x1={padL} y1={yPos(0)} x2={chartW - padR} y2={yPos(0)} stroke="#9ca3af" strokeWidth="1" />

      
      {data.map((d, i) => {
        const bh = (d.value / yMax) * innerH;
        const bx = padL + i * step + (step - barW) / 2;
        const by = yPos(d.value);
        return (
          <g key={i}>
            <rect x={bx} y={by} width={barW} height={bh} fill={d.color} rx="3" />
            <text x={bx + barW / 2} y={yPos(0) + 16} textAnchor="middle" fontSize="11" fill="var(--text-3)">
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      setLoading(true);
      setMetrics(await dashboardService.getMetrics());
    } catch (err) {
      setError(handleApiError(err).message);
    } finally {
      setLoading(false);
    }
  };

  const total   = metrics?.totalTasks || 0;
  const todo    = metrics?.tasksByStatus?.['To Do'] || 0;
  const inProg  = metrics?.tasksByStatus?.['In Progress'] || 0;
  const done    = metrics?.tasksByStatus?.['Done'] || 0;
  const overdue = metrics?.overdueTasks || 0;

  const pieSlices = [
    { value: todo,   color: '#c1c5d0', label: 'To Do' },
    { value: inProg, color: '#6366f1', label: 'In Progress' },
    { value: done,   color: '#16a34a', label: 'Done' },
  ];

  const barData = [
    { label: 'To Do',    value: todo,   color: '#c1c5d0' },
    { label: 'Progress', value: inProg, color: '#6366f1' },
    { label: 'Done',     value: done,   color: '#16a34a' },
    { label: 'Overdue',  value: overdue,color: '#ef4444' },
  ];

  const assigneeEntries = metrics?.tasksByAssignee
    ? Object.entries(metrics.tasksByAssignee)
    : [];
  const maxAssignee = Math.max(...assigneeEntries.map(([, d]) => d.count), 1);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-5 h-5 rounded-full border-2 border-t-indigo-500 border-r-indigo-500 border-b-transparent border-l-transparent animate-spin" />
    </div>
  );

  return (
    <div className="px-4 py-6 sm:p-8 max-w-6xl mx-auto w-full animate-fade-in">

      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-0.5" style={{ color: 'var(--text-1)' }}>Dashboard</h1>
        <p className="text-sm sm:text-base" style={{ color: 'var(--text-3)' }}>Overview of your tasks and projects</p>
      </div>

      {error && (
        <div className="mb-5 px-3 py-2.5 rounded-lg text-base"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#dc2626' }}>
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <Stat label="Total"       value={total}   color="var(--text-1)" />
        <Stat label="In Progress" value={inProg}  color="#6366f1" />
        <Stat label="Done"        value={done}    color="var(--green)" />
        <Stat label="Overdue"     value={overdue} color="var(--red)" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">

        
        <div className="card p-5">
          <p className="text-base font-medium mb-2" style={{ color: 'var(--text-1)' }}>Task status</p>
          <div className="flex items-center justify-center py-2">
            <PieChart slices={pieSlices} />
          </div>
          <div className="flex items-center justify-center gap-5 mt-1">
            {[
              { label: 'To Do',       color: '#c1c5d0' },
              { label: 'In Progress', color: '#6366f1' },
              { label: 'Done',        color: '#16a34a' },
            ].map(s => (
              <div key={s.label} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: s.color }} />
                <span className="text-base" style={{ color: 'var(--text-2)' }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        
        <div className="card p-5">
          <p className="text-base font-medium mb-4" style={{ color: 'var(--text-1)' }}>Task breakdown</p>
          <div className="pt-2">
            <BarGraph data={barData} />
          </div>
        </div>
      </div>

      
      {assigneeEntries.length > 0 && (
        <div className="card p-5 mb-4">
          <p className="text-base font-medium mb-4" style={{ color: 'var(--text-1)' }}>Team workload</p>
          <div className="space-y-3">
            {assigneeEntries.map(([id, data]) => {
              const pct = Math.round((data.count / maxAssignee) * 100);
              return (
                <div key={id}>
                  <div className="flex justify-between mb-1">
                    <span className="text-base" style={{ color: 'var(--text-2)' }}>{data.name || 'Unknown'}</span>
                    <span className="text-base tabular-nums" style={{ color: 'var(--text-1)' }}>{data.count}</span>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ background: 'var(--line)' }}>
                    <div className="h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, background: '#6366f1' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          { to: '/projects', label: 'Projects', desc: 'Manage your projects' },
          { to: '/tasks',    label: 'My Tasks',  desc: 'View your tasks' },
        ].map(({ to, label, desc }) => (
          <Link key={to} to={to} className="card card-hover p-4 block">
            <p className="text-base font-medium mb-0.5" style={{ color: 'var(--text-1)' }}>{label}</p>
            <p className="text-base" style={{ color: 'var(--text-3)' }}>{desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}