const fs = require('fs');

const file = 'frontend/src/pages/UserWebsite.jsx';
let c = fs.readFileSync(file, 'utf8');

// ─────────────────────────────────────────────────────────────────────────────
// 1. PRICES — update demo product prices from EUR to MAD (×10, round to 10s)
// ─────────────────────────────────────────────────────────────────────────────
c = c
  .replace(/\{ id:1, name:'Pinky Cream Cherry Milk',\s*price:9,/,  "{ id:1, name:'Pinky Cream Cherry Milk',  price:90,")
  .replace(/\{ id:2, name:'Gummy Tosca Mixed Flavors',\s*price:9,/, "{ id:2, name:'Gummy Tosca Mixed Flavors', price:90,")
  .replace(/\{ id:3, name:'Blushing Strawberry Cream',\s*price:9,/, "{ id:3, name:'Blushing Strawberry Cream', price:90,")
  .replace(/\{ id:4, name:'Mystery Rose Choco',\s*price:9,/,        "{ id:4, name:'Mystery Rose Choco',         price:90,")
  .replace(/\{ id:5, name:'Coco Lemon Twist',\s*price:11,/,         "{ id:5, name:'Coco Lemon Twist',           price:110,")
  .replace(/\{ id:6, name:'Velvet Dream Cake',\s*price:13,/,        "{ id:6, name:'Velvet Dream Cake',          price:130,")
  .replace(/\{ id:7, name:'Caramel Cloud',\s*price:10,/,            "{ id:7, name:'Caramel Cloud',              price:100,")
  .replace(/\{ id:8, name:'Blueberry Burst',\s*price:9,/,           "{ id:8, name:'Blueberry Burst',            price:90,");

// ─────────────────────────────────────────────────────────────────────────────
// 2. CURRENCY LABELS — EUR / € → MAD
// ─────────────────────────────────────────────────────────────────────────────
// Cart item unit price
c = c.replace(/EUR \{item\.price\} per item/g, '{item.price} MAD per piece');
// Cart item line total
c = c.replace(/EUR \{.*?item\.price\*item\.qty.*?\}/g, '{(item.price * item.qty)} MAD');
// Cart subtotal
c = c.replace(/EUR \{cartItems\.reduce\(\(s,i\)=>s\+i\.price\*i\.qty,0\)\.toFixed\(2\)\}/g,
              '{cartItems.reduce((s,i)=>s+i.price*i.qty,0)} MAD');
// Cart delivery fixed 3.99 → 30 MAD
c = c.replace(/EUR 3\.99/g, '30 MAD');
// Cart total (includes delivery)
c = c.replace(/EUR \{.*?cartItems\.reduce.*?\+3\.99.*?\}/g,
              '{cartItems.reduce((s,i)=>s+i.price*i.qty,0)+30} MAD');
// Order tracking total
c = c.replace(/EUR \{Number\(order\.total_amount\)\.toFixed\(2\)\}/g,
              '{Number(order.total_amount)} MAD');
// Product card price row  e.g. €{cake.price}.00
c = c.replace(/€\{cake\.price\}\.00/g, '{cake.price} MAD');
// Any remaining generic € or EUR  
c = c.replace(/€(\d)/g, '$1 MAD');
c = c.replace(/EUR (\d)/g, '$1 MAD');
c = c.replace(/EUR\s*\{/g, '{'); // EUR {expr} → {expr} MAD handled above

// ─────────────────────────────────────────────────────────────────────────────
// 3. DELIVERY PRICE in notes
// ─────────────────────────────────────────────────────────────────────────────
c = c.replace(/Free Delivery over [â¬€]*50/g, 'Free Delivery over 500 MAD');

// ─────────────────────────────────────────────────────────────────────────────
// 4. LOCATIONS — Paris / France → Morocco
// ─────────────────────────────────────────────────────────────────────────────
// Footer atelier address
c = c.replace(
  /10 Rue de la Patisserie\\n75001 Paris, France/g,
  '32 Avenue Mohammed V\\nCasablanca 20000, Maroc'
);
// Footer atelier address (JSX inline without \n)
c = c.replace(/10 Rue de la Patisserie<br\/>75001 Paris, France/g,
  '32 Avenue Mohammed V<br/>Casablanca 20000, Maroc');
// Contact page val string
c = c.replace(/10 Rue de la Patisserie\\n75001 Paris, France/g,
  '32 Avenue Mohammed V\\nCasablanca 20000, Maroc');

// Phone — +33 6 12 34 56 78 → +212 6 61 23 45 67
c = c.replace(/\+33 6 12 34 56 78/g, '+212 6 61 23 45 67');

// Email — hello@cakeshop.fr → hello@bakecake.ma
c = c.replace(/hello@cakeshop\.fr/g, 'hello@bakecake.ma');

// Testimonials cities
c = c.replace(/city:'Paris'/g,    "city:'Casablanca'");
c = c.replace(/city:'Lyon'/g,     "city:'Rabat'");
c = c.replace(/city:'Bordeaux'/g, "city:'Marrakech'");

// About section
c = c.replace(/Born in Paris, crafted for the world/g,
  'Born in Casablanca, loved across Morocco');

// Footer "Made with love in Paris"
c = c.replace(/Made with love in Paris/g, 'Made with love in Casablanca');

// Marquee items
c = c.replace(/★ Artisan Bakers Paris/g, '★ Artisan Bakers Casablanca');
c = c.replace(/Est\. 2017 [€\-—]* Paris/g, '★ Est. 2017 — Casablanca');
c = c.replace(/Est\. 2017.*?Paris/g, 'Est. 2017 — Casablanca');

// Hero paragraph — "finest ingredients" text with the corrupted € dash
c = c.replace(
  /Experience the luxury of handcrafted desserts [€\-—\"\\u0014]* made with the finest ingredients/,
  'Experience the luxury of handcrafted desserts — made with the finest Moroccan ingredients'
);
// Also fix the stray €" or €\" artifacts in hero text
c = c.replace(/desserts [€"\\]+\s*made/g, 'desserts — made');

// Hero about section text
c = c.replace(/Masters of French patisserie/g, 'Masters of Moroccan patisserie');

// Footer menu newsletter join text
// (no change needed for these)

// ─────────────────────────────────────────────────────────────────────────────
// 5. REMAINING CURRENCY DISPLAY in cart logic (cleanup)
// ─────────────────────────────────────────────────────────────────────────────
// The delivery line in summary
c = c.replace(/<span>Delivery<\/span><span>EUR 3\.99<\/span>/g,
  '<span>Delivery</span><span>30 MAD</span>');
c = c.replace(/<span>Delivery<\/span><span>30 MAD<\/span>/,
  '<span>Delivery</span><span>30 MAD</span>');

// ─────────────────────────────────────────────────────────────────────────────
// 6. REMAINING small text fixes
// ─────────────────────────────────────────────────────────────────────────────
// Footer link set — remove "Paris" from any remaining copy
c = c.replace(/'★ Free Delivery over â¬50'/g, "'★ Free Delivery over 500 MAD'");

// Fix the footer links list that has "Paris" in the about text
c = c.replace(/10 Rue de la Patisserie<br\/>75001 Paris, France<br\/>/g,
  '32 Avenue Mohammed V<br/>Casablanca 20000, Maroc<br/>');

fs.writeFileSync(file, c, 'utf8');
console.log('Morocco localization applied.');

// Quick summary of what remains with EUR/Paris
const lines = c.split('\n');
const remaining = [];
lines.forEach((line, i) => {
  if (/EUR |€|\bparis\b|\bfrance\b|\b33 6\b/i.test(line)) {
    remaining.push(`L${i+1}: ${line.trim().substring(0,120)}`);
  }
});
if (remaining.length === 0) {
  console.log('All EUR/Paris/France references replaced.');
} else {
  console.log('\nRemaining references:');
  remaining.forEach(r => console.log(r));
}
