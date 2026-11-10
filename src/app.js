import { TIERS, tierOf, buildPools, openPack, fmtPrice, imgUrl, thumbUrl, bestCmp } from './engine.js?v=selvedge7';
import { Particles, fxForLevel } from './particles.js?v=selvedge7';
import { sfx, vibrate, VIB, addTilt, setMuted } from './fx.js';
import { BACKS } from './cardbacks.js';

const SETS = [
  { key: 'CSV10.5C', file: 'data/zh-cn-CSV10.5C-m400.json', theme: 'linear-gradient(150deg,#292220,#332A25 55%,#3D322B)', desc: '简体中文版 · 黑白交汇 · 合众 156 宝可梦集结 · 卡图暂用繁中版，4 张训练家卡暂用英文版', chaseNote: '捷克罗姆 ex BWR', sname: '黑雷奔流', lang: 'zh-cn', total: 174, pack: 5, parts: 4, official: true },
  { key: 'CSV10.6C', file: 'data/zh-cn-CSV10.6C-m400.json', theme: 'linear-gradient(150deg,#292220,#332A25 55%,#3D322B)', desc: '简体中文版 · 黑白交汇 · 合众 156 宝可梦集结 · 卡图暂用繁中版，1 张训练家卡暂用英文版', chaseNote: '莱希拉姆 ex BWR', sname: '白焰迸涌', lang: 'zh-cn', total: 174, pack: 5, parts: 4, official: true },
  { key: '30thC', file: 'data/zh-cn-30thC-m400.json', theme: 'linear-gradient(150deg,#292220,#332A25 55%,#3D322B)', desc: '简体中文版 · 30 周年纪念 · 全闪包 · 每包必出 1 张皮卡丘 + 1 张能量 · 2 张 SAR 与能量卡暂用日版图', chaseNote: 'RGB 梦幻 · 梦幻 ex FUR', sname: '30周年庆典', lang: 'zh-cn', total: 176, pack: 6, parts: 4, official: true },
  { key: 'taijing', file: 'data/zh-cn-CSV9.5C-m400.json', theme: 'linear-gradient(150deg,#292220,#332A25 55%,#3D322B)', desc: '简体中文版 · 伊布全家太晶盛聚 · 含简中专属异画', chaseNote: '仙子伊布 ex SAR（简中专属异画）', sname: '太晶盛聚', lang: 'zh-cn', total: 259, pack: 10, parts: 4, official: true },
  { key: 'CSV9C', file: 'data/zh-cn-CSV9C-m400.json', theme: 'linear-gradient(150deg,#292220,#332A25 55%,#3D322B)', desc: '简体中文版 · 晶璃星辉 · 太乐巴戈斯集结', chaseNote: '太乐巴戈斯 ex SAR', sname: '星彩晶璃', lang: 'zh-cn', total: 266, pack: 5, parts: 4, official: true },
  { key: 'CSV8C', file: 'data/zh-cn-CSV8C-m400.json', theme: 'linear-gradient(150deg,#292220,#332A25 55%,#3D322B)', desc: '简体中文版 · 诡幻璀璨 · 桃歹郎一族', chaseNote: '桃歹郎 ex SAR', sname: '璀璨诡幻', lang: 'zh-cn', total: 264, pack: 5, parts: 4, official: true },
  { key: 'CSV7C', file: 'data/zh-cn-CSV7C-m400.json', theme: 'linear-gradient(150deg,#292220,#332A25 55%,#3D322B)', desc: '简体中文版 · 利刃猛醒 · 猛雷鼓咆哮', chaseNote: '猛雷鼓 ex SAR', sname: '利刃猛醒', lang: 'zh-cn', total: 259, pack: 5, parts: 4, official: true },
  { key: '151C', file: 'data/zh-cn-151C-m400.json', theme: 'linear-gradient(150deg,#292220,#332A25 55%,#3D322B)', desc: '简体中文版 · 初代 151 情怀 · 旅望惊聚全集', chaseNote: '喷火龙 ex SAR', sname: '收集啦151', lang: 'zh-cn', total: 192, pack: 5, parts: 4, official: true },
  { key: '151en', file: 'data/en-sv03.5.json', theme: 'linear-gradient(150deg,#292220,#332A25 55%,#3D322B)', desc: '初代 151 情怀弹 · 喷火龙 SAR 大追', chaseNote: '喷火龙 ex SAR', sname: '151', lang: 'en', total: 207, pack: 10 },
  { key: 'sv08.5', file: 'data/en-sv08.5.json', theme: 'linear-gradient(150deg,#292220,#332A25 55%,#3D322B)', desc: '伊布盛宴 · 月亮伊布 ex SAR 天价追卡', chaseNote: '月亮伊布 ex SAR', sname: 'Prismatic Evolutions', lang: 'en', total: 180, pack: 10 },
  { key: 'sv08', file: 'data/en-sv08.json', theme: 'linear-gradient(150deg,#292220,#332A25 55%,#3D322B)', desc: '电光四射 · 皮卡丘 SAR 天价追卡', chaseNote: '皮卡丘 ex SAR', sname: 'Surging Sparks', lang: 'en', total: 252, pack: 10 },
  { key: 'sv09', file: 'data/en-sv09.json', theme: 'linear-gradient(150deg,#292220,#332A25 55%,#3D322B)', desc: '旅途伙伴 · 训练家的宝可梦集结', chaseNote: '莉莉艾的皮皮 ex SAR', sname: 'Journey Together', lang: 'en', total: 190, pack: 10 },
  { key: 'sv10', file: 'data/en-sv10.json', theme: 'linear-gradient(150deg,#292220,#332A25 55%,#3D322B)', desc: '火箭队归来 · 坂木的超梦 ex SAR', chaseNote: '火箭队的超梦 ex SAR', sname: 'Destined Rivals', lang: 'en', total: 244, pack: 10 },
  { key: 'me01', file: 'data/en-me01.json', theme: 'linear-gradient(150deg,#292220,#332A25 55%,#3D322B)', desc: 'MEGA 新时代开启 · 超级进化归来', chaseNote: '超级路卡利欧 ex 金卡', sname: 'Mega Evolution', lang: 'en', total: 188, pack: 10 },
  { key: 'sv05', file: 'data/en-sv05.json', theme: 'linear-gradient(150deg,#292220,#332A25 55%,#3D322B)', desc: '时空之力 · 古代与未来悖谬集结', chaseNote: '铁斑叶 ex SAR', sname: 'Temporal Forces', lang: 'en', total: 218, pack: 10 },
  { key: 'sv10.5b', file: 'data/en-sv10.5b.json', theme: 'linear-gradient(150deg,#292220,#332A25 55%,#3D322B)', desc: '合众黑雷 · BWR 黑白稀有登场', chaseNote: '捷克罗姆 ex BWR', sname: 'Black Bolt', lang: 'en', total: 172, pack: 10 },
  { key: 'sv10.5w', file: 'data/en-sv10.5w.json', theme: 'linear-gradient(150deg,#292220,#332A25 55%,#3D322B)', desc: '合众白焰 · BWR 黑白稀有登场', chaseNote: '莱希拉姆 ex BWR', sname: 'White Flare', lang: 'en', total: 173, pack: 10 },
  { key: 'me02', file: 'data/en-me02.json', theme: 'linear-gradient(150deg,#292220,#332A25 55%,#3D322B)', desc: 'MEGA 第二弹 · 幻影火焰', chaseNote: '超级喷火龙X ex 金卡', sname: 'Phantasmal Flames', lang: 'en', total: 130, pack: 10 },
  { key: 'me02.5', file: 'data/en-me02.5.json', theme: 'linear-gradient(150deg,#292220,#332A25 55%,#3D322B)', desc: 'MEGA 大弹 295 张 · 群雄昇腾', chaseNote: '超级快龙 ex 金卡', sname: 'Ascended Heroes', lang: 'en', total: 295, pack: 10 },
  { key: 'sv04.5', file: 'data/en-sv04.5.json', theme: 'linear-gradient(150deg,#292220,#332A25 55%,#3D322B)', desc: '帕底亚之光 · 闪色宝可梦大集合', chaseNote: '闪色超梦 ex', sname: 'Paldean Fates', lang: 'en', total: 245, pack: 10 },
  { key: 'sv06.5', file: 'data/en-sv06.5.json', theme: 'linear-gradient(150deg,#292220,#332A25 55%,#3D322B)', desc: '黑夜漫游者 · 桃歹郎 ex SAR', chaseNote: '桃歹郎 ex SAR', sname: 'Shrouded Fable', lang: 'en', total: 99, pack: 10 },
  { key: 'sv06', file: 'data/en-sv06.json', theme: 'linear-gradient(150deg,#292220,#332A25 55%,#3D322B)', desc: '变幻假面 · 厄诡椪与忍蛙', chaseNote: '甲贺忍蛙 ex SAR', sname: 'Twilight Masquerade', lang: 'en', total: 226, pack: 10 },
  { key: 'sv07', file: 'data/en-sv07.json', theme: 'linear-gradient(150deg,#292220,#332A25 55%,#3D322B)', desc: '星晶奇迹 · 太乐巴戈斯 ex', chaseNote: '太乐巴戈斯 ex SAR', sname: 'Stellar Crown', lang: 'en', total: 175, pack: 10 },
  { key: 'sv04', file: 'data/en-sv04.json', theme: 'linear-gradient(150deg,#292220,#332A25 55%,#3D322B)', desc: '悖论裂缝 · 古代未来交锋', chaseNote: '铁武者 ex SAR', sname: 'Paradox Rift', lang: 'en', total: 266, pack: 10 },
  { key: 'sv01', file: 'data/en-sv01.json', theme: 'linear-gradient(150deg,#292220,#332A25 55%,#3D322B)', desc: '朱紫起点 · 帕底亚启程', chaseNote: '沙奈朵 ex SAR', sname: 'Scarlet & Violet', lang: 'en', total: 258, pack: 10 },
  { key: 'sv02', file: 'data/en-sv02.json', theme: 'linear-gradient(150deg,#292220,#332A25 55%,#3D322B)', desc: '帕底亚进化 · 奇树 SAR 大追', chaseNote: '奇树 SAR', sname: 'Paldea Evolved', lang: 'en', total: 279, pack: 10 },
  { key: 'sv03', file: 'data/en-sv03.json', theme: 'linear-gradient(150deg,#292220,#332A25 55%,#3D322B)', desc: '黯焰支配者 · 喷火龙 ex', chaseNote: '喷火龙 ex 金卡', sname: 'Obsidian Flames', lang: 'en', total: 230, pack: 10 },
  { key: '151ja', file: 'data/ja-sv2a.json', theme: 'linear-gradient(150deg,#292220,#332A25 55%,#3D322B)', desc: '日版原版 151 · 7 张包 · 镜面闪', chaseNote: 'リザードンex SAR', sname: 'ポケモンカード151', lang: 'ja', total: 210, pack: 7 },
  { key: 'SV9a', file: 'data/ja-SV9a.json', theme: 'linear-gradient(150deg,#292220,#332A25 55%,#3D322B)', desc: '日版热风竞技场 · 5 张包', chaseNote: 'シロナのガブリアスex SAR', sname: '熱風のアリーナ', lang: 'ja', total: 92, pack: 5 },
  { key: 'SV9tw', file: 'data/zh-tw-SV9.json', theme: 'linear-gradient(150deg,#292220,#332A25 55%,#3D322B)', desc: '繁体中文版（台版）· 5 张包 · 数据暂缺 AR/SAR', chaseNote: '莉莉艾的皮皮 ex RR', sname: '對戰搭檔', lang: 'zh-tw', total: 100, pack: 5 },
  { key: 'SV10tw', file: 'data/zh-tw-SV10.json', theme: 'linear-gradient(150deg,#292220,#332A25 55%,#3D322B)', desc: '繁体中文版（台版）· 5 张包 · 数据暂缺 AR/SAR', chaseNote: '火箭队的超梦 ex RR', sname: '火箭隊的榮耀', lang: 'zh-tw', total: 98, pack: 5 },
];
const LANG_LABEL = { en: '英文版', ja: '日版', 'zh-cn': '简体中文版', 'zh-tw': '繁体中文版' };
// 真实卡包包装图（Bulbagarden Archives 官方图）：有图的弹撕包时随机用一种包装；无图的弹用追卡卡面设计
const PACKART = { '151C': ['151C-2.webp'], '151en': ['151en-1.webp'], '151ja': ['151ja-1.webp', '151ja-2.webp'], SV10tw: ['SV10tw-1.webp'], SV9a: ['SV9a-1.webp'], SV9tw: ['SV9tw-1.webp'], me01: ['me01-1.webp', 'me01-2.webp', 'me01-3.webp'], me02: ['me02-1.webp', 'me02-2.webp', 'me02-3.webp'], 'me02.5': ['me02.5-1.webp'], sv01: ['sv01-1.webp', 'sv01-2.webp', 'sv01-3.webp'], sv02: ['sv02-1.webp', 'sv02-2.webp', 'sv02-3.webp'], sv03: ['sv03-1.webp', 'sv03-2.webp', 'sv03-3.webp'], sv04: ['sv04-1.webp', 'sv04-2.webp', 'sv04-3.webp'], 'sv04.5': ['sv04.5-1.webp', 'sv04.5-2.webp', 'sv04.5-3.webp'], sv05: ['sv05-1.webp', 'sv05-2.webp', 'sv05-3.webp'], sv06: ['sv06-1.webp', 'sv06-2.webp'], 'sv06.5': ['sv06.5-1.webp', 'sv06.5-2.webp', 'sv06.5-3.webp'], sv07: ['sv07-1.webp', 'sv07-2.webp', 'sv07-3.webp'], sv08: ['sv08-1.webp', 'sv08-2.webp', 'sv08-3.webp'], 'sv08.5': ['sv08.5-1.webp', 'sv08.5-2.webp', 'sv08.5-3.webp'], sv09: ['sv09-1.webp', 'sv09-2.webp', 'sv09-3.webp'], sv10: ['sv10-1.webp', 'sv10-2.webp', 'sv10-3.webp'], 'sv10.5b': ['sv10.5b-1.webp'], 'sv10.5w': ['sv10.5w-1.webp'], taijing: ['taijing-1.webp'], 'CSV7C': ['CSV7C-1.webp'], 'CSV8C': ['CSV8C-1.webp'], 'CSV9C': ['CSV9C-1.webp'], 'CSV10.5C': ['CSV10.5C-1.webp'], 'CSV10.6C': ['CSV10.6C-1.webp'], '30thC': ['30thC-1.webp'] };
// 包装图分片懒加载：进撕包页前才拉对应分片，首页零负担；单文件版已全内嵌则直接跳过
const PACKART_SRC = { taijing: 1, '151C': 1, '151ja': 1, SV9a: 1, SV9tw: 1, SV10tw: 1, sv01: 1, sv02: 1, sv03: 2, sv04: 2, 'sv04.5': 2, sv05: 2, sv06: 2, 'sv06.5': 3, sv07: 3, sv08: 3, 'sv08.5': 3, sv09: 3, sv10: 4, 'sv10.5b': 4, 'sv10.5w': 4, me01: 4, me02: 4, 'me02.5': 4, '151en': 4, 'CSV7C': 5, 'CSV8C': 5, 'CSV9C': 5, 'CSV10.5C': 5, 'CSV10.6C': 5, '30thC': 5 };
const _paLoading = {};
function ensurePackart(key) {
  const files = PACKART[key]; if (!files) return Promise.resolve();
  const have = window.__PACKART_IMG || {};
  if (files.every(f => have[f])) return Promise.resolve();
  const part = PACKART_SRC[key]; if (!part) return Promise.resolve();
  if (!_paLoading[part]) _paLoading[part] = new Promise(res => { const s = document.createElement('script'); s.src = `src/packart-${part}.js`; s.onload = () => res(); s.onerror = () => res(); document.head.appendChild(s); });
  return _paLoading[part];
}
// 带 rk 的卡（简中弹）按其原始稀有度字母展示：SR 就是 SR，不套用英文 UR 口径
const CN_RARITY_CN = { C: '普通', U: '非普通', R: '稀有闪', RR: '双重稀有', ACE: 'ACE SPEC', SR: '超级稀有', SAR: '特别插画稀有', UR: '金卡', S: '闪色', SSR: '闪色超级稀有', BWR: '黑白稀有', FUR: '未来稀有', RGB: 'RGB稀有', CLS: '经典复刻', PIKA: '皮卡丘闪卡', NRG: '基本能量' };
const dispTier = (c) => c.rk || tierOf(c);
const dispTierLabel = (c) => c.rk ? `${c.rk} · ${CN_RARITY_CN[c.rk] || ''}` : TIERS[tierOf(c)].label;
const packOf = (data) => data.pack || (data.lang === 'ja' ? 7 : 10);
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

