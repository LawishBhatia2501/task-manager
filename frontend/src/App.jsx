import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Toast from './components/Toast';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import Tasks from './pages/Tasks';
import useToast from './hooks/useToast';

const PUBLIC_ROUTES = ['/login', '/register'];

function Layout({ children }) {
  const { pathname } = useLocation();
  const isPublic = PUBLIC_ROUTES.includes(pathname);

  return (
    <>
      <Navbar />
      <main
        style={{
          marginLeft: isPublic ? 0 : undefined,
          minHeight: '100vh',
          background: 'var(--bg)',
        }}
        className={isPublic ? '' : 'lg:ml-[280px] pt-14 lg:pt-0 min-h-screen'}
      >
        {children}
      </main>
    </>
  );
}

export default function App() {
  const { toasts, removeToast } = useToast();

  return (
    <AuthProvider>
      <BrowserRouter>
        <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
          <Routes>
            <Route path="/login"    element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/*" element={
              <Layout>
                <Routes>
                  <Route path="/dashboard"    element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                  <Route path="/projects"     element={<ProtectedRoute><Projects /></ProtectedRoute>} />
                  <Route path="/projects/:id" element={<ProtectedRoute><ProjectDetail /></ProtectedRoute>} />
                  <Route path="/tasks"        element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
                  <Route path="/"             element={<Navigate to="/dashboard" replace />} />
                  <Route path="*"             element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </Layout>
            } />
          </Routes>

          <div className="fixed top-4 right-4 z-[60] space-y-2">
            {toasts.map(t => (
              <Toast key={t.id} message={t.message} type={t.type} duration={t.duration} onClose={() => removeToast(t.id)} />
            ))}
          </div>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}