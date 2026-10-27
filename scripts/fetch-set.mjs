// Fetch real card data from TCGdex (no API key) and emit a compact JSON per set.
// Usage: node scripts/fetch-set.mjs <lang> <setId> [more setIds...]
import { writeFile, mkdir } from 'node:fs/promises';

const lang = process.argv[2] || 'en';
const sets = process.argv.slice(3);
if (!sets.length) { console.error('no set ids'); process.exit(1); }

async function j(url, tries = 3) {
  for (let i = 0; i < tries; i++) {
    try { const r = await fetch(url); if (r.ok) return await r.json(); } catch {}
    await new Promise(s => setTimeout(s, 400 * (i + 1)));
  }
  return null;
}
async function pool(items, n, fn) {
  const out = new Array(items.length); let idx = 0;
  await Promise.all(Array.from({ length: n }, async () => {
    while (idx < items.length) { const i = idx++; out[i] = await fn(items[i]); }
  }));
  return out;
}
for (const setId of sets) {
  const set = await j(`https://api.tcgdex.net/v2/${lang}/sets/${setId}`);
  if (!set) { console.error('set failed', setId); continue; }
  const cards = await pool(set.cards, 12, async (c) => {
    const d = await j(`https://api.tcgdex.net/v2/${lang}/cards/${c.id}`);
    if (!d) return null;
    const cm = d.pricing?.cardmarket; const tp = d.pricing?.tcgplayer;
    let price = null, currency = 'EUR';
    if (cm && (cm['trend-holo'] || cm.trend)) price = cm['trend-holo'] || cm.trend;
    if (!price && tp) { const v = tp.holofoil || tp.normal || tp['reverse-holofoil'] || tp['1stEditionHolofoil']; if (v?.marketPrice) { price = v.marketPrice; currency = 'USD'; } }
    return { id: d.id, n: d.name, no: d.localId, r: d.rarity || 'Common', img: d.image, p: price, cur: currency, ill: d.illustrator || null };
  });
  const good = cards.filter(Boolean);
  const rar = {}; good.forEach(c => rar[c.r] = (rar[c.r] || 0) + 1);
  const out = { id: setId, lang, name: set.name, logo: set.logo || null, symbol: set.symbol || null, total: set.cardCount.total, official: set.cardCount.official, rarities: rar, cards: good };
  await mkdir(new URL('../data/', import.meta.url), { recursive: true });
  await writeFile(new URL(`../data/${lang}-${setId}.json`, import.meta.url), JSON.stringify(out));
  console.log(setId, set.name, good.length, rar);
}
