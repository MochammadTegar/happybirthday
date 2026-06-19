const canvas = document.getElementById('c');
const ctx    = canvas.getContext('2d');

const CHARS  = ['S','I','L','V','A','♡'];
const COLORS = ['#FF1493','#C2185B','#880E4F'];

let drops;
let sequenceStarted = false;

// ── PARTICLES ──
let particles = [];
let shards    = [];

function spawnHeartBurst() {
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const count = 150;
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 / count) * i + (Math.random() - 0.5) * 0.4;
    const speed = 6 + Math.random() * 12;
    particles.push({
      x     : cx,
      y     : cy,
      vx    : Math.cos(angle) * speed,
      vy    : Math.sin(angle) * speed,
      alpha : 1,
      size  : 12 + Math.random() * 14,
      color : COLORS[Math.floor(Math.random() * COLORS.length)],
      decay : 0.012 + Math.random() * 0.01
    });
  }
}

function spawnShatter() {
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const count = 22 + Math.floor(Math.random() * 22);

  for (let i = 0; i < count; i++) {
    const angle  = Math.random() * Math.PI * 2;
    const speed  = 2 + Math.random() * 7;
    const points = 3 + Math.floor(Math.random() * 3);
    const size   = 3 + Math.random() * 8;
    const verts  = [];
    for (let j = 0; j < points; j++) {
      const a = (Math.PI * 2 / points) * j + (Math.random() - 0.5) * 0.8;
      const r = size * (0.5 + Math.random() * 0.5);
      verts.push([Math.cos(a) * r, Math.sin(a) * r]);
    }
    shards.push({
      x      : cx + (Math.random() - 0.5) * 120,
      y      : cy + (Math.random() - 0.5) * 60,
      vx     : Math.cos(angle) * speed,
      vy     : Math.sin(angle) * speed - 1,
      rot    : Math.random() * Math.PI * 2,
      rotV   : (Math.random() - 0.5) * 0.2,
      alpha  : 1,
      decay  : 0.018 + Math.random() * 0.015,
      color  : COLORS[Math.floor(Math.random() * COLORS.length)],
      verts,
      gravity: 0.12
    });
  }
}

function drawParticles() {
  particles.forEach(p => {
    ctx.globalAlpha = Math.max(0, p.alpha);
    ctx.fillStyle   = p.color;
    ctx.font        = `${p.size}px serif`;
    ctx.fillText('❤', p.x, p.y);
    p.x     += p.vx;
    p.y     += p.vy;
    p.vy    += 0.08;
    p.alpha -= p.decay;
  });
  ctx.globalAlpha = 1;
  particles = particles.filter(p => p.alpha > 0);
}

function drawShards() {
  shards.forEach(s => {
    ctx.save();
    ctx.globalAlpha = Math.max(0, s.alpha);
    ctx.translate(s.x, s.y);
    ctx.rotate(s.rot);
    ctx.beginPath();
    ctx.moveTo(s.verts[0][0], s.verts[0][1]);
    for (let i = 1; i < s.verts.length; i++) {
      ctx.lineTo(s.verts[i][0], s.verts[i][1]);
    }
    ctx.closePath();
    ctx.fillStyle   = s.color;
    ctx.globalAlpha = Math.max(0, s.alpha) * 0.7;
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth   = 0.5;
    ctx.globalAlpha = Math.max(0, s.alpha) * 0.4;
    ctx.stroke();
    ctx.restore();

    s.x   += s.vx;
    s.y   += s.vy;
    s.vy  += s.gravity;
    s.rot += s.rotV;
    s.alpha -= s.decay;
  });
  shards = shards.filter(s => s.alpha > 0);
}

function resize() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}