/* ---------------- 存档 ---------------- */
const SAVE_KEY = 'ripjoy.save.v1';
let save = { collection: {}, stats: { packs: 0, cards: 0, l3: 0, l4: 0, spent: 0 }, history: [], muted: false };
try { const raw = localStorage.getItem(SAVE_KEY); if (raw) save = { ...save, ...JSON.parse(raw) }; } catch {}
const persist = () => { try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch {} };
setMuted(!!save.muted);

/* ---------------- 数据 ---------------- */
const DATA = {}; const POOLS = {}; const CARDMAP = {}; const LOADP = {};
const CHUNKCACHE = {}; // key -> Array(分片数据|null)：整弹加载失败后重试复用已成功分片，不用全部重下
const CHUNK_MAX_RETRY = 3; // 每片最多尝试次数（含首次）
const CHUNK_CONCURRENCY = 3; // 分片并发上限：15 片并行在手机弱网下极易整弹失败
const FETCH_TIMEOUT_MS = 20000; // 单次拉取超时：裸 fetch 连接卡住后永远不返回、不报错、不重试，进度永停 0/15；超时算一次失败进重试
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
async function fetchJsonRetry(url, attempts = CHUNK_MAX_RETRY) {
  // 单片拉取失败自动重试（600ms、1200ms 退避），多次失败才抛错；每次尝试 20 秒超时
  let lastErr;
  for (let i = 0; i < attempts; i++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
    try {
      const r = await fetch(url, { signal: ctrl.signal });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return await r.json();
    } catch (e) {
      lastErr = e;
      if (i < attempts - 1) await sleep(600 * (i + 1));
    } finally {
      clearTimeout(timer);
    }
  }
  throw lastErr;
}
const CDN_BASE = 'https://cdn.jsdelivr.net/gh/Caesar-ZZh/ripjoy-tcg-pack-simulator@main/';
async function fetchDataJson(rel) {
  // 数据文件走 jsDelivr（中国大陆不开梯子也可达，远好于 github.io），失败自动回落原站；
  // CDN 先试 2 次、原站再试 3 次（每次 20 秒超时），都走 fetchJsonRetry 的重试与退避。
  // jsDelivr 按 @main 分支缓存：瘦身文件用 -slim 新文件名、无旧缓存；万一缓存滞后，
  // 可用 https://purge.jsdelivr.net/gh/Caesar-ZZh/ripjoy-tcg-pack-simulator@main/<path> 清除。
  try { return await fetchJsonRetry(CDN_BASE + rel, 2); }
  catch (e) { return await fetchJsonRetry(rel); }
}
async function fetchChunksLimited(urls, cache, onProgress) {
  // 限流拉取：失败的分片不阻塞其余分片，全部跑完后才统一抛错（以便重试复用已成功分片）
  const total = urls.length;
  let done = 0, failedErr = null;
  for (let i = 0; i < total; i++) if (cache[i]) done++;
  if (onProgress) onProgress(done, total);
  let next = 0;
  const worker = async () => {
    while (true) {
      const idx = next++;
      if (idx >= total) return;
      if (cache[idx]) continue;
      try { cache[idx] = await fetchDataJson(urls[idx]); }
      catch (e) { failedErr = failedErr || e; cache[idx] = null; }
      done++;
      if (onProgress) onProgress(done, total);
    }
  };
  await Promise.all(Array.from({ length: Math.min(CHUNK_CONCURRENCY, total) }, () => worker()));
  if (failedErr) throw failedErr;
  return cache;
}
function loadSet(cfg, onProgress) {
  if (DATA[cfg.key]) return Promise.resolve(DATA[cfg.key]);
  if (LOADP[cfg.key]) return LOADP[cfg.key];
  LOADP[cfg.key] = (async () => {
    const embedded = (typeof window !== 'undefined' && window.__RIPJOY_EMBED__) ? window.__RIPJOY_EMBED__[cfg.file] : null;
    let data = embedded;
    if (!data && cfg.parts) {
      // 简中弹瘦身数据分片（320px 图，单弹约 5.5–8.1MB，单片 <2.4MB）：限流 3 路并发，每片失败自动重试；经 jsDelivr 拉取
      const urls = [cfg.file, ...Array.from({ length: cfg.parts - 1 }, (_, i) => cfg.file.replace('.json', `.p${i + 2}.json`))];
      const cache = CHUNKCACHE[cfg.key] || (CHUNKCACHE[cfg.key] = []);
      const chunks = await fetchChunksLimited(urls, cache, onProgress);
      data = { ...chunks[0], cards: chunks.flatMap(c => c.cards) };
      delete CHUNKCACHE[cfg.key];
    }
    if (!data) data = await fetchDataJson(cfg.file);
    DATA[cfg.key] = data; POOLS[cfg.key] = buildPools(data);
    for (const c of data.cards) CARDMAP[c.id] = { card: c, setKey: cfg.key, setName: data.name };
    return data;
  })().catch(e => { delete LOADP[cfg.key]; throw e; });
  return LOADP[cfg.key];
}

