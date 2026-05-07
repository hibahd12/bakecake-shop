import React, { useState, useEffect, useRef } from 'react';
import { useAuth, axios } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

/* ─── Image URL helper ──────────────────────────────────────────────────────
 * Products store their image path as e.g. "products/abc.jpg" (relative to
 * the Laravel `public` disk, served at /storage/…).  Full URL = BACKEND/storage/path.
 * In dev, Vite proxies /storage → Laravel:8000/storage, so we just use /storage/…
 */
const BACKEND_URL = import.meta.env.VITE_API_URL || '';
function imgSrc(path) {
  if (!path) return null;
  // Already a full URL
  if (path.startsWith('http')) return path;
  const base = BACKEND_URL || '';
  return `${base}/storage/${path}`;
}

/* ─── Chart.js imports ─────────────────────────────────────────── */
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, Title, Tooltip,
  Legend, Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, Title, Tooltip, Legend, Filler
);

/* ══════════════════════════════════════════════════════════════════
   ADMIN DASHBOARD  –  exact replica of the BakeCake screenshot
══════════════════════════════════════════════════════════════════ */
export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeNav, setActiveNav]     = useState('dashboard');
  const [chartMode, setChartMode]     = useState('monthly');
  const [stats, setStats]             = useState(null);
  const [orders, setOrders]           = useState([]);
  const [products, setProducts]       = useState([]);
  const [users, setUsers]             = useState([]);
  const [contacts, setContacts]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [clientSearch, setClientSearch] = useState('');

  /* ── Product CRUD modal state ─────────────────────────────── */
  const [showModal, setShowModal]   = useState(false);
  const [editProduct, setEditProduct] = useState(null); // null = add, object = edit
  const [savingProduct, setSavingProduct] = useState(false);
  const [productError, setProductError]   = useState('');

  /* ── Load all data ─────────────────────────────────────────── */
  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [s, o, p, u, c] = await Promise.all([
        axios.get('/admin/stats'),
        axios.get('/orders?per_page=500'),   // fetch all orders for accurate stats
        axios.get('/products?per_page=20'),
        axios.get('/admin/users?per_page=15'),
        axios.get('/admin/contacts'),
      ]);
      setStats(s.data);
      setOrders(o.data.data || []);
      setProducts(p.data.data || []);
      setUsers(u.data.data || []);
      setContacts(c.data.data || []);
    } catch(e) { console.error(e); }
    finally   { setLoading(false); }
  };

  const handleLogout = async () => { await logout(); navigate('/login'); };

  const updateOrderStatus = async (id, status) => {
    try { await axios.patch(`/orders/${id}/status`, { status }); loadAll(); }
    catch { alert('Erreur lors de la mise à jour du statut.'); }
  };

  const markContactRead = async (id) => {
    try { await axios.patch(`/admin/contacts/${id}/read`); loadAll(); }
    catch { alert('Error marking as read.'); }
  };

  const toggleUser = async (id, cur) => {
    try { await axios.patch(`/admin/users/${id}`, { is_active: !cur }); loadAll(); }
    catch { alert('Une erreur est survenue.'); }
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Confirmer la suppression ?')) return;
    try { await axios.delete(`/admin/users/${id}`); loadAll(); }
    catch { alert('Une erreur est survenue.'); }
  };

  /* ── Product CRUD handlers ─────────────────────────────────── */
  const openAddProduct = () => { setEditProduct(null); setProductError(''); setShowModal(true); };
  const openEditProduct = (p) => { setEditProduct(p); setProductError(''); setShowModal(true); };
  const closeModal = () => setShowModal(false);

  const saveProduct = async (formData, id) => {
    setSavingProduct(true);
    setProductError('');
    try {
      if (id) {
        await axios.post(`/products/${id}?_method=PUT`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await axios.post('/products', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      setShowModal(false);
      loadAll();
    } catch (err) {
      const msgs = err.response?.data?.errors;
      if (msgs) {
        setProductError(Object.values(msgs).flat().join(' '));
      } else {
        setProductError(err.response?.data?.message || 'Erreur lors de la sauvegarde.');
      }
    } finally {
      setSavingProduct(false);
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm('Supprimer ce produit ?')) return;
    try { await axios.delete(`/products/${id}`); loadAll(); }
    catch { alert('Erreur lors de la suppression.'); }
  };

  /* ── Derived stats from real orders ───────────────────────── */
  // Total revenue: sum all order totals (all statuses count for display)
  const derivedRevenue = orders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);

  // Revenue from stats API preferred; fall back to derived from fetched orders
  const totalRevenue = stats?.revenue?.total != null
    ? Number(stats.revenue.total)
    : derivedRevenue;

  // Monthly revenue: if API provides monthly_series use it;
  // otherwise, build it ourselves from the fetched orders array
  const buildMonthlyFromOrders = () => {
    const monthMap = {};
    const now = new Date();
    // Initialise last 12 months with zero
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleString('fr-FR', { month: 'short' });
      monthMap[key] = 0;
    }
    orders.forEach(o => {
      if (!o.created_at) return;
      const d = new Date(o.created_at);
      const key = d.toLocaleString('fr-FR', { month: 'short' });
      if (key in monthMap) monthMap[key] += Number(o.total_amount || 0);
    });
    return {
      labels: Object.keys(monthMap),
      values: Object.values(monthMap),
    };
  };

  const hasApiSeries = stats?.monthly_series?.length > 0;
  const monthlyLabels = hasApiSeries
    ? stats.monthly_series.map(m => m.month)
    : buildMonthlyFromOrders().labels;
  const monthlyValues = hasApiSeries
    ? stats.monthly_series.map(m => Number(m.revenue))
    : buildMonthlyFromOrders().values;

  // Pending orders count from real orders
  const derivedPending = orders.filter(o =>
    o.status === 'pending' || o.status === 'preparation'
  ).length;
  const pendingCount = stats?.orders?.pending ?? derivedPending;

  // New clients this month from users list
  const thisMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const derivedNewClients = users.filter(u => new Date(u.created_at) >= thisMonthStart).length;
  const newClientsCount = stats?.clients?.new ?? derivedNewClients;

  // Top product from products list
  const derivedTopProduct = products.length > 0
    ? products.reduce((best, p) => (Number(p.total_sales||0) > Number(best.total_sales||0) ? p : best), products[0])
    : null;
  const topProduct = stats?.top_product || derivedTopProduct;

  /* ── Chart data ────────────────────────────────────────────── */
  const salesData = {
    labels: monthlyLabels,
    datasets: [{
      data: monthlyValues,
      borderColor: '#6c63ff',
      backgroundColor: 'rgba(108,99,255,0.12)',
      borderWidth: 2,
      pointBackgroundColor: '#6c63ff',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 4,
      fill: true,
      tension: 0.45,
    }]
  };

  const popData = {
    labels: stats?.popular_products?.map(p => p.name.replace('Gâteau ', 'G. ')) || [],
    datasets: [
      {
        label: 'Ventes',
        data: stats?.popular_products?.map(p => p.total_sales) || [],
        backgroundColor: ['#5e453a','#ee6166','#5e453a','#5e453a','#5e453a'],
        borderRadius: 3,
        barThickness: 22,
      }
    ]
  };

  const chartOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#888', font: { size: 10 } } },
      y: { grid: { color: '#f0f0f0', drawBorder: false },
           ticks: { color: '#888', font: { size: 10 },
                    callback: v => (v >= 1000 ? (v/1000).toFixed(0)+'k' : v) + ' MAD' } }
    }
  };

  const barOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#555', font: { size: 9 }, maxRotation: 0 } },
      y: { grid: { color: '#f0f0f0' }, ticks: { color: '#888', font: { size: 10 } } }
    }
  };

  /* ── Status badge ──────────────────────────────────────────── */
  const Badge = ({ status }) => {
    const map = {
      preparation: { bg: '#e8f4fd', color: '#1976d2', text: 'En préparation' },
      delivered:   { bg: '#e8f5e9', color: '#388e3c', text: 'Livré'          },
      cancelled:   { bg: '#fdecea', color: '#d32f2f', text: 'Annulé'         },
      pending:     { bg: '#fff8e1', color: '#f57c00', text: 'En attente'      },
      ready:       { bg: '#e8f5e9', color: '#388e3c', text: 'Prêt'           },
    };
    const s = map[status] || { bg:'#f5f5f5', color:'#666', text: status };
    return (
      <span style={{
        background: s.bg, color: s.color,
        padding: '3px 10px', borderRadius: 20,
        fontSize: 11, fontWeight: 600,
        whiteSpace: 'nowrap',
      }}>{s.text}</span>
    );
  };

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f5f0ea' }}>
      <div style={{ textAlign:'center' }}>
        <img src="/logo.png" alt="BakeCake" style={{ height: 100, marginBottom: 16, objectFit: 'contain' }} />
        <p style={{ color:'#888', fontWeight: 500 }}>Chargement en cours…</p>
      </div>
    </div>
  );

  // No demo data — strictly use API data
  const gridOrders = orders;
  const gridProducts = products;

  /* ═══════════════════════════════ RENDER ═══════════════════════ */
  return (
    <div style={{ display:'flex', minHeight:'100vh', fontFamily:"'Inter',sans-serif", fontSize:13 }}>

      {/* ════════════ SIDEBAR ════════════════════════════════════ */}
      <aside style={{
        width: 200, minHeight:'100vh', background:'#fff',
        borderRight:'1px solid #e8e8e8', position:'fixed',
        top:0, left:0, bottom:0, zIndex:100,
        display:'flex', flexDirection:'column', overflow:'hidden',
      }}>

        {/* Logo */}
        <div style={{ padding:'18px 16px', borderBottom:'1px solid #f0ece8', display: 'flex', justifyContent: 'center' }}>
          <img src="/logo.png" alt="BakeCake" style={{ height: 60, objectFit: 'contain' }} />
        </div>

        {/* Nav items */}
        <nav style={{ padding:'12px 0', flex:1 }}>
          {[
            { id:'dashboard', icon:'📊', label:'Dashboard'  },
            { id:'catalogue', icon:'🍰', label:'Catalogue'  },
            { id:'commandes', icon:'📦', label:'Commandes'  },
            { id:'clients',   icon:'👤', label:'Clients'    },
            { id:'messages',  icon:'✉️', label:'Messages'   },
          ].map(item => (
            <button key={item.id}
              onClick={() => setActiveNav(item.id)}
              style={{
                display:'flex', alignItems:'center', gap:10,
                width:'100%', padding:'9px 16px', border:'none',
                background: activeNav===item.id ? '#5e453a' : 'transparent',
                color:      activeNav===item.id ? '#fff'    : '#555',
                fontWeight: activeNav===item.id ? 600       : 400,
                fontSize: 13, cursor:'pointer', textAlign:'left',
                borderRadius: activeNav===item.id ? 0 : 0,
                transition:'background 0.15s',
              }}
            >
              <span style={{ fontSize:15 }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Bottom bakery illustration area */}
        <div style={{
          height:220, position:'relative', overflow:'hidden',
          background:'linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(245,230,210,0.3) 100%)',
        }}>
          {/* Kitchen background simulated */}
          <div style={{
            position:'absolute', bottom:0, left:0, right:0,
            height:'100%',
            backgroundImage:'url(https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=300&q=60)',
            backgroundSize:'cover', backgroundPosition:'center top',
            opacity:0.25,
          }}/>
          {/* Cake illustration */}
          <div style={{
            position:'absolute', bottom:10, left:'50%',
            transform:'translateX(-50%)',
            fontSize:60, filter:'drop-shadow(0 4px 8px rgba(0,0,0,0.15))',
          }}>🎂</div>
        </div>
      </aside>

      {/* ════════════ MAIN CONTENT ═══════════════════════════════ */}
      <div style={{ marginLeft:200, flex:1, background:'#f5f0ea', minHeight:'100vh' }}>

        {/* ── Topbar ─────────────────────────────────────────── */}
        <header style={{
          background:'#fff', borderBottom:'1px solid #e8e8e8',
          height:56, display:'flex', alignItems:'center',
          padding:'0 24px', gap:16, position:'sticky', top:0, zIndex:50,
          boxShadow:'0 1px 4px rgba(0,0,0,0.06)',
        }}>
          {/* Search */}
          {/* <div style={{
            display:'flex', alignItems:'center', gap:8,
            background:'#f5f5f5', border:'1px solid #e8e8e8',
            borderRadius:8, padding:'6px 14px', flex:1, maxWidth:340,
          }}>
            <span style={{ color:'#aaa', fontSize:14 }}>🔍</span>
            <input placeholder="Rechercher..." style={{
              border:'none', background:'transparent', outline:'none',
              fontSize:13, color:'#555', width:'100%',
            }}/>
          </div>

          <div style={{ flex:1 }}/> */}

          {/* Bell */}
          <button style={{
            marginLeft: 'auto',
            position:'relative', background:'#f5f5f5',
            border:'1px solid #e8e8e8', borderRadius:8,
            width:36, height:36, cursor:'pointer', fontSize:16,
          }}>
            🔔
            <span style={{
              position:'absolute', top:4, right:4,
              width:8, height:8, background:'#e53935',
              borderRadius:'50%', border:'2px solid #fff',
            }}/>
          </button>

          {/* User */}
          <div style={{
            display:'flex', alignItems:'center', gap:8,
            cursor:'pointer', padding:'4px 8px',
            borderRadius:8, border:'1px solid #e8e8e8',
          }}>
            <div style={{
              width:32, height:32, borderRadius:8, overflow:'hidden',
              background:'#e8d5c4',
            }}>
              {/* Avatar placeholder */}
              <div style={{
                width:'100%', height:'100%',
                background:'linear-gradient(135deg,#5e453a,#ee6166)',
                display:'flex', alignItems:'center', justifyContent:'center',
                color:'#fff', fontWeight:700, fontSize:13,
              }}>
                {user?.name?.charAt(0) || 'B'}
              </div>
            </div>
            <div>
              <div style={{ fontSize:13, fontWeight:600, lineHeight:1.2 }}>{user?.name || 'btebeta hdr'}</div>
              <div style={{ fontSize:11, color:'#888' }}>Admin</div>
            </div>
            <span style={{ color:'#aaa', fontSize:11 }}>▾</span>
          </div>

          {/* Logout */}
          <button onClick={handleLogout} style={{
            background:'transparent', border:'1px solid #ddd',
            borderRadius:6, padding:'4px 10px', fontSize:12,
            cursor:'pointer', color:'#888',
          }}>↩ Déconnexion</button>
        </header>

        {/* ── Page body ──────────────────────────────────────── */}
        <div style={{ padding:'20px 24px' }}>

          {/* ════ DASHBOARD ════════════════════════════════════ */}
          {activeNav === 'dashboard' && (
            <>
              <h1 style={{ fontSize:22, fontWeight:700, marginBottom:18, color:'#222' }}>
                Tableau de Bord — BakeCake Maroc
              </h1>

              {/* ── KPI Cards ─────────────────────────────────── */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:18 }}>

                {/* Card 1 – Revenue (fully dynamic) */}
                <div style={cardStyle}>
                  <div style={{ fontSize:11, color:'#888', marginBottom:8, fontWeight:500 }}>Chiffre d'Affaires Total</div>
                  <div style={{ fontSize:26, fontWeight:800, color:'#222', letterSpacing:-1 }}>
                    {totalRevenue.toLocaleString('fr-FR')} MAD
                  </div>
                  <div style={{ fontSize:11, color:'#aaa', fontWeight:400, marginTop:4 }}>
                    {orders.length} commande{orders.length !== 1 ? 's' : ''} au total
                  </div>
                  <div style={{ position:'absolute', top:14, right:14 }}>
                    <div style={{ width:38, height:38, background:'#fff0ee', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>
                      📊
                    </div>
                  </div>
                </div>

                {/* Card 2 – Pending (dynamic) */}
                <div style={cardStyle}>
                  <div style={{ fontSize:11, color:'#888', marginBottom:8, fontWeight:500 }}>Commandes en attente</div>
                  <div style={{ fontSize:32, fontWeight:800, color:'#222' }}>
                    {pendingCount}
                  </div>
                  <div style={{ fontSize:11, color: pendingCount > 0 ? '#f57c00' : '#388e3c', fontWeight:600, marginTop:4 }}>
                    {pendingCount > 0 ? '⚠ À traiter' : '✓ Tout traité'}
                  </div>
                  <div style={{ position:'absolute', top:14, right:14 }}>
                    <div style={{ width:38, height:38, background:'#fff8f5', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>
                      🍓
                    </div>
                  </div>
                </div>

                {/* Card 3 – Clients (dynamic) */}
                <div style={cardStyle}>
                  <div style={{ fontSize:11, color:'#888', marginBottom:8, fontWeight:500 }}>Nouveaux Clients ce mois</div>
                  <div style={{ fontSize:32, fontWeight:800, color:'#222' }}>
                    {newClientsCount}
                  </div>
                  <div style={{ fontSize:11, color:'#388e3c', fontWeight:600, marginTop:4 }}>
                    {stats?.clients?.total ?? users.length} clients au total
                  </div>
                  <div style={{ position:'absolute', top:14, right:14 }}>
                    <div style={{ width:38, height:38, background:'#e8f0fe', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>
                      👤
                    </div>
                  </div>
                </div>

                {/* Card 4 – Top product (dynamic) */}
                <div style={cardStyle}>
                  <div style={{ fontSize:11, color:'#888', marginBottom:8, fontWeight:500 }}>Top Produit</div>
                  <div style={{ fontSize:17, fontWeight:800, color:'#222', lineHeight:1.2 }}>
                    {topProduct?.name || '—'}
                  </div>
                  <div style={{ fontSize:11, color:'#aaa', marginTop:4 }}>
                    {topProduct?.total_sales || 0} ventes
                  </div>
                  <div style={{ position:'absolute', top:14, right:14 }}>
                    <div style={{ width:38, height:38, background:'#fff8e1', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>
                      👑
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Charts Row ────────────────────────────────── */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:18 }}>

                {/* Sales line chart */}
                <div style={{ background:'#fff', borderRadius:12, padding:'16px 18px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
                    <span style={{ fontWeight:700, fontSize:14 }}>Chiffre d'Affaires — Mensuel</span>
                    <div style={{ display:'flex', background:'#f0f0f0', borderRadius:6, padding:3, gap:2 }}>
                      <button onClick={()=>setChartMode('monthly')} style={{
                        padding:'3px 12px', borderRadius:5, border:'none', fontSize:12, cursor:'pointer',
                        background: chartMode==='monthly' ? '#5e453a' : 'transparent',
                        color:      chartMode==='monthly' ? '#fff'    : '#555',
                        fontWeight: 600,
                      }}>Mensuel</button>
                      <button onClick={()=>setChartMode('yearly')} style={{
                        padding:'3px 12px', borderRadius:5, border:'none', fontSize:12, cursor:'pointer',
                        background: chartMode==='yearly' ? '#5e453a' : 'transparent',
                        color:      chartMode==='yearly' ? '#fff'    : '#555',
                        fontWeight: 600,
                      }}>Annuel</button>
                    </div>
                  </div>
                  <div style={{ height: 200 }}>
                    <Line data={salesData} options={chartOptions}/>
                  </div>
                </div>

                {/* Popular cakes bar chart */}
                <div style={{ background:'#fff', borderRadius:12, padding:'16px 18px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
                  <div style={{ fontWeight:700, fontSize:14, marginBottom:14 }}>Gâteaux les plus populaires</div>
                  <div style={{ height:200 }}>
                    <Bar data={popData} options={barOptions}/>
                  </div>
                </div>
              </div>

              {/* ── Bottom Row ────────────────────────────────── */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 340px', gap:14 }}>

                {/* Orders table */}
                <div style={{ background:'#fff', borderRadius:12, boxShadow:'0 1px 4px rgba(0,0,0,0.06)', overflow:'hidden' }}>
                  <div style={{ padding:'14px 18px', fontWeight:700, fontSize:14, borderBottom:'1px solid #f5f5f5' }}>
                    Dernières Commandes — Maroc
                  </div>
                  <table style={{ width:'100%', borderCollapse:'collapse' }}>
                    <thead>
                      <tr style={{ background:'#fafafa' }}>
                        {['ID','Client','Gâteau(x)','Date','Total (MAD)','Statut'].map(h=>(
                          <th key={h} style={{ padding:'8px 14px', textAlign:'left', fontSize:11, fontWeight:700, color:'#888', letterSpacing:0.3, borderBottom:'1px solid #f0f0f0' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {gridOrders.slice(0,6).map((o,i)=>(
                        <tr key={o.id} style={{ borderBottom:'1px solid #f8f8f8' }}>
                          <td style={{ padding:'9px 14px', fontWeight:600, color:'#333', fontSize:12 }}>{o.id}</td>
                          <td style={{ padding:'9px 14px', fontSize:12 }}>{o.user?.name}</td>
                          <td style={{ padding:'9px 14px', fontSize:12, color:'#666' }}>{o.items?.length}x</td>
                          <td style={{ padding:'9px 14px', fontSize:12, color:'#888' }}>{new Date(o.created_at).toLocaleDateString('fr-FR')}</td>
                          <td style={{ padding:'9px 14px', fontSize:12, fontWeight:600 }}>{Number(o.total_amount).toLocaleString('fr-FR')} MAD</td>
                          <td style={{ padding:'9px 14px' }}><Badge status={o.status}/></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Quick actions panel */}
                <div style={{ background:'#fff', borderRadius:12, boxShadow:'0 1px 4px rgba(0,0,0,0.06)', overflow:'hidden' }}>
                  <div style={{
                    padding:'14px 18px', fontWeight:700, fontSize:14,
                    background:'linear-gradient(135deg,#3e2e26,#5e453a)', color:'#fff',
                  }}>
                    Gestion du Catalogue
                  </div>
                  <div style={{ padding:'14px' }}>
                    {/* Action buttons */}
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:14 }}>
                      <button onClick={openAddProduct} style={{
                        background:'#5e453a', color:'#fff',
                        border:'none', borderRadius:6, padding:'9px 8px',
                        fontWeight:600, fontSize:12, cursor:'pointer',
                      }}>✚ Ajouter un Produit</button>
                      <button style={{
                        background:'#fff', color:'#5e453a',
                        border:'1.5px solid #5e453a', borderRadius:6, padding:'9px 8px',
                        fontWeight:600, fontSize:12, cursor:'pointer',
                      }}>📦 Gérer les Stocks</button>
                    </div>

                    <div style={{ fontSize:11, color:'#888', marginBottom:10, fontWeight:600 }}>
                      Produits — État des Stocks :
                    </div>

                    {/* Stock items — with real product images */}
                    {gridProducts.map((p, i) => (
                      <div key={p.id} style={{
                        display:'flex', alignItems:'center', gap:10,
                        padding:'8px 0', borderBottom: i < gridProducts.length-1 ? '1px solid #f5f5f5' : 'none',
                      }}>
                        <div style={{
                          width:42, height:42, borderRadius:8, overflow:'hidden', flexShrink:0,
                          background:'#f5ece0',
                        }}>
                          {imgSrc(p.image)
                            ? <img src={imgSrc(p.image)} alt={p.name}
                                style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                            : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>🎂</div>
                          }
                        </div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontSize:12, fontWeight:600, color:'#333', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                            {p.name}
                          </div>
                          <div style={{ fontSize:11, color:'#aaa' }}>Stock: {p.stock}</div>
                        </div>
                        <button onClick={() => openEditProduct(p)} style={{
                          width:26, height:26, borderRadius:6,
                          border:'1px solid #eee', background:'#f9f9f9',
                          cursor:'pointer', fontSize:12, color:'#888',
                        }}>✏</button>
                      </div>
                    ))}
                  </div>
                </div>

              </div>{/* end bottom row */}
            </>
          )}

          {/* ════ COMMANDES TAB ════════════════════════════════ */}
          {activeNav === 'commandes' && (
            <>
              <h1 style={{ fontSize:20, fontWeight:700, marginBottom:16 }}>Gestion des Commandes</h1>
              <div style={{ background:'#fff', borderRadius:12, boxShadow:'0 1px 4px rgba(0,0,0,0.06)', overflow:'hidden' }}>
                <div style={{ overflowX:'auto' }}>
                  <table style={{ width:'100%', borderCollapse:'collapse' }}>
                    <thead>
                      <tr style={{ background:'#fafafa' }}>
                        {['ID','Client','Email','Articles','Date','Total','Statut','Action'].map(h=>(
                          <th key={h} style={{ padding:'10px 14px', textAlign:'left', fontSize:11, fontWeight:700, color:'#888', borderBottom:'1px solid #f0f0f0' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {gridOrders.map(o=>(
                        <tr key={o.id} style={{ borderBottom:'1px solid #f8f8f8' }}>
                          <td style={{ padding:'9px 14px', fontWeight:600, fontSize:12 }}>#{o.id}</td>
                          <td style={{ padding:'9px 14px', fontSize:12 }}>{o.user?.name}</td>
                          <td style={{ padding:'9px 14px', fontSize:11, color:'#888' }}>{o.user?.email||'—'}</td>
                          <td style={{ padding:'9px 14px', fontSize:12 }}>{o.items?.length}x</td>
                          <td style={{ padding:'9px 14px', fontSize:11, color:'#888' }}>{new Date(o.created_at).toLocaleDateString('fr-FR')}</td>
                          <td style={{ padding:'9px 14px', fontWeight:600, fontSize:12 }}>{Number(o.total_amount).toLocaleString('fr-FR')} MAD</td>
                          <td style={{ padding:'9px 14px' }}><Badge status={o.status}/></td>
                          <td style={{ padding:'9px 14px' }}>
                            <select style={{ fontSize:11, border:'1px solid #ddd', borderRadius:6, padding:'3px 6px' }}
                              value={o.status} onChange={e=>updateOrderStatus(o.id,e.target.value)}>
                              {['pending','preparation','ready','delivered','cancelled'].map(s=>(
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* ════ CATALOGUE TAB ════════════════════════════════ */}
          {activeNav === 'catalogue' && (
            <>
              {/* Header row */}
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18 }}>
                <h1 style={{ fontSize:20, fontWeight:700, margin:0 }}>Catalogue des Produits</h1>
                
                <button onClick={openAddProduct} style={{
                  background:'linear-gradient(135deg,#5e453a,#3e2e26)',
                  color:'#fff', border:'none', borderRadius:8,
                  padding:'9px 18px', fontWeight:700, fontSize:13, cursor:'pointer',
                  display:'flex', alignItems:'center', gap:6,
                  boxShadow:'0 2px 8px rgba(94,69,58,0.25)',
                }}>
                  <span style={{ fontSize:16 }}>＋</span> Nouveau Produit
                </button>
              </div>

              {/* Product grid */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:16 }}>
                {products.map(p => (
                  <div key={p.id} style={{
                    background:'#fff', borderRadius:14,
                    boxShadow:'0 2px 8px rgba(0,0,0,0.07)',
                    overflow:'hidden', display:'flex', flexDirection:'column',
                    transition:'transform .15s, box-shadow .15s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow='0 6px 18px rgba(0,0,0,0.11)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='0 2px 8px rgba(0,0,0,0.07)'; }}
                  >
                    {/* Product image */}
                    <div style={{ position:'relative', height:160, background:'linear-gradient(135deg,#fdf6f0,#fdeaea)', flexShrink:0 }}>
                      {imgSrc(p.image)
                        ? <img src={imgSrc(p.image)} alt={p.name}
                            style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                        : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:56, opacity:0.5 }}>🎂</div>
                      }
                      {/* Status badge */}
                      <span style={{
                        position:'absolute', top:8, right:8,
                        background: p.is_active ? '#e8f5e9' : '#f5f5f5',
                        color:      p.is_active ? '#2e7d32' : '#999',
                        fontSize:10, fontWeight:700, padding:'2px 8px',
                        borderRadius:20, textTransform:'uppercase', letterSpacing:0.3,
                      }}>{p.is_active ? 'Actif' : 'Inactif'}</span>
                      {/* Low stock warning */}
                      {p.stock <= 5 && (
                        <span style={{
                          position:'absolute', top:8, left:8,
                          background:'#fff3e0', color:'#e65100',
                          fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:20,
                        }}>⚠ Faible</span>
                      )}
                    </div>

                    {/* Info */}
                    <div style={{ padding:'12px 14px', flex:1, display:'flex', flexDirection:'column', gap:4 }}>
                      <div style={{ fontWeight:700, fontSize:14, color:'#1a1a1a', lineHeight:1.2 }}>{p.name}</div>
                      <div style={{ fontSize:11, color:'#888', lineHeight:1.4, flex:1,
                        overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>
                        {p.description || 'Aucune description.'}
                      </div>
                      <div style={{ fontSize:10, color:'#bbb', marginTop:2 }}>{p.category}</div>

                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:6 }}>
                        <span style={{ fontWeight:800, color:'#5e453a', fontSize:17 }}>{Number(p.price).toLocaleString('fr-FR')} MAD</span>
                        <div style={{ textAlign:'right' }}>
                          <div style={{ fontSize:11, fontWeight:600, color: p.stock <= 5 ? '#e65100' : '#555' }}>Stock&nbsp;:&nbsp;{p.stock}</div>
                          <div style={{ fontSize:10, color:'#bbb' }}>{p.total_sales || 0} ventes</div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display:'flex', borderTop:'1px solid #f5f5f5' }}>
                      <button onClick={() => openEditProduct(p)} style={{
                        flex:1, padding:'9px 0', background:'#fff',
                        border:'none', borderRight:'1px solid #f5f5f5',
                        cursor:'pointer', fontSize:12, fontWeight:600, color:'#5e453a',
                        display:'flex', alignItems:'center', justifyContent:'center', gap:4,
                      }}>✏ Modifier</button>
                      <button onClick={() => deleteProduct(p.id)} style={{
                        flex:1, padding:'9px 0', background:'#fff',
                        border:'none', cursor:'pointer',
                        fontSize:12, fontWeight:600, color:'#c62828',
                        display:'flex', alignItems:'center', justifyContent:'center', gap:4,
                      }}>🗑 Supprimer</button>
                    </div>
                  </div>
                ))}

                {/* Empty state */}
                {products.length === 0 && (
                  <div style={{ gridColumn:'1/-1', textAlign:'center', padding:'50px 0', color:'#aaa' }}>
                    <div style={{ fontSize:48, marginBottom:10 }}>🍰</div>
                    <p>Aucun produit dans le catalogue.<br/>Cliquez sur « Nouveau Produit » pour commencer.</p>
                  </div>
                )}
              </div>

              {/* ── Add / Edit Modal ──────────────────────────── */}
              {showModal && (
                <ProductModal
                  product={editProduct}
                  error={productError}
                  saving={savingProduct}
                  onSave={saveProduct}
                  onClose={closeModal}
                />
              )}
            </>
          )}

          {/* ════ CLIENTS TAB ══════════════════════════════════ */}
          {activeNav === 'clients' && (() => {
            const q = clientSearch.toLowerCase().trim();
            const filteredUsers = q
              ? users.filter(u =>
                  u.name?.toLowerCase().includes(q) ||
                  u.email?.toLowerCase().includes(q) ||
                  u.phone?.toLowerCase().includes(q)
                )
              : users;
            return (
              <>
                {/* Header + search bar */}
                <div style={{ display:'flex', alignItems:'center', marginBottom:16 }}>
                  {/* Left: Title */}
                  <div style={{ flex: 1 }}>
                    <h1 style={{ fontSize:20, fontWeight:700, margin:0 }}>Clients</h1>
                  </div>

                  {/* Center: Search */}
                  <div style={{
                    display:'flex', alignItems:'center', gap:8,
                    background:'#fff', border:'1px solid #e0e0e0',
                    borderRadius:8, padding:'6px 14px', width:340,
                    boxShadow:'0 1px 4px rgba(0,0,0,0.06)',
                  }}>
                    <span style={{ color:'#aaa', fontSize:14 }}>🔍</span>
                    <input
                      id="client-search"
                      type="text"
                      placeholder="Rechercher par nom, email, téléphone…"
                      value={clientSearch}
                      onChange={e => setClientSearch(e.target.value)}
                      style={{ border:'none', outline:'none', fontSize:13, color:'#333', width:'100%', background:'transparent' }}
                    />
                    {clientSearch && (
                      <button onClick={() => setClientSearch('')} style={{ border:'none', background:'none', cursor:'pointer', color:'#aaa', fontSize:16, padding:0, lineHeight:1 }}>×</button>
                    )}
                  </div>

                  {/* Right: Spacer for exact centering */}
                  <div style={{ flex: 1 }}></div>
                </div>

                {/* Result count */}
                {clientSearch && (
                  <div style={{ fontSize:12, color:'#888', marginBottom:10 }}>
                    {filteredUsers.length} résultat{filteredUsers.length !== 1 ? 's' : ''} pour « {clientSearch} »
                  </div>
                )}

                <div style={{ background:'#fff', borderRadius:12, boxShadow:'0 1px 4px rgba(0,0,0,0.06)', overflow:'hidden' }}>
                  <table style={{ width:'100%', borderCollapse:'collapse' }}>
                    <thead>
                      <tr style={{ background:'#fafafa' }}>
                        {['Nom','Email','Téléphone','Rôle','Commandes','Statut','Actions'].map(h=>(
                          <th key={h} style={{ padding:'10px 14px', textAlign:'left', fontSize:11, fontWeight:700, color:'#888', borderBottom:'1px solid #f0f0f0' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan="7" style={{ padding:'30px', textAlign:'center', color:'#aaa' }}>
                            <div style={{ fontSize:36, marginBottom:8 }}>🔍</div>
                            Aucun client trouvé pour « {clientSearch} »
                          </td>
                        </tr>
                      ) : filteredUsers.map(u=>(
                        <tr key={u.id} style={{ borderBottom:'1px solid #f8f8f8' }}>
                          <td style={{ padding:'9px 14px' }}>
                            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                              <div style={{ width:30, height:30, borderRadius:'50%', background:'linear-gradient(135deg,#5e453a,#6c79c5)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:12, fontWeight:700, flexShrink:0 }}>
                                {u.name?.charAt(0)}
                              </div>
                              <span style={{ fontSize:12, fontWeight:600 }}>{u.name}</span>
                            </div>
                          </td>
                          <td style={{ padding:'9px 14px', fontSize:12, color:'#666' }}>{u.email}</td>
                          <td style={{ padding:'9px 14px', fontSize:12, color:'#666' }}>{u.phone||'—'}</td>
                          <td style={{ padding:'9px 14px' }}>
                            <span style={{ background: u.role==='admin'?'#fde8ea':'#e8f0fe', color: u.role==='admin'?'#c62828':'#1565c0', padding:'2px 8px', borderRadius:20, fontSize:11, fontWeight:600 }}>{u.role}</span>
                          </td>
                          <td style={{ padding:'9px 14px', fontSize:12, color:'#666' }}>{u.orders_count||0}</td>
                          <td style={{ padding:'9px 14px' }}>
                            <span style={{ background: u.is_active?'#e8f5e9':'#f5f5f5', color: u.is_active?'#388e3c':'#888', padding:'2px 8px', borderRadius:20, fontSize:11, fontWeight:600 }}>{u.is_active ? 'Actif' : 'Inactif'}</span>
                          </td>
                          <td style={{ padding:'9px 14px' }}>
                            <div style={{ display:'flex', gap:6 }}>
                              <button onClick={()=>toggleUser(u.id, u.is_active)} style={{ fontSize:11, padding:'3px 8px', border:'1px solid #ddd', borderRadius:5, cursor:'pointer', background:'#fff' }}>
                                {u.is_active ? 'Désactiver' : 'Activer'}
                              </button>
                              {u.id !== user?.id && <button onClick={()=>deleteUser(u.id)} style={{ fontSize:11, padding:'3px 8px', border:'1px solid #fcc', borderRadius:5, cursor:'pointer', background:'#fff', color:'#c62828' }}>🗑</button>}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            );
          })()}

          {/* ════ MESSAGES TAB ══════════════════════════════════ */}

          {activeNav === 'messages' && (
            <>
              <h1 style={{ fontSize:20, fontWeight:700, marginBottom:16 }}>Messages & Contacts</h1>
              <div style={{ background:'#fff', borderRadius:12, boxShadow:'0 1px 4px rgba(0,0,0,0.06)', overflow:'hidden' }}>
                <table style={{ width:'100%', borderCollapse:'collapse' }}>
                  <thead>
                    <tr style={{ background:'#fafafa' }}>
                      <th style={{ padding:'10px 14px', textAlign:'left', fontSize:11, fontWeight:700, color:'#888', borderBottom:'1px solid #f0f0f0' }}>Date</th>
                      <th style={{ padding:'10px 14px', textAlign:'left', fontSize:11, fontWeight:700, color:'#888', borderBottom:'1px solid #f0f0f0' }}>Auteur</th>
                      <th style={{ padding:'10px 14px', textAlign:'left', fontSize:11, fontWeight:700, color:'#888', borderBottom:'1px solid #f0f0f0' }}>Message</th>
                      <th style={{ padding:'10px 14px', textAlign:'left', fontSize:11, fontWeight:700, color:'#888', borderBottom:'1px solid #f0f0f0' }}>Statut</th>
                      <th style={{ padding:'10px 14px', textAlign:'left', fontSize:11, fontWeight:700, color:'#888', borderBottom:'1px solid #f0f0f0' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contacts.length === 0 ? (
                      <tr><td colSpan="5" style={{ padding:20, textAlign:'center', color:'#888' }}>Aucun message client pour le moment.</td></tr>
                    ) : contacts.map(c=>(
                      <tr key={c.id} style={{ borderBottom:'1px solid #f8f8f8', background: c.is_read ? '#fff' : '#fdf6eb' }}>
                        <td style={{ padding:'14px', fontSize:12, color:'#666', whiteSpace:'nowrap' }}>{new Date(c.created_at).toLocaleDateString('fr-FR')}</td>
                        <td style={{ padding:'14px' }}>
                          <div style={{ fontSize:12, fontWeight:700, color:'#1a1a1a' }}>{c.name}</div>
                          <div style={{ fontSize:11, color:'#888' }}>{c.email}</div>
                        </td>
                        <td style={{ padding:'14px', fontSize:13, color:'#444', maxWidth:400, lineHeight:1.5 }}>
                          <div style={{ whiteSpace:'pre-wrap' }}>{c.message}</div>
                        </td>
                        <td style={{ padding:'14px' }}>
                          <span style={{ background: c.is_read?'#e8f5e9':'#fde8ea', color: c.is_read?'#2e7d32':'#c62828', padding:'4px 8px', borderRadius:20, fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:0.5 }}>
                            {c.is_read ? 'Lu' : 'Nouveau'}
                          </span>
                        </td>
                        <td style={{ padding:'14px' }}>
                          {!c.is_read && (
                            <button onClick={()=>markContactRead(c.id)} style={{ padding:'6px 12px', background:'#1a1a1a', color:'#fff', border:'none', borderRadius:4, fontSize:10, fontWeight:700, cursor:'pointer', textTransform:'uppercase' }}>
                              Marquer comme lu
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ════ RAPPORTS / PARAMÈTRES ════════════════════════ */}
          {(activeNav==='rapports'||activeNav==='params') && (
            <div style={{ textAlign:'center', padding:'60px 0', color:'#aaa' }}>
              <div style={{ fontSize:48 }}>🚧</div>
              <p style={{ marginTop:12 }}>Cette section est en cours de développement. Disponible prochainement.</p>
            </div>
          )}

        </div>{/* end page body */}
      </div>{/* end main */}
    </div>
  );
}

/* ── Shared card style ─────────────────────────────────────── */
const cardStyle = {
  background: '#fff', borderRadius: 12, padding: '16px 18px',
  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  position: 'relative', overflow: 'hidden',
};

/* ══════════════════════════════════════════════════════════════
   PRODUCT MODAL  —  Add & Edit with image upload
══════════════════════════════════════════════════════════════ */
function ProductModal({ product, error, saving, onSave, onClose }) {
  const isEdit = Boolean(product);
  const fileRef = useRef(null);

  const [fields, setFields] = useState({
    name:        product?.name        || '',
    description: product?.description || '',
    price:       product?.price       || '',
    stock:       product?.stock       || '',
    category:    product?.category    || '',
    is_active:   product?.is_active   ?? true,
  });
  const [imageFile, setImageFile]     = useState(null);   // new file to upload
  const [previewUrl, setPreviewUrl]   = useState(imgSrc(product?.image) || null);

  const handle = (e) => {
    const { name, value, type, checked } = e.target;
    setFields(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const pickImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const submit = (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(fields).forEach(([k, v]) => fd.append(k, v === true ? 1 : v === false ? 0 : v));
    if (imageFile) fd.append('image', imageFile);
    onSave(fd, product?.id);
  };

  const CATEGORIES = ['Gâteau', 'Cupcake', 'Tarte', 'Cookie', 'Muffin', 'Cheesecake', 'Macaron', 'Autre'];

  return (
    /* Overlay */
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position:'fixed', inset:0, zIndex:1000,
        background:'rgba(0,0,0,0.45)', backdropFilter:'blur(3px)',
        display:'flex', alignItems:'center', justifyContent:'center',
        padding:20,
      }}
    >
      <div style={{
        background:'#fff', borderRadius:16, width:'100%', maxWidth:560,
        maxHeight:'90vh', overflowY:'auto',
        boxShadow:'0 20px 60px rgba(0,0,0,0.25)',
        animation:'fadeUp .2s ease',
      }}>
        {/* Modal header */}
        <div style={{
          padding:'18px 22px', borderBottom:'1px solid #f0f0f0',
          display:'flex', alignItems:'center', justifyContent:'space-between',
          background:'linear-gradient(135deg,#3e2e26,#5e453a)', borderRadius:'16px 16px 0 0',
        }}>
          <span style={{ color:'#fff', fontWeight:700, fontSize:16 }}>
            {isEdit ? `✏ Modifier : ${product.name}` : '➕ Nouveau Produit'}
          </span>
          <button onClick={onClose} style={{
            background:'rgba(255,255,255,0.15)', border:'none', color:'#fff',
            width:30, height:30, borderRadius:8, cursor:'pointer', fontSize:16,
          }}>✕</button>
        </div>

        <form onSubmit={submit} style={{ padding:'22px' }}>
          {error && (
            <div style={{ background:'#fdecea', color:'#c62828', padding:'10px 14px', borderRadius:8, marginBottom:16, fontSize:13 }}>
              ⚠ {error}
            </div>
          )}

          {/* Image upload zone */}
          <div
            onClick={() => fileRef.current?.click()}
            style={{
              border:'2px dashed #e0d0c8', borderRadius:12, marginBottom:18,
              height:170, cursor:'pointer', overflow:'hidden', position:'relative',
              background: previewUrl ? 'transparent' : 'linear-gradient(135deg,#fdf6f0,#fdeaea)',
              display:'flex', alignItems:'center', justifyContent:'center',
              transition:'border-color .2s',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor='#5e453a'}
            onMouseLeave={e => e.currentTarget.style.borderColor='#e0d0c8'}
          >
            {previewUrl
              ? <img src={previewUrl} alt="preview" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
              : <div style={{ textAlign:'center', color:'#b8a89a' }}>
                  <div style={{ fontSize:36, marginBottom:6 }}>📷</div>
                  <div style={{ fontSize:12, fontWeight:600 }}>Cliquez pour ajouter une image</div>
                  <div style={{ fontSize:11, marginTop:2 }}>JPG, PNG, WebP — max 2 Mo</div>
                </div>
            }
            {previewUrl && (
              <div style={{
                position:'absolute', inset:0, background:'rgba(0,0,0,0)',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:13, fontWeight:600, color:'#fff',
                transition:'background .2s',
              }}
                onMouseEnter={e => e.currentTarget.style.background='rgba(0,0,0,0.35)'}
                onMouseLeave={e => e.currentTarget.style.background='rgba(0,0,0,0)'}
              >
                📷 Changer l'image
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={pickImage}/>
          </div>

          {/* Fields grid */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            <div style={{ gridColumn:'1/-1' }}>
              <label style={labelStyle}>Nom du produit *</label>
              <input name="name" value={fields.name} onChange={handle} required
                style={inputStyle} placeholder="Ex: Gâteau Chocolat Fondant"/>
            </div>

            <div>
              <label style={labelStyle}>Prix (MAD) *</label>
              <input name="price" type="number" step="0.01" min="0" value={fields.price} onChange={handle} required
                style={inputStyle} placeholder="150"/>
            </div>

            <div>
              <label style={labelStyle}>Stock *</label>
              <input name="stock" type="number" min="0" value={fields.stock} onChange={handle} required
                style={inputStyle} placeholder="10"/>
            </div>

            <div style={{ gridColumn:'1/-1' }}>
              <label style={labelStyle}>Catégorie *</label>
              <select name="category" value={fields.category} onChange={handle} required style={inputStyle}>
                <option value="">— Choisir une catégorie —</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div style={{ gridColumn:'1/-1' }}>
              <label style={labelStyle}>Description</label>
              <textarea name="description" value={fields.description} onChange={handle}
                rows={3} style={{ ...inputStyle, resize:'vertical' }}
                placeholder="Décrivez le produit…"/>
            </div>

            <div style={{ gridColumn:'1/-1', display:'flex', alignItems:'center', gap:10 }}>
              <input type="checkbox" id="is-active" name="is_active"
                checked={fields.is_active} onChange={handle}
                style={{ width:16, height:16, cursor:'pointer', accentColor:'#5e453a' }}/>
              <label htmlFor="is-active" style={{ fontSize:13, cursor:'pointer', userSelect:'none' }}>
                Produit actif (visible dans le catalogue)
              </label>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display:'flex', gap:10, marginTop:20, justifyContent:'flex-end' }}>
            <button type="button" onClick={onClose} style={{
              padding:'9px 20px', border:'1px solid #ddd', borderRadius:8,
              background:'#fff', color:'#666', cursor:'pointer', fontWeight:600, fontSize:13,
            }}>Annuler</button>
            <button type="submit" disabled={saving} style={{
              padding:'9px 24px', border:'none', borderRadius:8,
              background:'linear-gradient(135deg,#5e453a,#3e2e26)',
              color:'#fff', cursor:'pointer', fontWeight:700, fontSize:13,
              opacity: saving ? 0.7 : 1,
            }}>
              {saving ? '⏳ Enregistrement…' : (isEdit ? '✔ Sauvegarder' : '✚ Créer le produit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const labelStyle = {
  display:'block', fontSize:11, fontWeight:700, color:'#777',
  marginBottom:5, textTransform:'uppercase', letterSpacing:0.3,
};
const inputStyle = {
  width:'100%', padding:'9px 12px', fontSize:13, borderRadius:8,
  border:'1px solid #e0e0e0', background:'#fafafa', outline:'none',
  boxSizing:'border-box', fontFamily:'inherit',
};
