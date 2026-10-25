// End-to-end smoke test in headless Chromium: feed, videos, daily challenge,
// video upload, and offline mode. Usage: node tools/smoke.mjs [screenshot-dir]
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';
import assert from 'node:assert/strict';
import { PUZZLES } from '../js/content.js';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const shots = process.argv[2];
const port = 5300 + Math.floor(Math.random() * 500);
const base = `http://localhost:${port}/`;

const server = spawn(process.execPath, [path.join(root, 'tools/serve.mjs'), String(port)], { stdio: 'pipe' });
await new Promise((r) => server.stdout.once('data', r));

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const page = await context.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
const snap = async (name) => { if (shots) await page.screenshot({ path: path.join(shots, `${name}.png`) }); };
const step = (msg) => console.log(`✓ ${msg}`);

// Shortest solution of the 8-puzzle (BFS over at most 181,440 states).
function solveSlider(start) {
  const key = (t) => t.join('');
  const goal = '123456780';
  const prev = new Map([[key(start), null]]);
  const queue = [start];
  for (let qi = 0; qi < queue.length; qi++) {
    const t = queue[qi];
    if (key(t) === goal) break;
    const b = t.indexOf(0);
    for (const d of [-3, 3, -1, 1]) {
      const i = b + d;
      if (i < 0 || i > 8 || (Math.abs(d) === 1 && Math.floor(i / 3) !== Math.floor(b / 3))) continue;
      const n = t.slice(); [n[b], n[i]] = [n[i], n[b]];
      if (!prev.has(key(n))) { prev.set(key(n), [key(t), i]); queue.push(n); }
    }
  }
  const clicks = [];
  for (let k = goal; prev.get(k); k = prev.get(k)[0]) clicks.unshift(prev.get(k)[1]);
  return clicks;
}

async function solve(p) {
  const c = page.locator(`.card[data-id="${p.id}"]`).first();
  await c.scrollIntoViewIfNeeded();
  if (p.type === 'quiz') await c.locator('.opt').nth(p.answer).click();
  if (p.type === 'sequence') await c.locator('.opt', { hasText: new RegExp(`^${p.answer}$`) }).click();
  if (p.type === 'timeline') {
    for (const [name] of [...p.events].sort((a, b) => a[2] - b[2])) await c.locator('.opt', { hasText: name }).click();
  }
  if (p.type === 'scramble') {
    for (const ch of p.word) await c.locator('.tiles:not(.answer) .tile', { hasText: new RegExp(`^${ch}$`) }).first().click();
  }
  if (p.type === 'memory') {
    // Flip pairs of cards to learn every label, then click matching pairs.
    const btns = c.locator('.mem button');
    const labels = [];
    for (let i = 0; i < p.pairs.length * 2; i += 2) {
      await btns.nth(i).click();
      await btns.nth(i + 1).click();
      labels[i] = await btns.nth(i).textContent();
      labels[i + 1] = await btns.nth(i + 1).textContent();
      await page.waitForTimeout(950);
    }
    for (const [a, b] of p.pairs) {
      const ia = labels.indexOf(a), ib = labels.indexOf(b);
      if (await btns.nth(ia).evaluate((el) => el.classList.contains('done'))) continue;
      await btns.nth(ia).click();
      await btns.nth(ib).click();
    }
  }
  if (p.type === 'slider') {
    const tiles = await c.locator('.slider button').evaluateAll((bs) => bs.map((b) => Number(b.textContent || 0)));
    for (const i of solveSlider(tiles)) await c.locator('.slider button').nth(i).click();
  }
  await c.locator('.solved-badge').waitFor({ timeout: 3000 });
}