/* ---------------- 内存回收：简中弹数据约 5.5–8.1MB/弹（瘦身后），只留最近一弹 ---------------- */
// 简中弹单弹数据 15–33MB（含 base64 卡图），DATA/POOLS/CARDMAP 三处同引同一批卡对象；
// 以前打开过的弹永不释放，同一标签页多开几弹即堆涨至渲染进程上限崩溃（STATUS_BREAKPOINT，
// 与 2026-10-30 首页预取崩溃同根，只是这次是手动开弹累积而非自动预取）。回选弹页时只留
// 当前弹，其余简中弹整弹释放；收藏册/战绩/图鉴在打开时按需补载（ensureMetaLoaded / loadSet
// 已有此机制），首页资产卡的 kinds 改为直接数 save.collection，不再依赖 CARDMAP。
function evictCnSets(keepKey) {
  for (const cfg of SETS) {
    if (cfg.key === keepKey || !cfg.file.includes('zh-cn')) continue;
    const data = DATA[cfg.key];
    if (!data) continue;
    for (const c of data.cards) delete CARDMAP[c.id];
    delete DATA[cfg.key];
    delete POOLS[cfg.key];
    delete LOADP[cfg.key];
    delete CHUNKCACHE[cfg.key]; // 分片缓存同样释放，否则换弹后仍占着已加载分片的内存
    delete HIDONE[cfg.key];
  }
}
const logoSrc = (data) => !data.logo ? null : (data.logo.startsWith('data:') ? data.logo : `${data.logo}.png`);
// 弹系标志图回退：TCGdex 个别弹（如 sv01）没有 .png 版，只有 .webp；加载失败时换 .webp 再试一次，
// 仍失败则 logoimg 还原为弹系文字名、packlogo 直接隐藏（卡包名另有 .packname 显示）
if (typeof window !== 'undefined') window.addEventListener('error', (e) => {
  const t = e.target;
  if (!t || t.tagName !== 'IMG' || !(t.classList.contains('logoimg') || t.classList.contains('packlogo'))) return;
  if (!t.dataset.fbk && /\.png$/.test(t.src)) { t.dataset.fbk = '1'; t.src = t.src.replace(/\.png$/, '.webp'); return; }
  if (t.classList.contains('logoimg') && t.alt) t.replaceWith(document.createTextNode(t.alt));
  else t.style.display = 'none';
}, true);
const HIDONE = {};
function loadHi(cfg) {
  // 简中弹高清包：主数据只带缩略图，高稀有卡的高清图单独一个文件，进开包/图鉴时按需加载
  if (HIDONE[cfg.key] || !cfg.file.includes('zh-cn') || cfg.parts) return; // 分片弹数据本身即全高清
  if (typeof window !== 'undefined' && window.__RIPJOY_EMBED__) return; // 单文件版内嵌的即是高清原图
  HIDONE[cfg.key] = true;
  fetch(cfg.file.replace('.json', '.hi.json')).then(r => r.ok ? r.json() : null).then(m => {
    if (!m || !DATA[cfg.key]) return;
    for (const c of DATA[cfg.key].cards) if (m[c.id]) c.hiImg = m[c.id];
    if (session?.phase === 'reveal' && session.cfg?.key === cfg.key) {
      const cur = session.pack[session.idx].card;
      const f = document.querySelector('#card3d .face.front img');
      if (f && cur.hiImg) f.src = cur.hiImg;
    }
    if (galKey === cfg.key && $('#view-gallery').classList.contains('active')) renderGallery();
  }).catch(() => { delete HIDONE[cfg.key]; });
}
const chaseOf = (data) => [...data.cards].filter(c => ['SAR', 'HR', 'BWR', 'FUR', 'RGB'].includes(tierOf(c))).sort((a, b) => (b.p || 0) - (a.p || 0))[0]
  || [...data.cards].sort((a, b) => (b.p || 0) - (a.p || 0))[0];
const ownedInSet = (data) => data.cards.filter(c => save.collection[c.id]).length;

/* ---------------- 全局 UI ---------------- */
const particles = new Particles($('#particles'));
function showView(name) {
  $$('.view').forEach(v => v.classList.toggle('active', v.id === `view-${name}`));
  $$('nav button').forEach(b => b.classList.toggle('active', b.dataset.view === name));
  window.scrollTo({ top: 0 });
  if (name === 'collection') { renderCollection(); ensureMetaLoaded(renderCollection); }
  if (name === 'stats') { renderStats(); ensureMetaLoaded(renderStats); }
  if (name === 'market') renderMarket();
  if (name === 'appraise') renderAppraise();
  if (name === 'open') { renderSets(); updateAsset(); ensureMetaLoaded(updateAsset, true); }
}
let metaLoading = false;
const IDP = { 'CSV10.5C': ['CSV10.5C'], 'CSV10.6C': ['CSV10.6C'], '30thC': ['30thC'], taijing: ['CSV9.5C'], CSV9C: ['CSV9C'], CSV8C: ['CSV8C'], CSV7C: ['CSV7C'], '151C': ['151C-惊', '151C-旅', '151C-望', '151C-聚'], '151en': ['sv03.5'], 'sv08.5': ['sv08.5'], sv08: ['sv08'], sv09: ['sv09'], sv10: ['sv10'], me01: ['me01'], sv05: ['sv05'], 'sv10.5b': ['sv10.5b'], 'sv10.5w': ['sv10.5w'], me02: ['me02'], 'me02.5': ['me02.5'], 'sv04.5': ['sv04.5'], 'sv06.5': ['sv06.5'], sv06: ['sv06'], sv07: ['sv07'], sv04: ['sv04'], sv01: ['sv01'], sv02: ['sv02'], sv03: ['sv03'], '151ja': ['SV2a'], SV9a: ['SV9a'], SV9tw: ['SV9'], SV10tw: ['SV10'] };
function setOfCardId(id) {
  let best = null, bestLen = -1;
  for (const cfg of SETS) for (const p of (IDP[cfg.key] || [])) if (id.startsWith(p + '-') && p.length > bestLen) { best = cfg; bestLen = p.length; }
  return best;
}
function ensureMetaLoaded(again, pricedOnly = false) {
  // 收藏册/战绩依赖 CARDMAP：按卡号前缀只补载真正缺的弹系，不再全量加载
  if (metaLoading) return;
  const need = new Map();
  for (const id of Object.keys(save.collection)) {
    if (CARDMAP[id]) continue;
    const cfg = setOfCardId(id);
    if (cfg && !DATA[cfg.key] && (!pricedOnly || cfg.lang !== 'zh-cn')) need.set(cfg.key, cfg);
  }
  if (!need.size) return;
  metaLoading = true;
  // 逐弹串行补载：简中弹约 5.5–8.1MB/弹，并行解析会瞬间堆涨至渲染进程上限崩溃
  // （释放后首次进收藏册需补载多弹时尤其危险）；串行只留一弹的解析峰值
  (async () => {
    for (const c of need.values()) { try { await loadSet(c); } catch {} }
    metaLoading = false; again();
  })();
}
$$('nav button').forEach(b => b.addEventListener('click', () => { sfx.click(); showView(b.dataset.view); }));
$('#muteBtn').addEventListener('click', () => {
  save.muted = !save.muted; setMuted(save.muted); persist();
  $('#muteBtn').textContent = save.muted ? '🔇' : '🔊';
});
$('#muteBtn').textContent = save.muted ? '🔇' : '🔊';

