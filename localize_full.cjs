const fs = require('fs');

// ══════════════════════════════════════════════════════════════
//  ADMIN DASHBOARD — Morocco Localization
// ══════════════════════════════════════════════════════════════
const adminFile = 'frontend/src/pages/AdminDashboard.jsx';
let a = fs.readFileSync(adminFile, 'utf8');

// 1. Currency — € → MAD in chart Y axis
a = a.replace(
  "callback: v => '€' + (v >= 1000 ? (v/1000).toFixed(0)+'k' : v)",
  "callback: v => (v >= 1000 ? (v/1000).toFixed(0)+'k' : v) + ' MAD'"
);

// 2. KPI Card 1 — Revenue: €12,450.00 with fr-FR → MAD format
a = a.replace(
  "€{Number(stats?.revenue?.total || 12450).toLocaleString('fr-FR',{minimumFractionDigits:2})}",
  "{Number(stats?.revenue?.total || 124500).toLocaleString('fr-FR')} MAD"
);
a = a.replace(
  "cess monts",
  "ce mois"
);

// 3. KPI Card 2 — pending fallback 38 → 42
a = a.replace(
  "stats?.orders?.pending || 38",
  "stats?.orders?.pending || 42"
);

// 4. KPI Card 3 — clients fallback 75 → 93
a = a.replace(
  "stats?.clients?.new || 75",
  "stats?.clients?.new || 93"
);
a = a.replace(
  "↑ +12% ce mois",
  "↑ +14% ce mois"
);

// 5. KPI Card 4 — top product fallback name
a = a.replace(
  "stats?.top_product?.name || 'Gâteau Opéra'",
  "stats?.top_product?.name || 'Gâteau aux Amandes'"
);
a = a.replace(
  "stats?.top_product?.total_sales || 120} vendos",
  "stats?.top_product?.total_sales || 148} ventes"
);

// 6. Admin user fallback name
a = a.replace(
  "user?.name || 'Marie Dubois'",
  "user?.name || 'Admin BakeCake'"
);

// 7. Logout button text
a = a.replace("↩ Déco", "↩ Déconnexion");

// 8. Status badge map — keep French labels (already Moroccan-friendly)
// Badge "En préparation", "Livré", "Annulé", "En attente", "Prêt" are fine

// 9. Loading text
a = a.replace("Chargement…", "Chargement en cours…");

// 10. Dashboard main orders table header — replace €  
a = a.replace(
  "['ID','Client','Gâteau(x)','Date','Total (€)','Statut']",
  "['ID','Client','Gâteau(x)','Date','Total (MAD)','Statut']"
);

// 11. Orders table total column — € → MAD
a = a.replace(
  "€ {Number(o.total_amount).toLocaleString('fr-FR',{minimumFractionDigits:2})}",
  "{Number(o.total_amount).toLocaleString('fr-FR')} MAD"
);

// 12. Commandes tab total column — €{...} → {...} MAD
a = a.replace(
  "€{Number(o.total_amount).toLocaleString('fr-FR')}",
  "{Number(o.total_amount).toLocaleString('fr-FR')} MAD"
);

// 13. Catalogue tab product price — €{p.price} → {p.price} MAD
a = a.replace(
  "€{p.price}",
  "{p.price} MAD"
);

// 14. Date locale — fr-FR (fine for Morocco, keep it)

// 15. Alert errors — translate remaining French alerts
a = a.replace("Erreur mise à jour statut.", "Erreur lors de la mise à jour du statut.");
a = a.replace("Supprimer ?", "Confirmer la suppression ?");
a = a.replace(/alert\('Erreur\.'\)/g, "alert('Une erreur est survenue.')");

// 16. Search placeholder
a = a.replace('placeholder="Rechercher"', 'placeholder="Rechercher..."');

// 17. Popular products label
a = a.replace(
  ".replace('Gâteau ', '').replace('Gateau ', '')",
  ".replace('Gâteau ', 'G. ')"
);

// 18. "Ventes" bar label → keep (fine)

// 19. Dashboard title
a = a.replace(
  "Tableau de Bord BakeCake",
  "Tableau de Bord — BakeCake Maroc"
);

// 20. Chart sales label: "Évolution des Ventes"
a = a.replace(
  "Évolution des Ventes",
  "Chiffre d'Affaires — Mensuel"
);

// 21. Dernières commandes
a = a.replace(
  "Dernières Commandes",
  "Dernières Commandes — Maroc"
);

