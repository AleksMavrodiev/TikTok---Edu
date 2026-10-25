import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { VIDEOS } from '../js/content.js';

const root = new URL('../', import.meta.url);
const read = (p) => readFileSync(new URL(p, root), 'utf8');
const assets = [...read('sw.js').matchAll(/^\s+'([^']+)',$/gm)].map((m) => m[1]);

test('service worker precaches every app file (so the app works offline)', () => {
  const expected = ['index.html', 'manifest.webmanifest', 'css/styles.css',
    ...['js', 'icons', 'media/clips'].flatMap((d) => readdirSync(new URL(d, root)).map((f) => `${d}/${f}`))];
  for (const f of expected) assert.ok(assets.includes(f), `sw.js ASSETS is missing ${f}`);
  for (const f of assets) if (f !== './') assert.ok(existsSync(new URL(f, root)), `sw.js lists missing file ${f}`);
});

test('manifest is installable', () => {
  const m = JSON.parse(read('manifest.webmanifest'));
  assert.ok(m.name && m.short_name && m.start_url && m.display === 'standalone');
  const sizes = m.icons.map((i) => i.sizes);
  assert.ok(sizes.includes('192x192') && sizes.includes('512x512'));
  for (const i of m.icons) assert.ok(existsSync(new URL(i.src, root)), i.src);
});

test('bundled videos and posters exist', () => {
  for (const v of VIDEOS.filter((x) => !/^https?:/.test(x.video))) {
    assert.ok(existsSync(new URL(v.video, root)), v.video);
    assert.ok(existsSync(new URL(v.poster, root)), v.poster);
  }
});
