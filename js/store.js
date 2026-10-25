// Local persistence. Storage can be unavailable (private mode), so every
// access is guarded and the app keeps working in memory.
const KEY = 'curio:v1';

const DEFAULTS = {
  xp: 0, liked: [], saved: [], completed: [], solved: [],
  streak: null, narration: false, custom: [],
};

export function load() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : { ...DEFAULTS };
  } catch {
    return { ...DEFAULTS };
  }
}

export function save(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch { /* ignore */ }
}
