import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseYouTube } from '../js/text.js';
import { LESSONS, PUZZLES, VIDEOS, OPEN_VIDEOS, YOUTUBE, TOPICS } from '../js/content.js';

test('parseYouTube handles common link shapes', () => {
  const id = 'aircAruvnKk';
  for (const url of [
    `https://www.youtube.com/watch?v=${id}`,
    `https://youtube.com/watch?feature=share&v=${id}&t=30s`,
    `https://m.youtube.com/watch?v=${id}`,
    `https://youtu.be/${id}?si=abc`,
    `https://www.youtube.com/embed/${id}`,
    `https://www.youtube-nocookie.com/embed/${id}?rel=0`,
    `https://www.youtube.com/live/${id}`,
  ]) assert.deepEqual(parseYouTube(url), { id, short: false }, url);
  assert.deepEqual(parseYouTube('https://youtube.com/shorts/I2gAtqBjhE0'), { id: 'I2gAtqBjhE0', short: true });
  for (const bad of ['https://www.youtube.com/@kurzgesagt', 'https://vimeo.com/123', 'https://example.com/watch?v=aircAruvnKk', 'nope', 'https://youtu.be/short']) {
    assert.equal(parseYouTube(bad), null, bad);
  }
});

test('all feed items have unique ids and valid topics', () => {
  const topics = new Set(TOPICS.map((t) => t.id));
  const ids = new Set();
  for (const it of [...LESSONS, ...PUZZLES, ...VIDEOS, ...OPEN_VIDEOS, ...YOUTUBE]) {
    assert.ok(!ids.has(it.id), `duplicate id ${it.id}`);
    ids.add(it.id);
    assert.ok(topics.has(it.topic), `bad topic on ${it.id}`);
    assert.ok(it.title && (it.type || it.creator), `missing title/creator on ${it.id}`);
  }
});

test('YouTube entries are well-formed and credited', () => {
  for (const v of YOUTUBE) {
    assert.match(v.youtube, /^[A-Za-z0-9_-]{11}$/, v.id);
    assert.ok(v.source && v.more, v.id);
  }
  assert.equal(new Set(YOUTUBE.map((v) => v.youtube)).size, YOUTUBE.length, 'duplicate YouTube video');
});

test('open-licensed videos carry a license and a source link', () => {
  for (const v of OPEN_VIDEOS) {
    assert.match(v.video, /^https:\/\/commons\.wikimedia\.org\/wiki\/Special:FilePath\//, v.id);
    assert.match(v.link, /^https:\/\/commons\.wikimedia\.org\/wiki\/File:/, v.id);
    assert.ok(v.license, v.id);
  }
});
