import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * LoginPage — Clean login matching BakeCake brand
 * Admin → /admin dashboard
 * User  → / cake shop website
 */
export default function LoginPage() {
  const { login }     = useAuth();
  const navigate      = useNavigate();
  const [form, setForm]       = useState({ email: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      /* Admin → admin dashboard; everyone else → cake shop website */
      navigate(user.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Email ou mot de passe incorrect.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight:'100vh', display:'flex',
      fontFamily:"'Inter',sans-serif",
      background:'linear-gradient(160deg, #fceee9 0%, #f3c2b9 100%)',
    }}>

      {/* Left: illustration */}
      <div style={{
        flex:1, display:'flex', flexDirection:'column',
        alignItems:'center', justifyContent:'center',
        padding:'60px 40px',
      }}>
        <img src="/logo.png" alt="BakeCake Logo" style={{ height: 180, objectFit: 'contain', marginBottom:16 }} />
        <p style={{ color:'#a0522d', fontSize:15, textAlign:'center', maxWidth:280, lineHeight:1.6 }}>
          Yummy sweeties delivered to your dining table!
        </p>

      </div>

      {/* Right: login form */}
      <div style={{
        width:440, background:'#fff',
        display:'flex', flexDirection:'column',
        alignItems:'center', justifyContent:'center',
        padding:'60px 48px',
        boxShadow:'-8px 0 40px rgba(0,0,0,0.08)',
      }}>

        {/* Header */}
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ fontSize:13, fontWeight:600, color:'#888', textTransform:'uppercase', letterSpacing:0.8, marginBottom:6 }}>
            Bienvenue sur
          </div>
          <div style={{ fontFamily:"Georgia,serif", fontSize:28, fontWeight:700, color:'#5e453a' }}>
            Cake shop
          </div>
          <div style={{ fontSize:13, color:'#aaa', marginTop:4 }}>Connectez-vous à votre compte</div>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background:'#fdecea', color:'#c62828', padding:'10px 16px',
            borderRadius:8, fontSize:13, marginBottom:20, width:'100%',
            border:'1px solid #fcc',
          }}>
            ⚠ {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ width:'100%' }}>
          <div style={{ marginBottom:18 }}>
            <label style={{ fontSize:12, fontWeight:600, color:'#555', display:'block', marginBottom:6 }}>
              Adresse email
            </label>
            <input
              id="login-email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="votre@email.fr"
              required
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom:28 }}>
            <label style={{ fontSize:12, fontWeight:600, color:'#555', display:'block', marginBottom:6 }}>
              Mot de passe
            </label>
            <input
              id="login-password"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              style={inputStyle}
            />
          </div>

          <button
            id="btn-login"
            type="submit"
            disabled={loading}
            style={{
              width:'100%', padding:'13px',
              background: loading ? '#e8a0b0' : '#ee6166',
              color:'#fff', border:'none',
              fontWeight:700, fontSize:14,
              letterSpacing:0.5, cursor: loading ? 'not-allowed' : 'pointer',
              textTransform:'uppercase',
              transition:'background 0.15s',
            }}
            onMouseEnter={e=>{ if(!loading) e.target.style.background='#d34e54'; }}
            onMouseLeave={e=>{ if(!loading) e.target.style.background='#ee6166'; }}
          >
            {loading ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>

        <div style={{ marginTop:24, fontSize:13, color:'#888', textAlign:'center' }}>
          Pas encore de compte ?{' '}
          <Link to="/register" style={{ color:'#ee6166', fontWeight:600, textDecoration:'none' }}>
            S'inscrire
          </Link>
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  width:'100%', padding:'11px 14px',
  border:'1.5px solid #e8e8e8', borderRadius:6,
  fontSize:13, outline:'none',
  fontFamily:"'Inter',sans-serif",
  transition:'border-color 0.15s',
};
