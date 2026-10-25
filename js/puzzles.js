// Pure puzzle logic (no DOM) so it can be unit-tested.
import { shuffle } from './feed.js';

export function scrambleWord(word, rng = Math.random) {
  const letters = word.split('');
  if (new Set(letters).size < 2) return letters;
  let s;
  do s = shuffle(letters, rng); while (s.join('') === word);
  return s;
}

// Timeline: true if the picked indices are in ascending year order and complete.
export function isChronological(events, pickedIdx) {
  if (pickedIdx.length !== events.length) return false;
  for (let i = 1; i < pickedIdx.length; i++) {
    if (events[pickedIdx[i - 1]][2] > events[pickedIdx[i]][2]) return false;
  }
  return true;
}

// Index of the first wrong pick in a partial timeline answer, or -1.
export function firstTimelineError(events, pickedIdx) {
  const sorted = events.map((e, i) => [e[2], i]).sort((a, b) => a[0] - b[0]).map((x) => x[1]);
  for (let i = 0; i < pickedIdx.length; i++) {
    if (events[pickedIdx[i]][2] !== events[sorted[i]][2]) return i;
  }
  return -1;
}

// ---- Sliding puzzle (3x3, 0 = blank) ----
export const SOLVED = [1, 2, 3, 4, 5, 6, 7, 8, 0];

export function isSolved(tiles) {
  return tiles.every((t, i) => t === SOLVED[i]);
}

export function inversions(tiles) {
  const t = tiles.filter((x) => x !== 0);
  let n = 0;
  for (let i = 0; i < t.length; i++) for (let j = i + 1; j < t.length; j++) if (t[i] > t[j]) n++;
  return n;
}

// For an odd-width grid, a state is solvable iff its inversion count is even.
export function isSolvable(tiles) {
  return inversions(tiles) % 2 === 0;
}

export function canMove(tiles, idx, size = 3) {
  const blank = tiles.indexOf(0);
  const [r1, c1] = [Math.floor(idx / size), idx % size];
  const [r2, c2] = [Math.floor(blank / size), blank % size];
  return Math.abs(r1 - r2) + Math.abs(c1 - c2) === 1;
}

export function moveTile(tiles, idx, size = 3) {
  if (!canMove(tiles, idx, size)) return null;
  const next = tiles.slice();
  const blank = next.indexOf(0);
  [next[idx], next[blank]] = [next[blank], next[idx]];
  return next;
}

export function newSlider(rng = Math.random) {
  let t;
  do t = shuffle(SOLVED, rng); while (!isSolvable(t) || isSolved(t));
  return t;
}

// ---- Memory match ----
export function memoryDeck(pairs, rng = Math.random) {
  const cards = [];
  pairs.forEach(([a, b], pair) => {
    cards.push({ pair, label: a });
    cards.push({ pair, label: b });
  });
  return shuffle(cards, rng);
}

// ---- Progress ----
export const XP = { lesson: 10, puzzle: 20 };

export function levelFor(xp) {
  const level = Math.floor(xp / 100) + 1;
  return { level, into: xp % 100, need: 100 };
}

// Streak update given the last active day ("YYYY-MM-DD") and today.
export function nextStreak(streak, today) {
  if (!streak || !streak.last) return { count: 1, last: today };
  if (streak.last === today) return streak;
  const diff = Math.round((Date.parse(today) - Date.parse(streak.last)) / 86400000);
  return { count: diff === 1 ? streak.count + 1 : 1, last: today };
}

// Streak to display: still alive if the user was active today or yesterday.
export function currentStreak(streak, today) {
  if (!streak || !streak.last) return 0;
  const diff = Math.round((Date.parse(today) - Date.parse(streak.last)) / 86400000);
  return diff <= 1 ? streak.count : 0;
}
