import { TIERS, tierOf, buildPools, openPack, fmtPrice, imgUrl } from './engine.js';
import { Particles, fxForLevel } from './particles.js';
import { sfx, vibrate, VIB, addTilt, setMuted } from './fx.js';

const SETS = [
  { key: 'taijing', file: 'data/zh-cn-CSV9.5C.json', theme: 'linear-gradient(150deg,#5e1a6e,#b83fd0 55%,#ff8ad8)', desc: '简体中文版 · 伊布全家太晶盛聚 · 含简中专属异画', chaseNote: '仙子伊布 ex SAR（简中专属异画）', sname: '太晶盛聚', lang: 'zh-cn', total: 259, pack: 5 },
  { key: 'CSV9C', file: 'data/zh-cn-CSV9C.json', theme: 'linear-gradient(150deg,#40205e,#7a4fd0 55%,#f2a8e0)', desc: '简体中文版 · 晶璃星辉 · 太乐巴戈斯集结', chaseNote: '太乐巴戈斯 ex SAR', sname: '星彩晶璃', lang: 'zh-cn', total: 266, pack: 5 },
  { key: 'CSV8C', file: 'data/zh-cn-CSV8C.json', theme: 'linear-gradient(150deg,#0d2e3d,#14607a 55%,#4fd8c8)', desc: '简体中文版 · 诡幻璀璨 · 桃歹郎一族', chaseNote: '桃歹郎 ex SAR', sname: '璀璨诡幻', lang: 'zh-cn', total: 264, pack: 5 },
  { key: 'CSV7C', file: 'data/zh-cn-CSV7C.json', theme: 'linear-gradient(150deg,#27364d,#4a6a96 55%,#ffb37a)', desc: '简体中文版 · 利刃猛醒 · 猛雷鼓咆哮', chaseNote: '猛雷鼓 ex SAR', sname: '利刃猛醒', lang: 'zh-cn', total: 259, pack: 5 },
  { key: '151C', file: 'data/zh-cn-151C.json', theme: 'linear-gradient(150deg,#7a1620,#d03a2f 55%,#ffd75e)', desc: '简体中文版 · 初代 151 情怀 · 旅望惊聚全集', chaseNote: '喷火龙 ex SAR', sname: '收集啦151', lang: 'zh-cn', total: 192, pack: 5 },
  { key: '151en', file: 'data/en-sv03.5.json', theme: 'linear-gradient(150deg,#8f1f16,#e2483d 55%,#ff8a5c)', desc: '初代 151 情怀弹 · 喷火龙 SAR 大追', chaseNote: '喷火龙 ex SAR', sname: '151', lang: 'en', total: 207, pack: 10 },
  { key: 'sv08.5', file: 'data/en-sv08.5.json', theme: 'linear-gradient(150deg,#6e1a4d,#d03f8a 55%,#ffb3d9)', desc: '伊布盛宴 · 月亮伊布 ex SAR 天价追卡', chaseNote: '月亮伊布 ex SAR', sname: 'Prismatic Evolutions', lang: 'en', total: 180, pack: 10 },
  { key: 'sv08', file: 'data/en-sv08.json', theme: 'linear-gradient(150deg,#8a6410,#e8a812 55%,#ffd75e)', desc: '电光四射 · 皮卡丘 SAR 天价追卡', chaseNote: '皮卡丘 ex SAR', sname: 'Surging Sparks', lang: 'en', total: 252, pack: 10 },
  { key: 'sv09', file: 'data/en-sv09.json', theme: 'linear-gradient(150deg,#0f5e46,#12a37a 55%,#5ce8b8)', desc: '旅途伙伴 · 训练家的宝可梦集结', chaseNote: '莉莉艾的皮皮 ex SAR', sname: 'Journey Together', lang: 'en', total: 190, pack: 10 },
  { key: 'sv10', file: 'data/en-sv10.json', theme: 'linear-gradient(150deg,#33135e,#7a4fd0 55%,#c05cff)', desc: '火箭队归来 · 坂木的超梦 ex SAR', chaseNote: '火箭队的超梦 ex SAR', sname: 'Destined Rivals', lang: 'en', total: 244, pack: 10 },
  { key: 'me01', file: 'data/en-me01.json', theme: 'linear-gradient(150deg,#14424e,#1f8aa5 55%,#6fe3ff)', desc: 'MEGA 新时代开启 · 超级进化归来', chaseNote: '超级路卡利欧 ex 金卡', sname: 'Mega Evolution', lang: 'en', total: 188, pack: 10 },
  { key: 'sv05', file: 'data/en-sv05.json', theme: 'linear-gradient(150deg,#4e3414,#a5761f 55%,#ffd75e)', desc: '时空之力 · 古代与未来悖谬集结', chaseNote: '铁斑叶 ex SAR', sname: 'Temporal Forces', lang: 'en', total: 218, pack: 10 },
  { key: 'sv10.5b', file: 'data/en-sv10.5b.json', theme: 'linear-gradient(150deg,#0b1030,#2743a6 55%,#6fb7ff)', desc: '合众黑雷 · BWR 黑白稀有登场', chaseNote: '捷克罗姆 ex BWR', sname: 'Black Bolt', lang: 'en', total: 172, pack: 10 },
  { key: 'sv10.5w', file: 'data/en-sv10.5w.json', theme: 'linear-gradient(150deg,#571d10,#c2492a 55%,#ffb37a)', desc: '合众白焰 · BWR 黑白稀有登场', chaseNote: '莱希拉姆 ex BWR', sname: 'White Flare', lang: 'en', total: 173, pack: 10 },
  { key: 'me02', file: 'data/en-me02.json', theme: 'linear-gradient(150deg,#2b0f2e,#8f2470 55%,#ff7a5c)', desc: 'MEGA 第二弹 · 幻影火焰', chaseNote: '超级喷火龙X ex 金卡', sname: 'Phantasmal Flames', lang: 'en', total: 130, pack: 10 },
  { key: 'me02.5', file: 'data/en-me02.5.json', theme: 'linear-gradient(150deg,#123524,#1f7a4d 55%,#7ae2a8)', desc: 'MEGA 大弹 295 张 · 群雄昇腾', chaseNote: '超级快龙 ex 金卡', sname: 'Ascended Heroes', lang: 'en', total: 295, pack: 10 },
  { key: 'sv04.5', file: 'data/en-sv04.5.json', theme: 'linear-gradient(150deg,#243b6b,#4a7fd4 55%,#bcd7ff)', desc: '帕底亚之光 · 闪色宝可梦大集合', chaseNote: '闪色超梦 ex', sname: 'Paldean Fates', lang: 'en', total: 245, pack: 10 },
  { key: 'sv06.5', file: 'data/en-sv06.5.json', theme: 'linear-gradient(150deg,#160f2e,#3d2a7a 55%,#8a7ae0)', desc: '黑夜漫游者 · 桃歹郎 ex SAR', chaseNote: '桃歹郎 ex SAR', sname: 'Shrouded Fable', lang: 'en', total: 99, pack: 10 },
  { key: 'sv06', file: 'data/en-sv06.json', theme: 'linear-gradient(150deg,#0e4632,#15935f 55%,#6fe8ae)', desc: '变幻假面 · 厄诡椪与忍蛙', chaseNote: '甲贺忍蛙 ex SAR', sname: 'Twilight Masquerade', lang: 'en', total: 226, pack: 10 },
  { key: 'sv07', file: 'data/en-sv07.json', theme: 'linear-gradient(150deg,#3a2a6e,#7a5cd0 55%,#c9a8ff)', desc: '星晶奇迹 · 太乐巴戈斯 ex', chaseNote: '太乐巴戈斯 ex SAR', sname: 'Stellar Crown', lang: 'en', total: 175, pack: 10 },
  { key: 'sv04', file: 'data/en-sv04.json', theme: 'linear-gradient(150deg,#40260f,#96601f 55%,#ffc46b)', desc: '悖论裂缝 · 古代未来交锋', chaseNote: '铁武者 ex SAR', sname: 'Paradox Rift', lang: 'en', total: 266, pack: 10 },
  { key: 'sv01', file: 'data/en-sv01.json', theme: 'linear-gradient(150deg,#5e1220,#b02a3d 55%,#ff8a7a)', desc: '朱紫起点 · 帕底亚启程', chaseNote: '沙奈朵 ex SAR', sname: 'Scarlet & Violet', lang: 'en', total: 258, pack: 10 },
  { key: 'sv02', file: 'data/en-sv02.json', theme: 'linear-gradient(150deg,#6e5410,#c29a1f 55%,#ffe98a)', desc: '帕底亚进化 · 奇树 SAR 大追', chaseNote: '奇树 SAR', sname: 'Paldea Evolved', lang: 'en', total: 279, pack: 10 },
  { key: 'sv03', file: 'data/en-sv03.json', theme: 'linear-gradient(150deg,#1c1c26,#3d3d55 55%,#ff7847)', desc: '黯焰支配者 · 喷火龙 ex', chaseNote: '喷火龙 ex 金卡', sname: 'Obsidian Flames', lang: 'en', total: 230, pack: 10 },
  { key: '151ja', file: 'data/ja-sv2a.json', theme: 'linear-gradient(150deg,#123a75,#2f6fd0 55%,#5eb1ff)', desc: '日版原版 151 · 7 张包 · 镜面闪', chaseNote: 'リザードンex SAR', sname: 'ポケモンカード151', lang: 'ja', total: 210, pack: 7 },
  { key: 'SV9a', file: 'data/ja-SV9a.json', theme: 'linear-gradient(150deg,#6e2a10,#d05a1f 55%,#ffb37a)', desc: '日版热风竞技场 · 5 张包', chaseNote: 'シロナのガブリアスex SAR', sname: '熱風のアリーナ', lang: 'ja', total: 92, pack: 5 },
  { key: 'SV9tw', file: 'data/zh-tw-SV9.json', theme: 'linear-gradient(150deg,#7c2d12,#d97a2b 55%,#ffc98a)', desc: '繁体中文版（台版）· 5 张包 · 数据暂缺 AR/SAR', chaseNote: '莉莉艾的皮皮 ex RR', sname: '對戰搭檔', lang: 'zh-tw', total: 100, pack: 5 },
  { key: 'SV10tw', file: 'data/zh-tw-SV10.json', theme: 'linear-gradient(150deg,#3b0764,#7e22ce 55%,#d8b4fe)', desc: '繁体中文版（台版）· 5 张包 · 数据暂缺 AR/SAR', chaseNote: '火箭队的超梦 ex RR', sname: '火箭隊的榮耀', lang: 'zh-tw', total: 98, pack: 5 },
];
const LANG_LABEL = { en: '英文版', ja: '日版', 'zh-cn': '简体中文版', 'zh-tw': '繁体中文版' };
// 带 rk 的卡（简中弹）按其原始稀有度字母展示：SR 就是 SR，不套用英文 UR 口径
const CN_RARITY_CN = { C: '普通', U: '非普通', R: '稀有闪', RR: '双重稀有', ACE: 'ACE SPEC', SR: '超级稀有', SAR: '特别插画稀有', UR: '金卡', S: '闪色', SSR: '闪色超级稀有' };
const dispTier = (c) => c.rk || tierOf(c);
const dispTierLabel = (c) => c.rk ? `${c.rk} · ${CN_RARITY_CN[c.rk] || ''}` : TIERS[tierOf(c)].label;
const packOf = (data) => data.pack || (data.lang === 'ja' ? 7 : 10);
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

