import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

/* Pages */
import LoginPage     from './pages/LoginPage';
import RegisterPage  from './pages/RegisterPage';
import AdminDashboard from './pages/AdminDashboard';
import UserWebsite    from './pages/UserWebsite';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';

/* ─── Guard: requires any authenticated user ─────────────────── */
function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  return user ? children : <Navigate to="/login" replace />;
}

/* ─── Guard: requires admin role ────────────────────────────── */
function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;
  /* Non-admin users go to the website, not the admin panel */
  if (user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}

/* ─── Spinner ────────────────────────────────────────────────── */
function Spinner() {
  return (
    <div style={{
      minHeight:'100vh', display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center',
      background:'linear-gradient(160deg,#FEE2C0,#FDCFA0)',
    }}>
      <img src="/logo.png" alt="BakeCake" style={{ height: 120, marginBottom: 20, objectFit: 'contain' }} />
      <p style={{ color:'#8c4623', fontWeight:600 }}>Chargement…</p>
    </div>
  );
}

/* ─── Router ────────────────────────────────────────────────── */
function AppRouter() {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;

  return (
    <Routes>
      {/* ── Public ── */}
      <Route path="/login"
        element={
          user
            ? <Navigate to={user.role === 'admin' ? '/admin' : '/'} replace />
            : <LoginPage />
        }
      />
      <Route path="/register"
        element={
          user
            ? <Navigate to={user.role === 'admin' ? '/admin' : '/'} replace />
            : <RegisterPage />
        }
      />

      {/* ── Admin dashboard (admin only) ── */}
      <Route path="/admin/*"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />

      {/* ── User website (any logged-in user) ── */}
      <Route path="/"
        element={
          <PrivateRoute>
            <UserWebsite />
          </PrivateRoute>
        }
      />

      {/* ── Catch-all ── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

/* ─── Root ───────────────────────────────────────────────────── */
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </AuthProvider>
  );
}
