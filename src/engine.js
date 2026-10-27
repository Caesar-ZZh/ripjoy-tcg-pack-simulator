// RipJoy 开包引擎：真实卡池 + 卡槽概率模型（口径见 docs/PRD.md 第 5 节）
export const TIERS = {
  C:   { key: 'C',   label: 'Common',    cn: '普通',   color: '#9aa7bd', level: 0 },
  U:   { key: 'U',   label: 'Uncommon',  cn: '非普通', color: '#7fd08c', level: 0 },
  R:   { key: 'R',   label: 'Rare',      cn: '稀有闪', color: '#5eb1ff', level: 1 },
  RR:  { key: 'RR',  label: 'Double Rare', cn: '双重稀有', color: '#b78cff', level: 2 },
  ACE: { key: 'ACE', label: 'ACE SPEC',  cn: 'ACE',    color: '#ff7fd0', level: 2 },
  UR:  { key: 'UR',  label: 'Ultra Rare', cn: '超级稀有', color: '#ffd75e', level: 3 },
  AR:  { key: 'AR',  label: 'Illustration Rare', cn: '插画稀有', color: '#ff9d5c', level: 3 },
  SAR: { key: 'SAR', label: 'Special Illustration Rare', cn: '特别插画稀有', color: '#ff5c8a', level: 4 },
  HR:  { key: 'HR',  label: 'Hyper Rare', cn: '金卡',  color: '#ffe98a', level: 4 },
};

export function tierOf(card) {
  const r = (card.r || '').toLowerCase();
  if (r.includes('special')) return 'SAR';
  if (r.includes('hyper')) return 'HR';
  if (r.includes('illustration')) return 'AR';
  if (r.includes('ace')) return 'ACE';
  if (r.includes('double')) return 'RR';
  if (r === 'secret rare') return 'UR';
  if (r.includes('ultra')) return 'UR';
  if (r === 'rare' || r.includes('rare')) return 'R';
  if (r.includes('uncommon')) return 'U';
  return 'C';
}

export function buildPools(setData) {
  const pools = {};
  for (const c of setData.cards) {
    const t = tierOf(c);
    (pools[t] ||= []).push(c);
  }
  return pools;
}

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

function pickUnique(pools, tiers, used) {
  const candidates = tiers.flatMap(t => pools[t] || []);
  if (!candidates.length) return null;
  for (let i = 0; i < 12; i++) {
    const c = pick(candidates);
    if (!used.has(c.id)) { used.add(c.id); return c; }
  }
  const c = pick(candidates); used.add(c.id); return c;
}

function weighted(table) {
  const total = table.reduce((s, [, w]) => s + w, 0);
  let roll = Math.random() * total;
  for (const [key, w] of table) { roll -= w; if (roll <= 0) return key; }
  return table[table.length - 1][0];
}

// 反闪槽：以反闪 C/U/R 为主，少量高稀有
const REVERSE_TABLE = [['REV', 83], ['AR', 12], ['UR', 4], ['TOP', 1]];
// 稀有槽（每包最后一张，张张保底 R 以上）
const RARE_TABLE = [['R', 62.4], ['RR', 21], ['ACEUR', 7], ['AR', 7.5], ['SAR', 1.6], ['HR', 0.5]];

function drawReverse(pools, used) {
  const kind = weighted(REVERSE_TABLE);
  if (kind === 'AR') { const c = pickUnique(pools, ['AR'], used); if (c) return { card: c, reverse: false }; }
  if (kind === 'UR') { const c = pickUnique(pools, ['UR'], used); if (c) return { card: c, reverse: false }; }
  if (kind === 'TOP') { const c = pickUnique(pools, ['SAR', 'HR'], used); if (c) return { card: c, reverse: false }; }
  const c = pickUnique(pools, ['C', 'U', 'R'], used);
  return { card: c, reverse: true };
}

function drawRare(pools, used, forceTop = false) {
  if (forceTop) {
    const c = pickUnique(pools, ['SAR', 'HR', 'AR'], used);
    if (c) return { card: c, reverse: false };
  }
  const kind = weighted(RARE_TABLE);
  const map = { R: ['R'], RR: ['RR'], ACEUR: ['ACE', 'UR'], AR: ['AR'], SAR: ['SAR'], HR: ['HR'] };
  const c = pickUnique(pools, map[kind] || ['R'], used) || pickUnique(pools, ['R', 'RR'], used);
  return { card: c, reverse: false };
}

/** 生成一包。包规格由 setData.pack 决定：10 = 4C+3U+2反+1稀；7 = 3C+2U+1反+1稀；5 = 2C+1U+1反+1稀。forceTop = 首包保底 */
export function openPack(setData, pools, { forceTop = false } = {}) {
  const used = new Set();
  const cards = [];
  const size = setData.pack || (setData.lang === 'ja' ? 7 : 10);
  const commons = size === 10 ? 4 : size === 7 ? 3 : 2;
  const uncommons = size === 10 ? 3 : size === 7 ? 2 : 1;
  const reverses = size === 10 ? 2 : 1;
  for (let i = 0; i < commons; i++) cards.push({ card: pickUnique(pools, ['C'], used), reverse: false, slot: 'common' });
  for (let i = 0; i < uncommons; i++) cards.push({ card: pickUnique(pools, ['U'], used), reverse: false, slot: 'uncommon' });
  for (let i = 0; i < reverses; i++) { const d = drawReverse(pools, used); cards.push({ ...d, slot: 'reverse' }); }
  const last = drawRare(pools, used, forceTop);
  cards.push({ ...last, slot: 'rare' });
  return cards.filter(x => x.card);
}

export const fmtPrice = (c) => (c && c.p != null) ? `€${Number(c.p).toFixed(2)}` : '—';
export const imgUrl = (c, hi = false) => (typeof window !== 'undefined' && window.__RIPJOY_IMGS__ && window.__RIPJOY_IMGS__[c.id]) || (c.img && c.img.startsWith('data:') ? c.img : `${c.img}/${hi ? 'high' : 'low'}.png`);
