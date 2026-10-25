import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildFeed, mulberry32 } from '../js/feed.js';
import * as P from '../js/puzzles.js';
import { parseSlides } from '../js/text.js';
import { LESSONS, PUZZLES, TOPICS } from '../js/content.js';

test('feed interleaves a puzzle after every 2 lessons and includes everything', () => {
  const feed = buildFeed({ lessons: LESSONS, puzzles: PUZZLES, rng: mulberry32(1) });
  assert.equal(feed.length, LESSONS.length + PUZZLES.length);
  assert.ok(feed[0].slides && feed[1].slides && !feed[2].slides);
});

test('feed topic filters', () => {
  const hist = buildFeed({ lessons: LESSONS, puzzles: PUZZLES, topic: 'history', rng: mulberry32(2) });
  assert.ok(hist.length > 0 && hist.every((it) => it.topic === 'history'));
  const pz = buildFeed({ lessons: LESSONS, puzzles: PUZZLES, topic: 'puzzles', rng: mulberry32(3) });
  assert.equal(pz.length, PUZZLES.length);
  assert.ok(pz.every((it) => it.type));
});

test('liked topics rank higher; seen items sink', () => {
  const liked = LESSONS.filter((l) => l.topic === 'math').map((l) => l.id);
  let mathFirst = 0;
  for (let s = 0; s < 50; s++) {
    const f = buildFeed({ lessons: LESSONS, puzzles: [], liked, rng: mulberry32(s) });
    if (f[0].topic === 'math') mathFirst++;
  }
  assert.ok(mathFirst > 25, `math first ${mathFirst}/50`);
  const seen = LESSONS.slice(0, 5).map((l) => l.id);
  const f = buildFeed({ lessons: LESSONS, puzzles: [], seen, rng: mulberry32(9) });
  assert.ok(f.slice(0, 5).every((it) => !seen.includes(it.id)));
});

test('scrambleWord changes order but keeps letters', () => {
  for (let s = 0; s < 20; s++) {
    const out = P.scrambleWord('GRAVITY', mulberry32(s));
    assert.notEqual(out.join(''), 'GRAVITY');
    assert.equal([...out].sort().join(''), [...'GRAVITY'].sort().join(''));
  }
});

test('timeline checks', () => {
  const ev = PUZZLES.find((p) => p.type === 'timeline').events;
  const sorted = ev.map((e, i) => [e[2], i]).sort((a, b) => a[0] - b[0]).map((x) => x[1]);
  assert.ok(P.isChronological(ev, sorted));
  assert.ok(!P.isChronological(ev, [...sorted].reverse()));
  assert.equal(P.firstTimelineError(ev, sorted.slice(0, 2)), -1);
  assert.equal(P.firstTimelineError(ev, [sorted[1]]), 0);
});

test('slider: shuffles are solvable and moves work', () => {
  for (let s = 0; s < 30; s++) {
    const t = P.newSlider(mulberry32(s));
    assert.ok(P.isSolvable(t) && !P.isSolved(t));
  }
  const nearly = [1, 2, 3, 4, 5, 6, 7, 0, 8];
  assert.equal(P.moveTile(nearly, 0), null);
  assert.ok(P.isSolved(P.moveTile(nearly, 8)));
  assert.ok(!P.isSolvable([2, 1, 3, 4, 5, 6, 7, 8, 0]));
});

test('memory deck has two cards per pair', () => {
  const deck = P.memoryDeck([['a', 'A'], ['b', 'B']], mulberry32(4));
  assert.equal(deck.length, 4);
  assert.deepEqual(deck.map((c) => c.pair).sort(), [0, 0, 1, 1]);
});

test('levels and streaks', () => {
  assert.deepEqual(P.levelFor(250), { level: 3, into: 50, need: 100 });
  assert.deepEqual(P.nextStreak(null, '2026-01-01'), { count: 1, last: '2026-01-01' });
  assert.deepEqual(P.nextStreak({ count: 3, last: '2026-01-01' }, '2026-01-02'), { count: 4, last: '2026-01-02' });
  assert.deepEqual(P.nextStreak({ count: 3, last: '2026-01-01' }, '2026-01-05'), { count: 1, last: '2026-01-05' });
  assert.equal(P.currentStreak({ count: 3, last: '2026-01-01' }, '2026-01-02'), 3);
  assert.equal(P.currentStreak({ count: 3, last: '2026-01-01' }, '2026-01-03'), 0);
});

test('parseSlides splits emoji from text', () => {
  assert.deepEqual(parseSlides('☀️ Sunlight\n\nplain line\n👩‍💻 Coder', '🔬'), [
    ['☀️', 'Sunlight'], ['🔬', 'plain line'], ['👩‍💻', 'Coder'],
  ]);
});

test('content is well-formed', () => {
  const ids = new Set();
  const topics = new Set(TOPICS.map((t) => t.id));
  for (const it of [...LESSONS, ...PUZZLES]) {
    assert.ok(!ids.has(it.id), `duplicate id ${it.id}`);
    ids.add(it.id);
    assert.ok(topics.has(it.topic), `bad topic on ${it.id}`);
  }
  for (const p of PUZZLES) {
    if (p.type === 'quiz') assert.ok(p.options[p.answer] != null, p.id);
    if (p.type === 'sequence') assert.ok(p.options.includes(p.answer), p.id);
  }
});
