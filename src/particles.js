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
  rain({ count = 60, colors = ['#ff5c8a', '#ffd75e', '#5eb1ff', '#7fd08c'] } = {}) {
    if (this.reduced) count = Math.ceil(count / 3);
    for (let i = 0; i < count; i++) {
      this.spawn({
        x: Math.random() * innerWidth, y: -20 - Math.random() * innerHeight * 0.4,
        vx: (Math.random() - 0.5) * 40, vy: 60 + Math.random() * 140,
        size: 2 + Math.random() * 4, color: colors[Math.floor(Math.random() * colors.length)],
        life: 2.2, t: -Math.random() * 0.8, gravity: 30, drag: 1, shape: 'circle', rot: 0, vr: 0, alpha: 0.9,
      });
    }
    this.start();
  }
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
        p.vy += p.gravity * dt; p.vx *= p.drag; p.vy *= (p.shape === 'rect' ? 0.99 : p.drag + 0.06);
        p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
        ctx.globalAlpha = Math.max(p.alpha * k, 0);
        ctx.fillStyle = p.color;
        if (p.shape === 'rect') {
          ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
          ctx.fillRect(-p.size, -p.size * 0.6, p.size * 2, p.size * 1.2); ctx.restore();
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
      if (this.list.length) { this.raf = requestAnimationFrame(tick); }
      else { this.raf = null; ctx.clearRect(0, 0, innerWidth, innerHeight); }
    };
    this.raf = requestAnimationFrame(tick);
  }
  stop() { if (this.raf) cancelAnimationFrame(this.raf); this.raf = null; }
}

// 按演出级别触发的组合特效
export function fxForLevel(particles, level, cx, cy) {
  if (level === 2) {
    particles.burst(cx, cy, { count: 26, colors: ['#b78cff', '#ff7fd0', '#ffffff'], shapes: ['star', 'circle'], speed: [80, 300], gravity: 240 });
  } else if (level === 3) {
    particles.burst(cx, cy, { count: 70, colors: ['#ff9d5c', '#ffd75e', '#ff5c8a', '#5eb1ff', '#7fd08c'], shapes: ['circle', 'star'], speed: [120, 460] });
    particles.ring(cx, cy, '#ffb35c'); particles.rain({ count: 40 });
  } else if (level >= 4) {
    particles.burst(cx, cy, { count: 120, colors: ['#ffe98a', '#ffd700', '#ffffff', '#ff5c8a'], shapes: ['circle', 'star', 'rect'], speed: [160, 620], life: [0.7, 1.5] });
    particles.burst(cx, cy, { count: 50, colors: ['#ff5c8a', '#5eb1ff', '#7fd08c', '#b78cff'], shapes: ['rect'], speed: [100, 380], gravity: 300 });
    particles.ring(cx, cy, '#ffe98a'); setTimeout(() => particles.ring(cx, cy, '#ff5c8a'), 160);
    particles.rain({ count: 70 });
  }
}