/* ---------------- 选弹页 ---------------- */
let langFilter = 'all';
function applyLangFilter() {
  $$('#setgrid .setcard').forEach(el => { el.style.display = (langFilter === 'all' || el.dataset.lang === langFilter) ? '' : 'none'; });
}
$$('#langSeg button').forEach(b => b.addEventListener('click', () => {
  $$('#langSeg button').forEach(x => x.classList.remove('active')); b.classList.add('active');
  langFilter = b.dataset.lang; sfx.click(); applyLangFilter();
}));
function renderSets() {
  const grid = $('#setgrid'); grid.innerHTML = '';
  let cardIdx = 0;
  for (const cfg of SETS) {
    const el = document.createElement('article');
    el.className = 'setcard';
    el.dataset.lang = cfg.lang;
    el.dataset.key = cfg.key;
    el.style.animationDelay = `${Math.min(cardIdx++ * 45, 540)}ms`;
    el.innerHTML = `
      <div class="setbanner" style="background:${cfg.theme}">
        <h3 style="position:relative;z-index:1" data-fill="bname">${cfg.sname}</h3>
        <span class="bannerload" data-fill="bload">卡池载入中…</span>
      </div>
      <div class="setbody">
        <h3>${cfg.sname} <span style="color:var(--dim2);font-size:12px">${LANG_LABEL[cfg.lang] || cfg.lang} · ${cfg.total} 张</span></h3>
        <p class="setmeta">${cfg.desc}<br><span data-fill="chase">大追：<span class="chase-name">${cfg.chaseNote}</span></span> · 每包 ${cfg.pack} 张${cfg.official ? ' · <b style="color:var(--paper)">官方封入率</b>' : ''}</p>
        <div class="progressline"><i data-fill="bar" style="width:0%"></i></div>
        <p class="setmeta" data-fill="prog">图鉴收集 … / ${cfg.total}</p>
        <div class="setbtns">
          <button class="btn" data-act="one">撕一包</button>
          <button class="btn ghost" data-act="ten">十连开</button>
          <button class="btn ghost" data-act="gal" style="flex:0 0 72px">图鉴墙</button>
        </div>
      </div>`;
    el.querySelector('[data-act="one"]').addEventListener('click', () => startPack(cfg, false));
    el.querySelector('[data-act="ten"]').addEventListener('click', () => startTen(cfg));
    el.querySelector('[data-act="gal"]').addEventListener('click', () => openGallery(cfg.key));
    el.querySelector('.setbanner').addEventListener('click', () => openGallery(cfg.key));
    grid.appendChild(el);
    if (DATA[cfg.key]) fillSetCard(el, cfg);
  }
  applyLangFilter();
  loadMeta().then(() => { $$('#setgrid .setcard').forEach(el => { const cfg = SETS.find(c => c.key === el.dataset.key); if (cfg && !DATA[cfg.key]) fillSetCardMeta(el, cfg); }); });
  const s = save.stats;
  $('#heroStats').innerHTML = s.packs
    ? `已开 <b>${s.packs}</b> 包 · 累计 <b>${s.cards}</b> 张 · 高稀有演出 <b>${s.l3 + s.l4}</b> 次 · 最佳战绩在「战绩」页`
    : `还没开过包 · 撕一包试试手气`;
  prefetchSets();
}
let META = null;
async function loadMeta() {
  if (META) return META;
  const emb = (typeof window !== 'undefined' && window.__RIPJOY_EMBED__) ? window.__RIPJOY_EMBED__['data/meta.json'] : null;
  if (emb) { META = emb; return META; }
  try { META = await fetchDataJson('data/meta.json'); } catch { META = {}; }
  return META;
}
function ownedCountFor(cfg) {
  let n = 0;
  for (const id of Object.keys(save.collection)) if (setOfCardId(id)?.key === cfg.key) n++; // setOfCardId 返回 cfg 对象，不是 key；原写法恒为 false、计数恒为 0
  return n;
}
function fillSetCardMeta(el, cfg) {
  const m = META && META[cfg.key]; if (!el.isConnected) return;
  const bload = el.querySelector('[data-fill="bload"]'); if (bload) bload.remove();
  if (!m) return;
  const banner = el.querySelector('.setbanner');
  if (banner && !banner.querySelector('img.chase')) {
    const ci = document.createElement('img'); ci.className = 'chase'; ci.src = m.chaseThumb; ci.alt = m.chaseName; ci.loading = 'lazy'; ci.onerror = () => { ci.style.opacity = 0; };
    banner.appendChild(ci);
  }
  const chaseEl = el.querySelector('[data-fill="chase"]');
  if (chaseEl) chaseEl.innerHTML = `大追：<span class="chase-name">${m.chaseName}</span>${m.chasePrice != null ? ` 参考价 <b style="color:var(--paper)">€${m.chasePrice.toFixed(2)}</b>` : ''}`;
  const owned = ownedCountFor(cfg);
  const bar = el.querySelector('[data-fill="bar"]'); if (bar) bar.style.width = `${(owned / cfg.total) * 100}%`;
  const prog = el.querySelector('[data-fill="prog"]'); if (prog) prog.textContent = `图鉴收集 ${owned} / ${cfg.total}`;
}
function fillSetCard(el, cfg) {
  const data = DATA[cfg.key]; if (!data || !el.isConnected) return;
  const chase = chaseOf(data);
  const owned = ownedInSet(data);
  const banner = el.querySelector('.setbanner');
  const bname = el.querySelector('[data-fill="bname"]');
  if (data.logo && bname) { const im = document.createElement('img'); im.className = 'logoimg'; im.src = logoSrc(data); im.alt = data.name; im.loading = 'lazy'; bname.replaceWith(im); }
  const bload = el.querySelector('[data-fill="bload"]'); if (bload) bload.remove();
  if (chase && !banner.querySelector('img.chase')) {
    const ci = document.createElement('img'); ci.className = 'chase'; ci.src = thumbUrl(chase); ci.alt = chase.n; ci.loading = 'lazy'; ci.onerror = () => { ci.style.opacity = 0; };
    banner.appendChild(ci);
  }
  const chaseEl = el.querySelector('[data-fill="chase"]');
  if (chaseEl && chase) chaseEl.innerHTML = `大追：<span class="chase-name">${chase.n}</span> 参考价 <b style="color:var(--paper)">${fmtPrice(chase)}</b>`;
  const bar = el.querySelector('[data-fill="bar"]'); if (bar) bar.style.width = `${(owned / data.cards.length) * 100}%`;
  const prog = el.querySelector('[data-fill="prog"]'); if (prog) prog.textContent = `图鉴收集 ${owned} / ${data.cards.length}`;
}
let prefetching = false;
async function prefetchSets() {
  if (prefetching) return; prefetching = true;
  const queue = SETS.filter(c => !c.file.includes('zh-cn')); // 简中弹数据为内嵌 base64 大文件，不做后台预取（曾致渲染进程内存爆涨崩溃），改为按需加载 + meta 轻量填充
  let qi = 0;
  const worker = async () => {
    while (qi < queue.length) {
      // 开包进行中时让行网络与 CPU，等回到选弹页再继续预取
      while (session && session.phase !== 'loading') await new Promise(r => setTimeout(r, 900));
      const cfg = queue[qi++];
      if (DATA[cfg.key]) continue;
      try {
        await loadSet(cfg);
        const el = document.querySelector(`.setcard[data-key="${cfg.key}"]`);
        if (el) fillSetCard(el, cfg);
      } catch {
        const el = document.querySelector(`.setcard[data-key="${cfg.key}"]`);
        const bload = el?.querySelector('[data-fill="bload"]');
        if (bload) { bload.textContent = '载入失败，点此重试'; bload.style.cursor = 'pointer'; bload.onclick = () => { bload.textContent = '卡池载入中…'; loadSet(cfg).then(() => fillSetCard(el, cfg)).catch(() => {}); }; }
      }
    }
  };
  await Promise.all([worker(), worker(), worker(), worker()]);
  prefetching = false;
}

/* ---------------- 本弹图鉴墙 ---------------- */
let galKey = null, galTier = 'all', galOwnedOnly = false;
async function openGallery(key) {
  galKey = key; sfx.click();
  $$('.view').forEach(v => v.classList.toggle('active', v.id === 'view-gallery'));
  $$('nav button').forEach(b => b.classList.remove('active'));
  window.scrollTo({ top: 0 });
  if (!DATA[key]) {
    const cfg = SETS.find(c => c.key === key);
    $('#galTitle').textContent = cfg?.sname || '';
    $('#galCount').textContent = '加载中…';
    $('#galGrid').innerHTML = '<p class="empty">正在加载本弹卡池…</p>';
    try { await loadSet(cfg); } catch { $('#galGrid').innerHTML = '<p class="empty">加载失败，返回选弹后重试</p>'; return; }
    if (galKey !== key) return;
  }
  loadHi(SETS.find(c => c.key === key));
  renderGallery();
}
function renderGallery() {
  const data = DATA[galKey]; if (!data) return;
  $('#galTitle').textContent = data.name;
  $('#galCount').textContent = `已收集 ${ownedInSet(data)} / ${data.cards.length}`;
  const lv = c => TIERS[tierOf(c)].level;
  let cards = [...data.cards].sort((a, b) => lv(b) - lv(a) || (b.p || 0) - (a.p || 0) || String(a.no).localeCompare(String(b.no), undefined, { numeric: true }));
  if (galTier === 'TOP') cards = cards.filter(c => lv(c) >= 3);
  else if (galTier === 'SAR') cards = cards.filter(c => ['SAR', 'HR', 'BWR', 'FUR', 'RGB'].includes(tierOf(c)));
  else if (galTier === 'UR') cards = cards.filter(c => ['UR', 'ACE', 'SR'].includes(tierOf(c)));
  else if (galTier === 'RR') cards = cards.filter(c => tierOf(c) === 'RR');
  else if (galTier === 'R') cards = cards.filter(c => lv(c) <= 1);
  if (galOwnedOnly) cards = cards.filter(c => save.collection[c.id]);
  $('#galGrid').innerHTML = cards.length ? cards.map((c, i) => {
    const own = save.collection[c.id];
    return `<figure data-id="${c.id}" class="${own ? '' : 'notowned'}" style="animation-delay:${Math.min(i * 16, 480)}ms">
      <img src="${imgUrl(c)}" alt="${c.n}" loading="lazy" decoding="async" onerror="this.style.opacity=0">
      ${own ? `<span class="countbadge">×${own.n}</span>` : ''}
      <figcaption><span class="rdot" style="background:${TIERS[tierOf(c)].color}"></span><b>${c.n}</b><br>${dispTier(c)} · ${fmtPrice(c)}${own ? '' : ' · 未拥有'}</figcaption>
    </figure>`;
  }).join('') : '<p class="empty">这个筛选下还没有卡<br>换个筛选，或先去开几包</p>';
  $$('#galGrid figure').forEach(f => f.addEventListener('click', () => openDetail(CARDMAP[f.dataset.id].card)));
}
$('#galBack').addEventListener('click', () => { evictCnSets(galKey); showView('open'); });
$$('#galSeg button').forEach(b => b.addEventListener('click', () => { $$('#galSeg button').forEach(x => x.classList.remove('active')); b.classList.add('active'); galTier = b.dataset.tier; renderGallery(); }));
$('#galOwnedOnly').addEventListener('change', (e) => { galOwnedOnly = e.target.checked; renderGallery(); });

/* ---------------- 开包会话 ---------------- */
let session = null;
function collect(entry) {
  const { card } = entry; const t = tierOf(card); const lv = TIERS[t].level;
  const isNew = !save.collection[card.id];
  save.collection[card.id] = { n: (save.collection[card.id]?.n || 0) + 1 };
  save.stats.cards++; if (lv === 3) save.stats.l3++; if (lv >= 4) save.stats.l4++;
  return isNew;
}
function finishPackToHistory(cfg, pack) {
  const best = [...pack].sort(bestCmp)[0];
  save.stats.packs++;
  save.history.unshift({ ts: Date.now(), setKey: cfg.key, setName: DATA[cfg.key].name, n: pack.length, bestId: best.card.id, bestName: best.card.n, bestPrice: best.card.p, bestTier: dispTier(best.card) });
  save.history = save.history.slice(0, 30); persist();
}

async function ensureStageData(cfg, retryFn) {
  if (DATA[cfg.key]) return true;
  session = { cfg, phase: 'loading' };
  showStage();
  $('#stageTitle').textContent = cfg.sname;
  const total = cfg.parts || 1;
  const renderLoading = (done) => {
    $('#stageBody').innerHTML = `<div class="empty" style="padding-top:70px">正在加载「${cfg.sname}」卡池${total > 1 ? ` ${done}/${total}` : ''}…<br><span style="font-size:12.5px">首次打开需下载该弹数据，之后秒开</span></div>`;
  };
  renderLoading(0);
  try { await loadSet(cfg, (done) => { if (session?.phase === 'loading') renderLoading(done); }); } catch {
    if (session?.phase === 'loading') $('#stageBody').innerHTML = `<div class="empty" style="padding-top:70px">卡池加载失败，网络不太稳<br><span style="font-size:12.5px">已加载的分片会保留，重试不用全部重下</span><br><button class="btn" id="loadRetryBtn" style="margin-top:18px;flex:none;padding:12px 28px">重试加载</button><br><span style="font-size:12.5px">点左上角「← 选弹」返回，稍后再试</span></div>`;
    const rb = $('#loadRetryBtn');
    if (rb && retryFn) rb.addEventListener('click', () => { sfx.click(); retryFn(); });
    return false;
  }
  return !!session && session.phase === 'loading';
}
async function startPack(cfg, isRetry) {
  closeSvOverlay();
  if (!DATA[cfg.key] && !(await ensureStageData(cfg, () => startPack(cfg, true)))) return;
  await ensurePackart(cfg.key);
  await ensureSmoke();
  loadHi(cfg);
  const data = DATA[cfg.key];
  const pack = openPack(data, POOLS[cfg.key]);
  pack.forEach(e => { e.isNew = collect(e); e.tier = tierOf(e.card); e.level = e.lvl != null ? e.lvl : TIERS[e.tier].level; });
  finishPackToHistory(cfg, pack);
  session = { cfg, pack, idx: 0, revealed: false, phase: 'tear' };
  showStage();
  $('#stageTitle').textContent = data.name;
  renderTear();
}

