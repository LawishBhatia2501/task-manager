import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const links = [
  {
    to: '/dashboard', label: 'Dashboard',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
  },
  {
    to: '/projects', label: 'Projects',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>,
  },
  {
    to: '/tasks', label: 'Tasks',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>,
  },
];

export function LogoIcon({ size = 32 }) {
  return (
    <div style={{
      width: size, height: size,
      borderRadius: 9,
      background: '#6366f1',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      <svg width={size * 0.55} height={size * 0.55} fill="none" stroke="white" strokeWidth={2.2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    </div>
  );
}

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  if (!isAuthenticated) return null;

  const active = (p) => pathname === p || pathname.startsWith(p + '/');
  const initials = user?.name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || '?';

  return (
    <>
      
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-full z-40"
        style={{ width: '280px', background: '#1e2130' }}>

        
        <div className="px-5 h-16 flex items-center gap-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <LogoIcon size={32} />
          <Link to="/dashboard" className="font-bold text-lg tracking-tight text-white">
            TaskFlow
          </Link>
        </div>

        
        <nav className="flex-1 px-4 py-4 space-y-1">
          {links.map(({ to, label, icon }) => (
            <Link key={to} to={to}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all"
              style={active(to)
                ? { background: 'rgba(255,255,255,0.15)', color: '#fff' }
                : { color: 'rgba(255,255,255,0.65)' }}
              onMouseEnter={e => { if (!active(to)) { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#fff'; } }}
              onMouseLeave={e => { if (!active(to)) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.65)'; } }}
            >
              <span style={{ opacity: active(to) ? 1 : 0.7 }}>{icon}</span>
              {label}
            </Link>
          ))}
        </nav>

        
        <div className="px-3 pb-3 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg"
            style={{ background: 'rgba(255,255,255,0.08)' }}>
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 text-white"
              style={{ background: 'rgba(255,255,255,0.2)' }}>
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate text-white">{user?.name}</p>
              <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.55)' }}>{user?.email}</p>
            </div>
            <button onClick={() => { logout(); navigate('/login'); }} title="Sign out"
              style={{ color: 'rgba(255,255,255,0.5)' }}
              onMouseEnter={e => e.currentTarget.style.color = '#fff'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      
      <header className="lg:hidden fixed top-0 inset-x-0 z-40 h-14 flex items-center justify-between px-5"
        style={{ background: '#1e2130' }}>
        <div className="flex items-center gap-2.5">
          <LogoIcon size={28} />
          <span className="font-bold text-lg text-white">TaskFlow</span>
        </div>
        <button onClick={() => setOpen(v => !v)} className="text-white">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            {open
              ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </button>
      </header>

      {open && (
        <div className="lg:hidden fixed inset-0 z-30 pt-14" onClick={() => setOpen(false)}>
          <div className="px-3 py-3 space-y-1"
            style={{ background: '#1e2130', borderBottom: '1px solid rgba(255,255,255,0.08)' }}
            onClick={e => e.stopPropagation()}>
            {links.map(({ to, label, icon }) => (
              <Link key={to} to={to} onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium"
                style={active(to)
                  ? { background: 'rgba(255,255,255,0.15)', color: '#fff' }
                  : { color: 'rgba(255,255,255,0.7)' }}>
                {icon}
                {label}
              </Link>
            ))}
            <div className="pt-3 mt-1 flex items-center justify-between px-4 py-2"
              style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <span className="text-lg text-white">{user?.name}</span>
              <button onClick={() => { logout(); navigate('/login'); }}
                className="text-lg font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}