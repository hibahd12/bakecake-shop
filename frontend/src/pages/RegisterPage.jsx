import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * RegisterPage
 * New user registration form
 */
export default function RegisterPage() {
  const { register } = useAuth();
  const navigate     = useNavigate();

  const [form, setForm]       = useState({ name: '', email: '', password: '', password_confirmation: '', phone: '' });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors || {});
      } else {
        setErrors({ general: err.response?.data?.message || 'Erreur d\'inscription.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const fieldError = (field) =>
    errors[field] ? <div className="text-danger small mt-1">{errors[field][0]}</div> : null;

  return (
    <div className="min-vh-100 d-flex align-items-center py-4" style={{ background: 'linear-gradient(135deg, #fdf6f0 0%, #fdeaea 100%)' }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6">

            <div className="text-center mb-4">
              <div className="d-inline-flex align-items-center gap-2 bg-white rounded-4 px-4 py-2 shadow-sm">
                <img src="/logo.png" alt="BakeCake" height="48" style={{ objectFit: 'contain' }} />
              </div>
            </div>

            <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="card-header border-0 py-4 text-center" style={{ background: 'linear-gradient(135deg, #3e2e26, #3d4f82)' }}>
                <h2 className="text-white fw-bold mb-1">Créer un compte</h2>
                <p className="text-white opacity-75 mb-0 small">Rejoignez la communauté BakeCake</p>
              </div>

              <div className="card-body p-4">
                {errors.general && (
                  <div className="alert alert-danger py-2 small">{errors.general}</div>
                )}

                <form onSubmit={handleSubmit} noValidate>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold small text-muted" htmlFor="reg-name">Nom complet</label>
                      <input id="reg-name" type="text" name="name" className="form-control rounded-3"
                        placeholder="Votre nom" value={form.name} onChange={handleChange} required />
                      {fieldError('name')}
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold small text-muted" htmlFor="reg-phone">Téléphone</label>
                      <input id="reg-phone" type="tel" name="phone" className="form-control rounded-3"
                        placeholder="+212 6 12 34 56 78" value={form.phone} onChange={handleChange} />
                      {fieldError('phone')}
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold small text-muted" htmlFor="reg-email">Email</label>
                    <input id="reg-email" type="email" name="email" className="form-control rounded-3"
                      placeholder="votre@email.ma" value={form.email} onChange={handleChange} required />
                    {fieldError('email')}
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold small text-muted" htmlFor="reg-password">Mot de passe</label>
                      <input id="reg-password" type="password" name="password" className="form-control rounded-3"
                        placeholder="Min. 8 caractères" value={form.password} onChange={handleChange} required />
                      {fieldError('password')}
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold small text-muted" htmlFor="reg-confirm">Confirmer</label>
                      <input id="reg-confirm" type="password" name="password_confirmation" className="form-control rounded-3"
                        placeholder="••••••••" value={form.password_confirmation} onChange={handleChange} required />
                    </div>
                  </div>

                  <button type="submit" id="btn-register"
                    className="btn btn-lg w-100 rounded-3 text-white fw-semibold mt-2"
                    style={{ background: 'linear-gradient(135deg, #3e2e26, #3d4f82)', border: 'none' }}
                    disabled={loading}>
                    {loading
                      ? <><span className="spinner-border spinner-border-sm me-2"></span>Inscription…</>
                      : <><i className="bi bi-person-plus me-2"></i>Créer mon compte</>
                    }
                  </button>
                </form>

                <hr className="my-3" />
                <p className="text-center text-muted small mb-0">
                  Déjà inscrit ?{' '}
                  <Link to="/login" className="text-decoration-none fw-semibold" style={{ color: '#ee6166' }}>
                    Se connecter
                  </Link>
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