async function startTen(cfg) {
  closeSvOverlay();
  if (!DATA[cfg.key] && !(await ensureStageData(cfg, () => startTen(cfg)))) return;
  await ensurePackart(cfg.key);
  await ensureSmoke();
  loadHi(cfg);
  const data = DATA[cfg.key];
  const packs = [];
  for (let i = 0; i < 10; i++) {
    const pack = openPack(data, POOLS[cfg.key]);
    pack.forEach(e => { e.isNew = collect(e); e.tier = tierOf(e.card); e.level = e.lvl != null ? e.lvl : TIERS[e.tier].level; });
    finishPackToHistory(cfg, pack); packs.push(pack);
  }
  session = { cfg, pack: packs[0], idx: 0, revealed: false, phase: 'tear', tenPacks: packs, packNo: 1 };
  showStage();
  $('#stageTitle').textContent = data.name;
  renderTear();
}
function summaryForCurrent() {
  if (!session) return;
  session.phase = 'summary';
  if (session.tenPacks) renderPackSummary(); else renderSummary();
}
function grandSummary() {
  const all = session.tenPacks.flat();
  session.pack = all; session.ten = true; session.phase = 'summary';
  renderSummary();
  const hasTop = all.some(e => e.level >= 4);
  const hasL3 = all.some(e => e.level === 3);
  if (hasTop || hasL3) {
    const cx = innerWidth / 2, cy = innerHeight * 0.36;
    setTimeout(() => { fxForLevel(particles, hasTop ? 4 : 3, cx, cy); sfx.reveal(hasTop ? 4 : 3); vibrate(hasTop ? VIB.l4 : VIB.l3); if (hasTop) flash(); }, 250);
  }
}
function nextPackOrGrand() {
  closeSvOverlay();
  if (session.packNo < 10) {
    session.packNo++;
    session.pack = session.tenPacks[session.packNo - 1];
    session.idx = 0; session.revealed = false; session.phase = 'tear';
    renderTear(); window.scrollTo({ top: 0 });
  } else grandSummary();
}
/* ---------------- Selvedge 揭晓屏：全屏遮罩 ---------------- */
// 烟雾图懒加载（src/smoke.js，Pexels cottonbro 9694216 黑烟云团，base64 内嵌）
let _smokeLoading = null;
function ensureSmoke() {
  if (window.__SMOKE_IMG) return Promise.resolve();
  if (!_smokeLoading) _smokeLoading = new Promise(res => { const sc = document.createElement('script'); sc.src = 'src/smoke.js'; sc.onload = () => res(); sc.onerror = () => res(); document.head.appendChild(sc); });
  return _smokeLoading;
}
function closeSvOverlay() {
  const ov = document.querySelector('.sv-overlay');
  if (ov) ov.remove();
  document.body.style.overflow = '';
}
// Selvedge 结算：淡腮红外壳 + 大字标题 + 深色大卡（烟雾渐隐）+ 1 张最佳 + 一行无字配角 + 纯白胶囊主按钮
// rest 超过 9 张时只取前 9 张进配角行，其余由 allGrid（十连总汇算）在面板下方全量展示
function renderSelvedgeSummary({ title, sub, best, rest, primaryLabel, onPrimary, secondary = [], allGrid = null }) {
  closeSvOverlay();
  const ov = document.createElement('div');
  ov.className = 'sv-overlay';
  const smoke = window.__SMOKE_IMG ? `<img src="${window.__SMOKE_IMG}" alt="">` : '';
  const strip = rest.slice(0, 9);
  ov.innerHTML = `
    <h1 class="sv-title">${title}</h1>
    <p class="sv-sub">${sub}</p>
    <div class="sv-panel">
      <div class="sv-smoke">${smoke}<div class="sv-soft"></div></div>
      <div class="sv-best"><img src="${imgUrl(best.card, true)}" alt="${best.card.n}" data-id="${best.card.id}"></div>
      <div class="sv-support">${strip.map(e => `<img src="${thumbUrl(e.card)}" alt="" data-id="${e.card.id}" loading="lazy" decoding="async">`).join('')}</div>
      <button class="sv-pill" id="svPrimary">${primaryLabel}</button>
      <div class="sv-links">${secondary.map((s2, i) => `<button data-i="${i}">${s2.label}</button>`).join('')}</div>
    </div>
    ${allGrid ? `<div class="sv-allgrid">${allGrid}</div>` : ''}`;
  document.body.appendChild(ov);
  document.body.style.overflow = 'hidden';
  ov.querySelector('.sv-best img').addEventListener('click', () => openDetail(best.card));
  ov.querySelectorAll('.sv-support img').forEach(im => im.addEventListener('click', () => { const c = CARDMAP[im.dataset.id]; if (c) openDetail(c.card); }));
  if (allGrid) ov.querySelectorAll('.sv-allgrid img').forEach(im => im.addEventListener('click', () => { const c = CARDMAP[im.dataset.id]; if (c) openDetail(c.card); }));
  ov.querySelector('#svPrimary').addEventListener('click', onPrimary);
  ov.querySelectorAll('.sv-links button').forEach(b => b.addEventListener('click', (ev) => secondary[+b.dataset.i].fn(ev.currentTarget)));
}

function renderPackSummary() {
  const { cfg, pack, packNo } = session; const data = DATA[cfg.key];
  const sorted = [...pack].sort(bestCmp);
  const best = sorted[0];
  const total = pack.reduce((s, e) => s + (e.card.p || 0), 0);
  const news = pack.filter(e => e.isNew).length;
  const badge = best.level >= 4 ? ' · 🎉 神抽！' : best.level === 3 ? ' · ✨ 出货！' : '';
  const secondary = [];
  if (packNo < 10) secondary.push({ label: '跳过剩余包，直接看总汇算 →', fn: () => grandSummary() });
  secondary.push({ label: '收藏册', fn: () => { exitStageSilent(); showView('collection'); } });
  secondary.push({ label: '← 选弹', fn: () => exitStage() });
  renderSelvedgeSummary({
    title: '你开出了',
    sub: `十连 · 第 ${packNo} / 10 包 · ${data.name} · 参考价合计 <b>${pack.some(e => e.card.p != null) ? `€${total.toFixed(2)}` : '—'}</b> · 新卡 <b>${news}</b> 张${badge}`,
    best, rest: sorted.slice(1),
    primaryLabel: packNo < 10 ? `下一包 · 第 ${packNo + 1} / 10 包` : '看总汇算 🎉',
    onPrimary: () => nextPackOrGrand(),
    secondary,
  });
}
function showStage() {
  $$('.view').forEach(v => v.classList.remove('active'));
  $('#view-open').classList.add('active'); window.scrollTo({ top: 0 });
  $('#stage').style.display = 'block'; $('#setgridWrap').style.display = 'none';
  if (session?.cfg) $('#stage').style.setProperty('--amb', session.cfg.theme);
}
function exitStage() {
  closeSvOverlay();
  particles.ambientOff();
  evictCnSets(session?.cfg?.key);
  $('#stage').style.display = 'none'; $('#setgridWrap').style.display = 'block';
  session = null; renderSets();
}
$('#backBtn').addEventListener('click', exitStage);
$('#oddsLink').addEventListener('click', () => showView('stats'));

function renderTear() {
  const { cfg } = session; const data = DATA[cfg.key]; const chase = chaseOf(data);
  const arts = PACKART[cfg.key];
  const artFile = arts ? arts[Math.floor(Math.random() * arts.length)] : null;
  const art = artFile ? ((window.__PACKART_IMG || {})[artFile] || `assets/packs/${artFile}`) : null;
  const packImg = art || imgUrl(chase, true);
  const st = $('#stageBody');
  st.innerHTML = `
    <div class="packwrap" id="packEl">
      <div class="packtop"><img src="${packImg}" alt=""></div>
      <div class="pack${art ? ' realpack' : ''}">
        <img class="packart" src="${packImg}" alt="${art ? data.name + '卡包' : chase.n}" onerror="this.style.opacity=0">
        <div class="packshade"></div><div class="packtear"></div>
        ${data.logo ? `<img class="packlogo" src="${logoSrc(data)}" alt="">` : ''}
        <div class="packname">${data.name}</div>
        <div class="packsub">${packOf(data)} CARDS PER PACK · RipJoy</div>
      </div>
    </div>
    <p class="stagehint">${session.tenPacks ? `<b>十连 · 第 ${session.packNo} / 10 包</b><br>` : ''}点一下卡包，<b>撕开它</b><br><span style="font-size:12.5px">翻卡前留意卡背的光晕——光晕越亮，下一张越有货</span></p>
    <div class="stagebtns"><button class="btn" id="tearBtn">✂️ 撕 开</button>${session.tenPacks ? '<button class="btn ghost" id="skipTearBtn" style="flex:0 0 108px">直接翻卡</button>' : ''}</div>`;
  // 包装图加载失败（如单文件版无附带资源）时回退到追卡卡面设计
  if (art) {
    const pa = st.querySelector('.packart');
    pa.addEventListener('error', () => { pa.src = imgUrl(chase, true); pa.alt = chase.n; st.querySelector('.packtop img').src = imgUrl(chase, true); st.querySelector('.pack').classList.remove('realpack'); }, { once: true });
  }
  // 撕包阶段把整包高清图预加载完，翻卡时零等待
  if (session.pack) for (const e of session.pack) { const im = new Image(); im.src = imgUrl(e.card, true); }
  const tear = () => {
    if (!session || session.phase !== 'tear') return;
    session.phase = 'tearing';
    const packEl = $('#packEl');
    packEl.classList.add('tearing'); sfx.tear(); vibrate(30);
    const pr = packEl.getBoundingClientRect();
    particles.ambientOff();
    particles.shards(pr.left + pr.width / 2, pr.top + pr.height * 0.07);
    setTimeout(() => { session.phase = 'reveal'; renderReveal(); }, 980);
  };
  $('#packEl').addEventListener('click', tear);
  $('#tearBtn').addEventListener('click', tear);
  const sk = $('#skipTearBtn');
  if (sk) sk.addEventListener('click', () => { if (session?.phase === 'tear') { particles.ambientOff(); session.phase = 'reveal'; renderReveal(); } });
  particles.ambientOn($('#packEl'));
}

