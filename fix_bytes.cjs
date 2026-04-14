const fs = require('fs');
const file = 'c:/Users/hibaa/OneDrive/Desktop/bakecake-shop/frontend/src/pages/UserWebsite.jsx';

let content = fs.readFileSync(file, 'utf8');

// Replace corrupted emoji in the navbar with clean SVG-like unicode text symbols
// 👤 (person) → ⊙ person icon symbol
// 🛒 (cart)   → bag icon
// 📦 (package)→ box icon

// The corrupted strings appear as: ðŸ'¤ / ðŸ›' / ðŸ"¦
// Replace them with clean HTML entity arrows or simple symbols

content = content
  // Navbar: person icon (👤 corrupted)
  .replace(/ðŸ\x27¤/g, '&#128100;')
  // Navbar: shopping cart (🛒 corrupted) 
  .replace(/ðŸ\x27<\/span>\n.*?<\/button>/g, '')  // skip
  .replace(/ðŸ›\x27/g, '&#128717;')
  // Navbar: package (📦 corrupted)
  .replace(/ðŸ\x22¦/g, '&#128230;')
  // Toast: checkmark (✅ corrupted)
  .replace(/ðŸ\x22\x85/g, '&#9989;');

// Also fix using byte-level patterns from latin1 misread
// Read as latin1 to find exact byte sequences
let raw = fs.readFileSync(file, 'latin1');

// 👤 = F0 9F 91 A4
raw = raw.split('\xF0\x9F\x91\xA4').join('&#9906;');
// 🛒 = F0 9F 9B 92  
raw = raw.split('\xF0\x9F\x9B\x92').join('&#128717;');
// 📦 = F0 9F 93 A6
raw = raw.split('\xF0\x9F\x93\xA6').join('&#128230;');
// ✅ = E2 9C 85
raw = raw.split('\xE2\x9C\x85').join('&#9989;');
// 🛍️ = F0 9F 9B 8D EF B8 8F
raw = raw.split('\xF0\x9F\x9B\x8D\xEF\xB8\x8F').join('&#128717;');
// 🎂 = F0 9F 8E 82
raw = raw.split('\xF0\x9F\x8E\x82').join('&#127874;');
// EUR sign € = E2 82 AC (might appear as â‚¬ in bad encoding)
// already handled in JSX as 'EUR'
// em dash â€" = E2 80 94
raw = raw.split('\xE2\x80\x94').join(' &mdash; ');
// right arrow â†' = E2 86 92
raw = raw.split('\xE2\x86\x92').join(' &rarr;');
// â€¢ bullet = E2 80 A2  
raw = raw.split('\xE2\x80\xA2').join('\u2022');
// Ã© = C3 A9 (e acute)
raw = raw.split('\xC3\xA9').join('e');
// Copyright Â© = C2 A9
raw = raw.split('\xC2\xA9').join('&copy;');
// â€™ right quote = E2 80 99
raw = raw.split('\xE2\x80\x99').join("'");

// Now re-encode back to UTF-8 (converting from latin1 byte string to actual buffer)
const buf = Buffer.from(raw, 'latin1');
fs.writeFileSync(file, buf.toString('utf8'), 'utf8');
console.log('All corrupted symbols fixed.');
