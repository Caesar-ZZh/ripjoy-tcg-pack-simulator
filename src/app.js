import { TIERS, tierOf, buildPools, openPack, fmtPrice, imgUrl } from './engine.js';
import { Particles, fxForLevel } from './particles.js';
import { sfx, vibrate, VIB, addTilt, setMuted } from './fx.js';

const SETS = [
  { key: '151en', file: 'data/en-sv03.5.json', theme: 'linear-gradient(150deg,#8f1f16,#e2483d 55%,#ff8a5c)', desc: '初代 151 情怀弹 · 喷火龙 SAR 大追', chaseNote: '喷火龙 ex SAR' },
  { key: 'sv08', file: 'data/en-sv08.json', theme: 'linear-gradient(150deg,#8a6410,#e8a812 55%,#ffd75e)', desc: '电光四射 · 皮卡丘 SAR 天价追卡', chaseNote: '皮卡丘 ex SAR' },
  { key: 'sv10', file: 'data/en-sv10.json', theme: 'linear-gradient(150deg,#33135e,#7a4fd0 55%,#c05cff)', desc: '火箭队归来 · 坂木的超梦 ex SAR', chaseNote: '火箭队的超梦 ex SAR' },
  { key: '151ja', file: 'data/ja-sv2a.json', theme: 'linear-gradient(150deg,#123a75,#2f6fd0 55%,#5eb1ff)', desc: '日版原版 151 · 7 张包 · 镜面闪', chaseNote: 'リザードンex SAR' },
];
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

/* ---------------- 存档 ---------------- */
const SAVE_KEY = 'ripjoy.save.v1';
let save = { collection: {}, stats: { packs: 0, cards: 0, l3: 0, l4: 0, spent: 0 }, history: [], firstPackDone: false, muted: false };
try { const raw = localStorage.getItem(SAVE_KEY); if (raw) save = { ...save, ...JSON.parse(raw) }; } catch {}
const persist = () => { try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch {} };
setMuted(!!save.muted);

/* ---------------- 数据 ---------------- */
const DATA = {}; const POOLS = {}; const CARDMAP = {};
async function loadSet(cfg) {
  if (DATA[cfg.key]) return DATA[cfg.key];
  const res = await fetch(cfg.file); const data = await res.json();
  DATA[cfg.key] = data; POOLS[cfg.key] = buildPools(data);
  for (const c of data.cards) CARDMAP[c.id] = { card: c, setKey: cfg.key, setName: data.name };
  return data;
}
const chaseOf = (data) => [...data.cards].filter(c => ['SAR', 'HR'].includes(tierOf(c))).sort((a, b) => (b.p || 0) - (a.p || 0))[0]
  || [...data.cards].sort((a, b) => (b.p || 0) - (a.p || 0))[0];
const ownedInSet = (data) => data.cards.filter(c => save.collection[c.id]).length;

/* ---------------- 全局 UI ---------------- */
const particles = new Particles($('#particles'));
function showView(name) {
  $$('.view').forEach(v => v.classList.toggle('active', v.id === `view-${name}`));
  $$('nav button').forEach(b => b.classList.toggle('active', b.dataset.view === name));
  window.scrollTo({ top: 0 });
  if (name === 'collection') renderCollection();
  if (name === 'stats') renderStats();
  if (name === 'open') renderSets();
}
$$('nav button').forEach(b => b.addEventListener('click', () => { sfx.click(); showView(b.dataset.view); }));
$('#muteBtn').addEventListener('click', () => {
  save.muted = !save.muted; setMuted(save.muted); persist();
  $('#muteBtn').textContent = save.muted ? '🔇' : '🔊';
});
$('#muteBtn').textContent = save.muted ? '🔇' : '🔊';

