// Source for the bundled explainer videos (rendered to MP4 by render-clips.mjs).
// Each clip draws one frame for time t (seconds) on a 540×960 design canvas.
// Keep text and key visuals out of the bottom ~20% (covered by the app's title overlay)
// and away from the side edges (the app crops slightly with object-fit: cover).
/* global window */
(function () {
  const W = 540, H = 960;
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const ease = (x) => { x = clamp(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
  const fade = (t, a, b, f = 0.4) => clamp(Math.min((t - a) / f, (b - t) / f));
  const FONT = 'system-ui, "DejaVu Sans", sans-serif';

  function bg(ctx, c1, c2) {
    const g = ctx.createLinearGradient(0, 0, W * 0.4, H);
    g.addColorStop(0, c1); g.addColorStop(1, c2);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  }

  function wrap(ctx, text, maxW) {
    const words = text.split(' '); const lines = []; let line = '';
    for (const w of words) {
      const test = line ? `${line} ${w}` : w;
      if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = w; } else line = test;
    }
    if (line) lines.push(line);
    return lines;
  }

  // Timed captions near the top of the frame.
  function captions(ctx, t, list, y = 150) {
    for (const [a, b, text] of list) {
      const o = fade(t, a, b);
      if (o <= 0) continue;
      ctx.save();
      ctx.globalAlpha = o;
      ctx.font = `700 30px ${FONT}`;
      ctx.textAlign = 'center';
      const lines = wrap(ctx, text, 440);
      const lh = 38, pad = 16, bw = 470, bh = lines.length * lh + pad * 2;
      ctx.fillStyle = 'rgba(0,0,0,0.45)';
      roundRect(ctx, (W - bw) / 2, y - pad - 28 + (1 - o) * 10, bw, bh, 16); ctx.fill();
      ctx.fillStyle = '#fff';
      lines.forEach((l, i) => ctx.fillText(l, W / 2, y + i * lh + (1 - o) * 10));
      ctx.restore();
    }
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }

  function label(ctx, text, x, y, size = 22, color = '#fff', align = 'center', weight = 700) {
    ctx.font = `${weight} ${size}px ${FONT}`; ctx.textAlign = align; ctx.fillStyle = color; ctx.fillText(text, x, y);
  }

  // ---------------- 1. Moon phases ----------------
  // Top-down view, Sun far to the left. e = elongation from new moon.
  function drawPhase(ctx, x, y, r, e) {
    e = ((e % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    const waxing = e < Math.PI;
    ctx.fillStyle = '#2b2f3a';
    ctx.beginPath(); ctx.arc(x, y, r, 0, 2 * Math.PI); ctx.fill();
    ctx.fillStyle = '#f4f1de';
    ctx.beginPath(); ctx.arc(x, y, r, -Math.PI / 2, Math.PI / 2, !waxing); ctx.fill();
    const c = Math.cos(e);
    ctx.fillStyle = c > 0 ? '#2b2f3a' : '#f4f1de';
    ctx.beginPath(); ctx.ellipse(x, y, Math.max(0.01, r * Math.abs(c)), r, 0, 0, 2 * Math.PI); ctx.fill();
  }

  const moon = {
    id: 'moon-phases', duration: 21, poster: 6.5,
    draw(ctx, t) {
      bg(ctx, '#0b1026', '#312e81');
      // stars
      for (let i = 0; i < 60; i++) {
        const sx = (i * 137.5) % W, sy = (i * 271.3) % H;
        ctx.fillStyle = `rgba(255,255,255,${0.25 + 0.5 * ((i * 7) % 10) / 10})`;
        ctx.fillRect(sx, sy, 2, 2);
      }
      // sunlight from the left
      const g = ctx.createLinearGradient(0, 0, 140, 0);
      g.addColorStop(0, 'rgba(253,224,71,0.55)'); g.addColorStop(1, 'rgba(253,224,71,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 280, 150, 400);
      label(ctx, '☀️', 62, 350, 40); label(ctx, 'Sunlight', 40, 390, 18, '#fde68a', 'left', 600);
      for (let i = 0; i < 5; i++) {
        const y = 430 + i * 50, off = ((t * 60) % 40);
        ctx.strokeStyle = 'rgba(253,224,71,0.5)'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(36 + off, y); ctx.lineTo(80 + off, y); ctx.stroke();
      }
      const cx = 300, cy = 480, R = 150;
      ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.setLineDash([6, 8]); ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, 2 * Math.PI); ctx.stroke(); ctx.setLineDash([]);
      // Earth (lit on the sun side)
      ctx.fillStyle = '#1d4ed8'; ctx.beginPath(); ctx.arc(cx, cy, 34, 0, 2 * Math.PI); ctx.fill();
      ctx.fillStyle = '#22c55e'; ctx.beginPath(); ctx.arc(cx - 8, cy - 6, 14, 0, 2 * Math.PI); ctx.fill();
      ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.beginPath(); ctx.arc(cx, cy, 34, -Math.PI / 2, Math.PI / 2); ctx.fill();
      // Moon: starts at new moon (between Earth and Sun) and orbits counter-clockwise.
      const e = 2 * Math.PI * clamp((t - 1.5) / 16);
      const phi = Math.PI + e;
      const mx = cx + R * Math.cos(phi), my = cy - R * Math.sin(phi);
      ctx.fillStyle = '#2b2f3a'; ctx.beginPath(); ctx.arc(mx, my, 20, 0, 2 * Math.PI); ctx.fill();
      ctx.fillStyle = '#f4f1de'; ctx.beginPath(); ctx.arc(mx, my, 20, Math.PI / 2, -Math.PI / 2); ctx.fill();
      // orbit labels
      const names = [['New', Math.PI], ['First quarter', 1.5 * Math.PI], ['Full', 0], ['Last quarter', 0.5 * Math.PI]];
      for (const [n, a] of names) {
        const lx = cx + (R + 48) * Math.cos(a), ly = cy - (R + 40) * Math.sin(a) + 8;
        label(ctx, n, clamp(lx, 90, W - 70), ly, 17, 'rgba(255,255,255,0.75)', 'center', 600);
      }
      // "as seen from Earth" inset
      ctx.fillStyle = 'rgba(0,0,0,0.35)'; roundRect(ctx, 150, 700, 240, 110, 18); ctx.fill();
      drawPhase(ctx, 210, 755, 40, e);
      label(ctx, 'From Earth', 320, 745, 18, '#c7d2fe', 'center', 600);
      const day = Math.min(29.5, (e / (2 * Math.PI)) * 29.5);
      label(ctx, `Day ${day.toFixed(1)}`, 320, 775, 22, '#fff');
      captions(ctx, t, [
        [0, 4, 'Why does the Moon change shape?'],
        [4, 8.5, 'The Sun always lights up half of the Moon.'],
        [8.5, 13, 'As it orbits Earth, we see different amounts of that lit half.'],
        [13, 17, 'It’s not Earth’s shadow — that only happens in a lunar eclipse.'],
        [17, 21, 'One full cycle of phases takes about 29.5 days.'],
      ]);
    },
  };

  // ---------------- 2. Pythagoras by rearrangement ----------------
  const pyth = {
    id: 'pythagoras', duration: 21, poster: 7,
    draw(ctx, t) {
      bg(ctx, '#2e1065', '#7e22ce');
      const a = 130, b = 220, S = a + b, x0 = (W - S) / 2, y0 = 300;
      const k = ease((t - 9.5) / 3); // 0 → 1 rearrangement
      // Each triangle: right-angle vertex position from→to, rotation (deg). Legs: a along local x, b along local y.
      const tris = [
        { from: [0, 0], to: [0, a], rot: 0, color: '#f472b6' },
        { from: [S, 0], to: [S, 0], rot: 90, color: '#60a5fa' },
        { from: [S, S], to: [a, S], rot: 180, color: '#34d399' },
        { from: [0, S], to: [a, a], rot: 270, color: '#fbbf24' },
      ];
      ctx.fillStyle = '#1e1b4b'; ctx.fillRect(x0, y0, S, S);
      for (const tr of tris) {
        const px = tr.from[0] + (tr.to[0] - tr.from[0]) * k, py = tr.from[1] + (tr.to[1] - tr.from[1]) * k;
        ctx.save(); ctx.translate(x0 + px, y0 + py); ctx.rotate((tr.rot * Math.PI) / 180);
        ctx.fillStyle = tr.color; ctx.strokeStyle = '#1e1b4b'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(a, 0); ctx.lineTo(0, b); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.restore();
      }
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.strokeRect(x0, y0, S, S);
      const o1 = clamp(1 - k * 3), o2 = clamp((k - 0.7) / 0.3);
      ctx.globalAlpha = o1 * fade(t, 5, 30); label(ctx, 'c²', x0 + S / 2, y0 + S / 2 + 18, 54); ctx.globalAlpha = 1;
      ctx.globalAlpha = o2; label(ctx, 'a²', x0 + a / 2, y0 + a / 2 + 14, 40);
      label(ctx, 'b²', x0 + a + b / 2, y0 + a + b / 2 + 18, 54); ctx.globalAlpha = 1;
      // side labels on the first triangle (before moving)
      ctx.globalAlpha = o1 * fade(t, 3, 30);
      label(ctx, 'a', x0 + a / 2, y0 - 10, 22, '#fbcfe8'); label(ctx, 'b', x0 - 16, y0 + b / 2, 22, '#fbcfe8');
      label(ctx, 'c', x0 + a / 2 + 12, y0 + b / 2 + 4, 22, '#fbcfe8');
      ctx.globalAlpha = 1;
      if (t > 17) {
        ctx.globalAlpha = fade(t, 17, 30);
        label(ctx, 'a² + b² = c²', W / 2, y0 + S + 80, 46);
        ctx.globalAlpha = 1;
      }
      captions(ctx, t, [
        [0, 4.5, 'a² + b² = c². Here’s a proof with no algebra.'],
        [4.5, 9.5, 'Four copies of a right triangle in a big square leave a tilted square: c².'],
        [9.5, 13, 'Now slide the same triangles around…'],
        [13, 17, 'The empty space is now two squares: a² and b².'],
        [17, 21, 'Same square, same triangles, same empty area!'],
      ]);
    },
  };

  // ---------------- 3. Pendulums ----------------
  // Integrate θ'' = -(g/L) sin θ with RK4; cached per (L, θ0).
  const sims = new Map();
  function swing(L, deg, t) {
    const key = `${L}:${deg}`;
    if (!sims.has(key)) {
      const g = 9.81, dt = 1 / 600, out = [];
      let th = (deg * Math.PI) / 180, w = 0;
      const f = (th) => (-g / L) * Math.sin(th);
      for (let i = 0; i <= 600 * 22; i++) {
        out.push(th);
        const k1t = w, k1w = f(th);
        const k2t = w + k1w * dt / 2, k2w = f(th + k1t * dt / 2);
        const k3t = w + k2w * dt / 2, k3w = f(th + k2t * dt / 2);
        const k4t = w + k3w * dt, k4w = f(th + k3t * dt);
        th += (dt / 6) * (k1t + 2 * k2t + 2 * k3t + k4t);
        w += (dt / 6) * (k1w + 2 * k2w + 2 * k3w + k4w);
      }
      sims.set(key, out);
    }
    const arr = sims.get(key);
    return arr[Math.min(arr.length - 1, Math.max(0, Math.round(t * 600)))];
  }
  // Full swings completed = number of returns to the starting side's peak.
  function swings(L, deg, t) {
    return Math.floor(Math.max(0, t) / (2 * Math.PI * Math.sqrt(L / 9.81) * (1 + Math.pow((deg * Math.PI) / 180, 2) / 16)));
  }
  function drawPendulum(ctx, px, py, L, scale, th, color, text) {
    const bx = px + Math.sin(th) * L * scale, by = py + Math.cos(th) * L * scale;
    ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(bx, by); ctx.stroke();
    ctx.fillStyle = color; ctx.beginPath(); ctx.arc(bx, by, 22, 0, 2 * Math.PI); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(px, py, 6, 0, 2 * Math.PI); ctx.fill();
    if (text) label(ctx, text, px, py - 18, 18, 'rgba(255,255,255,0.85)', 'center', 600);
  }
  const pend = {
    id: 'pendulum', duration: 20, poster: 3,
    draw(ctx, t) {
      bg(ctx, '#052e2b', '#0f766e');
      const scale = 380, py = 260;
      ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.fillRect(30, py - 4, 380, 6);
      if (t < 10.2) {
        ctx.globalAlpha = fade(t, -1, 10.2);
        const ts = Math.max(0, t - 1);
        drawPendulum(ctx, 110, py, 1, scale, swing(1, 10, ts), '#fbbf24', '10°');
        drawPendulum(ctx, 260, py, 1, scale, swing(1, 20, ts), '#f472b6', '20°');
        label(ctx, `swings: ${swings(1, 10, ts)}`, 110, 720, 24);
        label(ctx, `swings: ${swings(1, 20, ts)}`, 260, 720, 24);
      } else {
        ctx.globalAlpha = fade(t, 10.2, 30);
        const ts = Math.max(0, t - 11);
        drawPendulum(ctx, 110, py, 0.25, scale, swing(0.25, 15, ts), '#38bdf8', '¼ m');
        drawPendulum(ctx, 260, py, 1, scale, swing(1, 15, ts), '#a3e635', '1 m');
        label(ctx, `swings: ${swings(0.25, 15, ts)}`, 110, 720, 24);
        label(ctx, `swings: ${swings(1, 15, ts)}`, 260, 720, 24);
      }
      ctx.globalAlpha = 1;
      captions(ctx, t, [
        [0, 5, 'Two pendulums, same length. One swings twice as wide.'],
        [5, 10.2, 'They still keep (almost) the same time!'],
        [10.2, 14.5, 'What sets the timing is the length.'],
        [14.5, 20, '4× longer → each swing takes 2× as long.'],
      ]);
    },
  };

  // ---------------- 4. History of writing ----------------
  const EVENTS = [
    [-3200, 'c. 3200 BC', '🏺 Writing begins in Mesopotamia & Egypt'],
    [-1050, 'c. 1050 BC', '🔤 Phoenician alphabet'],
    [-800, 'c. 800 BC', '🏛️ Greeks add vowels'],
    [105, '105 AD', '📜 Paper-making in China'],
    [1440, 'c. 1440', '🖨️ Gutenberg’s printing press'],
    [1991, '1991', '🌐 The first website'],
  ];
  const fmtYear = (y) => (y < 0 ? `${Math.round(-y)} BC` : `${Math.round(y)} AD`);
  const writing = {
    id: 'history-of-writing', duration: 21, poster: 15,
    draw(ctx, t) {
      bg(ctx, '#431407', '#c2410c');
      const top = 250, bottom = 720, y0 = -3400, y1 = 2026;
      const yOf = (yr) => top + ((yr - y0) / (y1 - y0)) * (bottom - top);
      const lx = 110;
      ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(lx, top); ctx.lineTo(lx, bottom); ctx.stroke();
      const year = y0 + (y1 - y0) * ease((t - 2) / 14);
      const my = yOf(year);
      ctx.strokeStyle = '#fde68a'; ctx.beginPath(); ctx.moveTo(lx, top); ctx.lineTo(lx, my); ctx.stroke();
      // spread labels so they never overlap
      const ys = EVENTS.map((e) => yOf(e[0]));
      for (let i = 1; i < ys.length; i++) ys[i] = Math.max(ys[i], ys[i - 1] + 68);
      const shift = Math.max(0, ys[ys.length - 1] - bottom + 10);
      for (let i = 0; i < ys.length; i++) ys[i] = Math.max(ys[i] - shift, i ? ys[i - 1] + 68 : top);
      EVENTS.forEach(([yr, when, what], i) => {
        if (year < yr) return;
        const o = clamp(0.3 + (year - yr) / 40);
        ctx.globalAlpha = o;
        const dy = yOf(yr);
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(lx, dy, 9, 0, 2 * Math.PI); ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(lx + 9, dy); ctx.lineTo(lx + 30, ys[i] - 8); ctx.stroke();
        label(ctx, when, lx + 36, ys[i] - 14, 18, '#fde68a', 'left', 700);
        ctx.font = `700 22px ${FONT}`;
        const lines = wrap(ctx, what, 340);
        lines.forEach((l, j) => label(ctx, l, lx + 36, ys[i] + 12 + j * 26, 22, '#fff', 'left', 700));
        ctx.globalAlpha = 1;
      });
      if (t > 1.5 && t < 16.5) {
        ctx.fillStyle = '#fde68a'; ctx.beginPath(); ctx.arc(lx, my, 13, 0, 2 * Math.PI); ctx.fill();
        label(ctx, fmtYear(year), lx - 22, my + 7, 18, '#fde68a', 'right', 800);
      }
      captions(ctx, t, [
        [0, 4, '5,000 years of writing in 20 seconds'],
        [16.3, 21, 'Writing is about 5,200 years old. The web is about 35.'],
      ]);
    },
  };

  window.CLIPS = { W, H, list: [moon, pyth, pend, writing] };
})();