try {
  // 1. Feed loads with the daily invite and lessons.
  await page.goto(base);
  await page.waitForSelector('.card');
  const ids = await page.$$eval('.card', (cs) => cs.slice(0, 4).map((c) => c.dataset.id));
  assert.equal(ids[2], 'daily-invite');
  await page.waitForTimeout(800);
  await snap('01-feed');
  step('feed renders with daily challenge invite');

  // 2. Bundled video plays.
  await page.goto(`${base}#v-moon-phases`);
  await page.reload();
  const vid = page.locator('.card[data-id="v-moon-phases"] video').first();
  await page.waitForFunction(() => document.querySelector('.card[data-id="v-moon-phases"] video')?.currentTime > 1, null, { timeout: 8000 });
  assert.ok(await vid.evaluate((v) => !v.paused));
  await snap('02-video');
  step('bundled video autoplays');

  // 3. Daily challenge: solve all picks, get the bonus.
  await page.goto(`${base}?topic=daily`);
  await page.waitForSelector('.daily-card');
  const picks = await page.$$eval('.card.puzzle', (cs) => cs.map((c) => c.dataset.id));
  assert.equal(picks.length, 3);
  const xpBefore = await page.evaluate(() => JSON.parse(localStorage.getItem('curio:v1') || '{"xp":0}').xp);
  for (const id of picks) {
    await solve(PUZZLES.find((x) => x.id === id));
  }
  await page.waitForTimeout(300);
  const st = await page.evaluate(() => JSON.parse(localStorage.getItem('curio:v1')));
  assert.equal(st.daily.claimed, true);
  assert.ok(st.xp >= xpBefore + 50, `xp ${xpBefore} -> ${st.xp}`);
  await page.locator('.daily-card').first().scrollIntoViewIfNeeded();
  await snap('03-daily-done');
  step(`daily challenge solved (${picks.join(', ')}) and bonus awarded`);

  // 3b. Every puzzle type is solvable through the UI.
  for (const type of new Set(PUZZLES.map((x) => x.type))) {
    const p = PUZZLES.find((x) => x.type === type);
    await page.goto(`${base}#${p.id}`);
    await page.reload();
    await page.waitForSelector(`.card[data-id="${p.id}"]`);
    await solve(p);
  }
  step('one puzzle of every type solved through the UI');

  // 4. Upload a video in Create; it plays and survives a reload (IndexedDB).
  await page.goto(base);
  await page.click('[data-go="create"]');
  await page.click('label:has(input[name=format][value=video])');
  await page.fill('[name=title]', 'My pendulum clip');
  await page.setInputFiles('input[name=file]', path.join(root, 'media/clips/pendulum.mp4'));
  await snap('04-create-video');
  await page.click('#createForm button[type=submit]');
  await page.waitForFunction(() => {
    const v = document.querySelector('.card.video video');
    return v && v.src.startsWith('blob:') && v.currentTime > 0.5;
  }, null, { timeout: 8000 });
  const myId = await page.$eval('.card.video', (c) => c.dataset.id);
  await page.goto(`${base}#${myId}`);
  await page.reload();
  await page.waitForFunction((id) => document.querySelector(`.card[data-id="${id}"] video`)?.currentTime > 0.5, myId, { timeout: 8000 });
  step('uploaded video plays and persists after reload');

  // 4b. YouTube + Wikimedia Commons cards. The hosts are stubbed so this runs
  // without internet: the stub "player" answers the postMessage protocol the
  // same way YouTube's embed does (and reports the video as ended).
  const poster = path.join(root, 'media/clips/moon-phases.jpg');
  const ytStub = `<!doctype html><body style="margin:0;background:#200;color:#fff;font:16px sans-serif">stub player
    <script>addEventListener('message', (e) => {
      const m = JSON.parse(e.data);
      if (m.event === 'listening') parent.postMessage(JSON.stringify({ event: 'infoDelivery', info: { playerState: 0 } }), '*');
      if (m.event === 'command') document.body.dataset.last = m.func;
    });</script>`;
  await context.route(/i\.ytimg\.com/, (r) => r.fulfill({ path: poster }));
  await context.route(/youtube-nocookie\.com\/embed\//, (r) => r.fulfill({ contentType: 'text/html', body: ytStub }));
  await context.route(/commons\.wikimedia\.org\/wiki\/Special:FilePath\//, (r) => (r.request().url().includes('width=')
    ? r.fulfill({ path: poster })
    : r.fulfill({ path: path.join(root, 'media/clips/pendulum.mp4'), contentType: 'video/mp4' })));
  await page.goto(`${base}#yt-inca`);
  await page.reload();
  const frame = page.locator('.card[data-id="yt-inca"] iframe').first();
  await frame.waitFor({ timeout: 5000 });
  const src = await frame.getAttribute('src');
  assert.ok(src.startsWith('https://www.youtube-nocookie.com/embed/UO5ktwPXsyM?') && src.includes('enablejsapi=1'), src);
  await page.waitForFunction(() => JSON.parse(localStorage.getItem('curio:v1')).completed.includes('yt-inca'), null, { timeout: 5000 });
  await snap('07-youtube');
  step('YouTube card embeds the privacy-enhanced player and awards XP when the video ends');
  await page.goto(`${base}#c-apollo11-site`);
  await page.reload();
  await page.waitForFunction(() => {
    const v = document.querySelector('.card[data-id="c-apollo11-site"] video');
    return v && v.currentSrc.includes('Special:FilePath') && v.currentTime > 0.5;
  }, null, { timeout: 8000 });
  await snap('08-commons');
  step('Wikimedia Commons video streams and plays');
  await page.click('.chip:has-text("Videos")');
  await page.waitForTimeout(300);
  const kinds = await page.$$eval('.card', (cs) => cs.map((c) => c.className));
  assert.ok(kinds.length > 10 && kinds.every((k) => /\b(video|yt)\b/.test(k)), kinds.join());
  step(`Videos feed shows only videos (${kinds.length} cards)`);
  await context.unrouteAll();

  // 5. Offline: service worker serves the app and bundled videos.
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await page.waitForFunction(() => navigator.serviceWorker.controller);
  await context.setOffline(true);
  await page.goto(`${base}#v-pendulum`);
  await page.reload();
  await page.waitForSelector('.card');
  await page.waitForFunction(() => document.querySelector('.card[data-id="v-pendulum"] video')?.currentTime > 1, null, { timeout: 8000 });
  await snap('05-offline-video');
  await context.setOffline(false);
  step('works offline (app shell + video range requests from cache)');

  // 6. Install metadata.
  const manifest = await page.evaluate(() => fetch('manifest.webmanifest').then((r) => r.json()));
  assert.equal(manifest.display, 'standalone');
  await page.click('[data-go="profile"]');
  await snap('06-profile');
  step('manifest served; profile renders');

  const relevant = errors.filter((e) => !/ERR_INTERNET_DISCONNECTED|Failed to load resource/.test(e));
  assert.deepEqual(relevant, [], 'console errors');
  step('no console errors');
} finally {
  await browser.close();
  server.kill();
}
