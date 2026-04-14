const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'frontend/src/pages/UserWebsite.jsx');

// Read the file as UTF-8. Some emoji may be double-encoded (mojibake).
// We'll replace every corrupted sequence with clean Unicode symbols.
let content = fs.readFileSync(file, 'utf8');

// The corrupted blocks come from PowerShell writing latin1-encoded emoji bytes as UTF-8.
// Strategy: replace the garbled strings with clean equivalents.

// Show what we're dealing with -- find all non-ASCII runs
const bad = content.match(/[^\x00-\x7F\u00A0-\uFFFF]{2,}/g);
if (bad) {
  const unique = [...new Set(bad)];
  console.log('Suspicious sequences found:');
  unique.forEach(s => console.log(JSON.stringify(s)));
}

// Replace known mojibake patterns for common emojis used in this file
// 🛒 (U+1F6D2) → shopping cart
// 🛍️ (U+1F6CD) → shopping bags
// 🎂 (U+1F382) → birthday cake
// 👤 (U+1F464) → person silhouette
// 📦 (U+1F4E6) → package
// ✅ (U+2705)  → check mark
// 📦 
// These show as garbled when UTF-8 multi-byte chars were treated as single bytes

const replacements = [
  // Cart page title
  [/[\uFFFD\u00F0\u009F\u009B\u0097].{0,3}Mon Panier/g, 'Shopping Bag'],
  // Cart emoji large display
  [/\{\s*fontSize:64.*?\}[\s\S]*?[^\}]\}/g, ''],  // skip, too risky
];

// Safer: just do string-level replacements of the exact byte sequences
// by reading the file as binary (latin1), then replacing

let raw = fs.readFileSync(file, 'latin1');

// 🛒 in UTF-8 bytes = F0 9F 9B 92
// As latin1 string = ð\x9F\x9B\x92 = \xF0\x9F\x9B\x92
const emojiMap = {
  '\xF0\x9F\x9B\x92': '🛒',   // 🛒
  '\xF0\x9F\x9B\x8D\xEF\xB8\x8F': '🛍️', // 🛍️
  '\xF0\x9F\x8E\x82': '🎂',   // 🎂
  '\xF0\x9F\x91\xA4': '👤',   // 👤
  '\xF0\x9F\x93\xA6': '📦',   // 📦
  '\xE2\x9C\x85': '✅',        // ✅
  '\xE2\x9E\x9C': '→',         // →
  '\xE2\x80\xA2': '•',         // •
  '\xF0\x9F\x8D\xB0': '🍰',   // 🍰
  '\xF0\x9F\x92\x9A': '💚',   // 💚
  '\xF0\x9F\x8D\xAB': '🍫',   // 🍫
  '\xF0\x9F\x8D\xA9': '🍩',   // 🍩
  '\xF0\x9F\x8D\x8B': '🍋',   // 🍋
  '\xE2\x9D\xA4\xEF\xB8\x8F': '❤️', // ❤️
  '\xF0\x9F\x8F\xBA': '🏺',   // 🏺
  '\xF0\x9F\xAB\x90': '🫐',   // 🫐
  '\xE2\x80\x94': '—',         // em dash
  '\xE2\x80\x93': '–',         // en dash
  '\xC3\xA2': 'â',             // a circumflex
  '\xC3\xA9': 'é',
  '\xC3\xA8': 'è',
  '\xC3\xAA': 'ê',
  '\xC3\xB4': 'ô',
  '\xC2\xA9': '©',             // copyright
  '\xE2\x80\x99': "'",         // right single quote
};

// Apply all replacements
for (const [latin1, unicode] of Object.entries(emojiMap)) {
  while (raw.includes(latin1)) {
    raw = raw.replace(latin1, unicode);
  }
}

// Now convert remaining high bytes: any remaining multi-byte UTF-8 sequences
// were stored correctly as latin1 - decode them properly
const buf = Buffer.from(raw, 'latin1');
let fixed = buf.toString('utf8');

// Final cleanup: remove any remaining mojibake (sequences like ðŸ...)
// that couldn't be fixed, replace with space
fixed = fixed.replace(/[\xC0-\xFF][\x80-\xBF]+/g, '');

fs.writeFileSync(file, fixed, 'utf8');
console.log('File fixed and saved as UTF-8.');