/* ---------------- 逐张揭晓 ---------------- */
function renderReveal() {
  const { pack, idx } = session;
  const entry = pack[idx]; const next = pack[idx + 1];
  const st = $('#stageBody');
  const dots = pack.map((e, i) => `<i class="${i < idx ? 'done' : i === idx ? (e.level >= 3 ? 'hot' : 'now') : ''}"></i>`).join('');
  st.innerHTML = `
    <div class="revealmeta">${session.tenPacks ? `<span class="packbadge">第 ${session.packNo} / 10 包</span>` : ''}<div class="dots">${dots}</div><span class="revealcount">${idx + 1} / ${pack.length}</span></div>
    <div class="cardstage leak-${entry.level}" id="cardStage">
      ${entry.level >= 4 ? '<div class="rays" id="raysEl"></div>' : ''}
      <div class="glowrap"></div>
      <div class="card3d" id="card3d" style="--flip:0deg">
        <div class="face backface hasback" style="background-image:url(${BACKS[session.cfg.lang === 'ja' ? 'ja' : 'intl']})"><div class="ring"></div><div class="backword">POKÉMON</div><div class="backsub">TRADING CARD GAME</div></div>
        <div class="face front"><img src="${imgUrl(entry.card, true)}" alt="${entry.card.n}" draggable="false">
          <div class="foil ${entry.tier === 'HR' ? 'gold' : entry.reverse ? 'reverse' : entry.level >= 1 ? 'holo' : ''}"></div>
        </div>
      </div>
      <div class="cardshadow"></div>
      <div class="raritybanner" id="banner"></div>
    </div>
    <div class="cardinfo" id="cardInfo"><p style="color:var(--dim);font-size:14px">点卡片翻开${next ? '' : ' · 最后一张，深呼吸'}</p></div>
    <div class="stagebtns">
      <button class="btn ghost" id="skipBtn">全部揭晓</button>
      <button class="btn violet" id="nextBtn">翻 卡</button>
    </div>
    <div class="tray" id="tray"></div>`;
  session.revealed = false;
  renderTray();
  const card3d = $('#card3d'); if (matchMedia('(pointer:fine)').matches) addTilt(card3d, 9);
  const doFlip = () => flipCurrent();
  card3d.addEventListener('click', () => { session.revealed ? advance() : doFlip(); });
  $('#nextBtn').addEventListener('click', () => { session.revealed ? advance() : doFlip(); });
  $('#skipBtn').addEventListener('click', () => { summaryForCurrent(); });
}
function renderTray() {
  const tray = $('#tray'); if (!tray || !session) return;
  const shown = session.pack.slice(0, session.idx + (session.revealed ? 1 : 0));
  const bestP = Math.max(...session.pack.map(e => e.card.p || 0));
  tray.innerHTML = shown.map(e => `<img src="${thumbUrl(e.card)}" class="${(e.card.p || 0) === bestP && e.level >= 2 ? 'best' : ''}" alt="${e.card.n}">`).join('');
}
function flipCurrent() {
  if (!session || session.revealed || session.phase !== 'reveal') return;
  session.revealed = true;
  const entry = session.pack[session.idx];
  const card3d = $('#card3d'); const stage = $('#cardStage');
  stage.classList.remove(`leak-${entry.level}`);
  stage.classList.add('pop'); setTimeout(() => stage.classList.remove('pop'), 860);
  card3d.classList.add(entry.level >= 4 ? 'slowflip' : 'flipping');
  card3d.style.setProperty('--flip', '180deg');
  setTimeout(() => card3d.classList.add('flipped'), entry.level >= 4 ? 480 : 360); // 翻到侧面时切掉背面可见性，绕开 iOS Safari 的 backface 失效
  card3d.classList.add(`glow-${entry.level}`);
  sfx.flip(); vibrate(VIB.flip);
  const rect = card3d.getBoundingClientRect(); const cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
  setTimeout(() => {
    if (entry.level >= 2) {
      fxForLevel(particles, entry.level, cx, cy);
      sfx.reveal(entry.level);
      vibrate(entry.level >= 4 ? VIB.l4 : entry.level === 3 ? VIB.l3 : VIB.l2);
      if (entry.level >= 4) flash();
      const banner = $('#banner');
      if (banner) {
        banner.textContent = entry.card.rk === 'UR' ? '✦ UR · 金卡 ✦' : entry.tier === 'HR' ? '✦ HYPER RARE · 金卡 ✦' : entry.tier === 'SAR' ? '✦ SAR · 特别插画稀有 ✦' : `${dispTier(entry.card)} · ${entry.card.rk ? (CN_RARITY_CN[entry.card.rk] || '') : TIERS[entry.tier].cn}`;
        banner.style.background = '#F2E7E0';
        banner.style.color = '#292220';
        banner.classList.add('pop');
      }
    } else if (entry.level === 1) { fxForLevel(particles, 1, cx, cy); sfx.reveal(1); sfx.sparkle(); }
    if (entry.level >= 4) { const r = $('#raysEl'); if (r) r.classList.add('on'); }
    const nb = $('#nextBtn'); if (nb) nb.textContent = session.idx === session.pack.length - 1 ? '看结算' : '下一张';
  }, entry.level >= 4 ? 520 : 330);
  const t = TIERS[entry.tier];
  $('#cardInfo').innerHTML = `
    <div class="cname">${entry.card.n}<span class="tierbadge">${dispTier(entry.card)}</span>${entry.foilPattern === 'ball' ? '<span class="revtag">精灵球纹样</span>' : entry.foilPattern === 'master' ? '<span class="revtag">大师球纹样</span>' : entry.reverse ? '<span class="revtag">反闪</span>' : ''}${entry.isNew ? '<span class="newtag">NEW</span>' : ''}</div>
    <div class="cmeta">No.${entry.card.no} · ${dispTierLabel(entry.card)} · 参考价 <b style="color:var(--paper)">${fmtPrice(entry.card)}</b>${entry.card.ill ? ` · 画师 ${entry.card.ill}` : ''} · 点卡片看大图，点「下一张」继续</div>`;
  $('#cardInfo').addEventListener('click', () => openDetail(entry.card));
  renderTray();
}
function advance() {
  if (!session) return;
  if (session.idx >= session.pack.length - 1) { summaryForCurrent(); return; }
  session.idx++; renderReveal();
}
function flash() { const f = $('#flash'); f.classList.add('on'); setTimeout(() => f.classList.remove('on'), 260); }

/* ---------------- 结算 ---------------- */
function renderSummary() {
  const { cfg, pack, ten } = session; const data = DATA[cfg.key];
  const sorted = [...pack].sort(bestCmp);
  const best = sorted[0];
  const total = pack.reduce((s, e) => s + (e.card.p || 0), 0);
  const news = pack.filter(e => e.isNew).length;
  const topHits = [...new Set(sorted.filter(e => e.level >= 4).map(e => dispTier(e.card)))];
  const badge = best.level >= 4 ? ' · 🎉 神抽！' : best.level === 3 ? ' · ✨ 出货！' : '';
  const reportFn = async (btn) => {
    if (btn) { btn.textContent = '生成中…'; btn.disabled = true; }
    const pp = packPrices[cfg.lang];
    const roi = (pp && pack.some(e => typeof e.card.p === 'number')) ? Math.round(100 * total / (pp * (ten ? 10 : 1))) : null;
    await showReport(await makeReport({ cfg, best: best, n: pack.length, total: pack.some(e => typeof e.card.p === 'number') ? total : null, roi, ten, ts: Date.now() }));
    if (btn) { btn.textContent = '生成战报'; btn.disabled = false; }
  };
  const secondary = [
    { label: '生成战报', fn: reportFn },
    { label: '收藏册', fn: () => { exitStageSilent(); showView('collection'); } },
    { label: '← 选弹', fn: () => exitStage() },
  ];
  renderSelvedgeSummary({
    title: '你开出了',
    sub: ten
      ? `十连 · 共 ${pack.length} 张 · 参考价合计 <b>${pack.some(e => e.card.p != null) ? `€${total.toFixed(2)}` : '—'}</b> · 新卡 <b>${news}</b> 张${topHits.length ? ` · <b>含 ${topHits.join('/')}！</b>` : ''}${roiText(cfg, total, ten)}${badge}`
      : `${data.name} · 参考价合计 <b>${pack.some(e => e.card.p != null) ? `€${total.toFixed(2)}` : '—'}</b> · 新卡 <b>${news}</b> 张${roiText(cfg, total, ten)}${badge}`,
    best, rest: sorted.slice(1),
    primaryLabel: ten ? '再来十连' : '再来一包',
    onPrimary: () => { ten ? startTen(cfg) : startPack(cfg); },
    secondary,
    allGrid: ten ? sorted.map(e => `<img src="${thumbUrl(e.card)}" alt="" data-id="${e.card.id}" loading="lazy" decoding="async">`).join('') : null,
  });
}
function exitStageSilent() { closeSvOverlay(); particles.ambientOff(); evictCnSets(session?.cfg?.key); $('#stage').style.display = 'none'; $('#setgridWrap').style.display = 'block'; session = null; }

/* ---------------- 收藏册 ---------------- */
let collSet = 'all', collTier = 'all';
function renderCollection() {
  const sel = $('#collSetSel');
  if (!sel.options.length) {
    sel.innerHTML = `<option value="all">全部弹系</option>` + SETS.map(c => `<option value="${c.key}">${DATA[c.key]?.name || c.key}</option>`).join('');
    sel.addEventListener('change', () => { collSet = sel.value; renderCollection(); });
    $$('#collSeg button').forEach(b => b.addEventListener('click', () => { $$('#collSeg button').forEach(x => x.classList.remove('active')); b.classList.add('active'); collTier = b.dataset.tier; renderCollection(); }));
  }
  const owned = Object.entries(save.collection).map(([id, v]) => ({ ...CARDMAP[id], n: v.n })).filter(x => x.card);
  const filtered = owned.filter(x => (collSet === 'all' || x.setKey === collSet) && (collTier === 'all' || tierOf(x.card) === collTier || (collTier === 'TOP' && TIERS[tierOf(x.card)].level >= 3)));
  filtered.sort((a, b) => TIERS[tierOf(b.card)].level - TIERS[tierOf(a.card)].level || (b.card.p || 0) - (a.card.p || 0));
  const totalCards = SETS.reduce((s, c) => s + (c.total || 0), 0); // 用申报总数，不依赖已加载的 DATA（简中弹释放后 DATA 不全）
  $('#collSummary').innerHTML = `
    <div class="statcard"><div class="v">${owned.length}<span style="font-size:13px;color:var(--dim)"> / ${totalCards}</span></div><div class="k">已收集图鉴</div></div>
    <div class="statcard"><div class="v">${save.stats.cards}</div><div class="k">累计开出（含重复）</div></div>
    <div class="statcard"><div class="v">${owned.filter(x => TIERS[tierOf(x.card)].level >= 3).length}</div><div class="k">AR 以上藏品</div></div>`;
  $('#collSummary').insertAdjacentHTML('beforeend', `<div class="statcard"><div class="v">€${collectionValue().v.toFixed(2)}</div><div class="k">收藏估值（参考价）</div></div>`);
  $('#collGrid').innerHTML = filtered.length ? filtered.map(x => {
    const t = tierOf(x.card);
    return `<figure data-id="${x.card.id}"><span class="countbadge">×${x.n}</span><img src="${imgUrl(x.card)}" alt="${x.card.n}" loading="lazy" decoding="async"><figcaption><span class="rdot" style="background:${TIERS[t].color}"></span><b>${x.card.n}</b><br>${dispTier(x.card)} · ${fmtPrice(x.card)}</figcaption></figure>`;
  }).join('') : `<div class="empty" style="grid-column:1/-1">这里还没有卡<br>去撕一包，把第一张 SAR 带回来</div>`;
  $$('#collGrid figure').forEach(f => f.addEventListener('click', () => openDetail(CARDMAP[f.dataset.id].card)));
}

