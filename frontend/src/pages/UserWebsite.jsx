import React, { useState, useEffect } from 'react';
import { useAuth, axios } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

/* ─── Image URL helper (same as admin) ──────────────────────────────
 * Products store image paths like "products/abc.jpg" on the Laravel `public` disk
 * served at /storage/…  In dev, Vite proxies /storage → Laravel:8000.
 */
const BACKEND_URL = import.meta.env.VITE_API_URL || '';
function imgSrc(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${BACKEND_URL}/storage/${path}`;
}

const FontStyle = () => (
  <style>{`
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Inter:wght@300;400;500;600;700&display=swap');
  *{box-sizing:border-box;}
  ::selection{background:#ee6166;color:#fff;}
  @keyframes marquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
  @keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.06)}}
  input:focus,textarea:focus{border-color:#ee6166!important;box-shadow:0 0 0 3px rgba(238,97,102,0.12)!important;}
  ::-webkit-scrollbar{width:5px;}
  ::-webkit-scrollbar-track{background:#f9f5f0;}
  ::-webkit-scrollbar-thumb{background:#d4a89a;border-radius:3px;}
  `}</style>
);

/* """"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
 USER WEBSITE — user-facing shop
  Sections: Navbar  Hero  Specials  About  Footer
"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""" */
export default function UserWebsite() {
  const { user, logout } = useAuth();
  const navigate  = useNavigate();
  const [liked, setLiked] = useState({});
  const [products, setProducts] = useState([]);
  const [activePage, setActivePage] = useState('home');
  const [cartCount,  setCartCount]  = useState(0);
  const [cartItems,  setCartItems]  = useState([]);
  const [notification, setNotification] = useState('');
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);
  const [myOrders, setMyOrders] = useState([]);
  const [isScrolled, setIsScrolled] = useState(false);
  const [contactForm, setContactForm] = useState({ name:'', email:'', message:'' });

  const handleContactSubmit = async () => {
  try {
  if(!contactForm.name || !contactForm.email || !contactForm.message) {
  alert("Please fill all fields.");
  return;
  }
  await axios.post('/contacts', contactForm);
  setNotification('Message sent successfully!');
  setTimeout(() => setNotification(''), 3000);
  setContactForm({ name:'', email:'', message:'' });
  } catch(e) {
  console.error(e);
  alert('Error sending message.');
  }
  };

  useEffect(() => {
  const handleScroll = () => setIsScrolled(window.scrollY > 20);
  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchMyOrders = async () => {
  try {
  const res = await axios.get('/orders');
  setMyOrders(res.data.data || []);
  } catch(e) { console.error(e); }
  };

  useEffect(() => {
  axios.get('/products').then(r => setProducts(r.data.data || [])).catch(()=>{});
  }, []);

  const handleLogout = async () => { await logout(); navigate('/login'); };

  const toggleLike = (id) => setLiked(prev => ({ ...prev, [id]: !prev[id] }));

  const addToCart = (product) => {
  setCartItems(prev => {
  const existing = prev.find(i => i.id === product.id);
  if (existing) return prev.map(i => i.id === product.id ? {...i, qty: i.qty+1} : i);
  return [...prev, {...product, qty:1}];
  });
  setCartCount(c => c + 1);
  setNotification(`${product.name} ajouté à votre panier !`);
  setTimeout(() => setNotification(''), 2500);
  };

  const handleCheckout = async () => {
  try {
  if (cartItems.length === 0) return;
  const items = cartItems.map(item => ({
  product_id: item.id,
  quantity: item.qty
  }));
  // Call standard order endpoint with notes indicating Paiement à la livraison (Cash)
  await axios.post('/orders', {
  items,
  notes: 'Paiement  la livraison (Paiement à la livraison (Cash))'
  });
  // Clear cart on success
  setCartItems([]);
  setCartCount(0);
  setShowOrderSuccess(true);
  } catch (e) {
  console.error(e);
      alert('Something went wrong. Please try again.');
  }
  };

  /* -- Fake cake images from Unsplash -------------------------- */
  const cakeImages = [
  'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=240&q=70', // pink cake
  'https://images.unsplash.com/photo-1535141192574-5d4897c12636?w=240&q=70', // green cake
  'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=240&q=70', // chocolate
  'https://images.unsplash.com/photo-1607478900766-efe13248b125?w=240&q=70', // muffin
  'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=240&q=70', // lemon
  'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=240&q=70', // red velvet
  'https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=240&q=70', // caramel
  'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=240&q=70', // blueberry
  ];

  /* --- Demo products if API not available --- */
  const rawProducts = products.length > 0 ? products : [
  { id:1, name:'Pinky Cream Cherry Milk',  price:90, emoji:'🎂', description:'Vanilla sponge with cherry cream', category:'gateau' },
  { id:2, name:'Gummy Tosca Mixed Flavors', price:90, emoji:'🍰', description:'Tropical heart-shaped cake',  category:'gateau' },
  { id:3, name:'Blushing Strawberry Cream', price:90, emoji:'🍓', description:'Dark chocolate glaze strawberry',  category:'gateau' },
  { id:4, name:'Mystery Rose Choco',         price:90, emoji:'🧁', description:'Rich chocolate muffin surprise',  category:'cupcake' },
  { id:5, name:'Coco Lemon Twist',           price:110, emoji:'🍋', description:'Coconut and lemon zest cake',  category:'tarte' },
  { id:6, name:'Velvet Dream Cake',          price:130, emoji:'❤', description:'Red velvet with cream cheese',  category:'gateau' },
  { id:7, name:'Caramel Cloud',              price:100, emoji:'🍮', description:'Salted caramel mousse',  category:'patisserie' },
  { id:8, name:'Blueberry Burst',            price:90,  emoji:'🫐', description:'Fresh blueberry tart',  category:'tarte' },
  ];

  const cakes = rawProducts.map((cake, i) => ({
    ...cake,
    // Prefer the real uploaded image; fall back to curated Unsplash photo
    displayImage: imgSrc(cake.image) || cakeImages[i % cakeImages.length]
  }));

  const iconUser = '👤';
  const iconCart = '🛒';

  return (
  <div style={{ fontFamily:"'Inter',sans-serif", background:'#fff', minHeight:'100vh', overflowX:'hidden' }}>
  <FontStyle />

  {/* --- Toast notification --- */}
  {notification && (
  <div style={{
  position:'fixed', top:24, right:24, zIndex:9999,
  background:'linear-gradient(135deg,#1a1a1a,#2d2d2d)',
  color:'#fff', padding:'14px 24px',
  borderRadius:12, fontSize:13, fontWeight:500,
  boxShadow:'0 20px 40px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.1)',
  animation:'fadeUp 0.4s ease', display:'flex', alignItems:'center', gap:10,
  borderLeft:'3px solid #ee6166',
  }}>
  <span style={{fontSize:18}}>œ...</span> {notification}
  </div>
  )}

  {/* --- NAVBAR --- */}
  <nav style={{
  display:'flex', alignItems:'center',
  padding:'0 60px', 
  height: isScrolled ? 70 : 100,
  background: isScrolled ? 'rgba(255,255,255,0.95)' : (activePage === 'home' ? 'transparent' : '#fff'),
  backdropFilter: isScrolled ? 'blur(20px)' : 'none', WebkitBackdropFilter: isScrolled ? 'blur(20px)' : 'none',
  position:'fixed', top:0, left:0, right:0, zIndex:100,
  boxShadow: isScrolled ? '0 10px 30px rgba(0,0,0,0.05)' : 'none',
  borderBottom: isScrolled ? '1px solid rgba(255,255,255,0.4)' : '1px solid transparent',
  transition:'all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)',
  }}>
  {/* Brand */}
  <div style={{ marginRight:40, cursor:'pointer', flexShrink:0, display:'flex', alignItems:'center', transition:'transform 0.4s', transform: isScrolled ? 'scale(0.85)' : 'scale(1)', transformOrigin: 'left center' }}
  onClick={() => { window.scrollTo(0,0); setActivePage('home'); }}>
  <img src="/logo.png" alt="BakeCake" style={{ height: 48, objectFit: 'contain' }} />
  </div>

  {/* Nav links */}
  <div style={{ display:'flex', gap:32, flex:1, alignItems:'center', marginLeft:20 }}>
  {['Home','Blog','Order online','Contact us'].map(link => {
  const isActive = activePage === link.toLowerCase().replace(' ','');
  return (
  <button key={link}
  onClick={() => { window.scrollTo(0,0); setActivePage(link.toLowerCase().replace(' ','')); }}
  style={{
  background:'none', border:'none', cursor:'pointer',
  fontSize:13.5, fontWeight: isActive ? 600 : 500, padding:'8px 0',
  color: isActive ? '#ee6166' : ((isScrolled || activePage !== 'home') ? '#333' : '#fff'),
  position:'relative',
  transition:'color 0.3s',
  }}
  onMouseEnter={e => { if(!isActive) e.currentTarget.style.color = '#ee6166'; e.currentTarget.lastChild.style.width = '100%'; }}
  onMouseLeave={e => { if(!isActive) e.currentTarget.style.color = (isScrolled || activePage !== 'home') ? '#333' : '#fff'; e.currentTarget.lastChild.style.width = isActive ? '100%' : '0%'; }}
  >
  {link}
  <div style={{
  position:'absolute', bottom:0, left:0, height:2, background:'#ee6166',
  width: isActive ? '100%' : '0%', transition:'width 0.3s ease'
  }} />
  </button>
  );
  })}
  </div>

  {/* Right side */}
  <div style={{ display:'flex', alignItems:'center', gap:24 }}>
  {/* My Account */}
  <button onClick={handleLogout} style={{
  display:'flex', alignItems:'center', gap:8,
  background:'none', border:'none', cursor:'pointer',
  fontSize:13.5, fontWeight:500, color:(isScrolled || activePage !== 'home') ? '#333' : '#fff',
  transition: 'color 0.3s'
  }}>
  <span style={{ fontSize:16, transform:'translateY(-1px)' }}>&#9906;</span>
  <span>{user?.name?.split(' ')[0] || 'My Account'}</span>
  </button>

  {/* Cart */}
  <button
  onClick={() => { window.scrollTo(0,0); setActivePage('cart'); }}
  style={{
  display:'flex', alignItems:'center', gap:8, position:'relative',
  background:'none', border:'none', cursor:'pointer',
  fontSize:13.5, fontWeight:500, color:(isScrolled || activePage !== 'home') ? '#333' : '#fff',
  transition: 'color 0.3s'
  }}>
  <span style={{ fontSize:16, transform:'translateY(-1px)' }}>&#128717;</span>
  <span>Cart</span>
  {cartCount > 0 && (
  <span style={{
  position:'absolute', top:-8, right:-12,
  background:'#ee6166', color:'#fff',
  borderRadius:'50%', width:18, height:18,
  fontSize:10, fontWeight:700,
  display:'flex', alignItems:'center', justifyContent:'center',
  boxShadow:'0 2px 4px rgba(238,97,102,0.4)',
  }}>{cartCount}</span>
  )}
  </button>
  
  {/* Tracking */}
  <button onClick={() => { window.scrollTo(0,0); setActivePage('tracking'); fetchMyOrders(); }} style={{
  display:'flex', alignItems:'center', gap:8, background:'none', border:'none', cursor:'pointer', fontSize:13.5, fontWeight:500, 
  color:(isScrolled || activePage !== 'home') ? '#333' : '#fff',
  transition: 'color 0.3s'
  }}>
  <span style={{ fontSize:16, transform:'translateY(-1px)' }}>&#128230;</span>
  <span>Orders</span>
  </button>
  </div>
  </nav>

  {/* HOME PAGE */}
  {activePage === 'home' && (
  <>
  {/* HERO */}
  <section style={{ position:'relative', minHeight:'100vh', display:'flex', alignItems:'center', backgroundImage:'url(/hero-bg.png)', backgroundSize:'cover', backgroundPosition:'center', backgroundAttachment:'fixed', padding:'0 80px' }}>
  <div style={{ position:'absolute', top:0, left:0, right:0, bottom:0, background:'linear-gradient(105deg, rgba(10,6,4,0.9) 0%, rgba(30,15,10,0.65) 55%, rgba(60,20,15,0.15) 100%)', zIndex:1 }} />
  <div style={{ position:'absolute', right:80, top:'50%', transform:'translateY(-50%)', zIndex:2, display:'flex', flexDirection:'column', gap:16 }}>
  {[{num:'500+',label:'Recipes'},{num:'12K+',label:'Happy Clients'},{num:'8',label:'Years of Art'}].map(s=>(
  <div key={s.label} style={{ background:'rgba(255,255,255,0.07)', backdropFilter:'blur(20px)', border:'1px solid rgba(255,255,255,0.14)', borderRadius:16, padding:'20px 32px', textAlign:'center' }}>
  <div style={{ fontSize:28, fontWeight:700, color:'#f3c2b9', fontFamily:"'Playfair Display',Georgia,serif" }}>{s.num}</div>
  <div style={{ fontSize:10, color:'rgba(255,255,255,0.55)', textTransform:'uppercase', letterSpacing:2.5, marginTop:5 }}>{s.label}</div>
  </div>
  ))}
  </div>
  <div style={{ position:'relative', zIndex:2, maxWidth:660 }}>
  <div style={{ display:'inline-flex', alignItems:'center', gap:10, marginBottom:32, background:'rgba(238,97,102,0.15)', border:'1px solid rgba(238,97,102,0.35)', borderRadius:100, padding:'8px 20px' }}>
  <div style={{ width:7, height:7, borderRadius:'50%', background:'#ee6166', animation:'pulse 2s infinite' }} />
  <span style={{ color:'#f3c2b9', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:3 }}>Boutique Dessert House</span>
  </div>
  <h1 style={{ fontSize:72, fontWeight:300, lineHeight:1.0, color:'#fff', marginBottom:28, fontFamily:"'Playfair Display',Georgia,serif", letterSpacing:-2 }}>
  Artisan Pastries<br/><em style={{ color:'#f3c2b9' }}>Delivered to You</em>
  </h1>
  <p style={{ color:'rgba(255,255,255,0.72)', fontSize:17, lineHeight:1.9, marginBottom:44, fontWeight:300, maxWidth:500 }}>Vivez le luxe de créations artisanales — préparées avec les meilleurs ingrédients marocains, façonnées avec soin et passion., meticulous detail, and an absolute passion for perfection.</p>
  <div style={{ display:'flex', gap:16 }}>
  <button onClick={()=>window.scrollTo({top:900,behavior:'smooth'})} style={{ padding:'18px 48px', border:'none', background:'linear-gradient(135deg,#ee6166,#d34e54)', color:'#fff', fontWeight:600, fontSize:11, letterSpacing:2.5, cursor:'pointer', textTransform:'uppercase', boxShadow:'0 16px 48px rgba(238,97,102,0.55)', transition:'all 0.35s' }} onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-3px)';}} onMouseLeave={e=>{e.currentTarget.style.transform='';}}>Commander</button>
  <button onClick={()=>window.scrollTo({top:900,behavior:'smooth'})} style={{ padding:'18px 48px', border:'1px solid rgba(255,255,255,0.3)', background:'rgba(255,255,255,0.05)', color:'#fff', backdropFilter:'blur(10px)', fontWeight:600, fontSize:11, letterSpacing:2.5, cursor:'pointer', textTransform:'uppercase', transition:'all 0.35s' }} onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,255,255,0.95)';e.currentTarget.style.color='#1a1a1a';}} onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,0.05)';e.currentTarget.style.color='#fff';}}>Notre Menu</button>
  </div>
  <div style={{ marginTop:64, display:'flex', alignItems:'center', gap:14, color:'rgba(255,255,255,0.35)', fontSize:10, letterSpacing:3, textTransform:'uppercase' }}><div style={{ width:48, height:1, background:'rgba(255,255,255,0.25)' }} />Défiler pour explorer</div>
  </div>
  </section>

  {/* MARQUEE RIBBON */}
  <div style={{ background:'linear-gradient(90deg,#ee6166,#d34e54)', padding:'15px 0', overflow:'hidden' }}>
  <div style={{ display:'flex', gap:64, animation:'marquee 25s linear infinite', whiteSpace:'nowrap', width:'max-content' }}>
  {[...Array(4)].flatMap(()=>['★ Artisanat Quotidien','★ Free Delivery over â¬50','★ Ingrédients Premium','★ Artisan Bakers Casablanca','★ Gâteaux de Mariage sur Mesure','★ Est. 2017 — Casablanca']).map((t,i)=>(
  <span key={i} style={{ color:'rgba(255,255,255,0.9)', fontSize:11, fontWeight:700, letterSpacing:2.5, textTransform:'uppercase', flexShrink:0 }}>{t}</span>
  ))}
  </div>
  </div>

  {/* SPECIALS */}
  <section id="menu" style={{ padding:'120px 80px', background:'#faf7f4' }}>
  <div style={{ textAlign:'center', marginBottom:72 }}>
  <span style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:4, color:'#ee6166', display:'block', marginBottom:18 }}>Signature Creations</span>
  <h2 style={{ fontSize:52, fontWeight:300, color:'#1a1a1a', fontFamily:"'Playfair Display',Georgia,serif", letterSpacing:-1, lineHeight:1 }}>This Week's <em>Specials</em></h2>
  <div style={{ display:'flex', alignItems:'center', gap:16, justifyContent:'center', marginTop:24 }}>
  <div style={{ height:1, width:80, background:'linear-gradient(to right,transparent,#e0d0c8)' }} />
  <div style={{ width:5, height:5, borderRadius:'50%', background:'#ee6166' }} />
  <div style={{ height:1, width:80, background:'linear-gradient(to left,transparent,#e0d0c8)' }} />
  </div>
  <p style={{ color:'#999', fontSize:15, maxWidth:480, margin:'20px auto 0', lineHeight:1.9, fontWeight:300 }}>Indulge in our exquisite collection of premium handcrafted pastries.</p>
  </div>
  <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:28 }}>
  {cakes.slice(0,4).map((cake) => <ProductCard key={cake.id} cake={cake} image={cake.displayImage} liked={liked[cake.id]} onLike={()=>toggleLike(cake.id)} onOrder={()=>addToCart(cake)} />)}
  </div>
  {cakes.length > 4 && (
  <>
  <div style={{ display:'flex', alignItems:'center', gap:24, margin:'80px 0 48px' }}>
  <div style={{ height:1, flex:1, background:'#ede5de' }} />
  <span style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:3, color:'#bbb' }}>More Creations</span>
  <div style={{ height:1, flex:1, background:'#ede5de' }} />
  </div>
  <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:28 }}>
  {cakes.slice(4,8).map((cake) => <ProductCard key={cake.id} cake={cake} image={cake.displayImage} liked={liked[cake.id]} onLike={()=>toggleLike(cake.id)} onOrder={()=>addToCart(cake)} />)}
  </div>
  </>
  )}
  <div style={{ textAlign:'center', marginTop:72 }}>
  <button onClick={()=>{window.scrollTo(0,0);setActivePage('orderonline');}} style={{ padding:'17px 52px', background:'transparent', color:'#1a1a1a', border:'1px solid rgba(26,26,26,0.5)', fontWeight:600, fontSize:10, letterSpacing:2.5, cursor:'pointer', textTransform:'uppercase', transition:'all 0.35s' }} onMouseEnter={e=>{e.currentTarget.style.background='#1a1a1a';e.currentTarget.style.color='#fff';}} onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='#1a1a1a';}}>View Full Menu â '</button>
  </div>
  </section>

  {/* ABOUT */}
  <section style={{ background:'#fff', padding:'120px 80px' }}>
  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:100, alignItems:'center' }}>
  <div>
  <span style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:4, color:'#ee6166', display:'block', marginBottom:22 }}>Notre Philosophie</span>
  <h2 style={{ fontSize:54, fontWeight:300, color:'#1a1a1a', marginBottom:28, fontFamily:"'Playfair Display',Georgia,serif", lineHeight:1.0, letterSpacing:-1.5 }}>Crafted with<br/><em>Elegance</em> &amp; Care</h2>
  <p style={{ color:'#777', fontSize:15, lineHeight:1.95, marginBottom:24, fontWeight:300 }}>Every cake is meticulously handcrafted by our expert pastry chefs. We believe in creating unforgettable, elegant taste experiences.</p>
  <p style={{ color:'#bbb', fontSize:14, lineHeight:1.9, marginBottom:44, fontWeight:300 }}>Born in Casablanca, loved across Morocco  our philosophy is simple: every bite should feel like a celebration.</p>
  <button style={{ padding:'17px 44px', background:'transparent', color:'#1a1a1a', border:'1px solid rgba(26,26,26,0.5)', fontWeight:600, fontSize:10, cursor:'pointer', letterSpacing:2.5, textTransform:'uppercase', transition:'all 0.35s' }} onMouseEnter={e=>{e.currentTarget.style.background='#1a1a1a';e.currentTarget.style.color='#fff';}} onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='#1a1a1a';}}>En Savoir Plus</button>
  </div>
  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
  {[
  {icon:'✦', label:'Qualité Premium', desc:'Les meilleurs ingrédients sélectionnés', bg:'#faf7f4'},
  {icon:'◆', label:'Chefs Artisans', desc:'Maîtres de la pâtisserie marocaine', bg:'#fff3f3'},
  {icon:'❖', label:'Emballage Luxueux', desc:'Une expérience à déballer', bg:'#fff3f3'},
  {icon:'✿', label:'Sourcing Naturel', desc:'Production responsable et locale', bg:'#faf7f4'},
  ].map(f=>(
  <div key={f.label} style={{ background:f.bg, padding:'38px 28px', textAlign:'center', border:'1px solid rgba(238,97,102,0.1)', transition:'all 0.4s', cursor:'default' }} onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-10px)';e.currentTarget.style.boxShadow='0 24px 48px rgba(238,97,102,0.1)';}} onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow='none';}}>
  <div style={{ fontSize:20, color:'#ee6166', marginBottom:18 }}>{f.icon}</div>
  <div style={{ fontWeight:600, fontSize:13, color:'#1a1a1a', marginBottom:10 }}>{f.label}</div>
  <div style={{ fontSize:12, color:'#aaa', lineHeight:1.7 }}>{f.desc}</div>
  </div>
  ))}
  </div>
  </div>
  </section>

  {/* TESTIMONIALS */}
  <section style={{ background:'#111', padding:'110px 80px' }}>
  <div style={{ textAlign:'center', marginBottom:72 }}>
  <span style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:4, color:'#ee6166', display:'block', marginBottom:18 }}>Avis de nos Clients</span>
  <h2 style={{ fontSize:48, fontWeight:300, color:'#fff', fontFamily:"'Playfair Display',Georgia,serif", letterSpacing:-1 }}>What Our Guests <em style={{color:'#f3c2b9'}}>Say</em></h2>
  </div>
  <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:24, maxWidth:1100, margin:'0 auto' }}>
  {[
  {name:'Marie L.',city:'Casablanca',text:'Le gâteau le plus exquis que j\'aie jamais goûté. L\'emballage seul était une œuvre d\'art.',avatar:'M'},
  {name:'Antoine R.',city:'Rabat',text:'Nous avons commandé un gâteau de mariage sur mesure et avons été émerveillés. Chaque détail était parfait.',avatar:'A'},
  {name:'Sophie B.',city:'Marrakech',text:'Qualité exceptionnelle, livraison rapide et le goût est divin. Ma référence pour chaque occasion.',avatar:'S'},
  ].map(t=>(
  <div key={t.name} style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:4, padding:'40px 36px', transition:'all 0.4s' }} onMouseEnter={e=>{e.currentTarget.style.background='rgba(238,97,102,0.07)';e.currentTarget.style.borderColor='rgba(238,97,102,0.28)';e.currentTarget.style.transform='translateY(-5px)';}} onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,0.04)';e.currentTarget.style.borderColor='rgba(255,255,255,0.07)';e.currentTarget.style.transform='';}}>
  <div style={{ color:'#ee6166', fontSize:14, marginBottom:24, letterSpacing:4 }}>★★★★★</div>
  <p style={{ color:'rgba(255,255,255,0.7)', fontSize:14, lineHeight:1.9, fontWeight:300, marginBottom:32, fontStyle:'italic' }}>"{t.text}"</p>
  <div style={{ display:'flex', alignItems:'center', gap:14 }}>
  <div style={{ width:40, height:40, borderRadius:'50%', background:'linear-gradient(135deg,#ee6166,#d34e54)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:700, fontSize:15 }}>{t.avatar}</div>
  <div><div style={{ color:'#fff', fontWeight:600, fontSize:13 }}>{t.name}</div><div style={{ color:'rgba(255,255,255,0.38)', fontSize:11, marginTop:3, textTransform:'uppercase', letterSpacing:1 }}>{t.city}</div></div>
  </div>
  </div>
  ))}
  </div>
  </section>

  {/* FOOTER */}
  <footer style={{ background:'#0d0d0d', color:'#fff', padding:'80px 80px 36px' }}>
  <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1.5fr', gap:56, marginBottom:64, paddingBottom:48, borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
  <div>
  <img src="/logo.png" alt="BakeCake" style={{ height:46, objectFit:'contain', marginBottom:22 }} />
  <p style={{ color:'rgba(255,255,255,0.4)', fontSize:13, lineHeight:2.0, fontWeight:300, maxWidth:260 }}>Bringing joy through every bite. Premium artisan pastries delivered fresh to your door.</p>
  <div style={{ display:'flex', gap:10, marginTop:26 }}>
  {['f','in','tw','ig'].map(s=>(<div key={s} style={{ width:36, height:36, borderRadius:'50%', border:'1px solid rgba(255,255,255,0.14)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', fontSize:11, color:'rgba(255,255,255,0.45)', transition:'all 0.3s', textTransform:'uppercase', fontWeight:700 }} onMouseEnter={e=>{e.currentTarget.style.borderColor='#ee6166';e.currentTarget.style.color='#ee6166';}} onMouseLeave={e=>{e.currentTarget.style.borderColor='rgba(255,255,255,0.14)';e.currentTarget.style.color='rgba(255,255,255,0.45)';}}>{ s}</div>))}
  </div>
  </div>
  <div>
  <div style={{ fontWeight:600, fontSize:11, marginBottom:24, textTransform:'uppercase', letterSpacing:2, color:'rgba(255,255,255,0.5)' }}>Menu</div>
  {['Blog','Order Online','Contact'].map(l=>(<div key={l} onClick={()=>{window.scrollTo(0,0);setActivePage(l.toLowerCase().replace(' ',''));}} style={{ color:'rgba(255,255,255,0.4)', fontSize:13, marginBottom:12, cursor:'pointer', transition:'color 0.2s', fontWeight:300 }} onMouseEnter={e=>e.currentTarget.style.color='#ee6166'} onMouseLeave={e=>e.currentTarget.style.color='rgba(255,255,255,0.4)'}>{l}</div>))}
  </div>
  <div>
  <div style={{ fontWeight:600, fontSize:11, marginBottom:24, textTransform:'uppercase', letterSpacing:2, color:'rgba(255,255,255,0.5)' }}>Atelier</div>
  <div style={{ color:'rgba(255,255,255,0.4)', fontSize:13, lineHeight:2.4, fontWeight:300 }}>32 Avenue Mohammed V<br/>Casablanca 20000, Maroc<br/>+212 6 61 23 45 67<br/>hello@bakecake.ma</div>
  </div>
  <div>
  <div style={{ fontWeight:600, fontSize:11, marginBottom:24, textTransform:'uppercase', letterSpacing:2, color:'rgba(255,255,255,0.5)' }}>Newsletter</div>
  <p style={{ color:'rgba(255,255,255,0.38)', fontSize:13, lineHeight:1.9, marginBottom:22, fontWeight:300 }}>Rejoignez notre cercle. Offres exclusives et spécialités de la semaine.</p>
  <div style={{ display:'flex' }}>
  <input type="email" placeholder="Votre email" style={{ flex:1, padding:'12px 16px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', borderRight:'none', color:'#fff', fontSize:12, outline:'none', fontFamily:'inherit' }} />
  <button style={{ padding:'12px 18px', background:'#ee6166', border:'none', color:'#fff', fontWeight:700, fontSize:14, cursor:'pointer' }} onMouseEnter={e=>e.currentTarget.style.background='#d34e54'} onMouseLeave={e=>e.currentTarget.style.background='#ee6166'}> &rarr;</button>
  </div>
  </div>
  </div>
  <div style={{ display:'flex', justifyContent:'space-between', color:'rgba(255,255,255,0.22)', fontSize:12, fontWeight:300 }}>
  <span> 2025 BakeCake. All rights reserved.</span><span>Made with love in Casablanca</span>
  </div>
  </footer>
  </>
  )}
  {/* CART PAGE */}
  {activePage === 'cart' && (
  <div style={{ padding:'140px 80px 80px', background:'#faf7f4', minHeight:'100vh' }}>
  <span style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:4, color:'#ee6166', display:'block', marginBottom:16 }}>Your Selection</span>
  <h2 style={{ fontSize:48, fontWeight:300, marginBottom:48, color:'#1a1a1a', fontFamily:"'Playfair Display',Georgia,serif", letterSpacing:-1 }}>Mon Panier</h2>
  {cartItems.length === 0 ? (
  <div style={{ textAlign:'center', padding:'100px 0', background:'#fff', border:'1px solid rgba(238,97,102,0.1)' }}>
  <div style={{ fontSize:64, marginBottom:20, color:'#e0d0c8' }}>&#128717;</div>
  <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:28, fontWeight:300, color:'#1a1a1a', marginBottom:12 }}>Your bag is empty</h3>
  <p style={{ color:'#999', fontWeight:300, marginBottom:32 }}>Discover our handcrafted collection and add your favourites.</p>
  <button onClick={()=>setActivePage('home')} style={{ padding:'16px 40px', background:'#1a1a1a', color:'#fff', border:'none', fontWeight:600, cursor:'pointer', fontSize:11, letterSpacing:2, textTransform:'uppercase' }}>Parcourir le Menu</button>
  </div>
  ) : (
  <div style={{ display:'grid', gridTemplateColumns:'1fr 340px', gap:32 }}>
  <div style={{ background:'#fff', border:'1px solid #f0ece8' }}>
  {cartItems.map((item,idx)=>(
  <div key={item.id} style={{ display:'flex', alignItems:'center', gap:20, padding:'24px 28px', borderBottom: idx<cartItems.length-1?'1px solid #f8f5f2':'none' }}>
  <div style={{ width:72, height:72, flexShrink:0, border:'1px solid #f0ece8', overflow:'hidden', borderRadius:'4px' }}>
  <img src={imgSrc(item.image) || item.displayImage || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=240&q=70'} alt={item.name} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
  </div>
  <div style={{ flex:1 }}>
  <div style={{ fontWeight:600, fontSize:15, marginBottom:4, color:'#1a1a1a' }}>{item.name}</div>
  <div style={{ color:'#bbb', fontSize:12, fontWeight:300 }}>{item.price} MAD per piece</div>
  </div>
  <div style={{ display:'flex', alignItems:'center', gap:12 }}>
  <div style={{ fontSize:14, color:'#666', fontWeight:500 }}>x{item.qty}</div>
  <div style={{ fontWeight:600, color:'#1a1a1a', fontSize:16, minWidth:60, textAlign:'right' }}>{(item.price * item.qty)} MAD</div>
  <button onClick={()=>{setCartItems(p=>p.filter(i=>i.id!==item.id));setCartCount(c=>c-item.qty);}} style={{ background:'none', border:'1px solid #f0ece8', cursor:'pointer', color:'#ccc', fontSize:14, width:30, height:30, display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.2s' }} onMouseEnter={e=>{e.currentTarget.style.borderColor='#ee6166';e.currentTarget.style.color='#ee6166';}} onMouseLeave={e=>{e.currentTarget.style.borderColor='#f0ece8';e.currentTarget.style.color='#ccc';}}>x</button>
  </div>
  </div>
  ))}
  </div>
  <div style={{ background:'#fff', border:'1px solid #f0ece8', padding:32, alignSelf:'start' }}>
  <div style={{ fontWeight:600, fontSize:11, marginBottom:28, textTransform:'uppercase', letterSpacing:1.5, color:'#1a1a1a', paddingBottom:16, borderBottom:'1px solid #f8f5f2' }}>Order Summary</div>
  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:14, fontSize:13, color:'#777' }}>
  <span>Sous-total</span><span>{cartItems.reduce((s,i)=>s+i.price*i.qty,0)} MAD</span>
  </div>
  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:28, fontSize:13, color:'#777' }}>
  <span>Livraison</span><span>30 MAD</span>
  </div>
  <div style={{ display:'flex', justifyContent:'space-between', fontWeight:700, fontSize:18, paddingTop:16, borderTop:'1px solid #f8f5f2', marginBottom:28, fontFamily:"'Playfair Display',serif" }}>
  <span>Total</span><span style={{ color:'#ee6166' }}>{cartItems.reduce((s,i)=>s+i.price*i.qty,0)+30} MAD</span>
  </div>
  <div style={{ background:'#faf7f4', border:'1px solid #f0ece8', padding:'12px 16px', marginBottom:24, fontSize:12, color:'#888', display:'flex', alignItems:'center', gap:8 }}>
  <span style={{ fontSize:16 }}>&#128663;</span> Paiement à la livraison (Cash)
  </div>
  <button onClick={handleCheckout} style={{ width:'100%', padding:'18px', background:'linear-gradient(135deg,#ee6166,#d34e54)', color:'#fff', border:'none', fontWeight:700, cursor:'pointer', fontSize:11, letterSpacing:2, textTransform:'uppercase', boxShadow:'0 8px 24px rgba(238,97,102,0.35)', transition:'all 0.3s' }} onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';}} onMouseLeave={e=>{e.currentTarget.style.transform='';}}>
  Confirm Order
  </button>
  </div>
  </div>
  )}
  </div>
  )}

  {/* ORDER SUCCESS POPUP */}
  {showOrderSuccess && (
  <div style={{ position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(10,6,4,0.75)', backdropFilter:'blur(12px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999 }}>
  <div style={{ background:'#fff', padding:'64px 56px', maxWidth:460, width:'100%', textAlign:'center', border:'1px solid rgba(238,97,102,0.15)' }}>
  <div style={{ fontSize:56, marginBottom:24 }}>&#9989;</div>
  <span style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:3, color:'#ee6166', display:'block', marginBottom:16 }}>Confirmed</span>
  <h2 style={{ fontSize:38, fontWeight:300, marginBottom:18, color:'#1a1a1a', fontFamily:"'Playfair Display',Georgia,serif", letterSpacing:-0.5 }}>Commande Validée !</h2>
  <p style={{ color:'#999', fontSize:14, marginBottom:40, lineHeight:1.8, fontWeight:300 }}>
  Merci pour votre confiance. Votre commande avec <strong style={{color:'#1a1a1a'}}>Paiement à la livraison</strong> est préparée avec le plus grand soin.
  </p>
  <button onClick={() => { setShowOrderSuccess(false); setActivePage('tracking'); fetchMyOrders(); }} style={{ width:'100%', padding:'18px', background:'linear-gradient(135deg,#ee6166,#d34e54)', color:'#fff', border:'none', fontWeight:700, cursor:'pointer', fontSize:11, letterSpacing:2.5, textTransform:'uppercase', boxShadow:'0 12px 32px rgba(238,97,102,0.4)', transition:'all 0.3s' }} onMouseEnter={e=>e.currentTarget.style.transform='translateY(-2px)'} onMouseLeave={e=>e.currentTarget.style.transform=''}>
  Track My Order
  </button>
  </div>
  </div>
  )}

  {/* TRACKING PAGE */}
  {activePage === 'tracking' && (
  <div style={{ padding:'140px 80px 80px', minHeight:'100vh', background:'#faf7f4' }}>
  <div style={{ maxWidth:860, margin:'0 auto' }}>
  <span style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:4, color:'#ee6166', display:'block', marginBottom:16 }}>Your Purchases</span>
  <h2 style={{ fontSize:48, fontWeight:300, marginBottom:56, color:'#1a1a1a', fontFamily:"'Playfair Display',Georgia,serif", letterSpacing:-1 }}>Suivi de Commandes</h2>
  {myOrders.length === 0 ? (
  <div style={{ textAlign:'center', padding:'100px 0', background:'#fff', border:'1px solid rgba(238,97,102,0.1)' }}>
  <div style={{ fontSize:48, marginBottom:20, color:'#e0d0c8' }}>&#128230;</div>
  <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:28, fontWeight:300, color:'#1a1a1a', marginBottom:12 }}>No orders yet</h3>
  <p style={{ color:'#aaa', fontWeight:300, marginBottom:32 }}>Discover our collection and place your first order.</p>
  <button onClick={()=>setActivePage('home')} style={{ padding:'16px 40px', background:'#1a1a1a', color:'#fff', border:'none', fontWeight:600, cursor:'pointer', fontSize:11, letterSpacing:2, textTransform:'uppercase' }}>Parcourir notre Menu</button>
  </div>
  ) : (
  <div style={{ display:'grid', gap:16 }}>
  {myOrders.map(order => (
  <div key={order.id} style={{ background:'#fff', padding:'28px 36px', border:'1px solid #f0ece8', display:'flex', justifyContent:'space-between', alignItems:'center', transition:'all 0.3s' }} onMouseEnter={e=>{e.currentTarget.style.boxShadow='0 8px 32px rgba(0,0,0,0.06)';e.currentTarget.style.transform='translateY(-2px)';}} onMouseLeave={e=>{e.currentTarget.style.boxShadow='none';e.currentTarget.style.transform='';}}>
  <div>
  <div style={{ fontWeight:700, fontSize:16, color:'#1a1a1a', marginBottom:6 }}>Order #{order.id}</div>
  <div style={{ color:'#bbb', fontSize:12, fontWeight:300 }}>{new Date(order.created_at).toLocaleDateString('fr-FR')} - {order.items?.length||0} items</div>
  </div>
  <div style={{ textAlign:'right' }}>
  <div style={{ fontWeight:300, fontSize:24, color:'#1a1a1a', marginBottom:12, fontFamily:"'Playfair Display',serif" }}>{Number(order.total_amount)} MAD</div>
  <span style={{ background: order.status==='delivered'?'#e8f5e9':order.status==='cancelled'?'#fdecea':'#fef6e5', color: order.status==='delivered'?'#2e7d32':order.status==='cancelled'?'#c62828':'#f57f17', padding:'5px 12px', fontSize:10, fontWeight:700, letterSpacing:1.5, textTransform:'uppercase' }}>
  {order.status || 'Pending'}
  </span>
  </div>
  </div>
  ))}
  </div>
  )}
  </div>
  </div>
  )}

  {/* MENU PAGE (Order Online) */}
  {activePage === 'orderonline' && (
  <div style={{ padding:'140px 80px 80px', background:'#faf7f4', minHeight:'100vh' }}>
  <div style={{ textAlign:'center', marginBottom:64 }}>
  <span style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:4, color:'#ee6166', display:'block', marginBottom:18 }}>Our Collection</span>
  <h2 style={{ fontSize:54, fontWeight:300, color:'#1a1a1a', fontFamily:"'Playfair Display',Georgia,serif", letterSpacing:-1 }}>Menu <em>Boutique</em></h2>
  <div style={{ display:'flex', alignItems:'center', gap:16, justifyContent:'center', marginTop:24 }}>
  <div style={{ height:1, width:80, background:'linear-gradient(to right,transparent,#e0d0c8)' }} />
  <div style={{ width:5, height:5, borderRadius:'50%', background:'#ee6166' }} />
  <div style={{ height:1, width:80, background:'linear-gradient(to left,transparent,#e0d0c8)' }} />
  </div>
  </div>
  <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:28 }}>
  {cakes.map((cake) => (
  <ProductCard key={cake.id} cake={cake} image={cake.displayImage} liked={liked[cake.id]} onLike={()=>toggleLike(cake.id)} onOrder={()=>addToCart(cake)} />
  ))}
  </div>
  </div>
  )}

  {/* RECIPES AND BLOG PAGE */}
  {['recipes','blog'].includes(activePage) && (
  <div style={{ padding:'140px 80px 80px', background:'#faf7f4', minHeight:'100vh' }}>
  <div style={{ textAlign:'center', marginBottom:64 }}>
  <span style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:4, color:'#ee6166', display:'block', marginBottom:18 }}>Editorial</span>
  <h2 style={{ fontSize:54, fontWeight:300, color:'#1a1a1a', fontFamily:"'Playfair Display',Georgia,serif", letterSpacing:-1 }}>
  {activePage === 'recipes' ? 'Recettes & Savoir-Faire' : 'Journal de la Boutique'}
  </h2>
  <div style={{ display:'flex', alignItems:'center', gap:16, justifyContent:'center', marginTop:24 }}>
  <div style={{ height:1, width:80, background:'linear-gradient(to right,transparent,#e0d0c8)' }} />
  <div style={{ width:5, height:5, borderRadius:'50%', background:'#ee6166' }} />
  <div style={{ height:1, width:80, background:'linear-gradient(to left,transparent,#e0d0c8)' }} />
  </div>
  </div>
  <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:40 }}>
  {[
  {title:"L'Art de la Crème au Beurre Marocaine", date:"12 Oct 2025", img:"https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&q=80", desc:"Discover the secrets behind our most exclusive creations. A detailed look into our pastry chefs' favourite techniques."},
  {title:"Le Safran du Maroc en Pâtisserie",  date:"28 Sep 2025", img:"https://images.unsplash.com/photo-1535141192574-5d4897c12636?w=500&q=80", desc:"Explore how we integrate the world's most luxurious spice into our daily bakes to create unique flavor profiles."},
  {title:"La Tarte au Citron de Marrakech",  date:"15 Sep 2025", img:"https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=500&q=80", desc:"Our signature lemon tart blends the zesty freshness of Marrakech lemons with a perfect buttery crust."},
  {title:"Les Secrets de la Fleur d'Oranger", date:"03 Sep 2025", img:"https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=500&q=80", desc:"How orange blossom water elevates our cakes, adding a fragrant, traditional Moroccan touch to modern desserts."},
  {title:"L'Amande de l'Atlas", date:"18 Aug 2025", img:"https://images.unsplash.com/photo-1587314168485-3236d6710814?w=500&q=80", desc:"A journey to the Atlas mountains to source the finest almonds that form the base of our premium creations."},
  {title:"L'Heure du Thé à la Menthe", date:"05 Aug 2025", img:"https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=500&q=80", desc:"The perfect pairings: which of our artisanal pastries best accompany your traditional afternoon mint tea."},
  {title:"Le Miel de Thym: Or Liquide", date:"21 Jul 2025", img:"https://images.unsplash.com/photo-1607478900766-efe13248b125?w=500&q=80", desc:"We explore the unique, aromatic properties of wild thyme honey and how it naturally sweetens our finest desserts."},
  {title:"Nos Pâtisseries Sans Gluten", date:"14 Jul 2025", img:"https://images.unsplash.com/photo-1550617931-e17a7b70dce2?w=500&q=80", desc:"Delicious doesn't have to mean gluten. Discover our new range of gluten-free cakes that never compromise on taste."},
  {title:"L'Histoire de la Corne de Gazelle", date:"02 Jul 2025", img:"https://images.unsplash.com/photo-1579372786545-d24232daf58c?w=500&q=80", desc:"A deep dive into the rich history of Morocco's most iconic sweet, and our modern, delicate take on the classic recipe."},
  {title:"L'Alliance Choco-Orange", date:"18 Jun 2025", img:"https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=500&q=80", desc:"Dark artisanal chocolate meets the vibrant zest of local Moroccan oranges in a symphony of bold flavors."},
  {title:"L'Art du Glaçage Miroir", date:"05 Jun 2025", img:"https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500&q=80", desc:"The meticulous technique behind our flawlessly smooth mirror glazes that give our celebration cakes their luxurious shine."},
  {title:"La Noix de Coco Exotique", date:"22 May 2025", img:"https://images.unsplash.com/photo-1483695028939-5bb13f8648b0?w=500&q=80", desc:"Bringing a tropical twist to traditional bakes. How we incorporate toasted coconut into our light, airy sponges."},
  {title:"Dattes Medjool: Trésor du Désert", date:"10 May 2025", img:"https://images.unsplash.com/photo-1514056052883-d017fddd0426?w=500&q=80", desc:"Sourcing the finest Medjool dates to create naturally sweet, rich, and gooey centers for our signature cakes."},
  {title:"L'Éclat Vert de la Pistache", date:"28 Apr 2025", img:"https://images.unsplash.com/photo-1551024601-bec78aea704b?w=500&q=80", desc:"From vibrant green garnishes to deeply flavorful pastes, the pistachio is the unsung hero of our premium nut collection."},
  {title:"Tendances Pâtissières 2026", date:"15 Apr 2025", img:"https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&q=80", desc:"A look ahead at the flavor profiles and minimalist cake designs that will dominate the dessert world this year."},
  ].map(article => (
  <div key={article.title} style={{ cursor:'pointer', transition:'transform 0.35s' }} onMouseEnter={e=>e.currentTarget.style.transform='translateY(-6px)'} onMouseLeave={e=>e.currentTarget.style.transform=''}>
  <div style={{ overflow:'hidden', marginBottom:24 }}>
  <img src={article.img} alt={article.title} style={{ width:'100%', height:280, objectFit:'cover', transition:'transform 0.6s', display:'block' }} onMouseEnter={e=>e.target.style.transform='scale(1.04)'} onMouseLeave={e=>e.target.style.transform='scale(1)'} />
  </div>
  <div style={{ color:'#ee6166', fontSize:10, textTransform:'uppercase', letterSpacing:2.5, marginBottom:12, fontWeight:700 }}>{article.date}</div>
  <h3 style={{ fontSize:24, fontFamily:"'Playfair Display',serif", color:'#1a1a1a', marginBottom:14, fontWeight:400, letterSpacing:-0.3 }}>{article.title}</h3>
  <p style={{ color:'#999', fontSize:13, lineHeight:1.8, fontWeight:300 }}>{article.desc}</p>
  <div style={{ marginTop:20, color:'#1a1a1a', fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:2, borderBottom:'1px solid #1a1a1a', display:'inline-block', paddingBottom:3 }}>Lire la Suite</div>
  </div>
  ))}
  </div>
  </div>
  )}

  {/* CONTACT US PAGE */}
  {activePage === 'contactus' && (
  <div style={{ padding:'140px 80px 80px', background:'#fff', minHeight:'100vh' }}>
  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:100, maxWidth:1100, margin:'0 auto' }}>
  <div>
  <span style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:4, color:'#ee6166', display:'block', marginBottom:22 }}>Contactez-nous</span>
  <h2 style={{ fontSize:52, fontWeight:300, color:'#1a1a1a', marginBottom:28, fontFamily:"'Playfair Display',Georgia,serif", lineHeight:1.0, letterSpacing:-1.5 }}>
  {"Parlons de"}
  <br /><em>{"Votre Prochain Événement"}</em>
  </h2>
  <p style={{ color:'#888', fontSize:15, lineHeight:1.9, marginBottom:48, fontWeight:300 }}>
  Whether a bespoke wedding cake, corporate catering, or simply wanting to say hello  &mdash;  our concierge team is always ready.
  </p>
  {[{label:'Notre Atelier', val:"32 Avenue Mohammed V\nCasablanca 20000, Maroc"},{label:'Contact', val:"hello@bakecake.ma\n+212 6 61 23 45 67"}].map(item=>(
  <div key={item.label} style={{ marginBottom:36, paddingBottom:36, borderBottom:'1px solid #f5f0eb' }}>
  <div style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:2.5, color:'#ee6166', marginBottom:12 }}>{item.label}</div>
  <div style={{ color:'#777', fontSize:14, lineHeight:2.0, fontWeight:300, whiteSpace:'pre-line' }}>{item.val}</div>
  </div>
  ))}
  </div>
  <div style={{ background:'#faf7f4', padding:'48px 44px', border:'1px solid rgba(238,97,102,0.1)' }}>
  <div style={{ fontFamily:"'Playfair Display',serif", fontSize:28, fontWeight:400, color:'#1a1a1a', marginBottom:36, letterSpacing:-0.3 }}>Envoyer un Message</div>
  {['Name','Email'].map(field=>(
  <div key={field} style={{ marginBottom:20 }}>
  <label style={{ display:'block', fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:2, color:'#999', marginBottom:10 }}>{field}</label>
  <input type={field==='Email'?'email':'text'} value={contactForm[field.toLowerCase()]} onChange={e=>setContactForm({...contactForm, [field.toLowerCase()]: e.target.value})} style={{ width:'100%', padding:'14px 16px', border:'1px solid #e8e0d8', background:'#fff', outline:'none', fontFamily:'inherit', fontSize:14, color:'#1a1a1a', boxSizing:'border-box' }} />
  </div>
  ))}
  <div style={{ marginBottom:32 }}>
  <label style={{ display:'block', fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:2, color:'#999', marginBottom:10 }}>Message</label>
  <textarea rows={5} value={contactForm.message} onChange={e=>setContactForm({...contactForm, message: e.target.value})} style={{ width:'100%', padding:'14px 16px', border:'1px solid #e8e0d8', background:'#fff', outline:'none', fontFamily:'inherit', resize:'none', fontSize:14, color:'#1a1a1a', boxSizing:'border-box' }} />
  </div>
  <button onClick={handleContactSubmit} style={{ width:'100%', padding:'18px', background:'#1a1a1a', color:'#fff', border:'none', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:2.5, cursor:'pointer', transition:'all 0.3s' }} onMouseEnter={e=>{e.currentTarget.style.background='#ee6166';}} onMouseLeave={e=>{e.currentTarget.style.background='#1a1a1a';}}>
  Send Message
  </button>
  </div>
  </div>
  </div>
  )}

  </div>
  );
}

/* -- Product Card Component ------------------------------------ */
function ProductCard({ cake, image, liked, onLike, onOrder }) {
  const [imgError, setImgError] = useState(false);
  const [hovered, setHovered] = useState(false);

  return (
  <div style={{
  background:'#fff', overflow:'hidden', border:'1px solid #f0ece8',
  transition:'all 0.45s cubic-bezier(0.165,0.84,0.44,1)', cursor:'pointer',
  transform: hovered ? 'translateY(-12px)' : 'translateY(0)',
  boxShadow: hovered ? '0 32px 64px rgba(0,0,0,0.10)' : '0 2px 8px rgba(0,0,0,0.03)',
  }} onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)}>
  <div style={{ position:'relative', height:260, background:'#faf7f4', overflow:'hidden' }}>
  {!imgError ? (
  <img src={image} alt={cake.name}
  style={{ width:'100%', height:'100%', objectFit:'cover', transition:'transform 0.6s', transform: hovered ? 'scale(1.08)' : 'scale(1)' }}
  onError={()=>setImgError(true)}
  />
  ) : (
  <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:64 }}>{cake.emoji}</div>
  )}
  <div style={{ position:'absolute', top:14, left:14, background:'rgba(255,255,255,0.92)', backdropFilter:'blur(4px)', padding:'4px 10px', fontSize:9, fontWeight:700, textTransform:'uppercase', letterSpacing:1.5, color:'#888' }}>{cake.category || 'Patisserie'}</div>
  <button onClick={onLike} style={{ position:'absolute', top:14, right:14, background:'rgba(255,255,255,0.92)', backdropFilter:'blur(6px)', border:'none', borderRadius:'50%', width:38, height:38, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, transition:'all 0.25s', boxShadow: liked?'0 4px 12px rgba(238,97,102,0.3)':'none' }}>{liked ? 'd' : '🤍'}</button>
  </div>
  <div style={{ padding:'24px 22px 22px' }}>
  <div style={{ fontWeight:400, fontSize:17, textAlign:'center', color:'#1a1a1a', marginBottom:6, fontFamily:"'Playfair Display',Georgia,serif" }}>{cake.name}</div>
  <div style={{ textAlign:'center', fontWeight:300, fontSize:12, color:'#bbb', marginBottom:20, textTransform:'uppercase', letterSpacing:2 }}>{cake.price} MAD</div>
  <button onClick={onOrder} style={{
  width:'100%', padding:'13px',
  background: hovered ? '#ee6166' : 'transparent',
  color: hovered ? '#fff' : '#1a1a1a',
  border:'1px solid', borderColor: hovered ? '#ee6166' : 'rgba(26,26,26,0.3)',
  fontWeight:600, fontSize:10, letterSpacing:2.5, cursor:'pointer',
  textTransform:'uppercase', transition:'all 0.35s',
  boxShadow: hovered ? '0 8px 24px rgba(238,97,102,0.35)' : 'none',
  }}>Add to Bag</button>
  </div>
  </div>
  );
}