// 22. Panel title
a = a.replace(
  "Gestion Rapide du Catalogue",
  "Gestion du Catalogue"
);
a = a.replace(
  "✚ Nouveau Gâteau",
  "✚ Ajouter un Produit"
);
a = a.replace(
  "📦 Gérer les Stocks",
  "📦 Gérer les Stocks"
);
a = a.replace(
  "Produits à mettre à jour les stocks :",
  "Produits — État des Stocks :"
);

// 23. "Stock faible" warning
a = a.replace("⚠ Stock faible", "⚠ Stock faible — réapprovisionner");

// 24. Section en développement
a = a.replace(
  "Section en cours de développement",
  "Cette section est en cours de développement. Disponible prochainement."
);

// 25. Messages tab — no messages text
a = a.replace(
  "Aucun message reçu.",
  "Aucun message client pour le moment."
);

// 26. "Marquer lu" button
a = a.replace("Marquer lu", "Marquer comme lu");

// 27. Toggle user buttons
a = a.replace("u.is_active?'Désactiver':'Activer'", "u.is_active ? 'Désactiver' : 'Activer'");

// 28. User status
a = a.replace("u.is_active?'Actif':'Inactif'", "u.is_active ? 'Actif' : 'Inactif'");

// 29. "vendos" correction (typo already fixed above)

fs.writeFileSync(adminFile, a, 'utf8');
console.log('AdminDashboard.jsx — Morocco localization done.');


// ══════════════════════════════════════════════════════════════
//  USER WEBSITE — remaining fixes after previous localization
// ══════════════════════════════════════════════════════════════
const userFile = 'frontend/src/pages/UserWebsite.jsx';
let u = fs.readFileSync(userFile, 'utf8');

// A. Cart: EUR {item.price} per item → already done last time, verify
u = u.replace(/EUR \{item\.price\} per item/g, '{item.price} MAD per piece');

// B. Cart item line total: EUR {...} → {...} MAD
u = u.replace(/EUR \{[^}]*item\.price\s*\*\s*item\.qty[^}]*\}/g, 
              '{(item.price * item.qty)} MAD');

// C. Cart subtotal line
u = u.replace(/EUR \{cartItems\.reduce[^}]*0\)[^}]*\}/g,
              '{cartItems.reduce((s,i)=>s+i.price*i.qty,0)} MAD');

// D. Delivery
u = u.replace(/EUR 3\.99/g, '30 MAD');
u = u.replace(/EUR 3\.99/g, '30 MAD');

// E. Cart grand total
u = u.replace(/EUR \{[^}]*cartItems\.reduce[^}]*\+[^}]*3\.99[^}]*\}/g,
              '{cartItems.reduce((s,i)=>s+i.price*i.qty,0)+30} MAD');

// F. Tracking page order total
u = u.replace(/EUR \{Number\(order\.total_amount\)\.toFixed\(2\)\}/g,
              '{Number(order.total_amount).toLocaleString()} MAD');

// G. Product card price display: {cake.price} MAD (already done)
u = u.replace(/>\s*€\{cake\.price\}\.00\s*</g, '>{cake.price} MAD<');
u = u.replace(/€\{cake\.price\}\.00/g, '{cake.price} MAD');
u = u.replace(/\{cake\.price\}\.00/g, '{cake.price} MAD');

// H. Notification text  
u = u.replace('added to your bag!', 'ajouté à votre panier !');

// I. "Cash on Delivery" → "Paiement à la livraison (Cash)"
u = u.replace(/Cash on Delivery/g, 'Paiement à la livraison (Cash)');
// Restore capitalized version in buttons/labels
u = u.replace(
  "Paiement à la livraison (Cash) →",
  "Confirmer la commande →"
);

// J. Marquee — fix stray "â¬" artifact in "500 MAD" line
u = u.replace(/Free Delivery over â¬50/g, 'Livraison gratuite dès 500 MAD');
u = u.replace(/Handcrafted Daily/g, 'Artisanat Quotidien');
u = u.replace(/Premium Ingredients/g, 'Ingrédients Premium');
u = u.replace(/Custom Wedding Cakes/g, 'Gâteaux de Mariage sur Mesure');

// K. Hero paragraph remaining garbled dash
u = u.replace(
  /Experience the luxury of handcrafted desserts.*?made with the finest Moroccan ingredients/,
  'Vivez le luxe de créations artisanales — préparées avec les meilleurs ingrédients marocains, façonnées avec soin et passion.'
);

