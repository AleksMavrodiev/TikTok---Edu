// Feed ranking: no network, no tracking — just local preferences.

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle(list, rng = Math.random) {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Topic affinity from liked items: each like adds weight to its topic.
export function topicWeights(likedIds, allItems) {
  const byId = new Map(allItems.map((it) => [it.id, it]));
  const w = {};
  for (const id of likedIds) {
    const it = byId.get(id);
    if (it) w[it.topic] = (w[it.topic] || 0) + 1;
  }
  return w;
}

/**
 * Build one "round" of the feed.
 * - topic: filter to a single topic ('all' for everything; 'puzzles' for only puzzles)
 * - liked: ids the user liked (boosts their topics)
 * - seen: ids already completed/solved (pushed later, not hidden)
 * - puzzleEvery: insert a puzzle after every N lessons
 */
export function buildFeed({ lessons, puzzles, topic = 'all', liked = [], seen = [], rng = Math.random, puzzleEvery = 2 }) {
  const match = (it) => topic === 'all' || it.topic === topic;
  let ls = topic === 'puzzles' ? [] : lessons.filter(match);
  let ps = puzzles.filter((p) => topic === 'puzzles' || match(p));

  const weights = topicWeights(liked, [...lessons, ...puzzles]);
  const seenSet = new Set(seen);
  const score = (it) => rng() + (weights[it.topic] || 0) * 0.35 - (seenSet.has(it.id) ? 1.5 : 0);
  const rank = (arr) => arr.map((it) => [score(it), it]).sort((a, b) => b[0] - a[0]).map((x) => x[1]);

  ls = rank(ls);
  ps = rank(ps);

  if (!ls.length) return ps;
  if (!ps.length) return ls;

  const out = [];
  let pi = 0;
  ls.forEach((l, i) => {
    out.push(l);
    if ((i + 1) % puzzleEvery === 0 && pi < ps.length) out.push(ps[pi++]);
  });
  while (pi < ps.length) out.push(ps[pi++]);
  return out;
}