/* ---------------- 行情 / 期望值 ---------------- */
const PP_KEY = 'ripjoy.packprice.v1';
const packPrices = { en: 5.49, ja: 2.50, 'zh-tw': 4.00 };
try { Object.assign(packPrices, JSON.parse(localStorage.getItem(PP_KEY) || '{}')); } catch {}
const evCache = {};
const LANGNAME = { 'zh-cn': '简中', en: 'EN', ja: '日版', 'zh-tw': '繁中' };
function priceCoverage(data) {
  const priced = data.cards.filter(c => typeof c.p === 'number' && c.p > 0).length;
  const topOk = data.cards.filter(c => ['SAR', 'HR', 'BWR'].includes(tierOf(c))).every(c => typeof c.p === 'number' && c.p > 0);
  return { share: priced / data.cards.length, topOk };
}
async function computeEV(cfg, sims = 4000) {
  if (evCache[cfg.key]) return evCache[cfg.key];
  const data = await loadSet(cfg);
  const cov = priceCoverage(data);
  if (cov.share < 0.9 || !cov.topOk) { evCache[cfg.key] = { ineligible: true, share: cov.share }; return evCache[cfg.key]; }
  const pools = buildPools(data);
  const vals = []; let topPacks = 0;
  for (let i = 0; i < sims; i++) {
    const p = openPack(data, pools, {});
    let v = 0, top = false;
    for (const e of p) { if (typeof e.card.p === 'number') v += e.card.p; if (['SAR', 'HR', 'BWR'].includes(tierOf(e.card))) top = true; }
    vals.push(v); if (top) topPacks++;
  }
  vals.sort((a, b) => a - b);
  const res = { vals, ev: vals.reduce((a, b) => a + b, 0) / sims, median: vals[sims >> 1], pTop: topPacks / sims };
  res.expPacks = res.pTop > 0 ? 1 / res.pTop : null;
  evCache[cfg.key] = res; return res;
}
const pReturn = (r, pp) => (pp && r.vals) ? r.vals.filter(v => v >= pp).length / r.vals.length : null;
function roiText(cfg, total, ten) {
  const pp = packPrices[cfg.lang];
  if (!pp || !DATA[cfg.key] || !DATA[cfg.key].cards.some(c => typeof c.p === 'number')) return '';
  return ` · 回报率 <b>${Math.round(100 * total / (pp * (ten ? 10 : 1)))}%</b>（参考包价 €${pp}）`;
}
function fillMarketRow(cfg, r) {
  const body = $(`#mrow-${cfg.key} [data-body]`); if (!body) return;
  if (r.ineligible) { body.innerHTML = `<span class="mna">价格覆盖不足（${Math.round(r.share * 100)}%），不计算</span>`; return; }
  const pp = packPrices[cfg.lang];
  const pr = pReturn(r, pp);
  body.innerHTML = `<div class="mstats">
    <div><b>€${r.ev.toFixed(2)}</b><span>期望卡值 / 包</span></div>
    <div><b>€${r.median.toFixed(2)}</b><span>中位卡值</span></div>
    <div><b>${pr != null ? Math.round(pr * 100) + '%' : '—'}</b><span>回本概率（包价 €${pp}）</span></div>
    <div><b>${r.expPacks ? '约 ' + r.expPacks.toFixed(0) + ' 包' : '—'}</b><span>出一张 SAR / 金卡</span></div>
  </div>`;
  const meta = $(`.setcard[data-key="${cfg.key}"] .setmeta`); if (meta && !meta.dataset.ev) { meta.dataset.ev = '1'; meta.insertAdjacentHTML('beforeend', ` · 期望 <b style="color:var(--paper)">€${r.ev.toFixed(2)}</b>/包`); }
}
function renderMarket() {
  for (const lang of ['en', 'ja', 'zh-tw']) { const inp = $('#pp-' + lang); if (inp && document.activeElement !== inp) inp.value = packPrices[lang]; }
  const rows = $('#marketRows');
  rows.innerHTML = SETS.map(cfg => `<div class="mrow" id="mrow-${cfg.key}">
    <div class="mhead"><b>${cfg.sname || cfg.key}</b><span class="mtag">${LANGNAME[cfg.lang] || cfg.lang}</span>${cfg.official ? '<span class="mtag gold">官方封入率</span>' : ''}</div>
    <div class="mbody" data-body>${cfg.lang === 'zh-cn' ? '<span class="mna">暂无行情数据 · 简中卡暂无市场参考价</span>' : '<button class="btn ghost mcalc">计算期望值（模拟 4,000 包）</button>'}</div>
  </div>`).join('');
  rows.querySelectorAll('.mrow').forEach(row => {
    const btn = row.querySelector('.mcalc'); if (!btn) return;
    const cfg = SETS.find(c => 'mrow-' + c.key === row.id);
    if (evCache[cfg.key]) fillMarketRow(cfg, evCache[cfg.key]);
    btn.addEventListener('click', async () => { btn.textContent = '模拟中…'; btn.disabled = true; fillMarketRow(cfg, await computeEV(cfg)); });
  });
}
for (const lang of ['en', 'ja', 'zh-tw']) {
  const inp = $('#pp-' + lang); if (!inp) continue;
  inp.addEventListener('change', () => {
    const v = parseFloat(inp.value); if (!(v >= 0)) return;
    packPrices[lang] = v; try { localStorage.setItem(PP_KEY, JSON.stringify(packPrices)); } catch {}
    for (const cfg of SETS) if (evCache[cfg.key] && !evCache[cfg.key].ineligible) fillMarketRow(cfg, evCache[cfg.key]);
  });
}

/* ---------------- 收藏资产卡 ---------------- */
function collectionValue() {
  let v = 0;
  const kinds = Object.keys(save.collection).length; // 藏品种类直接数存档，不依赖 CARDMAP（简中弹释放后 CARDMAP 不全）
  for (const [id, rec] of Object.entries(save.collection)) {
    const m = CARDMAP[id]; if (!m) continue;
    if (typeof m.card.p === 'number') v += m.card.p * rec.n;
  }
  return { v, kinds };
}
function updateAsset() {
  const el = $('#assetCard'); if (!el) return;
  const { v, kinds } = collectionValue();
  if (!kinds) { el.hidden = true; return; }
  el.hidden = false;
  $('#assetValue').textContent = '€' + v.toFixed(2);
  $('#assetNote').textContent = ` · ${kinds} 种藏品 · 已开 ${save.stats.packs} 包`;
  const today = new Date().toISOString().slice(0, 10);
  save.snaps = save.snaps || [];
  const last = save.snaps[save.snaps.length - 1];
  if (!last || last.d !== today) save.snaps.push({ d: today, v: +v.toFixed(2) }); else last.v = +v.toFixed(2);
  save.snaps = save.snaps.slice(-30); persist();
  const svg = $('#assetSpark'); const sn = save.snaps;
  if (sn.length < 2) { svg.innerHTML = ''; return; }
  const vs = sn.map(x => x.v); const mn = Math.min(...vs), mx = Math.max(...vs), rg = (mx - mn) || 1;
  const pts = vs.map((x, i) => `${(i / (vs.length - 1)) * 116 + 2},${33 - ((x - mn) / rg) * 30}`).join(' ');
  svg.innerHTML = `<polyline points="${pts}" fill="none" stroke="var(--paper)" stroke-width="2" stroke-linejoin="round"/>`;
}

/* ---------------- 战报分享图（模块 C） ---------------- */
function loadImgEl(src, cors) { return new Promise((res, rej) => { const i = new Image(); if (cors) i.crossOrigin = 'anonymous'; i.onload = () => res(i); i.onerror = rej; i.src = src; }); }
async function makeReport({ cfg, best, n, total, roi, ten, ts }) {
  const W = 1080, H = 1440;
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const x = cv.getContext('2d');
  const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#F5F0EA'); g.addColorStop(1, '#EFE9E2');
  x.fillStyle = g; x.fillRect(0, 0, W, H);
  const rg = x.createRadialGradient(W / 2, 300, 40, W / 2, 300, 620);
  rg.addColorStop(0, 'rgba(255,255,255,.65)'); rg.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = rg; x.fillRect(0, 0, W, H);
  x.textAlign = 'center'; x.fillStyle = '#292220';
  x.font = '800 66px system-ui, -apple-system, sans-serif';
  x.fillText(ten ? '十连开战报' : '开包战报', W / 2, 128);
  x.font = '500 33px system-ui, -apple-system, sans-serif'; x.fillStyle = '#6f5d60';
  const setName = cfg ? (DATA[cfg.key]?.name || cfg.sname || '') : '';
  x.fillText(`${setName} · ${new Date(ts).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}`, W / 2, 192);
  const src = imgUrl(best.card, true);
  let img = null;
  try { img = await loadImgEl(src, !src.startsWith('data:')); } catch { try { img = await loadImgEl(src, false); } catch {} }
  const iw = 590, ih = Math.round(iw * 1.397), ix = (W - iw) / 2, iy = 236;
  x.save();
  x.beginPath(); x.roundRect(ix, iy, iw, ih, 26); x.clip();
  if (img) x.drawImage(img, ix, iy, iw, ih);
  else { x.fillStyle = '#332A25'; x.fillRect(ix, iy, iw, ih); x.fillStyle = '#F2E7E0'; x.font = '700 44px system-ui'; x.fillText(best.card.n, W / 2, iy + ih / 2); }
  x.restore();
  x.strokeStyle = 'rgba(42,35,32,.8)'; x.lineWidth = 3;
  x.beginPath(); x.roundRect(ix, iy, iw, ih, 26); x.stroke();
  let yy = iy + ih + 84;
  x.fillStyle = '#292220'; x.font = '800 46px system-ui, -apple-system, sans-serif';
  x.fillText(`最佳 · ${best.card.n}`, W / 2, yy); yy += 58;
  x.fillStyle = '#292220'; x.font = '600 36px system-ui, -apple-system, sans-serif';
  const parts = [`${dispTier(best.card)} · ${fmtPrice(best.card)}`, `共 ${n} 张`];
  if (total != null) parts.push(`总值 €${total.toFixed(2)}`);
  if (roi != null) parts.push(`回报率 ${roi}%`);
  x.fillText(parts.join('  ·  '), W / 2, yy);
  x.fillStyle = '#6f5d60'; x.font = '500 27px system-ui, -apple-system, sans-serif';
  x.fillText('开包有喜 RipJoy · caesar-zzh.github.io/ripjoy-tcg-pack-simulator', W / 2, H - 84);
  x.fillText('粉丝非官方作品 · 概率全公示 · 理性开包', W / 2, H - 44);
  return cv;
}
$('#reportClose').addEventListener('click', () => { const ov = $('#reportOverlay'); ov.hidden = true; ov.classList.remove('open'); });
$('#reportOverlay').addEventListener('click', (e) => { if (e.target.id === 'reportOverlay') { e.target.hidden = true; e.target.classList.remove('open'); } });
function showReport(cv) {
  const ov = $('#reportOverlay'); const url = cv.toDataURL('image/png');
  $('#reportImg').src = url;
  const dl = $('#reportDl'); dl.href = url;
  ov.hidden = false; ov.classList.add('open');
}

