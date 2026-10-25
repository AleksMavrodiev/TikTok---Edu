// Renders the app icons in icons/. Usage: node tools/render-icons.mjs
import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');

// maskable icons need the artwork inside the central 80% "safe zone"
const icons = [
  ['icon-192.png', 192, 0.62, 0.22],
  ['icon-512.png', 512, 0.62, 0.22],
  ['icon-maskable-512.png', 512, 0.5, 0],
  ['apple-touch-icon.png', 180, 0.6, 0],
];

const browser = await chromium.launch();
const page = await browser.newPage();
for (const [file, size, glyph, radius] of icons) {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(`<html><body style="margin:0;background:transparent">
    <div style="width:${size}px;height:${size}px;border-radius:${radius * size}px;display:grid;place-items:center;
      background:radial-gradient(circle at 30% 20%,#ff7aa2,transparent 60%),linear-gradient(135deg,#ff3d6e,#7c3aed);">
      <span style="font-size:${glyph * size}px;line-height:1;filter:drop-shadow(0 ${size / 40}px ${size / 25}px #0005)">🧠</span>
    </div></body></html>`);
  await page.screenshot({ path: path.join(root, 'icons', file), omitBackground: true });
  console.log('icon', file);
}
await browser.close();