/* ---------------- 选弹页 ---------------- */
async function renderSets() {
  const grid = $('#setgrid'); grid.innerHTML = '';
  for (const cfg of SETS) {
    const data = await loadSet(cfg);
    const chase = chaseOf(data);
    const owned = ownedInSet(data);
    const el = document.createElement('article');
    el.className = 'setcard';
    el.innerHTML = `
      <div class="setbanner" style="background:${cfg.theme}">
        ${data.logo ? `<img class="logoimg" src="${data.logo}.png" alt="${data.name}" loading="lazy">` : `<h3 style="position:relative;z-index:1">${data.name}</h3>`}
        <img class="chase" src="${imgUrl(chase)}" alt="${chase.n}" loading="lazy">
      </div>
      <div class="setbody">
        <h3>${data.name} <span style="color:var(--dim2);font-size:12px">${data.lang === 'ja' ? '日版' : '英文版'} · ${data.total} 张</span></h3>
        <p class="setmeta">${cfg.desc}<br>大追：<span class="chase-name">${chase.n}</span> 参考价 <b style="color:var(--gold)">${fmtPrice(chase)}</b> · 每包 ${data.lang === 'ja' ? 7 : 10} 张</p>
        <div class="progressline"><i style="width:${(owned / data.cards.length) * 100}%"></i></div>
        <p class="setmeta">图鉴收集 ${owned} / ${data.cards.length}</p>
        <div class="setbtns">
          <button class="btn" data-act="one">撕一包</button>
          <button class="btn ghost" data-act="ten">十连开</button>
        </div>
      </div>`;
    el.querySelector('[data-act="one"]').addEventListener('click', () => startPack(cfg, false));
    el.querySelector('[data-act="ten"]').addEventListener('click', () => startTen(cfg));
    grid.appendChild(el);
  }
  const s = save.stats;
  $('#heroStats').innerHTML = s.packs
    ? `已开 <b>${s.packs}</b> 包 · 累计 <b>${s.cards}</b> 张 · 高稀有演出 <b>${s.l3 + s.l4}</b> 次 · 最佳战绩在「战绩」页`
    : `首包保底 <b>AR 以上</b> · 先撕一包，30 秒看到高稀有演出`;
}

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
  save.history.unshift({ ts: Date.now(), setKey: cfg.key, setName: DATA[cfg.key].name, n: pack.length, bestId: best.card.id, bestName: best.card.n, bestPrice: best.card.p, bestTier: tierOf(best.card) });
  save.history = save.history.slice(0, 30); persist();
}

