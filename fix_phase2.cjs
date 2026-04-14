const fs = require('fs');

const file = 'frontend/src/pages/UserWebsite.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Remove UTF-8 BOM if present
content = content.replace(/^\uFEFF/, '');

// 2. Remove all replacement characters U+FFFD and the garbled patterns around them
// The pattern ï¿½ is U+FFFD encoded as mojibake – remove entirely
content = content.replace(/ï¿½/g, '');

// 3. Fix specific known garbled strings line by line

// Line 22: comment text — em dash
content = content.replace(/ï¿½€"/g, '—');
content = content.replace(/â€"/g, '—');

// Line 83: "ajoutÃï¿½ au panier" → "ajouté au panier"
content = content.replace(/ajoutÃ\s*au panier/g, 'ajouté au panier');
content = content.replace(/Ã©/g, 'é');
content = content.replace(/Ã¨/g, 'è');
content = content.replace(/Ã /g, 'à');
content = content.replace(/Ã¢/g, 'â');
content = content.replace(/Ã®/g, 'î');
content = content.replace(/Ã´/g, 'ô');
content = content.replace(/Ã¹/g, 'ù');
content = content.replace(/Ã»/g, 'û');
content = content.replace(/Ã§/g, 'ç');
content = content.replace(/Ã‰/g, 'É');
content = content.replace(/Ã¯/g, 'ï');
content = content.replace(/Åœ/g, 'Œ');
content = content.replace(/Å"/g, 'œ');

// Line 151: toast notification icon — garbled "œ..." → bell icon or bullet
content = content.replace(/<span style=\{[^}]+\}>([^<]*œ[^<]*)<\/span>/g, (m, inner) => {
  return m.replace(/[^\x20-\x7E❤🤍🛒📦👤🎂🍰🍓🧁🍋🍮🫐✦◆❖✿★☆©→←—–€✅✓•…]/g, '');
});

// Line 282: marquee items "œ¦" → "✦" (sparkle/diamond)
content = content.replace(/œ[ÂÃ¦]{1,3}/g, '★');
content = content.replace(/œÂ¦/g, '★');

// Line 399: copyright © 
content = content.replace(/ï¿½\s*2025/g, '© 2025');
content = content.replace(/Â©/g, '©');

// Clean up any remaining â€" em dash variants
content = content.replace(/â€™/g, "'");
content = content.replace(/â€œ/g, '"');
content = content.replace(/â€/g, '"');
content = content.replace(/â€˜/g, "'");
content = content.replace(/â€¢/g, '•');
content = content.replace(/â€¦/g, '...');
content = content.replace(/â†'/g, '→');
content = content.replace(/â‚¬/g, '€');
content = content.replace(/Â£/g, '£');
content = content.replace(/Â /g, ' ');

// Fix comment dividers — "Â" repeated = box drawing chars
// Replace sequences like "Â\w" and similar garbled comment chars with dashes
content = content.replace(/\/\*\s*[\x80-\xFF "Â]{3,}(.*?)[\x80-\xFF "Â]{3,}\s*\*\//g, (m, mid) => {
  return `/* --- ${mid.trim()} --- */`;
});

// Remove any remaining lone high-byte chars in code comments
content = content.replace(/Â/g, '');
content = content.replace(/\x00/g, '');

// Clean up double spaces left by removals
content = content.replace(/ {3,}/g, '  ');

fs.writeFileSync(file, content, 'utf8');
console.log('Phase 2 clean done.');

// Verify
const final = fs.readFileSync(file, 'utf8');
const issues = [];
final.split('\n').forEach((line, i) => {
  if (/[\u00C0-\u00FF]/.test(line) && !/[àâçéèêëîïôùûüœæÀÂÇÉÈÊËÎÏÔÙÛÜŒÆ]/.test(line)) {
    issues.push(`Line ${i+1}: ${line.trim().substring(0, 100)}`);
  }
});
if (issues.length === 0) {
  console.log('All clean! No remaining corrupted characters.');
} else {
  console.log('Remaining issues:');
  issues.slice(0, 20).forEach(l => console.log(l));
}