/* ---------------- 存档 ---------------- */
const SAVE_KEY = 'ripjoy.save.v1';
let save = { collection: {}, stats: { packs: 0, cards: 0, l3: 0, l4: 0, spent: 0 }, history: [], firstPackDone: false, muted: false };
try { const raw = localStorage.getItem(SAVE_KEY); if (raw) save = { ...save, ...JSON.parse(raw) }; } catch {}
const persist = () => { try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch {} };
setMuted(!!save.muted);

/* ---------------- 数据 ---------------- */
const DATA = {}; const POOLS = {}; const CARDMAP = {}; const LOADP = {};
function loadSet(cfg) {
  if (DATA[cfg.key]) return Promise.resolve(DATA[cfg.key]);
  if (LOADP[cfg.key]) return LOADP[cfg.key];
  LOADP[cfg.key] = (async () => {
    const embedded = (typeof window !== 'undefined' && window.__RIPJOY_EMBED__) ? window.__RIPJOY_EMBED__[cfg.file] : null;
    const data = embedded || await (await fetch(cfg.file)).json();
    DATA[cfg.key] = data; POOLS[cfg.key] = buildPools(data);
    for (const c of data.cards) CARDMAP[c.id] = { card: c, setKey: cfg.key, setName: data.name };
    return data;
  })().catch(e => { delete LOADP[cfg.key]; throw e; });
  return LOADP[cfg.key];
}
const logoSrc = (data) => !data.logo ? null : (data.logo.startsWith('data:') ? data.logo : `${data.logo}.png`);
const HIDONE = {};
function loadHi(cfg) {
  // 简中弹高清包：主数据只带缩略图，高稀有卡的高清图单独一个文件，进开包/图鉴时按需加载
  if (HIDONE[cfg.key] || !cfg.file.includes('zh-cn')) return;
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
const chaseOf = (data) => [...data.cards].filter(c => ['SAR', 'HR', 'BWR'].includes(tierOf(c))).sort((a, b) => (b.p || 0) - (a.p || 0))[0]
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
  if (name === 'open') renderSets();
}
let metaLoading = false;
function ensureMetaLoaded(again) {
  // 收藏册/战绩依赖 CARDMAP：若存档里有尚未加载弹系的卡，补齐后重渲染
  if (metaLoading) return;
  const missing = Object.keys(save.collection).some(id => !CARDMAP[id]);
  if (!missing) return;
  metaLoading = true;
  Promise.all(SETS.map(c => loadSet(c).catch(() => {}))).then(() => { metaLoading = false; again(); });
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
        <p class="setmeta">${cfg.desc}<br><span data-fill="chase">大追：<span class="chase-name">${cfg.chaseNote}</span></span> · 每包 ${cfg.pack} 张</p>
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
  const s = save.stats;
  $('#heroStats').innerHTML = s.packs
    ? `已开 <b>${s.packs}</b> 包 · 累计 <b>${s.cards}</b> 张 · 高稀有演出 <b>${s.l3 + s.l4}</b> 次 · 最佳战绩在「战绩」页`
    : `首包保底 <b>AR 以上</b> · 先撕一包，30 秒看到高稀有演出`;
  prefetchSets();
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
    const ci = document.createElement('img'); ci.className = 'chase'; ci.src = imgUrl(chase); ci.alt = chase.n; ci.loading = 'lazy'; ci.onerror = () => { ci.style.opacity = 0; };
    banner.appendChild(ci);
  }
  const chaseEl = el.querySelector('[data-fill="chase"]');
  if (chaseEl && chase) chaseEl.innerHTML = `大追：<span class="chase-name">${chase.n}</span> 参考价 <b style="color:var(--gold)">${fmtPrice(chase)}</b>`;
  const bar = el.querySelector('[data-fill="bar"]'); if (bar) bar.style.width = `${(owned / data.cards.length) * 100}%`;
  const prog = el.querySelector('[data-fill="prog"]'); if (prog) prog.textContent = `图鉴收集 ${owned} / ${data.cards.length}`;
}
let prefetching = false;
async function prefetchSets() {
  if (prefetching) return; prefetching = true;
  const queue = [...SETS.filter(c => !c.file.includes('zh-cn')), ...SETS.filter(c => c.file.includes('zh-cn'))];
  let qi = 0;
  const worker = async () => {
    while (qi < queue.length) {
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
  else if (galTier === 'SAR') cards = cards.filter(c => ['SAR', 'HR', 'BWR'].includes(tierOf(c)));
  else if (galTier === 'UR') cards = cards.filter(c => ['UR', 'ACE'].includes(tierOf(c)));
  else if (galTier === 'RR') cards = cards.filter(c => tierOf(c) === 'RR');
  else if (galTier === 'R') cards = cards.filter(c => lv(c) <= 1);
  if (galOwnedOnly) cards = cards.filter(c => save.collection[c.id]);
  $('#galGrid').innerHTML = cards.length ? cards.map((c, i) => {
    const own = save.collection[c.id];
    return `<figure data-id="${c.id}" class="${own ? '' : 'notowned'}" style="animation-delay:${Math.min(i * 16, 480)}ms">
      <img src="${imgUrl(c)}" alt="${c.n}" loading="lazy" onerror="this.style.opacity=0">
      ${own ? `<span class="countbadge">×${own.n}</span>` : ''}
      <figcaption><span class="rdot" style="background:${TIERS[tierOf(c)].color}"></span><b>${c.n}</b><br>${dispTier(c)} · ${fmtPrice(c)}${own ? '' : ' · 未拥有'}</figcaption>
    </figure>`;
  }).join('') : '<p class="empty">这个筛选下还没有卡<br>换个筛选，或先去开几包</p>';
  $$('#galGrid figure').forEach(f => f.addEventListener('click', () => openDetail(CARDMAP[f.dataset.id].card)));
}
$('#galBack').addEventListener('click', () => showView('open'));
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
  const best = [...pack].sort((a, b) => (b.level || 0) - (a.level || 0) || (b.card.p || 0) - (a.card.p || 0))[0];
  save.stats.packs++;
  save.history.unshift({ ts: Date.now(), setKey: cfg.key, setName: DATA[cfg.key].name, n: pack.length, bestId: best.card.id, bestName: best.card.n, bestPrice: best.card.p, bestTier: dispTier(best.card) });
  save.history = save.history.slice(0, 30); persist();
}

async function ensureStageData(cfg) {
  if (DATA[cfg.key]) return true;
  session = { cfg, phase: 'loading' };
  showStage();
  $('#stageTitle').textContent = cfg.sname;
  $('#stageBody').innerHTML = `<div class="empty" style="padding-top:70px">正在加载「${cfg.sname}」卡池…<br><span style="font-size:12.5px">首次打开需下载该弹数据，之后秒开</span></div>`;
  try { await loadSet(cfg); } catch {
    if (session?.phase === 'loading') $('#stageBody').innerHTML = `<div class="empty" style="padding-top:70px">卡池加载失败，网络不太稳<br><span style="font-size:12.5px">点左上角「← 选弹」返回，稍后再试</span></div>`;
    return false;
  }
  return !!session && session.phase === 'loading';
}
async function startPack(cfg, isRetry) {
  if (!DATA[cfg.key] && !(await ensureStageData(cfg))) return;
  loadHi(cfg);
  const data = DATA[cfg.key];
  const forceTop = !save.firstPackDone;
  const pack = openPack(data, POOLS[cfg.key], { forceTop });
  if (forceTop) save.firstPackDone = true;
  pack.forEach(e => { e.isNew = collect(e); e.tier = tierOf(e.card); e.level = TIERS[e.tier].level; });
  finishPackToHistory(cfg, pack);
  session = { cfg, pack, idx: 0, revealed: false, phase: 'tear' };
  showStage();
  $('#stageTitle').textContent = data.name;
  renderTear();
}

async function startTen(cfg) {
  if (!DATA[cfg.key] && !(await ensureStageData(cfg))) return;
  loadHi(cfg);
  const data = DATA[cfg.key];
  const packs = [];
  for (let i = 0; i < 10; i++) {
    const forceTop = i === 0 && !save.firstPackDone; // 首包保底也适用于人生第一次十连
    const pack = openPack(data, POOLS[cfg.key], { forceTop });
    if (forceTop) save.firstPackDone = true;
    pack.forEach(e => { e.isNew = collect(e); e.tier = tierOf(e.card); e.level = TIERS[e.tier].level; });
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
  if (session.packNo < 10) {
    session.packNo++;
    session.pack = session.tenPacks[session.packNo - 1];
    session.idx = 0; session.revealed = false; session.phase = 'tear';
    renderTear(); window.scrollTo({ top: 0 });
  } else grandSummary();
}
function renderPackSummary() {
  const { cfg, pack, packNo } = session; const data = DATA[cfg.key];
  const sorted = [...pack].sort((a, b) => b.level - a.level || (b.card.p || 0) - (a.card.p || 0));
  const best = sorted[0];
  const total = pack.reduce((s, e) => s + (e.card.p || 0), 0);
  const news = pack.filter(e => e.isNew).length;
  const st = $('#stageBody');
  st.innerHTML = `
    <div class="summaryhead">
      <h2>十连 · 第 ${packNo} / 10 包${best.level >= 4 ? ' · 🎉 神抽！' : best.level === 3 ? ' · ✨ 出货！' : ''}</h2>
      <p>${data.name} · 本包参考价合计 <b>${pack.some(e => e.card.p != null) ? `€${total.toFixed(2)}` : '—'}</b> · 新卡 <b>${news}</b> 张</p>
    </div>
    <div class="bestpull" style="--bc:${TIERS[best.tier].color}"><span class="besttag">本包最佳 · ${dispTier(best.card)} · ${fmtPrice(best.card)}</span><img src="${imgUrl(best.card, true)}" alt="${best.card.n}"></div>
    <p style="text-align:center;color:var(--dim);font-size:13px">${best.card.n}</p>
    <div class="resultgrid">${sorted.map((e, i) => `
      <figure data-id="${e.card.id}" style="animation-delay:${Math.min(i * 30, 600)}ms">
        <img src="${imgUrl(e.card)}" alt="${e.card.n}" loading="lazy">
        <figcaption><span class="rdot" style="background:${TIERS[e.tier].color}"></span><b>${e.card.n}</b><br>${dispTier(e.card)} · ${fmtPrice(e.card)}${e.isNew ? ' · NEW' : ''}</figcaption>
      </figure>`).join('')}
    </div>
    <div class="stagebtns" style="margin:22px auto 0">
      <button class="btn" id="nextPackBtn">${packNo < 10 ? `下一包 · 第 ${packNo + 1} / 10 包` : '看总汇算 🎉'}</button>
      <button class="btn ghost" id="toBinderBtn2">收藏册</button>
    </div>
    ${packNo < 10 ? '<p style="text-align:center;margin-top:14px"><button class="skipall" id="skipRestBtn">跳过剩余包，直接看总汇算 →</button></p>' : ''}`;
  $$('#stageBody figure').forEach(f => f.addEventListener('click', () => openDetail(CARDMAP[f.dataset.id].card)));
  $('#nextPackBtn').addEventListener('click', nextPackOrGrand);
  $('#toBinderBtn2').addEventListener('click', () => { exitStageSilent(); showView('collection'); });
  const sk = $('#skipRestBtn'); if (sk) sk.addEventListener('click', grandSummary);
}

function showStage() {
  $$('.view').forEach(v => v.classList.remove('active'));
  $('#view-open').classList.add('active'); window.scrollTo({ top: 0 });
  $('#stage').style.display = 'block'; $('#setgridWrap').style.display = 'none';
  if (session?.cfg) $('#stage').style.setProperty('--amb', session.cfg.theme);
}
function exitStage() {
  $('#stage').style.display = 'none'; $('#setgridWrap').style.display = 'block';
  session = null; renderSets();
}
$('#backBtn').addEventListener('click', exitStage);
$('#oddsLink').addEventListener('click', () => showView('stats'));

function renderTear() {
  const { cfg } = session; const data = DATA[cfg.key]; const chase = chaseOf(data);
  const st = $('#stageBody');
  st.innerHTML = `
    <div class="packwrap" id="packEl">
      <div class="packtop"><img src="${imgUrl(chase, true)}" alt=""></div>
      <div class="pack">
        <img class="packart" src="${imgUrl(chase, true)}" alt="${chase.n}" onerror="this.style.opacity=0">
        <div class="packshade"></div><div class="packtear"></div>
        ${data.logo ? `<img class="packlogo" src="${logoSrc(data)}" alt="">` : ''}
        <div class="packname">${data.name}</div>
        <div class="packsub">${packOf(data)} CARDS PER PACK · RipJoy</div>
      </div>
    </div>
    <p class="stagehint">${session.tenPacks ? `<b>十连 · 第 ${session.packNo} / 10 包</b><br>` : ''}点一下卡包，<b>撕开它</b><br><span style="font-size:12.5px">翻卡前留意卡背的光晕——颜色越暖，下一张越有货</span></p>
    <div class="stagebtns"><button class="btn" id="tearBtn">✂️ 撕 开</button>${session.tenPacks ? '<button class="btn ghost" id="skipTearBtn" style="flex:0 0 108px">直接翻卡</button>' : ''}</div>`;
  const tear = () => {
    if (!session || session.phase !== 'tear') return;
    session.phase = 'tearing';
    $('#packEl').classList.add('tearing'); sfx.tear(); vibrate(30);
    setTimeout(() => { session.phase = 'reveal'; renderReveal(); }, 980);
  };
  $('#packEl').addEventListener('click', tear);
  $('#tearBtn').addEventListener('click', tear);
  const sk = $('#skipTearBtn');
  if (sk) sk.addEventListener('click', () => { if (session?.phase === 'tear') { session.phase = 'reveal'; renderReveal(); } });
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
      <div class="glowrap"></div>
      <div class="card3d" id="card3d" style="--flip:0deg">
        <div class="face backface"><div class="ring"></div><div class="backword">POKÉMON</div><div class="backsub">TRADING CARD GAME</div></div>
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
  const card3d = $('#card3d'); addTilt(card3d, 9);
  const doFlip = () => flipCurrent();
  card3d.addEventListener('click', () => { session.revealed ? advance() : doFlip(); });
  $('#nextBtn').addEventListener('click', () => { session.revealed ? advance() : doFlip(); });
  $('#skipBtn').addEventListener('click', () => { summaryForCurrent(); });
  // 预加载下一张高清图
  if (next) { const im = new Image(); im.src = imgUrl(next.card, true); }
}
function renderTray() {
  const tray = $('#tray'); if (!tray || !session) return;
  const shown = session.pack.slice(0, session.idx + (session.revealed ? 1 : 0));
  const bestP = Math.max(...session.pack.map(e => e.card.p || 0));
  tray.innerHTML = shown.map(e => `<img src="${imgUrl(e.card)}" class="${(e.card.p || 0) === bestP && e.level >= 2 ? 'best' : ''}" alt="${e.card.n}">`).join('');
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
        banner.style.background = `linear-gradient(92deg, ${TIERS[entry.tier].color}, #fff2)`;
        banner.style.backgroundColor = TIERS[entry.tier].color;
        banner.classList.add('pop');
      }
    } else if (entry.level === 1) { sfx.reveal(1); }
    const nb = $('#nextBtn'); if (nb) nb.textContent = session.idx === session.pack.length - 1 ? '看结算' : '下一张';
  }, entry.level >= 4 ? 520 : 330);
  const t = TIERS[entry.tier];
  $('#cardInfo').innerHTML = `
    <div class="cname">${entry.card.n}<span class="tierbadge" style="background:${t.color}">${dispTier(entry.card)}</span>${entry.reverse ? '<span class="revtag">反闪</span>' : ''}${entry.isNew ? '<span class="newtag">NEW</span>' : ''}</div>
    <div class="cmeta">No.${entry.card.no} · ${dispTierLabel(entry.card)} · 参考价 <b style="color:var(--gold)">${fmtPrice(entry.card)}</b>${entry.card.ill ? ` · 画师 ${entry.card.ill}` : ''} · 点卡片看大图，点「下一张」继续</div>`;
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
  const sorted = [...pack].sort((a, b) => b.level - a.level || (b.card.p || 0) - (a.card.p || 0));
  const best = sorted[0];
  const total = pack.reduce((s, e) => s + (e.card.p || 0), 0);
  const news = pack.filter(e => e.isNew).length;
  const st = $('#stageBody');
  st.innerHTML = `
    <div class="summaryhead">
      <h2>${ten ? '十连开 · 总结算' : best.level >= 4 ? '🎉 神抽！' : best.level === 3 ? '✨ 出货了！' : '本包结算'}</h2>
      <p>${ten ? `共 ${pack.length} 张` : `${data.name}`} · 参考价合计 <b>${pack.some(e => e.card.p != null) ? `€${total.toFixed(2)}` : '—'}</b> · 新卡 <b>${news}</b> 张${ten && sorted.some(e => e.level >= 4) ? ' · <b>含 SAR/HR！</b>' : ''}</p>
    </div>
    <div class="bestpull" style="--bc:${TIERS[best.tier].color}"><span class="besttag">最佳 · ${dispTier(best.card)} · ${fmtPrice(best.card)}</span><img src="${imgUrl(best.card, true)}" alt="${best.card.n}"></div>
    <p style="text-align:center;color:var(--dim);font-size:13px">${best.card.n}</p>
    <div class="resultgrid">${sorted.map((e, i) => `
      <figure data-id="${e.card.id}" style="animation-delay:${Math.min(i * 30, 600)}ms">
        <img src="${imgUrl(e.card)}" alt="${e.card.n}" loading="lazy">
        <figcaption><span class="rdot" style="background:${TIERS[e.tier].color}"></span><b>${e.card.n}</b><br>${dispTier(e.card)} · ${fmtPrice(e.card)}${e.isNew ? ' · NEW' : ''}</figcaption>
      </figure>`).join('')}
    </div>
    <div class="stagebtns" style="margin:22px auto 0">
      <button class="btn" id="againBtn">${ten ? '再来十连' : '再来一包'}</button>
      <button class="btn ghost" id="toBinderBtn">收藏册</button>
    </div>`;
  $$('#stageBody figure').forEach(f => f.addEventListener('click', () => openDetail(CARDMAP[f.dataset.id].card)));
  $('#againBtn').addEventListener('click', () => { ten ? startTen(cfg) : startPack(cfg); });
  $('#toBinderBtn').addEventListener('click', () => { exitStageSilent(); showView('collection'); });
}
function exitStageSilent() { $('#stage').style.display = 'none'; $('#setgridWrap').style.display = 'block'; session = null; }

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
  const totalCards = SETS.reduce((s, c) => s + (DATA[c.key]?.cards.length || 0), 0);
  $('#collSummary').innerHTML = `
    <div class="statcard"><div class="v">${owned.length}<span style="font-size:13px;color:var(--dim)"> / ${totalCards}</span></div><div class="k">已收集图鉴</div></div>
    <div class="statcard"><div class="v">${save.stats.cards}</div><div class="k">累计开出（含重复）</div></div>
    <div class="statcard"><div class="v">${owned.filter(x => TIERS[tierOf(x.card)].level >= 3).length}</div><div class="k">AR 以上藏品</div></div>`;
  $('#collGrid').innerHTML = filtered.length ? filtered.map(x => {
    const t = tierOf(x.card);
    return `<figure data-id="${x.card.id}"><span class="countbadge">×${x.n}</span><img src="${imgUrl(x.card)}" alt="${x.card.n}" loading="lazy"><figcaption><span class="rdot" style="background:${TIERS[t].color}"></span><b>${x.card.n}</b><br>${dispTier(x.card)} · ${fmtPrice(x.card)}</figcaption></figure>`;
  }).join('') : `<div class="empty" style="grid-column:1/-1">这里还没有卡<br>去撕一包，把第一张 SAR 带回来</div>`;
  $$('#collGrid figure').forEach(f => f.addEventListener('click', () => openDetail(CARDMAP[f.dataset.id].card)));
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
  $('#bestPulls').innerHTML = best.length ? best.map(x => `<div class="historyitem"><img src="${imgUrl(x.card)}" alt=""><div class="hmeta"><b>${x.card.n}</b> · ${dispTier(x.card)}<br>${x.setName} · 参考价 <span style="color:var(--gold)">${fmtPrice(x.card)}</span></div></div>`).join('') : '<div class="empty">还没有藏品</div>';
  $('#historyList').innerHTML = save.history.length ? save.history.map(h => `<div class="historyitem"><img src="${h.bestId && CARDMAP[h.bestId] ? imgUrl(CARDMAP[h.bestId].card) : ''}" alt=""><div class="hmeta"><b>${h.bestName}</b> · ${h.bestTier}<br>${h.setName} · ${h.n} 张 · ${new Date(h.ts).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div></div>`).join('') : '<div class="empty">暂无开包记录</div>';
}
$('#resetBtn').addEventListener('click', () => {
  if (!confirm('清空收藏、战绩与历史？此操作不可恢复。')) return;
  localStorage.removeItem(SAVE_KEY); location.reload();
});

