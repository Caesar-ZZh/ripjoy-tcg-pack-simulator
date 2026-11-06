// RipJoy 开包引擎：真实卡池 + 卡槽概率模型（口径见 docs/PRD.md 第 5 节）
export const TIERS = {
  C:   { key: 'C',   label: 'Common',    cn: '普通',   color: '#9aa7bd', level: 0 },
  U:   { key: 'U',   label: 'Uncommon',  cn: '非普通', color: '#7fd08c', level: 0 },
  R:   { key: 'R',   label: 'Rare',      cn: '稀有闪', color: '#5eb1ff', level: 1 },
  RR:  { key: 'RR',  label: 'Double Rare', cn: '双重稀有', color: '#b78cff', level: 2 },
  ACE: { key: 'ACE', label: 'ACE SPEC',  cn: 'ACE',    color: '#ff7fd0', level: 2 },
  UR:  { key: 'UR',  label: 'Ultra Rare', cn: '超级稀有', color: '#ffd75e', level: 3 },
  SR:  { key: 'SR',  label: 'Ultra Rare', cn: '超级稀有', color: '#ffd75e', level: 3 },
  AR:  { key: 'AR',  label: 'Illustration Rare', cn: '插画稀有', color: '#ff9d5c', level: 3 },
  SAR: { key: 'SAR', label: 'Special Illustration Rare', cn: '特别插画稀有', color: '#ff5c8a', level: 4 },
  HR:  { key: 'HR',  label: 'Hyper Rare', cn: '金卡',  color: '#ffe98a', level: 4 },
  BWR: { key: 'BWR', label: 'Black White Rare', cn: '黑白稀有', color: '#e8e8f2', level: 4 },
  FUR: { key: 'FUR', label: 'Futuristic Rare', cn: '未来稀有', color: '#7af2e8', level: 4 },
  RGB: { key: 'RGB', label: 'RGB Rare', cn: 'RGB稀有', color: '#ff5c5c', level: 4 },
  CLS: { key: 'CLS', label: 'Classic Rare', cn: '经典复刻', color: '#d8b4fe', level: 2 },
  PIKA:{ key: 'PIKA',label: 'Pikachu Foil', cn: '皮卡丘闪卡', color: '#ffd75e', level: 1 },
  NRG: { key: 'NRG', label: 'Basic Energy', cn: '基本能量', color: '#9aa7bd', level: 0 },
};

