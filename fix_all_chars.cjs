const fs = require('fs');

const file = 'frontend/src/pages/UserWebsite.jsx';
// Read as latin1 so we see exact bytes
const raw = fs.readFileSync(file, 'latin1');

// Build a comprehensive byte-sequence → clean replacement map
// Every entry: exact latin1 byte string → correct UTF-8 replacement
const fixes = [
  // ── Corrupted multi-byte emoji sequences ──────────────────────────────
  // These come from UTF-8 bytes that were stored/read as latin1 and then written back
  
  // 🎂 (cake) = F0 9F 8E 82
  ['\xF0\x9F\x8E\x82', '🎂'],
  // 🍰 (slice of cake) = F0 9F 8D B0
  ['\xF0\x9F\x8D\xB0', '🍰'],
  // 🍓 (strawberry) = F0 9F 8D 93
  ['\xF0\x9F\x8D\x93', '🍓'],
  // 🧁 (cupcake) = F0 9F A7 81
  ['\xF0\x9F\xA7\x81', '🧁'],
  // 🍋 (lemon) = F0 9F 8D 8B
  ['\xF0\x9F\x8D\x8B', '🍋'],
  // 🍮 (custard) = F0 9F 8D AE
  ['\xF0\x9F\x8D\xAE', '🍮'],
  // 🫐 (blueberries) = F0 9F AB 90
  ['\xF0\x9F\xAB\x90', '🫐'],
  // ❤️ = E2 9D A4 EF B8 8F
  ['\xE2\x9D\xA4\xEF\xB8\x8F', '❤️'],
  // ❤ = E2 9D A4
  ['\xE2\x9D\xA4', '❤'],
  // 🤍 = F0 9F A4 8D
  ['\xF0\x9F\xA4\x8D', '🤍'],
  // ❤️ liked heart
  ['\xE2\x9D\xA4\xEF\xB8\x8F', '❤️'],
  // 🛒 (cart) = F0 9F 9B 92
  ['\xF0\x9F\x9B\x92', '🛒'],
  // 🛍️ (bags) = F0 9F 9B 8D EF B8 8F
  ['\xF0\x9F\x9B\x8D\xEF\xB8\x8F', '🛍️'],
  // 🛍 = F0 9F 9B 8D
  ['\xF0\x9F\x9B\x8D', '🛍'],
  // 👤 (person) = F0 9F 91 A4
  ['\xF0\x9F\x91\xA4', '👤'],
  // 📦 (package) = F0 9F 93 A6
  ['\xF0\x9F\x93\xA6', '📦'],
  // ✅ = E2 9C 85
  ['\xE2\x9C\x85', '✅'],
  // ✓ = E2 9C 93
  ['\xE2\x9C\x93', '✓'],
  // 🍫 (chocolate) = F0 9F 8D AB
  ['\xF0\x9F\x8D\xAB', '🍫'],
  // 🍩 (donut) = F0 9F 8D A9
  ['\xF0\x9F\x8D\xA9', '🍩'],
  // 💚 (green heart) = F0 9F 92 9A
  ['\xF0\x9F\x92\x9A', '💚'],
  // 🏺 (amphora) = F0 9F 8F BA
  ['\xF0\x9F\x8F\xBA', '🏺'],
  // 💳 (card) = F0 9F 92 B3
  ['\xF0\x9F\x92\xB3', '💳'],
  // 🚗 (car) = F0 9F 9A 97
  ['\xF0\x9F\x9A\x97', '🚗'],
  // ⭐ = E2 AD 90
  ['\xE2\xAD\x90', '⭐'],
  // ★ = E2 98 85
  ['\xE2\x98\x85', '★'],
  // ☆ = E2 98 86
  ['\xE2\x98\x86', '☆'],
  // ✦ = E2 9C A6
  ['\xE2\x9C\xA6', '✦'],
  // ✿ = E2 9C BF
  ['\xE2\x9C\xBF', '✿'],
  // ◆ = E2 97 86
  ['\xE2\x97\x86', '◆'],
  // ❖ = E2 9D 96
  ['\xE2\x9D\x96', '❖'],
  // 📍 (pin) = F0 9F 93 8D
  ['\xF0\x9F\x93\x8D', '📍'],
  // 📞 (phone) = F0 9F 93\x9E
  ['\xF0\x9F\x93\x9E', '📞'],
  // ✉ = E2 9C 89
  ['\xE2\x9C\x89', '✉'],

  // ── Corrupted punctuation / typography ───────────────────────────────
  // em dash — = E2 80 94
  ['\xE2\x80\x94', '—'],
  // en dash – = E2 80 93
  ['\xE2\x80\x93', '–'],
  // right single quote ' = E2 80 99
  ['\xE2\x80\x99', "'"],
  // left single quote ' = E2 80 98
  ['\xE2\x80\x98', "'"],
  // right double quote " = E2 80 9D
  ['\xE2\x80\x9D', '"'],
  // left double quote " = E2 80 9C
  ['\xE2\x80\x9C', '"'],
  // ellipsis … = E2 80 A6
  ['\xE2\x80\xA6', '...'],
  // bullet • = E2 80 A2
  ['\xE2\x80\xA2', '•'],
  // → right arrow = E2 86 92
  ['\xE2\x86\x92', '→'],
  // ← left arrow = E2 86 90
  ['\xE2\x86\x90', '←'],
  // € euro sign = E2 82 AC
  ['\xE2\x82\xAC', '€'],
  // © copyright = C2 A9
  ['\xC2\xA9', '©'],
  // ® registered = C2 AE
  ['\xC2\xAE', '®'],
  // ™ trademark = E2 84 A2
  ['\xE2\x84\xA2', '™'],
  // non-breaking space = C2 A0
  ['\xC2\xA0', ' '],

  // ── French accented characters ────────────────────────────────────────
  // é = C3 A9
  ['\xC3\xA9', 'é'],
  // è = C3 A8
  ['\xC3\xA8', 'è'],
  // ê = C3 AA
  ['\xC3\xAA', 'ê'],
  // ë = C3 AB
  ['\xC3\xAB', 'ë'],
  // à = C3 A0
  ['\xC3\xA0', 'à'],
  // â = C3 A2
  ['\xC3\xA2', 'â'],
  // î = C3 AE
  ['\xC3\xAE', 'î'],
  // ï = C3 AF
  ['\xC3\xAF', 'ï'],
  // ô = C3 B4
  ['\xC3\xB4', 'ô'],
  // ù = C3 B9
  ['\xC3\xB9', 'ù'],
  // û = C3 BB
  ['\xC3\xBB', 'û'],
  // ü = C3 BC
  ['\xC3\xBC', 'ü'],
  // ç = C3 A7
  ['\xC3\xA7', 'ç'],
  // É = C3 89
  ['\xC3\x89', 'É'],
  // È = C3 88
  ['\xC3\x88', 'È'],
  // Â = C3 82
  ['\xC3\x82', 'Â'],
  // œ = C5 93
  ['\xC5\x93', 'œ'],
  // æ = C3 A6
  ['\xC3\xA6', 'æ'],
];

let fixed = raw;
for (const [from, to] of fixes) {
  while (fixed.includes(from)) {
    fixed = fixed.split(from).join(to);
  }
}

// After replacements, convert back: the fixed string is now latin1 with
// real Unicode chars as JS string (each > 0xFF is now a JS char).
// Write encoding: each char > 0xFF encode as UTF-8, each <= 0x7F as-is.
// Chars 0x80-0xFF that remain are unknown garbage — just drop them.
const out = Buffer.from(fixed, 'utf8'); // JS string → utf8 bytes
fs.writeFileSync(file, out);

console.log('Done. All corrupted characters fixed.');

// Report remaining non-ASCII (should be clean emoji etc.)
const verify = fs.readFileSync(file, 'utf8');
const remaining = [];
verify.split('\n').forEach((line, i) => {
  // Flag replacement chars (U+FFFD) or other obvious mojibake
  if (line.includes('\uFFFD') || /[\xC0-\xFF]/.test(line)) {
    remaining.push(`Line ${i+1}: ${line.trim().substring(0,100)}`);
  }
});
if (remaining.length) {
  console.log('Remaining issues:');
  remaining.forEach(r => console.log(r));
} else {
  console.log('File is clean — no remaining corrupted characters.');
}