function initDrops() {
  drops = [];
  const baseSize = 10;

  const colsBack = Math.floor(canvas.width / baseSize);
  const rowsBack = Math.ceil(canvas.height / baseSize);
  for (let i = 0; i < colsBack; i++) {
    for (let k = 0; k < 2; k++) {
      const len = 40 + Math.floor(Math.random() * 80);
      const y   = -(Math.random() * rowsBack * 2) - (k * rowsBack * 0.8);
      drops.push({
        y,
        speed    : 0.25 + Math.random() * 0.1,
        len,
        fontSize : baseSize,
        maxAlpha : 0.45,
        color    : COLORS[Math.floor(Math.random() * COLORS.length)],
        chars    : Array.from({ length: 30 }, () => CHARS[Math.floor(Math.random() * CHARS.length)]),
        col      : i,
        layer    : 'back'
      });
    }
  }

  const frontSize = 16;
  const colsFront = Math.floor(canvas.width / frontSize);
  const rowsFront = Math.ceil(canvas.height / frontSize);
  for (let i = 0; i < colsFront; i++) {
    const len = 20 + Math.floor(Math.random() * 40);
    const y   = -(Math.random() * rowsFront * 2);
    drops.push({
      y,
      speed    : 0.3 + Math.random() * 0.1,
      len,
      fontSize : frontSize,
      maxAlpha : 1.0,
      color    : COLORS[Math.floor(Math.random() * COLORS.length)],
      chars    : Array.from({ length: 30 }, () => CHARS[Math.floor(Math.random() * CHARS.length)]),
      col      : i,
      layer    : 'front'
    });
  }
}

function drawFrame() {
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const half = canvas.height / 2;

  ['back', 'front'].forEach(layer => {
    drops.filter(d => d.layer === layer).forEach(d => {
      const fs = d.fontSize;
      ctx.font = `${fs}px serif`;
      const x  = d.col * fs;

      for (let j = 0; j < d.len; j++) {
        const row = Math.floor(d.y) - j;
        const y   = row * fs;
        if (y < 0 || y > canvas.height) continue;

        const ratio = j / d.len;
        ctx.fillStyle   = d.color;
        ctx.globalAlpha = Math.max(0, d.maxAlpha * (1 - ratio));
        ctx.fillText(d.chars[j % d.chars.length], x, y);
      }
      ctx.globalAlpha = 1;

      d.y += d.speed;

      if ((d.y - d.len) * fs > canvas.height) {
        d.y     = -d.len - Math.floor(Math.random() * 20);
        d.speed = layer === 'back'
          ? 0.25 + Math.random() * 0.1
          : 0.3  + Math.random() * 0.1;
        d.len   = layer === 'back'
          ? 40 + Math.floor(Math.random() * 80)
          : 20 + Math.floor(Math.random() * 40);
        d.color = COLORS[Math.floor(Math.random() * COLORS.length)];
      }
    });
  });

  drawShards();
  drawParticles();

  if (!sequenceStarted) {
    const anyHalf = drops.some(d => d.y * d.fontSize >= half);
    if (anyHalf) {
      sequenceStarted = true;
      runSequence();
    }
  }

  requestAnimationFrame(drawFrame);
}

window.addEventListener('resize', () => { resize(); initDrops(); });
resize();
initDrops();
drawFrame();

// ── SEQUENCE ──
const lbl = document.getElementById('lbl');

function showLabel(text, duration) {
  return new Promise(resolve => {
    lbl.textContent = text;
    lbl.classList.remove('pop', 'shatter');
    void lbl.offsetWidth;
    lbl.classList.add('pop');
    setTimeout(() => {
      lbl.classList.remove('pop');
      lbl.classList.add('shatter');
      spawnShatter();
      setTimeout(() => {
        lbl.classList.remove('shatter');
        lbl.textContent = '';
        setTimeout(resolve, 80);
      }, 300);
    }, duration);
  });
}

function showLabelNoShatter(text, duration) {
  return new Promise(resolve => {
    lbl.textContent = text;
    lbl.classList.remove('pop', 'shatter');
    void lbl.offsetWidth;
    lbl.classList.add('pop');
    setTimeout(() => {
      lbl.classList.remove('pop');
      lbl.textContent = '';
      setTimeout(resolve, 80);
    }, duration);
  });
}

function wait(ms) { return new Promise(r => setTimeout(r, ms)); }

async function runSequence() {
  await showLabel('3', 700);
  await wait(100);
  await showLabel('2', 700);
  await wait(100);
  await showLabel('1', 700);
  await wait(200);
  lbl.classList.add('text');
  await showLabel('HAPPY', 800);
  await wait(100);
  await showLabel('BIRTHDAY', 800);
  await wait(100);
  await showLabelNoShatter('SAYANG!!', 800);
  lbl.classList.remove('text');
  await wait(100);

// ── HEART BURST ──
  spawnHeartBurst();
  await wait(200);
  spawnHeartBurst();
  await wait(200);
  spawnHeartBurst();
  await wait(400);

  // fade to black lalu pindah
document.body.classList.add('fade-out');

await wait(1200);

window.location.href = 'page/amplop.html';
}