/* ---------------- 卡鉴：估价与评级预检（模块 D） ---------------- */
const AP_DIMS = [
  { k: 'center', name: '居中', w: 0.30, low: '居中偏移明显：送评前先量四边比例，偏移 >60/40 时评级上限会明显受限。' },
  { k: 'corner', name: '边角', w: 0.25, low: '边角有白点或磨损：这是最常见的扣分项，裸卡存放请用卡膜 + 卡盒。' },
  { k: 'edge', name: '边缘', w: 0.20, low: '边缘有磕碰或银边：避免指甲直接捏卡边取卡。' },
  { k: 'surface', name: '表面', w: 0.25, low: '表面有划痕或指纹：送评前可用超细纤维布轻拭，避免任何液体。' },
];
let apCfg = null, apCard = null;
const apScores = { center: 9, corner: 9, edge: 9, surface: 9 };
let apBound = false;
async function renderAppraise() {
  const sel = $('#apSetSel');
  if (!apBound) {
    apBound = true;
    sel.innerHTML = SETS.map(c => `<option value="${c.key}">${c.sname || c.key}（${LANGNAME[c.lang] || c.lang}）</option>`).join('');
    apCfg = SETS[0];
    sel.addEventListener('change', async () => { apCfg = SETS.find(c => c.key === sel.value); apCard = null; renderApPanel(); await loadSet(apCfg); renderApResults(); });
    $('#apSearch').addEventListener('input', () => renderApResults());
    await loadSet(apCfg);
  }
  renderApResults(); renderApPanel();
}
function renderApResults() {
  const box = $('#apResults'); if (!box || !apCfg) return;
  const data = DATA[apCfg.key];
  if (!data) { box.innerHTML = '<div class="empty">加载卡池中…</div>'; return; }
  const q = ($('#apSearch').value || '').trim().toLowerCase();
  const list = data.cards.filter(c => !q || c.n.toLowerCase().includes(q) || String(c.no).includes(q)).slice(0, 60);
  box.innerHTML = list.length ? list.map(c => `<button class="apcard${apCard && apCard.id === c.id ? ' sel' : ''}" data-id="${c.id}"><img src="${thumbUrl(c)}" alt="" loading="lazy"><span>${c.n}</span><small>No.${c.no} · ${dispTier(c)}</small></button>`).join('') : '<div class="empty">本弹没有匹配的卡</div>';
  box.querySelectorAll('.apcard').forEach(b => b.addEventListener('click', () => { apCard = data.cards.find(c => c.id === b.dataset.id); renderApResults(); renderApPanel(); }));
}
function apGrade(score) {
  if (score >= 9.2) return ['预估 9–10 分区间', '状态极佳，值得正式送评冲高分。'];
  if (score >= 8.2) return ['预估 8–9 分区间', '有小瑕疵但整体强势，送评性价比不错。'];
  if (score >= 7.0) return ['预估 7–8 分区间', '瑕疵开始影响上限，可先预检同卡其他副本。'];
  return ['预估 7 分以下', '建议以裸卡收藏为主，或换一张状态更好的副本送评。'];
}
function renderApPanel() {
  const p = $('#apPanel'); if (!p) return;
  if (!apCard || !apCfg) { p.innerHTML = '<div class="empty">先从左边选一张卡</div>'; return; }
  const data = DATA[apCfg.key];
  const priced = data.cards.filter(c => typeof c.p === 'number' && c.p > 0).map(c => c.p).sort((a, b) => a - b);
  let pctLine = '本弹暂无市场参考价';
  if (typeof apCard.p === 'number' && priced.length) {
    const below = priced.filter(v => v < apCard.p).length;
    pctLine = `参考价 €${apCard.p.toFixed(2)} · 比本弹 ${Math.round(100 * below / priced.length)}% 的卡贵`;
  }
  const tierKinds = data.cards.filter(c => dispTier(c) === dispTier(apCard)).length;
  const score = AP_DIMS.reduce((s2, d) => s2 + d.w * apScores[d.k], 0);
  const [grade, advice] = apGrade(score);
  p.innerHTML = `
    <div class="aphead"><img src="${imgUrl(apCard)}" alt=""><div>
      <b>${apCard.n}</b><div class="apmeta">No.${apCard.no} · ${dispTierLabel(apCard)} · 本弹同档共 ${tierKinds} 种</div>
      <div class="apmeta">${pctLine}</div></div></div>
    <h4>评级预检（演示）</h4>
    ${AP_DIMS.map(d => `<div class="apdim"><label>${d.name} <b id="apv-${d.k}">${apScores[d.k]}</b></label><input type="range" min="1" max="10" step="0.5" value="${apScores[d.k]}" data-dim="${d.k}">${apScores[d.k] <= 6 ? `<p class="aptip">${d.low}</p>` : ''}</div>`).join('')}
    <div class="apscore"><span>预检分 <b>${score.toFixed(1)}</b> / 10</span><span class="apgrade">${grade}</span></div>
    <p class="note">${advice} 本预检为产品概念演示，不构成评级意见；正式评级请走集换社等平台送评。</p>`;
  p.querySelectorAll('input[type=range]').forEach(r => {
    r.addEventListener('input', () => {
      apScores[r.dataset.dim] = parseFloat(r.value);
      const lbl = $(`#apv-${r.dataset.dim}`); if (lbl) lbl.textContent = r.value;
      const sc = AP_DIMS.reduce((s2, d) => s2 + d.w * apScores[d.k], 0);
      const [gr] = apGrade(sc);
      const box = p.querySelector('.apscore');
      if (box) box.innerHTML = `<span>预检分 <b>${sc.toFixed(1)}</b> / 10</span><span class="apgrade">${gr}</span>`;
    });
    r.addEventListener('change', () => renderApPanel());
  });
}

/* ---------------- 战绩 / 概率 ---------------- */
function renderStats() {
  const s = save.stats;
  const owned = Object.keys(save.collection).map(id => CARDMAP[id]).filter(Boolean);
  const best = [...owned].sort((a, b) => (b.card.p || 0) - (a.card.p || 0)).slice(0, 5);
  $('#statGrid').innerHTML = `
    <div class="statcard"><div class="v">${s.packs}</div><div class="k">已开包数</div></div>
    <div class="statcard"><div class="v">${s.cards}</div><div class="k">累计卡片</div></div>
    <div class="statcard"><div class="v">${s.l4}</div><div class="k">SAR / 金卡次数</div></div>
    <div class="statcard"><div class="v">${s.l3}</div><div class="k">AR / UR 次数</div></div>`;
  $('#bestPulls').innerHTML = best.length ? best.map(x => `<div class="historyitem"><img src="${thumbUrl(x.card)}" alt=""><div class="hmeta"><b>${x.card.n}</b> · ${dispTier(x.card)}<br>${x.setName} · 参考价 <span style="color:var(--paper)">${fmtPrice(x.card)}</span></div></div>`).join('') : '<div class="empty">还没有藏品</div>';
  $('#historyList').innerHTML = save.history.length ? save.history.map(h => `<div class="historyitem"><img src="${h.bestId && CARDMAP[h.bestId] ? thumbUrl(CARDMAP[h.bestId].card) : ''}" alt=""><div class="hmeta"><b>${h.bestName}</b> · ${h.bestTier}<br>${h.setName} · ${h.n} 张 · ${new Date(h.ts).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div><button class="btn ghost hreport" data-ts="${h.ts}">战报</button></div>`).join('') : '<div class="empty">暂无开包记录</div>';
}
$('#historyList').addEventListener('click', async (e) => {
  const b = e.target.closest('.hreport'); if (!b) return;
  const h = save.history.find(x => x.ts === +b.dataset.ts); if (!h) return;
  const cfg = SETS.find(c => c.key === h.setKey); if (!cfg) return;
  b.textContent = '生成中…'; b.disabled = true;
  try {
    const data = await loadSet(cfg);
    const card = data.cards.find(c => c.id === h.bestId); if (!card) return;
    await showReport(await makeReport({ cfg, best: { card }, n: h.n, total: null, roi: null, ten: false, ts: h.ts }));
  } finally { b.textContent = '战报'; b.disabled = false; }
});
$('#resetBtn').addEventListener('click', () => {
  if (!confirm('清空收藏、战绩与历史？此操作不可恢复。')) return;
  localStorage.removeItem(SAVE_KEY); location.reload();
});

/* ---------------- 详情弹窗 ---------------- */
function openDetail(card) {
  const t = TIERS[tierOf(card)]; const info = CARDMAP[card.id];
  const cnt = save.collection[card.id]?.n || 0;
  $('#modalBody').innerHTML = `
    <div class="card3d flipped glow-${t.level}" id="modalCard" style="--flip:180deg">
      <div class="face backface"></div>
      <div class="face front"><img src="${imgUrl(card, true)}" alt="${card.n}">
      <div class="foil ${tierOf(card) === 'HR' ? 'gold' : t.level >= 1 ? 'holo' : ''}"></div></div>
    </div>
    <div class="modalinfo">
      <div class="mname">${card.n}<span class="tierbadge">${dispTier(card)}</span></div>
      <div class="mmeta">No.${card.no} · ${info?.setName || ''} · ${dispTierLabel(card)}<br>参考价 <b style="color:var(--paper)">${fmtPrice(card)}</b>${card.ill ? ` · 画师 ${card.ill}` : ''}${cnt ? ` · 已拥有 ×${cnt}` : ''}<br><span style="font-size:12px">拖动卡片查看全息光泽</span></div>
      <button class="btn modalclose" id="modalClose">关 闭</button>
    </div>`;
  $('#modal').classList.add('open');
  if (matchMedia('(pointer:fine)').matches) addTilt($('#modalCard'), 16);
  $('#modalClose').addEventListener('click', closeDetail);
}
function closeDetail() { $('#modal').classList.remove('open'); }
$('#modal').addEventListener('click', (e) => { if (e.target.id === 'modal') closeDetail(); });

/* ---------------- 启动 ---------------- */
// 立即渲染骨架卡并后台预取——切勿等全部数据下完，否则慢网下首页长时间空白
renderSets();