// L. Hero CTA buttons
u = u.replace('>Order Now<', '>Commander<');
u = u.replace('>Our Menu<', '>Notre Menu<');
u = u.replace('Scroll to explore', 'Défiler pour explorer');

// M. Footer newsletter  
u = u.replace('Join our circle. Weekly specials and exclusive offers.', 
              'Rejoignez notre cercle. Offres exclusives et spécialités de la semaine.');
u = u.replace('Your email', 'Votre email');

// N. Specials section
u = u.replace('>View Full Menu<', '>Voir le Menu Complet<');

// O. About section
u = u.replace('>Discover More<', '>En Savoir Plus<');

// P. Section title labels  
u = u.replace("'Our Philosophy'", "'Notre Philosophie'");
u = u.replace(">Our Philosophy<", ">Notre Philosophie<");
u = u.replace("'Client Stories'", "'Avis de nos Clients'");
u = u.replace(">Client Stories<", ">Avis de nos Clients<");

// Q. About feature cards (already Moroccan patisserie from previous run)
u = u.replace("'Masters of Moroccan patisserie'", "'Maîtres de la pâtisserie marocaine'");
u = u.replace("'Only the finest global ingredients'", "'Les meilleurs ingrédients sélectionnés'");
u = u.replace("'An experience to unbox'", "'Une expérience à déballer'");
u = u.replace("'Responsibly farmed production'", "'Production responsable et locale'");
u = u.replace("'Premium Quality'", "'Qualité Premium'");
u = u.replace("'Artisan Chefs'", "'Chefs Artisans'");
u = u.replace("'Luxury Packaging'", "'Emballage Luxueux'");
u = u.replace("'Organic Sourced'", "'Sourcing Naturel'");

// R. Testimonials — keep Moroccan city names, update review text language
u = u.replace(
  "'The most exquisite cake I have ever tasted. The packaging alone was a work of art.'",
  "'Le gâteau le plus exquis que j\\'aie jamais goûté. L\\'emballage seul était une œuvre d\\'art.'"
);
u = u.replace(
  "'We ordered a bespoke wedding cake and were blown away. Every detail was perfect.'",
  "'Nous avons commandé un gâteau de mariage sur mesure et avons été émerveillés. Chaque détail était parfait.'"
);
u = u.replace(
  "'Exceptional quality, lightning-fast delivery, and the taste is divine. My go-to for every celebration.'",
  "'Qualité exceptionnelle, livraison rapide et le goût est divin. Ma référence pour chaque occasion.'"
);

// S. Cart page titles
u = u.replace("'Your Selection'", "'Votre Sélection'");
u = u.replace(">Shopping Bag<", ">Mon Panier<");
u = u.replace(">Browse the Menu<", ">Parcourir le Menu<");
u = u.replace("'Your bag is empty'", "'Votre panier est vide'");
u = u.replace("'Discover our handcrafted collection and add your favourites.'", 
              "'Découvrez notre collection artisanale et ajoutez vos préférés.'");
u = u.replace("'Order Summary'", "'Résumé de la Commande'");
u = u.replace(">Subtotal<", ">Sous-total<");
u = u.replace(">Delivery<", ">Livraison<");
u = u.replace(">Total<", ">Total<");
u = u.replace(">Confirm Order<", ">Confirmer la Commande<");

// T. Order success popup
u = u.replace("'Confirmed'", "'Confirmée'");
u = u.replace(">Order Validated!<", ">Commande Validée !<");
u = u.replace(
  "'Thank you for choosing our Boutique. Your order with '",
  "'Merci pour votre confiance. Votre commande avec '"
);
u = u.replace(
  "'is being prepared with meticulous care.'",
  "'est préparée avec le plus grand soin.'"
);
// Fix the full thank-you paragraph (it's inline JSX)
u = u.replace(
  /Thank you for choosing our Boutique\. Your order with.*?is being prepared with meticulous care\./g,
  "Merci pour votre confiance. Votre commande avec <strong style={{color:'#1a1a1a'}}>Paiement à la livraison</strong> est préparée avec le plus grand soin."
);
u = u.replace(">Track My Order<", ">Suivre ma Commande<");

