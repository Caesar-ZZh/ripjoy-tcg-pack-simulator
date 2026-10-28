// WebAudio 合成音效（无素材） + 震动 + 3D 倾斜全息
let ac = null;
export let muted = false;
export const setMuted = (v) => { muted = v; };

function ctx() {
  if (!ac) ac = new (window.AudioContext || window.webkitAudioContext)();
  if (ac.state === 'suspended') ac.resume();
  return ac;
}
function tone(freq, t0, dur, type = 'triangle', gain = 0.12, slideTo = null) {
  if (muted) return;
  try {
    const a = ctx(), o = a.createOscillator(), g = a.createGain();
    const t = a.currentTime + t0;
    o.type = type; o.frequency.setValueAtTime(freq, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(gain, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(a.destination); o.start(t); o.stop(t + dur + 0.05);
  } catch {}
}
function noise(t0, dur, gain = 0.15, freq = 1200) {
  if (muted) return;
  try {
    const a = ctx(), len = Math.floor(a.sampleRate * dur);
    const buf = a.createBuffer(1, len, a.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = a.createBufferSource(); src.buffer = buf;
    const f = a.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = freq;
    const g = a.createGain(); g.gain.value = gain;
    src.connect(f).connect(g).connect(a.destination); src.start(a.currentTime + t0);
  } catch {}
}
export const sfx = {
  tear() { noise(0, 0.28, 0.25, 900); noise(0.08, 0.2, 0.18, 500); tone(180, 0, 0.2, 'sawtooth', 0.04, 60); noise(0.3, 0.14, 0.13, 2600); tone(840, 0.32, 0.1, 'sine', 0.05, 1250); },
  flip() { noise(0, 0.06, 0.08, 2400); tone(520, 0, 0.07, 'triangle', 0.05, 760); },
  sparkle() { tone(1568, 0, 0.09, 'sine', 0.05); tone(2093, 0.06, 0.12, 'sine', 0.045); },
  reveal(level) {
    tone(660, 0, 0.12); if (level >= 1) tone(880, 0.07, 0.14);
    if (level >= 2) { tone(1108, 0.14, 0.18); noise(0.05, 0.2, 0.06, 3200); }
    if (level >= 3) { [523, 659, 784, 1046].forEach((f, i) => tone(f, i * 0.07, 0.22, 'triangle', 0.11)); }
    if (level >= 4) { [523, 659, 784, 1046, 1318, 1568].forEach((f, i) => tone(f, i * 0.08, 0.3, 'triangle', 0.12)); noise(0, 0.5, 0.08, 4000); tone(130, 0, 0.4, 'sine', 0.16, 65); }
  },
  click() { tone(440, 0, 0.05, 'sine', 0.04); },
};
export function vibrate(pattern) {
  if (navigator.vibrate) { try { navigator.vibrate(pattern); } catch {} }
}
export const VIB = { flip: 8, l2: 22, l3: [30, 40, 30], l4: [60, 60, 120] };

/** 给元素加 3D 倾斜 + 全息光泽（CSS 变量 --rx/--ry/--mx/--my） */
export function addTilt(el, max = 14) {
  let raf = null;
  const move = (x, y) => {
    const r = el.getBoundingClientRect();
    const px = (x - r.left) / r.width, py = (y - r.top) / r.height;
    el.style.setProperty('--ry', `${(px - 0.5) * max * 2}deg`);
    el.style.setProperty('--rx', `${(0.5 - py) * max * 2}deg`);
    el.style.setProperty('--mx', `${px * 100}%`); el.style.setProperty('--my', `${py * 100}%`);
  };
  el.addEventListener('pointermove', (e) => { if (raf) return; raf = requestAnimationFrame(() => { move(e.clientX, e.clientY); raf = null; }); });
  el.addEventListener('pointerleave', () => { el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); });
}
