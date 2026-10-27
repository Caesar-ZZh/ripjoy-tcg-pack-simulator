const fs = require('fs');
let s = fs.readFileSync('src/app.js', 'utf8');
const lines = s.split('\n');
let patched = 0;
for (let i = 0; i < lines.length; i++) {
  const m = lines[i].match(/\{ key: '([^']+)', file: '(data\/[^']+)'/);
  if (!m) continue;
  if (lines[i].includes('sname:')) continue;
  const d = JSON.parse(fs.readFileSync(m[2], 'utf8'));
  const pack = d.pack || (d.lang === 'ja' ? 7 : 10);
  const esc = (x) => String(x).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  const add = `, sname: '${esc(d.name)}', lang: '${d.lang}', total: ${d.total}, pack: ${pack} }`;
  lines[i] = lines[i].replace(/ \},\s*$/, add + ',');
  patched++;
}
fs.writeFileSync('src/app.js', lines.join('\n'));
console.log('patched entries:', patched);
