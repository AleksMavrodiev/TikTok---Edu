// Daily challenge: everyone gets the same puzzles on the same day, picked
// from the date with a seeded RNG (no server needed).
import { mulberry32, shuffle } from './feed.js';

export const DAILY_BONUS = 50;
export const DAILY_COUNT = 3;

export function hashString(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

// Pick `count` puzzles of different types for the given day ("YYYY-MM-DD").
export function dailyPicks(day, puzzles, count = DAILY_COUNT) {
  const picks = [];
  const types = new Set();
  for (const p of shuffle(puzzles, mulberry32(hashString(`curio:${day}`)))) {
    if (types.has(p.type)) continue;
    types.add(p.type);
    picks.push(p);
    if (picks.length === count) break;
  }
  return picks;
}

// Normalise stored progress to today; stale days start fresh.
export function dailyState(daily, day) {
  return daily && daily.day === day ? daily : { day, done: [], claimed: false };
}

export function msUntilMidnight(now = new Date()) {
  const next = new Date(now);
  next.setHours(24, 0, 0, 0);
  return next - now;
}
