import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dailyPicks, dailyState, msUntilMidnight, hashString } from '../js/daily.js';
import { PUZZLES } from '../js/content.js';

test('daily picks are deterministic per day and use different puzzle types', () => {
  const a = dailyPicks('2026-10-25', PUZZLES).map((p) => p.id);
  const b = dailyPicks('2026-10-25', PUZZLES).map((p) => p.id);
  assert.deepEqual(a, b);
  assert.equal(a.length, 3);
  const types = dailyPicks('2026-10-25', PUZZLES).map((p) => p.type);
  assert.equal(new Set(types).size, 3);
});

test('daily picks vary across days', () => {
  const sets = new Set();
  for (let d = 1; d <= 28; d++) sets.add(dailyPicks(`2026-02-${String(d).padStart(2, '0')}`, PUZZLES).map((p) => p.id).join());
  assert.ok(sets.size > 20, `only ${sets.size} distinct sets`);
});

test('daily state resets on a new day', () => {
  const s = { day: '2026-10-24', done: ['x'], claimed: true };
  assert.equal(dailyState(s, '2026-10-24'), s);
  assert.deepEqual(dailyState(s, '2026-10-25'), { day: '2026-10-25', done: [], claimed: false });
  assert.deepEqual(dailyState(null, '2026-10-25'), { day: '2026-10-25', done: [], claimed: false });
});

test('helpers', () => {
  assert.equal(hashString('abc'), hashString('abc'));
  assert.notEqual(hashString('abc'), hashString('abd'));
  const ms = msUntilMidnight(new Date(2026, 9, 25, 23, 0, 0));
  assert.equal(ms, 3600000);
});