export function tierOf(card) {
  // 简中 SR 是独立档位（高于 AR、低于 SAR），不能与英文 Ultra Rare（UR）混为一档
  if (card.rk === 'SR') return 'SR';
  const r = (card.r || '').toLowerCase();
  if (r.includes('futuristic')) return 'FUR';
  if (r.includes('rgb')) return 'RGB';
  if (r.includes('classic')) return 'CLS';
  if (r.includes('pikachu')) return 'PIKA';
  if (r.includes('basic energy')) return 'NRG';
  if (r.includes('black white')) return 'BWR';
  if (r.includes('shiny')) return r.includes('ultra') ? 'UR' : 'AR';
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

// 最佳卡顺位（数值越小越优先）：档位 level → 参考价 → 稀有度。
// 稀有度按 rk（简中）或 tier（其余）：SR 高于 AR，AR 高于英文 UR；
// 有价格时价格优先（英文弹行为不变），无价格时才按稀有度排。
const BEST_RANK = { BWR: 0, SAR: 1, RGB: 2, FUR: 3, HR: 4, SR: 5, AR: 6, UR: 7, RR: 8, ACE: 9, CLS: 10, R: 11, PIKA: 12, C: 13, U: 13, NRG: 14 };
export function bestRank(e) {
  const rk = e.card && e.card.rk;
  if (rk && BEST_RANK[rk] != null) return BEST_RANK[rk];
  return BEST_RANK[e.tier] ?? 99;
}
export function bestCmp(a, b) {
  return (b.level || 0) - (a.level || 0) || (b.card.p || 0) - (a.card.p || 0) || (bestRank(a) - bestRank(b));
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
  if (kind === 'TOP') { const c = pickUnique(pools, ['SAR', 'HR', 'BWR'], used); if (c) return { card: c, reverse: false }; }
  const c = pickUnique(pools, ['C', 'U', 'R'], used);
  return { card: c, reverse: true };
}

function drawRare(pools, used) {
  const kind = weighted(RARE_TABLE);
  const map = { R: ['R'], RR: ['RR'], ACEUR: ['ACE', 'UR'], AR: ['AR'], SAR: ['SAR', 'BWR'], HR: ['HR', 'BWR'] };
  const c = pickUnique(pools, map[kind] || ['R'], used) || pickUnique(pools, ['R', 'RR'], used);
  return { card: c, reverse: false };
}

/** 简中官方口径：setData.spec 存在时按官方构成（平卡槽 + 闪卡槽）抽卡。
 *  spec.variants = 构成变体（plain/foil 张数 + 权重）；plainTypes = 平卡档位及种类数；
 *  spec.foilGroups = 闪卡档位组（w 为官方生产配比，组内按种类数比例 roll 档位）。
 *  BALL / MASTER 为虚拟档位：抽一张平卡种类的卡并标记球纹工艺（数据集无独立球纹印刷条目）。
 *  spec.fixedFoil = 后 N 个闪卡位固定抽取的 rk（如 30 周年：皮卡丘、基本能量），
 *  固定位放最后、随机位在前；
 *  随机闪卡位按稀有度升序排列，最高稀有为最后一个随机位（闪卡位）。 */
function openSpecPack(setData) {
  const spec = setData.spec;
  const rkPools = {};
  for (const c of setData.cards) (rkPools[c.rk || tierOf(c)] ||= []).push(c);
  const used = new Set();
  const cards = [];
  const variant = weighted(spec.variants.map(v => [v, v.w]));
  const drawPlainKind = () => {
    const t = weighted(spec.plainTypes);
    return pickUnique(rkPools, [t], used);
  };
  for (let i = 0; i < variant.plain; i++) {
    const c = drawPlainKind();
    if (c) cards.push({ card: c, reverse: false, slot: 'plain' });
  }
  const nFixed = (spec.fixedFoil || []).length;
  const randomFoil = [], fixedFoil = [];
  const slotLevel = (e) => e.lvl != null ? e.lvl : TIERS[tierOf(e.card)].level;
  for (let i = 0; i < variant.foil; i++) {
    // 固定闪卡位（如 30 周年：最后两张固定为皮卡丘、基本能量），不参与组别抽取
    if (spec.fixedFoil && i >= variant.foil - nFixed) {
      const c = pickUnique(rkPools, [spec.fixedFoil[i - (variant.foil - nFixed)]], used);
      if (c) fixedFoil.push({ card: c, reverse: false, slot: 'foil' });
      continue;
    }
    const group = weighted(spec.foilGroups.map(g => [g, g.w]));
    const type = weighted(group.types);
    if (type === 'BALL' || type === 'MASTER') {
      const c = drawPlainKind();
      if (c) randomFoil.push({ card: c, reverse: true, slot: 'foil', foilPattern: type === 'BALL' ? 'ball' : 'master', lvl: type === 'BALL' ? 1 : 2 });
    } else {
      const c = pickUnique(rkPools, [type], used) || drawPlainKind();
      if (c) randomFoil.push({ card: c, reverse: false, slot: 'foil' });
    }
  }
  // 随机闪卡位按稀有度升序：最高稀有放最后一个随机位（闪卡位），第一张永远是普通卡；
  // 只改顺序不改抽取概率。
  randomFoil.sort((a, b) => slotLevel(a) - slotLevel(b));
  cards.push(...randomFoil, ...fixedFoil);
  return cards;
}

/** 生成一包。简中弹优先走 setData.spec 官方口径；其余按 setData.pack 张数：10 = 4C+3U+2反+1稀；7 = 3C+2U+1反+1稀；5 = 2C+1U+1反+1稀。 */
export function openPack(setData, pools) {
  if (setData.spec) return openSpecPack(setData);
  const used = new Set();
  const cards = [];
  const size = setData.pack || (setData.lang === 'ja' ? 7 : 10);
  const commons = size === 10 ? 4 : size === 7 ? 3 : 2;
  const uncommons = size === 10 ? 3 : size === 7 ? 2 : 1;
  const reverses = size === 10 ? 2 : 1;
  for (let i = 0; i < commons; i++) cards.push({ card: pickUnique(pools, ['C'], used), reverse: false, slot: 'common' });
  for (let i = 0; i < uncommons; i++) cards.push({ card: pickUnique(pools, ['U'], used), reverse: false, slot: 'uncommon' });
  for (let i = 0; i < reverses; i++) { const d = drawReverse(pools, used); cards.push({ ...d, slot: 'reverse' }); }
  const last = drawRare(pools, used);
  cards.push({ ...last, slot: 'rare' });
  return cards.filter(x => x.card);
}

export const fmtPrice = (c) => (c && c.p != null) ? `€${Number(c.p).toFixed(2)}` : '—';
// 全高清口径：CDN 卡图一律取 high.png；thumbUrl 仅供托盘/历史等微缩装饰图省流量
export const imgUrl = (c, hi = false) => (hi && c.hiImg) || (typeof window !== 'undefined' && window.__RIPJOY_IMGS__ && window.__RIPJOY_IMGS__[c.id]) || (c.img && c.img.startsWith('data:') ? c.img : `${c.img}/high.png`);
export const thumbUrl = (c) => (typeof window !== 'undefined' && window.__RIPJOY_IMGS__ && window.__RIPJOY_IMGS__[c.id]) || (c.img && c.img.startsWith('data:') ? c.img : `${c.img}/low.png`);
