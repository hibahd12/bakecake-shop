import React, { useState, useEffect } from 'react';
import { useAuth, axios } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

/**
 * UserDashboard
 * Regular user view: profile info, recent orders, product catalog
 */
export default function UserDashboard() {
  const { user, logout }   = useAuth();
  const navigate            = useNavigate();
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading]     = useState(true);

  // Profile edit state
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', phone: user?.phone || '', address: user?.address || '' });
  const [profileMsg, setProfileMsg]   = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [ordersRes, productsRes] = await Promise.all([
          axios.get('/orders'),
          axios.get('/products?per_page=20'),
        ]);
        setOrders(ordersRes.data.data || []);
        setProducts(productsRes.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    try {
      await axios.put('/profile', profileForm);
      setProfileMsg('Profil mis à jour avec succès ! ✅');
    } catch {
      setProfileMsg('Erreur lors de la mise à jour.');
    }
  };

  // Status labels
  const statusBadge = (status) => {
    const map = {
      pending:     'bg-warning text-dark',
      preparation: 'bg-info text-dark',
      ready:       'bg-primary',
      delivered:   'bg-success',
      cancelled:   'bg-danger',
    };
    const labels = { pending:'En attente', preparation:'En préparation', ready:'Prêt', delivered:'Livré', cancelled:'Annulé' };
    return <span className={`badge ${map[status]||'bg-secondary'}`}>{labels[status]||status}</span>;
  };

  const NavItem = ({ id, icon, label }) => (
    <li className="nav-item mb-1">
      <button
        className={`nav-link d-flex align-items-center gap-2 px-3 py-2 rounded-3 w-100 border-0 text-start ${activeTab===id?'active text-white':'text-secondary'}`}
        style={activeTab===id
          ?{background:'linear-gradient(135deg,#ee6166,#f06080)',fontWeight:600}
          :{background:'transparent',fontWeight:500}}
        onClick={()=>setActiveTab(id)}
      >
        <i className={`bi bi-${icon}`}></i> {label}
      </button>
    </li>
  );

  if (loading) return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center">
      <div className="spinner-border text-danger" style={{ width:'3rem',height:'3rem' }}></div>
    </div>
  );

  return (
    <div className="d-flex min-vh-100" style={{ background:'#f0f2f5',fontFamily:"'Inter',sans-serif" }}>

      {/* Sidebar */}
      <aside className="d-flex flex-column bg-white border-end shadow-sm"
        style={{ width:220,minHeight:'100vh',position:'fixed',top:0,left:0,bottom:0,zIndex:100 }}>

        <div className="d-flex align-items-center gap-2 p-4 border-bottom">
          <div className="d-flex align-items-center justify-content-center rounded-3"
            style={{ width:40,height:40,background:'linear-gradient(135deg,#ee6166,#f3c2b9)',fontSize:20 }}>
            🎂
          </div>
          <span style={{ fontWeight:800,fontSize:20,background:'linear-gradient(135deg,#c4556b,#3e2e26)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent' }}>
            BakeCake
          </span>
        </div>

        <nav className="flex-grow-1 p-3">
          <small className="text-uppercase text-muted fw-bold px-2" style={{ fontSize:10,letterSpacing:1 }}>Mon Espace</small>
          <ul className="nav flex-column mt-2">
            <NavItem id="profile"  icon="person-circle"  label="Mon Profil" />
            <NavItem id="orders"   icon="box-seam"        label="Mes Commandes" />
            <NavItem id="catalog"  icon="cake2"           label="Catalogue" />
          </ul>
        </nav>

        <div className="border-top p-3">
          <div className="d-flex align-items-center gap-2 mb-2">
            <div className="d-flex align-items-center justify-content-center rounded-circle text-white fw-bold"
              style={{ width:34,height:34,background:'linear-gradient(135deg,#3d4f82,#5b6fb3)',fontSize:13 }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize:13,fontWeight:600 }}>{user?.name}</div>
              <div style={{ fontSize:11,color:'#9499a8' }}>Client</div>
            </div>
          </div>
          <button onClick={handleLogout} className="btn btn-sm btn-outline-danger w-100 rounded-3">
            <i className="bi bi-box-arrow-left me-1"></i>Déconnexion
          </button>
        </div>
      </aside>

      {/* Main */}
      <div style={{ marginLeft:220,flex:1 }}>

        {/* Topbar */}
        <header className="bg-white border-bottom d-flex align-items-center px-4 sticky-top shadow-sm"
          style={{ height:64,zIndex:50 }}>
          <div className="flex-grow-1">
            <h5 className="mb-0 fw-bold">Bienvenue, <span style={{ color:'#ee6166' }}>{user?.name}</span> 👋</h5>
          </div>
          <div className="d-flex align-items-center gap-2 border rounded-3 px-3 py-1">
            <div className="d-flex align-items-center justify-content-center rounded-circle text-white fw-bold"
              style={{ width:30,height:30,background:'linear-gradient(135deg,#3d4f82,#5b6fb3)',fontSize:12 }}>
              {user?.name?.charAt(0)}
            </div>
            <div>
              <div style={{ fontSize:13,fontWeight:600 }}>{user?.name}</div>
              <div style={{ fontSize:11,color:'#9499a8' }}>Client</div>
            </div>
          </div>
        </header>

        <main className="p-4">

          {/* ── PROFILE ───────────────────────────────────────────────────── */}
          {activeTab === 'profile' && (
            <>
              <h1 className="fw-bold mb-4" style={{ fontSize:22 }}>Mon Profil</h1>

              {/* Stats row */}
              <div className="row g-3 mb-4">
                {[
                  { label:'Commandes', value:orders.length, icon:'📦', color:'#3e2e26', bg:'#e8eeff' },
                  { label:'Livraisons', value:orders.filter(o=>o.status==='delivered').length, icon:'✅', color:'#27ae60', bg:'#d4f5e3' },
                  { label:'En cours', value:orders.filter(o=>['pending','preparation'].includes(o.status)).length, icon:'⏳', color:'#f5a623', bg:'#fde8b8' },
                ].map((s,i)=>(
                  <div key={i} className="col-md-4">
                    <div className="card border-0 shadow-sm rounded-4">
                      <div className="card-body d-flex align-items-center gap-3 p-3">
                        <div className="d-flex align-items-center justify-content-center rounded-3"
                          style={{ width:46,height:46,background:s.bg,fontSize:22 }}>{s.icon}</div>
                        <div>
                          <div style={{ fontSize:24,fontWeight:800 }}>{s.value}</div>
                          <div className="text-muted small">{s.label}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Profile form */}
              <div className="card border-0 shadow-sm rounded-4">
                <div className="card-header bg-white border-0 py-3 px-4">
                  <span className="fw-bold">Informations personnelles</span>
                </div>
                <div className="card-body p-4">
                  {profileMsg && <div className="alert alert-success py-2 small">{profileMsg}</div>}
                  <form onSubmit={handleProfileSave}>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-semibold small text-muted">Nom complet</label>
                        <input type="text" className="form-control rounded-3" value={profileForm.name}
                          onChange={e=>setProfileForm(p=>({...p,name:e.target.value}))} />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-semibold small text-muted">Email</label>
                        <input type="email" className="form-control rounded-3" value={user?.email} disabled />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-semibold small text-muted">Téléphone</label>
                        <input type="tel" className="form-control rounded-3" value={profileForm.phone}
                          onChange={e=>setProfileForm(p=>({...p,phone:e.target.value}))} />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-semibold small text-muted">Adresse de livraison</label>
                        <input type="text" className="form-control rounded-3" value={profileForm.address}
                          onChange={e=>setProfileForm(p=>({...p,address:e.target.value}))} />
                      </div>
                    </div>
                    <button type="submit" className="btn text-white rounded-3 px-4"
                      style={{ background:'linear-gradient(135deg,#ee6166,#f06080)',border:'none' }}>
                      <i className="bi bi-check2 me-2"></i>Sauvegarder
                    </button>
                  </form>
                </div>
              </div>
            </>
          )}

          {/* ── ORDERS ────────────────────────────────────────────────────── */}
          {activeTab === 'orders' && (
            <>
              <h1 className="fw-bold mb-4" style={{ fontSize:22 }}>Mes Commandes</h1>
              {orders.length === 0
                ? <div className="text-center py-5 text-muted"><div style={{ fontSize:48 }}>📦</div><p>Aucune commande pour l'instant.</p></div>
                : (
                  <div className="card border-0 shadow-sm rounded-4">
                    <div className="table-responsive">
                      <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                          <tr><th>ID</th><th>Produits</th><th>Date</th><th>Total</th><th>Statut</th></tr>
                        </thead>
                        <tbody>
                          {orders.map(o => (
                            <tr key={o.id}>
                              <td><strong className="text-primary">#{o.id}</strong></td>
                              <td className="text-muted" style={{ fontSize:13 }}>{o.items?.map(i=>`${i.product?.name} x${i.quantity}`).join(', ')}</td>
                              <td className="text-muted" style={{ fontSize:13 }}>{new Date(o.created_at).toLocaleDateString('fr-FR')}</td>
                              <td><strong>€{Number(o.total_amount).toLocaleString('fr-FR')}</strong></td>
                              <td>{statusBadge(o.status)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )
              }
            </>
          )}

          {/* ── CATALOG ───────────────────────────────────────────────────── */}
          {activeTab === 'catalog' && (
            <>
              <h1 className="fw-bold mb-4" style={{ fontSize:22 }}>Notre Catalogue</h1>
              <div className="row g-3">
                {products.map(product => (
                  <div key={product.id} className="col-md-4">
                    <div className="card border-0 shadow-sm rounded-4 h-100">
                      <div className="d-flex align-items-center justify-content-center rounded-top-4"
                        style={{ height:120,background:'linear-gradient(135deg,#fdf6f0,#fdeaea)',fontSize:56 }}>
                        🎂
                      </div>
                      <div className="card-body p-3">
                        <div className="d-flex justify-content-between align-items-start mb-1">
                          <h6 className="fw-bold mb-0">{product.name}</h6>
                          <span className="fw-bold" style={{ color:'#ee6166' }}>€{product.price}</span>
                        </div>
                        <p className="text-muted small mb-2">{product.description}</p>
                        <div className="d-flex justify-content-between align-items-center">
                          <small className="text-muted">Stock: <strong>{product.stock}</strong></small>
                          <span className={`badge rounded-pill ${product.stock > 5 ? 'bg-success' : 'bg-warning text-dark'}`} style={{ fontSize:10 }}>
                            {product.stock > 5 ? 'Disponible' : 'Stock faible'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

        </main>
      </div>
    </div>
  );
}
