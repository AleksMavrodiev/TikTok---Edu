// Turns the "Create" textarea into slides: one per line, optional leading emoji.
const EMOJI_START = /^(\p{Extended_Pictographic}(?:️|‍|\p{Extended_Pictographic}|[\u{1F3FB}-\u{1F3FF}])*)\s*(.*)$/u;

export function parseSlides(text, fallbackEmoji, max = 12) {
  return text.split('\n').map((l) => l.trim()).filter(Boolean).slice(0, max).map((line) => {
    const m = line.match(EMOJI_START);
    return m && m[2] ? [m[1], m[2]] : [fallbackEmoji, line];
  });
}

// Extracts a YouTube video ID from watch, youtu.be, shorts, embed or live links.
export function parseYouTube(input) {
  let url;
  try { url = new URL(input.trim()); } catch { return null; }
  const host = url.hostname.replace(/^(www|m|music)\./, '');
  let id = null;
  let short = false;
  if (host === 'youtu.be') id = url.pathname.split('/')[1];
  else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    if (url.pathname === '/watch') id = url.searchParams.get('v');
    const m = url.pathname.match(/^\/(shorts|embed|live)\/([^/]+)/);
    if (m) { id = m[2]; short = m[1] === 'shorts'; }
  }
  return /^[A-Za-z0-9_-]{11}$/.test(id || '') ? { id, short } : null;
}
