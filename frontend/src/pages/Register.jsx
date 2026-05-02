import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { handleApiError } from '../utils/errorHandler';
import { LogoIcon } from '../components/Navbar';

function EyeIcon({ open }) {
  return open
    ? <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
      </svg>
    : <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>;
}

function DarkInput({ name, type, value, onChange, placeholder, required, children }) {
  return (
    <div className="relative">
      <input name={name} type={type} required={required} value={value} onChange={onChange}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl text-base text-white outline-none transition-all"
        style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
        onFocus={e => e.target.style.borderColor = '#6366f1'}
        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
      />
      {children}
    </div>
  );
}

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const onChange = e => { setForm({ ...form, [e.target.name]: e.target.value }); setError(''); };

  const onSubmit = async e => {
    e.preventDefault();
    if (form.password !== form.confirm) return setError('Passwords do not match');
    if (form.password.length < 8) return setError('Password must be at least 8 characters');
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(handleApiError(err).message);
    } finally {
      setLoading(false);
    }
  };

  const eyeBtn = (show, toggle) => (
    <button type="button" onClick={toggle}
      className="absolute right-3 top-1/2 -translate-y-1/2"
      style={{ color: 'rgba(255,255,255,0.4)' }}
      onMouseEnter={e => e.currentTarget.style.color = '#fff'}
      onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}>
      <EyeIcon open={show} />
    </button>
  );

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10" style={{ background: '#1e2130' }}>
      <div className="w-full max-w-sm animate-fade-in">

        
        <div className="flex items-center gap-2.5 mb-10">
          <LogoIcon size={32} />
          <span className="font-bold text-lg text-white tracking-tight">TaskFlow</span>
        </div>

        <h1 className="text-2xl font-bold mb-1 text-white">Create account</h1>
        <p className="text-base mb-8" style={{ color: 'rgba(255,255,255,0.5)' }}>
          Join your team on TaskFlow
        </p>

        {error && (
          <div className="mb-5 px-4 py-3 rounded-xl text-base"
            style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}>
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-base font-medium mb-2" style={{ color: 'rgba(255,255,255,0.65)' }}>Full name</label>
            <DarkInput name="name" type="text" required value={form.name} onChange={onChange} placeholder="Alex Johnson" />
          </div>

          <div>
            <label className="block text-base font-medium mb-2" style={{ color: 'rgba(255,255,255,0.65)' }}>Email</label>
            <DarkInput name="email" type="email" required value={form.email} onChange={onChange} placeholder="you@example.com" />
          </div>

          <div>
            <label className="block text-base font-medium mb-2" style={{ color: 'rgba(255,255,255,0.65)' }}>Password</label>
            <DarkInput name="password" type={showPwd ? 'text' : 'password'} required value={form.password} onChange={onChange} placeholder="Min. 8 characters">
              {eyeBtn(showPwd, () => setShowPwd(v => !v))}
            </DarkInput>
          </div>

          <div>
            <label className="block text-base font-medium mb-2" style={{ color: 'rgba(255,255,255,0.65)' }}>Confirm password</label>
            <DarkInput name="confirm" type={showConfirm ? 'text' : 'password'} required value={form.confirm} onChange={onChange} placeholder="Repeat password">
              {eyeBtn(showConfirm, () => setShowConfirm(v => !v))}
            </DarkInput>
            {form.confirm && form.password !== form.confirm && (
              <p className="mt-1.5 text-base" style={{ color: '#fca5a5' }}>Passwords don't match</p>
            )}
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-3 rounded-xl text-base mt-1">
            {loading ? 'Creating…' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-base" style={{ color: 'rgba(255,255,255,0.4)' }}>
          Already have an account?{' '}
          <Link to="/login" className="font-medium" style={{ color: '#818cf8' }}
            onMouseEnter={e => e.currentTarget.style.color = '#a5b4fc'}
            onMouseLeave={e => e.currentTarget.style.color = '#818cf8'}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}