function startPack(cfg, isRetry) {
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

function startTen(cfg) {
  const data = DATA[cfg.key];
  const all = [];
  for (let i = 0; i < 10; i++) {
    const pack = openPack(data, POOLS[cfg.key], { forceTop: false });
    pack.forEach(e => { e.isNew = collect(e); e.tier = tierOf(e.card); e.level = TIERS[e.tier].level; });
    finishPackToHistory(cfg, pack); all.push(...pack);
  }
  session = { cfg, pack: all, idx: 0, revealed: true, phase: 'summary', ten: true };
  showStage(); renderSummary();
  const hasTop = all.some(e => e.level >= 4);
  const hasL3 = all.some(e => e.level === 3);
  if (hasTop || hasL3) {
    const cx = innerWidth / 2, cy = innerHeight * 0.36;
    setTimeout(() => { fxForLevel(particles, hasTop ? 4 : 3, cx, cy); sfx.reveal(hasTop ? 4 : 3); vibrate(hasTop ? VIB.l4 : VIB.l3); if (hasTop) flash(); }, 250);
  }
}

function showStage() {
  $$('.view').forEach(v => v.classList.remove('active'));
  $('#view-open').classList.add('active'); window.scrollTo({ top: 0 });
  $('#stage').style.display = 'block'; $('#setgridWrap').style.display = 'none';
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
        <img class="packart" src="${imgUrl(chase, true)}" alt="${chase.n}">
        <div class="packshade"></div><div class="packtear"></div>
        ${data.logo ? `<img class="packlogo" src="${data.logo}.png" alt="">` : ''}
        <div class="packname">${data.name}</div>
        <div class="packsub">${data.lang === 'ja' ? '7 CARDS PER PACK' : '10 CARDS PER PACK'} · RipJoy</div>
      </div>
    </div>
    <p class="stagehint">点一下卡包，<b>撕开它</b><br><span style="font-size:12.5px">翻卡前留意卡背的光晕——颜色越暖，下一张越有货</span></p>
    <div class="stagebtns"><button class="btn" id="tearBtn">✂️ 撕 开</button></div>`;
  const tear = () => {
    if (!session || session.phase !== 'tear') return;
    session.phase = 'tearing';
    $('#packEl').classList.add('tearing'); sfx.tear(); vibrate(30);
    setTimeout(() => { session.phase = 'reveal'; renderReveal(); }, 980);
  };
  $('#packEl').addEventListener('click', tear);
  $('#tearBtn').addEventListener('click', tear);
}

/* ---------------- 逐张揭晓 ---------------- */
function renderReveal() {
  const { pack, idx } = session;
  const entry = pack[idx]; const next = pack[idx + 1];
  const st = $('#stageBody');
  const dots = pack.map((e, i) => `<i class="${i < idx ? 'done' : i === idx ? (e.level >= 3 ? 'hot' : 'now') : ''}"></i>`).join('');
  st.innerHTML = `
    <div class="revealmeta"><div class="dots">${dots}</div><span class="revealcount">${idx + 1} / ${pack.length}</span></div>
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
  $('#skipBtn').addEventListener('click', () => { session.phase = 'summary'; renderSummary(); });
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
      banner.textContent = entry.tier === 'HR' ? '✦ HYPER RARE · 金卡 ✦' : entry.tier === 'SAR' ? '✦ SAR · 特别插画稀有 ✦' : `${entry.tier} · ${TIERS[entry.tier].cn}`;
      banner.style.background = `linear-gradient(92deg, ${TIERS[entry.tier].color}, #fff2)`;
      banner.style.backgroundColor = TIERS[entry.tier].color;
      banner.classList.add('pop');
    } else if (entry.level === 1) { sfx.reveal(1); }
    $('#nextBtn').textContent = session.idx === session.pack.length - 1 ? '看结算' : '下一张';
  }, entry.level >= 4 ? 520 : 330);
  const t = TIERS[entry.tier];
  $('#cardInfo').innerHTML = `
    <div class="cname">${entry.card.n}<span class="tierbadge" style="background:${t.color}">${entry.tier}</span>${entry.reverse ? '<span class="revtag">反闪</span>' : ''}${entry.isNew ? '<span class="newtag">NEW</span>' : ''}</div>
    <div class="cmeta">No.${entry.card.no} · ${t.label} · 参考价 <b style="color:var(--gold)">${fmtPrice(entry.card)}</b>${entry.card.ill ? ` · 画师 ${entry.card.ill}` : ''} · 点卡片看大图，点「下一张」继续</div>`;
  $('#cardInfo').addEventListener('click', () => openDetail(entry.card));
  renderTray();
}
function advance() {
  if (!session) return;
  if (session.idx >= session.pack.length - 1) { session.phase = 'summary'; renderSummary(); return; }
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
      <p>${ten ? `共 ${pack.length} 张` : `${data.name}`} · 参考价合计 <b>€${total.toFixed(2)}</b> · 新卡 <b>${news}</b> 张${ten && sorted.some(e => e.level >= 4) ? ' · <b>含 SAR/HR！</b>' : ''}</p>
    </div>
    <div class="bestpull"><span class="besttag">最佳 · ${best.tier} · ${fmtPrice(best.card)}</span><img src="${imgUrl(best.card, true)}" alt="${best.card.n}"></div>
    <p style="text-align:center;color:var(--dim);font-size:13px">${best.card.n}</p>
    <div class="resultgrid">${sorted.map((e, i) => `
      <figure data-id="${e.card.id}" style="animation-delay:${Math.min(i * 30, 600)}ms">
        <img src="${imgUrl(e.card)}" alt="${e.card.n}" loading="lazy">
        <figcaption><span class="rdot" style="background:${TIERS[e.tier].color}"></span><b>${e.card.n}</b><br>${e.tier} · ${fmtPrice(e.card)}${e.isNew ? ' · NEW' : ''}</figcaption>
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
    return `<figure data-id="${x.card.id}"><span class="countbadge">×${x.n}</span><img src="${imgUrl(x.card)}" alt="${x.card.n}" loading="lazy"><figcaption><span class="rdot" style="background:${TIERS[t].color}"></span><b>${x.card.n}</b><br>${t} · ${fmtPrice(x.card)}</figcaption></figure>`;
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
  $('#bestPulls').innerHTML = best.length ? best.map(x => `<div class="historyitem"><img src="${imgUrl(x.card)}" alt=""><div class="hmeta"><b>${x.card.n}</b> · ${tierOf(x.card)}<br>${x.setName} · 参考价 <span style="color:var(--gold)">€${(x.card.p || 0).toFixed(2)}</span></div></div>`).join('') : '<div class="empty">还没有藏品</div>';
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
      <div class="mname">${card.n}<span class="tierbadge" style="background:${t.color}">${tierOf(card)}</span></div>
      <div class="mmeta">No.${card.no} · ${info?.setName || ''} · ${t.label}<br>参考价 <b style="color:var(--gold)">${fmtPrice(card)}</b>${card.ill ? ` · 画师 ${card.ill}` : ''}${cnt ? ` · 已拥有 ×${cnt}` : ''}<br><span style="font-size:12px">拖动卡片查看全息光泽</span></div>
      <button class="btn modalclose" id="modalClose">关 闭</button>
    </div>`;
  $('#modal').classList.add('open');
  addTilt($('#modalCard'), 16);
  $('#modalClose').addEventListener('click', closeDetail);
}
function closeDetail() { $('#modal').classList.remove('open'); }
$('#modal').addEventListener('click', (e) => { if (e.target.id === 'modal') closeDetail(); });

/* ---------------- 启动 ---------------- */
(async () => {
  await Promise.all(SETS.map(loadSet));
  renderSets();
})();
