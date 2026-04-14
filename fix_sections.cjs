const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'frontend/src/pages/UserWebsite.jsx');
const all = fs.readFileSync(file, 'utf8').split('\n');

// Keep:  lines 0..402  (home page, ends with      )} )
// Skip:  lines 403..635 (corrupt cart/tracking/menu/contact sections)
// Keep:  lines 636..end (ProductCard component)
const before = all.slice(0, 403).join('\n');
const after  = all.slice(636).join('\n');

const middle = `
      {/* CART PAGE */}
      {activePage === 'cart' && (
        <div style={{ padding:'140px 80px 80px', background:'#faf7f4', minHeight:'100vh' }}>
          <span style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:4, color:'#ee6166', display:'block', marginBottom:16 }}>Your Selection</span>
          <h2 style={{ fontSize:48, fontWeight:300, marginBottom:48, color:'#1a1a1a', fontFamily:"'Cormorant Garamond',Georgia,serif", letterSpacing:-1 }}>Shopping Bag</h2>
          {cartItems.length === 0 ? (
            <div style={{ textAlign:'center', padding:'100px 0', background:'#fff', border:'1px solid rgba(238,97,102,0.1)' }}>
              <div style={{ fontSize:64, marginBottom:20, color:'#e0d0c8' }}>&#128717;</div>
              <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:28, fontWeight:300, color:'#1a1a1a', marginBottom:12 }}>Your bag is empty</h3>
              <p style={{ color:'#999', fontWeight:300, marginBottom:32 }}>Discover our handcrafted collection and add your favourites.</p>
              <button onClick={()=>setActivePage('home')} style={{ padding:'16px 40px', background:'#1a1a1a', color:'#fff', border:'none', fontWeight:600, cursor:'pointer', fontSize:11, letterSpacing:2, textTransform:'uppercase' }}>Browse the Menu</button>
            </div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'1fr 340px', gap:32 }}>
              <div style={{ background:'#fff', border:'1px solid #f0ece8' }}>
                {cartItems.map((item,idx)=>(
                  <div key={item.id} style={{ display:'flex', alignItems:'center', gap:20, padding:'24px 28px', borderBottom: idx<cartItems.length-1?'1px solid #f8f5f2':'none' }}>
                    <div style={{ width:72, height:72, background:'linear-gradient(135deg,#fceee9,#f3c2b9)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:'#ee6166', flexShrink:0, border:'1px solid #f0ece8', textTransform:'uppercase', letterSpacing:1 }}>Cake</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:600, fontSize:15, marginBottom:4, color:'#1a1a1a' }}>{item.name}</div>
                      <div style={{ color:'#bbb', fontSize:12, fontWeight:300 }}>EUR {item.price} per item</div>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                      <div style={{ fontSize:14, color:'#666', fontWeight:500 }}>x{item.qty}</div>
                      <div style={{ fontWeight:600, color:'#1a1a1a', fontSize:16, minWidth:60, textAlign:'right' }}>EUR {(item.price*item.qty).toFixed(2)}</div>
                      <button onClick={()=>{setCartItems(p=>p.filter(i=>i.id!==item.id));setCartCount(c=>c-item.qty);}} style={{ background:'none', border:'1px solid #f0ece8', cursor:'pointer', color:'#ccc', fontSize:14, width:30, height:30, display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.2s' }} onMouseEnter={e=>{e.currentTarget.style.borderColor='#ee6166';e.currentTarget.style.color='#ee6166';}} onMouseLeave={e=>{e.currentTarget.style.borderColor='#f0ece8';e.currentTarget.style.color='#ccc';}}>x</button>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ background:'#fff', border:'1px solid #f0ece8', padding:32, alignSelf:'start' }}>
                <div style={{ fontWeight:600, fontSize:11, marginBottom:28, textTransform:'uppercase', letterSpacing:1.5, color:'#1a1a1a', paddingBottom:16, borderBottom:'1px solid #f8f5f2' }}>Order Summary</div>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:14, fontSize:13, color:'#777' }}>
                  <span>Subtotal</span><span>EUR {cartItems.reduce((s,i)=>s+i.price*i.qty,0).toFixed(2)}</span>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:28, fontSize:13, color:'#777' }}>
                  <span>Delivery</span><span>EUR 3.99</span>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', fontWeight:700, fontSize:18, paddingTop:16, borderTop:'1px solid #f8f5f2', marginBottom:28, fontFamily:"'Cormorant Garamond',serif" }}>
                  <span>Total</span><span style={{ color:'#ee6166' }}>EUR {(cartItems.reduce((s,i)=>s+i.price*i.qty,0)+3.99).toFixed(2)}</span>
                </div>
                <div style={{ background:'#faf7f4', border:'1px solid #f0ece8', padding:'12px 16px', marginBottom:24, fontSize:12, color:'#888', display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ fontSize:16 }}>&#128663;</span> Cash on Delivery
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
            <h2 style={{ fontSize:38, fontWeight:300, marginBottom:18, color:'#1a1a1a', fontFamily:"'Cormorant Garamond',Georgia,serif", letterSpacing:-0.5 }}>Order Validated!</h2>
            <p style={{ color:'#999', fontSize:14, marginBottom:40, lineHeight:1.8, fontWeight:300 }}>
              Thank you for choosing our Boutique. Your order with <strong style={{color:'#1a1a1a'}}>Cash on Delivery</strong> is being prepared with meticulous care.
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
            <h2 style={{ fontSize:48, fontWeight:300, marginBottom:56, color:'#1a1a1a', fontFamily:"'Cormorant Garamond',Georgia,serif", letterSpacing:-1 }}>Order Tracking</h2>
            {myOrders.length === 0 ? (
              <div style={{ textAlign:'center', padding:'100px 0', background:'#fff', border:'1px solid rgba(238,97,102,0.1)' }}>
                <div style={{ fontSize:48, marginBottom:20, color:'#e0d0c8' }}>&#128230;</div>
                <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:28, fontWeight:300, color:'#1a1a1a', marginBottom:12 }}>No orders yet</h3>
                <p style={{ color:'#aaa', fontWeight:300, marginBottom:32 }}>Discover our collection and place your first order.</p>
                <button onClick={()=>setActivePage('home')} style={{ padding:'16px 40px', background:'#1a1a1a', color:'#fff', border:'none', fontWeight:600, cursor:'pointer', fontSize:11, letterSpacing:2, textTransform:'uppercase' }}>Browse our Menu</button>
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
                      <div style={{ fontWeight:300, fontSize:24, color:'#1a1a1a', marginBottom:12, fontFamily:"'Cormorant Garamond',serif" }}>EUR {Number(order.total_amount).toFixed(2)}</div>
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

      {/* MENU PAGE (Cupcake / Order Online) */}
      {['cupcake','orderonline'].includes(activePage) && (
        <div style={{ padding:'140px 80px 80px', background:'#faf7f4', minHeight:'100vh' }}>
          <div style={{ textAlign:'center', marginBottom:64 }}>
            <span style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:4, color:'#ee6166', display:'block', marginBottom:18 }}>Our Collection</span>
            <h2 style={{ fontSize:54, fontWeight:300, color:'#1a1a1a', fontFamily:"'Cormorant Garamond',Georgia,serif", letterSpacing:-1 }}>Boutique <em>Menu</em></h2>
            <div style={{ display:'flex', alignItems:'center', gap:16, justifyContent:'center', marginTop:24 }}>
              <div style={{ height:1, width:80, background:'linear-gradient(to right,transparent,#e0d0c8)' }} />
              <div style={{ width:5, height:5, borderRadius:'50%', background:'#ee6166' }} />
              <div style={{ height:1, width:80, background:'linear-gradient(to left,transparent,#e0d0c8)' }} />
            </div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:28 }}>
            {cakes.map((cake, i) => (
              <ProductCard key={cake.id} cake={cake} image={cakeImages[i%cakeImages.length]} liked={liked[cake.id]} onLike={()=>toggleLike(cake.id)} onOrder={()=>addToCart(cake)} />
            ))}
          </div>
        </div>
      )}

      {/* RECIPES AND BLOG PAGE */}
      {['recipes','blog'].includes(activePage) && (
        <div style={{ padding:'140px 80px 80px', background:'#faf7f4', minHeight:'100vh' }}>
          <div style={{ textAlign:'center', marginBottom:64 }}>
            <span style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:4, color:'#ee6166', display:'block', marginBottom:18 }}>Editorial</span>
            <h2 style={{ fontSize:54, fontWeight:300, color:'#1a1a1a', fontFamily:"'Cormorant Garamond',Georgia,serif", letterSpacing:-1 }}>
              {activePage === 'recipes' ? 'Masterclass Recipes' : 'Boutique Journal'}
            </h2>
            <div style={{ display:'flex', alignItems:'center', gap:16, justifyContent:'center', marginTop:24 }}>
              <div style={{ height:1, width:80, background:'linear-gradient(to right,transparent,#e0d0c8)' }} />
              <div style={{ width:5, height:5, borderRadius:'50%', background:'#ee6166' }} />
              <div style={{ height:1, width:80, background:'linear-gradient(to left,transparent,#e0d0c8)' }} />
            </div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:40 }}>
            {[
              {title:"The Art of French Buttercream", date:"Oct 12, 2025", img:"https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500&q=80"},
              {title:"Sourcing Madagascar Vanilla",   date:"Sep 28, 2025", img:"https://images.unsplash.com/photo-1615837197154-2e801f41b4b1?w=500&q=80"},
              {title:"Perfecting the Lemon Tart",    date:"Sep 15, 2025", img:"https://images.unsplash.com/photo-1519869325930-281384150729?w=500&q=80"},
            ].map(article => (
              <div key={article.title} style={{ cursor:'pointer', transition:'transform 0.35s' }} onMouseEnter={e=>e.currentTarget.style.transform='translateY(-6px)'} onMouseLeave={e=>e.currentTarget.style.transform=''}>
                <div style={{ overflow:'hidden', marginBottom:24 }}>
                  <img src={article.img} alt={article.title} style={{ width:'100%', height:280, objectFit:'cover', transition:'transform 0.6s', display:'block' }} onMouseEnter={e=>e.target.style.transform='scale(1.04)'} onMouseLeave={e=>e.target.style.transform='scale(1)'} />
                </div>
                <div style={{ color:'#ee6166', fontSize:10, textTransform:'uppercase', letterSpacing:2.5, marginBottom:12, fontWeight:700 }}>{article.date}</div>
                <h3 style={{ fontSize:24, fontFamily:"'Cormorant Garamond',serif", color:'#1a1a1a', marginBottom:14, fontWeight:400, letterSpacing:-0.3 }}>{article.title}</h3>
                <p style={{ color:'#999', fontSize:13, lineHeight:1.8, fontWeight:300 }}>Discover the secrets behind our most exclusive creations. A detailed look into our pastry chefs' favourite techniques.</p>
                <div style={{ marginTop:20, color:'#1a1a1a', fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:2, borderBottom:'1px solid #1a1a1a', display:'inline-block', paddingBottom:3 }}>Read More</div>
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
              <span style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:4, color:'#ee6166', display:'block', marginBottom:22 }}>Reach Out</span>
              <h2 style={{ fontSize:52, fontWeight:300, color:'#1a1a1a', marginBottom:28, fontFamily:"'Cormorant Garamond',Georgia,serif", lineHeight:1.0, letterSpacing:-1.5 }}>
                {"Let's Discuss"}
                <br /><em>{"Your Next Event"}</em>
              </h2>
              <p style={{ color:'#888', fontSize:15, lineHeight:1.9, marginBottom:48, fontWeight:300 }}>
                Whether a bespoke wedding cake, corporate catering, or simply wanting to say hello — our concierge team is always ready.
              </p>
              {[{label:'Our Atelier', val:'10 Rue de la Patisserie\n75001 Paris, France'},{label:'Contact', val:'hello@cakeshop.fr\n+33 6 12 34 56 78'}].map(item=>(
                <div key={item.label} style={{ marginBottom:36, paddingBottom:36, borderBottom:'1px solid #f5f0eb' }}>
                  <div style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:2.5, color:'#ee6166', marginBottom:12 }}>{item.label}</div>
                  <div style={{ color:'#777', fontSize:14, lineHeight:2.0, fontWeight:300, whiteSpace:'pre-line' }}>{item.val}</div>
                </div>
              ))}
            </div>
            <div style={{ background:'#faf7f4', padding:'48px 44px', border:'1px solid rgba(238,97,102,0.1)' }}>
              <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:28, fontWeight:400, color:'#1a1a1a', marginBottom:36, letterSpacing:-0.3 }}>Send a Message</div>
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

`;

const combined = before + middle + after;
fs.writeFileSync(file, combined, 'utf8');
console.log('Done. Total lines:', combined.split('\n').length);