/* ---------------- 详情弹窗 ---------------- */
function openDetail(card) {
  const t = TIERS[tierOf(card)]; const info = CARDMAP[card.id];
  const cnt = save.collection[card.id]?.n || 0;
  $('#modalBody').innerHTML = `
    <div class="card3d glow-${t.level}" id="modalCard" style="--flip:180deg">
      <div class="face backface"></div>
      <div class="face front"><img src="${imgUrl(card, true)}" alt="${card.n}">
      <div class="foil ${tierOf(card) === 'HR' ? 'gold' : t.level >= 1 ? 'holo' : ''}"></div></div>
    </div>
    <div class="modalinfo">
      <div class="mname">${card.n}<span class="tierbadge" style="background:${t.color}">${dispTier(card)}</span></div>
      <div class="mmeta">No.${card.no} · ${info?.setName || ''} · ${dispTierLabel(card)}<br>参考价 <b style="color:var(--gold)">${fmtPrice(card)}</b>${card.ill ? ` · 画师 ${card.ill}` : ''}${cnt ? ` · 已拥有 ×${cnt}` : ''}<br><span style="font-size:12px">拖动卡片查看全息光泽</span></div>
      <button class="btn modalclose" id="modalClose">关 闭</button>
    </div>`;
  $('#modal').classList.add('open');
  addTilt($('#modalCard'), 16);
  $('#modalClose').addEventListener('click', closeDetail);
}
function closeDetail() { $('#modal').classList.remove('open'); }
$('#modal').addEventListener('click', (e) => { if (e.target.id === 'modal') closeDetail(); });

/* ---------------- 启动 ---------------- */
// 立即渲染骨架卡并后台预取——切勿等全部数据下完，否则慢网下首页长时间空白
renderSets();
