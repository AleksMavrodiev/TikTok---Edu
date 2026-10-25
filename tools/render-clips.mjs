// Renders tools/clips.js into MP4 videos + JPEG posters in media/clips/.
// Usage: node tools/render-clips.mjs [clip-id ...]   (needs playwright + ffmpeg)
import { readFileSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';
import os from 'node:os';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const outDir = path.join(root, 'media/clips');
const FPS = 30, OUT_W = 720, OUT_H = 1280;

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent(`<canvas id="c" width="${OUT_W}" height="${OUT_H}"></canvas>`);
await page.addScriptTag({ content: readFileSync(path.join(root, 'tools/clips.js'), 'utf8') });
const ids = await page.evaluate(() => window.CLIPS.list.map((c) => [c.id, c.duration, c.poster]));
const wanted = process.argv.slice(2);
mkdirSync(outDir, { recursive: true });

for (const [id, duration, poster] of ids) {
  if (wanted.length && !wanted.includes(id)) continue;
  const tmp = path.join(os.tmpdir(), `clip-${id}`);
  rmSync(tmp, { recursive: true, force: true });
  mkdirSync(tmp, { recursive: true });
  const frames = Math.round(duration * FPS);
  const grab = (t) => page.evaluate(([id, t]) => {
    const { W, list } = window.CLIPS;
    const c = document.getElementById('c'), ctx = c.getContext('2d');
    ctx.setTransform(c.width / W, 0, 0, c.width / W, 0, 0);
    list.find((x) => x.id === id).draw(ctx, t);
    return c.toDataURL('image/jpeg', 0.92).split(',')[1];
  }, [id, t]);
  for (let f = 0; f < frames; f++) {
    writeFileSync(path.join(tmp, `${String(f).padStart(5, '0')}.jpg`), Buffer.from(await grab(f / FPS), 'base64'));
  }
  writeFileSync(path.join(outDir, `${id}.jpg`), Buffer.from(await grab(poster), 'base64'));
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', path.join(tmp, '%05d.jpg'),
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '27', '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
    path.join(outDir, `${id}.mp4`)]);
  rmSync(tmp, { recursive: true, force: true });
  console.log(`rendered ${id} (${frames} frames)`);
}
await browser.close();