// U. Tracking page
u = u.replace("'Your Purchases'", "'Vos Achats'");
u = u.replace(">Order Tracking<", ">Suivi de Commandes<");
u = u.replace("'No orders yet'", "'Aucune commande pour l\\'instant'");
u = u.replace("'Discover our collection and place your first order.'", 
              "'Découvrez notre catalogue et passez votre première commande.'");
u = u.replace(">Browse our Menu<", ">Parcourir notre Menu<");

// V. Menu page
u = u.replace("'Our Collection'", "'Notre Collection'");
u = u.replace("'Boutique <em>Menu</em>'", "'Menu <em>Boutique</em>'");
u = u.replace(">Boutique <em>Menu</em><", ">Menu <em>Boutique</em><");

// W. Recipes / Blog
u = u.replace("'Editorial'", "'Magazine'");
u = u.replace("'Masterclass Recipes'", "'Recettes & Savoir-Faire'");
u = u.replace("'Boutique Journal'", "'Journal de la Boutique'");
u = u.replace(
  "'Discover the secrets behind our most exclusive creations. A detailed look into our pastry chefs\\' favourite techniques.'",
  "'Découvrez les secrets de nos créations les plus exclusives. Un regard détaillé sur les techniques favorites de nos chefs.'"
);
u = u.replace(">Read More<", ">Lire la Suite<");
u = u.replace(
  "{title:\"The Art of French Buttercream\"",
  "{title:\"L'Art de la Crème au Beurre Marocaine\""
);
u = u.replace(
  "{title:\"Sourcing Madagascar Vanilla\"",
  "{title:\"Le Safran du Maroc en Pâtisserie\""
);
u = u.replace(
  "{title:\"Perfecting the Lemon Tart\"",
  "{title:\"La Tarte au Citron de Marrakech\""
);
u = u.replace(
  "date:\"Oct 12, 2025\"",
  "date:\"12 Oct 2025\""
);
u = u.replace(
  "date:\"Sep 28, 2025\"",
  "date:\"28 Sep 2025\""
);
u = u.replace(
  "date:\"Sep 15, 2025\"",
  "date:\"15 Sep 2025\""
);

// X. Contact page
u = u.replace("'Reach Out'", "'Contactez-nous'");
u = u.replace('>Reach Out<', '>Contactez-nous<');
u = u.replace(
  '{"Let\'s Discuss"}',
  '{"Parlons de"}'
);
u = u.replace(
  '{"Your Next Event"}',
  '{"Votre Prochain Événement"}'
);
u = u.replace(
  "Whether a bespoke wedding cake, corporate catering, or simply wanting to say hello — our concierge team is always ready.",
  "Que ce soit pour un gâteau de mariage sur mesure, un buffet d'entreprise ou simplement pour nous dire bonjour — notre équipe est toujours disponible."
);
u = u.replace("'Our Atelier'", "'Notre Atelier'");
u = u.replace("'Contact'", "'Contact'");
u = u.replace('{label:\'Contact\', val:"hello@cakeshop.fr', "{label:'Contact', val:\"hello@bakecake.ma");
u = u.replace("'Send a Message'", "'Envoyer un Message'");
u = u.replace(">Send a Message<", ">Envoyer un Message<");
u = u.replace(">Send Message<", ">Envoyer le Message<");

// Y. Footer — menu items (already Moroccan address/email from prev run)
u = u.replace("'Newsletter'", "'Newsletter'");
u = u.replace(
  "'Join our circle. Weekly specials and exclusive offers.'",
  "'Rejoignez notre cercle. Offres exclusives chaque semaine.'"
);

// Z. Footer copyright
u = u.replace(
  "© 2025 BakeCake. All rights reserved.",
  "© 2025 BakeCake Maroc. Tous droits réservés."
);

// Footer "Made with love in Casablanca" already updated
// Footer social icons labels already fine

// AA. Notification for product added
u = u.replace('added to your bag!', 'ajouté à votre panier !');

// AB. "Paiement à la livraison (Cash) →" button label
u = u.replace(">Paiement à la livraison (Cash) →<", ">Confirmer la commande →<");
u = u.replace("Commander →", "Confirmer →");

// AC. Cart page "à ×" (item qty label) — already in Arabic numerals, fine

fs.writeFileSync(userFile, u, 'utf8');
console.log('UserWebsite.jsx — Morocco localization done.');

// ── Quick build check ──────────────────────────────────────────
console.log('\nAll done! Run: cd frontend && npm run build');
