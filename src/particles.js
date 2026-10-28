// 自研 Canvas 粒子引擎（零依赖）：按稀有度级别配置爆发/雨/纸屑
export class Particles {
  constructor(canvas) {
    this.cv = canvas; this.ctx = canvas.getContext('2d');
    this.list = []; this.raf = null; this.reduced = false;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.reduced = mq.matches || (navigator.deviceMemory && navigator.deviceMemory <= 2);
    this.resize(); window.addEventListener('resize', () => this.resize());
    document.addEventListener('visibilitychange', () => { if (document.hidden) this.stop(); });
  }
  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.cv.width = innerWidth * dpr; this.cv.height = innerHeight * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  spawn(p) { this.list.push(p); }
  burst(x, y, { count = 40, colors = ['#fff'], speed = [120, 420], size = [2, 5], life = [0.5, 1.1], gravity = 500, shapes = ['circle'], spread = Math.PI * 2 } = {}) {
    if (this.reduced) count = Math.ceil(count / 3);
    for (let i = 0; i < count; i++) {
      const a = Math.random() * spread - spread / 2 - Math.PI / 2;
      const sp = speed[0] + Math.random() * (speed[1] - speed[0]);
      this.spawn({
        x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
        size: size[0] + Math.random() * (size[1] - size[0]),
        color: colors[Math.floor(Math.random() * colors.length)],
        life: life[0] + Math.random() * (life[1] - life[0]), t: 0,
        gravity, drag: 0.92, shape: shapes[Math.floor(Math.random() * shapes.length)],
        rot: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 10, alpha: 1,
      });
    }
    this.start();
  }
  rain({ count = 60, colors = ['#ff5c8a', '#ffd75e', '#5eb1ff', '#7fd08c'], shapes = ['circle'] } = {}) {
    if (this.reduced) count = Math.ceil(count / 3);
    for (let i = 0; i < count; i++) {
      this.spawn({
        x: Math.random() * innerWidth, y: -20 - Math.random() * innerHeight * 0.4,
        vx: (Math.random() - 0.5) * 40, vy: 60 + Math.random() * 140,
        size: 2 + Math.random() * 4, color: colors[Math.floor(Math.random() * colors.length)],
        life: 2.2, t: -Math.random() * 0.8, gravity: 30, drag: 1, shape: shapes[Math.floor(Math.random() * shapes.length)], rot: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 6, alpha: 0.9,
      });
    }
    this.start();
  }
  // 撕包碎片：从撕口向外飞溅的纸屑/箔片
  shards(x, y, colors = ['#ffffff', '#ffd75e', '#dfe6ee']) {
    let count = this.reduced ? 10 : 30;
    for (let i = 0; i < count; i++) {
      const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.4;
      const sp = 140 + Math.random() * 380;
      this.spawn({
        x: x + (Math.random() - 0.5) * 120, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 60,
        size: 2.5 + Math.random() * 4.5, color: colors[Math.floor(Math.random() * colors.length)],
        life: 0.6 + Math.random() * 0.7, t: 0, gravity: 620, drag: 0.94,
        shape: Math.random() < 0.5 ? 'shard' : 'ribbon', rot: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 16,
        flap: 9 + Math.random() * 8, phase: Math.random() * 6.28, alpha: 1,
      });
    }
    this.start();
  }
  // 扇形光轨：沿速度方向拉长的流光线条
  streakFan(x, y, { count = 14, colors = ['#ffd75e', '#ffffff'] } = {}) {
    if (this.reduced) count = Math.ceil(count / 2);
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 260 + Math.random() * 420;
      this.spawn({
        x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
        size: 1.6 + Math.random() * 2.2, color: colors[Math.floor(Math.random() * colors.length)],
        life: 0.34 + Math.random() * 0.3, t: 0, gravity: 0, drag: 0.9, shape: 'streak', rot: 0, vr: 0, alpha: 1,
      });
    }
    this.start();
  }
  // 金色喷泉：从卡片底部向上喷再回落的余烬
  fountain(x, y, colors = ['#ffe98a', '#ffd700', '#fff6c8']) {
    let count = this.reduced ? 16 : 44;
    for (let i = 0; i < count; i++) {
      const a = -Math.PI / 2 + (Math.random() - 0.5) * 0.9;
      const sp = 300 + Math.random() * 380;
      this.spawn({
        x: x + (Math.random() - 0.5) * 60, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
        size: 1.8 + Math.random() * 3, color: colors[Math.floor(Math.random() * colors.length)],
        life: 0.9 + Math.random() * 0.9, t: -Math.random() * 0.25, gravity: 560, drag: 0.985,
        shape: Math.random() < 0.6 ? 'ember' : 'star', rot: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 8,
        phase: Math.random() * 6.28, alpha: 1,
      });
    }
    this.start();
  }
  // 撕包页氛围浮尘：元素区域内缓慢漂浮的微光尘埃
  ambientOn(el) {
    if (this.reduced || !el) return;
    this.ambEl = el; this.ambLast = 0;
    this.start();
  }
  ambientOff() { this.ambEl = null; this.list = this.list.filter(p => p.shape !== 'mote'); }
  ring(x, y, color = '#ffd75e') {
    this.spawn({ ring: true, x, y, r: 10, vr2: 620, life: 0.7, t: 0, color, alpha: 0.9, size: 3 });
    this.start();
  }
  start() {
    if (this.raf) return;
    let last = performance.now();
    const tick = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05); last = now;
      const { ctx } = this;
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      // 氛围浮尘补充
      if (this.ambEl && now - (this.ambLast || 0) > 220) {
        this.ambLast = now;
        const r = this.ambEl.getBoundingClientRect();
        if (r.width && this.list.filter(p => p.shape === 'mote').length < 26) {
          this.spawn({
            x: r.left + Math.random() * r.width, y: r.top + r.height * (0.25 + Math.random() * 0.75),
            vx: (Math.random() - 0.5) * 8, vy: -5 - Math.random() * 11,
            size: 1.1 + Math.random() * 2.3, color: Math.random() < 0.4 ? '#ffd75e' : '#cfe0ff',
            life: 4.5 + Math.random() * 3, t: 0, gravity: 0, drag: 1, shape: 'mote',
            rot: 0, vr: 0, alpha: 0.2 + Math.random() * 0.26, sway: 0.6 + Math.random() * 0.9, phase: Math.random() * 6.28,
          });
        }
      }
      this.list = this.list.filter(p => p.t < p.life);
      for (const p of this.list) {
        p.t += dt; if (p.t < 0) continue;
        const k = 1 - p.t / p.life;
        if (p.ring) {
          p.r += p.vr2 * dt;
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.strokeStyle = p.color; ctx.globalAlpha = p.alpha * k; ctx.lineWidth = 3 * k + 0.5; ctx.stroke();
          continue;
        }
        p.vy += p.gravity * dt; p.vx *= p.drag; p.vy *= (p.shape === 'rect' || p.shape === 'ribbon' ? 0.99 : p.drag + 0.06);
        p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
        if (p.sway) p.x += Math.sin(p.t * p.sway + (p.phase || 0)) * 16 * dt;
        ctx.globalAlpha = Math.max(p.alpha * k, 0);
        ctx.fillStyle = p.color;
        if (p.shape === 'rect') {
          ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
          ctx.fillRect(-p.size, -p.size * 0.6, p.size * 2, p.size * 1.2); ctx.restore();
        } else if (p.shape === 'ribbon') {
          ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
          ctx.scale(1, 0.3 + 0.7 * Math.abs(Math.sin(p.t * (p.flap || 10) + (p.phase || 0))));
          ctx.fillRect(-p.size, -p.size * 0.45, p.size * 2, p.size * 0.9); ctx.restore();
        } else if (p.shape === 'shard') {
          ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
          ctx.beginPath(); ctx.moveTo(0, -p.size); ctx.lineTo(p.size * 0.85, p.size * 0.7); ctx.lineTo(-p.size * 0.85, p.size * 0.7); ctx.closePath(); ctx.fill(); ctx.restore();
        } else if (p.shape === 'streak') {
          ctx.save();
          ctx.globalCompositeOperation = 'lighter';
          ctx.strokeStyle = p.color; ctx.lineWidth = p.size; ctx.lineCap = 'round';
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - p.vx * 0.055, p.y - p.vy * 0.055); ctx.stroke();
          ctx.restore();
        } else if (p.shape === 'ember') {
          ctx.save();
          ctx.globalCompositeOperation = 'lighter';
          ctx.globalAlpha = Math.max(p.alpha * k * (0.7 + 0.3 * Math.sin(p.t * 21 + (p.phase || 0))), 0);
          ctx.beginPath(); ctx.arc(p.x, p.y, p.size * (0.75 + 0.25 * Math.sin(p.t * 17 + (p.phase || 0))) + 0.4, 0, Math.PI * 2); ctx.fill();
          ctx.restore();
        } else if (p.shape === 'star') {
          ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
          ctx.beginPath();
          for (let i = 0; i < 8; i++) { const r = i % 2 ? p.size * 0.4 : p.size; const a = i * Math.PI / 4; ctx[i ? 'lineTo' : 'moveTo'](Math.cos(a) * r, Math.sin(a) * r); }
          ctx.closePath(); ctx.fill(); ctx.restore();
        } else {
          ctx.beginPath(); ctx.arc(p.x, p.y, p.size * k + 0.4, 0, Math.PI * 2); ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
      if (this.list.length || this.ambEl) { this.raf = requestAnimationFrame(tick); }
      else { this.raf = null; ctx.clearRect(0, 0, innerWidth, innerHeight); }
    };
    this.raf = requestAnimationFrame(tick);
  }
  stop() { if (this.raf) cancelAnimationFrame(this.raf); this.raf = null; }
}

// 按演出级别触发的组合特效
export function fxForLevel(particles, level, cx, cy) {
  if (level === 1) {
    particles.burst(cx, cy, { count: 12, colors: ['#ffffff', '#ffe9a8', '#bfe3ff'], shapes: ['star', 'circle'], speed: [50, 170], size: [1.4, 3.2], gravity: 130, life: [0.4, 0.8] });
  } else if (level === 2) {
    particles.burst(cx, cy, { count: 30, colors: ['#b78cff', '#ff7fd0', '#ffffff'], shapes: ['star', 'circle', 'ember'], speed: [80, 310], gravity: 240 });
    particles.streakFan(cx, cy, { count: 10, colors: ['#d9baff', '#ffffff'] });
    particles.ring(cx, cy, '#c9a2ff');
  } else if (level === 3) {
    particles.burst(cx, cy, { count: 76, colors: ['#ff9d5c', '#ffd75e', '#ff5c8a', '#5eb1ff', '#7fd08c'], shapes: ['circle', 'star', 'ember'], speed: [120, 470] });
    particles.burst(cx, cy, { count: 26, colors: ['#ffd75e', '#ff9d5c', '#ffffff'], shapes: ['ribbon'], speed: [90, 300], gravity: 260, life: [0.8, 1.4] });
    particles.streakFan(cx, cy, { count: 16, colors: ['#ffd75e', '#ffb35c', '#ffffff'] });
    particles.ring(cx, cy, '#ffb35c'); setTimeout(() => particles.ring(cx, cy, '#ffd75e'), 200);
    particles.rain({ count: 44 });
  } else if (level >= 4) {
    particles.burst(cx, cy, { count: 130, colors: ['#ffe98a', '#ffd700', '#ffffff', '#ff5c8a'], shapes: ['circle', 'star', 'ember'], speed: [160, 640], life: [0.7, 1.5] });
    particles.burst(cx, cy, { count: 54, colors: ['#ff5c8a', '#5eb1ff', '#7fd08c', '#b78cff'], shapes: ['ribbon', 'rect'], speed: [100, 390], gravity: 300, life: [0.9, 1.6] });
    particles.streakFan(cx, cy, { count: 26, colors: ['#ffe98a', '#ffd700', '#ffffff'] });
    particles.fountain(cx, cy + 90);
    particles.ring(cx, cy, '#ffe98a'); setTimeout(() => particles.ring(cx, cy, '#ff5c8a'), 170); setTimeout(() => particles.ring(cx, cy, '#ffd700'), 360);
    particles.rain({ count: 80, colors: ['#ffd700', '#ffe98a', '#fff6c8', '#ffdf6b'], shapes: ['streak', 'star', 'circle'] });
  }
}
